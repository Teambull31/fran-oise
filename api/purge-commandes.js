/* =========================================================
   Couture & Fil — purge des commandes anciennes

   RGPD : les coordonnées des clientes ne sont pas gardées
   indéfiniment. Supprime les commandes de plus de 12 mois,
   une fois par mois (voir vercel.json → crons).

   Protégé par CRON_SECRET (réglé automatiquement par Vercel
   pour ses propres appels programmés) : sans ça, n'importe qui
   pourrait déclencher cette suppression depuis l'extérieur.
   ========================================================= */

var BaseDeDonnees = require('./_base-donnees.js');

var MOIS_CONSERVATION = 12;

module.exports = async function (req, res) {
  var secret = process.env.CRON_SECRET;
  var autorisation = req.headers.authorization || '';
  if (!secret || autorisation !== 'Bearer ' + secret) {
    res.status(401).json({ erreur: 'Non autorisé.' });
    return;
  }

  try {
    var supprimees = await BaseDeDonnees.purgerCommandes(MOIS_CONSERVATION);
    res.status(200).json({ supprimees: supprimees });
  } catch (erreur) {
    console.error('Échec de la purge des commandes :', erreur.message);
    res.status(502).json({ erreur: 'Échec de la purge.' });
  }
};
