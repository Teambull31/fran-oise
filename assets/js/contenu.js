/* =========================================================
   Couture & Fil — lecture du fichier contenu.txt

   Ce fichier traduit le texte simple de « contenu.txt » en
   données pour le site. Il est volontairement très tolérant :
   accents, majuscules, espaces en trop, champs vides, blocs
   incomplets ou clés inconnues ne cassent jamais l'affichage.

   Françoise n'a jamais besoin d'ouvrir ce fichier : elle
   modifie uniquement contenu.txt.
   ========================================================= */
(function () {
  'use strict';

  var FICHIER = 'contenu.txt';
  var DOSSIER_PHOTOS = 'assets/img/';

  /** « Étiquette » → « etiquette » : compare sans accent ni casse. */
  function normalise(texte) {
    return texte
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  /** Plusieurs façons d'écrire une même clé sont acceptées. */
  var CLES = {
    nom: 'nom',
    titre: 'titre',
    'sous titre': 'sousTitre',
    'grand titre': 'grandTitre',
    'mots en couleur': 'motsEnCouleur',
    'phrase d accueil': 'accueil',
    description: 'description',
    ville: 'ville',
    departement: 'departement',
    region: 'departement',
    adresse: 'adresse',
    'e mail': 'email',
    mail: 'email',
    courriel: 'email',
    telephone: 'telephone',
    facebook: 'facebook',
    instagram: 'instagram',
    'boutique en ligne': 'boutique',
    'bandeau en haut': 'bandeau',
    'gros texte': 'grosTexte',
    'petit texte': 'petitTexte',
    prix: 'prix',
    rayon: 'rayon',
    categorie: 'rayon',
    photo: 'photo',
    image: 'photo',
    cadrage: 'cadrage',
    etiquette: 'etiquette',
    'autres couleurs': 'autresCouleurs',
    texte: 'texte',
    'texte de la photo': 'texteDeLaPhoto',
    point: 'point',
    paragraphe: 'paragraphe',
    'savoir faire': 'savoirFaire'
  };

  /** Les clés qui peuvent revenir plusieurs fois dans un bloc. */
  var MULTIPLES = { point: true, paragraphe: true, savoirFaire: true };

  var BLOCS = {
    boutique: 'boutique',
    chiffre: 'chiffre',
    famille: 'famille',
    univers: 'famille',
    produit: 'produit',
    creation: 'produit',
    service: 'service',
    atelier: 'atelier'
  };

  /**
   * Découpe le fichier en blocs. Une valeur peut se poursuivre
   * sur les lignes suivantes tant qu'elles ne commencent pas
   * par une nouvelle clé — pratique pour les longs textes.
   */
  function decouper(texte) {
    var blocs = [];
    var bloc = null;
    var derniereCle = null;

    texte.split(/\r?\n/).forEach(function (ligne) {
      var brut = ligne.trim();

      if (!brut || brut.charAt(0) === '#') {
        derniereCle = null;
        return;
      }

      var entete = brut.match(/^\[\s*([^\]]+?)\s*\]$/);
      if (entete) {
        var type = BLOCS[normalise(entete[1])];
        bloc = type ? { type: type, champs: {} } : null;
        if (bloc) blocs.push(bloc);
        derniereCle = null;
        return;
      }

      if (!bloc) return;

      var paire = brut.match(/^([^:]{1,40}):\s*(.*)$/);
      if (paire) {
        var cle = CLES[normalise(paire[1])];
        derniereCle = null;
        if (!cle) return;

        var valeur = paire[2].trim();
        if (MULTIPLES[cle]) {
          if (!valeur) return;
          (bloc.champs[cle] = bloc.champs[cle] || []).push(valeur);
        } else {
          bloc.champs[cle] = valeur;
          derniereCle = cle;
        }
        return;
      }

      // Suite d'un texte commencé à la ligne précédente.
      if (derniereCle && bloc.champs[derniereCle]) {
        bloc.champs[derniereCle] += ' ' + brut;
      }
    });

    return blocs;
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
    var nombre = parseFloat(String(valeur).replace(/[^0-9,.]/g, '').replace(',', '.'));
    return isNaN(nombre) ? 0 : nombre;
  }

  /** Accepte « lapin.jpg », « assets/img/lapin.jpg » ou une adresse web. */
  function photo(valeur) {
    var nom = (valeur || '').trim();
    if (!nom) return '';
    if (/^(https?:)?\/\//.test(nom) || nom.indexOf('assets/') === 0) return nom;
    return DOSSIER_PHOTOS + nom.replace(/^\/+/, '');
  }

  /** « bas », « haut », « centre » → valeur CSS object-position. */
  function cadrage(valeur) {
    var mot = normalise(valeur || '');
    if (mot.indexOf('bas') === 0) return 'center bottom';
    if (mot.indexOf('haut') === 0) return 'center top';
    return 'center';
  }

  function vraiFaux(valeur) {
    var mot = normalise(valeur || '');
    return mot === 'oui' || mot === 'o' || mot === 'yes' || mot === 'x' || mot === 'vrai';
  }

  /** Identifiant technique stable, déduit du nom du produit. */
  function identifiant(nom, secours) {
    var base = normalise(nom).replace(/\s+/g, '-');
    return base || secours;
  }

  function construire(texte) {
    var blocs = decouper(texte);
    var b = premier(blocs, 'boutique');
    var atelier = premier(blocs, 'atelier');

    var produits = tous(blocs, 'produit')
      .filter(function (p) {
        return (p.nom || '').trim();
      })
      .map(function (p, index) {
        return {
          id: identifiant(p.nom, 'produit-' + index),
          name: p.nom.trim(),
          price: prix(p.prix),
          rayon: (p.rayon || '').trim(),
          category: normalise(p.rayon || 'autres').replace(/\s+/g, '-') || 'autres',
          image: photo(p.photo),
          badge: (p.etiquette || '').trim(),
          variants: vraiFaux(p.autresCouleurs),
          description: (p.description || '').trim()
        };
      });

    // Les rayons du filtre sont déduits des produits : rien à régler.
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
    if (b.facebook) reseaux.push({ label: 'Facebook', url: b.facebook });
    if (b.instagram) reseaux.push({ label: 'Instagram', url: b.instagram });

    var boutique = (b.boutique || '').trim();

    return {
      shop: {
        name: b.nom || 'Couture & Fil',
        tagline: b.description || '',
        subtitle: b.sousTitre || '',
        heroTitle: b.grandTitre || b.description || '',
        heroHighlight: b.motsEnCouleur || '',
        intro: [b.accueil || ''],
        city: b.ville || '',
        region: b.departement || '',
        sumupUrl: boutique,
        email: b.email || '',
        phone: b.telephone || '',
        address: b.adresse || '',
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
        return { value: c.grosTexte || '', label: c.petitTexte || '' };
      }),

      categories: [{ id: 'all', label: 'Tout voir' }].concat(rayons),

      universes: tous(blocs, 'famille').map(function (f) {
        return {
          id: normalise(f.rayon || f.titre || '').replace(/\s+/g, '-'),
          title: f.titre || '',
          image: photo(f.photo),
          focus: cadrage(f.cadrage),
          text: f.texte || ''
        };
      }),

      products: produits,

      services: tous(blocs, 'service').map(function (s) {
        return {
          title: s.titre || '',
          price: s.prix || '',
          description: s.description || '',
          points: s.point || []
        };
      }),

      about: {
        title: atelier.titre || '',
        image: photo(atelier.photo),
        imageAlt: atelier.texteDeLaPhoto || '',
        paragraphs: atelier.paragraphe || [],
        skills: atelier.savoirFaire || []
      },

      demoNotice: b.bandeau || ''
    };
  }

  function demarrer() {
    var script = document.createElement('script');
    script.src = 'assets/js/app.js';
    document.body.appendChild(script);
  }

  /**
   * Le contenu de secours (assets/js/content.js) sert uniquement
   * si contenu.txt est introuvable — ouverture du fichier en
   * local, coupure réseau… Le site reste alors affiché.
   */
  var secours = window.CONTENT;

  fetch(FICHIER, { cache: 'no-cache' })
    .then(function (reponse) {
      if (!reponse.ok) throw new Error('contenu.txt introuvable');
      return reponse.text();
    })
    .then(function (texte) {
      var contenu = construire(texte);
      // Un fichier vidé par erreur ne doit pas effacer le site.
      if (!contenu.products.length && secours) {
        window.CONTENT = secours;
      } else {
        window.CONTENT = contenu;
      }
    })
    .catch(function () {
      if (secours) window.CONTENT = secours;
    })
    .then(demarrer);
})();
