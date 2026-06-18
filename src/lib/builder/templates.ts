import type { Template } from './types'
import { BLOCK_DEFS } from './blocks'

function getDefaultsForType(type: string) {
  const def = BLOCK_DEFS.find(d => d.type === type)
  return {
    content: def?.defaultContent ?? {},
    style: def?.defaultStyle ?? {},
  }
}

const defaultAnimation = { type: 'none' as const, duration: 0.6, delay: 0, trigger: 'scroll' as const }

export const TEMPLATES: Template[] = [
  {
    id: 'blank',
    label: 'Page vierge',
    description: 'Démarrez avec une page totalement vide.',
    emoji: '⬜',
    blocks: [],
  },
  {
    id: 'restaurant',
    label: 'Restaurant',
    description: 'Site vitrine pour restaurant avec menu, témoignages et réservation.',
    emoji: '🍽️',
    blocks: [
      {
        type: 'navbar-simple',
        content: { logo: 'La Belle Table', link1: 'Menu', link2: 'Notre Histoire', link3: 'Contact', cta: 'Réserver' },
        style: getDefaultsForType('navbar-simple').style,
        animation: defaultAnimation,
      },
      {
        type: 'hero-fullscreen',
        content: {
          title: 'Une cuisine d\'exception au cœur de Paris',
          subtitle: 'Saveurs authentiques et produits frais sélectionnés chaque matin.',
          cta: 'Réserver une table',
          image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&auto=format&fit=crop',
        },
        style: getDefaultsForType('hero-fullscreen').style,
        animation: defaultAnimation,
      },
      {
        type: 'features-section',
        content: {
          title: 'Pourquoi nous choisir ?',
          feat1: 'Produits frais du marché', desc1: 'Nous sélectionnons chaque matin les meilleurs produits locaux et de saison.',
          feat2: 'Chef étoilé', desc2: 'Notre chef cumule 20 ans d\'expérience dans les plus grandes maisons.',
          feat3: 'Cadre unique', desc3: 'Un décor raffiné pour vos dîners romantiques, d\'affaires ou en famille.',
        },
        style: getDefaultsForType('features-section').style,
        animation: defaultAnimation,
      },
      {
        type: 'testimonials-section',
        content: {
          title: 'L\'avis de nos convives',
          t1: 'Un repas inoubliable ! La carte des vins est exceptionnelle.',
          n1: 'Amélie Rousseau', r1: 'Blogueuse culinaire',
          t2: 'Service impeccable, cuisine raffinée. On reviendra !',
          n2: 'Pierre Fontaine', r2: 'Client fidèle',
          t3: 'Le meilleur restaurant que j\'ai testé cette année.',
          n3: 'Clara Dubois', r3: 'Critique gastronomique',
        },
        style: getDefaultsForType('testimonials-section').style,
        animation: defaultAnimation,
      },
      {
        type: 'contact-section',
        content: {
          title: 'Réservez votre table',
          subtitle: 'Contactez-nous pour réserver ou pour toute question. Nous répondons sous 2h.',
          email: 'reservation@labelletable.fr',
          phone: '+33 1 45 67 89 10',
          address: '15 Rue des Saveurs, 75006 Paris',
        },
        style: getDefaultsForType('contact-section').style,
        animation: defaultAnimation,
      },
      {
        type: 'footer-simple',
        content: { logo: 'La Belle Table', copyright: '© 2024 La Belle Table. Tous droits réservés.' },
        style: getDefaultsForType('footer-simple').style,
        animation: defaultAnimation,
      },
    ],
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    description: 'Présentez vos créations avec une galerie épurée et moderne.',
    emoji: '🎨',
    blocks: [
      {
        type: 'navbar-simple',
        content: { logo: 'Studio Créatif', link1: 'Projets', link2: 'À propos', link3: 'Contact', cta: 'Me contacter' },
        style: getDefaultsForType('navbar-simple').style,
        animation: defaultAnimation,
      },
      {
        type: 'hero-left',
        content: {
          title: 'Designer Graphique & Développeur Web',
          subtitle: 'Je crée des expériences visuelles percutantes qui donnent vie à votre marque.',
          cta: 'Voir mes projets',
          image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=700&auto=format&fit=crop',
        },
        style: getDefaultsForType('hero-left').style,
        animation: defaultAnimation,
      },
      {
        type: 'gallery-3col',
        content: {
          img1: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop',
          img2: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
          img3: 'https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=800&auto=format&fit=crop',
          img4: 'https://images.unsplash.com/photo-1547700055-b61cdc9a3b9e?w=800&auto=format&fit=crop',
          img5: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&auto=format&fit=crop',
          img6: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop',
        },
        style: getDefaultsForType('gallery-3col').style,
        animation: defaultAnimation,
      },
      {
        type: 'cta-section',
        content: {
          title: 'Vous avez un projet en tête ?',
          subtitle: 'Discutons de votre vision et transformons-la en réalité ensemble.',
          cta: 'Démarrer un projet',
        },
        style: getDefaultsForType('cta-section').style,
        animation: defaultAnimation,
      },
      {
        type: 'footer-simple',
        content: { logo: 'Studio Créatif', copyright: '© 2024 Studio Créatif. Tous droits réservés.' },
        style: getDefaultsForType('footer-simple').style,
        animation: defaultAnimation,
      },
    ],
  },
  {
    id: 'agence',
    label: 'Agence',
    description: 'Site complet pour agence avec équipe, services et tarifs.',
    emoji: '🏢',
    blocks: [
      {
        type: 'navbar-simple',
        content: { logo: 'Agence Nova', link1: 'Services', link2: 'Équipe', link3: 'Tarifs', cta: 'Devis gratuit' },
        style: getDefaultsForType('navbar-simple').style,
        animation: defaultAnimation,
      },
      {
        type: 'hero-centered',
        content: {
          title: 'Votre partenaire digital de confiance',
          subtitle: 'Stratégie, design et développement pour accélérer votre croissance en ligne.',
          cta: 'Obtenir un devis gratuit',
        },
        style: getDefaultsForType('hero-centered').style,
        animation: defaultAnimation,
      },
      {
        type: 'features-section',
        content: {
          title: 'Nos expertises',
          feat1: 'Stratégie digitale', desc1: 'Nous analysons votre marché et définissons une feuille de route sur-mesure.',
          feat2: 'Design UX/UI', desc2: 'Des interfaces intuitives et esthétiques qui convertissent vos visiteurs.',
          feat3: 'Développement web', desc3: 'Sites et applications web performants, sécurisés et évolutifs.',
        },
        style: getDefaultsForType('features-section').style,
        animation: defaultAnimation,
      },
      {
        type: 'stats-section',
        content: {
          stat1: '150+', label1: 'Clients accompagnés',
          stat2: '300+', label2: 'Projets livrés',
          stat3: '8 ans', label3: 'D\'expérience',
          stat4: '98%', label4: 'Clients satisfaits',
        },
        style: getDefaultsForType('stats-section').style,
        animation: defaultAnimation,
      },
      {
        type: 'three-columns',
        content: {
          col1: '<div style="text-align:center;padding:20px"><img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop" style="width:80px;height:80px;border-radius:50%;object-fit:cover;margin:0 auto 12px;display:block"><strong>Marc Lefèvre</strong><br><span style="color:#7c3aed;font-size:13px">Directeur Créatif</span></div>',
          col2: '<div style="text-align:center;padding:20px"><img src="https://images.unsplash.com/photo-1494790108755-2616b612b047?w=300&auto=format&fit=crop" style="width:80px;height:80px;border-radius:50%;object-fit:cover;margin:0 auto 12px;display:block"><strong>Sophie Martin</strong><br><span style="color:#7c3aed;font-size:13px">Lead Developer</span></div>',
          col3: '<div style="text-align:center;padding:20px"><img src="https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=300&auto=format&fit=crop" style="width:80px;height:80px;border-radius:50%;object-fit:cover;margin:0 auto 12px;display:block"><strong>Lucas Bernard</strong><br><span style="color:#7c3aed;font-size:13px">Stratège Digital</span></div>',
        },
        style: getDefaultsForType('three-columns').style,
        animation: defaultAnimation,
      },
      {
        type: 'pricing-section',
        content: {
          title: 'Des tarifs clairs et transparents',
          plan1: 'Starter', price1: '990€', feat1: 'Site vitrine 5 pages\nDesign personnalisé\nOptimisation SEO',
          plan2: 'Business', price2: '2 490€', feat2: 'Site complet 15 pages\nE-commerce intégré\nTableau de bord analytics',
          plan3: 'Enterprise', price3: 'Sur devis', feat3: 'Solution sur-mesure\nIntégrations complexes\nAccount manager dédié',
        },
        style: getDefaultsForType('pricing-section').style,
        animation: defaultAnimation,
      },
      {
        type: 'contact-section',
        content: {
          title: 'Parlons de votre projet',
          subtitle: 'Remplissez le formulaire et nous vous recontacterons sous 24h.',
          email: 'bonjour@agencenova.fr',
          phone: '+33 1 80 90 10 20',
          address: '42 Avenue de l\'Innovation, 75008 Paris',
        },
        style: getDefaultsForType('contact-section').style,
        animation: defaultAnimation,
      },
      {
        type: 'footer-simple',
        content: { logo: 'Agence Nova', copyright: '© 2024 Agence Nova. Tous droits réservés.' },
        style: getDefaultsForType('footer-simple').style,
        animation: defaultAnimation,
      },
    ],
  },
  {
    id: 'landing',
    label: 'Landing Page',
    description: 'Page de conversion optimisée pour maximiser vos inscriptions.',
    emoji: '🚀',
    blocks: [
      {
        type: 'hero-centered',
        content: {
          title: 'L\'outil qui va révolutionner votre productivité',
          subtitle: 'Rejoignez 10 000 professionnels qui gagnent 5h par semaine grâce à notre solution.',
          cta: 'Essayer gratuitement 14 jours',
        },
        style: getDefaultsForType('hero-centered').style,
        animation: defaultAnimation,
      },
      {
        type: 'features-section',
        content: {
          title: 'Tout ce dont vous avez besoin',
          feat1: 'Automatisation intelligente', desc1: 'Automatisez vos tâches répétitives et concentrez-vous sur l\'essentiel.',
          feat2: 'Collaboration en temps réel', desc2: 'Travaillez avec votre équipe simultanément, où que vous soyez.',
          feat3: 'Analyses avancées', desc3: 'Prenez de meilleures décisions grâce à des insights en temps réel.',
        },
        style: getDefaultsForType('features-section').style,
        animation: defaultAnimation,
      },
      {
        type: 'testimonials-section',
        content: {
          title: 'Ils nous font confiance',
          t1: 'Notre productivité a augmenté de 40% en seulement 3 semaines !',
          n1: 'Antoine Girard', r1: 'CEO, TechStartup',
          t2: 'Enfin un outil qui comprend vraiment les besoins des équipes modernes.',
          n2: 'Julie Mercier', r2: 'Product Manager',
          t3: 'Interface intuitive, onboarding rapide. Un must-have absolu.',
          n3: 'Romain Leroy', r3: 'Directeur Opérations',
        },
        style: getDefaultsForType('testimonials-section').style,
        animation: defaultAnimation,
      },
      {
        type: 'pricing-section',
        content: {
          title: 'Un investissement rentable dès le premier mois',
          plan1: 'Gratuit', price1: '0€/mois', feat1: '3 projets\n2 utilisateurs\n5 Go stockage',
          plan2: 'Pro', price2: '19€/mois', feat2: 'Projets illimités\n10 utilisateurs\n100 Go stockage',
          plan3: 'Business', price3: '49€/mois', feat3: 'Tout illimité\nUtilisateurs illimités\nSécurité avancée',
        },
        style: getDefaultsForType('pricing-section').style,
        animation: defaultAnimation,
      },
      {
        type: 'cta-section',
        content: {
          title: 'Commencez à gagner du temps dès aujourd\'hui',
          subtitle: 'Installation en 2 minutes. Aucune carte bancaire requise.',
          cta: 'Démarrer gratuitement',
        },
        style: getDefaultsForType('cta-section').style,
        animation: defaultAnimation,
      },
    ],
  },
  {
    id: 'blog',
    label: 'Blog',
    description: 'Template blog moderne avec articles et newsletter.',
    emoji: '✍️',
    blocks: [
      {
        type: 'navbar-simple',
        content: { logo: 'Le Blog', link1: 'Articles', link2: 'Catégories', link3: 'À propos', cta: 'S\'abonner' },
        style: getDefaultsForType('navbar-simple').style,
        animation: defaultAnimation,
      },
      {
        type: 'hero-centered',
        content: {
          title: 'Idées, conseils et inspirations',
          subtitle: 'Découvrez nos articles soigneusement rédigés par des experts passionnés.',
          cta: 'Lire les articles',
        },
        style: getDefaultsForType('hero-centered').style,
        animation: defaultAnimation,
      },
      {
        type: 'three-columns',
        content: {
          col1: '<div style="border:1px solid #e4e4e7;border-radius:12px;overflow:hidden;font-family:system-ui,sans-serif"><img src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&auto=format&fit=crop" style="width:100%;height:180px;object-fit:cover"><div style="padding:20px"><span style="background:#f3e8ff;color:#7c3aed;font-size:11px;font-weight:700;padding:3px 10px;border-radius:999px">PRODUCTIVITÉ</span><h3 style="font-size:1rem;font-weight:700;margin:12px 0 8px;color:#0a0a0a">10 conseils pour booster votre créativité</h3><p style="color:#71717a;font-size:13px;line-height:1.5;margin:0">Découvrez comment libérer votre potentiel créatif au quotidien...</p><a href="#" style="display:inline-block;margin-top:14px;color:#7c3aed;font-weight:600;font-size:13px">Lire l\'article →</a></div></div>',
          col2: '<div style="border:1px solid #e4e4e7;border-radius:12px;overflow:hidden;font-family:system-ui,sans-serif"><img src="https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&auto=format&fit=crop" style="width:100%;height:180px;object-fit:cover"><div style="padding:20px"><span style="background:#f0fdf4;color:#059669;font-size:11px;font-weight:700;padding:3px 10px;border-radius:999px">TECH</span><h3 style="font-size:1rem;font-weight:700;margin:12px 0 8px;color:#0a0a0a">L\'IA dans notre quotidien en 2024</h3><p style="color:#71717a;font-size:13px;line-height:1.5;margin:0">Comment l\'intelligence artificielle transforme nos habitudes de travail...</p><a href="#" style="display:inline-block;margin-top:14px;color:#7c3aed;font-weight:600;font-size:13px">Lire l\'article →</a></div></div>',
          col3: '<div style="border:1px solid #e4e4e7;border-radius:12px;overflow:hidden;font-family:system-ui,sans-serif"><img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop" style="width:100%;height:180px;object-fit:cover"><div style="padding:20px"><span style="background:#fff7ed;color:#d97706;font-size:11px;font-weight:700;padding:3px 10px;border-radius:999px">LIFESTYLE</span><h3 style="font-size:1rem;font-weight:700;margin:12px 0 8px;color:#0a0a0a">Trouver l\'équilibre vie pro/perso</h3><p style="color:#71717a;font-size:13px;line-height:1.5;margin:0">Les meilleures stratégies pour un équilibre sain et durable...</p><a href="#" style="display:inline-block;margin-top:14px;color:#7c3aed;font-weight:600;font-size:13px">Lire l\'article →</a></div></div>',
        },
        style: { paddingTop: 60, paddingBottom: 60, paddingLeft: 40, paddingRight: 40 },
        animation: defaultAnimation,
      },
      {
        type: 'form-contact',
        content: { title: 'Abonnez-vous à notre newsletter', submitLabel: 'Je m\'abonne' },
        style: getDefaultsForType('form-contact').style,
        animation: defaultAnimation,
      },
      {
        type: 'footer-simple',
        content: { logo: 'Le Blog', copyright: '© 2024 Le Blog. Tous droits réservés.' },
        style: getDefaultsForType('footer-simple').style,
        animation: defaultAnimation,
      },
    ],
  },
]
