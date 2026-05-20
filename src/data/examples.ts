export interface Example {
  slug: string
  label: string
  sector: 'restaurant' | 'portfolio' | 'boutique' | 'agence' | 'blog' | 'coach'
  desc: string
  img: string
  prompt: string
}

export const EXAMPLES: Example[] = [
  {
    slug: 'restaurant-gastronomique',
    label: 'Restaurant gastronomique',
    sector: 'restaurant',
    desc: 'Menu, réservations en ligne, galerie photos',
    img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    prompt: 'Un restaurant gastronomique à Paris avec menu dégustation, réservation en ligne et galerie de plats',
  },
  {
    slug: 'pizzeria-napolitaine',
    label: 'Pizzeria napolitaine',
    sector: 'restaurant',
    desc: 'Menu du jour, commande en ligne, livraison',
    img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
    prompt: 'Une pizzeria napolitaine avec menu, commande en ligne et livraison à domicile',
  },
  {
    slug: 'cabinet-architecte',
    label: "Cabinet d'architecte",
    sector: 'agence',
    desc: 'Portfolio visuel, galerie de réalisations',
    img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
    prompt: "Un cabinet d'architecture avec galerie de projets, équipe et formulaire de contact",
  },
  {
    slug: 'agence-digitale',
    label: 'Agence digitale',
    sector: 'agence',
    desc: 'Services, équipe, études de cas',
    img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    prompt: 'Une agence digitale avec services (SEO, design, dev), études de cas et page équipe',
  },
  {
    slug: 'startup-tech',
    label: 'Startup tech (SaaS)',
    sector: 'agence',
    desc: 'Landing page SaaS qui convertit',
    img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
    prompt: 'Une landing page SaaS moderne avec hero, features, pricing et CTA',
  },
  {
    slug: 'boutique-artisanale',
    label: 'Boutique artisanale',
    sector: 'boutique',
    desc: 'Catalogue produits, prise de commande',
    img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
    prompt: 'Une boutique artisanale avec catalogue produits faits main, histoire et contact',
  },
  {
    slug: 'boutique-bijoux',
    label: 'Bijouterie artisanale',
    sector: 'boutique',
    desc: 'Collection capsule, commande personnalisée',
    img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
    prompt: 'Une boutique de bijoux artisanaux avec galerie, commande sur mesure et histoire',
  },
  {
    slug: 'portfolio-photographe',
    label: 'Portfolio photographe',
    sector: 'portfolio',
    desc: 'Galerie projets, book, contact',
    img: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&q=80',
    prompt: 'Un portfolio de photographe de mariage avec galerie, tarifs et formulaire de contact',
  },
  {
    slug: 'portfolio-designer',
    label: 'Portfolio designer UX',
    sector: 'portfolio',
    desc: 'Projets UI/UX, études de cas',
    img: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
    prompt: 'Un portfolio designer UI/UX avec études de cas détaillées et compétences',
  },
  {
    slug: 'cabinet-medical',
    label: 'Cabinet médical',
    sector: 'coach',
    desc: 'Site professionnel, prise de rendez-vous',
    img: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80',
    prompt: 'Un cabinet médical avec présentation du médecin, spécialités et prise de rendez-vous',
  },
  {
    slug: 'coach-sportif',
    label: 'Coach sportif',
    sector: 'coach',
    desc: 'Programmes, tarifs, témoignages',
    img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    prompt: 'Un site de coach sportif avec programmes, tarifs, témoignages et prise de contact',
  },
  {
    slug: 'blog-voyage',
    label: 'Blog voyage',
    sector: 'blog',
    desc: 'Articles, destinations, newsletter',
    img: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80',
    prompt: 'Un blog de voyage avec articles par destination, galerie photos et newsletter',
  },
]

export const SECTORS = [
  { slug: 'tous',       label: 'Tous' },
  { slug: 'restaurant', label: 'Restaurant' },
  { slug: 'portfolio',  label: 'Portfolio' },
  { slug: 'boutique',   label: 'Boutique' },
  { slug: 'agence',     label: 'Agence' },
  { slug: 'blog',       label: 'Blog' },
  { slug: 'coach',      label: 'Coach' },
]
