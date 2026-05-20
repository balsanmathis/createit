'use client'

import { useRef, useEffect, useState } from 'react'
import type { Example } from '@/data/examples'

const INNER_W = 1024
const NAV_H   = 52
const HERO_H  = 282
const FEAT_H  = 130
const ABOUT_H = 236
const INNER_H = NAV_H + HERO_H + FEAT_H + ABOUT_H // 700

type Content = {
  nav: string[]
  headline: string
  sub: string
  cta: string
  accent: string
  features: { icon: string; title: string; desc: string }[]
  aboutTitle: string
  aboutText: string
}

const CONTENT: Record<string, Content> = {
  'restaurant-gastronomique': {
    nav: ['Menu', 'Réservations', 'Galerie', 'Contact'],
    headline: "Une cuisine d'exception au cœur de Paris",
    sub: 'Menu dégustation · Produits locaux · Cave à vins sélectionnée',
    cta: 'Réserver une table',
    accent: '#C2410C',
    features: [
      { icon: '🍽️', title: 'Menu dégustation', desc: '7 plats créatifs revisités chaque semaine selon la saison' },
      { icon: '📅', title: 'Réservation en ligne', desc: 'Disponible 7j/7 — confirmation immédiate par email' },
      { icon: '🍷', title: 'Cave à vins', desc: '80 références françaises et naturelles soigneusement choisies' },
    ],
    aboutTitle: 'Notre histoire',
    aboutText: "Depuis 2018, notre chef revisite la gastronomie française avec des produits locaux et de saison. Une expérience culinaire unique dans un cadre intimiste au cœur du 6e arrondissement de Paris.",
  },
  'pizzeria-napolitaine': {
    nav: ['Menu', 'Commander', 'Livraison', 'Contact'],
    headline: "La vraie pizza napolitaine, livrée chez vous",
    sub: 'Pâte à la farine 00 · Four à bois · Ingrédients importés de Naples',
    cta: 'Commander maintenant',
    accent: '#DC2626',
    features: [
      { icon: '🍕', title: 'Pâte maison', desc: 'Fermentation 48h à la farine 00 napolitaine certifiée STG' },
      { icon: '🚴', title: 'Livraison rapide', desc: 'Moins de 30 min dans un rayon de 5 km autour du restaurant' },
      { icon: '🔥', title: 'Four à bois', desc: 'Cuisson à 450 °C pour une pizza authentique et croustillante' },
    ],
    aboutTitle: 'La tradition napolitaine',
    aboutText: "Nos pizzas sont préparées selon la tradition napolitaine STG : pâte fermentée 48h, tomates San Marzano DOP, mozzarella fior di latte. Chaque bouchée vous transporte au cœur de Naples.",
  },
  'cabinet-architecte': {
    nav: ['Projets', 'Services', 'Équipe', 'Contact'],
    headline: "Architecture & design sur-mesure",
    sub: 'Résidentiel · Commercial · Rénovation · Conception durable',
    cta: 'Voir nos réalisations',
    accent: '#1D4ED8',
    features: [
      { icon: '🏛️', title: 'Conception sur-mesure', desc: 'Chaque projet est unique, pensé pour vous et votre espace de vie' },
      { icon: '📐', title: 'Suivi de chantier', desc: "Accompagnement complet de la conception jusqu'à la livraison clé en main" },
      { icon: '🌿', title: 'Architecture durable', desc: 'Matériaux éco-responsables, RE2020, basse consommation énergétique' },
    ],
    aboutTitle: 'Notre cabinet',
    aboutText: "Fondé en 2010 à Paris, notre cabinet intervient sur des projets résidentiels et tertiaires en France et en Europe. Nous concevons des espaces qui allient esthétique, fonctionnalité et respect de l'environnement.",
  },
  'agence-digitale': {
    nav: ['Services', 'Réalisations', 'Équipe', 'Contact'],
    headline: "Votre croissance digitale commence ici",
    sub: 'Stratégie · Design · Développement · Performance',
    cta: 'Obtenir un devis gratuit',
    accent: '#7C3AED',
    features: [
      { icon: '🎨', title: 'Design & UX', desc: 'Interfaces intuitives et mémorables qui convertissent et fidélisent' },
      { icon: '💻', title: 'Développement web', desc: 'Sites et applications performants, accessibles et sécurisés' },
      { icon: '📈', title: 'Marketing digital', desc: 'SEO, SEA, réseaux sociaux — des résultats mesurables et durables' },
    ],
    aboutTitle: 'Notre approche',
    aboutText: "Depuis 2015, nous accompagnons PME et startups dans leur transformation digitale. Notre équipe de 12 experts combine créativité et data pour construire des présences en ligne qui génèrent de vraies opportunités business.",
  },
  'startup-tech': {
    nav: ['Fonctionnalités', 'Tarifs', 'Témoignages', 'Connexion'],
    headline: "Gérez vos projets 10× plus vite",
    sub: 'La plateforme tout-en-un pour les équipes modernes et ambitieuses',
    cta: 'Commencer gratuitement',
    accent: '#0891B2',
    features: [
      { icon: '⚡', title: 'Automatisation', desc: 'Workflows automatiques pour éliminer les tâches répétitives et chronophages' },
      { icon: '👥', title: 'Collaboration', desc: 'Travaillez en temps réel avec toute votre équipe, où que vous soyez' },
      { icon: '📊', title: 'Analytics', desc: 'Tableaux de bord clairs pour piloter vos projets et vos performances' },
    ],
    aboutTitle: 'Pourquoi nous choisir',
    aboutText: "Plus de 5 000 équipes font confiance à notre plateforme pour gérer leurs projets et centraliser leur communication. Essayez gratuitement pendant 14 jours, sans carte bancaire requise.",
  },
  'boutique-artisanale': {
    nav: ['Boutique', 'Collections', 'À propos', 'Contact'],
    headline: "L'artisanat français, pièce par pièce",
    sub: 'Créations uniques · Fait main en France · Livraison offerte dès 60€',
    cta: 'Découvrir la collection',
    accent: '#92400E',
    features: [
      { icon: '✋', title: 'Fait main', desc: 'Chaque pièce est façonnée à la main dans notre atelier lyonnais' },
      { icon: '🚚', title: 'Livraison offerte', desc: 'Expédition gratuite en France métropolitaine dès 60€ de commande' },
      { icon: '♻️', title: 'Matières naturelles', desc: 'Lin, coton bio, bois certifié FSC — zéro plastique, zéro compromis' },
    ],
    aboutTitle: 'Notre atelier',
    aboutText: "Depuis 2019, nous créons des objets du quotidien avec soin et sans compromis. Basés à Lyon, nos artisans sélectionnent chaque matière première pour sa qualité et son origine. Chaque pièce est signée et numérotée.",
  },
  'boutique-bijoux': {
    nav: ['Collections', 'Sur-mesure', 'À propos', 'Contact'],
    headline: "Bijoux artisanaux, créés pour durer",
    sub: 'Or 18 carats · Pierres naturelles · Commande sur mesure disponible',
    cta: 'Explorer la collection',
    accent: '#B45309',
    features: [
      { icon: '💎', title: 'Or & argent', desc: "Or 18 carats et argent 925 travaillés à la main dans notre atelier" },
      { icon: '🪨', title: 'Pierres naturelles', desc: 'Diamants, opales, tourmalines — sourcées de manière responsable' },
      { icon: '✍️', title: 'Sur mesure', desc: 'Créez votre bijou unique avec notre atelier en 3 à 4 semaines' },
    ],
    aboutTitle: 'La maison',
    aboutText: "Créée par une joaillière formée à l'École Boulle, la maison propose des bijoux intemporels qui traversent les générations. Chaque pièce est conçue, fabriquée et contrôlée dans notre atelier parisien.",
  },
  'portfolio-photographe': {
    nav: ['Portfolio', 'Services', 'Tarifs', 'Contact'],
    headline: "Capturer l'instant parfait",
    sub: 'Photographe de mariage & portrait basé à Paris — disponible partout en France',
    cta: 'Voir le portfolio',
    accent: '#374151',
    features: [
      { icon: '💍', title: 'Mariages', desc: 'Reportage complet du getting ready à la soirée, en France et en Europe' },
      { icon: '👤', title: 'Portraits', desc: 'Séances individuelles, famille, grossesse — studio ou en extérieur' },
      { icon: '🎬', title: 'Vidéo', desc: 'Films de mariage cinématographiques en 4K avec musique originale' },
    ],
    aboutTitle: 'Mon approche',
    aboutText: "Photographe depuis 10 ans, je capture les émotions authentiques et les moments spontanés. Mon style se caractérise par des lumières naturelles douces et une approche discrète qui vous laisse vivre pleinement votre journée.",
  },
  'portfolio-designer': {
    nav: ['Projets', 'Services', 'À propos', 'Contact'],
    headline: "Design centré utilisateur, résultats mesurables",
    sub: 'Product design · UX Research · Design systems · Prototypage',
    cta: 'Voir mes projets',
    accent: '#6D28D9',
    features: [
      { icon: '🔬', title: 'UX Research', desc: "Tests utilisateurs, interviews, analyse des parcours — données pour décider" },
      { icon: '🎨', title: 'Product Design', desc: 'Wireframes, prototypes haute fidélité, design system cohérent et scalable' },
      { icon: '📱', title: 'Design mobile', desc: 'Applications iOS et Android natives, interfaces fluides et accessibles' },
    ],
    aboutTitle: 'Mon parcours',
    aboutText: "6 ans d'expérience en product design pour des startups et des grandes entreprises. J'ai contribué à des produits utilisés par plus d'un million de personnes. Disponible en freelance et pour des missions longues.",
  },
  'cabinet-medical': {
    nav: ['Spécialités', 'Rendez-vous', 'Équipe', 'Contact'],
    headline: "Votre santé, notre priorité",
    sub: 'Médecine générale · Prise de rendez-vous en ligne · Téléconsultation 7j/7',
    cta: 'Prendre rendez-vous',
    accent: '#0369A1',
    features: [
      { icon: '🩺', title: 'Consultation', desc: 'Médecine générale, suivi personnalisé et ordonnances dématérialisées' },
      { icon: '💻', title: 'Téléconsultation', desc: 'Consultez depuis chez vous, disponibilité en moins de 2 heures' },
      { icon: '📋', title: 'Bilan de santé', desc: 'Check-up complet avec analyses biologiques et compte rendu détaillé' },
    ],
    aboutTitle: 'Notre cabinet',
    aboutText: "Cabinet médical moderne proposant une approche globale de la santé. Notre équipe de trois médecins vous reçoit du lundi au samedi, avec des créneaux disponibles le jour même pour les urgences.",
  },
  'coach-sportif': {
    nav: ['Programmes', 'Tarifs', 'Témoignages', 'Contact'],
    headline: "Atteignez vos objectifs, pour de bon",
    sub: 'Coaching personnalisé · Suivi nutritionnel · En ligne et en présentiel',
    cta: 'Commencer maintenant',
    accent: '#15803D',
    features: [
      { icon: '🏋️', title: 'Programmes perso', desc: "Plan d'entraînement 100% adapté à vos objectifs et à votre rythme de vie" },
      { icon: '🥗', title: 'Suivi nutritionnel', desc: 'Conseils alimentaires personnalisés sans régime restrictif ni frustration' },
      { icon: '📱', title: 'Suivi en ligne', desc: 'Application dédiée, check-ins hebdomadaires et ajustements en temps réel' },
    ],
    aboutTitle: 'Mon approche',
    aboutText: "Coach certifié avec 8 ans d'expérience, j'ai accompagné plus de 300 clients vers leurs objectifs : perte de poids, prise de masse, remise en forme ou performance sportive. Chaque programme est unique.",
  },
  'blog-voyage': {
    nav: ['Destinations', 'Articles', 'Galerie', 'Newsletter'],
    headline: "Le monde vu autrement",
    sub: 'Voyages authentiques · Conseils pratiques · 40 pays en photos',
    cta: 'Explorer les destinations',
    accent: '#0F766E',
    features: [
      { icon: '✈️', title: '40 pays visités', desc: 'Des récits de terrain authentiques depuis tous les continents' },
      { icon: '📷', title: 'Photo & vidéo', desc: 'Galeries et vlogs pour chaque destination, en haute résolution' },
      { icon: '💡', title: 'Guides pratiques', desc: 'Budgets, itinéraires, bons plans — tout ce que vous cherchez' },
    ],
    aboutTitle: 'Le blog',
    aboutText: "Créé en 2020, ce blog rassemble aujourd'hui 50 000 lecteurs mensuels passionnés de voyage. Pas de tourisme de masse : nous partageons des expériences vraies, des rencontres humaines et des adresses confidentielles.",
  },
}

function SiteLayout({ example, c }: { example: Example; c: Content }) {
  return (
    <div style={{ width: INNER_W, height: INNER_H, overflow: 'hidden', background: '#fff', fontFamily: 'system-ui,-apple-system,sans-serif', userSelect: 'none', pointerEvents: 'none' }}>

      {/* ── Nav ─────────────────────────────────────────────── */}
      <div style={{ height: NAV_H, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', borderBottom: '1px solid #f0f0f0', background: '#fff' }}>
        <span style={{ fontWeight: 800, fontSize: 17, color: c.accent }}>{example.label}</span>
        <div style={{ display: 'flex', gap: 30 }}>
          {c.nav.map(link => (
            <span key={link} style={{ fontSize: 13, color: '#555', fontWeight: 500 }}>{link}</span>
          ))}
        </div>
        <div style={{ background: c.accent, color: '#fff', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 700 }}>
          {c.cta}
        </div>
      </div>

      {/* ── Hero ────────────────────────────────────────────── */}
      <div style={{ position: 'relative', height: HERO_H, overflow: 'hidden' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={example.img}
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.50)' }} />
        <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 100px', gap: 14 }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{c.headline}</div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.78)', maxWidth: 560 }}>{c.sub}</div>
          <div style={{ marginTop: 6, background: c.accent, color: '#fff', borderRadius: 10, padding: '13px 32px', fontSize: 14, fontWeight: 700 }}>
            {c.cta}
          </div>
        </div>
      </div>

      {/* ── Features ────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', height: FEAT_H }}>
        {c.features.map((f, i) => (
          <div key={i} style={{ padding: '20px 28px', borderRight: i < 2 ? '1px solid #f0f0f0' : 'none', borderBottom: '1px solid #f0f0f0', background: '#fff', display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ fontSize: 22 }}>{f.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{f.title}</div>
            <div style={{ fontSize: 12, color: '#666', lineHeight: 1.55 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* ── About ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', height: ABOUT_H, background: '#fff' }}>
        <div style={{ flex: 1, padding: '36px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: c.accent }}>À propos</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#111', lineHeight: 1.2 }}>{c.aboutTitle}</div>
          <div style={{ fontSize: 13, color: '#555', lineHeight: 1.7, maxWidth: 380 }}>{c.aboutText}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: c.accent, marginTop: 4 }}>En savoir plus →</div>
        </div>
        <div style={{ width: 400, flexShrink: 0, overflow: 'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={example.img}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
          />
        </div>
      </div>
    </div>
  )
}

export default function SitePreview({ example }: { example: Example }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.55)

  useEffect(() => {
    if (!wrapperRef.current) return
    const update = () => {
      if (wrapperRef.current)
        setScale(wrapperRef.current.offsetWidth / INNER_W)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(wrapperRef.current)
    return () => ro.disconnect()
  }, [])

  const content = CONTENT[example.slug]

  return (
    <div ref={wrapperRef} style={{ position: 'relative', overflow: 'hidden', height: Math.round(INNER_H * scale) }}>
      {content ? (
        <div style={{ position: 'absolute', top: 0, left: 0, transformOrigin: 'top left', transform: `scale(${scale})` }}>
          <SiteLayout example={example} c={content} />
        </div>
      ) : (
        /* fallback: plain image */
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={example.img} alt={example.label} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
      )}
    </div>
  )
}
