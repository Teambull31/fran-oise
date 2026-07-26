# Couture & Fil — site vitrine

Site vitrine de **Couture & Fil**, l'atelier de Françoise à Monflanquin (Lot-et-Garonne) :
peluches et amigurumis au crochet, doudous en tissu, bijoux et accessoires faits main.

Le paiement se fait sur la boutique en ligne existante
(<https://couturefil.sumupstore.com/>) : le site présente les créations, prépare la commande et
renvoie vers la boutique pour le règlement sécurisé.

## Ce qu'il contient

- une page unique : accueil, univers, boutique, sur-mesure, atelier, contact ;
- un catalogue filtrable, dont les rayons se déduisent des produits ;
- un panier (ajout, quantités, total, mémorisé dans le navigateur) qui prépare la commande et
  renvoie vers la boutique en ligne pour le paiement ;
- un bouton « Commander » qui mène directement à la fiche produit si son adresse est renseignée ;
- un formulaire de contact qui ouvre le logiciel de courrier avec le message prêt ;
- un bandeau d'annonce facultatif en haut de page (« Atelier fermé du 1er au 15 août ») ;
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
- **Cadrage** : sous chaque photo, un cadre montre exactement ce que verront les visiteurs. On y
  fait glisser la photo au doigt ou à la souris (les flèches du clavier fonctionnent aussi), et le
  curseur « Agrandir » zoome jusqu'à trois fois. « Recentrer » remet tout à zéro. Le cadre a la
  forme réelle de l'emplacement : carré pour un produit, panoramique pour une famille.
  Le réglage se fait aussi entièrement au clavier : les flèches déplacent la photo, et le volet
  « Réglage précis » offre deux curseurs (gauche/droite, haut/bas) pour ceux qui ne peuvent pas
  faire glisser. Les valeurs sont annoncées aux lecteurs d'écran.
- **Vérification** : au moment d'enregistrer, la page liste ce qui cloche — produit sans prix,
  sans photo, sans description ou sans rayon, famille vide, photo dont le nom ne correspond à aucun
  fichier du site. Rien n'est bloquant : on peut publier quand même.
- **✓ Enregistrer** puis **🚀 Publier maintenant** envoie tout — textes et photos — directement.
  La page vérifie ensuite toute seule que la mise à jour est bien en ligne et affiche
  « ✓ C'est en ligne » quand c'est le cas.
- **↶ Annuler** revient sur la dernière suppression, le dernier ajout ou le dernier déplacement
  (jusqu'à trente en arrière). Le bouton indique ce qui sera annulé.

Les sections sont classées par fréquence de modification : les produits d'abord, le nom de la
boutique en dernier. Un sommaire en haut permet de sauter directement à une partie.

#### Régler la publication en un clic (une seule fois)

La publication directe a besoin d'un jeton GitHub, à créer une fois puis à coller dans la page
(bouton « Publier en un clic (à régler une fois) ») :

1. <https://github.com/settings/personal-access-tokens/new>
2. Repository access → **Only select repositories** → `Teambull31/fran-oise`
3. Permissions → Repository permissions → **Contents : Read and write**

Le jeton reste dans le navigateur de la personne (`localStorage`) et n'est envoyé qu'à l'API
GitHub. Il donne le droit d'écrire dans ce dépôt : il ne doit pas être partagé, et le bouton
« Oublier ce code » l'efface. Tant qu'aucun jeton n'est réglé, la page propose la méthode manuelle
(copier / coller sur GitHub), qui reste disponible en repli.

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
introuvable.

## À renseigner avant la mise en service

Le site fonctionne sans, mais ces informations manquent pour qu'il soit complet. Tant qu'un champ
est vide, la ligne correspondante disparaît simplement du site — rien ne s'affiche à moitié.

| À remplir | Où | Sans cela |
| --- | --- | --- |
| E-mail | `[BOUTIQUE]` → `E-mail` | le formulaire de contact est remplacé par un renvoi vers la boutique |
| Téléphone, adresse | `[BOUTIQUE]` | les lignes n'apparaissent pas dans « Contact » |
| Facebook, Instagram | `[BOUTIQUE]` | pas de liens en pied de page |
| Adresse de chaque fiche produit | `[PRODUIT]` → `Lien boutique` | le bouton ajoute au panier au lieu de mener à la fiche |
| Mentions légales et CGV | pied de page | les liens renvoient à la boutique SumUp |

Deux textes restent à vérifier avec Françoise :

- le paragraphe de présentation, reconstitué à partir d'une source dont le début de chaque ligne
  était coupé ;
- les trois prestations de la section « Sur mesure », qui ne figuraient pas sur la boutique.

Enfin, la photo des boucles d'oreilles « Bleu Nuit » était illisible dans la source : une vignette
« Photo à venir » s'affiche à la place, jusqu'à ce qu'une photo soit envoyée depuis la page
« Modifier ».

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
contenu.txt              CONTENU — le seul fichier à éditer au quotidien
modifier.html            formulaire de modification et publication
assets/css/styles.css    design (couleurs, composants, responsive)
assets/js/contenu-format.js  format du fichier contenu.txt (lecture / écriture)
assets/js/contenu.js     chargement du contenu et mode aperçu
assets/js/content.js     contenu de secours
assets/js/app.js         rendu, filtres, panier, formulaire
assets/img/              photos et logo
vercel.json              configuration du déploiement statique
```

## Déploiement

Le site est statique : il n'y a aucune étape de build.

**GitHub Pages** — le dépôt est configuré en « Deploy from a branch » sur `main`. Tout ce qui est
fusionné dans `main` est publié sur
<https://teambull31.github.io/fran-oise/> (le fichier `.nojekyll` évite tout traitement Jekyll).

**Vercel** — importer le dépôt depuis <https://vercel.com/new> : framework « Other », aucune
commande de build, répertoire racine `./`. Le fichier `vercel.json` fournit déjà les en-têtes de
cache et de sécurité. Chaque push redéploie ensuite automatiquement.

## Origine des visuels

Les photos et le logo proviennent de la boutique Couture & Fil et appartiennent à l'atelier. Deux
visuels de catégorie sont des recadrages d'images partiellement chargées dans le PDF source : ils
gagneront à être remplacés par les fichiers d'origine.
