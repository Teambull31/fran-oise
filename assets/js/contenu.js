/* =========================================================
   Couture & Fil — chargement du contenu du site

   Lit contenu.txt (via assets/js/contenu-format.js), le traduit
   en données pour l'affichage, puis démarre le site.

   Françoise n'a jamais besoin d'ouvrir ce fichier : elle passe
   par la page « modifier », ou modifie contenu.txt.
   ========================================================= */
(function () {
  'use strict';

  var FICHIER = 'contenu.txt';
  var DOSSIER_PHOTOS = 'assets/img/';
  var Format = window.ContenuFormat;

  function premier(blocs, type) {
    for (var i = 0; i < blocs.length; i++) {
      if (blocs[i].type === type) return blocs[i].champs;
    }
    return {};
  }

  function tous(blocs, type) {
    return blocs
      .filter(function (bloc) {
        return bloc.type === type;
      })
      .map(function (bloc) {
        return bloc.champs;
      });
  }

  /** « 54 », « 54,00 € », « 54.5 » → nombre. Sinon 0. */
  function prix(valeur) {
    if (!valeur) return 0;
    var nombre = parseFloat(
      String(valeur)
        .replace(/[^0-9,.]/g, '')
        .replace(',', '.')
    );
    return isNaN(nombre) ? 0 : nombre;
  }

  /** Accepte « lapin.jpg », « assets/img/lapin.jpg » ou une adresse web. */
  function photo(valeur) {
    var nom = String(valeur || '').trim();
    if (!nom) return '';
    if (/^(https?:)?\/\//.test(nom) || nom.indexOf('assets/') === 0) return nom;
    return DOSSIER_PHOTOS + nom.replace(/^\/+/, '');
  }

  /** « bas », « haut », « centre » → valeur CSS object-position. */
  function cadrage(valeur) {
    var mot = Format.normalise(valeur);
    if (mot.indexOf('bas') === 0) return 'center bottom';
    if (mot.indexOf('haut') === 0) return 'center top';
    return 'center';
  }

  function vraiFaux(valeur) {
    var mot = Format.normalise(valeur);
    return mot === 'oui' || mot === 'o' || mot === 'yes' || mot === 'x' || mot === 'vrai';
  }

  /** Identifiant technique stable, déduit du nom. */
  function identifiant(nom, secours) {
    return Format.normalise(nom).replace(/\s+/g, '-') || secours;
  }

  function construire(texte) {
    var blocs = Format.lire(texte);
    var b = premier(blocs, 'boutique');
    var atelier = premier(blocs, 'atelier');

    var produits = tous(blocs, 'produit')
      .filter(function (p) {
        return String(p['Nom'] || '').trim();
      })
      .map(function (p, index) {
        var rayon = String(p['Rayon'] || '').trim();
        return {
          id: identifiant(p['Nom'], 'produit-' + index),
          name: String(p['Nom']).trim(),
          price: prix(p['Prix']),
          rayon: rayon,
          category: identifiant(rayon, 'autres'),
          image: photo(p['Photo']),
          badge: String(p['Étiquette'] || '').trim(),
          variants: vraiFaux(p['Autres couleurs']),
          description: String(p['Description'] || '').trim()
        };
      });

    // Les rayons de la boutique se déduisent des produits : rien à régler.
    var rayons = [];
    produits.forEach(function (p) {
      if (
        p.rayon &&
        !rayons.some(function (r) {
          return r.id === p.category;
        })
      ) {
        rayons.push({ id: p.category, label: p.rayon });
      }
    });

    var reseaux = [];
    if (b['Facebook']) reseaux.push({ label: 'Facebook', url: b['Facebook'] });
    if (b['Instagram']) reseaux.push({ label: 'Instagram', url: b['Instagram'] });

    var boutique = String(b['Boutique en ligne'] || '').trim();

    return {
      shop: {
        name: b['Nom'] || 'Couture & Fil',
        tagline: b['Description'] || '',
        subtitle: b['Sous-titre'] || '',
        heroTitle: b['Grand titre'] || b['Description'] || '',
        heroHighlight: b['Mots en couleur'] || '',
        intro: [b['Phrase d’accueil'] || ''],
        city: b['Ville'] || '',
        region: b['Département'] || '',
        sumupUrl: boutique,
        email: b['E-mail'] || '',
        phone: b['Téléphone'] || '',
        address: b['Adresse'] || '',
        hours: [],
        socials: reseaux,
        legalLinks: boutique
          ? [
              { label: 'Conditions', url: boutique },
              { label: 'Politique de confidentialité', url: boutique },
              { label: 'Politique de cookies', url: boutique }
            ]
          : []
      },

      highlights: tous(blocs, 'chiffre').map(function (c) {
        return { value: c['Gros texte'] || '', label: c['Petit texte'] || '' };
      }),

      categories: [{ id: 'all', label: 'Tout voir' }].concat(rayons),

      universes: tous(blocs, 'famille').map(function (f) {
        return {
          id: identifiant(f['Rayon'] || f['Titre'], 'famille'),
          title: f['Titre'] || '',
          image: photo(f['Photo']),
          focus: cadrage(f['Cadrage']),
          text: f['Texte'] || ''
        };
      }),

      products: produits,

      services: tous(blocs, 'service').map(function (s) {
        return {
          title: s['Titre'] || '',
          price: s['Prix'] || '',
          description: s['Description'] || '',
          points: s['Point'] || []
        };
      }),

      about: {
        title: atelier['Titre'] || '',
        image: photo(atelier['Photo']),
        imageAlt: atelier['Texte de la photo'] || '',
        paragraphs: atelier['Paragraphe'] || [],
        skills: atelier['Savoir-faire'] || []
      },

      demoNotice: b['Bandeau en haut'] || ''
    };
  }

  function demarrer() {
    var script = document.createElement('script');
    script.src = 'assets/js/app.js';
    document.body.appendChild(script);
  }

  /**
   * Le contenu de secours (assets/js/content.js) ne sert que si
   * contenu.txt est introuvable ou vide : le site reste affiché
   * au lieu de devenir une page blanche.
   */
  var secours = window.CONTENT;

  fetch(FICHIER, { cache: 'no-cache' })
    .then(function (reponse) {
      if (!reponse.ok) throw new Error('contenu.txt introuvable');
      return reponse.text();
    })
    .then(function (texte) {
      var contenu = construire(texte);
      window.CONTENT = !contenu.products.length && secours ? secours : contenu;
    })
    .catch(function () {
      if (secours) window.CONTENT = secours;
    })
    .then(demarrer);
})();
