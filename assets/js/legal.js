/* =========================================================
   Couture & Fil — remplissage des pages légales

   mentions-legales.html et cgv.html partagent ce petit script :
   il relit contenu.txt (comme le reste du site) et remplace les
   espaces réservés par les vraies informations de la boutique,
   pour que Françoise puisse les tenir à jour depuis « Modifier »
   sans jamais toucher au code.

   Si un champ n'est pas encore rempli (SIRET, par exemple), le
   texte d'origine du HTML reste affiché — un rappel visible que
   l'information manque encore, plutôt qu'un blanc silencieux.
   ========================================================= */
(function () {
  'use strict';

  function remplir(champs) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-champ]'), function (noeud) {
      var valeur = champs[noeud.dataset.champ];
      if (valeur) noeud.textContent = valeur;
    });
  }

  fetch('contenu.txt', { cache: 'no-cache' })
    .then(function (reponse) {
      if (!reponse.ok) throw new Error('contenu.txt introuvable');
      return reponse.text();
    })
    .then(function (texte) {
      var blocs = window.ContenuFormat.lire(texte);
      var boutique = blocs.filter(function (bloc) {
        return bloc.type === 'boutique';
      })[0];
      if (boutique) remplir(boutique.champs);
    })
    .catch(function () {
      // Pas grave : les espaces réservés du HTML restent affichés.
    });
})();
