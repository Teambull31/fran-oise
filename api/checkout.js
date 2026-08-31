/* =========================================================
   Couture & Fil — création d'un paiement SumUp

   Seule partie du site qui n'est pas statique : une fonction Vercel,
   parce qu'un vrai paiement a besoin d'une clé secrète SumUp qui ne
   doit jamais être visible dans le navigateur.

   Le visiteur clique « Payer par carte », le site appelle cette
   fonction avec le total du panier, elle crée le paiement chez SumUp
   et renvoie l'adresse de leur page de paiement sécurisée — le site
   n'affiche ni ne touche jamais au numéro de carte.

   Réglage nécessaire (dans Vercel, Project Settings → Environment
   Variables, jamais dans ce fichier ni dans le dépôt) :
     - SUMUP_API_KEY       clé créée sur me.sumup.com → Pour les
                            développeurs → Clés API
     - SUMUP_MERCHANT_CODE identifiant marchand (visible via la même
                            page, ou par l'appel GET /v0.1/me)
   ========================================================= */

var catalogue = require('./_catalogue.js');
var baseDeDonnees = require('./_base-donnees.js');

var MONTANT_MAXIMUM = 5000;

/**
 * Un navigateur joint toujours l'en-tête Origin à un appel comme celui-ci ;
 * un site tiers qui tenterait de créer des paiements en douce depuis une
 * copie de la page est ainsi bloqué. Un appel direct (curl, serveur à
 * serveur) n'envoie souvent pas cet en-tête : ce n'est donc pas un vrai
 * contrôle d'accès, seulement une gêne de plus pour l'abus le plus courant.
 */
function origineAutorisee(origine) {
  if (!origine) return true;
  if (origine === 'https://teambull31.github.io') return true;
  if (origine === 'https://couture-fil.fr' || origine === 'https://www.couture-fil.fr') return true;
  try {
    var hote = new URL(origine).hostname;
    return hote.endsWith('.vercel.app') && hote.indexOf('fran-oise') === 0;
  } catch (erreur) {
    return false;
  }
}

module.exports = async function (req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ erreur: 'Méthode non autorisée.' });
    return;
  }

  if (!origineAutorisee(req.headers.origin)) {
    res.status(403).json({ erreur: 'Origine non autorisée.' });
    return;
  }

  var cle = process.env.SUMUP_API_KEY;
  var marchand = process.env.SUMUP_MERCHANT_CODE;
  if (!cle || !marchand) {
    res.status(500).json({ erreur: 'Le paiement en ligne n’est pas encore configuré.' });
    return;
  }

  var corps = req.body || {};
  var lignes = Array.isArray(corps.lignes) ? corps.lignes : [];
  var description = String(corps.description || 'Commande Couture & Fil').slice(0, 90);
  var origine = req.headers['x-forwarded-proto'] + '://' + req.headers.host;
  var client = corps.client || {};

  if (!lignes.length) {
    res.status(400).json({ erreur: 'Panier vide.' });
    return;
  }

  // Le montant vient toujours d'ici, jamais du navigateur : sans ça, un
  // visiteur pourrait modifier le total avant l'envoi et payer moins
  // cher que le vrai prix des articles.
  var detail;
  try {
    var reponseContenu = await fetch(origine + '/contenu.txt', { cache: 'no-store' });
    var texteContenu = await reponseContenu.text();
    detail = catalogue.detailLignes(texteContenu, lignes);
  } catch (erreur) {
    console.error('Impossible de relire le catalogue :', erreur.message);
    res.status(502).json({ erreur: 'Le paiement n’est pas disponible pour le moment.' });
    return;
  }

  var montant = detail
    ? Math.round(
        detail.reduce(function (somme, ligne) {
          return somme + ligne.prix * ligne.qty;
        }, 0) * 100
      ) / 100
    : null;

  if (montant === null || !(montant > 0) || montant > MONTANT_MAXIMUM) {
    res.status(400).json({ erreur: 'Panier invalide.' });
    return;
  }

  var reference = 'cf-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);

  try {
    var reponse = await fetch('https://api.sumup.com/v0.1/checkouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + cle
      },
      body: JSON.stringify({
        checkout_reference: reference,
        amount: montant,
        currency: 'EUR',
        merchant_code: marchand,
        description: description,
        hosted_checkout: { enabled: true },
        redirect_url: origine + '/merci.html'
      })
    });

    var donnees = await reponse.json();

    if (!reponse.ok || !donnees.hosted_checkout_url) {
      // Jamais la clé ni le corps complet de la réponse SumUp dans les
      // journaux : seulement de quoi comprendre le souci ensuite.
      console.error('SumUp a refusé la création du paiement :', reponse.status);
      res.status(502).json({ erreur: 'SumUp n’a pas pu préparer le paiement.' });
      return;
    }

    // Avant de répondre : une fois la réponse envoyée, la fonction peut
    // s'arrêter avant la fin d'un travail encore en cours. Un échec ici
    // ne doit jamais empêcher de renvoyer l'adresse de paiement — la
    // base de données n'est peut-être pas encore reliée (voir README).
    try {
      await baseDeDonnees.enregistrerCommande({
        reference: reference,
        nom: String(client.nom || '').trim().slice(0, 200),
        email: String(client.email || '').trim().slice(0, 200),
        telephone: String(client.telephone || '').trim().slice(0, 60),
        adresse: String(client.adresse || '').trim().slice(0, 500),
        lignes: detail,
        total: montant
      });
    } catch (erreur) {
      console.error('Commande non enregistrée en base :', erreur.message);
    }

    res.status(200).json({ url: donnees.hosted_checkout_url });
  } catch (erreur) {
    console.error('Erreur en contactant SumUp :', erreur.message);
    res.status(502).json({ erreur: 'Impossible de contacter SumUp pour le moment.' });
  }
};
