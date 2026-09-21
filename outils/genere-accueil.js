#!/usr/bin/env node
/* =========================================================
   Couture & Fil — écrit le contenu de l'accueil dans index.html

   POURQUOI CE FICHIER EXISTE

   Le site s'affiche à partir de contenu.txt, lu par le navigateur
   (assets/js/contenu.js). C'est ce qui permet à Françoise de tout
   modifier depuis la page « modifier », sans rien installer.

   Mais Google, lui, lit d'abord la page telle qu'elle arrive du
   serveur, avant d'exécuter le moindre JavaScript. Il y trouvait
   une coquille vide : pas un produit, pas un prix, pas un marché,
   et à la place des créations la phrase « Aucune création dans
   cette catégorie. » Une page aussi maigre, sur un domaine tout
   neuf, n'est pas indexée.

   Ce script recopie donc le contenu de contenu.txt directement
   dans index.html, entre des balises repères. Le JavaScript
   continue de tout réafficher au chargement : ce qui est écrit
   ici n'est qu'un point de départ, jamais la version qui fait foi.

   USAGE
     npm run contenu          (regénère index.html)
     npm run contenu -- --verifie   (échoue si index.html est périmé)

   Le workflow .github/workflows/accueil-statique.yml le lance tout
   seul dès que contenu.txt change sur main.
   ========================================================= */

'use strict';

var fs = require('fs');
var path = require('path');
var Format = require('../assets/js/contenu-format.js');

var RACINE = path.join(__dirname, '..');
var FICHIER_CONTENU = path.join(RACINE, 'contenu.txt');
var FICHIER_PAGE = path.join(RACINE, 'index.html');
var DOSSIER_PHOTOS = 'assets/img/';

var euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

/* ---------------------------------------------------------
   Lecture de contenu.txt

   Ces fonctions reprennent une à une celles de
   assets/js/contenu.js : les deux doivent produire exactement
   les mêmes données, sinon la page livrée au robot ne
   ressemblerait pas à celle que voient les visiteuses.
   --------------------------------------------------------- */

/** « 54 », « 54,00 € », « 54.5 » → nombre. Identique à contenu.js. */
function prix(valeur) {
  if (!valeur) return 0;
  var nombre = parseFloat(
    String(valeur)
      .replace(/[^0-9,.]/g, '')
      .replace(',', '.')
  );
  return isNaN(nombre) ? 0 : nombre;
}

/** Accepte « lapin.jpg », « assets/img/lapin.jpg » ou une adresse web. Identique à contenu.js. */
function photo(valeur) {
  var nom = String(valeur || '').trim();
  if (!nom) return '';
  if (/^(https?:)?\/\//.test(nom) || nom.indexOf('assets/') === 0) return nom;
  return DOSSIER_PHOTOS + nom.replace(/^\/+/, '');
}

/** Cadrage de la photo dans son cadre. Identique à contenu.js. */
function cadrage(valeur) {
  var brut = String(valeur || '').trim();
  if (/^-?\d+(\.\d+)?%\s+-?\d+(\.\d+)?%$/.test(brut)) return brut;
  var mot = Format.normalise(brut);
  if (mot.indexOf('bas') === 0) return '50% 100%';
  if (mot.indexOf('haut') === 0) return '50% 0%';
  return '50% 50%';
}

/** Agrandissement de la photo dans son cadre. Identique à contenu.js. */
function zoom(valeur) {
  var nombre = parseFloat(String(valeur || '').replace(',', '.'));
  if (isNaN(nombre)) return 1;
  return Math.min(4, Math.max(1, nombre));
}

/** Identique à contenu.js. */
function vraiFaux(valeur) {
  var mot = Format.normalise(valeur);
  return mot === 'oui' || mot === 'o' || mot === 'yes' || mot === 'x' || mot === 'vrai';
}

/** Identifiant technique stable, déduit du nom. Identique à contenu.js. */
function identifiant(nom, secours) {
  return Format.normalise(nom).replace(/\s+/g, '-') || secours;
}

/** Identique à contenu.js. */
function reperMarche(gps, lieu, ville) {
  var coordonnees = String(gps || '').match(/(-?\d+(?:[.,]\d+)?)\s*[,;]\s*(-?\d+(?:[.,]\d+)?)/);
  return coordonnees
    ? coordonnees[1].replace(',', '.') + ',' + coordonnees[2].replace(',', '.')
    : [String(lieu || '').trim(), String(ville || '').trim()].filter(Boolean).join(', ');
}

/** Identique à contenu.js. */
function itineraire(gps, lieu, ville) {
  var repere = reperMarche(gps, lieu, ville);
  if (!repere) return '';
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(repere);
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

/** Mêmes données que window.CONTENT côté navigateur. Calque de construire() dans contenu.js. */
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

  return {
    shop: {
      name: b['Nom'] || 'Couture & Fil',
      tagline: b['Description'] || '',
      heroTitle: b['Grand titre'] || b['Description'] || '',
      heroHighlight: b['Mots en couleur'] || '',
      intro: [b['Phrase d’accueil'] || ''],
      city: b['Ville'] || '',
      region: b['Département'] || '',
      sumupUrl: String(b['Boutique en ligne'] || '').trim(),
      email: b['E-mail'] || '',
      phone: b['Téléphone'] || '',
      address: b['Adresse'] || '',
      hours: [],
      legalLinks: [
        { label: 'Mentions légales', url: 'mentions-legales.html' },
        { label: 'Conditions générales de vente', url: 'cgv.html' }
      ]
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
          mapUrl: itineraire(m['Coordonnées GPS'], m['Lieu'], m['Ville'])
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
    }
  };
}

/* ---------------------------------------------------------
   Fabrication du HTML

   Le balisage reproduit celui que construit assets/js/app.js,
   à une exception près : la classe « reveal » est omise. Elle
   met l'élément à opacity:0 en attendant que le JavaScript le
   fasse apparaître ; sans JavaScript, tout resterait invisible.
   --------------------------------------------------------- */

/**
 * Un élément par ligne. Sans ça, les huit fiches produit tiendraient sur
 * une seule ligne de 4 500 caractères : le moindre changement de prix
 * réécrirait la ligne entière, et personne ne verrait ce qui a bougé.
 * Les espaces ainsi introduits ne changent rien à l'affichage (une suite
 * d'espaces seuls n'est pas rendue dans une grille CSS).
 */
function lignes(elements) {
  return elements.length ? '\n' + elements.join('\n') + '\n' : '';
}

/** Échappe le texte destiné au corps d'une balise. */
function txt(valeur) {
  return String(valeur == null ? '' : valeur)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Échappe le texte destiné à la valeur d'un attribut. */
function att(valeur) {
  return txt(valeur).replace(/"/g, '&quot;');
}

/** Premier emoji du nom d'un produit. Identique à app.js. */
function leadEmoji(nom) {
  var trouve = String(nom).match(/^\s*([\p{Extended_Pictographic}]+)/u);
  return trouve ? trouve[1] : '🧶';
}

/** Retire les emoji du texte de remplacement d'une image. Identique à app.js. */
function sansEmoji(texte) {
  return String(texte || '')
    .replace(/[\p{Extended_Pictographic}️]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Attribut style reprenant le cadrage et le zoom choisis. Équivaut à cadrerPhoto() d'app.js. */
function stylePhoto(source) {
  var regles = [];
  if (source.focus) regles.push('object-position:' + source.focus);
  if (source.zoom && source.zoom !== 1) regles.push('--zoom:' + source.zoom);
  return regles.length ? ' style="' + att(regles.join(';')) + '"' : '';
}

function heroTitre(C) {
  var titre = C.shop.heroTitle || C.shop.tagline;
  var phrase = C.shop.heroHighlight;
  var index = phrase ? titre.indexOf(phrase) : -1;
  if (index === -1) return txt(titre);
  return (
    txt(titre.slice(0, index)) +
    '<em>' + txt(phrase) + '</em>' +
    txt(titre.slice(index + phrase.length))
  );
}

function heroChiffres(C) {
  return lignes(
    C.highlights.map(function (item) {
      return '<li><strong>' + txt(item.value) + '</strong><span>' + txt(item.label) + '</span></li>';
    })
  );
}

function univers(C) {
  return C.universes
    .filter(function (universe) {
      return C.categories.some(function (categorie) {
        return categorie.id === universe.id;
      });
    })
    .map(function (u) {
      return (
        '<button class="universe-card" type="button">' +
        '<div class="media"><img src="' + att(u.image) + '" alt="' + att(sansEmoji(u.title)) +
        '" loading="lazy" width="1200" height="675"' + stylePhoto(u) + ' /></div>' +
        '<div class="body"><h3>' + txt(u.title) + '</h3><p>' + txt(u.text) + '</p>' +
        '<span class="more">Voir les pièces →</span></div>' +
        '</button>'
      );
    })
    .join('\n');
}

function filtres(C) {
  return C.categories
    .map(function (categorie) {
      return (
        '<button class="filter" type="button" data-category="' + att(categorie.id) +
        '" aria-pressed="' + (categorie.id === 'all' ? 'true' : 'false') + '">' +
        txt(categorie.label) + '</button>'
      );
    })
    .join('\n');
}

function fiche(produit) {
  var media = '<div class="product-media">';
  if (produit.image) {
    media +=
      '<img src="' + att(produit.image) + '" alt="' + att(sansEmoji(produit.name)) +
      '" loading="lazy" width="900" height="900"' + stylePhoto(produit) + ' />';
  } else {
    media +=
      '<div class="placeholder"><span>' + txt(leadEmoji(produit.name)) +
      '</span><span>Photo à venir</span></div>';
  }
  if (produit.badge) media += '<span class="badge">' + txt(produit.badge) + '</span>';
  media += '</div>';

  var corps = '<div class="product-body"><h3>' + txt(produit.name) + '</h3>';
  if (produit.variants) corps += '<p class="variants-note">Autres variantes disponibles</p>';
  corps += '<p>' + txt(produit.description) + '</p>';

  // Un prix à 0 (champ vide, ou « sur demande ») renvoie vers le contact
  // plutôt que vers un paiement que le serveur refuserait. Même règle qu'app.js.
  var vendable = produit.price > 0;
  corps += '<div class="product-foot"><span class="price">' +
    txt(vendable ? euro.format(produit.price) : 'Prix sur demande') + '</span>';

  if (!vendable) {
    corps +=
      '<a class="add-button" href="#contact" aria-label="Demander le prix de ' +
      att(sansEmoji(produit.name)) + '">Demander</a>';
  } else if (produit.shopUrl) {
    corps +=
      '<a class="add-button" href="' + att(produit.shopUrl) + '" rel="noopener" aria-label="Commander ' +
      att(sansEmoji(produit.name)) + ' sur la boutique">Commander</a>';
  } else {
    // Sans JavaScript le panier n'existe pas : le bouton est présent pour
    // que la fiche soit complète, et devient actif dès qu'app.js s'exécute.
    corps += '<button class="add-button" type="button">Ajouter</button>';
  }
  corps += '</div></div>';

  return '<article class="product-card">' + media + corps + '</article>';
}

function produits(C) {
  var cartes = C.products.map(fiche);
  return lignes(cartes);
}

function services(C) {
  return C.services
    .map(function (s) {
      var points = s.points
        .map(function (point) {
          return '<li>' + txt(point) + '</li>';
        })
        .join('');
      return (
        '<article class="service-card"><h3>' + txt(s.title) + '</h3>' +
        '<span class="service-price">' + txt(s.price) + '</span>' +
        '<p>' + txt(s.description) + '</p><ul>' + points + '</ul></article>'
      );
    })
    .join('\n');
}

function marches(C) {
  return C.markets
    .map(function (m) {
      var carte = '<article class="market-card">';
      if (m.day) carte += '<span class="market-day">' + txt(m.day) + '</span>';
      // Le bouton « Afficher la carte » n'a de sens qu'avec le JavaScript
      // (il charge une iframe Google Maps au clic) : il n'est pas repris ici.
      var lieu = [m.place, m.city].filter(Boolean).join(', ');
      if (lieu) carte += '<p class="market-place">' + txt(lieu) + '</p>';
      if (m.hours) carte += '<p class="market-hours">' + txt(m.hours) + '</p>';
      if (m.mapUrl) {
        carte +=
          '<a class="market-link" href="' + att(m.mapUrl) +
          '" target="_blank" rel="noopener">📍 Voir l’itinéraire</a>';
      }
      return carte + '</article>';
    })
    .join('\n');
}

function atelierTexte(C) {
  return C.about.paragraphs
    .map(function (p) {
      return '<p>' + txt(p) + '</p>';
    })
    .join('\n');
}

function atelierSavoirFaire(C) {
  return C.about.skills
    .map(function (s) {
      return '<li>' + txt(s) + '</li>';
    })
    .join('\n');
}

function atelierImage(C) {
  return (
    '<img id="about-image" src="' + att(C.about.image) + '" alt="' + att(C.about.imageAlt) +
    '" width="680" height="630" loading="lazy"' + stylePhoto(C.about) + ' />'
  );
}

/** Mêmes lignes que renderContact() d'app.js. */
function contact(C) {
  var infos = [];
  infos.push({
    icon: '📍',
    label: 'L’atelier',
    value: [C.shop.address, C.shop.city + ' (' + C.shop.region + ')'].filter(Boolean).join(' — ')
  });
  if (C.shop.email) infos.push({ icon: '✉️', label: 'E-mail', value: C.shop.email });
  if (C.shop.phone) infos.push({ icon: '📞', label: 'Téléphone', value: C.shop.phone });
  if (C.shop.sumupUrl) {
    infos.push({
      icon: '🛍️',
      label: 'Boutique en ligne',
      value: C.shop.sumupUrl.replace(/^https?:\/\//, '')
    });
  }
  return infos
    .map(function (info) {
      return (
        '<li><span class="ico">' + txt(info.icon) + '</span>' +
        '<div><strong>' + txt(info.label) + '</strong><span>' + txt(info.value) + '</span></div></li>'
      );
    })
    .join('\n');
}

function liensPied(C) {
  return [{ label: 'Contactez-nous', url: '#contact' }]
    .concat(C.shop.legalLinks || [])
    .map(function (lien) {
      var rel = lien.url.indexOf('http') === 0 ? ' rel="noopener"' : '';
      return '<a href="' + att(lien.url) + '"' + rel + '>' + txt(lien.label) + '</a>';
    })
    .join('\n');
}

/* ---------------------------------------------------------
   Injection dans index.html
   --------------------------------------------------------- */

/** Ce que chaque repère de index.html doit contenir. */
function zones(C) {
  // entoure() ajoute le saut de ligne d'ouverture et de fermeture autour
  // des zones qui contiennent une liste d'éléments.
  function entoure(html) {
    return html ? '\n' + html + '\n' : '';
  }
  return {
    'hero-accroche': txt(C.shop.name + ' · ' + C.shop.city + ' (' + C.shop.region + ')'),
    'hero-titre': heroTitre(C),
    'hero-phrase': txt(C.shop.intro[0]),
    'hero-chiffres': heroChiffres(C),
    univers: entoure(univers(C)),
    filtres: entoure(filtres(C)),
    produits: produits(C),
    services: entoure(services(C)),
    marches: entoure(marches(C)),
    'atelier-image': atelierImage(C),
    'atelier-titre': txt(C.about.title),
    'atelier-texte': entoure(atelierTexte(C)),
    'atelier-savoir-faire': entoure(atelierSavoirFaire(C)),
    contact: entoure(contact(C)),
    'pied-accroche': txt(C.shop.tagline),
    'pied-liens': entoure(liensPied(C))
  };
}

/**
 * Remplace ce qui se trouve entre <!--contenu:nom--> et <!--/contenu:nom-->.
 * Un repère absent est une erreur : mieux vaut s'arrêter que livrer une
 * page à laquelle il manquerait la moitié du contenu sans prévenir.
 */
function injecter(page, nom, html) {
  var ouvre = '<!--contenu:' + nom + '-->';
  var ferme = '<!--/contenu:' + nom + '-->';
  var debut = page.indexOf(ouvre);
  var fin = page.indexOf(ferme);
  if (debut === -1 || fin === -1 || fin < debut) {
    throw new Error('Repère « ' + nom + ' » introuvable dans index.html');
  }
  return page.slice(0, debut + ouvre.length) + html + page.slice(fin);
}

function main() {
  var verifie = process.argv.includes('--verifie');

  var C = construire(fs.readFileSync(FICHIER_CONTENU, 'utf8'));
  var avant = fs.readFileSync(FICHIER_PAGE, 'utf8');
  var apres = avant;

  var contenus = zones(C);
  Object.keys(contenus).forEach(function (nom) {
    apres = injecter(apres, nom, contenus[nom]);
  });

  if (apres === avant) {
    console.log('index.html est déjà à jour.');
    return;
  }

  if (verifie) {
    console.error(
      'index.html ne correspond plus à contenu.txt.\n' +
        'Lancez « npm run contenu » et ajoutez index.html au commit.'
    );
    process.exit(1);
  }

  fs.writeFileSync(FICHIER_PAGE, apres);
  console.log(
    'index.html mis à jour : ' +
      C.products.length + ' produits, ' +
      C.universes.length + ' familles, ' +
      C.markets.length + ' marchés, ' +
      C.services.length + ' prestations.'
  );
}

main();
