'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, X, ChevronDown, ChevronRight, ArrowRight,
  Zap, PenLine, Download, Lock, Star,
} from 'lucide-react'
import AuroraBackground from '@/components/ui/AuroraBackground'
import GlassCard from '@/components/ui/GlassCard'
import PromptInput from '@/components/ui/PromptInput'
import PricingCard, { type PricingPlan } from '@/components/ui/PricingCard'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { cn } from '@/lib/utils'

/* ─── Data ───────────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: 'Exemples', href: '/exemples' },
  { label: 'Tarifs',   href: '/tarifs' },
  { label: 'À propos', href: '/a-propos' },
]

const SECTORS = [
  { label: 'Restaurant', slug: 'restaurant' },
  { label: 'Portfolio',  slug: 'portfolio' },
  { label: 'Boutique',   slug: 'boutique' },
  { label: 'Agence',     slug: 'agence' },
  { label: 'Blog',       slug: 'blog' },
  { label: 'Coach',      slug: 'coach' },
]

const STATS = [
  { value: '2 847',     label: 'sites créés ce mois' },
  { value: '4.9 / 5',  label: 'note moyenne' },
  { value: '< 30 s',   label: 'temps de génération' },
  { value: '100 %',    label: 'code exportable' },
  { value: '6',        label: 'secteurs couverts' },
  { value: '0 €',      label: "de lock-in" },
  { value: '30 j',     label: 'sans engagement' },
  { value: '2 min',    label: 'pour démarrer' },
]

const EXAMPLES = [
  {
    slug: 'restaurant-gastronomique',
    label: 'Restaurant gastronomique',
    sector: 'restaurant',
    desc: 'Menu, réservations en ligne, galerie photos',
    img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
  },
  {
    slug: 'cabinet-architecte',
    label: "Cabinet d'architecte",
    sector: 'agence',
    desc: 'Portfolio visuel, galerie de réalisations',
    img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80',
  },
  {
    slug: 'startup-tech',
    label: 'Startup tech',
    sector: 'agence',
    desc: 'Landing page SaaS qui convertit',
    img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80',
  },
  {
    slug: 'boutique-artisanale',
    label: 'Boutique artisanale',
    sector: 'boutique',
    desc: 'Catalogue produits, prise de commande',
    img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80',
  },
  {
    slug: 'cabinet-medical',
    label: 'Cabinet médical',
    sector: 'coach',
    desc: 'Site professionnel, prise de rendez-vous',
    img: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=600&q=80',
  },
  {
    slug: 'coach-sportif',
    label: 'Coach sportif',
    sector: 'coach',
    desc: 'Programmes, tarifs, témoignages',
    img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
  },
]

const FEATURES = [
  {
    icon: <Zap size={20} style={{ color: 'var(--accent)' }} />,
    title: 'Généré en moins de 30 secondes',
    desc: 'Décrivez votre projet en quelques mots. Le site est construit, structuré et designé automatiquement.',
  },
  {
    icon: <PenLine size={20} style={{ color: 'var(--accent)' }} />,
    title: 'Éditeur visuel inclus',
    desc: 'Modifiez textes, images et couleurs directement sur votre site, sans toucher au code.',
  },
  {
    icon: <Download size={20} style={{ color: 'var(--accent)' }} />,
    title: 'Code propre, exportable',
    desc: "Téléchargez votre site en HTML/CSS/JS prêt à l'emploi. Hébergez-le où vous voulez.",
  },
  {
    icon: <Lock size={20} style={{ color: 'var(--accent)' }} />,
    title: '100 % à vous, zéro lock-in',
    desc: "Vous possédez le code. Aucun abonnement d'hébergement imposé, aucune plateforme propriétaire.",
  },
]

const PERSONAS = [
  {
    icon: '💼',
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
    icon: '🚀',
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
    icon: '🏢',
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
]

const STEPS = [
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
]

const FAQS = [
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
]

const TESTIMONIALS = [
  {
    name: 'Sophie Martin',
    role: 'Restauratrice',
    city: 'Lyon',
    stars: 5,
    text: "Mon site était prêt en 40 secondes. Le design correspondait exactement à l'ambiance de mon restaurant. J'ai juste modifié les photos et le menu.",
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80',
  },
  {
    name: 'Lucas Bernard',
    role: 'Designer freelance',
    city: 'Paris',
    stars: 5,
    text: "Je génère le premier draft en 30 secondes, je peaufine en 2 heures. Mes clients pensent que j'ai passé une semaine dessus.",
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80',
  },
  {
    name: 'Marie Dubois',
    role: 'Fondatrice SaaS',
    city: 'Bordeaux',
    stars: 5,
    text: 'Notre landing page convertit mieux que celle faite par notre agence à 4 000 €. On a tout généré et modifié en interne.',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1a7?w=80&q=80',
  },
  {
    name: 'Thomas Leroy',
    role: 'Coach sportif',
    city: 'Marseille',
    stars: 5,
    text: "Je n'y connais rien en web. J'ai décrit mon activité, en 30 secondes j'avais un site professionnel. Aucun bug, aucun souci.",
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80',
  },
  {
    name: 'Camille Rousseau',
    role: 'Photographe',
    city: 'Nantes',
    stars: 5,
    text: "Mon portfolio en ligne en moins d'une minute. Sobre, élégant, exactement ce que je voulais. Exporter le ZIP et le mettre sur Netlify, facile.",
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&q=80',
  },
]

const PLANS: PricingPlan[] = [
  {
    key: 'free',
    name: 'Gratuit',
    desc: 'Pour tester sans engagement',
    monthlyPrice: 0,
    tokens: '8 000 tokens',
    features: ['1 génération de site', 'Éditeur visuel', 'Export ZIP'],
    cta: 'Commencer gratuitement',
    href: '/auth/signup',
  },
  {
    key: 'starter',
    name: 'Starter',
    desc: 'Pour les indépendants',
    monthlyPrice: 20,
    tokens: '800 000 tokens',
    features: ['~100 sites/mois', 'Éditeur visuel', 'Export ZIP', 'Support email'],
    cta: 'Choisir Starter',
    href: '/auth/signup?plan=starter',
  },
  {
    key: 'pro',
    name: 'Pro',
    desc: 'Pour les professionnels',
    monthlyPrice: 45,
    tokens: '2 400 000 tokens',
    features: [
      '~300 sites/mois',
      'Éditeur visuel avancé',
      'Export ZIP',
      'Support prioritaire',
      'Historique illimité',
    ],
    cta: 'Choisir Pro',
    href: '/auth/signup?plan=pro',
  },
  {
    key: 'agency',
    name: 'Agency',
    desc: 'Pour les agences',
    monthlyPrice: 250,
    tokens: '16 000 000 tokens',
    features: [
      'Volume illimité',
      'Tout le Pro',
      'Support dédié 24/7',
      'API access',
      'Revente autorisée',
      'White label',
    ],
    cta: 'Choisir Agency',
    href: '/auth/signup?plan=agency',
  },
]

/* ─── Main component ─────────────────────────────────────────── */
export default function HomePage() {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isAuth, setIsAuth] = useState(false)
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    const sb = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    sb.auth.getUser().then(({ data: { user } }) => setIsAuth(!!user))
  }, [])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target) }
      }),
      { threshold: 0.08 },
    )
    document.querySelectorAll<HTMLElement>('.reveal').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const handlePromptSubmit = (prompt: string) => {
    const dest = isAuth ? '/dashboard/nouveau' : '/auth/signup'
    router.push(`${dest}?prompt=${encodeURIComponent(prompt)}`)
  }

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--fg)' }}>

      {/* ══════════════════════════════════════════════════════════
          1. NAV sticky
      ══════════════════════════════════════════════════════════ */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          height: 60,
          background: scrolled ? 'var(--glass)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
          boxShadow: scrolled ? 'var(--shadow)' : 'none',
        }}
      >
        <nav className="max-w-6xl mx-auto px-5 h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center" style={{ textDecoration: 'none' }}>
            <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--fg)' }}>
              Create<span style={{ color: 'var(--accent)' }}>It</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm transition-colors"
                style={{ color: 'var(--fg-muted)', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-muted)')}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/auth/login"
              className="text-sm px-4 py-2 rounded-lg transition-all"
              style={{ color: 'var(--fg-muted)', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--fg)'; e.currentTarget.style.background = 'var(--surface-2)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--fg-muted)'; e.currentTarget.style.background = 'transparent' }}
            >
              Connexion
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm px-4 py-2 rounded-lg font-semibold text-white transition-all"
              style={{ background: 'var(--accent)', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
            >
              Commencer
            </Link>
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg"
            style={{ color: 'var(--fg)' }}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
      </header>

      {/* Mobile menu — plein écran glass */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 flex flex-col pt-[60px]"
            style={{
              background: 'var(--glass)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            <div className="flex flex-col p-6 gap-0">
              {NAV_LINKS.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-4 text-xl font-medium border-b"
                  style={{ color: 'var(--fg)', textDecoration: 'none', borderColor: 'var(--border)' }}
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="py-4 text-xl font-medium border-b"
                style={{ color: 'var(--fg)', textDecoration: 'none', borderColor: 'var(--border)' }}
              >
                Connexion
              </Link>
              <div className="pt-6 flex flex-col gap-3">
                <Link
                  href="/auth/signup"
                  onClick={() => setMobileOpen(false)}
                  className="text-center py-4 rounded-2xl text-white font-bold text-base"
                  style={{ background: 'var(--accent)', textDecoration: 'none' }}
                >
                  Commencer gratuitement
                </Link>
              </div>
              <div className="pt-5 flex items-center gap-2">
                <ThemeToggle />
                <span className="text-sm" style={{ color: 'var(--fg-muted)' }}>Thème</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════
          2. HERO — grande carte glass centrale
      ══════════════════════════════════════════════════════════ */}
      <AuroraBackground
        intensity="strong"
        className="min-h-screen flex items-center justify-center pt-[60px]"
      >
        <section className="w-full max-w-3xl mx-auto px-5 py-16">
          <GlassCard
            strong
            className="flex flex-col items-center text-center px-8 py-12 sm:px-14 sm:py-16"
          >
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-7"
              style={{
                background: 'var(--accent-light)',
                color: 'var(--accent)',
                border: '1px solid rgba(124,58,237,0.2)',
              }}
            >
              <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-current inline-block" />
              Générateur de sites web
            </motion.div>

            {/* H1 */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-5"
              style={{ color: 'var(--fg)' }}
            >
              Votre site web.{' '}
              <br className="hidden sm:block" />
              <span className="gradient-text">Décrit. Généré. Exporté.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.14 }}
              className="text-base sm:text-lg mb-8 max-w-xl"
              style={{ color: 'var(--fg-muted)' }}
            >
              Décrivez votre projet en français. Obtenez un site professionnel complet en moins de 30 secondes. Éditez, exportez le code, hébergez où vous voulez.
            </motion.p>

            {/* Prompt input */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full mb-5"
            >
              <PromptInput
                onSubmit={handlePromptSubmit}
                size="large"
                buttonLabel="Générer mon site"
              />
            </motion.div>

            {/* Sector pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.28 }}
              className="flex flex-wrap gap-2 justify-center mb-7"
            >
              {SECTORS.map(s => (
                <Link
                  key={s.slug}
                  href={`/exemples?secteur=${s.slug}`}
                  className="text-xs px-3 py-1.5 rounded-full transition-all"
                  style={{
                    background: 'var(--surface)',
                    color: 'var(--fg-muted)',
                    border: '1px solid var(--border)',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--fg-muted)' }}
                >
                  {s.label}
                </Link>
              ))}
            </motion.div>

            {/* Social proof */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.34 }}
              className="text-sm flex items-center gap-2"
              style={{ color: 'var(--fg-subtle)' }}
            >
              <span className="pulse-dot w-2 h-2 rounded-full inline-block" style={{ background: '#22c55e' }} />
              2 847 sites créés ce mois — sans carte bancaire requise
            </motion.p>
          </GlassCard>
        </section>
      </AuroraBackground>

      {/* ══════════════════════════════════════════════════════════
          3. STATS MARQUEE — défilement infini
      ══════════════════════════════════════════════════════════ */}
      <section
        className="reveal border-y overflow-hidden"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="carousel-wrapper py-7">
          <div className="carousel-track">
            {[...STATS, ...STATS].map((s, i) => (
              <div
                key={i}
                className="shrink-0 flex items-center gap-6 px-10"
              >
                <div className="text-center">
                  <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--accent)' }}>
                    {s.value}
                  </p>
                  <p className="text-xs mt-0.5 whitespace-nowrap" style={{ color: 'var(--fg-muted)' }}>{s.label}</p>
                </div>
                {/* Separator */}
                <span className="block w-px h-8" style={{ background: 'var(--border)' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          4. EXEMPLES
      ══════════════════════════════════════════════════════════ */}
      <section className="reveal py-20 px-5" style={{ background: 'var(--bg)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-3" style={{ color: 'var(--fg)' }}>
              Ce que vous pouvez créer
            </h2>
            <p className="text-base" style={{ color: 'var(--fg-muted)' }}>
              Des sites professionnels dans tous les secteurs, prêts en quelques secondes
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {EXAMPLES.map(ex => (
              <GlassCard key={ex.slug} hover className="overflow-hidden group">
                <Link href={`/exemples/${ex.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="relative overflow-hidden" style={{ height: 180 }}>
                    {/* Chrome bar */}
                    <div
                      className="flex items-center gap-1.5 px-3"
                      style={{ height: 24, background: '#1A1A1A', flexShrink: 0 }}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ background: '#FC6358' }} />
                      <span className="w-2 h-2 rounded-full" style={{ background: '#FEBC2E' }} />
                      <span className="w-2 h-2 rounded-full" style={{ background: '#28C840' }} />
                    </div>
                    {/* Screenshot */}
                    <div className="relative" style={{ height: 156, overflow: 'hidden' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ex.img}
                        alt={ex.label}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.08) 55%, transparent 100%)' }} />
                      <div className="absolute bottom-0 left-0 right-0 px-3 pb-2.5">
                        <p className="text-xs font-semibold text-white truncate">{ex.label}</p>
                        <p className="text-[10px] text-white/55 truncate mt-0.5">{ex.desc}</p>
                      </div>
                    </div>
                    {/* Hover overlay */}
                    <div
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: 'rgba(124,58,237,0.7)' }}
                    >
                      <span className="text-white text-sm font-semibold flex items-center gap-2">
                        Voir cet exemple <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold mb-1" style={{ color: 'var(--fg)' }}>{ex.label}</p>
                    <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>{ex.desc}</p>
                  </div>
                </Link>
              </GlassCard>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/exemples"
              className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
              style={{ color: 'var(--accent)', textDecoration: 'none' }}
            >
              Voir les 50+ exemples <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          5. COMMENT ÇA MARCHE
      ══════════════════════════════════════════════════════════ */}
      <section
        className="reveal py-20 px-5"
        style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-14" style={{ color: 'var(--fg)' }}>
            Simple comme bonjour
          </h2>
          <div className="flex flex-col md:flex-row">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className={cn(
                  'flex-1 relative',
                  i < STEPS.length - 1 && 'md:border-r',
                  i > 0 && 'border-t md:border-t-0',
                )}
                style={{ borderColor: 'var(--border)' }}
              >
                <div className={cn('py-8', i > 0 && 'md:pl-10', i < STEPS.length - 1 && 'md:pr-10')}>
                  <div
                    className="text-7xl font-black mb-4 leading-none select-none"
                    style={{ color: 'var(--surface-2)', fontVariantNumeric: 'tabular-nums' }}
                  >
                    {step.num}
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--fg)' }}>{step.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--fg-muted)' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          6. FEATURES 2×2
      ══════════════════════════════════════════════════════════ */}
      <section className="reveal py-20 px-5" style={{ background: 'var(--bg)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-3" style={{ color: 'var(--fg)' }}>
              Tout ce qu&apos;il vous faut
            </h2>
            <p className="text-base" style={{ color: 'var(--fg-muted)' }}>
              Des outils pensés pour créer, personnaliser et livrer sans friction
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <GlassCard key={i} hover className="p-7">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: 'var(--accent-light)' }}
                >
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--fg)' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--fg-muted)' }}>{f.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          7. POUR QUI
      ══════════════════════════════════════════════════════════ */}
      <section
        className="reveal py-20 px-5"
        style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-12" style={{ color: 'var(--fg)' }}>
            Fait pour vous
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PERSONAS.map(p => (
              <GlassCard key={p.title} hover className="p-7 flex flex-col gap-5">
                <div>
                  <div className="text-3xl mb-3">{p.icon}</div>
                  <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--fg)' }}>{p.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--fg-subtle)' }}>{p.subtitle}</p>
                </div>
                <ul className="flex flex-col gap-2.5 flex-1">
                  {p.bullets.map(b => (
                    <li key={b} className="flex items-start gap-2 text-sm leading-snug" style={{ color: 'var(--fg-muted)' }}>
                      <span className="mt-0.5 shrink-0 font-bold" style={{ color: 'var(--accent)' }}>✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
                <Link
                  href={p.href}
                  className="inline-flex items-center gap-1.5 text-sm font-medium pt-4"
                  style={{ color: 'var(--accent)', textDecoration: 'none', borderTop: '1px solid var(--border)' }}
                >
                  {p.cta} <ChevronRight size={13} />
                </Link>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          8. TARIFS APERÇU
      ══════════════════════════════════════════════════════════ */}
      <section id="tarifs" className="reveal py-20 px-5" style={{ background: 'var(--bg)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-3" style={{ color: 'var(--fg)' }}>
              Tarifs simples et transparents
            </h2>
            <p className="text-base mb-6" style={{ color: 'var(--fg-muted)' }}>
              Commencez gratuitement, évoluez selon vos besoins. Sans engagement.
            </p>

            {/* Billing toggle */}
            <div
              className="inline-flex items-center rounded-xl p-1 gap-1"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              {(['monthly', 'annual'] as const).map(b => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={
                    billing === b
                      ? { background: 'var(--accent)', color: 'white' }
                      : { color: 'var(--fg-muted)', background: 'transparent' }
                  }
                >
                  {b === 'monthly' ? 'Mensuel' : 'Annuel'}
                  {b === 'annual' && (
                    <span
                      className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        background: billing === 'annual' ? 'rgba(255,255,255,0.25)' : 'var(--accent-light)',
                        color: billing === 'annual' ? 'white' : 'var(--accent)',
                      }}
                    >
                      −20 %
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
            {PLANS.map(plan => (
              <PricingCard
                key={plan.key}
                plan={plan}
                highlighted={plan.key === 'pro'}
                billing={billing}
              />
            ))}
          </div>

          <p className="text-center mt-8 text-sm" style={{ color: 'var(--fg-subtle)' }}>
            Plan gratuit inclus — aucune carte bancaire requise.{' '}
            <Link href="/tarifs" className="underline" style={{ color: 'var(--accent)' }}>
              Comparer toutes les fonctionnalités →
            </Link>
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          9. FAQ accordion
      ══════════════════════════════════════════════════════════ */}
      <section
        className="reveal py-20 px-5"
        style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-10" style={{ color: 'var(--fg)' }}>
            Questions fréquentes
          </h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <GlassCard key={i} className="overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                  style={{ color: 'var(--fg)' }}
                  aria-expanded={openFaq === i}
                >
                  <span className="text-sm font-medium pr-4">{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className="shrink-0 transition-transform duration-200"
                    style={{
                      color: 'var(--fg-muted)',
                      transform: openFaq === i ? 'rotate(180deg)' : 'none',
                    }}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/dashboard/aide"
              className="text-sm font-medium"
              style={{ color: 'var(--accent)', textDecoration: 'none' }}
            >
              Voir toutes les questions →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          10. TÉMOIGNAGES — carrousel snap horizontal
      ══════════════════════════════════════════════════════════ */}
      <section className="reveal py-20" style={{ background: 'var(--bg)' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-10 px-5" style={{ color: 'var(--fg)' }}>
            Ce qu&apos;ils en disent
          </h2>

          {/* Horizontal snap scroll */}
          <div
            className="flex gap-5 overflow-x-auto pb-6 px-5"
            style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}
          >
            {TESTIMONIALS.map((t, i) => (
              <GlassCard
                key={i}
                className="shrink-0 p-6 flex flex-col"
                style={{
                  width: 'min(85vw, 340px)',
                  scrollSnapAlign: 'start',
                }}
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} size={13} fill="#F59E0B" style={{ color: '#F59E0B' }} />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm leading-relaxed flex-1 mb-5" style={{ color: 'var(--fg)' }}>
                  &ldquo;{t.text}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                      {t.role} · {t.city}
                    </p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Scroll hint on mobile */}
          <p className="text-center text-xs mt-2 sm:hidden" style={{ color: 'var(--fg-subtle)' }}>
            ← Faites glisser →
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          11. CTA FINAL — aurora fort
      ══════════════════════════════════════════════════════════ */}
      <AuroraBackground intensity="strong" className="py-28 px-5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold tracking-tight mb-4" style={{ color: 'var(--fg)' }}>
            Prêt à créer votre premier site ?
          </h2>
          <p className="text-lg mb-10" style={{ color: 'var(--fg-muted)' }}>
            Gratuit. Sans carte bancaire. Sans engagement.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-white font-bold text-base transition-all"
            style={{ background: 'var(--accent)', textDecoration: 'none', boxShadow: '0 0 40px rgba(124,58,237,0.45)' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--accent-hover)'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 0 56px rgba(124,58,237,0.55)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--accent)'
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = '0 0 40px rgba(124,58,237,0.45)'
            }}
          >
            Commencer gratuitement <ArrowRight size={16} />
          </Link>
        </div>
      </AuroraBackground>

      {/* ══════════════════════════════════════════════════════════
          12. FOOTER 4 colonnes
      ══════════════════════════════════════════════════════════ */}
      <footer
        className="py-14 px-5"
        style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Top grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">

            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="inline-block mb-3" style={{ textDecoration: 'none' }}>
                <span className="text-lg font-bold" style={{ color: 'var(--fg)' }}>
                  Create<span style={{ color: 'var(--accent)' }}>It</span>
                </span>
              </Link>
              <p className="text-sm mb-5" style={{ color: 'var(--fg-muted)' }}>
                Générez des sites web professionnels en quelques secondes.
              </p>
              {/* Socials */}
              <div className="flex items-center gap-3">
                <SocialLink href="#" label="Twitter / X">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117Z"/></svg>
                </SocialLink>
                <SocialLink href="#" label="LinkedIn">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </SocialLink>
                <SocialLink href="#" label="GitHub">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                </SocialLink>
              </div>
            </div>

            {/* Produit */}
            <FooterCol
              title="Produit"
              links={[
                { label: 'Exemples',  href: '/exemples' },
                { label: 'Tarifs',    href: '/tarifs' },
                { label: 'Dashboard', href: '/dashboard' },
              ]}
            />

            {/* Entreprise */}
            <FooterCol
              title="Entreprise"
              links={[
                { label: 'Blog',     href: '/blog' },
                { label: 'À propos', href: '/a-propos' },
                { label: 'Contact',  href: '/contact' },
              ]}
            />

            {/* Légal */}
            <FooterCol
              title="Légal"
              links={[
                { label: 'Mentions légales', href: '/legal/mentions-legales' },
                { label: 'CGV',              href: '/legal/cgv' },
                { label: 'Confidentialité',  href: '/legal/confidentialite' },
                { label: 'Cookies',          href: '/legal/cookies' },
              ]}
            />
          </div>

          {/* Bottom bar */}
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <p className="text-xs" style={{ color: 'var(--fg-subtle)' }}>
              © {new Date().getFullYear()} CreateIt — Tous droits réservés
            </p>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {/* Language stub */}
              <div
                className="flex items-center rounded-lg text-xs font-medium overflow-hidden"
                style={{ border: '1px solid var(--border)' }}
              >
                <span className="px-2.5 py-1.5 font-semibold" style={{ background: 'var(--surface-2)', color: 'var(--fg)' }}>FR</span>
                <span className="px-2.5 py-1.5" style={{ color: 'var(--fg-subtle)', cursor: 'not-allowed' }}>EN</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}

/* ─── Social link helper ─────────────────────────────────────── */
function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="flex items-center justify-center w-8 h-8 rounded-lg transition-all"
      style={{ color: 'var(--fg-subtle)', border: '1px solid var(--border)' }}
      onMouseEnter={e => {
        e.currentTarget.style.color = 'var(--fg)'
        e.currentTarget.style.borderColor = 'var(--border-hover)'
        e.currentTarget.style.background = 'var(--surface-2)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.color = 'var(--fg-subtle)'
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.background = 'transparent'
      }}
    >
      {children}
    </a>
  )
}

/* ─── Footer column helper ───────────────────────────────────── */
function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--fg-subtle)' }}>
        {title}
      </p>
      <ul className="space-y-2.5">
        {links.map(l => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-sm transition-colors"
              style={{ color: 'var(--fg-muted)', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-muted)')}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
