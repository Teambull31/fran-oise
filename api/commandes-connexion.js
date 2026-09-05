/* =========================================================
   Couture & Fil — connexion à l'espace « Commandes »

   Vérifie le mot de passe (COMMANDES_MOT_DE_PASSE) et pose un
   cookie de session signé si correct. Voir api/_session.js pour
   le détail de la vérification.
   ========================================================= */

var Session = require('./_session.js');
var Limite = require('./_limite-tentatives.js');

module.exports = async function (req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ erreur: 'Méthode non autorisée.' });
    return;
  }

  if (!process.env.COMMANDES_MOT_DE_PASSE) {
    res.status(500).json({ erreur: 'L’espace « Commandes » n’est pas encore configuré.' });
    return;
  }

  // Trop d'échecs récents depuis cette adresse : on refuse avant même de
  // regarder le mot de passe, pour ne pas laisser essayer sans fin.
  var attente = Limite.attenteRequise(req);
  if (attente > 0) {
    res.setHeader('Retry-After', String(attente));
    res.status(429).json({
      erreur:
        'Trop de tentatives. Réessayez dans ' + Math.ceil(attente / 60) + ' minute(s).'
    });
    return;
  }

  var corps = req.body || {};
  var motDePasse = String(corps.motDePasse || '');

  if (!Session.motDePasseCorrect(motDePasse)) {
    Limite.enregistrerEchec(req);
    res.status(401).json({ erreur: 'Mot de passe incorrect.' });
    return;
  }

  Limite.reinitialiser(req);
  res.setHeader('Set-Cookie', Session.creerCookieSession());
  res.status(200).json({ ok: true });
};
