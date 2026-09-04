/* =========================================================
   Couture & Fil — prix officiels du catalogue (côté serveur)

   api/checkout.js ne doit jamais faire confiance au montant envoyé
   par le navigateur (un visiteur malveillant pourrait le modifier
   avant l'envoi et payer moins cher que le vrai prix). Ce fichier
   relit contenu.txt — la même source que le site — pour recalculer
   le total à partir des vrais prix, avec la même logique
   d'identifiant que assets/js/contenu.js (product.id).

   Préfixé par « _ » : Vercel ne le publie pas comme route de l'API,
   c'est un simple module partagé par api/checkout.js.
   ========================================================= */

var Format = require('../assets/js/contenu-format.js');

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

/** Identifiant technique stable, déduit du nom. Identique à contenu.js. */
function identifiant(nom, secours) {
  return Format.normalise(nom).replace(/\s+/g, '-') || secours;
}

/** { id: { nom, prix } } pour chaque produit publié dans contenu.txt. */
function catalogue(texteContenu) {
  var blocs = Format.lire(texteContenu);
  var parProduit = {};
  blocs
    .filter(function (bloc) {
      return bloc.type === 'produit' && String(bloc.champs['Nom'] || '').trim();
    })
    .forEach(function (bloc, index) {
      var id = identifiant(bloc.champs['Nom'], 'produit-' + index);
      parProduit[id] = { nom: String(bloc.champs['Nom']).trim(), prix: prix(bloc.champs['Prix']) };
    });
  return parProduit;
}

/**
 * Relit les vraies lignes du panier (id + quantité) envoyées par le
 * client à la lumière du catalogue, en ignorant tout prix ou nom qu'il
 * aurait pu joindre. Renvoie null si une ligne référence un produit
 * introuvable (catalogue changé entre-temps, ou tentative de triche) —
 * le paiement est alors refusé plutôt que de deviner un prix.
 */
function detailLignes(texteContenu, lignes) {
  var parProduit = catalogue(texteContenu);
  var resultat = [];

  for (var i = 0; i < lignes.length; i++) {
    var ligne = lignes[i];
    var quantite = Math.round(Number(ligne && ligne.qty));
    var id = ligne && String(ligne.id || '');
    if (!id || !(quantite > 0) || !(id in parProduit)) return null;
    resultat.push({ id: id, nom: parProduit[id].nom, prix: parProduit[id].prix, qty: quantite });
  }

  return resultat;
}

/** Total, arrondi au centime, à partir des mêmes lignes vérifiées. */
function calculerTotal(texteContenu, lignes) {
  var detail = detailLignes(texteContenu, lignes);
  if (!detail) return null;
  var total = detail.reduce(function (somme, ligne) {
    return somme + ligne.prix * ligne.qty;
  }, 0);
  return Math.round(total * 100) / 100;
}

module.exports = { calculerTotal: calculerTotal, detailLignes: detailLignes };
