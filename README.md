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

## Accès réservé à Françoise

Deux choses ne sont visibles que pour Françoise, jamais pour les visiteurs du site : le lien
« ✎ Modifier le site » en pied de page, et le bouton « 📱 Installer l'application ». Elles sont
protégées par un code d'accès (un seul, propre à ce site), demandé à l'ouverture de
[modifier.html](modifier.html) tant qu'il n'a pas déjà été saisi sur l'appareil. Une fois entré, il
reste mémorisé sur cet appareil (dans le navigateur) et débloque aussi les deux éléments sur la page
d'accueil. Le bouton « Se déconnecter », en haut de la page « Modifier », l'efface — utile sur un
ordinateur partagé.

Le site étant statique (sans serveur), ce n'est pas une vraie sécurité : c'est seulement une façon
de garder ces deux fonctions hors de vue du grand public. Le code lui-même n'est écrit nulle part
dans le dépôt, seulement son empreinte, dans `assets/js/admin.js` — la marche à suivre pour le
changer s'y trouve en commentaire.

## Application pour téléphone

Le site est **installable** : sur Android, le navigateur propose lui-même l'installation (le bouton
« 📱 Installer l'application » apparaît en bas de page, une fois le code d'accès saisi) ; sur iPhone
et iPad, le même bouton explique les deux gestes à faire (Partager → « Sur l'écran d'accueil »).

Une fois installée, l'application a son icône sur l'écran d'accueil, s'ouvre en plein écran sans
barre d'adresse, et **fonctionne sans réseau** : textes et photos déjà consultés restent
consultables. Vérifié en coupant la connexion — les huit fiches et leurs photos s'affichent encore.

Ce n'est pas une application de magasin d'applications : pas de compte développeur, pas de frais
annuels, pas de validation à chaque modification. C'est le site lui-même, et il se met à jour tout
seul à chaque publication.

Deux stratégies de cache cohabitent dans `sw.js` : le **réseau d'abord** pour les textes (un prix
modifié ne doit jamais rester périmé) et le **cache d'abord** pour les images, styles et scripts.
Après une modification du code du site, incrémenter `VERSION` en tête de `sw.js`.

## Modifier le contenu

### La façon simple : la page « Modifier »

Ouvrir **[modifier.html](modifier.html)** (lien « Modifier le site » en bas de chaque page, une fois
le code d'accès saisi — voir « Accès réservé à Françoise » plus haut). C'est un formulaire : on
change les textes et les prix dans de grandes cases, on ajoute ou on supprime un produit avec un
bouton.

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

## Encaisser sans la boutique SumUp

Le compte SumUp et le terminal de paiement sont gratuits et indépendants de la boutique en ligne :
celle-ci peut être résiliée sans rien changer aux encaissements sur les marchés.

Le site s'adapte alors tout seul, selon ce qui est renseigné dans `[BOUTIQUE]` :

| Renseigné | Bouton du panier | Parcours |
| --- | --- | --- |
| `Boutique en ligne` | « Aller à la boutique » | paiement sur la boutique SumUp |
| `E-mail` seul | « Envoyer ma demande » | le client envoie sa sélection, Françoise répond avec un lien de paiement SumUp |
| Ni l'un ni l'autre | aucun | le récapitulatif invite à prendre contact |

Le message de demande est pré-rempli avec les pièces choisies, les quantités et le total : il ne
reste qu'à créer le lien de paiement depuis l'application SumUp, sur le même compte que le
terminal.

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
manifest.webmanifest     déclaration de l'application installable
sw.js                    fonctionnement hors connexion
contenu.txt              CONTENU — le seul fichier à éditer au quotidien
modifier.html            formulaire de modification et publication
assets/css/styles.css    design (couleurs, composants, responsive)
assets/js/contenu-format.js  format du fichier contenu.txt (lecture / écriture)
assets/js/contenu.js     chargement du contenu et mode aperçu
assets/js/content.js     contenu de secours
assets/js/admin.js       code d'accès réservé à Françoise
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

## Contrastes

Les couleurs ont été mesurées selon le critère WCAG AA (4,5:1 en texte courant, 3:1 en grand
texte). Deux jeux de teintes coexistent volontairement :

- `--grad-warm` (orange vif → rose vif) reste pour la décoration : taches floues de l'accueil,
  liseré du pied de page, bordure des cartes « sur mesure ». Aucun texte ne repose dessus.
- `--grad-warm-texte` (orange profond → framboise) porte tout ce qui contient du texte : boutons
  principaux, bandeau d'annonce, pastille du panier, mots en couleur du grand titre. Le dégradé vif
  n'offrait que **2,35:1** avec du blanc ; celui-ci donne **5,18:1 à 7,65:1**.

Même logique pour `--sky-text` et `--mint-text`, versions assombries du bleu et du menthe destinées
au petit texte.

## Origine des visuels

Les photos et le logo proviennent de la boutique Couture & Fil et appartiennent à l'atelier. Deux
visuels de catégorie sont des recadrages d'images partiellement chargées dans le PDF source : ils
gagneront à être remplacés par les fichiers d'origine.
