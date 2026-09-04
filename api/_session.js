/* =========================================================
   Couture & Fil — session de l'espace « Commandes »

   Une vraie vérification côté serveur, contrairement au code
   d'accès de modifier.html (assets/js/admin.js) qui n'est qu'une
   gêne cosmétique côté navigateur — ici le mot de passe
   (COMMANDES_MOT_DE_PASSE, réglé dans Vercel, jamais dans ce
   dépôt) est comparé sur le serveur et ne quitte jamais celui-ci
   sous aucune forme lisible. Une seule variable à régler : la
   clé qui signe le cookie de session est dérivée du mot de passe
   lui-même.

   Préfixé par « _ » : Vercel ne le publie pas comme route de
   l'API.
   ========================================================= */

var crypto = require('crypto');

var NOM_COOKIE = 'couture-fil-session';
var DUREE_SESSION_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours

function empreinte(texte) {
  return crypto.createHash('sha256').update(String(texte)).digest();
}

/** Dérivée du mot de passe : pas de deuxième secret à régler côté Vercel. */
function cleSignature() {
  return crypto
    .createHash('sha256')
    .update((process.env.COMMANDES_MOT_DE_PASSE || '') + ':session-commandes')
    .digest();
}

function signer(valeur) {
  return crypto.createHmac('sha256', cleSignature()).update(valeur).digest('hex');
}

/** Comparaison à temps constant : la durée de la vérification ne doit
 *  rien laisser deviner sur le mot de passe correct. */
function motDePasseCorrect(saisi) {
  var attendu = process.env.COMMANDES_MOT_DE_PASSE;
  if (!attendu) return false;
  return crypto.timingSafeEqual(empreinte(saisi || ''), empreinte(attendu));
}

function creerCookieSession() {
  var expiration = String(Date.now() + DUREE_SESSION_MS);
  var jeton = expiration + '.' + signer(expiration);
  return (
    NOM_COOKIE +
    '=' +
    jeton +
    '; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=' +
    Math.floor(DUREE_SESSION_MS / 1000)
  );
}

function creerCookieDeconnexion() {
  return NOM_COOKIE + '=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0';
}

function lireCookie(req, nom) {
  var entete = req.headers.cookie || '';
  var paire = entete
    .split(';')
    .map(function (morceau) {
      return morceau.trim();
    })
    .find(function (morceau) {
      return morceau.indexOf(nom + '=') === 0;
    });
  return paire ? paire.slice(nom.length + 1) : null;
}

function sessionValide(req) {
  var jeton = lireCookie(req, NOM_COOKIE);
  if (!jeton) return false;

  var separateur = jeton.indexOf('.');
  if (separateur < 0) return false;

  var expiration = jeton.slice(0, separateur);
  var signature = jeton.slice(separateur + 1);
  if (!(Number(expiration) > Date.now())) return false;

  var attendue = signer(expiration);
  if (attendue.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(attendue), Buffer.from(signature));
}

module.exports = {
  motDePasseCorrect: motDePasseCorrect,
  creerCookieSession: creerCookieSession,
  creerCookieDeconnexion: creerCookieDeconnexion,
  sessionValide: sessionValide
};
