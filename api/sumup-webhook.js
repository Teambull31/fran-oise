/* =========================================================
   Couture & Fil — SumUp signale qu'un paiement a changé d'état

   SumUp appelle cette adresse quand un paiement avance (elle lui
   est donnée à la création, voir api/checkout.js → return_url).
   Le message reçu est minuscule : { event_type, id }.

   Il n'est pas signé, et n'importe qui peut l'imiter : on ne le
   croit donc sur rien. Le seul renseignement qu'on en tire est
   l'identifiant du paiement, qu'on va vérifier directement chez
   SumUp avec la clé secrète. C'est leur réponse à eux — pas le
   message reçu — qui dit si la commande est payée. Sans ça, il
   suffirait d'appeler cette adresse pour faire passer une
   commande pour réglée et déclencher les e-mails.

   Répond toujours 2xx dès que le message est compris : SumUp
   réessaie (1 min, 5 min, 20 min, 2 h) sur toute autre réponse.
   ========================================================= */

var BaseDeDonnees = require('./_base-donnees.js');
var Email = require('./_email.js');

module.exports = async function (req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ erreur: 'Méthode non autorisée.' });
    return;
  }

  var corps = req.body || {};
  var identifiant = String(corps.id || '');
  if (!identifiant) {
    res.status(400).json({ erreur: 'Identifiant de paiement manquant.' });
    return;
  }

  var cle = process.env.SUMUP_API_KEY;
  if (!cle) {
    console.error('Webhook SumUp reçu mais SUMUP_API_KEY n’est pas réglé.');
    // 500 : SumUp réessaiera, et d'ici là le réglage sera peut-être fait.
    res.status(500).json({ erreur: 'Paiement non configuré.' });
    return;
  }

  var paiement;
  try {
    var reponse = await fetch('https://api.sumup.com/v0.1/checkouts/' + encodeURIComponent(identifiant), {
      headers: { Authorization: 'Bearer ' + cle }
    });
    if (!reponse.ok) {
      console.error('Vérification du paiement refusée par SumUp :', reponse.status);
      res.status(502).json({ erreur: 'Vérification impossible.' });
      return;
    }
    paiement = await reponse.json();
  } catch (erreur) {
    console.error('Impossible de vérifier le paiement auprès de SumUp :', erreur.message);
    res.status(502).json({ erreur: 'Vérification impossible.' });
    return;
  }

  // PENDING, FAILED, EXPIRED : rien à annoncer. On accuse quand même
  // réception, sinon SumUp rappellerait en boucle pour ces états-là.
  if (paiement.status !== 'PAID') {
    res.status(200).json({ ok: true });
    return;
  }

  var reference = String(paiement.checkout_reference || '');
  if (!reference) {
    console.error('Paiement payé sans référence de commande :', identifiant);
    res.status(200).json({ ok: true });
    return;
  }

  var commande;
  try {
    commande = await BaseDeDonnees.marquerPayee(reference);
  } catch (erreur) {
    // Là on veut que SumUp réessaie : la commande est payée mais pas
    // encore marquée, et personne n'a été prévenu.
    console.error('Commande non marquée comme payée :', erreur.message);
    res.status(500).json({ erreur: 'Enregistrement impossible.' });
    return;
  }

  // Déjà payée (SumUp renvoie le même événement plusieurs fois), ou
  // commande absente de la base : dans les deux cas, ne rien renvoyer.
  if (!commande) {
    res.status(200).json({ ok: true });
    return;
  }

  // Les e-mails ne doivent jamais faire échouer la réponse : un échec
  // d'envoi ferait rappeler SumUp, qui retrouverait la commande déjà
  // marquée payée — et alors plus personne ne serait prévenu.
  try {
    await Promise.all([
      Email.previenirBoutique(commande),
      Email.accuserReceptionCliente(commande)
    ]);
  } catch (erreur) {
    console.error('Commande payée mais e-mails non envoyés :', erreur.message);
  }

  res.status(200).json({ ok: true });
};
