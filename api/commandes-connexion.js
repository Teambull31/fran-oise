/* =========================================================
   Couture & Fil — connexion à l'espace « Commandes »

   Vérifie le mot de passe (COMMANDES_MOT_DE_PASSE) et pose un
   cookie de session signé si correct. Voir api/_session.js pour
   le détail de la vérification.
   ========================================================= */

var Session = require('./_session.js');

module.exports = async function (req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ erreur: 'Méthode non autorisée.' });
    return;
  }

  if (!process.env.COMMANDES_MOT_DE_PASSE) {
    res.status(500).json({ erreur: 'L’espace « Commandes » n’est pas encore configuré.' });
    return;
  }

  var corps = req.body || {};
  var motDePasse = String(corps.motDePasse || '');

  if (!Session.motDePasseCorrect(motDePasse)) {
    res.status(401).json({ erreur: 'Mot de passe incorrect.' });
    return;
  }

  res.setHeader('Set-Cookie', Session.creerCookieSession());
  res.status(200).json({ ok: true });
};
