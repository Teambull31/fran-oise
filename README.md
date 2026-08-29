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
  propose de payer directement par carte, sans passer par un autre site ;
- un bouton « Commander » qui mène directement à la fiche produit si son adresse est renseignée ;
- un formulaire de contact qui ouvre le logiciel de courrier avec le message prêt ;
- un bandeau d'annonce facultatif en haut de page (« Atelier fermé du 1er au 15 août ») ;
- une section « Les marchés » qui liste les marchés où trouver l'atelier itinérant, avec un aperçu
  de carte et un lien d'itinéraire vers chacun ;
- pas de dépendance, pas de build ; deux exceptions : ces aperçus de carte (Google Maps intégré),
  et le paiement par carte, qui a besoin d'une petite fonction serveur (voir « Payer directement
  sur le site »).

## Accès réservé à Françoise

Sur la page d'accueil, la seule chose qui distingue Françoise d'une visiteuse est un lien discret
en bas de page, « 🔒 Espace de Françoise » : il mène à [modifier.html](modifier.html), protégé par
un code d'accès (un seul, propre à ce site), demandé tant qu'il n'a pas déjà été saisi sur
l'appareil. C'est la seule porte d'entrée sur la page commune — le reste (modifier le site,
installer l'application) vit entièrement sur cette page-là, jamais sur celle que voient les
clientes.

Une fois le code entré, il reste mémorisé sur cet appareil (dans le navigateur) et l'accès à
`modifier.html` reste ouvert. Le bouton « Se déconnecter », en haut de cette page, l'efface — utile
sur un ordinateur partagé.

La saisie ignore les majuscules et les espaces avant/après : une majuscule oubliée ou un espace
collé par erreur (au clavier du téléphone, notamment) ne bloque pas la connexion.

Le site étant statique (sans serveur), ce n'est pas une vraie sécurité : c'est seulement une façon
de garder ces fonctions hors de vue du grand public. Le code lui-même n'est écrit nulle part dans
le dépôt, seulement son empreinte, dans `assets/js/admin.js` — la marche à suivre pour le changer
s'y trouve en commentaire.

## Application pour téléphone

Le site est **installable**, mais uniquement depuis la page « Modifier » (une fois le code d'accès
saisi) : sur Android, le navigateur propose lui-même l'installation (le bouton
« 📱 Installer l'application » apparaît en haut de la page) ; sur iPhone et iPad, le même bouton
explique les deux gestes à faire (Partager → « Sur l'écran d'accueil »).

Une fois installée, l'application a son icône sur l'écran d'accueil, s'ouvre en plein écran sans
barre d'adresse, et **fonctionne sans réseau** : textes et photos déjà consultés restent
consultables. Vérifié en coupant la connexion — les huit fiches et leurs photos s'affichent encore.

Ce n'est pas une application de magasin d'applications : pas de compte développeur, pas de frais
annuels, pas de validation à chaque modification. C'est le site lui-même, et il se met à jour tout
seul à chaque publication.

Deux stratégies de cache cohabitent dans `sw.js` : le **réseau d'abord** pour les textes (un prix
modifié ne doit jamais rester périmé) et le **cache d'abord** pour les images, styles et scripts.
Après une modification du code du site, incrémenter `VERSION` en tête de `sw.js`.

Un onglet resté ouvert continue d'exécuter l'ancien code même après une mise à jour (le service
worker rafraîchit son cache, pas le JavaScript déjà chargé en mémoire) : une fonctionnalité peut
alors sembler cassée alors qu'il suffit de recharger la page. Un bandeau
« Une nouvelle version du site est prête » apparaît automatiquement dans ce cas, avec un bouton
« Actualiser ».

## Modifier le contenu

### La façon simple : la page « Modifier »

Ouvrir **[modifier.html](modifier.html)** (lien « 🔒 Espace de Françoise » en bas de la page
d'accueil, puis le code d'accès — voir « Accès réservé à Françoise » plus haut). C'est un
formulaire : on
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

#### Taille du texte

Dans « Ma boutique », le réglage **Taille du texte** (Normal / Grand / Très grand) agrandit d'un
coup tous les textes du site — utile pour les visiteurs qui lisent difficilement les petits
caractères. Le site étant entièrement dimensionné en unités relatives, ce seul réglage suffit :
titres, boutons, descriptions et espacements s'agrandissent ensemble, sans rien casser dans la
mise en page.

#### Les marchés

Chaque marché a un jour, des horaires, un lieu et une ville : ces quatre champs suffisent à
l'afficher sur le site, avec un aperçu de carte intégré et un lien « Voir l'itinéraire » qui ouvre
Google Maps en recherchant ce lieu. Un cinquième champ, facultatif, **Coordonnées GPS**, permet de
pointer un emplacement plus
précis (utile sur un grand parking) : sur Google Maps, appui long sur l'endroit exact puis copier
les deux nombres affichés en premier (par exemple `44.612345, 0.745678`) et les coller dans ce
champ. Laissé vide, l'itinéraire se base simplement sur le lieu et la ville. Un marché sans jour ni
lieu, ou la suppression de tous les marchés, fait disparaître la section entière du site.

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

## Payer directement sur le site

Le bouton **💳 Payer par carte**, dans le récapitulatif du panier, ouvre la page de paiement
sécurisée de SumUp (créée à la volée pour le montant exact du panier) sans jamais quitter le
site ni passer par l'ancienne boutique SumUp.

SumUp encaisse, mais ne demande ni nom ni adresse : avant le paiement, un petit formulaire
demande donc les coordonnées de livraison (nom, e-mail, adresse), envoyées par e-mail — même
mécanisme que le bouton « Envoyer ma demande ». C'est pour ça que ce bouton n'apparaît que si un
`E-mail` est renseigné dans `[BOUTIQUE]` : sans destinataire, ces coordonnées n'iraient nulle
part.

C'est la seule partie du site qui n'est pas statique : créer un paiement a besoin d'une clé
secrète SumUp, qui ne doit jamais apparaître dans le navigateur ni dans le dépôt. Cette clé vit
dans une petite fonction (`api/checkout.js`), déployée par Vercel, jamais par GitHub Pages — voir
« Réglage du paiement par carte » ci-dessous. Sans cette clé réglée (ou sur GitHub Pages), le
bouton l'indique simplement et propose les autres façons de commander.

### Réglage du paiement par carte (une seule fois)

1. Sur <https://me.sumup.com>, aller dans **Profil → Pour les développeurs → Clés API**, puis
   créer une clé. SumUp ne la montre qu'une fois : la copier tout de suite.
2. Récupérer l'identifiant marchand (`merchant_code`), affiché sur la même page, ou en visitant
   `https://api.sumup.com/v0.1/me` avec la clé (`Authorization: Bearer …`) dans un outil comme
   Postman.
3. Dans le projet Vercel du site : **Settings → Environment Variables**, ajouter :
   - `SUMUP_API_KEY` — la clé créée à l'étape 1 ;
   - `SUMUP_MERCHANT_CODE` — l'identifiant de l'étape 2.
4. Redéployer (un simple push suffit, ou le bouton « Redeploy » de Vercel).

Ces deux valeurs restent uniquement dans les réglages de Vercel : elles ne sont ni dans le dépôt,
ni dans `contenu.txt`, ni visibles par personne d'autre que le compte Vercel.

Limite volontaire de cette première version : le montant envoyé à SumUp vient du panier tel
qu'affiché dans le navigateur (comme le message envoyé par e-mail aujourd'hui) — il n'y a pas de
confirmation automatique de commande après paiement, seulement la notification que SumUp envoie
déjà de son côté. À améliorer plus tard si le volume de commandes le justifie.

## Encaisser sans la boutique SumUp

Le compte SumUp et le terminal de paiement sont gratuits et indépendants de la boutique en ligne
existante (`couturefil.sumupstore.com`) : celle-ci peut être résiliée sans rien changer aux
encaissements sur les marchés ni au paiement par carte ci-dessus.

Le récapitulatif du panier propose alors, selon ce qui est réglé :

| Disponible | Bouton du panier | Parcours |
| --- | --- | --- |
| `E-mail` renseigné + paiement par carte réglé (voir ci-dessus) | « 💳 Payer par carte » | coordonnées de livraison, puis paiement sécurisé directement sur le site |
| `Boutique en ligne` renseignée dans `[BOUTIQUE]` | « Aller à la boutique » | paiement sur l'ancienne boutique SumUp |
| `E-mail` renseigné dans `[BOUTIQUE]` | « Envoyer ma demande » | le client envoie sa sélection, Françoise répond avec un lien de paiement SumUp |
| Rien de ce qui précède | aucun | le récapitulatif invite à prendre contact |

Le message de demande est pré-rempli avec les pièces choisies, les quantités et le total : il ne
reste qu'à créer le lien de paiement depuis l'application SumUp, sur le même compte que le
terminal.

## À renseigner avant la mise en service

Le site fonctionne sans, mais ces informations manquent pour qu'il soit complet. Tant qu'un champ
est vide, la ligne correspondante disparaît simplement du site — rien ne s'affiche à moitié.

| À remplir | Où | Sans cela |
| --- | --- | --- |
| E-mail | `[BOUTIQUE]` → `E-mail` | le formulaire de contact est remplacé par un renvoi vers la boutique, et le bouton « 💳 Payer par carte » n'apparaît pas (voir « Payer directement sur le site ») |
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
merci.html               page affichée après un paiement par carte
api/checkout.js          fonction Vercel : crée le paiement chez SumUp (clé secrète)
assets/css/styles.css    design (couleurs, composants, responsive)
assets/js/contenu-format.js  format du fichier contenu.txt (lecture / écriture)
assets/js/contenu.js     chargement du contenu et mode aperçu
assets/js/content.js     contenu de secours
assets/js/admin.js       code d'accès réservé à Françoise
assets/js/app.js         rendu, filtres, panier, formulaire
assets/img/              photos et logo
vercel.json              configuration du déploiement
```

## Déploiement

Le site reste presque entièrement statique (aucune étape de build) : seul le paiement par carte a
besoin d'un vrai serveur, sous la forme d'une fonction Vercel.

**GitHub Pages** — le dépôt est configuré en « Deploy from a branch » sur `main`. Tout ce qui est
fusionné dans `main` est publié sur
<https://teambull31.github.io/fran-oise/> (le fichier `.nojekyll` évite tout traitement Jekyll).
Le site y fonctionne normalement, à l'exception du bouton « Payer par carte » (GitHub Pages ne
sait exécuter que des fichiers statiques) : le récapitulatif du panier retombe alors sur les
autres façons de commander.

**Vercel** — importer le dépôt depuis <https://vercel.com/new> : framework « Other », aucune
commande de build, répertoire racine `./`. Le fichier `vercel.json` fournit déjà les en-têtes de
cache et de sécurité, et `api/checkout.js` est détecté automatiquement comme fonction serveur.
Chaque push redéploie ensuite automatiquement. C'est le déploiement à utiliser pour que le
paiement par carte fonctionne (voir « Réglage du paiement par carte » plus haut).

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
