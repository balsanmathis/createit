"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";
import TemplatesSection from "@/components/landing/TemplatesSection";

/* ─── Data ─────────────────────────────────────────────────────── */

const TYPEWRITER_PROMPTS = [
  "Crée un site pour mon restaurant italien...",
  "Crée un portfolio de photographe...",
  "Crée une landing page pour mon SaaS...",
  "Crée un site pour mon agence créative...",
];

const QUICK_TAGS = ["Restaurant", "Portfolio", "SaaS", "Agence", "E-commerce", "Blog"];

const STATS = [
  { value: 2847, label: "sites créés", suffix: "" },
  { value: 98, label: "satisfaits", suffix: "%" },
  { value: 30, label: "secondes en moyenne", suffix: "s" },
];

const STEPS = [
  { num: "01", icon: "✍️", title: "Décrivez", desc: "Décrivez votre site en langage naturel. Type, style, sections — dites tout." },
  { num: "02", icon: "⚡", title: "L'IA génère", desc: "Claude AI génère un site complet, beau et professionnel en moins de 30 secondes." },
  { num: "03", icon: "📦", title: "Téléchargez", desc: "Exportez en ZIP, publiez ou continuez à éditer visuellement." },
];

const PRICING = [
  {
    name: "Gratuit",
    price: 0,
    tokens: "16 000",
    features: ["16 000 tokens offerts", "1 site test", "Export HTML/ZIP", "Éditeur visuel"],
    cta: "Commencer gratuitement",
    highlight: false,
    href: "/auth/signup",
  },
  {
    name: "Starter",
    price: 20,
    tokens: "160 000",
    features: ["160 000 tokens/mois", "Export HTML/ZIP", "Éditeur visuel", "Support email"],
    cta: "Commencer",
    highlight: false,
    href: "/pricing",
  },
  {
    name: "Pro",
    price: 45,
    tokens: "480 000",
    features: ["480 000 tokens/mois", "Export HTML/ZIP", "Éditeur visuel avancé", "Templates premium", "Support prioritaire"],
    cta: "Choisir Pro",
    highlight: true,
    href: "/pricing",
  },
  {
    name: "Agency",
    price: 250,
    tokens: "3 200 000",
    features: ["3 200 000 tokens/mois", "Export HTML/ZIP", "Marque blanche", "API access", "Support dédié"],
    cta: "Contacter",
    highlight: false,
    href: "/pricing",
  },
];

const TESTIMONIALS = [
  { name: "Sophie Martin", role: "Restauratrice", avatar: "SM", text: "Mon site de restaurant était prêt en moins d'une minute. Exactement ce dont j'avais besoin.", stars: 5 },
  { name: "Lucas Bernard", role: "Freelance designer", avatar: "LB", text: "J'ai généré mon portfolio complet en décrivant mon style. Le résultat était bluffant.", stars: 5 },
  { name: "Marie Dubois", role: "Fondatrice SaaS", avatar: "MD", text: "Notre landing page convertit mieux que celle faite par notre agence. Et ça nous a coûté 45€.", stars: 5 },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: "easeOut" as const },
  }),
};

/* ─── Shared style tokens ───────────────────────────────────────── */
const SYNE = "var(--font-syne), sans-serif";
const DM   = "var(--font-dm-sans), Arial, sans-serif";
const BLUE = "#3b82f6";
const BLUE_DARK = "#2563eb";
const BLUE_DEEP = "#1d4ed8";
const BORDER = "rgba(59,130,246,0.15)";
const TEXT   = "#f8fafc";
const MUTED  = "rgba(255,255,255,0.4)";
const CARD   = "#080820";

/* ─── Component ─────────────────────────────────────────────────── */

export default function HomePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [typeIdx, setTypeIdx] = useState(0);
  const [typeText, setTypeText] = useState("");
  const [navOpaque, setNavOpaque] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [cursor, setCursor] = useState({ x: -400, y: -400 });
  const [counts, setCounts] = useState(STATS.map(() => 0));
  const [bannerVisible, setBannerVisible] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const statsAnimated = useRef(false);

  /* Auth + banner */
  useEffect(() => {
    if (localStorage.getItem("promo_banner_dismissed") !== "1") setBannerVisible(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase.auth.getUser().then(({ data: { user } }) => setIsAuthenticated(!!user));
  }, []);

  /* Cursor glow */
  useEffect(() => {
    const move = (e: MouseEvent) => setCursor({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  /* Navbar scroll */
  useEffect(() => {
    const onScroll = () => setNavOpaque(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Typewriter */
  useEffect(() => {
    const full = TYPEWRITER_PROMPTS[typeIdx];
    let i = 0;
    setTypeText("");
    const t = setInterval(() => {
      i++;
      setTypeText(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(t);
        setTimeout(() => setTypeIdx((p) => (p + 1) % TYPEWRITER_PROMPTS.length), 2200);
      }
    }, 38);
    return () => clearInterval(t);
  }, [typeIdx]);

  /* Stats count-up */
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !statsAnimated.current) {
        statsAnimated.current = true;
        STATS.forEach((stat, i) => {
          const steps = 60;
          const inc = stat.value / steps;
          let cur = 0;
          const timer = setInterval(() => {
            cur = Math.min(cur + inc, stat.value);
            setCounts((prev) => { const n = [...prev]; n[i] = Math.floor(cur); return n; });
            if (cur >= stat.value) clearInterval(timer);
          }, 1800 / steps);
        });
      }
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    router.push(isAuthenticated
      ? `/generate?prompt=${encodeURIComponent(prompt.trim())}`
      : `/try?prompt=${encodeURIComponent(prompt.trim())}`
    );
  };

  const handleTemplateSelect = (p: string) => {
    router.push(isAuthenticated
      ? `/generate?prompt=${encodeURIComponent(p)}`
      : `/try?prompt=${encodeURIComponent(p)}`
    );
  };

  const navTop = bannerVisible ? "40px" : "0px";

  return (
    <div style={{ background: "#04040f", fontFamily: DM }} className="min-h-screen text-white overflow-x-hidden">

      {/* ── Promo banner ──────────────────────────────────────────── */}
      {bannerVisible && (
        <div
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-3 px-10 h-10"
          style={{ background: "#1e3a8a" }}
        >
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.9)" }}>
            🎁 Inscrivez-vous et obtenez{" "}
            <strong className="text-white">-20% à vie</strong>{" "}
            sur votre premier plan
          </p>
          <Link
            href="/auth/signup"
            className="text-xs font-semibold px-3 py-1 rounded-full transition-colors"
            style={{ background: "white", color: "#1e3a8a" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#eff6ff")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
          >
            En profiter →
          </Link>
          <button
            onClick={() => { localStorage.setItem("promo_banner_dismissed", "1"); setBannerVisible(false); }}
            className="absolute right-4 text-lg leading-none transition-colors"
            style={{ color: "rgba(255,255,255,0.5)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
            aria-label="Fermer"
          >×</button>
        </div>
      )}

      {/* ── Cursor glow ───────────────────────────────────────────── */}
      <div
        className="pointer-events-none fixed z-50"
        style={{
          left: cursor.x - 200,
          top: cursor.y - 200,
          width: 400,
          height: 400,
          background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(20px)",
          transition: "left 0.06s, top 0.06s",
        }}
      />

      {/* ── Fixed background blobs ────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{
          position: "absolute", top: "8%", left: "5%",
          width: 700, height: 700,
          background: "radial-gradient(circle, rgba(29,78,216,0.16) 0%, rgba(59,130,246,0.06) 50%, transparent 70%)",
          filter: "blur(70px)",
          animation: "blobFloat1 20s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", bottom: "10%", right: "5%",
          width: 600, height: 600,
          background: "radial-gradient(circle, rgba(59,130,246,0.14) 0%, rgba(96,165,250,0.05) 50%, transparent 70%)",
          filter: "blur(70px)",
          animation: "blobFloat2 26s ease-in-out infinite",
        }} />
      </div>

      {/* ── Navbar ────────────────────────────────────────────────── */}
      <nav
        className="fixed left-0 right-0 z-40 transition-all duration-300"
        style={{
          top: navTop,
          background: navOpaque ? "rgba(4,4,15,0.85)" : "transparent",
          backdropFilter: navOpaque ? "blur(12px)" : "none",
          WebkitBackdropFilter: navOpaque ? "blur(12px)" : "none",
          borderBottom: navOpaque ? `1px solid ${BORDER}` : "1px solid transparent",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${BLUE_DEEP}, ${BLUE})` }}
            >
              <span className="text-white text-sm font-bold">✦</span>
            </div>
            <span className="text-lg font-bold" style={{ color: TEXT, fontFamily: SYNE }}>
              Create<span style={{ color: BLUE }}>It</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: MUTED }}>
            {[["Fonctionnalités", "#fonctionnalites"], ["Templates", "#templates"], ["Tarifs", "#tarifs"]].map(([label, href]) => (
              <a key={label} href={href} className="hover:text-white transition-colors">{label}</a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm px-4 py-2 rounded-lg transition-colors hover:text-white"
              style={{ color: MUTED, border: "1px solid rgba(255,255,255,0.1)" }}
            >
              Se connecter
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm font-semibold text-white px-5 py-2 rounded-full transition-all"
              style={{ background: BLUE_DARK }}
              onMouseEnter={(e) => (e.currentTarget.style.background = BLUE)}
              onMouseLeave={(e) => (e.currentTarget.style.background = BLUE_DARK)}
            >
              Commencer gratuitement
            </Link>
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setMobileNavOpen((o) => !o)}
            className="md:hidden w-10 h-10 flex items-center justify-center"
            style={{ color: MUTED }}
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileNavOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </nav>

      {/* ── Mobile nav ────────────────────────────────────────────── */}
      {mobileNavOpen && (
        <div
          className="md:hidden fixed left-0 right-0 z-40 px-6 py-4 flex flex-col gap-3"
          style={{
            top: bannerVisible ? "96px" : "64px",
            background: "rgba(4,4,15,0.97)",
            borderBottom: `1px solid ${BORDER}`,
            backdropFilter: "blur(12px)",
          }}
        >
          {[["Fonctionnalités", "#fonctionnalites"], ["Templates", "#templates"], ["Tarifs", "#tarifs"]].map(([label, href]) => (
            <a
              key={label}
              href={href}
              onClick={() => setMobileNavOpen(false)}
              className="text-sm py-2 border-b"
              style={{ color: MUTED, borderColor: "#0f1729" }}
            >{label}</a>
          ))}
          <div className="flex gap-3 pt-2">
            <Link href="/auth/login" onClick={() => setMobileNavOpen(false)}
              className="flex-1 text-center text-sm py-2.5 rounded-lg border"
              style={{ color: MUTED, borderColor: "rgba(255,255,255,0.1)" }}
            >Se connecter</Link>
            <Link href="/auth/signup" onClick={() => setMobileNavOpen(false)}
              className="flex-1 text-center text-sm font-semibold text-white py-2.5 rounded-full"
              style={{ background: BLUE_DARK }}
            >Commencer</Link>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════ */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center"
        style={{ paddingTop: bannerVisible ? "140px" : "100px", paddingBottom: "80px", zIndex: 1 }}
      >
        {/* Hero-local stronger blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div style={{
            position: "absolute", top: "20%", left: "12%",
            width: 440, height: 440,
            background: `radial-gradient(circle, rgba(29,78,216,0.22) 0%, transparent 65%)`,
            filter: "blur(90px)",
            animation: "blobFloat1 16s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", top: "10%", right: "12%",
            width: 380, height: 380,
            background: `radial-gradient(circle, rgba(96,165,250,0.18) 0%, transparent 65%)`,
            filter: "blur(90px)",
            animation: "blobFloat2 20s ease-in-out infinite",
          }} />
        </div>

        {/* Badge */}
        <motion.div
          initial="hidden" animate="visible" variants={fadeUp} custom={0}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full mb-8 text-sm font-medium"
          style={{ background: "rgba(59,130,246,0.08)", border: `1px solid rgba(59,130,246,0.25)`, color: "#60a5fa" }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: BLUE, boxShadow: `0 0 8px ${BLUE}`, animation: "pulse-glow 2s ease-in-out infinite" }}
          />
          Créateur de sites web IA
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial="hidden" animate="visible" variants={fadeUp} custom={1}
          className="mb-6 font-extrabold leading-[0.92]"
          style={{
            fontFamily: SYNE,
            letterSpacing: "-1.5px",
            fontSize: "clamp(2.8rem, 8vw, 5.5rem)",
            color: TEXT,
          }}
        >
          Créez des sites web
          <br />
          <span style={{
            background: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #1d4ed8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            en quelques mots
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial="hidden" animate="visible" variants={fadeUp} custom={2}
          className="text-lg mb-10 max-w-xl leading-relaxed"
          style={{ color: MUTED }}
        >
          Décrivez votre site, notre IA le crée en 30 secondes.<br />
          Beau, professionnel, prêt à vendre.
        </motion.p>

        {/* Prompt bar */}
        <motion.div
          initial="hidden" animate="visible" variants={fadeUp} custom={3}
          className="w-full max-w-2xl mb-4"
        >
          <div
            className="relative flex items-center rounded-2xl p-2 transition-all"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(59,130,246,0.2)" }}
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              placeholder={typeText || TYPEWRITER_PROMPTS[0]}
              className="flex-1 bg-transparent outline-none px-4 py-3 text-base"
              style={{ color: TEXT, fontFamily: DM }}
            />
            <button
              onClick={handleGenerate}
              className="shrink-0 text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm"
              style={{ background: BLUE_DARK, fontFamily: DM }}
              onMouseEnter={(e) => (e.currentTarget.style.background = BLUE)}
              onMouseLeave={(e) => (e.currentTarget.style.background = BLUE_DARK)}
            >
              Générer →
            </button>
          </div>
        </motion.div>

        {/* Quick-tags */}
        <motion.div
          initial="hidden" animate="visible" variants={fadeUp} custom={4}
          className="flex flex-wrap gap-2 justify-center mb-6"
        >
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setPrompt(`Crée un site ${tag.toLowerCase()} professionnel`)}
              className="text-xs px-3 py-1.5 rounded-full transition-all"
              style={{ background: "rgba(59,130,246,0.08)", border: BORDER, color: "#60a5fa" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(59,130,246,0.18)"; e.currentTarget.style.color = "#93c5fd"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(59,130,246,0.08)"; e.currentTarget.style.color = "#60a5fa"; }}
            >
              {tag}
            </button>
          ))}
        </motion.div>

        <motion.p
          initial="hidden" animate="visible" variants={fadeUp} custom={5}
          className="text-sm"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          Sans carte bancaire • Export ZIP inclus
        </motion.p>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          STATS
      ══════════════════════════════════════════════════════════════ */}
      <section
        ref={statsRef}
        className="py-16 border-y relative"
        style={{ borderColor: BORDER, zIndex: 1 }}
      >
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-4 md:gap-8 text-center">
          {STATS.map((stat, i) => (
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <div
                className="text-4xl font-extrabold mb-1"
                style={{ fontFamily: SYNE, color: TEXT }}
              >
                {counts[i].toLocaleString()}{stat.suffix}
              </div>
              <div className="text-sm" style={{ color: MUTED }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TEMPLATES CAROUSEL
      ══════════════════════════════════════════════════════════════ */}
      <div id="templates" style={{ position: "relative", zIndex: 1 }}>
        <TemplatesSection onSelect={handleTemplateSelect} />
      </div>

      {/* ═══════════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════════════ */}
      <section
        id="fonctionnalites"
        className="py-24 px-6 border-t relative"
        style={{ background: "rgba(6,6,24,0.6)", borderColor: BORDER, zIndex: 1 }}
      >
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-14">
            <h2
              className="text-4xl font-extrabold mb-4"
              style={{ fontFamily: SYNE, letterSpacing: "-1.5px", color: TEXT }}
            >
              Comment ça marche
            </h2>
            <p style={{ color: MUTED }}>Trois étapes, moins d&apos;une minute</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="rounded-2xl p-6 transition-all duration-200"
                style={{ background: CARD, border: `1px solid ${BORDER}` }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-4"
                  style={{ background: "rgba(29,78,216,0.18)", border: "1px solid rgba(59,130,246,0.2)" }}
                >
                  {step.icon}
                </div>
                <div className="text-xs font-mono mb-2" style={{ color: BLUE }}>{step.num}</div>
                <h3 className="text-lg font-bold mb-2" style={{ color: TEXT, fontFamily: SYNE }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PRICING
      ══════════════════════════════════════════════════════════════ */}
      <section id="tarifs" className="py-24 px-6 border-t relative" style={{ borderColor: BORDER, zIndex: 1 }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-14">
            <h2
              className="text-4xl font-extrabold mb-4"
              style={{ fontFamily: SYNE, letterSpacing: "-1.5px", color: TEXT }}
            >
              Tarifs simples
            </h2>
            <p style={{ color: MUTED }}>Sans engagement, sans surprise</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
            {PRICING.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="relative rounded-2xl p-7"
                style={{
                  background: CARD,
                  border: plan.highlight ? `1px solid ${BLUE}` : `1px solid ${BORDER}`,
                  boxShadow: plan.highlight ? "0 0 48px rgba(59,130,246,0.18)" : "none",
                  transform: plan.highlight ? "scale(1.03)" : "scale(1)",
                }}
              >
                {plan.highlight && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ background: `linear-gradient(90deg, ${BLUE_DEEP}, ${BLUE})` }}
                  >
                    Populaire
                  </div>
                )}
                <h3 className="text-base font-bold mb-1" style={{ color: TEXT, fontFamily: SYNE }}>{plan.name}</h3>
                <div className="flex items-end gap-1 mb-1">
                  {plan.price === 0 ? (
                    <span className="text-3xl font-black" style={{ color: TEXT, fontFamily: SYNE }}>Gratuit</span>
                  ) : (
                    <>
                      <span className="text-3xl font-black" style={{ color: TEXT, fontFamily: SYNE }}>{plan.price}€</span>
                      <span className="mb-1 text-sm" style={{ color: MUTED }}>/mois</span>
                    </>
                  )}
                </div>
                <p className="text-xs mb-5 font-medium" style={{ color: BLUE }}>
                  {plan.tokens} tokens{plan.price > 0 ? "/mois" : " offerts"}
                </p>
                <ul className="space-y-2.5 mb-7">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                      <span style={{ color: BLUE }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className="block text-center font-semibold py-2.5 rounded-xl transition-all text-white text-sm"
                  style={{
                    background: plan.highlight ? BLUE_DARK : "transparent",
                    border: plan.highlight ? "none" : `1px solid rgba(59,130,246,0.25)`,
                  }}
                  onMouseEnter={(e) => {
                    if (plan.highlight) e.currentTarget.style.background = BLUE;
                    else e.currentTarget.style.borderColor = BLUE;
                  }}
                  onMouseLeave={(e) => {
                    if (plan.highlight) e.currentTarget.style.background = BLUE_DARK;
                    else e.currentTarget.style.borderColor = "rgba(59,130,246,0.25)";
                  }}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 border-t relative" style={{ borderColor: BORDER, zIndex: 1 }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-14">
            <h2
              className="text-4xl font-extrabold mb-4"
              style={{ fontFamily: SYNE, letterSpacing: "-1.5px", color: TEXT }}
            >
              Ils ont créé avec CreateIt
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="rounded-2xl p-6"
                style={{ background: CARD, border: `1px solid rgba(59,130,246,0.1)` }}
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <span key={j} className="text-yellow-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${BLUE_DEEP}, ${BLUE})` }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: TEXT }}>{t.name}</div>
                    <div className="text-xs" style={{ color: MUTED }}>{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 border-t relative overflow-hidden" style={{ borderColor: BORDER, zIndex: 1 }}>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(29,78,216,0.18) 0%, transparent 70%)",
          }}
        />
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="max-w-2xl mx-auto text-center relative"
          style={{ zIndex: 1 }}
        >
          <h2
            className="text-5xl font-extrabold mb-4"
            style={{ fontFamily: SYNE, letterSpacing: "-1.5px", color: TEXT }}
          >
            Prêt à créer ?
          </h2>
          <p className="mb-8" style={{ color: MUTED }}>
            Rejoignez des milliers de créateurs. Commencez gratuitement.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-full text-lg transition-all"
            style={{ background: BLUE_DARK }}
            onMouseEnter={(e) => (e.currentTarget.style.background = BLUE)}
            onMouseLeave={(e) => (e.currentTarget.style.background = BLUE_DARK)}
          >
            Commencer gratuitement →
          </Link>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════ */}
      <footer className="py-12 px-6 border-t" style={{ background: "#02020a", borderColor: BORDER }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${BLUE_DEEP}, ${BLUE})` }}
            >
              <span className="text-white text-xs">✦</span>
            </div>
            <span className="font-bold" style={{ color: TEXT, fontFamily: SYNE }}>
              Create<span style={{ color: BLUE }}>It</span>
            </span>
          </div>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>
            © 2025 CreateIt. Propulsé par Claude AI.
          </p>
          <div className="flex items-center gap-6 text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>
            <Link href="#" className="hover:text-white transition-colors">CGU</Link>
            <Link href="#" className="hover:text-white transition-colors">Confidentialité</Link>
            <Link href="/auth/login" className="hover:text-white transition-colors">Connexion</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
