# Couture & Fil — site de démonstration

Maquette d'un site vitrine pour **Couture & Fil**, l'atelier de Françoise à Monflanquin
(Lot-et-Garonne) : peluches et amigurumis au crochet, doudous en tissu, bijoux et accessoires
faits main.

Le site est une **démonstration** : le panier fonctionne mais ne déclenche aucun paiement, et le
formulaire de contact n'envoie rien. Les commandes réelles passent toujours par la boutique
existante : <https://couturefil.sumupstore.com/>

## Ce qu'il contient

- une page unique avec cinq sections : accueil, univers, boutique, sur-mesure, atelier, contact ;
- un catalogue filtrable par catégorie (peluches & doudous, bijoux, zéro déchet) ;
- un panier de démonstration (ajout, quantités, total, persistance dans le navigateur) ;
- un formulaire de contact avec validation, sans envoi ;
- aucune dépendance, aucun build, aucune requête vers un service externe.

## Modifier le contenu

### La façon simple : la page « Modifier »

Ouvrir **[modifier.html](modifier.html)** (lien « Modifier le site » en bas de chaque page).
C'est un formulaire : on change les textes et les prix dans de grandes cases, on ajoute ou on
supprime un produit avec un bouton.

- **👁 Voir le résultat** ouvre le site tel qu'il sera, avec les modifications et les photos pas
  encore envoyées. Un bandeau vert rappelle que rien n'est publié. Le vrai site n'est pas touché.
- **📷 Choisir une photo…** prend une photo de l'ordinateur ou du téléphone et la réduit
  automatiquement (900 px, quelques dizaines de Ko) : aucun logiciel de retouche n'est nécessaire.
- **✓ Enregistrer** affiche les deux clics restants : un bouton copie les modifications *et* ouvre
  la bonne page GitHub, il reste à coller et valider. Les nouvelles photos sont listées à part,
  avec leur bouton de téléchargement et le lien vers la page où les déposer.

Aucun code n'est visible, et le travail en cours est gardé automatiquement sur l'ordinateur tant
qu'il n'est pas enregistré.

### La façon directe : le fichier texte

Tout le contenu vit dans **`contenu.txt`**, à la racine du dépôt, en français :

```
[PRODUIT]
Nom: Polo, le lapin au crochet
Prix: 21
Rayon: Peluches & doudous
Photo: polo.avif
Description: Petit lapin blanc au pull vert…
```

On modifie le texte après les deux-points. Le lecteur est volontairement tolérant : accents
oubliés, majuscules, espaces en trop, deux-points manquants, lignes inconnues, champs ou blocs
vides — rien de tout cela n'empêche le site de s'afficher. Les rayons de la boutique se déduisent
tout seuls des produits ; il n'y a aucune liste de catégories à tenir à jour.

`assets/js/content.js` ne sert plus que de filet de sécurité si `contenu.txt` devenait
introuvable. Les points restant à confirmer :

- le paragraphe de présentation (le PDF source coupait le début de chaque ligne) ;
- l'e-mail, le téléphone, l'adresse et les horaires (absents de la source) ;
- les liens Facebook / Instagram ;
- la photo des boucles d'oreilles « Bleu Nuit » (illisible dans le PDF) — une vignette de repli
  s'affiche à la place ;
- les prestations et tarifs de la section « Sur mesure », qui ne figuraient pas sur la boutique.

Pour ajouter une photo : déposer le fichier dans `assets/img/`, puis écrire son nom seul sur la
ligne `Photo:` (par exemple `Photo: lapin.jpg`).

## Lancer en local

```bash
python3 -m http.server 4173
# puis ouvrir http://localhost:4173
```

Aucune installation n'est nécessaire : le site est un ensemble de fichiers statiques.

## Structure

```
index.html               structure de la page
assets/css/styles.css    design (couleurs, composants, responsive, thème sombre)
assets/js/content.js     CONTENU — le seul fichier à éditer au quotidien
assets/js/app.js         rendu, filtres, panier, formulaire
assets/img/              photos et logo
vercel.json              configuration du déploiement statique
```

## Déploiement

Le site est statique : il n'y a aucune étape de build.

**GitHub Pages** — le dépôt est déjà configuré en « Deploy from a branch » sur `main`. Fusionner
la branche de démo dans `main` suffit à publier le site sur
<https://teambull31.github.io/fran-oise/> (le fichier `.nojekyll` évite tout traitement Jekyll).

**Vercel** — importer le dépôt depuis <https://vercel.com/new> : framework « Other », aucune
commande de build, répertoire racine `./`. Le fichier `vercel.json` fournit déjà les en-têtes de
cache et de sécurité. Chaque push redéploie ensuite automatiquement.

## Origine des visuels

Les photos et le logo proviennent de la boutique Couture & Fil et appartiennent à l'atelier. Deux
visuels de catégorie sont des recadrages d'images partiellement chargées dans le PDF source : ils
gagneront à être remplacés par les fichiers d'origine.
