/**
 * SOURCE DE VÉRITÉ DU SITE.
 *
 * Tout ce qui s'affiche vient de ce fichier : pour modifier le site, il suffit
 * d'éditer les valeurs ci-dessous.
 *
 * Le contenu a été repris de la boutique existante (couturefil.sumupstore.com),
 * via le PDF fourni. Les points marqués « TODO » n'étaient pas lisibles dans le
 * PDF et restent à confirmer par Françoise.
 */
window.CONTENT = {
  shop: {
    name: 'Couture & Fil',
    // Titre H1 de la boutique d'origine.
    tagline:
      'Créations de peluches & amigurumi au crochet et en tissu, bijoux et accessoires faits main en pièces uniques',
    subtitle: 'Peluches au crochet artisanales à Monflanquin (Lot-et-Garonne)',
    /** Titre affiché en haut de page, et fragment mis en couleur. */
    heroTitle: 'Peluches au crochet, doudous et bijoux faits main',
    heroHighlight: 'faits main',
    /**
     * Texte de présentation de la boutique. Le PDF coupait le début de chaque
     * ligne : les fragments lisibles ont été conservés mot pour mot et les
     * raccords sont signalés ci-dessous.
     * TODO : recoller le paragraphe exact depuis la boutique SumUp.
     */
    intro: [
      'Bienvenue dans mon univers doux et coloré ! Je suis Françoise, créatrice de peluches et amigurumis faits main au crochet, installée à Monflanquin, en Lot-et-Garonne.',
      'Chaque pièce est imaginée, crochetée et assemblée avec patience dans mon atelier, pour donner vie à des compagnons uniques réalisés avec des matières de qualité.',
      'Que vous cherchiez un cadeau personnalisé, une pièce unique pour un enfant ou une décoration tendre pour la maison, visitez la boutique et laissez-vous séduire par mes peluches au crochet, toutes prêtes à rejoindre un nouveau foyer.'
    ],
    city: 'Monflanquin',
    region: 'Lot-et-Garonne',
    sumupUrl: 'https://couturefil.sumupstore.com/',
    // TODO : coordonnées réelles (absentes du PDF). Laisser vide masque la ligne.
    email: '',
    phone: '',
    address: '',
    // TODO : horaires réels si l'atelier reçoit sur rendez-vous.
    hours: [],
    socials: [
      // TODO : liens réels (Facebook / Instagram).
    ],
    legalLinks: [
      { label: 'Conditions', url: 'https://couturefil.sumupstore.com/' },
      { label: 'Politique de confidentialité', url: 'https://couturefil.sumupstore.com/' },
      { label: 'Politique de cookies', url: 'https://couturefil.sumupstore.com/' }
    ]
  },

  /** Petits arguments affichés sous le hero. */
  highlights: [
    { value: '100 %', label: 'fait main au crochet' },
    { value: 'Pièces uniques', label: 'jamais deux fois la même' },
    { value: 'Monflanquin', label: 'atelier en Lot-et-Garonne' }
  ],

  categories: [
    { id: 'all', label: 'Tout voir' },
    { id: 'peluches', label: 'Peluches & doudous' },
    { id: 'bijoux', label: 'Bijoux' },
    { id: 'zero-dechet', label: 'Zéro déchet' }
  ],

  /**
   * Cartes « univers » de la section Créations.
   * `focus` = cadrage de la photo dans la carte (valeur CSS object-position).
   */
  universes: [
    {
      id: 'peluches',
      title: 'Peluches & doudous',
      image: 'assets/img/cat-peluches.webp',
      focus: 'center bottom',
      text: 'Lapins, oursons et compagnons au crochet, montés et rembourrés à la main.'
    },
    {
      id: 'bijoux',
      title: 'Bijoux',
      image: 'assets/img/cat-bijoux.webp',
      focus: 'center',
      text: 'Boucles d’oreilles fleuries au crochet fin, montées sur crochets argentés.'
    },
    {
      id: 'zero-dechet',
      title: 'Zéro déchet',
      image: 'assets/img/cat-zero-dechet.webp',
      focus: 'center bottom',
      text: 'Lingettes et petits accessoires lavables cousus dans des cotons imprimés.'
    }
  ],

  /** Produits repris de la boutique SumUp (noms et prix exacts). */
  products: [
    {
      id: 'jean',
      name: '🐰 Jean – Peluche lapin au crochet, fait main',
      price: 54,
      category: 'peluches',
      image: 'assets/img/jean.webp',
      badge: 'Grand format',
      description:
        'Grand lapin crocheté dans un fil chiné, col volanté écru. Une pièce unique, entièrement montée à la main.'
    },
    {
      id: 'justin',
      name: '🐰 Justin – Peluche lapin amigurumi au crochet',
      price: 28,
      category: 'peluches',
      image: 'assets/img/justin.webp',
      description:
        'Lapin amigurumi bleu ciel au museau brodé, finition douce et col en dentelle crochetée.'
    },
    {
      id: 'lucien',
      name: '🐰 Lucien – Peluche lapin amigurumi au crochet',
      price: 28,
      category: 'peluches',
      image: 'assets/img/lucien.webp',
      description:
        'Lapin amigurumi écru et son grand nœud blanc, tout en rondeur. Idéal pour une naissance.'
    },
    {
      id: 'polo',
      name: 'Polo, le lapin au crochet',
      price: 21,
      category: 'peluches',
      image: 'assets/img/polo.webp',
      description:
        'Petit lapin blanc au pull vert et à la besace, format nomade qui tient dans la main.'
    },
    {
      id: 'rubis',
      name: '🧸 Rubis – L’Ourson Rouge au Grand Cœur 🧸',
      price: 28,
      category: 'peluches',
      image: 'assets/img/rubis.webp',
      badge: 'Coup de cœur',
      description:
        'Ourson rouge vif au nœud papillon blanc, crocheté serré pour un câlin qui dure.'
    },
    {
      id: 'bleuet',
      name: '🌼 Boucles d’oreilles “Bleuet” 🌼',
      price: 19,
      category: 'bijoux',
      image: 'assets/img/bleuet.webp',
      variants: true,
      description:
        'Fleurs crochetées en fil bleu ciel, cœur de perle nacrée, montées sur crochets argentés.'
    },
    {
      id: 'bleu-nuit',
      name: '💙 Boucles d’oreilles “Bleu Nuit” 💙',
      price: 19,
      category: 'bijoux',
      // TODO : la photo de ce modèle était illisible dans le PDF.
      image: '',
      variants: true,
      description:
        'Le même modèle fleuri, décliné dans un bleu profond. Légères et faites une par une.'
    },
    {
      id: 'fleur-rose',
      name: '🩷 Boucles d’oreilles “Fleur Rose” 🩷',
      price: 19,
      category: 'bijoux',
      image: 'assets/img/fleur-rose.webp',
      variants: true,
      description:
        'Fleurs au crochet rose vif et perle claire au centre. Se portent aussi bien l’été que l’hiver.'
    }
  ],

  /**
   * Ce que propose l'atelier.
   * TODO : la boutique SumUp ne détaille pas de prestations ni de tarifs — à
   * confirmer avec Françoise avant mise en ligne réelle.
   */
  services: [
    {
      title: 'Commande personnalisée',
      price: 'sur demande',
      description:
        'Un coloris précis, un prénom, un modèle revisité : les créations peuvent être adaptées à votre demande.',
      points: ['Choix des fils et des coloris', 'Modèles déclinables', 'Réponse à chaque message']
    },
    {
      title: 'Cadeau de naissance',
      price: 'sur demande',
      description:
        'Doudous et peluches crochetés dans des matières douces, pensés pour accompagner les tout-petits.',
      points: ['Pièces uniques', 'Matières de qualité', 'Emballage soigné']
    },
    {
      title: 'Bijoux au crochet',
      price: 'à partir de 19 €',
      description:
        'Boucles d’oreilles fleuries réalisées à l’unité, avec d’autres variantes de couleurs disponibles.',
      points: ['Crochet fin et perles', 'Crochets argentés', 'Autres coloris sur demande']
    }
  ],

  about: {
    title: 'L’atelier de Françoise',
    image: 'assets/img/atelier.webp',
    imageAlt: 'Créations de l’atelier : ours en tissu fleuri et poupées au crochet',
    paragraphs: [
      'Couture & Fil, c’est un atelier à taille humaine à Monflanquin, en Lot-et-Garonne. Françoise y crochète et y coud chaque pièce à la main, une par une.',
      'Peluches et amigurumis au crochet, doudous en tissu, bijoux fleuris, accessoires zéro déchet : les créations se font sans série, avec des matières choisies pour durer entre les mains d’un enfant comme dans une chambre d’adulte.'
    ],
    skills: [
      'Crochet et amigurumi faits main',
      'Couture en tissus imprimés',
      'Matières de qualité, pièces uniques',
      'Personnalisation possible sur demande'
    ]
  },

  demoNotice:
    'Démonstration — le panier ne déclenche aucun paiement. La vraie boutique reste sur SumUp.'
};
