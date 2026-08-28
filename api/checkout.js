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

var MONTANT_MAXIMUM = 5000;

module.exports = async function (req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ erreur: 'Méthode non autorisée.' });
    return;
  }

  var cle = process.env.SUMUP_API_KEY;
  var marchand = process.env.SUMUP_MERCHANT_CODE;
  if (!cle || !marchand) {
    res.status(500).json({ erreur: 'Le paiement en ligne n’est pas encore configuré.' });
    return;
  }

  var corps = req.body || {};
  var montant = Math.round(Number(corps.montant) * 100) / 100;
  var description = String(corps.description || 'Commande Couture & Fil').slice(0, 90);

  if (!(montant > 0) || montant > MONTANT_MAXIMUM) {
    res.status(400).json({ erreur: 'Montant invalide.' });
    return;
  }

  var origine = req.headers['x-forwarded-proto'] + '://' + req.headers.host;
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

    res.status(200).json({ url: donnees.hosted_checkout_url });
  } catch (erreur) {
    console.error('Erreur en contactant SumUp :', erreur.message);
    res.status(502).json({ erreur: 'Impossible de contacter SumUp pour le moment.' });
  }
};
