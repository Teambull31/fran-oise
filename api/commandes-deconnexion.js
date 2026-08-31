/* =========================================================
   Couture & Fil — déconnexion de l'espace « Commandes »
   ========================================================= */

var Session = require('./_session.js');

module.exports = async function (req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ erreur: 'Méthode non autorisée.' });
    return;
  }

  res.setHeader('Set-Cookie', Session.creerCookieDeconnexion());
  res.status(200).json({ ok: true });
};
