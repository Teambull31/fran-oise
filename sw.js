/* =========================================================
   Couture & Fil — fonctionnement hors connexion

   Ce fichier permet à l'application installée de s'ouvrir même
   sans réseau, et d'afficher tout de suite les photos déjà vues.

   Deux stratégies, volontairement différentes :
     - les textes (contenu.txt, pages) : le réseau d'abord, pour
       ne jamais afficher un prix périmé quand la connexion est là ;
     - les images, styles et scripts : le cache d'abord, car ils
       ne changent qu'à une nouvelle version.
   ========================================================= */

// À changer à chaque mise en ligne d'une nouvelle version du site.
var VERSION = 'couture-fil-v18';

var ESSENTIELS = [
  './',
  './index.html',
  './modifier.html',
  './merci.html',
  './mentions-legales.html',
  './cgv.html',
  './contenu.txt',
  './manifest.webmanifest',
  './assets/css/styles.css',
  './assets/js/admin.js',
  './assets/js/app.js',
  './assets/js/content.js',
  './assets/js/contenu.js',
  './assets/js/contenu-format.js',
  './assets/js/legal.js',
  './assets/js/analytics.js',
  './assets/img/logo.png',
  './assets/img/icone-192.png'
];

self.addEventListener('install', function (evenement) {
  evenement.waitUntil(
    caches.open(VERSION).then(function (cache) {
      // Une image manquante ne doit pas faire échouer l'installation.
      return Promise.all(
        ESSENTIELS.map(function (adresse) {
          return cache.add(adresse).catch(function () {
            return null;
          });
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (evenement) {
  evenement.waitUntil(
    caches.keys().then(function (noms) {
      return Promise.all(
        noms.map(function (nom) {
          return nom === VERSION ? null : caches.delete(nom);
        })
      );
    })
  );
  self.clients.claim();
});

/** Le réseau d'abord ; le cache seulement s'il ne répond pas. */
function reseauDAbord(requete) {
  return fetch(requete)
    .then(function (reponse) {
      var copie = reponse.clone();
      caches.open(VERSION).then(function (cache) {
        cache.put(requete, copie);
      });
      return reponse;
    })
    .catch(function () {
      return caches.match(requete).then(function (garde) {
        return garde || caches.match('./index.html');
      });
    });
}

/** Le cache d'abord ; on rafraîchit en arrière-plan. */
function cacheDAbord(requete) {
  return caches.match(requete).then(function (garde) {
    var reseau = fetch(requete)
      .then(function (reponse) {
        var copie = reponse.clone();
        caches.open(VERSION).then(function (cache) {
          cache.put(requete, copie);
        });
        return reponse;
      })
      .catch(function () {
        return garde;
      });
    return garde || reseau;
  });
}

self.addEventListener('fetch', function (evenement) {
  var requete = evenement.request;
  if (requete.method !== 'GET') return;

  var adresse = new URL(requete.url);
  // On ne touche ni aux autres domaines ni à l'API de publication.
  if (adresse.origin !== self.location.origin) return;

  var texte =
    requete.mode === 'navigate' ||
    /\.(?:html|txt|webmanifest)$/.test(adresse.pathname);

  evenement.respondWith(texte ? reseauDAbord(requete) : cacheDAbord(requete));
});
