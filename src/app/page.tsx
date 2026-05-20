'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, X, ChevronDown, ChevronRight, ArrowRight,
  Zap, PenLine, Download, Lock, Star, Check,
} from 'lucide-react'
import AuroraBackground from '@/components/ui/AuroraBackground'
import GlassCard from '@/components/ui/GlassCard'
import PromptInput from '@/components/ui/PromptInput'
import PricingCard, { type PricingPlan } from '@/components/ui/PricingCard'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { cn } from '@/lib/utils'

/* ─── Font token ─────────────────────────────────────────────── */
const F = "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

/* ─── Data ───────────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: 'Exemples', href: '/exemples' },
  { label: 'Tarifs',   href: '/tarifs' },
  { label: 'À propos', href: '/a-propos' },
]

const SECTORS = [
  { label: 'Restaurant',  slug: 'restaurant' },
  { label: 'Portfolio',   slug: 'portfolio' },
  { label: 'Boutique',    slug: 'boutique' },
  { label: 'Agence',      slug: 'agence' },
  { label: 'Blog',        slug: 'blog' },
  { label: 'Coach',       slug: 'coach' },
]

const STATS = [
  { value: '2 847', label: 'sites créés ce mois' },
  { value: '4.9/5', label: 'note moyenne' },
  { value: '< 30s', label: 'temps de génération' },
  { value: '100%',  label: 'code exportable' },
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
    title: '100% à vous, zéro lock-in',
    desc: "Vous possédez le code. Aucun abonnement d'hébergement imposé, aucune plateforme propriétaire.",
  },
]

const PERSONAS = [
  {
    icon: '💼',
    title: 'Freelance',
    desc: 'Livrez des sites à vos clients en une journée, pas en trois semaines. Augmentez votre marge sans augmenter vos heures.',
    cta: 'Voir un portfolio',
    href: '/exemples?secteur=portfolio',
  },
  {
    icon: '🚀',
    title: 'Entrepreneur',
    desc: "Testez votre idée avec une landing page soignée en 30 secondes. Pas besoin d'agence ni de développeur.",
    cta: 'Voir une startup',
    href: '/exemples?secteur=agence',
  },
  {
    icon: '🏢',
    title: 'Agence',
    desc: 'Multipliez votre capacité de production. Générez le premier draft, finalisez à la main. Le plan Agency est fait pour vous.',
    cta: 'Voir un exemple agence',
    href: '/exemples?secteur=agence',
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
    text: 'Notre landing page convertit mieux que celle faite par notre agence à 4 000€. On a tout généré et modifié en interne.',
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
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const revealRefs = useRef<HTMLElement[]>([])

  /* auth check */
  useEffect(() => {
    const sb = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    sb.auth.getUser().then(({ data: { user } }) => setIsAuth(!!user))
  }, [])

  /* scroll listener for nav */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  /* scroll reveal */
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed')
          obs.unobserve(e.target)
        }
      }),
      { threshold: 0.1 },
    )
    document.querySelectorAll<HTMLElement>('.reveal').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  /* auto-advance testimonials */
  useEffect(() => {
    const id = setInterval(() => setActiveTestimonial(i => (i + 1) % TESTIMONIALS.length), 5000)
    return () => clearInterval(id)
  }, [])

  const handlePromptSubmit = (prompt: string) => {
    const dest = isAuth ? '/dashboard/nouveau' : '/auth/signup'
    router.push(`${dest}?prompt=${encodeURIComponent(prompt)}`)
  }

  return (
    <div style={{ fontFamily: F, background: 'var(--bg)', color: 'var(--fg)' }}>

      {/* ══════════════════════════════════════════════════════════
          1. NAV
      ══════════════════════════════════════════════════════════ */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          height: 60,
          background: scrolled
            ? 'var(--glass)'
            : 'transparent',
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
                className="text-sm transition-colors hover:opacity-100"
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
              className="text-sm px-4 py-2 rounded-lg transition-colors"
              style={{
                color: 'var(--fg-muted)',
                textDecoration: 'none',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--fg)'
                e.currentTarget.style.background = 'var(--surface-2)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--fg-muted)'
                e.currentTarget.style.background = 'transparent'
              }}
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

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 flex flex-col pt-[60px]"
            style={{ background: 'var(--bg)' }}
          >
            <div className="flex flex-col p-6 gap-1">
              {NAV_LINKS.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-4 text-lg border-b"
                  style={{ color: 'var(--fg)', textDecoration: 'none', borderColor: 'var(--border)' }}
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="py-4 text-lg border-b"
                style={{ color: 'var(--fg)', textDecoration: 'none', borderColor: 'var(--border)' }}
              >
                Connexion
              </Link>
              <div className="pt-6 flex flex-col gap-3">
                <Link
                  href="/auth/signup"
                  onClick={() => setMobileOpen(false)}
                  className="text-center py-3.5 rounded-xl text-white font-semibold"
                  style={{ background: 'var(--accent)', textDecoration: 'none' }}
                >
                  Commencer gratuitement
                </Link>
              </div>
              <div className="pt-4 flex items-center gap-2">
                <ThemeToggle />
                <span className="text-sm" style={{ color: 'var(--fg-muted)' }}>Thème</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════
          2. HERO
      ══════════════════════════════════════════════════════════ */}
      <AuroraBackground
        intensity="strong"
        className="min-h-screen flex items-center justify-center pt-[60px]"
      >
        <section className="w-full max-w-3xl mx-auto px-5 py-20 flex flex-col items-center text-center">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
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
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6"
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
            initial={{ opacity: 0, y: 12 }}
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
            className="flex flex-wrap gap-2 justify-center mb-8"
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
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent)'
                  e.currentTarget.style.color = 'var(--accent)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.color = 'var(--fg-muted)'
                }}
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
        </section>
      </AuroraBackground>

      {/* ══════════════════════════════════════════════════════════
          3. STATS STRIP
      ══════════════════════════════════════════════════════════ */}
      <section
        className="reveal border-y py-10"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-4xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <p className="text-3xl font-bold tracking-tight mb-1" style={{ color: 'var(--accent)' }}>
                {s.value}
              </p>
              <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>{s.label}</p>
            </div>
          ))}
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
              <GlassCard
                key={ex.slug}
                hover
                className="overflow-hidden group"
              >
                <Link href={`/exemples/${ex.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="relative overflow-hidden" style={{ height: 180 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ex.img}
                      alt={ex.label}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Browser chrome overlay */}
                    <div
                      className="absolute inset-x-0 top-0 flex items-center gap-1.5 px-3 py-2"
                      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400 opacity-80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 opacity-80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-400 opacity-80" />
                    </div>
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
              className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
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
          <div className="flex flex-col md:flex-row gap-0">
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
                  {/* Big number background */}
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
              Tout ce qu'il vous faut
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
              <GlassCard key={p.title} hover className="p-7 flex flex-col">
                <div className="text-3xl mb-4">{p.icon}</div>
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--fg)' }}>{p.title}</h3>
                <p className="text-sm leading-relaxed flex-1 mb-5" style={{ color: 'var(--fg-muted)' }}>{p.desc}</p>
                <Link
                  href={p.href}
                  className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
                  style={{ color: 'var(--accent)', textDecoration: 'none' }}
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
                  {b === 'monthly' ? 'Mensuel' : 'Annuel'}{' '}
                  {b === 'annual' && (
                    <span
                      className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        background: billing === 'annual' ? 'rgba(255,255,255,0.25)' : 'var(--accent-light)',
                        color: billing === 'annual' ? 'white' : 'var(--accent)',
                      }}
                    >
                      -20%
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
          9. FAQ
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
                      <p
                        className="px-5 pb-5 text-sm leading-relaxed"
                        style={{ color: 'var(--fg-muted)' }}
                      >
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
          10. TÉMOIGNAGES
      ══════════════════════════════════════════════════════════ */}
      <section className="reveal py-20 px-5" style={{ background: 'var(--bg)' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-10" style={{ color: 'var(--fg)' }}>
            Ce qu&apos;ils en disent
          </h2>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <GlassCard
                key={i}
                className={cn(
                  'p-6 cursor-pointer transition-all duration-300',
                  activeTestimonial === i && 'ring-2 ring-[var(--accent)]',
                )}
                onClick={() => setActiveTestimonial(i)}
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} size={13} fill="#F59E0B" style={{ color: '#F59E0B' }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--fg)' }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-9 h-9 rounded-full object-cover"
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

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: activeTestimonial === i ? 20 : 6,
                  height: 6,
                  background: activeTestimonial === i ? 'var(--accent)' : 'var(--border)',
                }}
                aria-label={`Témoignage ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          11. CTA FINAL
      ══════════════════════════════════════════════════════════ */}
      <AuroraBackground intensity="strong" className="py-24 px-5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold tracking-tight mb-4" style={{ color: 'var(--fg)' }}>
            Prêt à créer votre premier site ?
          </h2>
          <p className="text-lg mb-8" style={{ color: 'var(--fg-muted)' }}>
            Gratuit. Sans carte bancaire. Sans engagement.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-base transition-all"
            style={{ background: 'var(--accent)', textDecoration: 'none', boxShadow: '0 0 32px rgba(124,58,237,0.4)' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--accent-hover)'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 0 48px rgba(124,58,237,0.5)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--accent)'
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = '0 0 32px rgba(124,58,237,0.4)'
            }}
          >
            Commencer gratuitement <ArrowRight size={16} />
          </Link>
        </div>
      </AuroraBackground>

      {/* ══════════════════════════════════════════════════════════
          12. FOOTER
      ══════════════════════════════════════════════════════════ */}
      <footer
        className="py-12 px-5"
        style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Top grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="inline-block mb-3" style={{ textDecoration: 'none' }}>
                <span className="text-lg font-bold" style={{ color: 'var(--fg)' }}>
                  Create<span style={{ color: 'var(--accent)' }}>It</span>
                </span>
              </Link>
              <p className="text-sm mb-4" style={{ color: 'var(--fg-muted)' }}>
                Générez des sites web professionnels en quelques secondes.
              </p>
            </div>

            {/* Produit */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--fg-subtle)' }}>
                Produit
              </p>
              <ul className="space-y-2.5">
                {[
                  { label: 'Exemples',    href: '/exemples' },
                  { label: 'Tarifs',      href: '/tarifs' },
                  { label: 'Dashboard',   href: '/dashboard' },
                ].map(l => (
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

            {/* Entreprise */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--fg-subtle)' }}>
                Entreprise
              </p>
              <ul className="space-y-2.5">
                {[
                  { label: 'À propos',  href: '/a-propos' },
                  { label: 'Contact',   href: '/contact' },
                ].map(l => (
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

            {/* Légal */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--fg-subtle)' }}>
                Légal
              </p>
              <ul className="space-y-2.5">
                {[
                  { label: 'Mentions légales',  href: '/legal/mentions-legales' },
                  { label: 'CGV',               href: '/legal/cgv' },
                  { label: 'Confidentialité',   href: '/legal/confidentialite' },
                  { label: 'Cookies',           href: '/legal/cookies' },
                ].map(l => (
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
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
