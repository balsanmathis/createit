"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";
import { LampContainer } from "@/components/ui/lamp";
import { SparklesCore } from "@/components/ui/sparkles";
import TemplatesSection from "@/components/landing/TemplatesSection";

const TYPEWRITER_PROMPTS = [
  "Crée un site pour mon restaurant italien...",
  "Crée un portfolio de photographe...",
  "Crée une landing page pour mon SaaS...",
  "Crée un site pour mon agence créative...",
];


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
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const } }),
};

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
  }, []);

  useEffect(() => {
    const move = (e: MouseEvent) => setCursor({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  useEffect(() => {
    const onScroll = () => setNavOpaque(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    if (isAuthenticated) {
      router.push(`/generate?prompt=${encodeURIComponent(prompt.trim())}`);
    } else {
      router.push(`/try?prompt=${encodeURIComponent(prompt.trim())}`);
    }
  };

  const handleTemplateSelect = (p: string) => {
    if (isAuthenticated) {
      router.push(`/generate?prompt=${encodeURIComponent(p)}`);
    } else {
      router.push(`/try?prompt=${encodeURIComponent(p)}`);
    }
  };

  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{ background: "#04040f" }}>
      {/* Promo banner */}
      {bannerVisible && (
        <div
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-3 px-10 h-10"
          style={{ background: "linear-gradient(90deg, #3b0764, #1e1b4b)" }}
        >
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.9)" }}>
            🎁 Inscrivez-vous maintenant et obtenez{" "}
            <span className="font-bold" style={{ color: "#c4b5fd" }}>-20% à vie</span>{" "}
            sur votre premier plan
          </p>
          <Link
            href="/auth/signup"
            className="text-xs font-semibold text-white px-3 py-1 rounded-full transition-colors"
            style={{ background: "#5b21b6" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#6d28d9")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#5b21b6")}
          >
            En profiter →
          </Link>
          <button
            onClick={() => {
              localStorage.setItem("promo_banner_dismissed", "1");
              setBannerVisible(false);
            }}
            className="absolute right-4 text-lg leading-none transition-colors"
            style={{ color: "rgba(255,255,255,0.4)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
            aria-label="Fermer"
          >
            ×
          </button>
        </div>
      )}

      {/* Cursor glow */}
      <div
        className="pointer-events-none fixed z-50"
        style={{
          left: cursor.x - 150,
          top: cursor.y - 150,
          width: 300,
          height: 300,
          background: "radial-gradient(circle, rgba(91,33,182,0.2) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(20px)",
          transition: "left 0.05s, top 0.05s",
        }}
      />

      {/* Floating orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div
          className="absolute rounded-full"
          style={{ top: "15%", left: "10%", width: 500, height: 500, background: "radial-gradient(circle, rgba(46,16,101,0.2) 0%, transparent 70%)", filter: "blur(60px)", animation: "float1 12s ease-in-out infinite" }}
        />
        <div
          className="absolute rounded-full"
          style={{ bottom: "20%", right: "10%", width: 400, height: 400, background: "radial-gradient(circle, rgba(30,27,75,0.25) 0%, transparent 70%)", filter: "blur(60px)", animation: "float2 15s ease-in-out infinite" }}
        />
      </div>

      {/* Navbar */}
      <nav
        className="fixed left-0 right-0 z-40 transition-all duration-300"
        style={{
          top: bannerVisible ? "40px" : "0px",
          background: navOpaque ? "rgba(4,4,15,0.85)" : "transparent",
          backdropFilter: navOpaque ? "blur(12px)" : "none",
          borderBottom: navOpaque ? "1px solid rgba(30,27,75,0.5)" : "1px solid transparent",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #5b21b6, #1d4ed8)" }}>
              <span className="text-white text-sm font-bold">✦</span>
            </div>
            <span className="text-lg font-bold text-[#e2e8f0]">Create<span style={{ color: "#7c3aed" }}>It</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: "#94a3b8" }}>
            {["Fonctionnalités", "Templates", "Tarifs", "Docs"].map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`} className="hover:text-white transition-colors">{l}</a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login" className="text-sm px-4 py-2 rounded-lg border transition-colors hover:text-white" style={{ color: "#94a3b8", borderColor: "#1e1b4b" }}>
              Se connecter
            </Link>
            <Link href="/auth/signup" className="text-sm font-semibold text-white px-5 py-2 rounded-full transition-all" style={{ background: "#5b21b6" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#6d28d9")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#5b21b6")}
            >
              Commencer gratuitement
            </Link>
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setMobileNavOpen(o => !o)}
            className="md:hidden w-10 h-10 flex items-center justify-center"
            style={{ color: "#94a3b8" }}
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileNavOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              }
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile nav menu */}
      {mobileNavOpen && (
        <div
          className="md:hidden fixed top-16 left-0 right-0 z-40 px-6 py-4 flex flex-col gap-3"
          style={{ background: "rgba(4,4,15,0.97)", borderBottom: "1px solid rgba(30,27,75,0.5)", backdropFilter: "blur(12px)" }}
        >
          {["Fonctionnalités", "Templates", "Tarifs", "Docs"].map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              onClick={() => setMobileNavOpen(false)}
              className="text-sm py-2 border-b"
              style={{ color: "#94a3b8", borderColor: "#0f0f2e" }}
            >{l}</a>
          ))}
          <div className="flex gap-3 pt-2">
            <Link href="/auth/login" onClick={() => setMobileNavOpen(false)} className="flex-1 text-center text-sm py-2.5 rounded-lg border" style={{ color: "#94a3b8", borderColor: "#1e1b4b" }}>
              Se connecter
            </Link>
            <Link href="/auth/signup" onClick={() => setMobileNavOpen(false)} className="flex-1 text-center text-sm font-semibold text-white py-2.5 rounded-full" style={{ background: "#5b21b6" }}>
              Commencer
            </Link>
          </div>
        </div>
      )}

      {/* Hero — LampContainer + Sparkles */}
      <div className="relative">
        <LampContainer className="pt-16 pb-10">
          {/* Sparkles layer */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <SparklesCore
              background="transparent"
              particleColor="#ffffff"
              particleDensity={40}
              speed={0.5}
              minSize={0.4}
              maxSize={1.2}
            />
          </div>

          <motion.div
            className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-4xl mx-auto"
            initial="hidden"
            animate="visible"
          >
            <motion.h1 variants={fadeUp} custom={0} className="text-4xl sm:text-6xl md:text-7xl font-black leading-[0.9] tracking-tight mb-6">
              <span className="bg-gradient-to-r from-slate-200 via-[#7c3aed] to-[#1d4ed8] bg-clip-text text-transparent">
                Créez des sites web
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#7c3aed] via-[#4338ca] to-slate-200 bg-clip-text text-transparent">
                en quelques mots
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} custom={2} className="text-lg mb-10 max-w-xl leading-relaxed" style={{ color: "#64748b" }}>
              Décrivez votre site, notre IA le crée en 30 secondes.<br />Beau, professionnel, prêt à vendre.
            </motion.p>

            {/* Prompt bar */}
            <motion.div variants={fadeUp} custom={3} className="w-full max-w-2xl mb-4">
              <div
                className="relative flex items-center rounded-2xl p-2 transition-all"
                style={{ background: "rgba(14,14,40,0.8)", border: "1px solid rgba(91,33,182,0.3)" }}
              >
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  placeholder={typeText || TYPEWRITER_PROMPTS[0]}
                  className="flex-1 bg-transparent outline-none px-4 py-3 text-base"
                  style={{ color: "#e2e8f0" }}
                />
                <button
                  onClick={handleGenerate}
                  className="shrink-0 text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm"
                  style={{ background: "#5b21b6" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#6d28d9")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#5b21b6")}
                >
                  Générer →
                </button>
              </div>
            </motion.div>

            <motion.p variants={fadeUp} custom={4} className="text-sm" style={{ color: "#475569" }}>
              Sans carte bancaire • Export ZIP inclus
            </motion.p>
          </motion.div>
        </LampContainer>
      </div>

      {/* Stats */}
      <section ref={statsRef} className="py-16 border-y" style={{ borderColor: "#0f0f2e" }}>
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-4 md:gap-8 text-center">
          {STATS.map((stat, i) => (
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <div className="text-4xl font-black mb-1" style={{ color: "#e2e8f0" }}>
                {counts[i].toLocaleString()}{stat.suffix}
              </div>
              <div className="text-sm" style={{ color: "#94a3b8" }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Templates */}
      <TemplatesSection onSelect={handleTemplateSelect} />

      {/* How it works */}
      <section id="how" className="py-24 px-6 border-t" style={{ background: "#06061a", borderColor: "#0f0f2e" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-14">
            <h2 className="text-4xl font-black mb-4" style={{ color: "#e2e8f0" }}>Comment ça marche</h2>
            <p style={{ color: "#64748b" }}>Trois étapes, moins d&apos;une minute</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="rounded-2xl p-6" style={{ background: "#04040f", border: "1px solid #1e1b4b" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-4" style={{ background: "#1e1b4b", color: "#7c3aed" }}>
                  {step.icon}
                </div>
                <div className="text-xs font-mono mb-2" style={{ color: "#5b21b6" }}>{step.num}</div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "#e2e8f0" }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="tarifs" className="py-24 px-6 border-t" style={{ borderColor: "#0f0f2e" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-14">
            <h2 className="text-4xl font-black mb-4" style={{ color: "#e2e8f0" }}>Tarifs simples</h2>
            <p style={{ color: "#64748b" }}>Sans engagement, sans surprise</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PRICING.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="relative rounded-2xl p-7"
                style={{
                  background: "#080820",
                  border: plan.highlight ? "1px solid #5b21b6" : "1px solid #1e1b4b",
                  boxShadow: plan.highlight ? "0 0 40px rgba(91,33,182,0.12)" : "none",
                  transform: plan.highlight ? "scale(1.03)" : "scale(1)",
                }}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold text-white" style={{ background: "linear-gradient(90deg, #5b21b6, #1d4ed8)" }}>
                    Populaire
                  </div>
                )}
                <h3 className="text-base font-bold mb-1" style={{ color: "#e2e8f0" }}>{plan.name}</h3>
                <div className="flex items-end gap-1 mb-1">
                  {plan.price === 0 ? (
                    <span className="text-3xl font-black" style={{ color: "#e2e8f0" }}>Gratuit</span>
                  ) : (
                    <>
                      <span className="text-3xl font-black" style={{ color: "#e2e8f0" }}>{plan.price}€</span>
                      <span className="mb-1 text-sm" style={{ color: "#64748b" }}>/mois</span>
                    </>
                  )}
                </div>
                <p className="text-xs mb-5 font-medium" style={{ color: "#7c3aed" }}>{plan.tokens} tokens{plan.price > 0 ? "/mois" : " offerts"}</p>
                <ul className="space-y-2.5 mb-7">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm" style={{ color: "#94a3b8" }}>
                      <span style={{ color: "#7c3aed" }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className="block text-center font-semibold py-2.5 rounded-xl transition-all text-white text-sm"
                  style={{ background: plan.highlight ? "#5b21b6" : "transparent", border: plan.highlight ? "none" : "1px solid #1e1b4b" }}
                  onMouseEnter={(e) => { if (plan.highlight) e.currentTarget.style.background = "#6d28d9"; else e.currentTarget.style.borderColor = "#5b21b6"; }}
                  onMouseLeave={(e) => { if (plan.highlight) e.currentTarget.style.background = "#5b21b6"; else e.currentTarget.style.borderColor = "#1e1b4b"; }}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 border-t" style={{ borderColor: "#0f0f2e" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-14">
            <h2 className="text-4xl font-black mb-4" style={{ color: "#e2e8f0" }}>Ils ont créé avec CreateIt</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="rounded-2xl p-6" style={{ background: "#080820", border: "1px solid #1e1b4b" }}>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => <span key={j} className="text-yellow-400 text-sm">★</span>)}
                </div>
                <p className="text-sm leading-relaxed mb-6" style={{ color: "#94a3b8" }}>&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "linear-gradient(135deg, #5b21b6, #1d4ed8)" }}>{t.avatar}</div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>{t.name}</div>
                    <div className="text-xs" style={{ color: "#64748b" }}>{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t" style={{ borderColor: "#0f0f2e" }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="max-w-2xl mx-auto text-center">
          <h2 className="text-5xl font-black mb-4" style={{ color: "#e2e8f0" }}>Prêt à créer ?</h2>
          <p className="mb-8" style={{ color: "#64748b" }}>Rejoignez des milliers de créateurs. Commencez gratuitement.</p>
          <Link href="/auth/signup" className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-full text-lg transition-all" style={{ background: "#5b21b6" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#6d28d9")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#5b21b6")}
          >
            Commencer gratuitement →
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t" style={{ background: "#02020a", borderColor: "#0f0f2e" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #5b21b6, #1d4ed8)" }}>
              <span className="text-white text-xs">✦</span>
            </div>
            <span className="font-bold" style={{ color: "#e2e8f0" }}>Create<span style={{ color: "#7c3aed" }}>It</span></span>
          </div>
          <p className="text-sm" style={{ color: "#475569" }}>© 2025 CreateIt. Propulsé par Claude AI.</p>
          <div className="flex items-center gap-6 text-sm" style={{ color: "#475569" }}>
            <Link href="#" className="hover:text-white transition-colors">CGU</Link>
            <Link href="#" className="hover:text-white transition-colors">Confidentialité</Link>
            <Link href="/auth/login" className="hover:text-white transition-colors">Connexion</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
