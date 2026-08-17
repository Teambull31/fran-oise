/* =========================================================
   Couture & Fil — accès administrateur

   Le site est statique : il n'y a ni serveur ni compte au sens
   habituel. Un seul code secret, connu de Françoise, protège la
   page « Modifier » et le bouton d'installation de l'application.
   Il ne s'agit pas d'une vraie sécurité (le code du site reste
   lisible par qui sait chercher) : seulement de garder ces deux
   fonctions hors de vue des visiteurs ordinaires.

   Le code lui-même n'est jamais écrit ici, seulement son
   empreinte (SHA-256) : impossible de le retrouver en lisant ce
   fichier.

   Pour changer le code : ouvrir la console du navigateur sur le
   site (touche F12), coller la ligne suivante en remplaçant
   nouveauCode par le code choisi, appuyer sur Entrée, puis
   remplacer EMPREINTE ci-dessous par le résultat affiché :

     crypto.subtle.digest('SHA-256', new TextEncoder().encode('nouveauCode')).then(t=>[...new Uint8Array(t)].map(o=>o.toString(16).padStart(2,'0')).join('')).then(console.log)

   ========================================================= */
(function () {
  'use strict';

  var EMPREINTE = '006fae17ee35671870aadee10d21a46949252ba99f425dec993a66ab48b20d6e';
  var CLE = 'couture-fil:admin';

  function estAdmin() {
    try {
      return localStorage.getItem(CLE) === '1';
    } catch (erreur) {
      return false;
    }
  }

  function empreinteDe(texte) {
    var octets = new TextEncoder().encode(texte);
    return crypto.subtle.digest('SHA-256', octets).then(function (tampon) {
      return Array.prototype.map
        .call(new Uint8Array(tampon), function (octet) {
          return octet.toString(16).padStart(2, '0');
        })
        .join('');
    });
  }

  /** Vérifie le code saisi ; si correct, mémorise l'accès sur cet appareil. */
  function verifierCode(code) {
    return empreinteDe(String(code || '')).then(function (empreinte) {
      var correct = empreinte === EMPREINTE;
      if (correct) {
        try {
          localStorage.setItem(CLE, '1');
        } catch (erreur) {
          /* l'accès restera valable le temps de l'onglet */
        }
      }
      return correct;
    });
  }

  function seDeconnecter() {
    try {
      localStorage.removeItem(CLE);
    } catch (erreur) {
      /* sans importance */
    }
  }

  window.AdminGate = {
    estAdmin: estAdmin,
    verifierCode: verifierCode,
    seDeconnecter: seDeconnecter
  };
})();
