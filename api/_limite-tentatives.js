/* =========================================================
   Couture & Fil — limite les tentatives de connexion

   Sans ça, rien n'empêche d'essayer des milliers de mots de passe
   à la suite sur /api/commandes-connexion, qui protège les
   coordonnées des clientes. Le mot de passe est solide, mais un
   essai illimité reste une porte laissée entrouverte — et le RGPD
   demande des mesures de sécurité adaptées aux données protégées.

   Portée réelle, dite honnêtement : le compteur vit dans la
   mémoire de l'instance qui répond. Vercel réutilise ses
   instances, donc la limite attrape les tentatives répétées
   ordinaires, mais un attaquant patient réparti sur beaucoup
   d'adresses passerait entre les mailles. C'est un ralentisseur
   sérieux, pas un mur — le vrai rempart reste la longueur du mot
   de passe.

   Préfixé par « _ » : Vercel ne le publie pas comme route de
   l'API, c'est un module partagé.
   ========================================================= */

var FENETRE_MS = 15 * 60 * 1000; // Les échecs sont oubliés après 15 minutes.
var MAX_ECHECS = 8;
// Garde-fou mémoire : sans plafond, un attaquant changeant d'adresse à
// chaque essai ferait grossir cette table sans fin.
var MAX_ADRESSES = 5000;

var echecs = new Map();

/** L'adresse du visiteur, telle que Vercel la transmet. */
function adresse(req) {
  var transmise = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || '';
  // « x-forwarded-for » peut contenir une liste : la première est le client.
  return String(transmise).split(',')[0].trim() || 'inconnue';
}

/** Oublie les fenêtres expirées, et fait de la place si la table déborde. */
function nettoyer(maintenant) {
  echecs.forEach(function (suivi, cle) {
    if (maintenant - suivi.debut > FENETRE_MS) echecs.delete(cle);
  });
  // Toujours trop d'entrées après nettoyage : on retire les plus anciennes.
  // Map conserve l'ordre d'insertion, la première est donc la plus ancienne.
  while (echecs.size > MAX_ADRESSES) {
    var premiere = echecs.keys().next();
    if (premiere.done) break;
    echecs.delete(premiere.value);
  }
}

/**
 * Nombre de secondes à attendre avant un nouvel essai, ou 0 si la voie
 * est libre.
 */
function attenteRequise(req) {
  var maintenant = Date.now();
  nettoyer(maintenant);

  var suivi = echecs.get(adresse(req));
  if (!suivi || suivi.nombre < MAX_ECHECS) return 0;

  var reste = FENETRE_MS - (maintenant - suivi.debut);
  return reste > 0 ? Math.ceil(reste / 1000) : 0;
}

/** À appeler après un mot de passe refusé. */
function enregistrerEchec(req) {
  var maintenant = Date.now();
  var cle = adresse(req);
  var suivi = echecs.get(cle);

  if (!suivi || maintenant - suivi.debut > FENETRE_MS) {
    echecs.set(cle, { nombre: 1, debut: maintenant });
    return;
  }

  suivi.nombre += 1;
}

/** À appeler après une connexion réussie : le compteur repart à zéro. */
function reinitialiser(req) {
  echecs.delete(adresse(req));
}

module.exports = {
  attenteRequise: attenteRequise,
  enregistrerEchec: enregistrerEchec,
  reinitialiser: reinitialiser,
  MAX_ECHECS: MAX_ECHECS
};
