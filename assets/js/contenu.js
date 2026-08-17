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

  /* ---------------------------------------------------------
     Mode aperçu

     Quand on arrive depuis la page « Modifier » avec ?apercu,
     le site s'affiche à partir du brouillon gardé dans le
     navigateur, photos non encore envoyées comprises. Rien
     n'est publié : c'est seulement visible sur cet ordinateur.
     --------------------------------------------------------- */

  var APERCU = /[?&]apercu\b/.test(window.location.search);
  var CLE_APERCU = 'couture-fil:apercu';
  var CLE_PHOTOS = 'couture-fil:photos';

  function depuisLeNavigateur(cle) {
    try {
      return localStorage.getItem(cle);
    } catch (erreur) {
      return null;
    }
  }

  var photosEnAttente = {};
  if (APERCU) {
    try {
      photosEnAttente = JSON.parse(depuisLeNavigateur(CLE_PHOTOS) || '{}') || {};
    } catch (erreur) {
      photosEnAttente = {};
    }
  }

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
    // En aperçu, une photo choisie mais pas encore envoyée s'affiche quand même.
    if (photosEnAttente[nom]) return photosEnAttente[nom];
    if (/^(https?:)?\/\//.test(nom) || nom.indexOf('assets/') === 0) return nom;
    return DOSSIER_PHOTOS + nom.replace(/^\/+/, '');
  }

  /**
   * Cadrage de la photo dans son cadre.
   * Accepte les anciens mots (« bas », « haut », « centre ») et le
   * réglage précis écrit par la page de modification (« 50% 35% »).
   */
  function cadrage(valeur) {
    var brut = String(valeur || '').trim();
    if (/^-?\d+(\.\d+)?%\s+-?\d+(\.\d+)?%$/.test(brut)) return brut;

    var mot = Format.normalise(brut);
    if (mot.indexOf('bas') === 0) return '50% 100%';
    if (mot.indexOf('haut') === 0) return '50% 0%';
    return '50% 50%';
  }

  /** Agrandissement de la photo dans son cadre. 1 = taille normale. */
  function zoom(valeur) {
    var nombre = parseFloat(String(valeur || '').replace(',', '.'));
    if (isNaN(nombre)) return 1;
    return Math.min(4, Math.max(1, nombre));
  }

  function vraiFaux(valeur) {
    var mot = Format.normalise(valeur);
    return mot === 'oui' || mot === 'o' || mot === 'yes' || mot === 'x' || mot === 'vrai';
  }

  /** « Grand », « Très grand » → identifiant utilisé par le CSS. Sinon la taille normale. */
  function tailleTexte(valeur) {
    var mot = Format.normalise(valeur);
    if (mot.indexOf('tres grand') === 0) return 'tres-grand';
    if (mot.indexOf('grand') === 0) return 'grand';
    return 'normal';
  }

  /**
   * Ce qui identifie un marché pour Google Maps : les coordonnées GPS si
   * elles sont renseignées (plus précises, utile sur un parking sans
   * adresse), sinon le lieu et la ville.
   */
  function reperMarche(gps, lieu, ville) {
    var coordonnees = String(gps || '').match(
      /(-?\d+(?:[.,]\d+)?)\s*[,;]\s*(-?\d+(?:[.,]\d+)?)/
    );
    return coordonnees
      ? coordonnees[1].replace(',', '.') + ',' + coordonnees[2].replace(',', '.')
      : [String(lieu || '').trim(), String(ville || '').trim()].filter(Boolean).join(', ');
  }

  /** Lien qui ouvre Google Maps (application ou site) pour l'itinéraire. */
  function itineraire(gps, lieu, ville) {
    var repere = reperMarche(gps, lieu, ville);
    if (!repere) return '';
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(repere);
  }

  /** Adresse d'une carte Google Maps intégrable directement dans la page. */
  function carteIntegree(gps, lieu, ville) {
    var repere = reperMarche(gps, lieu, ville);
    if (!repere) return '';
    return 'https://www.google.com/maps?q=' + encodeURIComponent(repere) + '&output=embed';
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
          shopUrl: String(p['Lien boutique'] || '').trim(),
          focus: cadrage(p['Cadrage']),
          zoom: zoom(p['Zoom']),
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
          zoom: zoom(f['Zoom']),
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

      markets: tous(blocs, 'marche')
        .map(function (m) {
          return {
            day: String(m['Jour'] || '').trim(),
            hours: String(m['Horaires'] || '').trim(),
            place: String(m['Lieu'] || '').trim(),
            city: String(m['Ville'] || '').trim(),
            mapUrl: itineraire(m['Coordonnées GPS'], m['Lieu'], m['Ville']),
            mapEmbedUrl: carteIntegree(m['Coordonnées GPS'], m['Lieu'], m['Ville'])
          };
        })
        .filter(function (m) {
          return m.day || m.place;
        }),

      about: {
        title: atelier['Titre'] || '',
        image: photo(atelier['Photo']),
        focus: cadrage(atelier['Cadrage']),
        zoom: zoom(atelier['Zoom']),
        imageAlt: atelier['Texte de la photo'] || '',
        paragraphs: atelier['Paragraphe'] || [],
        skills: atelier['Savoir-faire'] || []
      },

      demoNotice: b['Bandeau en haut'] || '',

      textSize: tailleTexte(b['Taille du texte'])
    };
  }

  function demarrer() {
    if (window.CONTENT && window.CONTENT.textSize && window.CONTENT.textSize !== 'normal') {
      document.documentElement.dataset.taille = window.CONTENT.textSize;
    }
    if (APERCU) bandeauApercu();
    var script = document.createElement('script');
    script.src = 'assets/js/app.js';
    document.body.appendChild(script);
  }

  /** Rappel visible qu'on regarde un brouillon, pas le site publié. */
  function bandeauApercu() {
    var bandeau = document.createElement('div');
    bandeau.setAttribute('role', 'note');
    bandeau.style.cssText = [
      'position:fixed', 'left:0', 'right:0', 'bottom:0', 'z-index:90',
      'background:#0a7c52', 'color:#fff', 'padding:0.85rem 1rem', 'text-align:center',
      'font:600 1rem/1.4 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif',
      'box-shadow:0 -4px 18px rgba(0,0,0,0.25)'
    ].join(';');

    bandeau.appendChild(
      document.createTextNode('Aperçu de vos modifications — rien n’est encore publié. ')
    );

    var retour = document.createElement('a');
    retour.href = 'modifier.html';
    retour.textContent = 'Revenir aux modifications';
    retour.style.cssText = 'color:#fff;font-weight:800';
    bandeau.appendChild(retour);

    document.body.appendChild(bandeau);
    // Le bandeau ne doit pas masquer la fin de la page.
    document.body.style.paddingBottom = '4.5rem';
  }

  /**
   * Le contenu de secours (assets/js/content.js) ne sert que si
   * contenu.txt est introuvable ou vide : le site reste affiché
   * au lieu de devenir une page blanche.
   */
  var secours = window.CONTENT;

  var brouillon = APERCU ? depuisLeNavigateur(CLE_APERCU) : null;
  if (brouillon) {
    var apercu = construire(brouillon);
    window.CONTENT = !apercu.products.length && secours ? secours : apercu;
    demarrer();
    return;
  }

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
