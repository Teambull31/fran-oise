/* =========================================================
   Couture & Fil — liste des commandes (espace de Françoise)

   Réservé aux visiteurs avec une session valide (voir
   api/_session.js et api/commandes-connexion.js). Sans ça,
   n'importe qui pourrait lire les coordonnées des clientes.
   ========================================================= */

var Session = require('./_session.js');
var BaseDeDonnees = require('./_base-donnees.js');

var LIMITE = 500;

module.exports = async function (req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ erreur: 'Méthode non autorisée.' });
    return;
  }

  if (!Session.sessionValide(req)) {
    res.status(401).json({ erreur: 'Connexion requise.' });
    return;
  }

  try {
    var commandes = await BaseDeDonnees.listerCommandes(LIMITE);
    res.status(200).json({ commandes: commandes });
  } catch (erreur) {
    console.error('Impossible de lire les commandes :', erreur.message);
    res.status(502).json({ erreur: 'Impossible de lire les commandes pour le moment.' });
  }
};
