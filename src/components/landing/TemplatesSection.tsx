'use client'

import { motion } from 'framer-motion'

/* ═══════════════════════════════════════════════════════════════
   MINI PREVIEWS — grid templates (couleurs dans le thème CreateIt)
   ═══════════════════════════════════════════════════════════════ */

function RestaurantPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#08040f', fontFamily: 'Georgia,serif', overflow: 'hidden', position: 'relative' }}>
      <div style={{ padding: '7px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(167,139,250,0.2)' }}>
        <span style={{ color: '#a78bfa', fontSize: 8, fontWeight: 700, letterSpacing: 3 }}>MAISON NOIR</span>
        <div style={{ display: 'flex', gap: 8, fontSize: 6.5, color: '#4c1d95' }}>
          <span>Menu</span><span>Galerie</span><span>Réserver</span>
        </div>
      </div>
      <div style={{ height: 72, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg,rgba(109,40,217,0.12) 0%,transparent 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(109,40,217,0.04) 8px,rgba(109,40,217,0.04) 9px)' }} />
        <div style={{ fontSize: 6, color: '#a78bfa', letterSpacing: 5, marginBottom: 4 }}>GASTRONOMIQUE · PARIS</div>
        <div style={{ fontSize: 17, fontWeight: 900, color: '#faf5ff', letterSpacing: 0.5, textAlign: 'center', lineHeight: 1.1 }}>L'Art<br />de la Table</div>
        <div style={{ marginTop: 6, fontSize: 7, color: '#fff', background: 'linear-gradient(90deg,#7c3aed,#6d28d9)', padding: '3px 10px', borderRadius: 20 }}>Réserver une table</div>
      </div>
      <div style={{ padding: '8px 10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
        {[['Entrées', '18€'], ['Plats', '34€'], ['Desserts', '12€'], ['Vins', '45€']].map(([label, price]) => (
          <div key={label} style={{ background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(109,40,217,0.2)', borderRadius: 4, padding: '5px 7px' }}>
            <div style={{ fontSize: 7, color: '#a78bfa', fontWeight: 700 }}>{label}</div>
            <div style={{ fontSize: 6, color: '#4c1d95', marginTop: 1 }}>à partir de {price}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PortfolioPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#fafafa', fontFamily: 'system-ui,sans-serif', overflow: 'hidden' }}>
      <div style={{ padding: '7px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e5e5' }}>
        <span style={{ fontSize: 8, fontWeight: 800, color: '#111', letterSpacing: 1 }}>LÉNA MARTIN</span>
        <div style={{ display: 'flex', gap: 8, fontSize: 6.5, color: '#737373' }}>
          <span>Work</span><span>About</span><span>Contact</span>
        </div>
      </div>
      <div style={{ padding: '10px 12px 6px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ fontSize: 6, color: '#a3a3a3', letterSpacing: 3, marginBottom: 3 }}>PHOTOGRAPHE · DIRECTRICE ARTISTIQUE</div>
        <div style={{ fontSize: 15, fontWeight: 900, color: '#111', lineHeight: 1.1, letterSpacing: -0.5 }}>Capturer<br />l&apos;Instant</div>
      </div>
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
    <div style={{ width: '100%', height: '100%', background: '#03010a', fontFamily: 'system-ui,sans-serif', overflow: 'hidden', position: 'relative' }}>
      <div style={{ padding: '7px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }} />
          <span style={{ fontSize: 8, fontWeight: 800, color: '#fff' }}>APEX</span>
        </div>
        <div style={{ background: 'linear-gradient(90deg,#7c3aed,#4f46e5)', color: '#fff', fontSize: 6.5, padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>Contact</div>
      </div>
      <div style={{ padding: '6px 12px' }}>
        <div style={{ fontSize: 6, color: '#a78bfa', letterSpacing: 3, marginBottom: 5 }}>CREATIVE STUDIO · PARIS</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', lineHeight: 1.0, letterSpacing: -1, marginBottom: 6 }}>
          We Build<br />
          <span style={{ background: 'linear-gradient(90deg,#a78bfa,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Bold</span> Brands.
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['Branding', 'Web', 'Motion', 'UI/UX'].map(s => (
            <span key={s} style={{ fontSize: 6, padding: '2px 6px', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 20, color: '#7c6ffa' }}>{s}</span>
          ))}
        </div>
      </div>
      <div style={{ padding: '6px 10px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 4 }}>
        <div style={{ height: 44, borderRadius: 6, background: 'linear-gradient(135deg,rgba(124,58,237,0.3),rgba(79,70,229,0.2))', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'flex-end', padding: '5px 6px' }}>
          <span style={{ fontSize: 6.5, color: '#a78bfa', fontWeight: 700 }}>Campaign 2025</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ height: 20, borderRadius: 4, background: 'rgba(79,70,229,0.2)', border: '1px solid rgba(79,70,229,0.2)' }} />
          <div style={{ height: 20, borderRadius: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }} />
        </div>
      </div>
    </div>
  )
}

function SaaSPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#05051a', fontFamily: 'system-ui,sans-serif', overflow: 'hidden', position: 'relative' }}>
      <div style={{ padding: '7px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(124,58,237,0.2)' }}>
        <span style={{ fontSize: 8, fontWeight: 800, color: '#fff' }}>⬡ <span style={{ color: '#7c3aed' }}>NexAI</span></span>
        <div style={{ background: 'linear-gradient(90deg,#7c3aed,#4f46e5)', color: '#fff', fontSize: 6.5, padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>Essai gratuit</div>
      </div>
      <div style={{ padding: '8px 12px 4px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 60, height: 60, background: 'radial-gradient(circle,rgba(124,58,237,0.4) 0%,transparent 70%)', filter: 'blur(10px)' }} />
        <div style={{ fontSize: 6, color: '#7c3aed', letterSpacing: 3, marginBottom: 4 }}>INTELLIGENCE ARTIFICIELLE</div>
        <div style={{ fontSize: 14, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 4 }}>
          L&apos;IA qui<br /><span style={{ background: 'linear-gradient(90deg,#7c3aed,#38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>transforme</span><br />votre workflow
        </div>
      </div>
      <div style={{ padding: '0 10px 6px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
        {[['+340%', 'perf.'], ['2.4M', 'users'], ['99.9%', 'uptime']].map(([v, l]) => (
          <div key={l} style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 4, padding: '4px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#7c3aed' }}>{v}</div>
            <div style={{ fontSize: 5.5, color: '#4b5563' }}>{l}</div>
          </div>
        ))}
      </div>
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
      <div style={{ padding: '7px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f5f5f5' }}>
        <span style={{ fontSize: 8, fontWeight: 800, color: '#111', letterSpacing: -0.5 }}>ATELIER</span>
        <div style={{ display: 'flex', gap: 8, fontSize: 6.5, color: '#737373' }}><span>Shop</span><span>Lookbook</span><span>🛒 3</span></div>
      </div>
      <div style={{ height: 36, background: 'linear-gradient(90deg,#f0fdf4,#dcfce7)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <span style={{ fontSize: 7, color: '#166534', fontWeight: 600 }}>🌿 Collection Printemps 2025</span>
      </div>
      <div style={{ padding: '8px 10px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5 }}>
        {[{ bg: '#e7e5e4', price: '89€', name: 'Veste Lin' }, { bg: '#d6d3d1', price: '129€', name: 'Manteau' }, { bg: '#e5e7eb', price: '59€', name: 'Pull' }].map(p => (
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
      <div style={{ padding: '7px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e7e0d4' }}>
        <span style={{ fontSize: 8, fontWeight: 800, color: '#1c1917', fontStyle: 'italic' }}>The Brief</span>
        <div style={{ display: 'flex', gap: 6, fontSize: 6.5, color: '#78716c' }}><span>Tech</span><span>Design</span><span>Actu</span></div>
      </div>
      <div style={{ padding: '8px 12px 6px', borderBottom: '1px solid #e7e0d4' }}>
        <span style={{ fontSize: 6, color: '#7c3aed', fontWeight: 700, letterSpacing: 2 }}>À LA UNE</span>
        <div style={{ fontSize: 12, fontWeight: 900, color: '#1c1917', lineHeight: 1.2, margin: '4px 0 3px' }}>L&apos;IA redéfinit le<br />design en 2025</div>
        <div style={{ fontSize: 6.5, color: '#78716c' }}>Comment les outils génératifs transforment le métier...</div>
      </div>
      <div style={{ padding: '6px 12px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        {['Tendances web à suivre', 'Next.js 16 : ce qui change', 'Monétiser son blog'].map((title, i) => (
          <div key={title} style={{ display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 5, borderBottom: i < 2 ? '1px solid #f0e8dd' : 'none' }}>
            <div style={{ width: 24, height: 24, background: ['#ede9fe','#e0e7ff','#f0fdf4'][i], borderRadius: 3, flexShrink: 0 }} />
            <div style={{ fontSize: 7, fontWeight: 700, color: '#1c1917' }}>{title}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StartupPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#020617', fontFamily: 'system-ui,sans-serif', overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(56,189,248,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(56,189,248,0.04) 1px,transparent 1px)', backgroundSize: '20px 20px' }} />
      <div style={{ padding: '7px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        <span style={{ fontSize: 8, fontWeight: 800, color: '#38bdf8' }}>◈ Launchly</span>
        <div style={{ background: '#38bdf8', color: '#020617', fontSize: 6.5, padding: '2px 8px', borderRadius: 20, fontWeight: 800 }}>Beta</div>
      </div>
      <div style={{ padding: '4px 12px 6px', position: 'relative' }}>
        <div style={{ fontSize: 6, color: '#38bdf8', letterSpacing: 3, marginBottom: 4 }}>🚀 LANCEZ PLUS VITE</div>
        <div style={{ fontSize: 14, fontWeight: 900, color: '#f1f5f9', lineHeight: 1.1, letterSpacing: -0.5, marginBottom: 5 }}>
          Du concept<br />au produit<br /><span style={{ color: '#38bdf8' }}>en 48h.</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <div style={{ fontSize: 6.5, padding: '3px 8px', background: '#38bdf8', color: '#020617', borderRadius: 20, fontWeight: 700 }}>Démarrer</div>
          <div style={{ fontSize: 6.5, padding: '3px 8px', border: '1px solid rgba(56,189,248,0.3)', color: '#38bdf8', borderRadius: 20 }}>Voir démo</div>
        </div>
      </div>
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
      <div style={{ padding: '7px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderBottom: '1px solid #dcfce7' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#16a34a' }} />
          <span style={{ fontSize: 8, fontWeight: 800, color: '#14532d' }}>EcoSolidaire</span>
        </div>
        <div style={{ background: '#16a34a', color: '#fff', fontSize: 6.5, padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>Faire un don</div>
      </div>
      <div style={{ padding: '10px 12px 6px', background: 'linear-gradient(180deg,#dcfce7 0%,#f0fdf4 100%)' }}>
        <div style={{ fontSize: 6, color: '#16a34a', letterSpacing: 3, marginBottom: 4, fontWeight: 700 }}>ENSEMBLE, ON CHANGE TOUT</div>
        <div style={{ fontSize: 13, fontWeight: 900, color: '#14532d', lineHeight: 1.2, marginBottom: 5 }}>Pour un monde<br />plus solidaire 🌱</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[['847', 'bénévoles'], ['12k', 'bénéf.'], ['5', 'pays']].map(([v, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#16a34a' }}>{v}</div>
              <div style={{ fontSize: 5.5, color: '#4b7c59' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {['Devenir bénévole', 'Nos projets 2025', 'Rapport annuel'].map((item) => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', background: '#fff', border: '1px solid #dcfce7', borderRadius: 6 }}>
            <span style={{ fontSize: 6.5, color: '#14532d' }}>{item}</span>
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
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 120, height: 60, background: 'radial-gradient(ellipse,rgba(139,92,246,0.35) 0%,transparent 70%)', filter: 'blur(12px)' }} />
      <div style={{ padding: '7px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        <span style={{ fontSize: 8, fontWeight: 800, color: '#fff' }}>✦ <span style={{ color: '#a78bfa' }}>Prism</span></span>
        <div style={{ background: 'linear-gradient(90deg,#7c3aed,#6366f1)', color: '#fff', fontSize: 6.5, padding: '2px 7px', borderRadius: 20, fontWeight: 700 }}>Sign up</div>
      </div>
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

/* ═══════════════════════════════════════════════════════════════
   CARROUSEL — templates animés (éléments en mouvement permanent)
   ═══════════════════════════════════════════════════════════════ */

function MusicPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#0a0010', fontFamily: 'system-ui,sans-serif', overflow: 'hidden', position: 'relative' }}>
      <style>{`
        @keyframes bar1{0%,100%{height:6px}50%{height:22px}}
        @keyframes bar2{0%,100%{height:14px}33%{height:6px}66%{height:20px}}
        @keyframes bar3{0%,100%{height:10px}25%{height:20px}75%{height:4px}}
        @keyframes bar4{0%,100%{height:18px}50%{height:6px}}
        @keyframes bar5{0%,100%{height:8px}40%{height:22px}}
        @keyframes orb1{0%,100%{transform:translate(0,0)}50%{transform:translate(10px,-15px)}}
        @keyframes orb2{0%,100%{transform:translate(0,0)}50%{transform:translate(-12px,10px)}}
      `}</style>
      <div style={{ position: 'absolute', top: '10%', right: '8%', width: 60, height: 60, background: 'radial-gradient(circle,rgba(192,38,211,0.5) 0%,transparent 70%)', filter: 'blur(14px)', animation: 'orb1 4s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '8%', width: 50, height: 50, background: 'radial-gradient(circle,rgba(124,58,237,0.4) 0%,transparent 70%)', filter: 'blur(12px)', animation: 'orb2 5s ease-in-out infinite' }} />
      <div style={{ padding: '7px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        <span style={{ fontSize: 8, fontWeight: 800, color: '#e879f9', letterSpacing: 2 }}>LUNA</span>
        <div style={{ display: 'flex', gap: 6, fontSize: 6.5, color: '#7e22ce' }}><span>Tour</span><span>Music</span><span>Store</span></div>
      </div>
      <div style={{ padding: '8px 12px 6px', position: 'relative' }}>
        <div style={{ fontSize: 6, color: '#c026d3', letterSpacing: 4, marginBottom: 4 }}>ARTISTE · TOURNÉE 2025</div>
        <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 6 }}>
          Nouvelle<br /><span style={{ background: 'linear-gradient(90deg,#e879f9,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Ère.</span>
        </div>
        {/* Equalizer bars */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 24, marginBottom: 8 }}>
          {[
            { anim: 'bar1 0.8s ease-in-out infinite', color: '#e879f9' },
            { anim: 'bar2 0.9s ease-in-out infinite 0.1s', color: '#c026d3' },
            { anim: 'bar3 0.7s ease-in-out infinite 0.2s', color: '#a855f7' },
            { anim: 'bar4 1.0s ease-in-out infinite 0.05s', color: '#e879f9' },
            { anim: 'bar5 0.85s ease-in-out infinite 0.15s', color: '#c026d3' },
            { anim: 'bar1 0.75s ease-in-out infinite 0.3s', color: '#a855f7' },
            { anim: 'bar3 0.95s ease-in-out infinite 0.1s', color: '#e879f9' },
            { anim: 'bar2 0.8s ease-in-out infinite 0.25s', color: '#c026d3' },
          ].map((b, i) => (
            <div key={i} style={{ width: 4, background: b.color, borderRadius: 2, animation: b.anim, opacity: 0.9, minHeight: 4 }} />
          ))}
          <span style={{ fontSize: 6.5, color: '#7e22ce', marginLeft: 4, marginBottom: 2 }}>En lecture</span>
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          <div style={{ fontSize: 6.5, padding: '3px 8px', background: 'linear-gradient(90deg,#c026d3,#7c3aed)', color: '#fff', borderRadius: 20, fontWeight: 700 }}>Écouter</div>
          <div style={{ fontSize: 6.5, padding: '3px 8px', border: '1px solid rgba(192,38,211,0.3)', color: '#e879f9', borderRadius: 20 }}>Billets</div>
        </div>
      </div>
    </div>
  )
}

function ImmobilierPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#fff', fontFamily: 'system-ui,sans-serif', overflow: 'hidden' }}>
      <style>{`
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes slideIn{0%{transform:translateX(-10px);opacity:0}100%{transform:translateX(0);opacity:1}}
        @keyframes ping{0%{transform:scale(1);opacity:1}75%,100%{transform:scale(1.8);opacity:0}}
      `}</style>
      <div style={{ padding: '7px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
        <span style={{ fontSize: 8, fontWeight: 800, color: '#1e293b', letterSpacing: -0.5 }}>RÉSIDENCE+</span>
        <div style={{ background: '#1e293b', color: '#fff', fontSize: 6.5, padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>Estimer</div>
      </div>
      <div style={{ padding: '8px 12px 4px', background: 'linear-gradient(180deg,#f8fafc 0%,#fff 100%)' }}>
        <div style={{ fontSize: 6, color: '#64748b', letterSpacing: 2, marginBottom: 3 }}>AGENCE IMMOBILIÈRE</div>
        <div style={{ fontSize: 13, fontWeight: 900, color: '#0f172a', lineHeight: 1.2, marginBottom: 5 }}>Trouvez votre<br />bien idéal</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '4px 8px', background: '#f1f5f9', borderRadius: 8, border: '1.5px solid #7c3aed', marginBottom: 6 }}>
          <span style={{ fontSize: 7, color: '#64748b', flex: 1 }}>Paris, Lyon, Bordeaux...</span>
          <span style={{ fontSize: 6, color: '#fff', background: '#7c3aed', padding: '2px 6px', borderRadius: 6, fontWeight: 700 }}>Go</span>
          <span style={{ fontSize: 8, animation: 'blink 1s infinite', color: '#7c3aed', borderRight: '1px solid #7c3aed', paddingRight: 1 }} />
        </div>
      </div>
      <div style={{ padding: '0 10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
        {[
          { price: '320 000€', type: 'Appartement 3P', loc: 'Paris 11e', status: 'Nouveau', statusColor: '#7c3aed' },
          { price: '485 000€', type: 'Maison 4P', loc: 'Lyon 6e', status: 'Coup de ♥', statusColor: '#e11d48' },
        ].map(p => (
          <div key={p.type} style={{ background: '#f8fafc', borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <div style={{ height: 36, background: 'linear-gradient(135deg,#e2e8f0,#cbd5e1)', position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', padding: 4 }}>
              <span style={{ fontSize: 6, background: p.statusColor, color: '#fff', padding: '1px 5px', borderRadius: 20, fontWeight: 700 }}>{p.status}</span>
            </div>
            <div style={{ padding: '4px 6px' }}>
              <div style={{ fontSize: 7.5, fontWeight: 800, color: '#0f172a' }}>{p.price}</div>
              <div style={{ fontSize: 6, color: '#475569' }}>{p.type} · {p.loc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FitnessPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#09090b', fontFamily: 'system-ui,sans-serif', overflow: 'hidden', position: 'relative' }}>
      <style>{`
        @keyframes countUp{0%{opacity:0;transform:translateY(4px)}100%{opacity:1;transform:translateY(0)}}
        @keyframes pulse2{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.4)}50%{box-shadow:0 0 0 8px rgba(239,68,68,0)}}
        @keyframes progress{0%{width:0%}100%{width:78%}}
        @keyframes heatglow{0%,100%{opacity:0.6}50%{opacity:1}}
      `}</style>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: 'radial-gradient(circle,rgba(239,68,68,0.25) 0%,transparent 70%)', filter: 'blur(16px)', animation: 'heatglow 2s ease-in-out infinite' }} />
      <div style={{ padding: '7px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 8, fontWeight: 900, color: '#fff', letterSpacing: 1 }}>IRON<span style={{ color: '#ef4444' }}>FIT</span></span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', animation: 'pulse2 1.5s ease-in-out infinite' }} />
          <span style={{ fontSize: 6, color: '#ef4444', fontWeight: 700 }}>LIVE</span>
        </div>
      </div>
      <div style={{ padding: '4px 12px 6px' }}>
        <div style={{ fontSize: 6, color: '#ef4444', letterSpacing: 4, marginBottom: 4 }}>COACHING · NUTRITION · FORCE</div>
        <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 6 }}>
          Dépasse<br />tes <span style={{ color: '#ef4444' }}>limites.</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, marginBottom: 6 }}>
          {[['1200+', 'membres'], ['50+', 'coachs'], ['24/7', 'accès']].map(([v, l]) => (
            <div key={l} style={{ textAlign: 'center', padding: '4px 2px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 4 }}>
              <div style={{ fontSize: 10, fontWeight: 900, color: '#ef4444', animation: 'countUp 0.6s ease-out forwards' }}>{v}</div>
              <div style={{ fontSize: 5.5, color: '#52525b' }}>{l}</div>
            </div>
          ))}
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 6, color: '#52525b', marginBottom: 3 }}>
            <span>Programme du mois</span><span style={{ color: '#ef4444' }}>78%</span>
          </div>
          <div style={{ height: 4, background: '#27272a', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg,#ef4444,#f97316)', borderRadius: 2, animation: 'progress 2s ease-out forwards' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function HotelPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#080604', fontFamily: 'Georgia,serif', overflow: 'hidden', position: 'relative' }}>
      <style>{`
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes float3{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
      `}</style>
      <div style={{ padding: '7px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
        <span style={{ fontSize: 8, fontWeight: 700, color: '#d4af37', letterSpacing: 4 }}>ÉLYSÉE</span>
        <div style={{ display: 'flex', gap: 8, fontSize: 6.5, color: '#78716c' }}><span>Suites</span><span>Spa</span><span>Réserver</span></div>
      </div>
      <div style={{ height: 75, background: 'linear-gradient(180deg,rgba(212,175,55,0.06) 0%,transparent 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 80%,rgba(212,175,55,0.08) 0%,transparent 60%)' }} />
        <div style={{ fontSize: 6, color: '#d4af37', letterSpacing: 6, marginBottom: 5, position: 'relative' }}>PALACE · PARIS</div>
        <div
          style={{
            fontSize: 18, fontWeight: 700, color: 'transparent', letterSpacing: 1, position: 'relative',
            background: 'linear-gradient(90deg,#b8960c,#d4af37,#f0d060,#d4af37,#b8960c)',
            backgroundSize: '200% auto', WebkitBackgroundClip: 'text',
            animation: 'shimmer 3s linear infinite',
          }}
        >
          Grand Hôtel
        </div>
        <div style={{ fontSize: 6, color: '#57534e', letterSpacing: 3, marginTop: 4, position: 'relative' }}>DEPUIS 1892</div>
      </div>
      <div style={{ padding: '8px 10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
        {[['Suite Royale', '890€/nuit', true], ['Chambre Deluxe', '320€/nuit', false]].map(([name, price, feat]) => (
          <div key={String(name)} style={{ background: feat ? 'rgba(212,175,55,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${feat ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)'}`, borderRadius: 5, padding: '5px 7px', animation: feat ? 'float3 4s ease-in-out infinite' : 'none' }}>
            <div style={{ fontSize: 7, color: feat ? '#d4af37' : '#a8a29e', fontWeight: 700, marginBottom: 2 }}>{name}</div>
            <div style={{ fontSize: 6, color: '#57534e' }}>{price}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CryptoPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#020d06', fontFamily: 'system-ui,sans-serif', overflow: 'hidden', position: 'relative' }}>
      <style>{`
        @keyframes tick{0%,100%{opacity:1}45%,55%{opacity:0}}
        @keyframes up{0%{transform:translateY(4px);opacity:0}100%{transform:translateY(0);opacity:1}}
        @keyframes glow3{0%,100%{box-shadow:0 0 4px rgba(34,197,94,0.4)}50%{box-shadow:0 0 12px rgba(34,197,94,0.8)}}
        @keyframes chart{0%{d:path("M0 30 C20 28, 40 20, 60 22 C80 24, 100 10, 120 8 C140 6, 160 15, 180 12")}100%{d:path("M0 28 C20 25, 40 18, 60 20 C80 22, 100 8, 120 6 C140 4, 160 13, 180 10")}}
      `}</style>
      <div style={{ position: 'absolute', bottom: '15%', left: '5%', right: '5%', height: 40, opacity: 0.15 }}>
        <svg width="100%" height="100%" viewBox="0 0 180 40" preserveAspectRatio="none">
          <path d="M0 30 C20 28, 40 20, 60 22 C80 24, 100 10, 120 8 C140 6, 160 15, 180 12" fill="none" stroke="#22c55e" strokeWidth="1.5"/>
        </svg>
      </div>
      <div style={{ padding: '7px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 8, fontWeight: 800, color: '#22c55e' }}>◆ CryptoDesk</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', animation: 'glow3 1.5s ease-in-out infinite' }} />
          <span style={{ fontSize: 6, color: '#22c55e' }}>LIVE</span>
        </div>
      </div>
      <div style={{ padding: '4px 12px 6px' }}>
        <div style={{ fontSize: 6, color: '#166534', letterSpacing: 3, marginBottom: 4 }}>TRADING · PORTFOLIO · DeFi</div>
        <div style={{ fontSize: 14, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 6 }}>
          Investissez<br /><span style={{ color: '#22c55e' }}>intelligemment.</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {[['BTC', '€42,380', '+2.4%'], ['ETH', '€2,190', '+1.8%'], ['SOL', '€98.40', '+5.1%']].map(([coin, price, change]) => (
            <div key={coin} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3px 6px', background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.1)', borderRadius: 4 }}>
              <span style={{ fontSize: 7, fontWeight: 700, color: '#e2e8f0' }}>{coin}</span>
              <span style={{ fontSize: 7, color: '#94a3b8', animation: 'tick 2s infinite' }}>{price}</span>
              <span style={{ fontSize: 6.5, color: '#22c55e', fontWeight: 700, animation: 'up 0.5s ease-out' }}>{change}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function EducationPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#03071e', fontFamily: 'system-ui,sans-serif', overflow: 'hidden', position: 'relative' }}>
      <style>{`
        @keyframes progressBar{0%{width:0}100%{width:72%}}
        @keyframes progressBar2{0%{width:0}100%{width:45%}}
        @keyframes progressBar3{0%{width:0}100%{width:90%}}
        @keyframes orb3{0%,100%{transform:translate(0,0)}50%{transform:translate(8px,-10px)}}
      `}</style>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 70, height: 70, background: 'radial-gradient(circle,rgba(99,102,241,0.35) 0%,transparent 70%)', filter: 'blur(16px)', animation: 'orb3 5s ease-in-out infinite' }} />
      <div style={{ padding: '7px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 8, fontWeight: 800, color: '#818cf8' }}>◈ <span style={{ color: '#fff' }}>LearnLab</span></span>
        <div style={{ background: 'linear-gradient(90deg,#6366f1,#4f46e5)', color: '#fff', fontSize: 6.5, padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>Commencer</div>
      </div>
      <div style={{ padding: '5px 12px 5px' }}>
        <div style={{ fontSize: 6, color: '#6366f1', letterSpacing: 3, marginBottom: 3 }}>FORMATION EN LIGNE</div>
        <div style={{ fontSize: 13, fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: 5 }}>
          Apprenez à<br />votre <span style={{ color: '#818cf8' }}>rythme.</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {[
            { name: 'Design UI/UX', pct: '72%', anim: 'progressBar 2s ease-out forwards', color: '#6366f1' },
            { name: 'React Avancé', pct: '45%', anim: 'progressBar2 2.5s ease-out forwards', color: '#8b5cf6' },
            { name: 'Branding', pct: '90%', anim: 'progressBar3 1.8s ease-out forwards', color: '#a78bfa' },
          ].map(c => (
            <div key={c.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 6.5, color: '#94a3b8', marginBottom: 2 }}>
                <span>{c.name}</span><span style={{ color: c.color }}>{c.pct}</span>
              </div>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: c.color, borderRadius: 2, animation: c.anim }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ArchitecturePreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#fafaf9', fontFamily: 'system-ui,sans-serif', overflow: 'hidden' }}>
      <style>{`
        @keyframes lineGrow{0%{width:0}100%{width:100%}}
        @keyframes fadeSlide{0%{opacity:0;transform:translateX(-5px)}100%{opacity:1;transform:translateX(0)}}
      `}</style>
      <div style={{ padding: '7px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #111' }}>
        <span style={{ fontSize: 8, fontWeight: 900, color: '#111', letterSpacing: 4 }}>A.STUDIO</span>
        <div style={{ display: 'flex', gap: 8, fontSize: 6.5, color: '#737373' }}><span>Projets</span><span>Studio</span><span>Contact</span></div>
      </div>
      <div style={{ display: 'flex', height: 'calc(100% - 31px)' }}>
        <div style={{ flex: 1, padding: '10px 12px', borderRight: '1px solid #e5e5e5' }}>
          <div style={{ fontSize: 6, color: '#a3a3a3', letterSpacing: 4, marginBottom: 5, animation: 'fadeSlide 0.8s ease-out' }}>ARCHITECTURE & DESIGN</div>
          <div style={{ fontSize: 14, fontWeight: 900, color: '#111', lineHeight: 1.1, marginBottom: 6, animation: 'fadeSlide 0.8s ease-out 0.1s both' }}>
            Formes<br />et Espaces
          </div>
          <div style={{ height: 1, background: '#111', animation: 'lineGrow 1.5s ease-out forwards', marginBottom: 5 }} />
          <div style={{ fontSize: 6.5, color: '#737373', lineHeight: 1.5, animation: 'fadeSlide 0.8s ease-out 0.2s both' }}>
            12 projets<br />livrés en 2024
          </div>
        </div>
        <div style={{ width: 70, display: 'flex', flexDirection: 'column', gap: 2, padding: 6 }}>
          {[{ bg: '#1a1a1a', h: 50 }, { bg: '#3d3d3d', h: 35 }, { bg: '#6b6b6b', h: 42 }].map((b, i) => (
            <div key={i} style={{ height: b.h, background: b.bg, borderRadius: 2, animation: `fadeSlide 0.6s ease-out ${i * 0.15}s both` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function MedicalPreview() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#fff', fontFamily: 'system-ui,sans-serif', overflow: 'hidden' }}>
      <style>{`
        @keyframes pulse3{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.15);opacity:0.8}}
        @keyframes heartbeat{0%,100%{transform:scaleX(1)}10%{transform:scaleX(1.02)}20%{transform:scaleX(0.98)}}
      `}</style>
      <div style={{ padding: '7px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0f2fe', background: '#f0f9ff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#0284c7', animation: 'pulse3 2s ease-in-out infinite' }} />
          <span style={{ fontSize: 8, fontWeight: 800, color: '#0c4a6e' }}>MedCare+</span>
        </div>
        <div style={{ background: '#0284c7', color: '#fff', fontSize: 6.5, padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>Prendre RDV</div>
      </div>
      <div style={{ padding: '8px 12px 5px', background: 'linear-gradient(180deg,#f0f9ff 0%,#fff 100%)' }}>
        <div style={{ fontSize: 6, color: '#0284c7', letterSpacing: 3, marginBottom: 3, fontWeight: 700 }}>CABINET MÉDICAL · PARIS</div>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#0c4a6e', lineHeight: 1.2, marginBottom: 5 }}>
          Votre santé,<br />notre priorité
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3, marginBottom: 5 }}>
          {[
            { label: 'Lun', slots: 3 }, { label: 'Mar', slots: 1 }, { label: 'Mer', slots: 5 },
          ].map(d => (
            <div key={d.label} style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 5, padding: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: 6, color: '#0284c7', fontWeight: 700, marginBottom: 2 }}>{d.label}</div>
              <div style={{ fontSize: 8, fontWeight: 800, color: '#0c4a6e' }}>{d.slots}</div>
              <div style={{ fontSize: 5.5, color: '#7dd3fc' }}>créneaux</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {['Généraliste', 'Pédiatrie', 'Dermato'].map(s => (
            <span key={s} style={{ fontSize: 6, padding: '2px 6px', background: '#e0f2fe', color: '#0284c7', borderRadius: 20, fontWeight: 600 }}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   CARROUSEL COMPONENT
   ═══════════════════════════════════════════════════════════════ */

const CAROUSEL_ITEMS = [
  { key: 'music',    label: 'Artiste Music',  Preview: MusicPreview },
  { key: 'immo',     label: 'Immobilier',     Preview: ImmobilierPreview },
  { key: 'fitness',  label: 'Fitness Studio', Preview: FitnessPreview },
  { key: 'hotel',    label: 'Hôtel Luxe',     Preview: HotelPreview },
  { key: 'crypto',   label: 'Finance/Crypto', Preview: CryptoPreview },
  { key: 'edu',      label: 'Éducation',      Preview: EducationPreview },
  { key: 'archi',    label: 'Architecture',   Preview: ArchitecturePreview },
  { key: 'medical',  label: 'Cabinet Médical',Preview: MedicalPreview },
]

function TemplateCarousel() {
  const doubled = [...CAROUSEL_ITEMS, ...CAROUSEL_ITEMS]

  return (
    <div style={{ overflow: 'hidden', position: 'relative' }}>
      <style>{`
        @keyframes scrollCarousel {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .carousel-track {
          display: flex;
          gap: 16px;
          width: max-content;
          animation: scrollCarousel 40s linear infinite;
        }
        .carousel-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Left fade */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(90deg,#04040f,transparent)', zIndex: 10, pointerEvents: 'none' }} />
      {/* Right fade */}
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(-90deg,#04040f,transparent)', zIndex: 10, pointerEvents: 'none' }} />

      <div className="carousel-track">
        {doubled.map(({ key, label, Preview }, i) => (
          <div
            key={`${key}-${i}`}
            style={{
              flexShrink: 0,
              width: 220,
              height: 170,
              borderRadius: 16,
              overflow: 'hidden',
              border: '1px solid #1e1b4b',
              position: 'relative',
              cursor: 'default',
            }}
          >
            <Preview />
            {/* Label overlay */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: '6px 10px',
              background: 'linear-gradient(0deg,rgba(4,4,15,0.92) 0%,rgba(4,4,15,0.6) 100%)',
              backdropFilter: 'blur(4px)',
            }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#e2e8f0' }}>{label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN GRID DATA
   ═══════════════════════════════════════════════════════════════ */

const TEMPLATES = [
  { key: 'restaurant',  label: 'Restaurant',   prompt: 'Crée un site restaurant gastronomique élégant, thème sombre avec accent violet, menu, galerie et réservation en ligne', Preview: RestaurantPreview },
  { key: 'portfolio',   label: 'Portfolio',     prompt: 'Crée un portfolio photographe minimaliste noir et blanc avec galerie de projets et page de contact', Preview: PortfolioPreview },
  { key: 'agence',      label: 'Agence créa.',  prompt: 'Crée un site agence créative bold et moderne violet/indigo avec showcase de projets, équipe et formulaire de contact', Preview: AgencePreview },
  { key: 'saas',        label: 'SaaS / App',    prompt: 'Crée un site SaaS tech sombre et futuriste avec hero animé, features, pricing et CTA', Preview: SaaSPreview },
  { key: 'ecommerce',   label: 'E-commerce',    prompt: 'Crée une boutique e-commerce lifestyle épurée avec grille produits, panier et lookbook', Preview: EcommercePreview },
  { key: 'blog',        label: 'Blog / Média',  prompt: 'Crée un blog éditorial élégant avec articles mis en avant, catégories et newsletter', Preview: BlogPreview },
  { key: 'startup',     label: 'Startup',       prompt: 'Crée une landing page startup tech avec hero gradient, features, témoignages et section pricing', Preview: StartupPreview },
  { key: 'association', label: 'Association',   prompt: "Crée un site association/ONG moderne avec hero d'impact, chiffres clés, projets et appel aux dons", Preview: AssociationPreview },
  { key: 'landing',     label: 'Landing page',  prompt: 'Crée une landing page de conversion high-end avec headline percutante, social proof et CTA fort', Preview: LandingPreview },
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
    <section id="templates" className="py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={fadeUp} custom={0} className="text-center mb-14"
        >
          <h2 className="text-4xl font-black mb-4" style={{ color: '#e2e8f0' }}>Tous types de sites</h2>
          <p style={{ color: '#64748b' }}>Cliquez sur un template pour le générer instantanément</p>
        </motion.div>

        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-20">
          {TEMPLATES.map(({ key, label, prompt, Preview }, i) => (
            <motion.button
              key={key}
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp} custom={i}
              onClick={() => onSelect(prompt)}
              className="group relative rounded-2xl overflow-hidden text-left transition-all duration-300"
              style={{ background: '#0a0a1f', border: '1px solid #1e1b4b', height: 200 }}
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
              <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
                <Preview />
              </div>
              <div
                className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2.5 transition-all duration-200"
                style={{ background: 'linear-gradient(0deg,rgba(4,4,15,0.95) 0%,rgba(4,4,15,0.7) 100%)', backdropFilter: 'blur(4px)' }}
              >
                <span className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>{label}</span>
                <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ color: '#7c3aed' }}>
                  Générer →
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Animated carousel */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center mb-8 px-6">
          <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: '#7c3aed' }}>Et bien plus encore</p>
          <h3 className="text-2xl font-black" style={{ color: '#e2e8f0' }}>Des dizaines de types de sites générables</h3>
        </div>
        <TemplateCarousel />
      </motion.div>
    </section>
  )
}
