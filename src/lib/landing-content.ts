export type Lang = 'fr' | 'en'

export const content = {
  fr: {
    nav: {
      examples: 'Exemples',
      pricing: 'Tarifs',
      about: 'À propos',
      login: 'Connexion',
      start: 'Commencer',
      start_free: 'Commencer gratuitement',
    },
    hero: {
      badge: 'Générateur de sites web',
      title1: 'Votre site web.',
      title2: 'Décrit. Généré. Exporté.',
      subtitle: 'Décrivez votre projet. Obtenez un site professionnel complet en moins de 30 secondes. Éditez, exportez le code, hébergez où vous voulez.',
      cta: 'Générer mon site',
      proof: '2 847 sites créés ce mois — sans carte bancaire requise',
    },
    stats: [
      { value: '2 847',    label: 'sites créés ce mois' },
      { value: '4.9 / 5', label: 'note moyenne' },
      { value: '< 30 s',  label: 'temps de génération' },
      { value: '100 %',   label: 'code exportable' },
      { value: '6',       label: 'secteurs couverts' },
      { value: '0 €',     label: 'de lock-in' },
      { value: '30 j',    label: 'sans engagement' },
      { value: '2 min',   label: 'pour démarrer' },
    ],
    examples_section: {
      heading: 'Ce que vous pouvez créer',
      subheading: 'Des sites professionnels dans tous les secteurs, prêts en quelques secondes',
      see_all: 'Voir les 50+ exemples',
      view_example: 'Voir cet exemple',
    },
    how_it_works: {
      heading: 'Simple comme bonjour',
      steps: [
        {
          num: '01',
          title: 'Décrivez',
          desc: 'Tapez votre idée en une ou deux phrases. Un restaurant, un portfolio, une boutique, une landing page — tout fonctionne.',
        },
        {
          num: '02',
          title: 'Générez',
          desc: "En moins de 30 secondes, votre site est prêt : structure, contenu, design. Peaufinez avec l'éditeur visuel intégré.",
        },
        {
          num: '03',
          title: 'Exportez',
          desc: 'Téléchargez un ZIP propre (HTML/CSS/JS). Hébergez sur Netlify, Vercel, OVH ou votre propre serveur.',
        },
      ],
    },
    features: {
      heading: "Tout ce qu'il vous faut",
      subheading: 'Des outils pensés pour créer, personnaliser et livrer sans friction',
      items: [
        {
          title: 'Généré en moins de 30 secondes',
          desc: 'Décrivez votre projet en quelques mots. Le site est construit, structuré et designé automatiquement.',
        },
        {
          title: 'Éditeur visuel inclus',
          desc: 'Modifiez textes, images et couleurs directement sur votre site, sans toucher au code.',
        },
        {
          title: 'Code propre, exportable',
          desc: "Téléchargez votre site en HTML/CSS/JS prêt à l'emploi. Hébergez-le où vous voulez.",
        },
        {
          title: '100 % à vous, zéro lock-in',
          desc: "Vous possédez le code. Aucun abonnement d'hébergement imposé, aucune plateforme propriétaire.",
        },
      ],
    },
    personas: {
      heading: 'Fait pour vous',
      items: [
        {
          title: 'Freelance & développeur',
          subtitle: 'Multipliez vos projets, pas vos heures',
          bullets: [
            "Livrez un site en 24 h — facturable au prix d'une semaine",
            'Draft complet en 30 s, vous finalisez à la main ensuite',
            'Portfolio, vitrine, restaurant, boutique : tous secteurs',
            'Gardez 100 % de la marge, zéro sous-traitance',
          ],
          cta: 'Voir un portfolio',
          href: '/exemples?secteur=portfolio',
        },
        {
          title: 'Entrepreneur & fondateur',
          subtitle: 'Testez votre idée sans agence ni développeur',
          bullets: [
            "Landing page opérationnelle en moins d'une minute",
            'Modifiez textes et couleurs vous-même, en temps réel',
            'Zéro budget tech requis pour la v1',
            'Pivotez sans coût — régénérez en quelques secondes',
          ],
          cta: 'Voir une landing SaaS',
          href: '/exemples/startup-tech',
        },
        {
          title: 'Agence & studio',
          subtitle: 'Scalez votre production sans recruter',
          bullets: [
            '10 drafts clients en 5 minutes — effet waouh garanti',
            'Accès multi-membres inclus dans le plan Agency',
            'Export HTML/CSS propre, intégrable à votre workflow',
            'Marque blanche disponible sur demande',
          ],
          cta: 'Voir un exemple agence',
          href: '/exemples/agence-digitale',
        },
      ],
    },
    pricing: {
      heading: 'Tarifs simples et transparents',
      subheading: 'Commencez gratuitement, évoluez selon vos besoins. Sans engagement.',
      monthly: 'Mensuel',
      annual: 'Annuel',
      annual_discount: '−20 %',
      compare: 'Comparer toutes les fonctionnalités →',
      note: 'Plan gratuit inclus — aucune carte bancaire requise.',
    },
    faq: {
      heading: 'Questions fréquentes',
      see_all: 'Voir toutes les questions →',
      items: [
        {
          q: "Le code m'appartient-il vraiment ?",
          a: "Oui, entièrement. Vous téléchargez un fichier ZIP contenant du HTML, CSS et JavaScript standard. Pas de dépendance à CreateIt, pas d'abonnement d'hébergement imposé.",
        },
        {
          q: 'Où puis-je héberger mon site ?',
          a: "N'importe où : Netlify, Vercel, OVH, GitHub Pages, votre propre serveur. Le code exporté est du HTML pur, compatible partout.",
        },
        {
          q: 'Que se passe-t-il si mes tokens sont épuisés ?',
          a: "Vous pouvez consulter et exporter vos sites existants. Pour en générer de nouveaux, il suffit de passer à un plan supérieur ou d'attendre le renouvellement mensuel.",
        },
        {
          q: 'Puis-je revendre les sites créés à mes clients ?',
          a: "Oui, les plans Starter, Pro et Agency autorisent la revente. Le plan Agency inclut un volume adapté aux agences et un support dédié.",
        },
        {
          q: 'Quels secteurs sont couverts ?',
          a: 'Restaurant, portfolio, boutique, agence, blog, coach, cabinet médical, immobilier, startup SaaS… Si vous pouvez le décrire, CreateIt peut le créer.',
        },
        {
          q: "Comment annuler l'abonnement ?",
          a: "En un clic depuis votre tableau de bord > Abonnement > Gérer. Sans engagement, sans frais d'annulation.",
        },
      ],
    },
    testimonials: {
      heading: "Ce qu'ils en disent",
      hint: '← Faites glisser →',
    },
    cta_final: {
      heading: 'Prêt à créer votre premier site ?',
      subtitle: 'Gratuit. Sans carte bancaire. Sans engagement.',
      button: 'Commencer gratuitement',
    },
    footer: {
      tagline: 'Générez des sites web professionnels en quelques secondes.',
      product: 'Produit',
      company: 'Entreprise',
      legal: 'Légal',
      copyright: `© ${new Date().getFullYear()} CreateIt — Tous droits réservés`,
      theme: 'Thème',
      mobile_cta: 'Commencer gratuitement',
    },
    plans: [
      {
        key: 'free',
        name: 'Gratuit',
        desc: 'Pour explorer les exemples',
        tokens: '',
        features: ['Accès aux exemples', 'Voir les sites générés', 'Inspiration gratuite'],
        cta: 'Créer un compte',
        href: '/auth/signup',
      },
      {
        key: 'starter',
        name: 'Starter',
        desc: 'Pour les indépendants',
        tokens: '800 000 tokens',
        features: ['Générations illimitées', 'Éditeur visuel', 'Export ZIP', 'Support email'],
        cta: 'Choisir Starter',
        href: '/auth/signup?plan=starter',
      },
      {
        key: 'pro',
        name: 'Pro',
        desc: 'Pour les professionnels',
        tokens: '2 400 000 tokens',
        features: ['Éditeur visuel avancé', 'Export ZIP', 'Support prioritaire', 'Historique illimité'],
        cta: 'Choisir Pro',
        href: '/auth/signup?plan=pro',
      },
      {
        key: 'agency',
        name: 'Agency',
        desc: 'Pour les agences',
        tokens: '16 000 000 tokens',
        features: ['Tout le Pro', 'Support dédié 24/7', 'API access', 'Revente autorisée', 'White label'],
        cta: 'Choisir Agency',
        href: '/auth/signup?plan=agency',
      },
    ],
  },
  en: {
    nav: {
      examples: 'Examples',
      pricing: 'Pricing',
      about: 'About',
      login: 'Log in',
      start: 'Get started',
      start_free: 'Start for free',
    },
    hero: {
      badge: 'Website generator',
      title1: 'Your website.',
      title2: 'Described. Generated. Exported.',
      subtitle: 'Describe your project. Get a complete professional website in under 30 seconds. Edit, export the code, host anywhere.',
      cta: 'Generate my site',
      proof: '2,847 sites created this month — no credit card required',
    },
    stats: [
      { value: '2,847',   label: 'sites created this month' },
      { value: '4.9 / 5', label: 'average rating' },
      { value: '< 30 s',  label: 'generation time' },
      { value: '100%',    label: 'exportable code' },
      { value: '6',       label: 'sectors covered' },
      { value: '€0',      label: 'lock-in' },
      { value: '30 days', label: 'no commitment' },
      { value: '2 min',   label: 'to get started' },
    ],
    examples_section: {
      heading: 'What you can build',
      subheading: 'Professional websites in every sector, ready in seconds',
      see_all: 'See 50+ examples',
      view_example: 'View this example',
    },
    how_it_works: {
      heading: 'Simple as it gets',
      steps: [
        {
          num: '01',
          title: 'Describe',
          desc: 'Type your idea in one or two sentences. A restaurant, a portfolio, a shop, a landing page — anything works.',
        },
        {
          num: '02',
          title: 'Generate',
          desc: 'In under 30 seconds, your site is ready: structure, content, design. Fine-tune it with the built-in visual editor.',
        },
        {
          num: '03',
          title: 'Export',
          desc: 'Download a clean ZIP (HTML/CSS/JS). Host on Netlify, Vercel, any server you want.',
        },
      ],
    },
    features: {
      heading: 'Everything you need',
      subheading: 'Tools designed to create, customize and deliver without friction',
      items: [
        {
          title: 'Generated in under 30 seconds',
          desc: 'Describe your project in a few words. The site is built, structured and designed automatically.',
        },
        {
          title: 'Visual editor included',
          desc: 'Edit text, images and colors directly on your site, without touching the code.',
        },
        {
          title: 'Clean, exportable code',
          desc: 'Download your site as ready-to-use HTML/CSS/JS. Host it wherever you want.',
        },
        {
          title: '100% yours, zero lock-in',
          desc: 'You own the code. No forced hosting subscription, no proprietary platform.',
        },
      ],
    },
    personas: {
      heading: 'Built for you',
      items: [
        {
          title: 'Freelancer & developer',
          subtitle: 'Scale your projects, not your hours',
          bullets: [
            'Deliver a site in 24 h — billable at a week\'s rate',
            'Full draft in 30 s, you finish it by hand',
            'Portfolio, showcase, restaurant, shop: all sectors',
            'Keep 100% of the margin, zero subcontracting',
          ],
          cta: 'See a portfolio',
          href: '/exemples?secteur=portfolio',
        },
        {
          title: 'Entrepreneur & founder',
          subtitle: 'Test your idea without an agency or developer',
          bullets: [
            'Operational landing page in under a minute',
            'Edit text and colors yourself, in real time',
            'Zero tech budget required for v1',
            'Pivot at no cost — regenerate in seconds',
          ],
          cta: 'See a SaaS landing',
          href: '/exemples/startup-tech',
        },
        {
          title: 'Agency & studio',
          subtitle: 'Scale your output without hiring',
          bullets: [
            '10 client drafts in 5 minutes — wow effect guaranteed',
            'Multi-member access included in Agency plan',
            'Clean HTML/CSS export, fits your workflow',
            'White-label available on request',
          ],
          cta: 'See an agency example',
          href: '/exemples/agence-digitale',
        },
      ],
    },
    pricing: {
      heading: 'Simple, transparent pricing',
      subheading: 'Start for free, scale as you grow. No commitment.',
      monthly: 'Monthly',
      annual: 'Annual',
      annual_discount: '−20%',
      compare: 'Compare all features →',
      note: 'Free plan included — no credit card required.',
    },
    faq: {
      heading: 'Frequently asked questions',
      see_all: 'See all questions →',
      items: [
        {
          q: 'Do I really own the code?',
          a: 'Yes, entirely. You download a ZIP file containing standard HTML, CSS and JavaScript. No CreateIt dependency, no forced hosting subscription.',
        },
        {
          q: 'Where can I host my site?',
          a: 'Anywhere: Netlify, Vercel, GitHub Pages, your own server. The exported code is pure HTML, compatible everywhere.',
        },
        {
          q: 'What happens when my tokens run out?',
          a: 'You can still view and export your existing sites. To generate new ones, upgrade to a higher plan or wait for your monthly renewal.',
        },
        {
          q: 'Can I resell sites to my clients?',
          a: 'Yes, Starter, Pro and Agency plans allow resale. The Agency plan includes volume suited for agencies and dedicated support.',
        },
        {
          q: 'What sectors are covered?',
          a: 'Restaurant, portfolio, shop, agency, blog, coach, medical practice, real estate, SaaS startup… If you can describe it, CreateIt can build it.',
        },
        {
          q: 'How do I cancel my subscription?',
          a: 'One click from your dashboard > Subscription > Manage. No commitment, no cancellation fees.',
        },
      ],
    },
    testimonials: {
      heading: 'What they say',
      hint: '← Swipe →',
    },
    cta_final: {
      heading: 'Ready to build your first site?',
      subtitle: 'Free. No credit card. No commitment.',
      button: 'Start for free',
    },
    footer: {
      tagline: 'Generate professional websites in seconds.',
      product: 'Product',
      company: 'Company',
      legal: 'Legal',
      copyright: `© ${new Date().getFullYear()} CreateIt — All rights reserved`,
      theme: 'Theme',
      mobile_cta: 'Start for free',
    },
    plans: [
      {
        key: 'free',
        name: 'Free',
        desc: 'Explore the examples',
        tokens: '',
        features: ['Access to examples', 'Browse generated sites', 'Free inspiration'],
        cta: 'Create an account',
        href: '/auth/signup',
      },
      {
        key: 'starter',
        name: 'Starter',
        desc: 'For freelancers',
        tokens: '800,000 tokens',
        features: ['Unlimited generations', 'Visual editor', 'ZIP export', 'Email support'],
        cta: 'Choose Starter',
        href: '/auth/signup?plan=starter',
      },
      {
        key: 'pro',
        name: 'Pro',
        desc: 'For professionals',
        tokens: '2,400,000 tokens',
        features: ['Advanced visual editor', 'ZIP export', 'Priority support', 'Unlimited history'],
        cta: 'Choose Pro',
        href: '/auth/signup?plan=pro',
      },
      {
        key: 'agency',
        name: 'Agency',
        desc: 'For agencies',
        tokens: '16,000,000 tokens',
        features: ['Everything in Pro', '24/7 dedicated support', 'API access', 'Resale allowed', 'White label'],
        cta: 'Choose Agency',
        href: '/auth/signup?plan=agency',
      },
    ],
  },
} as const
