"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SCENES = [
  { label: "Landing", duration: 5500 },
  { label: "Signup", duration: 5000 },
  { label: "Builder", duration: 6000 },
  { label: "Génération", duration: 5500 },
  { label: "Résultat", duration: 6000 },
  { label: "Édition", duration: 7000 },
];

/* ─── Scene 1 : Landing ─────────────────────────────────────── */
function Scene1() {
  return (
    <div style={{ width: "100%", height: "100%", background: "#04040f", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "system-ui,sans-serif" }}>
      <div style={{ background: "rgba(30,27,75,0.9)", borderBottom: "1px solid rgba(91,33,182,0.35)", padding: "7px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <span style={{ color: "#a78bfa", fontWeight: 800, fontSize: 13 }}>✦ CreateIt</span>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11 }}>
          <span style={{ color: "#64748b" }}>Fonctionnalités</span>
          <span style={{ color: "#64748b" }}>Tarifs</span>
          <span style={{ border: "1px solid #1e1b4b", borderRadius: 5, padding: "2px 8px", color: "#94a3b8", fontSize: 10 }}>Se connecter</span>
          <span style={{ background: "#5b21b6", borderRadius: 20, padding: "2px 10px", color: "#fff", fontWeight: 700, fontSize: 10 }}>Commencer</span>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "12px 20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "8%", left: "6%", width: 140, height: 140, background: "radial-gradient(circle,rgba(91,33,182,.28) 0%,transparent 70%)", filter: "blur(22px)", borderRadius: "50%", animation: "df1 5s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "8%", right: "6%", width: 110, height: 110, background: "radial-gradient(circle,rgba(67,56,202,.28) 0%,transparent 70%)", filter: "blur(22px)", borderRadius: "50%", animation: "df2 7s ease-in-out infinite" }} />
        <div style={{ fontSize: 10, padding: "2px 9px", borderRadius: 20, background: "rgba(91,33,182,.15)", border: "1px solid rgba(91,33,182,.3)", color: "#a78bfa", marginBottom: 9 }}>✦ Créateur de sites web IA</div>
        <div style={{ fontSize: 21, fontWeight: 900, textAlign: "center", lineHeight: 1.1, marginBottom: 9, color: "#e2e8f0" }}>
          Créez des sites web<br />
          <span style={{ background: "linear-gradient(90deg,#7c3aed,#4338ca)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>en quelques mots</span>
        </div>
        <div style={{ width: "100%", maxWidth: 310, display: "flex", alignItems: "center", borderRadius: 11, padding: 4, background: "rgba(14,14,40,.85)", border: "1px solid rgba(91,33,182,.35)", marginBottom: 9 }}>
          <span style={{ flex: 1, fontSize: 10.5, padding: "3px 7px", color: "#475569" }}>Crée un site SaaS moderne...</span>
          <span style={{ background: "#5b21b6", color: "#fff", fontSize: 10.5, fontWeight: 700, padding: "4px 11px", borderRadius: 7 }}>Générer →</span>
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "center" }}>
          {["🚀 SaaS", "💼 Portfolio", "🛍️ E-commerce", "⚡ Startup", "📝 Blog"].map(t => (
            <span key={t} style={{ fontSize: 9.5, padding: "2px 7px", borderRadius: 20, background: "rgba(30,27,75,.5)", border: "1px solid #1e1b4b", color: "#64748b" }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Scene 2 : Signup ──────────────────────────────────────── */
function Scene2() {
  return (
    <div style={{ width: "100%", height: "100%", background: "#04040f", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", width: 400, height: 200, background: "radial-gradient(ellipse,rgba(55,48,163,.35) 0%,transparent 70%)" }} />
      <div style={{ width: 280, background: "#080820", border: "1px solid #1e1b4b", borderRadius: 16, padding: "22px 22px 18px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#5b21b6,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>✦</div>
            <span style={{ fontWeight: 800, color: "#e2e8f0", fontSize: 14 }}>Create<span style={{ color: "#7c3aed" }}>It</span></span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#e2e8f0", marginBottom: 3 }}>Créer un compte</div>
          <div style={{ fontSize: 10.5, color: "#64748b" }}>Commencez à créer des sites web</div>
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10.5, color: "#94a3b8", marginBottom: 4, fontWeight: 500 }}>Email</div>
          <div style={{ background: "#0d0d2e", border: "1.5px solid #5b21b6", borderRadius: 8, padding: "6px 10px", fontSize: 11, color: "#e2e8f0" }}>mathis@createit.app<span style={{ animation: "blink 1s infinite", borderRight: "1.5px solid #7c3aed", paddingRight: 1 }} /></div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10.5, color: "#94a3b8", marginBottom: 4, fontWeight: 500 }}>Mot de passe</div>
          <div style={{ background: "#0d0d2e", border: "1px solid #1e1b4b", borderRadius: 8, padding: "6px 10px", fontSize: 11, color: "#475569" }}>••••••••</div>
        </div>
        <div style={{ background: "#5b21b6", borderRadius: 9, padding: "8px", textAlign: "center", color: "#fff", fontWeight: 700, fontSize: 11 }}>Créer mon compte →</div>
        <div style={{ textAlign: "center", marginTop: 10, fontSize: 10, color: "#475569" }}>Déjà un compte ? <span style={{ color: "#7c3aed" }}>Se connecter</span></div>
      </div>
    </div>
  );
}

/* ─── Scene 3 : Prompt Builder ──────────────────────────────── */
function Scene3() {
  const menuItems = [
    { label: "Dashboard", icon: "⊞" },
    { label: "Prompt Builder", icon: "🪄", active: true },
    { label: "Générer", icon: "✦" },
    { label: "Mes sites", icon: "🗂" },
    { label: "Paramètres", icon: "◎" },
  ];
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", background: "#04040f", overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ width: 140, background: "#06061a", borderRight: "1px solid #0f0f2e", padding: "12px 10px", flexShrink: 0, display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 12, paddingLeft: 4 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg,#5b21b6,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>✦</div>
          <span style={{ fontWeight: 800, fontSize: 12, color: "#e2e8f0" }}>Create<span style={{ color: "#7c3aed" }}>It</span></span>
        </div>
        {menuItems.map(m => (
          <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 7px", borderRadius: 7, fontSize: 10.5, background: m.active ? "rgba(91,33,182,.2)" : "transparent", border: m.active ? "1px solid rgba(91,33,182,.35)" : "1px solid transparent", color: m.active ? "#a78bfa" : "#64748b", fontWeight: m.active ? 600 : 400 }}>
            <span>{m.icon}</span>{m.label}
          </div>
        ))}
      </div>
      {/* Main */}
      <div style={{ flex: 1, padding: "12px 14px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#e2e8f0", marginBottom: 2 }}>🪄 Prompt Builder</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
          {[
            { label: "Type de site", value: "Startup Tech", active: true },
            { label: "Nom du site", value: "Nexora AI", active: false },
            { label: "Style visuel", value: "Tech sombre", active: true },
            { label: "Couleurs", value: "Bleu/Vert/Noir", active: true },
          ].map(f => (
            <div key={f.label}>
              <div style={{ fontSize: 9.5, color: "#64748b", marginBottom: 3, fontWeight: 500 }}>{f.label}</div>
              <div style={{ background: "#0d0d2e", border: `1px solid ${f.active ? "#5b21b6" : "#1e1b4b"}`, borderRadius: 7, padding: "5px 8px", fontSize: 11, color: f.active ? "#a78bfa" : "#94a3b8" }}>{f.value}</div>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 9.5, color: "#64748b", marginBottom: 3, fontWeight: 500 }}>Prompt généré</div>
          <div style={{ background: "#0a0a1f", border: "1px solid #1e1b4b", borderRadius: 8, padding: "8px 10px", fontSize: 9.5, color: "#7c3aed", lineHeight: 1.5, minHeight: 60 }}>
            Crée un site web <span style={{ color: "#a78bfa" }}>Nexora AI</span>, startup tech innovante. Style <span style={{ color: "#a78bfa" }}>sombre et futuriste</span>. Palette <span style={{ color: "#38bdf8" }}>bleu cyan / vert émeraude / noir profond</span>. Sections : Hero avec stats animées, Features IA, Pricing, CTA...
          </div>
        </div>
        <div style={{ background: "#5b21b6", borderRadius: 9, padding: "8px", textAlign: "center", color: "#fff", fontWeight: 700, fontSize: 11, marginTop: 2 }}>Générer ce site →</div>
      </div>
    </div>
  );
}

/* ─── Scene 4 : Génération ──────────────────────────────────── */
function Scene4() {
  const steps = ["Structure HTML", "Design CSS", "Animations", "Finalisation"];
  return (
    <div style={{ width: "100%", height: "100%", background: "#04040f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24 }}>
      {/* Spinner */}
      <div style={{ position: "relative", width: 64, height: 64 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", border: "3px solid #1e1b4b", position: "absolute" }} />
        <div style={{ width: 64, height: 64, borderRadius: "50%", border: "3px solid transparent", borderTopColor: "#7c3aed", position: "absolute", animation: "spin 1s linear infinite" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>✦</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#e2e8f0", marginBottom: 4 }}>Nexora AI — Création du site...</div>
        <div style={{ fontSize: 11, color: "#64748b" }}>Claude AI génère votre site complet</div>
      </div>
      {/* Progress bar */}
      <div style={{ width: "100%", maxWidth: 280 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5, color: "#64748b", marginBottom: 5 }}>
          <span>Progression</span><span style={{ color: "#a78bfa" }}>68%</span>
        </div>
        <div style={{ background: "#0d0d2e", borderRadius: 6, height: 5, overflow: "hidden" }}>
          <div style={{ height: "100%", background: "linear-gradient(90deg,#5b21b6,#7c3aed)", borderRadius: 6, animation: "progressFill 5s ease-out forwards" }} />
        </div>
      </div>
      {/* Steps */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", maxWidth: 280 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, background: i < 2 ? "#5b21b6" : i === 2 ? "rgba(91,33,182,.3)" : "#0d0d2e", border: i < 2 ? "none" : "1px solid #1e1b4b", color: i < 2 ? "#fff" : i === 2 ? "#a78bfa" : "#475569", animation: i === 2 ? "pulse 1.5s ease-in-out infinite" : "none" }}>
              {i < 2 ? "✓" : i === 2 ? "●" : ""}
            </div>
            <span style={{ color: i < 2 ? "#94a3b8" : i === 2 ? "#a78bfa" : "#475569", fontWeight: i === 2 ? 600 : 400 }}>{s}</span>
            {i < 2 && <span style={{ marginLeft: "auto", fontSize: 9, color: "#5b21b6" }}>Fait</span>}
            {i === 2 && <span style={{ marginLeft: "auto", fontSize: 9, color: "#a78bfa", animation: "blink 1.2s infinite" }}>En cours...</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Scene 5 : Site généré ─────────────────────────────────── */
function Scene5() {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Editor header */}
      <div style={{ background: "#06061a", borderBottom: "1px solid #0f0f2e", padding: "6px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#94a3b8" }}>
          <span style={{ color: "#a78bfa", fontWeight: 700 }}>✦ CreateIt</span>
          <span style={{ color: "#1e1b4b" }}>›</span>
          <span>Nexora AI</span>
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {["Éditer", "ZIP", "Sauvegarder"].map((b, i) => (
            <span key={b} style={{ fontSize: 9.5, padding: "2px 8px", borderRadius: 5, background: i === 2 ? "#5b21b6" : "transparent", border: i === 2 ? "none" : "1px solid #1e1b4b", color: i === 2 ? "#fff" : "#64748b", fontWeight: i === 2 ? 600 : 400 }}>{b}</span>
          ))}
        </div>
      </div>
      {/* Generated site preview */}
      <div style={{ flex: 1, background: "#020409", overflow: "hidden", position: "relative" }}>
        {/* Orbs */}
        <div style={{ position: "absolute", top: "5%", right: "10%", width: 100, height: 100, background: "radial-gradient(circle,rgba(56,189,248,.2) 0%,transparent 70%)", filter: "blur(20px)", borderRadius: "50%", animation: "df1 6s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "5%", left: "10%", width: 80, height: 80, background: "radial-gradient(circle,rgba(52,211,153,.15) 0%,transparent 70%)", filter: "blur(20px)", borderRadius: "50%", animation: "df2 8s ease-in-out infinite" }} />
        {/* Grid bg */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(56,189,248,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(56,189,248,.04) 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
        {/* Navbar */}
        <div style={{ borderBottom: "1px solid rgba(56,189,248,.12)", padding: "6px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
          <span style={{ color: "#38bdf8", fontWeight: 800, fontSize: 12 }}>⬡ Nexora AI</span>
          <div style={{ display: "flex", gap: 8, fontSize: 9.5, color: "#64748b" }}>
            <span>Produit</span><span>Tarifs</span><span>API</span>
            <span style={{ background: "#0ea5e9", color: "#fff", padding: "2px 8px", borderRadius: 5, fontWeight: 600 }}>Essai gratuit</span>
          </div>
        </div>
        {/* Hero */}
        <div style={{ padding: "14px 16px", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 9.5, padding: "2px 8px", borderRadius: 20, background: "rgba(56,189,248,.1)", border: "1px solid rgba(56,189,248,.25)", color: "#38bdf8", display: "inline-block", marginBottom: 8 }}>🚀 Plateforme IA nouvelle génération</div>
          <div style={{ fontSize: 19, fontWeight: 900, color: "#f1f5f9", lineHeight: 1.1, marginBottom: 6 }}>
            L'IA qui <span style={{ color: "#38bdf8" }}>transforme</span><br />votre business
          </div>
          <div style={{ fontSize: 10, color: "#64748b", marginBottom: 10, lineHeight: 1.5 }}>Infrastructure IA de pointe. Résultats mesurables.<br />Déploiement en minutes.</div>
          <div style={{ display: "flex", gap: 7, marginBottom: 12 }}>
            <span style={{ background: "#0ea5e9", color: "#fff", padding: "5px 12px", borderRadius: 7, fontSize: 10, fontWeight: 700 }}>Démarrer gratuitement</span>
            <span style={{ border: "1px solid rgba(56,189,248,.4)", color: "#38bdf8", padding: "5px 12px", borderRadius: 7, fontSize: 10 }}>Voir la démo</span>
          </div>
          {/* Stats */}
          <div style={{ display: "flex", gap: 14 }}>
            {["+340%", "2.4M", "99.9%"].map((v, i) => (
              <div key={v} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: i === 1 ? "#34d399" : "#38bdf8" }}>{v}</div>
                <div style={{ fontSize: 8.5, color: "#64748b" }}>{["performance", "requêtes/j", "uptime"][i]}</div>
              </div>
            ))}
          </div>
          {/* Feature cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginTop: 10 }}>
            {[
              { icon: "⚡", title: "Ultra rapide", c: "#38bdf8" },
              { icon: "🛡", title: "Sécurisé", c: "#34d399" },
              { icon: "🤖", title: "IA native", c: "#818cf8" },
            ].map(c => (
              <div key={c.title} style={{ background: "#060d14", border: "1px solid rgba(56,189,248,.1)", borderRadius: 8, padding: "7px 8px" }}>
                <div style={{ fontSize: 14, marginBottom: 3, color: c.c }}>{c.icon}</div>
                <div style={{ fontSize: 9.5, fontWeight: 700, color: "#94a3b8" }}>{c.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Scene 6 : Éditeur visuel ───────────────────────────────── */
function Scene6() {
  const [titleWord, setTitleWord] = useState("transforme");
  const [showHighlight, setShowHighlight] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowHighlight(true), 1200);
    const t2 = setTimeout(() => setTitleWord("révolutionne"), 2800);
    const t3 = setTimeout(() => setShowHighlight(false), 3400);
    const t4 = setTimeout(() => setShowToast(true), 4200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Editor header */}
      <div style={{ background: "#06061a", borderBottom: "1px solid rgba(91,33,182,.5)", padding: "6px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#94a3b8" }}>
          <span style={{ color: "#a78bfa", fontWeight: 700 }}>✦ CreateIt</span>
          <span style={{ color: "#1e1b4b" }}>›</span>
          <span>Nexora AI</span>
        </div>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          <span style={{ fontSize: 9.5, padding: "2px 8px", borderRadius: 5, background: "rgba(91,33,182,.25)", border: "1px solid #5b21b6", color: "#a78bfa", fontWeight: 700 }}>● Édition ON</span>
          <span style={{ fontSize: 9.5, padding: "2px 8px", borderRadius: 5, background: "#5b21b6", color: "#fff", fontWeight: 600 }}>Sauvegarder</span>
        </div>
      </div>
      {/* Site with editor overlay */}
      <div style={{ flex: 1, background: "#020409", overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(56,189,248,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(56,189,248,.04) 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
        {/* Orbs */}
        <div style={{ position: "absolute", top: "5%", right: "10%", width: 100, height: 100, background: "radial-gradient(circle,rgba(56,189,248,.2) 0%,transparent 70%)", filter: "blur(20px)", borderRadius: "50%", animation: "df1 6s ease-in-out infinite" }} />
        {/* Navbar */}
        <div style={{ borderBottom: "1px solid rgba(56,189,248,.12)", padding: "6px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
          <span style={{ color: "#38bdf8", fontWeight: 800, fontSize: 12 }}>⬡ Nexora AI</span>
          <div style={{ display: "flex", gap: 8, fontSize: 9.5, color: "#64748b" }}>
            <span>Produit</span><span>Tarifs</span>
            <span style={{ background: "#0ea5e9", color: "#fff", padding: "2px 8px", borderRadius: 5, fontWeight: 600 }}>Essai gratuit</span>
          </div>
        </div>
        {/* Hero with editable title */}
        <div style={{ padding: "14px 16px", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 9.5, padding: "2px 8px", borderRadius: 20, background: "rgba(56,189,248,.1)", border: "1px solid rgba(56,189,248,.25)", color: "#38bdf8", display: "inline-block", marginBottom: 8 }}>🚀 Plateforme IA nouvelle génération</div>

          {/* Editable title with highlight */}
          <div style={{ position: "relative", display: "inline-block", marginBottom: 6 }}>
            <div style={{ fontSize: 19, fontWeight: 900, color: "#f1f5f9", lineHeight: 1.1 }}>
              L'IA qui{" "}
              <span style={{ color: "#38bdf8", position: "relative" }}>
                {showHighlight && (
                  <span style={{ position: "absolute", inset: "-3px -5px", borderRadius: 4, border: "2px solid #7c3aed", background: "rgba(91,33,182,.15)", animation: "highlightPulse 0.8s ease-in-out" }} />
                )}
                <span style={{ position: "relative", zIndex: 1 }}>{titleWord}</span>
              </span>
              <br />votre business
            </div>
          </div>

          <div style={{ fontSize: 10, color: "#64748b", marginBottom: 10, lineHeight: 1.5 }}>
            {titleWord === "révolutionne"
              ? "IA de pointe pour des résultats exceptionnels."
              : "Infrastructure IA de pointe. Résultats mesurables."}
          </div>

          <div style={{ display: "flex", gap: 7, marginBottom: 10 }}>
            <span style={{ background: "#0ea5e9", color: "#fff", padding: "5px 12px", borderRadius: 7, fontSize: 10, fontWeight: 700 }}>Démarrer gratuitement</span>
            <span style={{ border: "1px solid rgba(56,189,248,.4)", color: "#38bdf8", padding: "5px 12px", borderRadius: 7, fontSize: 10 }}>Voir la démo</span>
          </div>

          <div style={{ display: "flex", gap: 14 }}>
            {["+340%", "2.4M", "99.9%"].map((v, i) => (
              <div key={v} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: i === 1 ? "#34d399" : "#38bdf8" }}>{v}</div>
                <div style={{ fontSize: 8.5, color: "#64748b" }}>{["performance", "requêtes/j", "uptime"][i]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Toast */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 20, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0 }}
              style={{ position: "absolute", bottom: 12, left: "50%", background: "#052e16", border: "1px solid #16a34a", borderRadius: 8, padding: "6px 12px", fontSize: 10.5, color: "#4ade80", fontWeight: 600, whiteSpace: "nowrap", zIndex: 10 }}
            >
              ✓ Modifications sauvegardées
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── Main DemoSection ───────────────────────────────────────── */
const SCENE_COMPONENTS = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6];

export function DemoSection() {
  const [scene, setScene] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [sceneProgress, setSceneProgress] = useState(0);
  const elapsed = useRef(0);
  const lastTs = useRef<number | null>(null);
  const rafId = useRef<number | null>(null);

  const tick = useCallback((ts: number) => {
    if (lastTs.current === null) lastTs.current = ts;
    const delta = ts - lastTs.current;
    lastTs.current = ts;
    elapsed.current += delta;

    const dur = SCENES[scene].duration;
    const p = Math.min(elapsed.current / dur, 1);
    setSceneProgress(p);

    if (elapsed.current >= dur) {
      elapsed.current = 0;
      lastTs.current = null;
      setScene(s => (s + 1) % SCENES.length);
    } else {
      rafId.current = requestAnimationFrame(tick);
    }
  }, [scene]);

  useEffect(() => {
    if (!playing) { lastTs.current = null; return; }
    rafId.current = requestAnimationFrame(tick);
    return () => { if (rafId.current) cancelAnimationFrame(rafId.current); };
  }, [playing, tick]);

  const goTo = (i: number) => {
    setScene(i);
    elapsed.current = 0;
    lastTs.current = null;
    setSceneProgress(0);
  };

  const SceneComp = SCENE_COMPONENTS[scene];
  const totalProgress = (scene / SCENES.length) + (sceneProgress / SCENES.length);

  return (
    <section className="py-24 px-6 border-t" style={{ borderColor: "#0f0f2e" }}>
      <style>{`
        @keyframes df1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(15px,-20px)} }
        @keyframes df2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-15px,20px)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes progressFill { 0%{width:0%} 100%{width:85%} }
        @keyframes highlightPulse { 0%{opacity:0;transform:scale(.95)} 50%{opacity:1;transform:scale(1)} 100%{opacity:1;transform:scale(1)} }
      `}</style>

      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-black mb-3" style={{ color: "#e2e8f0" }}>Voyez CreateIt en action</h2>
          <p style={{ color: "#64748b" }}>Du prompt au site professionnel en 30 secondes</p>
        </motion.div>

        {/* Demo container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative rounded-2xl overflow-hidden"
          style={{ background: "#06061a", border: "1px solid #1e1b4b", boxShadow: "0 0 60px rgba(91,33,182,0.1)" }}
        >
          {/* Top progress bar */}
          <div style={{ height: 3, background: "#0d0d2e", position: "relative" }}>
            <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${totalProgress * 100}%`, background: "linear-gradient(90deg,#5b21b6,#7c3aed)", transition: "width 0.1s linear" }} />
          </div>

          {/* Scene label */}
          <div style={{ background: "#04040f", borderBottom: "1px solid #0f0f2e", padding: "6px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e" }} />
            </div>
            <span style={{ fontSize: 10.5, color: "#64748b" }}>
              Scène {scene + 1}/6 — <span style={{ color: "#a78bfa" }}>{SCENES[scene].label}</span>
            </span>
            <div style={{ width: 60 }} />
          </div>

          {/* Scene viewport */}
          <div style={{ height: 400, position: "relative", overflow: "hidden" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={scene}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{ position: "absolute", inset: 0 }}
              >
                <SceneComp />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div style={{ background: "#04040f", borderTop: "1px solid #0f0f2e", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {/* Play/Pause */}
            <button
              onClick={() => setPlaying(p => !p)}
              style={{ width: 28, height: 28, borderRadius: 8, background: "#0d0d2e", border: "1px solid #1e1b4b", color: "#a78bfa", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 11 }}
            >
              {playing ? "⏸" : "▶"}
            </button>

            {/* Dots */}
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {SCENES.map((s, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  style={{ width: i === scene ? 20 : 6, height: 6, borderRadius: 3, background: i === scene ? "#7c3aed" : "#1e1b4b", border: "none", cursor: "pointer", transition: "all .3s", padding: 0 }}
                />
              ))}
            </div>

            {/* Timer */}
            <span style={{ fontSize: 10, color: "#475569", fontVariantNumeric: "tabular-nums" }}>
              {Math.ceil((1 - sceneProgress) * SCENES[scene].duration / 1000)}s
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
