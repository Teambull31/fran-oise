/* =========================================================
   Couture & Fil — format du fichier contenu.txt

   Lecture et écriture du fichier texte. Partagé par le site
   (assets/js/contenu.js) et par la page de modification
   (modifier.html), pour qu'ils comprennent exactement le
   même format.
   ========================================================= */
(function () {
  'use strict';

  /** « Étiquette » → « etiquette » : comparaison sans accent ni casse. */
  function normalise(texte) {
    return String(texte || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  /* ---------------------------------------------------------
     Description des blocs : c'est aussi ce qui construit le
     formulaire de la page de modification.
     --------------------------------------------------------- */

  var BLOCS = [
    {
      type: 'boutique',
      rangEditeur: 6,
      etiquette: 'BOUTIQUE',
      titre: 'Ma boutique',
      unique: true,
      champs: [
        { cle: 'Nom', type: 'texte', aide: 'Le nom affiché en haut du site.' },
        { cle: 'Sous-titre', type: 'texte' },
        { cle: 'Grand titre', type: 'texte', aide: 'La grande phrase de la page d’accueil.' },
        { cle: 'Mots en couleur', type: 'texte', aide: 'Des mots du grand titre, à mettre en couleur.' },
        { cle: 'Phrase d’accueil', type: 'long' },
        { cle: 'Description', type: 'long', aide: 'Phrase de présentation, aussi utilisée par Google.' },
        { cle: 'Ville', type: 'texte' },
        { cle: 'Département', type: 'texte' },
        { cle: 'Adresse', type: 'texte', aide: 'Laissez vide pour ne rien afficher.' },
        { cle: 'E-mail', type: 'texte' },
        { cle: 'Téléphone', type: 'texte' },
        { cle: 'Facebook', type: 'texte', aide: 'L’adresse complète de la page.' },
        { cle: 'Instagram', type: 'texte' },
        { cle: 'Boutique en ligne', type: 'texte' },
        {
          cle: 'Taille du texte',
          type: 'choix',
          valeurs: ['Normal', 'Grand', 'Très grand'],
          aide: 'La taille de tous les textes du site, pour les visiteurs qui lisent difficilement les petits caractères.'
        },
        { cle: 'Bandeau en haut', type: 'long', aide: 'Le message sur fond coloré tout en haut.' }
      ]
    },
    {
      type: 'chiffre',
      rangEditeur: 5,
      etiquette: 'CHIFFRE',
      titre: 'Les arguments d’accueil',
      singulier: 'argument',
      champs: [
        { cle: 'Gros texte', type: 'texte' },
        { cle: 'Petit texte', type: 'texte' }
      ]
    },
    {
      type: 'famille',
      rangEditeur: 3,
      etiquette: 'FAMILLE',
      titre: 'Les familles de créations',
      singulier: 'famille',
      champs: [
        { cle: 'Titre', type: 'texte' },
        { cle: 'Rayon', type: 'texte', aide: 'À écrire comme le rayon des produits.' },
        { cle: 'Photo', type: 'photo' },
        {
          cle: 'Cadrage',
          type: 'cadrage',
          ratio: 16 / 9,
          aide: 'Déplacez la photo pour choisir ce qui doit être visible.'
        },
        { cle: 'Zoom', type: 'masque' },
        { cle: 'Texte', type: 'long' }
      ]
    },
    {
      type: 'produit',
      rangEditeur: 1,
      etiquette: 'PRODUIT',
      titre: 'Mes produits',
      singulier: 'produit',
      champs: [
        { cle: 'Nom', type: 'texte' },
        { cle: 'Prix', type: 'prix' },
        { cle: 'Rayon', type: 'rayon', aide: 'Crée tout seul le bouton de tri de la boutique.' },
        { cle: 'Photo', type: 'photo' },
        {
          cle: 'Cadrage',
          type: 'cadrage',
          ratio: 1,
          aide: 'Déplacez la photo pour choisir ce qui doit être visible.'
        },
        { cle: 'Zoom', type: 'masque' },
        { cle: 'Étiquette', type: 'texte', aide: 'Petite pastille sur la photo. Laissez vide si inutile.' },
        { cle: 'Autres couleurs', type: 'oui-non' },
        {
          cle: 'Lien boutique',
          type: 'texte',
          aide: 'Adresse de la fiche sur la boutique en ligne. Si elle est remplie, le bouton « Commander » y mène directement.'
        },
        { cle: 'Description', type: 'long' }
      ]
    },
    {
      type: 'service',
      rangEditeur: 2,
      etiquette: 'SERVICE',
      titre: 'Le sur-mesure',
      singulier: 'prestation',
      champs: [
        { cle: 'Titre', type: 'texte' },
        { cle: 'Prix', type: 'texte', aide: 'Par exemple : sur demande, à partir de 19 €.' },
        { cle: 'Description', type: 'long' },
        { cle: 'Point', type: 'liste', aide: 'Une ligne par point.' }
      ]
    },
    {
      type: 'marche',
      rangEditeur: 2.5,
      etiquette: 'MARCHE',
      titre: 'Mes marchés',
      singulier: 'marché',
      champs: [
        { cle: 'Jour', type: 'texte', aide: 'Par exemple : Mercredi.' },
        { cle: 'Horaires', type: 'texte', aide: 'Par exemple : 8h30 - 13h.' },
        { cle: 'Lieu', type: 'texte', aide: 'Le nom de l’endroit, par exemple : Parking Eysses.' },
        { cle: 'Ville', type: 'texte' },
        {
          cle: 'Coordonnées GPS',
          type: 'texte',
          aide:
            'Facultatif, pour un itinéraire plus précis. Sur Google Maps : appui long sur l’endroit exact, ' +
            'puis copier les deux nombres affichés en premier (par exemple 44.612345, 0.745678). ' +
            'Laissé vide, l’itinéraire se fait à partir du lieu et de la ville.'
        }
      ]
    },
    {
      type: 'atelier',
      rangEditeur: 4,
      etiquette: 'ATELIER',
      titre: 'L’atelier',
      unique: true,
      champs: [
        { cle: 'Titre', type: 'texte' },
        { cle: 'Photo', type: 'photo' },
        {
          cle: 'Cadrage',
          type: 'cadrage',
          ratio: 4 / 3,
          aide: 'Déplacez la photo pour choisir ce qui doit être visible.'
        },
        { cle: 'Zoom', type: 'masque' },
        { cle: 'Texte de la photo', type: 'texte', aide: 'Décrit la photo pour les personnes malvoyantes.' },
        { cle: 'Paragraphe', type: 'liste', aide: 'Une ligne vide entre deux paragraphes n’est pas nécessaire.' },
        { cle: 'Savoir-faire', type: 'liste' }
      ]
    }
  ];

  /** Toutes les façons acceptées d'écrire un nom de bloc. */
  var ALIAS_BLOCS = { univers: 'famille', creation: 'produit', marches: 'marche', marche: 'marche' };
  BLOCS.forEach(function (bloc) {
    ALIAS_BLOCS[normalise(bloc.etiquette)] = bloc.type;
  });

  /** Toutes les façons acceptées d'écrire une clé. */
  var ALIAS_CLES = {
    categorie: 'Rayon',
    image: 'Photo',
    mail: 'E-mail',
    courriel: 'E-mail',
    region: 'Département'
  };
  BLOCS.forEach(function (bloc) {
    bloc.champs.forEach(function (champ) {
      ALIAS_CLES[normalise(champ.cle)] = champ.cle;
    });
  });

  function description(type) {
    for (var i = 0; i < BLOCS.length; i++) {
      if (BLOCS[i].type === type) return BLOCS[i];
    }
    return null;
  }

  function estListe(type, cle) {
    var bloc = description(type);
    if (!bloc) return false;
    for (var i = 0; i < bloc.champs.length; i++) {
      if (bloc.champs[i].cle === cle) return bloc.champs[i].type === 'liste';
    }
    return false;
  }

  /* ---------------------------------------------------------
     Lecture
     --------------------------------------------------------- */

  /**
   * Découpe le fichier en blocs `{ type, champs }`.
   * Une valeur peut se poursuivre sur les lignes suivantes tant
   * qu'elles ne commencent pas par une nouvelle clé.
   */
  function lire(texte) {
    var blocs = [];
    var bloc = null;
    var derniereCle = null;

    String(texte || '')
      .split(/\r?\n/)
      .forEach(function (ligne) {
        var brut = ligne.trim();

        if (!brut || brut.charAt(0) === '#') {
          derniereCle = null;
          return;
        }

        var entete = brut.match(/^\[\s*([^\]]+?)\s*\]$/);
        if (entete) {
          var type = ALIAS_BLOCS[normalise(entete[1])];
          bloc = type ? { type: type, champs: {} } : null;
          if (bloc) blocs.push(bloc);
          derniereCle = null;
          return;
        }

        if (!bloc) return;

        var paire = brut.match(/^([^:]{1,40}):\s*(.*)$/);
        if (paire) {
          var cle = ALIAS_CLES[normalise(paire[1])];
          derniereCle = null;
          if (!cle) return;

          var valeur = paire[2].trim();
          if (estListe(bloc.type, cle)) {
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

  /* ---------------------------------------------------------
     Écriture
     --------------------------------------------------------- */

  var ENTETE = [
    '# ============================================================',
    '#   LE CONTENU DU SITE COUTURE & FIL',
    '# ============================================================',
    '#',
    '#   Tout ce qui s’affiche sur le site est écrit ici.',
    '#',
    '#   Le plus simple est de passer par la page « modifier » du',
    '#   site, qui remplit ce fichier toute seule.',
    '#',
    '#   Si vous modifiez ce fichier à la main :',
    '#     - changez le texte APRÈS les deux-points ;',
    '#     - ne changez pas les mots AVANT les deux-points ;',
    '#     - les lignes commençant par # sont des notes ;',
    '#     - un champ laissé vide disparaît simplement du site.',
    '#',
    '# ============================================================',
    ''
  ].join('\n');

  /** Reconstruit le fichier texte à partir des blocs. */
  function ecrire(blocs) {
    var morceaux = [ENTETE];

    BLOCS.forEach(function (modele) {
      var concernes = blocs.filter(function (bloc) {
        return bloc.type === modele.type;
      });
      if (!concernes.length) return;

      morceaux.push('');
      morceaux.push('# --- ' + modele.titre + ' ---');

      concernes.forEach(function (bloc) {
        var lignes = ['', '[' + modele.etiquette + ']'];

        modele.champs.forEach(function (champ) {
          var valeur = bloc.champs[champ.cle];

          if (champ.type === 'liste') {
            (Array.isArray(valeur) ? valeur : []).forEach(function (element) {
              if (String(element).trim()) lignes.push(champ.cle + ': ' + String(element).trim());
            });
            return;
          }

          var texte = valeur == null ? '' : String(valeur).trim();
          // Une valeur sur plusieurs lignes casserait la relecture.
          texte = texte.replace(/\s*\n\s*/g, ' ');
          lignes.push(champ.cle + ':' + (texte ? ' ' + texte : ''));
        });

        morceaux.push(lignes.join('\n'));
      });
    });

    return morceaux.join('\n') + '\n';
  }

  /**
   * Ordre d'affichage dans le formulaire de modification : ce qui
   * change le plus souvent (les produits) arrive en premier. L'ordre
   * du fichier, lui, reste celui de BLOCS.
   */
  function blocsPourEditeur() {
    return BLOCS.slice().sort(function (a, b) {
      return (a.rangEditeur || 99) - (b.rangEditeur || 99);
    });
  }

  var API = {
    BLOCS: BLOCS,
    blocsPourEditeur: blocsPourEditeur,
    normalise: normalise,
    description: description,
    lire: lire,
    ecrire: ecrire
  };

  // Dans le navigateur (site, page « modifier ») ; en Node (fonction
  // Vercel api/checkout.js, pour relire les prix depuis le serveur).
  if (typeof window !== 'undefined') window.ContenuFormat = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})();
