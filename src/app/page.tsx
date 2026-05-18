"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

/* ─── Font token ─────────────────────────────────────────────────
   CSS variable injected by next/font/google in layout.tsx          */
const F = "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";


const TYPEWRITER_DEFAULT = [
  "Un restaurant gastronomique à Paris...",
  "Un portfolio pour photographe minimaliste...",
  "Une boutique de bijoux artisanaux...",
  "Un cabinet d'architecte élégant...",
  "Une landing page SaaS qui convertit...",
  "Un blog de voyage et lifestyle...",
];

interface LandingContent {
  banner?: { visible?: boolean; text?: string; buttonText?: string }
  hero?: { title?: string; subtitle?: string; buttonText?: string; typewriter?: string[]; socialProof?: string }
  howItWorks?: { title?: string; steps?: Array<{ num: string; title: string; desc: string }> }
  testimonials?: Array<{ text: string; name: string; role: string }>
  cta?: { title?: string; subtitle?: string; buttonText?: string }
}

/* ─── Data ───────────────────────────────────────────────────────── */

const TAGS = ["Restaurant", "Portfolio", "Boutique", "Agence", "Blog", "Coach"];

const TAG_EXAMPLES: Record<string, string> = {
  Restaurant: "Site pour un restaurant gastronomique français à Paris",
  Portfolio:  "Portfolio pour un photographe lifestyle minimaliste",
  Boutique:   "Boutique en ligne d'artisanat et déco maison",
  Agence:     "Site pour une agence de design et communication créative",
  Blog:       "Blog de voyage avec articles et photos",
  Coach:      "Site de coaching professionnel et développement personnel",
};

const STEPS_DEFAULT = [
  { num: "01", title: "Décrivez",       desc: "Tapez ce que vous voulez. Un restaurant, un portfolio, une boutique..." },
  { num: "02", title: "On crée",        desc: "Votre site est généré en quelques secondes, complet et professionnel." },
  { num: "03", title: "Vous exportez",  desc: "Téléchargez votre site en ZIP. Prêt à mettre en ligne ou à revendre." },
];

const PRICING = [
  {
    name: "Gratuit",
    label: "0€",
    period: true,
    tokens: "8 000 tokens",
    features: ["Génération de site", "Export ZIP", "Éditeur visuel"],
    cta: "Commencer gratuitement",
    primary: false,
    highlight: false,
    href: "/auth/signup",
  },
  {
    name: "Starter",
    label: "20€",
    period: true,
    tokens: "800 000 tokens",
    features: ["Tout du gratuit", "Sites illimités en édition", "Support email"],
    cta: "Choisir Starter",
    primary: false,
    highlight: false,
    href: "/auth/signup?plan=starter",
  },
  {
    name: "Pro",
    label: "45€",
    period: true,
    tokens: "2 400 000 tokens",
    features: ["Tout du Starter", "Modification avancée", "Support prioritaire"],
    cta: "Choisir Pro",
    primary: true,
    highlight: true,
    href: "/auth/signup?plan=pro",
  },
  {
    name: "Agency",
    label: "250€",
    period: true,
    tokens: "16 000 000 tokens",
    features: ["Tout du Pro", "Volume illimité", "Account manager"],
    cta: "Choisir Agency",
    primary: false,
    highlight: false,
    href: "/auth/signup?plan=agency",
  },
];

const TESTIMONIALS_DEFAULT = [
  {
    name: "Sophie Martin",
    role: "Restauratrice",
    text: "Mon site était prêt en quelques secondes. Exactement le rendu que j'avais en tête, sans m'y connaître en technique.",
    stars: 5,
  },
  {
    name: "Lucas Bernard",
    role: "Freelance designer",
    text: "J'ai généré mon portfolio complet juste en décrivant mon style. Le résultat était vraiment bluffant.",
    stars: 5,
  },
  {
    name: "Marie Dubois",
    role: "Fondatrice startup",
    text: "Notre landing page convertit mieux que celle faite par notre agence, pour une fraction du prix.",
    stars: 5,
  },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */

export default function HomePage() {
  const router = useRouter();
  const [prompt, setPrompt]               = useState("");
  const [navOpaque, setNavOpaque]         = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputFocused, setInputFocused]   = useState(false);
  const [phIdx, setPhIdx]                 = useState(0);
  const [phOpacity, setPhOpacity]         = useState(1);
  const [cms, setCms]                     = useState<LandingContent>({});

  /* ── Init: banner visibility + auth check + CMS content ── */
  useEffect(() => {
    if (localStorage.getItem("promo_banner_dismissed") !== "1") {
      setBannerVisible(true);
    }
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user);
    });
    fetch("/api/admin/landing-content")
      .then((r) => r.json())
      .then((data) => { if (data) setCms(data); })
      .catch(() => {});
  }, []);

  /* ── Navbar becomes opaque on scroll ── */
  useEffect(() => {
    const onScroll = () => setNavOpaque(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Vanilla scroll reveal (IntersectionObserver) ── */
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  /* ── Typewriter placeholder cycle ── */
  useEffect(() => {
    const id = setInterval(() => {
      setPhOpacity(0);
      setTimeout(() => {
        setPhIdx((i) => i + 1);
        setPhOpacity(1);
      }, 300);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  /* ── Generate handler ── */
  const handleGenerate = () => {
    if (!prompt.trim()) return;
    const encoded = encodeURIComponent(prompt.trim());
    router.push(isAuthenticated ? `/generate?prompt=${encoded}` : `/try?prompt=${encoded}`);
  };

  /* ── CMS-resolved values (fallback to defaults if not set) ── */
  const cmsBannerText    = cms.banner?.text      ?? "🎁 Offre de lancement — 20% de réduction à vie avec votre code de bienvenue";
  const cmsBannerBtn     = cms.banner?.buttonText ?? "En profiter";
  const cmsBannerOn      = cms.banner?.visible    ?? true;
  const cmsHeroTitle     = cms.hero?.title        ?? "Votre site en quelques mots.";
  const cmsHeroSubtitle  = cms.hero?.subtitle     ?? "Décrivez ce que vous voulez, on s'occupe du reste.";
  const cmsHeroBtn       = cms.hero?.buttonText   ?? "Créer →";
  const cmsTypewriter    = cms.hero?.typewriter   ?? TYPEWRITER_DEFAULT;
  const cmsSocialProof   = cms.hero?.socialProof  ?? "Plus de 2 800 sites créés ce mois";
  const cmsHowTitle      = cms.howItWorks?.title  ?? "Simple comme bonjour";
  const cmsSteps         = cms.howItWorks?.steps  ?? STEPS_DEFAULT;
  const cmsTestimonials  = (cms.testimonials      ?? TESTIMONIALS_DEFAULT).map((t) => ({ ...t, stars: 5 }));
  const cmsCtaTitle      = cms.cta?.title         ?? "Créez votre premier site maintenant.";
  const cmsCtaSubtitle   = cms.cta?.subtitle      ?? "Gratuit, sans carte bancaire.";
  const cmsCtaBtn        = cms.cta?.buttonText    ?? "Commencer gratuitement";

  /* ── Layout offsets ── */
  const bannerH   = 36;
  const navH      = 56;
  const showBanner = bannerVisible && cmsBannerOn;
  const navTop    = showBanner ? bannerH : 0;
  const heroPadT  = showBanner ? bannerH + navH + 56 : navH + 56;

  /* ── Prompt bar border/shadow ── */
  const promptBorder = inputFocused
    ? { border: "2px solid #2563eb", boxShadow: "0 0 0 4px rgba(37,99,235,0.1), 0 2px 8px rgba(0,0,0,0.06), 0 8px 32px rgba(37,99,235,0.08)" }
    : { border: "2px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.05), 0 4px 24px rgba(0,0,0,0.06)" };

  return (
    <div className="light-page" style={{ fontFamily: F, background: "#ffffff", color: "#0f172a", overflowX: "hidden" }}>

      {/* ══════════════════════════════════════════════════════════
          PROMO BANNER
      ══════════════════════════════════════════════════════════ */}
      {showBanner && (
        <div
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-3 px-4"
          style={{ height: bannerH, background: "#eff6ff", borderBottom: "1px solid #bfdbfe" }}
        >
          <p style={{ fontSize: 13, color: "#1d4ed8", fontFamily: F }}>
            {cmsBannerText}
          </p>
          <Link
            href="/auth/signup"
            style={{ fontSize: 13, color: "#2563eb", textDecoration: "underline", fontFamily: F, fontWeight: 500 }}
          >
            {cmsBannerBtn}
          </Link>
          <button
            onClick={() => {
              localStorage.setItem("promo_banner_dismissed", "1");
              setBannerVisible(false);
            }}
            className="absolute right-4 flex items-center justify-center w-6 h-6 rounded transition-colors hover:bg-blue-100"
            style={{ color: "#64748b", fontSize: 16, lineHeight: 1 }}
            aria-label="Fermer la bannière"
          >
            ×
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════════════════════ */}
      <nav
        className="fixed left-0 right-0 z-40 transition-all duration-200"
        style={{
          top: navTop,
          height: navH,
          background: navOpaque ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.98)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <div
          className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between"
          style={{ fontFamily: F }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center" style={{ textDecoration: "none" }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", letterSpacing: -0.3 }}>
              Create<span style={{ color: "#2563eb" }}>It</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#exemples"      style={{ fontSize: 14, color: "#64748b", textDecoration: "none" }} className="hover:text-[#0f172a] transition-colors">Exemples</a>
            <a href="#tarifs"        style={{ fontSize: 14, color: "#64748b", textDecoration: "none" }} className="hover:text-[#0f172a] transition-colors">Tarifs</a>
            <Link href="/auth/login" style={{ fontSize: 14, color: "#64748b", textDecoration: "none" }} className="hover:text-[#0f172a] transition-colors">Se connecter</Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Link
              href="/auth/signup"
              className="transition-colors"
              style={{ fontSize: 14, fontWeight: 500, color: "white", background: "#0f172a", padding: "8px 16px", borderRadius: 6, textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#1e293b")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#0f172a")}
            >
              Commencer
            </Link>
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setMobileNavOpen((o) => !o)}
            className="md:hidden flex flex-col items-center justify-center w-10 h-10 gap-1.5"
            aria-label="Menu"
          >
            <span className="block w-5 h-0.5 transition-all" style={{ background: "#0f172a" }} />
            <span className="block w-5 h-0.5 transition-all" style={{ background: "#0f172a" }} />
            <span className="block w-5 h-0.5 transition-all" style={{ background: "#0f172a" }} />
          </button>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════
          MOBILE MENU (full screen overlay)
      ══════════════════════════════════════════════════════════ */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-30 flex flex-col"
          style={{ background: "#ffffff", paddingTop: navTop + navH, fontFamily: F }}
        >
          <div className="flex flex-col p-6 gap-1">
            <a
              href="#exemples"
              onClick={() => setMobileNavOpen(false)}
              className="py-4 text-lg border-b"
              style={{ color: "#0f172a", textDecoration: "none", borderColor: "#f1f5f9" }}
            >Exemples</a>
            <a
              href="#tarifs"
              onClick={() => setMobileNavOpen(false)}
              className="py-4 text-lg border-b"
              style={{ color: "#0f172a", textDecoration: "none", borderColor: "#f1f5f9", display: "block" }}
            >Tarifs</a>
            <Link
              href="/auth/login"
              onClick={() => setMobileNavOpen(false)}
              className="py-4 text-lg border-b"
              style={{ color: "#0f172a", textDecoration: "none", borderColor: "#f1f5f9" }}
            >Se connecter</Link>
            <div className="pt-6 flex flex-col gap-3">
              <Link
                href="/auth/signup"
                onClick={() => setMobileNavOpen(false)}
                className="text-center py-3 rounded-lg text-white font-medium"
                style={{ background: "#0f172a", textDecoration: "none" }}
              >Commencer gratuitement</Link>
            </div>
          </div>
          <button
            onClick={() => setMobileNavOpen(false)}
            className="absolute top-4 right-5 text-2xl"
            style={{ color: "#94a3b8", top: navTop + navH + 12 }}
            aria-label="Fermer le menu"
          >×</button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════ */}
      <section
        className="flex flex-col items-center text-center px-6"
        style={{ paddingTop: heroPadT, paddingBottom: 80, background: "#ffffff" }}
      >
        {/* H1 title */}
        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 42px)",
            fontWeight: 700,
            color: "#0f172a",
            letterSpacing: "-0.5px",
            marginBottom: 10,
            fontFamily: F,
            lineHeight: 1.15,
            animation: "heroFadeIn 0.5s ease-out both",
          }}
        >
          {cmsHeroTitle}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 16,
            color: "#64748b",
            marginBottom: 28,
            fontFamily: F,
            animation: "heroFadeIn 0.5s ease-out 0.08s both",
          }}
        >
          {cmsHeroSubtitle}
        </p>

        {/* Prompt bar */}
        <div
          className="w-full"
          style={{
            maxWidth: 640,
            marginBottom: 8,
            animation: "heroFadeIn 0.5s ease-out 0.15s both",
          }}
        >
          <div
            className="flex items-center"
            style={{
              height: 68,
              background: "white",
              borderRadius: 16,
              transition: "border 0.15s, box-shadow 0.15s",
              ...promptBorder,
            }}
          >
            {/* Input with animated placeholder overlay */}
            <div className="flex-1 relative" style={{ overflow: "hidden" }}>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder=""
                className="w-full bg-transparent outline-none"
                style={{
                  padding: "0 18px",
                  fontSize: 16,
                  color: "#0f172a",
                  fontFamily: F,
                  height: 68,
                }}
              />
              {!prompt && (
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: 18,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 16,
                    color: "#94a3b8",
                    fontFamily: F,
                    pointerEvents: "none",
                    opacity: phOpacity,
                    transition: "opacity 0.3s ease",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    maxWidth: "calc(100% - 36px)",
                  }}
                >
                  {cmsTypewriter[phIdx % cmsTypewriter.length]}
                </span>
              )}
            </div>
            <button
              onClick={handleGenerate}
              className="shrink-0"
              style={{
                height: 52,
                padding: "0 28px",
                margin: 8,
                background: "#2563eb",
                color: "white",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 600,
                fontFamily: F,
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "background 0.15s, transform 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#1d4ed8";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#2563eb";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {cmsHeroBtn}
            </button>
          </div>
        </div>

        {/* Suggestion tags */}
        <div
          className="flex flex-wrap gap-2 justify-center"
          style={{ marginBottom: 32, animation: "heroFadeIn 0.5s ease-out 0.2s both" }}
        >
          {TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setPrompt(TAG_EXAMPLES[tag])}
              className="transition-colors"
              style={{
                fontSize: 12,
                color: "#64748b",
                background: "#f1f5f9",
                padding: "4px 12px",
                borderRadius: 20,
                border: "none",
                cursor: "pointer",
                fontFamily: F,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e8f0")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f5f9")}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Social proof */}
        <p
          style={{
            fontSize: 13,
            color: "#94a3b8",
            fontFamily: F,
            animation: "heroFadeIn 0.5s ease-out 0.3s both",
          }}
        >
          {cmsSocialProof}
        </p>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION A — EXAMPLES IMAGE GRID
      ══════════════════════════════════════════════════════════ */}
      <section
        id="exemples"
        className="reveal"
        style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", padding: "80px 24px" }}
      >
        <div className="max-w-5xl mx-auto" style={{ fontFamily: F }}>
          <div className="text-center" style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 28, fontWeight: 600, color: "#0f172a", letterSpacing: -0.3, marginBottom: 8 }}>
              Ce que vous pouvez créer
            </h2>
            <p style={{ fontSize: 14, color: "#64748b" }}>
              Des sites professionnels dans tous les secteurs, prêts en quelques secondes
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80", label: "Restaurant gastronomique", desc: "Site élégant avec menu et réservations en ligne" },
              { img: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80", label: "Cabinet d'architecte", desc: "Portfolio visuel avec galerie de réalisations" },
              { img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80", label: "Startup tech", desc: "Landing page SaaS moderne qui convertit" },
              { img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80", label: "Boutique artisanale", desc: "E-commerce avec catalogue et prise de commande" },
              { img: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=600&q=80", label: "Cabinet médical", desc: "Site professionnel avec prise de rendez-vous" },
              { img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80", label: "Coach sportif", desc: "Site énergique avec programmes et tarifs" },
            ].map((item, i) => (
              <div
                key={i}
                style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0", background: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
              >
                <div style={{ height: 180, overflow: "hidden" }}>
                  <img
                    src={item.img}
                    alt={item.label}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.3s ease" }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  />
                </div>
                <div style={{ padding: "16px 18px" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 4, fontFamily: F }}>{item.label}</p>
                  <p style={{ fontSize: 13, color: "#64748b", fontFamily: F }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION B — FEATURES 2×2
      ══════════════════════════════════════════════════════════ */}
      <section
        className="reveal"
        style={{ background: "#ffffff", padding: "80px 24px", borderBottom: "1px solid #e2e8f0" }}
      >
        <div className="max-w-4xl mx-auto" style={{ fontFamily: F }}>
          <div className="text-center" style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 28, fontWeight: 600, color: "#0f172a", letterSpacing: -0.3, marginBottom: 8 }}>
              Tout ce qu&apos;il vous faut
            </h2>
            <p style={{ fontSize: 14, color: "#64748b" }}>
              Des outils puissants pour créer, personnaliser et livrer
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                ),
                title: "Génération IA ultra-rapide",
                desc: "Décrivez votre projet en quelques mots. Notre IA génère un site complet et professionnel en moins de 30 secondes.",
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                ),
                title: "Éditeur visuel intégré",
                desc: "Modifiez les textes, images et couleurs directement sur votre site. Aucune connaissance technique requise.",
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                ),
                title: "Export ZIP en un clic",
                desc: "Téléchargez votre site en HTML/CSS/JS prêt à l'emploi. Hébergez-le où vous voulez, sans abonnement supplémentaire.",
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ),
                title: "Designs sur-mesure",
                desc: "Chaque site est unique — typographie, couleurs et mise en page adaptées à votre secteur et votre identité.",
              },
            ].map((feat, i) => (
              <div
                key={i}
                style={{ padding: 28, background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}
              >
                <div
                  style={{ width: 44, height: 44, borderRadius: 10, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}
                >
                  {feat.icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", marginBottom: 8, fontFamily: F }}>{feat.title}</h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, fontFamily: F }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════════ */}
      <section
        className="reveal"
        style={{ background: "#ffffff", padding: "80px 24px" }}
      >
        <div className="max-w-3xl mx-auto" style={{ fontFamily: F }}>
          <h2
            className="text-center"
            style={{ fontSize: 28, fontWeight: 600, color: "#0f172a", letterSpacing: -0.3, marginBottom: 48 }}
          >
            {cmsHowTitle}
          </h2>

          <div className="flex flex-col md:flex-row">
            {cmsSteps.map((step, i) => (
              <div
                key={i}
                className={`flex-1 ${i < 2 ? "md:border-r border-[#e2e8f0]" : ""} ${i > 0 ? "border-t md:border-t-0" : ""}`}
                style={{
                  padding: "0 0 32px",
                  borderColor: "#e2e8f0",
                }}
              >
                <div
                  style={{
                    paddingTop: i > 0 ? 32 : 0,
                    paddingLeft: i > 0 ? 0 : 0,
                    paddingRight: 0,
                  }}
                  className={`${i > 0 ? "md:pl-10 pt-8 md:pt-0" : ""} ${i < 2 ? "md:pr-10" : ""}`}
                >
                  <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, letterSpacing: "0.1em", marginBottom: 12 }}>
                    {step.num}
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: "#0f172a", marginBottom: 8 }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          PRICING
      ══════════════════════════════════════════════════════════ */}
      <section
        id="tarifs"
        className="reveal"
        style={{ background: "#f8fafc", padding: "80px 24px", borderTop: "1px solid #e2e8f0" }}
      >
        <div className="max-w-5xl mx-auto" style={{ fontFamily: F }}>
          <div className="text-center" style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 28, fontWeight: 600, color: "#0f172a", letterSpacing: -0.3, marginBottom: 8 }}>
              Tarifs simples et transparents
            </h2>
            <p style={{ fontSize: 14, color: "#64748b" }}>
              Commencez gratuitement, évoluez selon vos besoins
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className="relative rounded-xl bg-white"
                style={{
                  padding: 24,
                  border: plan.highlight ? "2px solid #2563eb" : "1px solid #e2e8f0",
                }}
              >
                {plan.highlight && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-medium text-white"
                    style={{ background: "#2563eb", fontSize: 12, fontFamily: F }}
                  >
                    Populaire
                  </div>
                )}

                <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginBottom: 8, fontFamily: F }}>{plan.name}</p>

                <div className="flex items-baseline gap-1" style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", letterSpacing: -0.5, fontFamily: F }}>{plan.label}</span>
                  {plan.period && <span style={{ fontSize: 13, color: "#94a3b8", fontFamily: F }}>/mois</span>}
                </div>

                <p style={{ fontSize: 12, color: "#2563eb", fontWeight: 500, marginBottom: 20, fontFamily: F }}>{plan.tokens}</p>

                <ul className="space-y-2.5" style={{ marginBottom: 24 }}>
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2" style={{ fontSize: 13, color: "#64748b", fontFamily: F }}>
                      <span style={{ color: "#059669", marginTop: 1 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className="block text-center rounded-lg transition-colors"
                  style={{
                    padding: "10px 0",
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: F,
                    textDecoration: "none",
                    background: plan.primary ? "#2563eb" : "transparent",
                    color: plan.primary ? "white" : "#0f172a",
                    border: plan.primary ? "none" : "1px solid #e2e8f0",
                  }}
                  onMouseEnter={(e) => {
                    if (plan.primary) e.currentTarget.style.background = "#1d4ed8";
                    else e.currentTarget.style.borderColor = "#cbd5e1";
                  }}
                  onMouseLeave={(e) => {
                    if (plan.primary) e.currentTarget.style.background = "#2563eb";
                    else e.currentTarget.style.borderColor = "#e2e8f0";
                  }}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════════════ */}
      <section
        className="reveal"
        style={{ background: "#ffffff", padding: "80px 24px" }}
      >
        <div className="max-w-5xl mx-auto" style={{ fontFamily: F }}>
          <h2
            className="text-center"
            style={{ fontSize: 28, fontWeight: 600, color: "#0f172a", letterSpacing: -0.3, marginBottom: 48 }}
          >
            Ce qu&apos;ils en disent
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cmsTestimonials.map((t, i) => (
              <div
                key={i}
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  padding: 24,
                  fontFamily: F,
                }}
              >
                <div className="flex gap-0.5" style={{ marginBottom: 16 }}>
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <span key={j} style={{ color: "#f59e0b", fontSize: 14 }}>★</span>
                  ))}
                </div>
                <p style={{ fontSize: 15, color: "#0f172a", lineHeight: 1.7, marginBottom: 20 }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{t.name}</p>
                  <p style={{ fontSize: 13, color: "#64748b" }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════════════════════ */}
      <section
        className="reveal text-center"
        style={{ background: "#0f172a", padding: "80px 24px", fontFamily: F }}
      >
        <h2 style={{ fontSize: 32, fontWeight: 600, color: "white", letterSpacing: -0.3, marginBottom: 12 }}>
          {cmsCtaTitle}
        </h2>
        <p style={{ fontSize: 15, color: "#94a3b8", marginBottom: 32 }}>
          {cmsCtaSubtitle}
        </p>
        <Link
          href="/auth/signup"
          className="inline-block transition-colors"
          style={{
            background: "white",
            color: "#0f172a",
            padding: "12px 32px",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 15,
            fontFamily: F,
            textDecoration: "none",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
        >
          {cmsCtaBtn}
        </Link>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════ */}
      <footer style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0", padding: "32px 24px" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4" style={{ fontFamily: F }}>
          {/* Logo + tagline */}
          <div>
            <Link href="/" style={{ textDecoration: "none" }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                Create<span style={{ color: "#2563eb" }}>It</span>
              </span>
            </Link>
            <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
              Créez des sites en quelques secondes.
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link href="/pricing"    style={{ fontSize: 14, color: "#64748b", textDecoration: "none" }} className="hover:text-[#0f172a] transition-colors">Tarifs</Link>
            <Link href="/auth/login" style={{ fontSize: 14, color: "#64748b", textDecoration: "none" }} className="hover:text-[#0f172a] transition-colors">Connexion</Link>
            <a    href="mailto:hello@create-it.app" style={{ fontSize: 14, color: "#64748b", textDecoration: "none" }} className="hover:text-[#0f172a] transition-colors">Contact</a>
          </div>

          {/* Copyright */}
          <p style={{ fontSize: 13, color: "#94a3b8" }}>© 2026 CreateIt</p>
        </div>
      </footer>

    </div>
  );
}
