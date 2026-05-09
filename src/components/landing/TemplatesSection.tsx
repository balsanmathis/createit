'use client'

import { motion } from 'framer-motion'

/* ─── Mini site previews ─────────────────────────────────────── */

function RestaurantPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#09090b', fontFamily: 'Georgia,serif', overflow: 'hidden', position: 'relative' }}>
      {/* Nav */}
      <div style={{ padding: '7px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(202,138,4,0.2)' }}>
        <span style={{ color: '#ca8a04', fontSize: 8, fontWeight: 700, letterSpacing: 3 }}>MAISON NOIR</span>
        <div style={{ display: 'flex', gap: 8, fontSize: 6.5, color: '#57534e' }}>
          <span>Menu</span><span>Galerie</span><span>Réserver</span>
        </div>
      </div>
      {/* Hero */}
      <div style={{ height: 72, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg,rgba(202,138,4,0.08) 0%,transparent 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(202,138,4,0.03) 8px,rgba(202,138,4,0.03) 9px)' }} />
        <div style={{ fontSize: 6, color: '#ca8a04', letterSpacing: 5, marginBottom: 4 }}>GASTRONOMIQUE · PARIS</div>
        <div style={{ fontSize: 17, fontWeight: 900, color: '#fafaf9', letterSpacing: 0.5, textAlign: 'center', lineHeight: 1.1 }}>L'Art<br />de la Table</div>
        <div style={{ marginTop: 6, fontSize: 7, color: '#fff', background: '#ca8a04', padding: '3px 10px', borderRadius: 20 }}>Réserver une table</div>
      </div>
      {/* Menu cards */}
      <div style={{ padding: '8px 10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
        {[['Entrées', '18€'], ['Plats', '34€'], ['Desserts', '12€'], ['Vins', '45€']].map(([label, price]) => (
          <div key={label} style={{ background: 'rgba(202,138,4,0.06)', border: '1px solid rgba(202,138,4,0.12)', borderRadius: 4, padding: '5px 7px' }}>
            <div style={{ fontSize: 7, color: '#ca8a04', fontWeight: 700 }}>{label}</div>
            <div style={{ fontSize: 6, color: '#57534e', marginTop: 1 }}>à partir de {price}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PortfolioPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#fafafa', fontFamily: 'system-ui,sans-serif', overflow: 'hidden' }}>
      {/* Nav */}
      <div style={{ padding: '7px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e5e5' }}>
        <span style={{ fontSize: 8, fontWeight: 800, color: '#111', letterSpacing: 1 }}>LÉNA MARTIN</span>
        <div style={{ display: 'flex', gap: 8, fontSize: 6.5, color: '#737373' }}>
          <span>Work</span><span>About</span><span>Contact</span>
        </div>
      </div>
      {/* Hero */}
      <div style={{ padding: '10px 12px 6px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ fontSize: 6, color: '#a3a3a3', letterSpacing: 3, marginBottom: 3 }}>PHOTOGRAPHE · DIRECTRICE ARTISTIQUE</div>
        <div style={{ fontSize: 15, fontWeight: 900, color: '#111', lineHeight: 1.1, letterSpacing: -0.5 }}>Capturer<br />l'Instant</div>
      </div>
      {/* Grid */}
      <div style={{ padding: '8px 10px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3 }}>
        {[
          { bg: '#1a1a2e', h: 40 }, { bg: '#16213e', h: 40 }, { bg: '#0f3460', h: 40 },
          { bg: '#533483', h: 30 }, { bg: '#2c2c54', h: 30 }, { bg: '#474787', h: 30 },
        ].map((cell, i) => (
          <div key={i} style={{ background: cell.bg, borderRadius: 3, height: cell.h, opacity: 0.85 }} />
        ))}
      </div>
    </div>
  )
}

function AgencePreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#0a0a0f', fontFamily: 'system-ui,sans-serif', overflow: 'hidden', position: 'relative' }}>
      {/* Nav */}
      <div style={{ padding: '7px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, background: 'linear-gradient(135deg,#f59e0b,#ef4444)' }} />
          <span style={{ fontSize: 8, fontWeight: 800, color: '#fff' }}>APEX</span>
        </div>
        <div style={{ background: '#fff', color: '#000', fontSize: 6.5, padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>Contact</div>
      </div>
      {/* Hero */}
      <div style={{ padding: '8px 12px' }}>
        <div style={{ fontSize: 6, color: '#f59e0b', letterSpacing: 3, marginBottom: 5 }}>CREATIVE STUDIO · PARIS</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', lineHeight: 1.0, letterSpacing: -1, marginBottom: 6 }}>
          We Build<br />
          <span style={{ background: 'linear-gradient(90deg,#f59e0b,#ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Bold</span> Brands.
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['Branding', 'Web', 'Motion', 'UI/UX'].map(s => (
            <span key={s} style={{ fontSize: 6, padding: '2px 6px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20, color: '#a3a3a3' }}>{s}</span>
          ))}
        </div>
      </div>
      {/* Projects grid */}
      <div style={{ padding: '4px 10px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 4 }}>
        <div style={{ height: 44, borderRadius: 6, background: 'linear-gradient(135deg,rgba(245,158,11,0.25),rgba(239,68,68,0.15))', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'flex-end', padding: '5px 6px' }}>
          <span style={{ fontSize: 6.5, color: '#f59e0b', fontWeight: 700 }}>Campaign 2024</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ height: 20, borderRadius: 4, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.15)' }} />
          <div style={{ height: 20, borderRadius: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
        </div>
      </div>
    </div>
  )
}

function SaaSPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#05051a', fontFamily: 'system-ui,sans-serif', overflow: 'hidden', position: 'relative' }}>
      {/* Nav */}
      <div style={{ padding: '7px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(124,58,237,0.2)' }}>
        <span style={{ fontSize: 8, fontWeight: 800, color: '#fff' }}>⬡ <span style={{ color: '#7c3aed' }}>NexAI</span></span>
        <div style={{ background: 'linear-gradient(90deg,#7c3aed,#4f46e5)', color: '#fff', fontSize: 6.5, padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>Essai gratuit</div>
      </div>
      {/* Hero */}
      <div style={{ padding: '8px 12px 4px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 60, height: 60, background: 'radial-gradient(circle,rgba(124,58,237,0.4) 0%,transparent 70%)', filter: 'blur(10px)' }} />
        <div style={{ fontSize: 6, color: '#7c3aed', letterSpacing: 3, marginBottom: 4 }}>INTELLIGENCE ARTIFICIELLE</div>
        <div style={{ fontSize: 14, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 4, position: 'relative' }}>
          L'IA qui<br /><span style={{ background: 'linear-gradient(90deg,#7c3aed,#38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>transforme</span><br />votre workflow
        </div>
      </div>
      {/* Stats */}
      <div style={{ padding: '0 10px 6px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
        {[['+340%', 'perf.'], ['2.4M', 'users'], ['99.9%', 'uptime']].map(([v, l]) => (
          <div key={l} style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 4, padding: '4px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#7c3aed' }}>{v}</div>
            <div style={{ fontSize: 5.5, color: '#4b5563' }}>{l}</div>
          </div>
        ))}
      </div>
      {/* Feature rows */}
      <div style={{ padding: '0 10px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {['Analyse prédictive', 'Automatisation IA', 'Dashboard temps réel'].map((f, i) => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 6px', background: 'rgba(255,255,255,0.03)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: ['#7c3aed','#4f46e5','#38bdf8'][i], opacity: 0.8, flexShrink: 0 }} />
            <span style={{ fontSize: 6.5, color: '#94a3b8' }}>{f}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function EcommercePreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#fff', fontFamily: 'system-ui,sans-serif', overflow: 'hidden' }}>
      {/* Nav */}
      <div style={{ padding: '7px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f5f5f5' }}>
        <span style={{ fontSize: 8, fontWeight: 800, color: '#111', letterSpacing: -0.5 }}>ATELIER</span>
        <div style={{ display: 'flex', gap: 8, fontSize: 6.5, color: '#737373' }}>
          <span>Shop</span><span>Lookbook</span><span>🛒 3</span>
        </div>
      </div>
      {/* Hero banner */}
      <div style={{ height: 36, background: 'linear-gradient(90deg,#f0fdf4,#dcfce7)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <span style={{ fontSize: 7, color: '#166534', fontWeight: 600 }}>🌿 Collection Printemps 2025</span>
        <span style={{ fontSize: 6.5, color: '#15803d', textDecoration: 'underline' }}>Découvrir →</span>
      </div>
      {/* Product grid */}
      <div style={{ padding: '8px 10px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5 }}>
        {[
          { bg: '#e7e5e4', price: '89€', name: 'Veste Lin' },
          { bg: '#d6d3d1', price: '129€', name: 'Manteau' },
          { bg: '#e5e7eb', price: '59€', name: 'Pull Coton' },
        ].map(p => (
          <div key={p.name}>
            <div style={{ height: 46, background: p.bg, borderRadius: 5, marginBottom: 4 }} />
            <div style={{ fontSize: 6.5, fontWeight: 600, color: '#111', marginBottom: 1 }}>{p.name}</div>
            <div style={{ fontSize: 6, color: '#737373' }}>{p.price}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BlogPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#fffbf5', fontFamily: 'Georgia,serif', overflow: 'hidden' }}>
      {/* Nav */}
      <div style={{ padding: '7px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e7e0d4' }}>
        <span style={{ fontSize: 8, fontWeight: 800, color: '#1c1917', letterSpacing: -0.3, fontStyle: 'italic' }}>The Brief</span>
        <div style={{ display: 'flex', gap: 6, fontSize: 6.5, color: '#78716c' }}>
          <span>Tech</span><span>Design</span><span>Actu</span>
        </div>
      </div>
      {/* Featured article */}
      <div style={{ padding: '8px 12px 6px', borderBottom: '1px solid #e7e0d4' }}>
        <span style={{ fontSize: 6, color: '#d97706', fontWeight: 700, letterSpacing: 2 }}>À LA UNE</span>
        <div style={{ fontSize: 12, fontWeight: 900, color: '#1c1917', lineHeight: 1.2, margin: '4px 0 3px', letterSpacing: -0.3 }}>L'IA redéfinit le<br />design en 2025</div>
        <div style={{ fontSize: 6.5, color: '#78716c', lineHeight: 1.4 }}>Comment les outils génératifs transforment le métier de designer...</div>
        <div style={{ marginTop: 4, fontSize: 6, color: '#a8a29e' }}>Par Sophie Martin · 5 min de lecture</div>
      </div>
      {/* Article list */}
      <div style={{ padding: '6px 12px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        {['Tendances web à suivre', 'Next.js 16 : ce qui change', 'Monétiser son blog'].map((title, i) => (
          <div key={title} style={{ display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 5, borderBottom: i < 2 ? '1px solid #f0e8dd' : 'none' }}>
            <div style={{ width: 24, height: 24, background: ['#fef3c7','#e0f2fe','#f0fdf4'][i], borderRadius: 3, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 7, fontWeight: 700, color: '#1c1917', lineHeight: 1.3 }}>{title}</div>
              <div style={{ fontSize: 6, color: '#a8a29e' }}>3 min</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StartupPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#020617', fontFamily: 'system-ui,sans-serif', overflow: 'hidden', position: 'relative' }}>
      {/* Grid bg */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(56,189,248,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(56,189,248,0.04) 1px,transparent 1px)', backgroundSize: '20px 20px' }} />
      {/* Nav */}
      <div style={{ padding: '7px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        <span style={{ fontSize: 8, fontWeight: 800, color: '#38bdf8' }}>◈ Launchly</span>
        <div style={{ background: '#38bdf8', color: '#020617', fontSize: 6.5, padding: '2px 8px', borderRadius: 20, fontWeight: 800 }}>Beta</div>
      </div>
      {/* Hero */}
      <div style={{ padding: '4px 12px 6px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', width: 80, height: 50, background: 'radial-gradient(circle,rgba(56,189,248,0.25) 0%,transparent 70%)' }} />
        <div style={{ fontSize: 6, color: '#38bdf8', letterSpacing: 3, marginBottom: 4 }}>🚀 LANCEZ PLUS VITE</div>
        <div style={{ fontSize: 14, fontWeight: 900, color: '#f1f5f9', lineHeight: 1.1, letterSpacing: -0.5, marginBottom: 5 }}>
          Du concept<br />au produit<br /><span style={{ color: '#38bdf8' }}>en 48h.</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <div style={{ fontSize: 6.5, padding: '3px 8px', background: '#38bdf8', color: '#020617', borderRadius: 20, fontWeight: 700 }}>Démarrer</div>
          <div style={{ fontSize: 6.5, padding: '3px 8px', border: '1px solid rgba(56,189,248,0.3)', color: '#38bdf8', borderRadius: 20 }}>Voir démo</div>
        </div>
      </div>
      {/* Feature pills */}
      <div style={{ padding: '4px 10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
        {[['⚡', 'Ultra rapide'], ['🔒', 'Sécurisé'], ['📊', 'Analytics'], ['🤖', 'IA native']].map(([icon, label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 6px', background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.1)', borderRadius: 4 }}>
            <span style={{ fontSize: 8 }}>{icon}</span>
            <span style={{ fontSize: 6, color: '#94a3b8' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AssociationPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#f0fdf4', fontFamily: 'system-ui,sans-serif', overflow: 'hidden' }}>
      {/* Nav */}
      <div style={{ padding: '7px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderBottom: '1px solid #dcfce7' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#16a34a' }} />
          <span style={{ fontSize: 8, fontWeight: 800, color: '#14532d' }}>EcoSolidaire</span>
        </div>
        <div style={{ background: '#16a34a', color: '#fff', fontSize: 6.5, padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>Faire un don</div>
      </div>
      {/* Hero */}
      <div style={{ padding: '10px 12px 6px', background: 'linear-gradient(180deg,#dcfce7 0%,#f0fdf4 100%)' }}>
        <div style={{ fontSize: 6, color: '#16a34a', letterSpacing: 3, marginBottom: 4, fontWeight: 700 }}>ENSEMBLE, ON CHANGE TOUT</div>
        <div style={{ fontSize: 13, fontWeight: 900, color: '#14532d', lineHeight: 1.2, marginBottom: 5 }}>
          Pour un monde<br />plus solidaire 🌱
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[['847', 'bénévoles'], ['12k', 'bénéficiaires'], ['5', 'pays']].map(([v, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#16a34a' }}>{v}</div>
              <div style={{ fontSize: 5.5, color: '#4b7c59' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Actions */}
      <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {['Devenir bénévole', 'Nos projets 2025', 'Rapport annuel'].map((item, i) => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', background: '#fff', border: '1px solid #dcfce7', borderRadius: 6 }}>
            <span style={{ fontSize: 6.5, color: '#14532d', fontWeight: i === 0 ? 700 : 400 }}>{item}</span>
            <span style={{ fontSize: 7, color: '#16a34a' }}>→</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function LandingPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#0f0a1e', fontFamily: 'system-ui,sans-serif', overflow: 'hidden', position: 'relative' }}>
      {/* Glow */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 120, height: 60, background: 'radial-gradient(ellipse,rgba(139,92,246,0.35) 0%,transparent 70%)', filter: 'blur(12px)' }} />
      {/* Nav */}
      <div style={{ padding: '7px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        <span style={{ fontSize: 8, fontWeight: 800, color: '#fff' }}>✦ <span style={{ color: '#a78bfa' }}>Prism</span></span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 6.5, color: '#6d6280' }}>Pricing</span>
          <div style={{ background: 'linear-gradient(90deg,#7c3aed,#6366f1)', color: '#fff', fontSize: 6.5, padding: '2px 7px', borderRadius: 20, fontWeight: 700 }}>Sign up</div>
        </div>
      </div>
      {/* Hero */}
      <div style={{ padding: '6px 12px', position: 'relative', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', border: '1px solid rgba(139,92,246,0.35)', borderRadius: 20, marginBottom: 6 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#a78bfa' }} />
          <span style={{ fontSize: 6, color: '#a78bfa' }}>Nouveau · v2.0 disponible</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: -0.5, marginBottom: 5 }}>
          Convert visitors<br />into <span style={{ background: 'linear-gradient(90deg,#a78bfa,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>customers</span>
        </div>
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 6.5, padding: '3px 10px', background: 'linear-gradient(90deg,#7c3aed,#6366f1)', color: '#fff', borderRadius: 20, fontWeight: 700 }}>Get started free</div>
          <div style={{ fontSize: 6.5, padding: '3px 8px', border: '1px solid rgba(255,255,255,0.12)', color: '#a78bfa', borderRadius: 20 }}>Watch demo</div>
        </div>
      </div>
      {/* Social proof */}
      <div style={{ margin: '0 10px', padding: '5px 8px', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ display: 'flex' }}>
          {['#7c3aed','#6366f1','#8b5cf6'].map((c, i) => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c, border: '1.5px solid #0f0a1e', marginLeft: i > 0 ? -4 : 0 }} />
          ))}
        </div>
        <span style={{ fontSize: 6, color: '#6d6280' }}>+2,400 équipes nous font confiance</span>
      </div>
    </div>
  )
}

/* ─── Template card ──────────────────────────────────────────── */

const TEMPLATES = [
  { key: 'restaurant',   label: 'Restaurant',   prompt: 'Crée un site restaurant gastronomique élégant, thème sombre avec menu, galerie et réservation en ligne', Preview: RestaurantPreview },
  { key: 'portfolio',    label: 'Portfolio',     prompt: 'Crée un portfolio photographe minimaliste noir et blanc avec galerie de projets et page de contact', Preview: PortfolioPreview },
  { key: 'agence',       label: 'Agence créa.',  prompt: 'Crée un site agence créative bold et moderne avec showcase de projets, équipe et formulaire de contact', Preview: AgencePreview },
  { key: 'saas',         label: 'SaaS / App',    prompt: 'Crée un site SaaS tech sombre et futuriste avec hero animé, features, pricing et CTA', Preview: SaaSPreview },
  { key: 'ecommerce',    label: 'E-commerce',    prompt: 'Crée une boutique e-commerce lifestyle épurée avec grille produits, panier et lookbook', Preview: EcommercePreview },
  { key: 'blog',         label: 'Blog / Média',  prompt: 'Crée un blog éditorial élégant avec articles mis en avant, catégories et newsletter', Preview: BlogPreview },
  { key: 'startup',      label: 'Startup',       prompt: 'Crée une landing page startup tech avec hero gradient, features, témoignages et section pricing', Preview: StartupPreview },
  { key: 'association',  label: 'Association',   prompt: "Crée un site association/ONG moderne avec hero d'impact, chiffres clés, projets et appel aux dons", Preview: AssociationPreview },
  { key: 'landing',      label: 'Landing page',  prompt: 'Crée une landing page de conversion high-end avec headline percutante, social proof et CTA fort', Preview: LandingPreview },
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.5, ease: 'easeOut' as const } }),
}

interface Props {
  onSelect: (prompt: string) => void
}

export default function TemplatesSection({ onSelect }: Props) {
  return (
    <section id="templates" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="text-center mb-14"
        >
          <h2 className="text-4xl font-black mb-4" style={{ color: '#e2e8f0' }}>Tous types de sites</h2>
          <p style={{ color: '#64748b' }}>Cliquez sur un template pour le générer instantanément</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {TEMPLATES.map(({ key, label, prompt, Preview }, i) => (
            <motion.button
              key={key}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i}
              onClick={() => onSelect(prompt)}
              className="group relative rounded-2xl overflow-hidden text-left transition-all duration-300"
              style={{
                background: '#0a0a1f',
                border: '1px solid #1e1b4b',
                height: 200,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#5b21b6'
                e.currentTarget.style.boxShadow = '0 0 30px rgba(91,33,182,0.2)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#1e1b4b'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {/* Mini preview */}
              <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
                <Preview />
              </div>

              {/* Bottom label bar */}
              <div
                className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2.5 transition-all duration-200"
                style={{
                  background: 'linear-gradient(0deg, rgba(4,4,15,0.95) 0%, rgba(4,4,15,0.8) 100%)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <span className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>{label}</span>
                <span
                  className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1"
                  style={{ color: '#7c3aed' }}
                >
                  Générer →
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  )
}
