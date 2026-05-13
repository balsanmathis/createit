"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

/* ─── Font token ─────────────────────────────────────────────────
   CSS variable injected by next/font/google in layout.tsx          */
const F = "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

/* ═══════════════════════════════════════════════════════════════
   MINI-SITE PREVIEW CARDS (CSS only, no images)
   Card dimensions: 280 × 200px, marginRight 16px
   5 cards/row × 296px = 1480px = exactly 33.333% of tripled track
═══════════════════════════════════════════════════════════════ */

const CARD_W = 280, CARD_H = 200, CARD_MR = 16;
const cardBase: React.CSSProperties = { width: CARD_W, height: CARD_H, flexShrink: 0, marginRight: CARD_MR, borderRadius: 10, overflow: "hidden" };

function CardRestaurant() {
  return (
    <div className="example-card" style={{ ...cardBase, background: "#0c0b09", border: "1px solid #2a2318" }}>
      <div style={{ padding: "9px 14px", borderBottom: "1px solid rgba(212,175,55,0.18)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#d4af37", fontSize: 8.5, fontWeight: 700, letterSpacing: 3.5, fontFamily: F }}>LE JARDIN</span>
        <div style={{ display: "flex", gap: 10, fontSize: 7.5, color: "rgba(255,255,255,0.3)", fontFamily: F }}><span>Menu</span><span>Réserver</span></div>
      </div>
      <div style={{ padding: "22px 16px", textAlign: "center" }}>
        <div style={{ fontSize: 7, color: "rgba(212,175,55,0.45)", letterSpacing: 4, marginBottom: 8, fontFamily: F }}>RESTAURANT · PARIS</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#f5f0e8", lineHeight: 1.15, fontFamily: "Georgia, serif", marginBottom: 16 }}>Cuisine<br />Française</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 8, padding: "5px 14px", border: "1px solid rgba(212,175,55,0.35)", color: "#d4af37", borderRadius: 20, fontFamily: F }}>
          <span>Réserver une table</span>
        </div>
        <div style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 4 }}>
          {["★","★","★","★","★"].map((s,i) => <span key={i} style={{ color: "#d4af37", fontSize: 8 }}>{s}</span>)}
          <span style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", marginLeft: 4, fontFamily: F }}>4.9 (312)</span>
        </div>
      </div>
    </div>
  );
}

function CardPortfolio() {
  return (
    <div className="example-card" style={{ ...cardBase, background: "#fafafa", border: "1px solid #e2e8f0" }}>
      <div style={{ padding: "9px 14px", background: "#0f172a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 20, height: 20, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontSize: 7.5, fontWeight: 700 }}>JM</span>
          </div>
          <span style={{ color: "white", fontSize: 9, fontWeight: 700, fontFamily: F }}>Jean Moreau</span>
        </div>
        <div style={{ display: "flex", gap: 10, fontSize: 7.5, color: "rgba(255,255,255,0.45)", fontFamily: F }}><span>Work</span><span>About</span></div>
      </div>
      <div style={{ padding: "18px 16px" }}>
        <div style={{ fontSize: 7, color: "#94a3b8", letterSpacing: 2.5, marginBottom: 8, fontFamily: F }}>DESIGNER & CRÉATIF</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", lineHeight: 1.15, letterSpacing: -0.5, marginBottom: 14, fontFamily: F }}>Jean Moreau<br /><span style={{ color: "#6366f1" }}>—</span> Designer</div>
        <div style={{ display: "flex", gap: 5 }}>
          {["Branding", "Web", "Motion"].map((s) => (
            <span key={s} style={{ fontSize: 7, padding: "3px 8px", background: "#f1f5f9", borderRadius: 5, color: "#64748b", fontFamily: F, border: "1px solid #e2e8f0" }}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function CardAgence() {
  return (
    <div className="example-card" style={{ ...cardBase, background: "#090e1a", border: "1px solid #1e293b" }}>
      <div style={{ padding: "9px 14px", borderBottom: "1px solid #1e293b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#60a5fa", fontSize: 9, fontWeight: 800, fontFamily: F, letterSpacing: -0.3 }}>◈ PIXEL</span>
        <div style={{ display: "flex", gap: 10, fontSize: 7.5, color: "rgba(255,255,255,0.25)", fontFamily: F }}><span>Work</span><span>Contact</span></div>
      </div>
      <div style={{ padding: "18px 14px" }}>
        <div style={{ fontSize: 7, color: "#3b82f6", letterSpacing: 3, marginBottom: 10, fontFamily: F }}>DIGITAL AGENCY</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: "white", lineHeight: 1.1, letterSpacing: -0.8, marginBottom: 14, fontFamily: F }}>On crée des<br />expériences<br /><span style={{ color: "#60a5fa" }}>mémorables.</span></div>
        <div style={{ fontSize: 8, padding: "4px 12px", display: "inline-block", background: "linear-gradient(90deg,#2563eb,#4f46e5)", color: "white", borderRadius: 5, fontFamily: F, fontWeight: 600 }}>Voir nos projets →</div>
      </div>
    </div>
  );
}

function CardBoutique() {
  return (
    <div className="example-card" style={{ ...cardBase, background: "#fdf8f4", border: "1px solid #ede0d4" }}>
      <div style={{ padding: "9px 14px", borderBottom: "1px solid #ede0d4", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#7c3d27", fontSize: 8.5, fontWeight: 700, letterSpacing: 2.5, fontFamily: F }}>MAISON DORÉE</span>
        <div style={{ display: "flex", gap: 8, fontSize: 7.5, color: "#b8927a", fontFamily: F }}><span>Boutique</span><span>🛒</span></div>
      </div>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ fontSize: 7, color: "#b8927a", letterSpacing: 2, marginBottom: 8, fontFamily: F }}>ARTISANAT FRANÇAIS</div>
        <div style={{ fontSize: 20, fontWeight: 600, color: "#3d1f14", fontFamily: "Georgia, serif", lineHeight: 1.2, marginBottom: 12 }}>Collections<br />Printemps 2025</div>
        <div style={{ display: "flex", gap: 5, marginBottom: 12 }}>
          {["Céramique", "Linge", "Décor"].map((s) => (
            <span key={s} style={{ fontSize: 6.5, padding: "3px 7px", border: "1px solid #e8c9ba", borderRadius: 4, color: "#9c5738", fontFamily: F }}>{s}</span>
          ))}
        </div>
        <div style={{ fontSize: 8, color: "#b8927a", fontFamily: F }}>À partir de <strong style={{ color: "#7c3d27" }}>29€</strong></div>
      </div>
    </div>
  );
}

function CardBlog() {
  return (
    <div className="example-card" style={{ ...cardBase, background: "#fff", border: "1px solid #e2e8f0" }}>
      <div style={{ padding: "9px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#0f172a", fontSize: 9.5, fontWeight: 700, fontFamily: "Georgia, serif" }}>Le Carnet</span>
        <div style={{ display: "flex", gap: 8, fontSize: 7.5, color: "#94a3b8", fontFamily: F }}><span>Articles</span><span>À propos</span></div>
      </div>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ fontSize: 7, color: "#64748b", letterSpacing: 2, marginBottom: 8, fontFamily: F }}>VOYAGE · CULTURE · VIE</div>
        <div style={{ fontSize: 17, fontWeight: 600, color: "#0f172a", fontFamily: "Georgia, serif", lineHeight: 1.3, marginBottom: 12 }}>Les Marchés de<br />Marrakech en Hiver</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg,#f59e0b,#ef4444)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7.5, color: "white", fontWeight: 700, fontFamily: F }}>ML</div>
          <div>
            <div style={{ fontSize: 8, fontWeight: 600, color: "#0f172a", fontFamily: F }}>Marie Laurent</div>
            <div style={{ fontSize: 7, color: "#94a3b8", fontFamily: F }}>15 jan. · 5 min de lecture</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CardSaas() {
  return (
    <div className="example-card" style={{ ...cardBase, background: "#020817", border: "1px solid #0f1729" }}>
      <div style={{ padding: "9px 14px", borderBottom: "1px solid #0f1729", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#06b6d4", fontSize: 9, fontWeight: 800, fontFamily: F, letterSpacing: -0.3 }}>◆ DataFlow</span>
        <div style={{ fontSize: 7.5, padding: "2px 8px", background: "rgba(6,182,212,0.12)", borderRadius: 10, color: "#06b6d4", fontFamily: F }}>Dashboard</div>
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
          {[["Projets", "12", "#06b6d4"], ["Clients", "48", "#8b5cf6"], ["Rev.", "€4.2k", "#10b981"], ["Score", "98%", "#f59e0b"]].map(([label, val, color]) => (
            <div key={label} style={{ background: "#0f172a", borderRadius: 6, padding: "7px 9px", border: "1px solid #1e293b" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: color as string, fontFamily: F }}>{val}</div>
              <div style={{ fontSize: 7, color: "#475569", fontFamily: F, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{ height: 4, background: "#0f172a", borderRadius: 2 }}>
          <div style={{ height: "100%", width: "72%", background: "linear-gradient(90deg,#06b6d4,#8b5cf6)", borderRadius: 2 }} />
        </div>
        <div style={{ fontSize: 7, color: "#475569", fontFamily: F, marginTop: 4 }}>Objectif mensuel · 72%</div>
      </div>
    </div>
  );
}

function CardAvocat() {
  return (
    <div className="example-card" style={{ ...cardBase, background: "#0e0c18", border: "1px solid #1e1a2e" }}>
      <div style={{ padding: "9px 14px", borderBottom: "1px solid rgba(201,169,110,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#c9a96e", fontSize: 8.5, fontWeight: 700, letterSpacing: 2.5, fontFamily: F }}>CABINET MOREAU</span>
        <div style={{ display: "flex", gap: 8, fontSize: 7.5, color: "rgba(255,255,255,0.25)", fontFamily: F }}><span>Expertise</span><span>Contact</span></div>
      </div>
      <div style={{ padding: "18px 16px" }}>
        <div style={{ fontSize: 7, color: "#7c1d1d", letterSpacing: 3, marginBottom: 10, fontFamily: F }}>DROIT DES AFFAIRES</div>
        <div style={{ fontSize: 20, fontWeight: 600, color: "#f5f0e8", fontFamily: "Georgia, serif", lineHeight: 1.3, marginBottom: 14 }}>Votre intérêt,<br />notre priorité.</div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ fontSize: 8, padding: "5px 12px", border: "1px solid rgba(201,169,110,0.4)", color: "#c9a96e", borderRadius: 4, fontFamily: F }}>Prendre RDV</div>
          <div style={{ fontSize: 8, padding: "5px 12px", background: "rgba(201,169,110,0.08)", color: "rgba(255,255,255,0.4)", borderRadius: 4, fontFamily: F }}>Nos domaines</div>
        </div>
      </div>
    </div>
  );
}

function CardMedecin() {
  return (
    <div className="example-card" style={{ ...cardBase, background: "#f0f9ff", border: "1px solid #bae6fd" }}>
      <div style={{ padding: "9px 14px", borderBottom: "1px solid #e0f2fe", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontSize: 9, fontWeight: 700 }}>+</span>
          </div>
          <span style={{ color: "#0284c7", fontSize: 9, fontWeight: 700, fontFamily: F }}>Dr. Sarah Chen</span>
        </div>
        <span style={{ fontSize: 7.5, color: "#64748b", fontFamily: F }}>Généraliste</span>
      </div>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ fontSize: 7, color: "#0284c7", letterSpacing: 2, marginBottom: 8, fontFamily: F }}>CONSULTATION · PARIS 8e</div>
        <div style={{ fontSize: 17, fontWeight: 600, color: "#0c4a6e", lineHeight: 1.3, marginBottom: 14, fontFamily: F }}>Une médecine<br />attentive et humaine.</div>
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ fontSize: 8, padding: "5px 10px", background: "#0284c7", color: "white", borderRadius: 5, fontFamily: F }}>Prendre RDV</div>
          <div style={{ fontSize: 8, padding: "5px 10px", background: "#e0f2fe", color: "#0284c7", borderRadius: 5, fontFamily: F, border: "1px solid #bae6fd" }}>Téléconsult.</div>
        </div>
      </div>
    </div>
  );
}

function CardCoach() {
  return (
    <div className="example-card" style={{ ...cardBase, background: "#080808", border: "1px solid #1c1c1c" }}>
      <div style={{ padding: "9px 14px", borderBottom: "1px solid rgba(251,146,60,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#fb923c", fontSize: 9, fontWeight: 800, fontFamily: F, letterSpacing: 0.5 }}>MOMENTUM</span>
        <div style={{ display: "flex", gap: 8, fontSize: 7.5, color: "rgba(255,255,255,0.25)", fontFamily: F }}><span>Méthode</span><span>Contact</span></div>
      </div>
      <div style={{ padding: "18px 16px", textAlign: "center" }}>
        <div style={{ fontSize: 7, color: "#fb923c", letterSpacing: 3, marginBottom: 12, fontFamily: F }}>COACHING PROFESSIONNEL</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "white", letterSpacing: -0.3, lineHeight: 1.35, marginBottom: 16, fontFamily: F }}>Transform.<br />Agir. Réussir.</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
          <div style={{ fontSize: 8, padding: "5px 16px", display: "inline-block", background: "#fb923c", color: "black", borderRadius: 20, fontWeight: 700, fontFamily: F }}>Démarrer →</div>
        </div>
      </div>
    </div>
  );
}

function CardArchitecte() {
  return (
    <div className="example-card" style={{ ...cardBase, background: "#f6f6f2", border: "1px solid #e2e2d8" }}>
      <div style={{ padding: "9px 14px", borderBottom: "1px solid #e2e2d8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#0f172a", fontSize: 8.5, fontWeight: 700, letterSpacing: 2.5, fontFamily: F }}>STUDIO BLANC</span>
        <div style={{ display: "flex", gap: 8, fontSize: 7.5, color: "#94a3b8", fontFamily: F }}><span>Projets</span><span>Contact</span></div>
      </div>
      <div style={{ padding: "18px 16px" }}>
        <div style={{ fontSize: 7, color: "#94a3b8", letterSpacing: 3, marginBottom: 10, fontFamily: F }}>ARCHITECTURE · PARIS</div>
        <div style={{ fontSize: 20, fontWeight: 600, color: "#0f172a", letterSpacing: -0.5, lineHeight: 1.2, marginBottom: 14, fontFamily: F }}>Créer des espaces<br />qui inspirent.</div>
        <div style={{ display: "flex", gap: 5 }}>
          {["Résidentiel", "Commercial", "Interior"].map((s) => (
            <span key={s} style={{ fontSize: 7, padding: "3px 7px", border: "1px solid #cbd5e1", borderRadius: 4, color: "#64748b", fontFamily: F }}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

const ROW_A = [CardRestaurant, CardPortfolio, CardAgence, CardBoutique, CardBlog];
const ROW_B = [CardSaas, CardAvocat, CardMedecin, CardCoach, CardArchitecte];

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
    tokens: "16 000 tokens",
    sub: "1 site test",
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
    tokens: "160 000 tokens",
    sub: "~10 sites/mois",
    features: ["Tout du gratuit", "Sites illimités en édition", "Support email"],
    cta: "Choisir Starter",
    primary: false,
    highlight: false,
    href: "/pricing",
  },
  {
    name: "Pro",
    label: "45€",
    period: true,
    tokens: "480 000 tokens",
    sub: "~30 sites/mois",
    features: ["Tout du Starter", "Modification avancée", "Support prioritaire"],
    cta: "Choisir Pro",
    primary: true,
    highlight: true,
    href: "/pricing",
  },
  {
    name: "Agency",
    label: "250€",
    period: true,
    tokens: "3 200 000 tokens",
    sub: "~200 sites/mois",
    features: ["Tout du Pro", "Volume illimité", "Account manager"],
    cta: "Choisir Agency",
    primary: false,
    highlight: false,
    href: "/pricing",
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
            href="/pricing"
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
            <Link href="/pricing"    style={{ fontSize: 14, color: "#64748b", textDecoration: "none" }} className="hover:text-[#0f172a] transition-colors">Tarifs</Link>
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
            <Link
              href="/pricing"
              onClick={() => setMobileNavOpen(false)}
              className="py-4 text-lg border-b"
              style={{ color: "#0f172a", textDecoration: "none", borderColor: "#f1f5f9" }}
            >Tarifs</Link>
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
          EXAMPLES CAROUSEL
      ══════════════════════════════════════════════════════════ */}
      <section
        id="exemples"
        className="reveal"
        style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", padding: "64px 0" }}
      >
        <div className="text-center" style={{ marginBottom: 40, fontFamily: F }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: "#0f172a", letterSpacing: -0.3, marginBottom: 8 }}>
            Ce que vous pouvez créer
          </h2>
          <p style={{ fontSize: 14, color: "#64748b" }}>
            Des sites professionnels dans tous les styles
          </p>
        </div>

        <div className="carousel-wrapper" style={{ overflow: "hidden" }}>
          {/* Row 1 — left to right */}
          <div
            style={{
              marginBottom: 14,
              overflow: "hidden",
              WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)",
              maskImage: "linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)",
            }}
          >
            <div className="examples-track">
              {[...ROW_A, ...ROW_A, ...ROW_A].map((Card, i) => (
                <Card key={`a-${i}`} />
              ))}
            </div>
          </div>

          {/* Row 2 — right to left */}
          <div
            style={{
              overflow: "hidden",
              WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)",
              maskImage: "linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)",
            }}
          >
            <div className="examples-track-reverse">
              {[...ROW_B, ...ROW_B, ...ROW_B].map((Card, i) => (
                <Card key={`b-${i}`} />
              ))}
            </div>
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

                <p style={{ fontSize: 12, color: "#2563eb", fontWeight: 500, marginBottom: 4, fontFamily: F }}>{plan.tokens}</p>
                <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 20, fontFamily: F }}>{plan.sub}</p>

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
