/* =========================================================
   Couture & Fil — mesure d'audience (Google Analytics), avec
   consentement préalable

   Rien n'est chargé tant que :
     - aucun identifiant GA4 n'est renseigné dans [BOUTIQUE] →
       « Google Analytics » (contenu.txt / page « Modifier ») ;
     - le visiteur n'a pas donné son accord (bannière ci-dessous).

   C'est la CNIL qui l'exige : un outil de mesure d'audience comme
   Google Analytics ne peut pas se déclencher avant l'accord du
   visiteur. Le choix (accepté/refusé) est mémorisé sur cet
   appareil, pour ne pas redemander à chaque visite.
   ========================================================= */
(function () {
  'use strict';

  var C = window.CONTENT;
  var IDENTIFIANT = C && C.shop ? C.shop.analyticsId : '';
  if (!IDENTIFIANT) return; // Rien à mesurer : pas de bannière, rien de chargé.

  var CLE_CONSENTEMENT = 'couture-fil:consentement-analytics';

  function choixEnregistre() {
    try {
      return localStorage.getItem(CLE_CONSENTEMENT);
    } catch (erreur) {
      return null;
    }
  }

  function enregistrerChoix(valeur) {
    try {
      localStorage.setItem(CLE_CONSENTEMENT, valeur);
    } catch (erreur) {
      /* Le choix ne sera pas mémorisé (mode privé) : la bannière
         réapparaîtra à la prochaine visite, sans gravité. */
    }
  }

  /** Charge réellement Google Analytics. Seulement après accord. */
  function activerGoogleAnalytics() {
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(IDENTIFIANT);
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', IDENTIFIANT);
  }

  function fermerBanniere(banniere) {
    banniere.remove();
  }

  function afficherBanniere() {
    var banniere = document.createElement('div');
    banniere.className = 'cookies-banniere';
    banniere.setAttribute('role', 'note');
    banniere.setAttribute('aria-label', 'Mesure d’audience');

    var texte = document.createElement('p');
    texte.textContent =
      'Ce site propose de mesurer sa fréquentation avec Google Analytics, pour mieux ' +
      'comprendre ce qui intéresse les visiteurs. Rien n’est activé sans votre accord.';
    banniere.appendChild(texte);

    var actions = document.createElement('div');
    actions.className = 'cookies-banniere-actions';

    var accepter = document.createElement('button');
    accepter.type = 'button';
    accepter.className = 'btn btn--primary';
    accepter.textContent = 'Accepter';
    accepter.addEventListener('click', function () {
      enregistrerChoix('accepte');
      activerGoogleAnalytics();
      fermerBanniere(banniere);
    });

    var refuser = document.createElement('button');
    refuser.type = 'button';
    refuser.className = 'btn btn--ghost';
    refuser.textContent = 'Refuser';
    refuser.addEventListener('click', function () {
      enregistrerChoix('refuse');
      fermerBanniere(banniere);
    });

    actions.append(accepter, refuser);
    banniere.appendChild(actions);
    document.body.appendChild(banniere);
  }

  var choix = choixEnregistre();
  if (choix === 'accepte') {
    activerGoogleAnalytics();
  } else if (choix !== 'refuse') {
    // Ni accepté ni refusé pour l'instant : on demande.
    afficherBanniere();
  }

  // Permet à mentions-legales.html de proposer « Revoir mon choix »
  // sans dupliquer cette logique.
  window.reinitialiserConsentementAnalytics = function () {
    try {
      localStorage.removeItem(CLE_CONSENTEMENT);
    } catch (erreur) {
      /* sans importance */
    }
  };
})();
