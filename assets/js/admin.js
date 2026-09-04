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

   Le code saisi est comparé sans tenir compte des majuscules ni
   des espaces avant/après (une majuscule oubliée ou un espace
   collé par erreur ne doit pas empêcher de se connecter) : c'est
   pour ça que l'empreinte ci-dessous n'est pas celle du code tel
   quel, mais de sa version en minuscules, sans espaces superflus.

   Pour changer le code : ouvrir la console du navigateur sur le
   site (touche F12), coller la ligne suivante en remplaçant
   nouveauCode par le code choisi, appuyer sur Entrée, puis
   remplacer EMPREINTE ci-dessous par le résultat affiché :

     crypto.subtle.digest('SHA-256', new TextEncoder().encode('nouveauCode'.trim().toLowerCase())).then(t=>[...new Uint8Array(t)].map(o=>o.toString(16).padStart(2,'0')).join('')).then(console.log)

   ========================================================= */
(function () {
  'use strict';

  var EMPREINTE = 'bb54753e3e93bb1a21d76a478b732d4b59c936dbebaaf66b8090f2bf9060bb83';
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
    // Majuscules et espaces en trop ne doivent pas faire échouer une
    // saisie par ailleurs correcte.
    var normalise = String(code || '').trim().toLowerCase();
    return empreinteDe(normalise).then(function (empreinte) {
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
