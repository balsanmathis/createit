'use client'

const W = 1024
const H = 576

function Bar({ w = '100%', h = 10, color = 'rgba(255,255,255,0.15)' }: { w?: string | number; h?: number; color?: string }) {
  return <div style={{ width: w, height: h, background: color, borderRadius: 3, flexShrink: 0 }} />
}

function Nav({ bg, logo, logoColor, links, linkColor, cta }: {
  bg: string; logo: string; logoColor: string; links: string[]; linkColor: string; cta?: { label: string; bg: string; color: string }
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '0 48px', height: 60, background: bg, flexShrink: 0 }}>
      <span style={{ color: logoColor, fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>{logo}</span>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 36, alignItems: 'center' }}>
        {links.map(l => <span key={l} style={{ color: linkColor, fontSize: 18 }}>{l}</span>)}
        {cta && <div style={{ background: cta.bg, color: cta.color, padding: '9px 22px', fontSize: 16, fontWeight: 700, borderRadius: 8 }}>{cta.label}</div>}
      </div>
    </div>
  )
}

// ── Restaurant ────────────────────────────────────────────────────────────────
function RestaurantMockup() {
  const c = { bg: '#1A0D07', nav: '#261408', accent: '#C9A160', text: '#F5EDD6', muted: '#9A7A40' }
  return (
    <div style={{ width: W, height: H, background: c.bg, fontFamily: 'Georgia,serif', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Nav bg={c.nav} logo="Maison Jourdain" logoColor={c.accent} links={['Menu', 'Réservations', 'Galerie', 'Contact']} linkColor={c.muted} />
      <div style={{ padding: '48px 80px 32px', background: `linear-gradient(135deg,${c.nav},${c.bg})` }}>
        <div style={{ color: c.accent, fontSize: 15, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 16 }}>★ Paris, France ★</div>
        <h1 style={{ color: c.text, fontSize: 62, fontWeight: 400, lineHeight: 1.05, margin: '0 0 18px', maxWidth: 560 }}>La Cuisine Française<br />dans toute sa splendeur</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 30, maxWidth: 380 }}>
          <Bar w={320} h={13} color={`${c.muted}80`} /><Bar w={260} h={13} color={`${c.muted}55`} />
        </div>
        <div style={{ display: 'inline-block', background: c.accent, color: '#1A0D07', padding: '15px 42px', fontSize: 21, fontWeight: 700, letterSpacing: 0.5 }}>Réserver une table →</div>
      </div>
      <div style={{ display: 'flex', gap: 14, padding: '20px 48px', flex: 1 }}>
        {[{n:'Saint-Jacques & Truffe',p:'32 €'},{n:'Foie gras poêlé',p:'28 €'},{n:'Soufflé Grand Marnier',p:'24 €'}].map((d,i) => (
          <div key={i} style={{ flex:1, background:c.nav, border:`1px solid ${c.accent}30`, padding:'14px', borderRadius:4 }}>
            <div style={{ width:'100%', height:80, background:`linear-gradient(${135+i*40}deg,#3D1A0A,#1A0D07)`, marginBottom:12, borderRadius:3 }} />
            <div style={{ color:c.text, fontSize:17, fontWeight:600, marginBottom:6 }}>{d.n}</div>
            <div style={{ color:c.accent, fontSize:16 }}>{d.p}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Pizzeria ──────────────────────────────────────────────────────────────────
function PizzeriaMockup() {
  const c = { bg: '#1C0A00', nav: '#2A1200', accent: '#E8521A', text: '#FFF3E8', muted: '#C4845C' }
  return (
    <div style={{ width:W, height:H, background:c.bg, fontFamily:'system-ui,sans-serif', overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <Nav bg={c.nav} logo="🍕 Napoli Vera" logoColor={c.accent} links={['Menu','Commander','Livraison','Contact']} linkColor={c.muted} />
      <div style={{ padding:'44px 80px 28px', background:`linear-gradient(150deg,${c.nav},${c.bg})` }}>
        <div style={{ color:c.accent, fontSize:14, letterSpacing:3, textTransform:'uppercase', marginBottom:14 }}>Authentique depuis 1987</div>
        <h1 style={{ color:c.text, fontSize:66, fontWeight:900, lineHeight:1.0, margin:'0 0 18px' }}>La pizza comme<br />à Naples</h1>
        <div style={{ display:'flex', flexDirection:'column', gap:9, marginBottom:28, maxWidth:360 }}>
          <Bar w={280} h={13} color={`${c.muted}80`} /><Bar w={220} h={13} color={`${c.muted}55`} />
        </div>
        <div style={{ display:'flex', gap:14 }}>
          <div style={{ background:c.accent, color:'#fff', padding:'13px 34px', fontSize:20, fontWeight:700, borderRadius:6 }}>Commander →</div>
          <div style={{ border:`2px solid ${c.muted}60`, color:c.muted, padding:'13px 34px', fontSize:20, fontWeight:600, borderRadius:6 }}>Notre menu</div>
        </div>
      </div>
      <div style={{ display:'flex', gap:14, padding:'18px 48px', flex:1 }}>
        {['Margherita','Truffe & Burrata','Diavola'].map((name,i) => (
          <div key={i} style={{ flex:1, background:c.nav, border:`1px solid ${c.accent}25`, borderRadius:6, overflow:'hidden' }}>
            <div style={{ height:78, background:`linear-gradient(${120+i*50}deg,#3D1200,#1C0800)` }} />
            <div style={{ padding:'11px 14px' }}>
              <div style={{ color:c.text, fontSize:17, fontWeight:700, marginBottom:5 }}>{name}</div>
              <div style={{ color:c.accent, fontSize:15, fontWeight:600 }}>{['14 €','22 €','16 €'][i]}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Photographe ───────────────────────────────────────────────────────────────
function PhotoMockup() {
  const c = { bg:'#F7F7F5', nav:'#FFFFFF', accent:'#0A0A0A', muted:'#888' }
  return (
    <div style={{ width:W, height:H, background:c.bg, fontFamily:'system-ui,sans-serif', overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <div style={{ display:'flex', alignItems:'center', padding:'0 48px', height:60, background:c.nav, borderBottom:'1px solid #E5E5E0', flexShrink:0 }}>
        <span style={{ color:c.accent, fontSize:22, fontWeight:700, letterSpacing:-0.5 }}>Lucie Moreau</span>
        <div style={{ marginLeft:'auto', display:'flex', gap:36 }}>
          {['Portfolio','Services','Tarifs','Contact'].map(l=><span key={l} style={{ color:c.muted, fontSize:18 }}>{l}</span>)}
        </div>
      </div>
      <div style={{ padding:'44px 80px 24px' }}>
        <div style={{ color:c.muted, fontSize:15, letterSpacing:4, textTransform:'uppercase', marginBottom:10 }}>Photographe — Paris</div>
        <h1 style={{ color:c.accent, fontSize:90, fontWeight:900, lineHeight:0.88, margin:'0 0 24px', letterSpacing:-3 }}>PORTFOLIO</h1>
        <div style={{ display:'flex', flexDirection:'column', gap:9, marginBottom:28, maxWidth:380 }}>
          <Bar w={300} h={12} color="#0A0A0A18" /><Bar w={240} h={12} color="#0A0A0A12" />
        </div>
        <div style={{ display:'flex', gap:14 }}>
          <div style={{ background:c.accent, color:'#fff', padding:'13px 34px', fontSize:18, fontWeight:600 }}>Voir le book →</div>
          <div style={{ border:'1.5px solid #0A0A0A40', color:c.muted, padding:'13px 34px', fontSize:18 }}>Contact</div>
        </div>
      </div>
      <div style={{ display:'flex', gap:8, padding:'0 48px', flex:1 }}>
        {[{c:'#C8C8C4',flex:1.3},{c:'#B0B0AB',flex:1},{c:'#D4D4CF',flex:1.1},{c:'#A8A8A4',flex:0.9}].map((r,i)=>(
          <div key={i} style={{ flex:r.flex, background:r.c, borderRadius:2 }} />
        ))}
      </div>
    </div>
  )
}

// ── Portfolio designer ────────────────────────────────────────────────────────
function DesignerMockup() {
  const c = { bg:'#0F0F14', accent:'#A78BFA', text:'#FFFFFF', muted:'#888899' }
  return (
    <div style={{ width:W, height:H, background:c.bg, fontFamily:'system-ui,sans-serif', overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <div style={{ display:'flex', alignItems:'center', padding:'0 48px', height:60, flexShrink:0 }}>
        <span style={{ color:c.text, fontSize:22, fontWeight:700 }}>Marc Dubois <span style={{ color:c.accent }}>UI/UX</span></span>
        <div style={{ marginLeft:'auto', display:'flex', gap:36 }}>
          {['Projets','Compétences','Process','Contact'].map(l=><span key={l} style={{ color:c.muted, fontSize:18 }}>{l}</span>)}
        </div>
      </div>
      <div style={{ padding:'40px 80px 24px' }}>
        <div style={{ color:c.accent, fontSize:14, letterSpacing:3, textTransform:'uppercase', marginBottom:14 }}>Designer produit</div>
        <h1 style={{ color:c.text, fontSize:70, fontWeight:800, lineHeight:1.0, margin:'0 0 18px', letterSpacing:-2 }}>Je conçois des<br />expériences.</h1>
        <div style={{ display:'flex', flexDirection:'column', gap:9, marginBottom:26 }}>
          <Bar w={340} h={12} color={`${c.muted}55`} /><Bar w={280} h={12} color={`${c.muted}40`} />
        </div>
        <div style={{ background:c.accent, color:'#0F0F14', padding:'13px 38px', fontSize:19, fontWeight:700, borderRadius:8, display:'inline-block' }}>Voir mes projets</div>
      </div>
      <div style={{ display:'flex', gap:14, padding:'0 48px', flex:1 }}>
        {[{label:'App fintech',c:'#1E1E2E'},{label:'Dashboard SaaS',c:'#1A1A2A'},{label:'E-commerce',c:'#1C1C2C'}].map((card,i)=>(
          <div key={i} style={{ flex:1, background:card.c, border:`1px solid ${c.accent}25`, borderRadius:10, padding:'16px' }}>
            <div style={{ height:68, background:`linear-gradient(135deg,${c.accent}40,transparent)`, borderRadius:6, marginBottom:10 }} />
            <div style={{ color:c.text, fontSize:17, fontWeight:600, marginBottom:6 }}>{card.label}</div>
            <Bar w="70%" h={10} color={`${c.muted}50`} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Boutique artisanale ───────────────────────────────────────────────────────
function BoutiqueMockup() {
  const c = { bg:'#FFF8F0', nav:'#FFFFFF', accent:'#C4795A', text:'#2D1810', muted:'#9A6850' }
  return (
    <div style={{ width:W, height:H, background:c.bg, fontFamily:'Georgia,serif', overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <div style={{ display:'flex', alignItems:'center', padding:'0 48px', height:60, background:c.nav, borderBottom:'1px solid #E8DDD5', flexShrink:0 }}>
        <span style={{ color:c.text, fontSize:26, fontWeight:700 }}>La Petite Boutique</span>
        <div style={{ marginLeft:'auto', display:'flex', gap:34 }}>
          {['Collection','À propos','Atelier','Contact'].map(l=><span key={l} style={{ color:c.muted, fontSize:19 }}>{l}</span>)}
        </div>
      </div>
      <div style={{ padding:'44px 80px 28px', background:'linear-gradient(160deg,#FFF8F0,#FAEEE4)' }}>
        <div style={{ color:c.accent, fontSize:13, letterSpacing:3, textTransform:'uppercase', marginBottom:14 }}>Collection printemps 2025</div>
        <h1 style={{ color:c.text, fontSize:60, fontWeight:400, lineHeight:1.1, margin:'0 0 18px', maxWidth:500 }}>Fait avec amour,<br />porté avec fierté</h1>
        <div style={{ display:'flex', flexDirection:'column', gap:9, marginBottom:28 }}>
          <Bar w={310} h={12} color="#9A685030" /><Bar w={250} h={12} color="#9A685020" />
        </div>
        <div style={{ display:'flex', gap:14 }}>
          <div style={{ background:c.accent, color:'#fff', padding:'13px 38px', fontSize:19, fontWeight:700, borderRadius:6 }}>Découvrir →</div>
          <div style={{ border:`1.5px solid ${c.accent}50`, color:c.accent, padding:'13px 30px', fontSize:19, borderRadius:6 }}>Notre histoire</div>
        </div>
      </div>
      <div style={{ display:'flex', gap:14, padding:'18px 48px', flex:1 }}>
        {[{n:'Tote bag lin naturel',p:'38 €',bg:'#E8D5C4'},{n:'Pochette brodée',p:'52 €',bg:'#D4C4B5'},{n:'Carnet artisanal',p:'24 €',bg:'#EAD8CA'}].map((p,i)=>(
          <div key={i} style={{ flex:1, background:'#FFFFFF', border:'1px solid #E8DDD5', borderRadius:8, overflow:'hidden' }}>
            <div style={{ height:78, background:p.bg }} />
            <div style={{ padding:'11px 14px' }}>
              <div style={{ color:c.text, fontSize:16, fontWeight:600, marginBottom:5 }}>{p.n}</div>
              <div style={{ color:c.accent, fontSize:15, fontWeight:700 }}>{p.p}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Bijouterie ────────────────────────────────────────────────────────────────
function BijouxMockup() {
  const c = { bg:'#0C0808', nav:'#140D0D', accent:'#C9A84C', text:'#F5EDE8', muted:'#9A8870' }
  return (
    <div style={{ width:W, height:H, background:c.bg, fontFamily:'Georgia,serif', overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <Nav bg={c.nav} logo="AURÉA" logoColor={c.accent} links={['Collection','Sur mesure','Histoire','Contact']} linkColor={c.muted} />
      <div style={{ padding:'48px 80px 28px' }}>
        <div style={{ color:c.accent, fontSize:13, letterSpacing:5, textTransform:'uppercase', marginBottom:18 }}>Bijoux artisanaux — Paris</div>
        <h1 style={{ color:c.text, fontSize:62, fontWeight:300, lineHeight:1.1, margin:'0 0 18px', maxWidth:520, letterSpacing:-1 }}>L'art de la joaillerie<br />fait à la main</h1>
        <div style={{ display:'flex', flexDirection:'column', gap:9, marginBottom:30 }}>
          <Bar w={300} h={12} color={`${c.muted}50`} /><Bar w={240} h={12} color={`${c.muted}35`} />
        </div>
        <div style={{ border:`1px solid ${c.accent}`, color:c.accent, padding:'13px 42px', fontSize:17, letterSpacing:2, display:'inline-block', textTransform:'uppercase' }}>Découvrir la collection</div>
      </div>
      <div style={{ display:'flex', gap:12, padding:'12px 48px', flex:1 }}>
        {['Bague Soleil','Collier Lumière','Boucles Étoile'].map((item,i)=>(
          <div key={i} style={{ flex:1, background:c.nav, border:`1px solid ${c.accent}30`, borderRadius:4 }}>
            <div style={{ height:88, background:`radial-gradient(circle at 50% 50%,#2A1A0C,#0C0808)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ width:40, height:40, borderRadius:'50%', border:`2px solid ${c.accent}`, background:`radial-gradient(${c.accent}40,transparent)` }} />
            </div>
            <div style={{ padding:'11px 14px' }}>
              <div style={{ color:c.text, fontSize:15, fontWeight:600, marginBottom:4 }}>{item}</div>
              <div style={{ color:c.accent, fontSize:14 }}>{['245 €','189 €','130 €'][i]}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Cabinet d'architecte ──────────────────────────────────────────────────────
function ArchitecteMockup() {
  const c = { bg:'#FAFAF8', nav:'#FFFFFF', accent:'#1A1A1A', muted:'#888', border:'#E5E5E0' }
  return (
    <div style={{ width:W, height:H, background:c.bg, fontFamily:'system-ui,sans-serif', overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <div style={{ display:'flex', alignItems:'center', padding:'0 48px', height:60, background:c.nav, borderBottom:`1px solid ${c.border}`, flexShrink:0 }}>
        <span style={{ color:c.accent, fontSize:22, fontWeight:700 }}>Atelier Morin <span style={{ color:c.muted, fontWeight:400 }}>Architectes</span></span>
        <div style={{ marginLeft:'auto', display:'flex', gap:34 }}>
          {['Projets','Agence','Démarche','Contact'].map(l=><span key={l} style={{ color:c.muted, fontSize:18 }}>{l}</span>)}
        </div>
      </div>
      <div style={{ display:'flex', flex:1 }}>
        <div style={{ flex:'0 0 460px', padding:'48px 56px 32px 80px' }}>
          <div style={{ color:c.muted, fontSize:13, letterSpacing:3, textTransform:'uppercase', marginBottom:18 }}>Architecture & Design</div>
          <h1 style={{ color:c.accent, fontSize:56, fontWeight:800, lineHeight:1.0, margin:'0 0 22px', letterSpacing:-2 }}>Concevoir l'espace<br />qui vous ressemble</h1>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:32 }}>
            <Bar w={320} h={12} color="#1A1A1A20" /><Bar w={260} h={12} color="#1A1A1A15" /><Bar w={290} h={12} color="#1A1A1A18" />
          </div>
          <div style={{ background:c.accent, color:'#fff', padding:'13px 38px', fontSize:17, fontWeight:600, borderRadius:4, display:'inline-block' }}>Voir nos réalisations</div>
        </div>
        <div style={{ flex:1, background:'linear-gradient(135deg,#C4C4C0,#D4D4CE,#EBEBEA)' }} />
      </div>
      <div style={{ display:'flex', gap:8, padding:'10px 48px 14px', flexShrink:0 }}>
        {['Résidence Lyon','Bureau Paris','Villa Nice','Loft Bordeaux'].map((p,i)=>(
          <div key={i} style={{ flex:1, height:72, background:['#C8C8C4','#B8B8B3','#D0D0CA','#C0C0BA'][i], borderRadius:4, display:'flex', alignItems:'flex-end', padding:'10px 12px' }}>
            <span style={{ color:'#FAFAF8', fontSize:14, fontWeight:600 }}>{p}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Agence digitale ───────────────────────────────────────────────────────────
function AgenceMockup() {
  const c = { bg:'#0A0A14', accent:'#7C3AED', text:'#FFFFFF', muted:'#8888AA' }
  return (
    <div style={{ width:W, height:H, background:c.bg, fontFamily:'system-ui,sans-serif', overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <Nav bg={c.bg} logo="AgenceX" logoColor={c.text} links={['Services','Réalisations','Équipe','Contact']} linkColor={c.muted}
        cta={{ label:'Démarrer →', bg:c.accent, color:'#fff' }} />
      <div style={{ padding:'40px 80px 24px', position:'relative' }}>
        <div style={{ position:'absolute', right:48, top:-20, width:280, height:280, background:`radial-gradient(circle,${c.accent}20,transparent 70%)`, borderRadius:'50%', pointerEvents:'none' }} />
        <div style={{ color:c.accent, fontSize:13, letterSpacing:3, textTransform:'uppercase', marginBottom:14 }}>Agence digitale full-service</div>
        <h1 style={{ color:c.text, fontSize:66, fontWeight:900, lineHeight:1.0, margin:'0 0 18px', letterSpacing:-2, maxWidth:560 }}>Propulsez votre<br />marque en ligne</h1>
        <div style={{ display:'flex', flexDirection:'column', gap:9, marginBottom:28 }}>
          <Bar w={360} h={13} color={`${c.muted}55`} /><Bar w={300} h={13} color={`${c.muted}40`} />
        </div>
        <div style={{ display:'flex', gap:14 }}>
          <div style={{ background:c.accent, color:'#fff', padding:'13px 38px', fontSize:19, fontWeight:700, borderRadius:8 }}>Voir nos projets →</div>
          <div style={{ border:`1px solid ${c.muted}50`, color:c.muted, padding:'13px 34px', fontSize:19, borderRadius:8 }}>En savoir plus</div>
        </div>
      </div>
      <div style={{ display:'flex', gap:14, padding:'0 48px', flex:1 }}>
        {['Design UX/UI','Développement','SEO & Growth'].map((svc,i)=>(
          <div key={i} style={{ flex:1, background:`${c.accent}12`, border:`1px solid ${c.accent}25`, borderRadius:10, padding:'18px' }}>
            <div style={{ width:34, height:34, background:c.accent, borderRadius:8, marginBottom:12 }} />
            <div style={{ color:c.text, fontSize:17, fontWeight:700, marginBottom:8 }}>{svc}</div>
            <Bar w="80%" h={10} color={`${c.muted}55`} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Startup SaaS ──────────────────────────────────────────────────────────────
function StartupMockup() {
  const c = { bg:'#0D0D1E', accent:'#818CF8', accent2:'#C084FC', text:'#FFFFFF', muted:'#8080A0' }
  return (
    <div style={{ width:W, height:H, background:c.bg, fontFamily:'system-ui,sans-serif', overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <div style={{ display:'flex', alignItems:'center', padding:'0 48px', height:60, flexShrink:0 }}>
        <span style={{ fontSize:26, fontWeight:800, background:`linear-gradient(90deg,${c.accent},${c.accent2})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Synapse</span>
        <div style={{ marginLeft:'auto', display:'flex', gap:32, alignItems:'center' }}>
          {['Fonctionnalités','Tarifs','Docs','Se connecter'].map(l=><span key={l} style={{ color:c.muted, fontSize:17 }}>{l}</span>)}
          <div style={{ background:`linear-gradient(90deg,${c.accent},${c.accent2})`, color:'#fff', padding:'9px 22px', fontSize:15, fontWeight:700, borderRadius:8 }}>Essai gratuit →</div>
        </div>
      </div>
      <div style={{ padding:'38px 80px 24px', textAlign:'center' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#6366F115', border:'1px solid #6366F140', borderRadius:20, padding:'5px 16px', marginBottom:20 }}>
          <div style={{ width:7, height:7, background:c.accent, borderRadius:'50%' }} />
          <span style={{ color:c.accent, fontSize:14 }}>Nouveau — Intégration IA disponible</span>
        </div>
        <h1 style={{ color:c.text, fontSize:62, fontWeight:900, lineHeight:1.0, margin:'0 0 18px', letterSpacing:-2 }}>L'outil que vos équipes<br />attendaient</h1>
        <div style={{ display:'flex', flexDirection:'column', gap:9, alignItems:'center', marginBottom:28 }}>
          <Bar w={380} h={13} color={`${c.muted}55`} /><Bar w={300} h={13} color={`${c.muted}40`} />
        </div>
        <div style={{ display:'flex', gap:14, justifyContent:'center' }}>
          <div style={{ background:`linear-gradient(90deg,${c.accent},${c.accent2})`, color:'#fff', padding:'13px 42px', fontSize:19, fontWeight:700, borderRadius:10 }}>Commencer gratuitement</div>
          <div style={{ border:`1px solid ${c.muted}50`, color:c.muted, padding:'13px 34px', fontSize:19, borderRadius:10 }}>Voir la démo</div>
        </div>
      </div>
      <div style={{ margin:'0 48px', background:'#1A1A30', border:'1px solid #6366F130', borderRadius:'10px 10px 0 0', padding:'10px 18px', display:'flex', gap:10, alignItems:'center', flexShrink:0 }}>
        <div style={{ display:'flex', gap:5 }}>
          {['#FC6358','#FEBC2E','#28C840'].map(cl=><div key={cl} style={{ width:10, height:10, borderRadius:'50%', background:cl }} />)}
        </div>
        <Bar w={200} h={9} color="#6366F130" />
        <div style={{ marginLeft:'auto', display:'flex', gap:6 }}><Bar w={50} h={9} color="#6366F130" /><Bar w={40} h={9} color="#6366F130" /></div>
      </div>
    </div>
  )
}

// ── Cabinet médical ───────────────────────────────────────────────────────────
function MedicalMockup() {
  const c = { bg:'#F0F6FF', nav:'#FFFFFF', accent:'#1E6FBB', text:'#1A2B3C', muted:'#6080A0', border:'#DBEAFE' }
  return (
    <div style={{ width:W, height:H, background:c.bg, fontFamily:'system-ui,sans-serif', overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <div style={{ display:'flex', alignItems:'center', padding:'0 48px', height:60, background:c.nav, borderBottom:`1px solid ${c.border}`, flexShrink:0 }}>
        <span style={{ color:c.accent, fontSize:24, fontWeight:700 }}>Dr. Martin</span>
        <span style={{ color:c.muted, fontSize:17, marginLeft:10 }}>Médecin généraliste</span>
        <div style={{ marginLeft:'auto', display:'flex', gap:32, alignItems:'center' }}>
          {['Spécialités','Équipe','Accès','Contact'].map(l=><span key={l} style={{ color:c.muted, fontSize:17 }}>{l}</span>)}
          <div style={{ background:c.accent, color:'#fff', padding:'9px 22px', fontSize:15, fontWeight:700, borderRadius:8 }}>Prendre RDV</div>
        </div>
      </div>
      <div style={{ display:'flex', flex:1 }}>
        <div style={{ flex:'0 0 490px', padding:'48px 56px 32px 80px' }}>
          <div style={{ color:c.accent, fontSize:13, letterSpacing:2, textTransform:'uppercase', marginBottom:14 }}>Cabinet médical — Paris 15ème</div>
          <h1 style={{ color:c.text, fontSize:54, fontWeight:800, lineHeight:1.05, margin:'0 0 18px', letterSpacing:-1.5 }}>Votre santé,<br />notre priorité</h1>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:30 }}>
            <Bar w={320} h={12} color={`${c.muted}40`} /><Bar w={280} h={12} color={`${c.muted}30`} />
          </div>
          <div style={{ display:'flex', gap:12 }}>
            <div style={{ background:c.accent, color:'#fff', padding:'13px 34px', fontSize:17, fontWeight:700, borderRadius:8 }}>Prendre RDV →</div>
            <div style={{ border:`1.5px solid ${c.accent}60`, color:c.accent, padding:'13px 26px', fontSize:17, borderRadius:8 }}>Urgences</div>
          </div>
        </div>
        <div style={{ flex:1, background:`linear-gradient(135deg,#DBEAFE,#EFF6FF)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ width:150, height:150, background:`${c.accent}15`, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', border:`3px solid ${c.accent}25` }}>
            <div style={{ color:c.accent, fontSize:70, lineHeight:1, fontWeight:300 }}>+</div>
          </div>
        </div>
      </div>
      <div style={{ display:'flex', gap:12, padding:'10px 48px 14px', flexShrink:0 }}>
        {['Médecine générale','Pédiatrie','Nutrition','Suivi chronique'].map((svc,i)=>(
          <div key={i} style={{ flex:1, background:'#FFFFFF', border:`1px solid ${c.border}`, borderRadius:10, padding:'14px' }}>
            <div style={{ width:30, height:30, background:`${c.accent}15`, borderRadius:8, marginBottom:8 }} />
            <div style={{ color:c.text, fontSize:14, fontWeight:600 }}>{svc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Coach sportif ─────────────────────────────────────────────────────────────
function CoachMockup() {
  const c = { bg:'#0A0A0A', accent:'#F5A623', text:'#FFFFFF', muted:'#888' }
  return (
    <div style={{ width:W, height:H, background:c.bg, fontFamily:'system-ui,sans-serif', overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <div style={{ display:'flex', alignItems:'center', padding:'0 48px', height:60, borderBottom:'1px solid #1E1E1E', flexShrink:0 }}>
        <span style={{ color:c.accent, fontSize:26, fontWeight:900, letterSpacing:-1 }}>POWER<span style={{ color:c.text }}>FIT</span></span>
        <div style={{ marginLeft:'auto', display:'flex', gap:34, alignItems:'center' }}>
          {['Programmes','Tarifs','Témoignages','Contact'].map(l=><span key={l} style={{ color:c.muted, fontSize:18 }}>{l}</span>)}
          <div style={{ background:c.accent, color:'#0A0A0A', padding:'9px 22px', fontSize:15, fontWeight:900, borderRadius:6 }}>REJOINDRE</div>
        </div>
      </div>
      <div style={{ padding:'44px 80px 28px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:-40, top:-40, width:340, height:340, background:`radial-gradient(circle,${c.accent}15,transparent 70%)`, pointerEvents:'none' }} />
        <div style={{ color:c.accent, fontSize:13, letterSpacing:4, textTransform:'uppercase', marginBottom:14 }}>Coach certifié — Paris</div>
        <h1 style={{ color:c.text, fontSize:70, fontWeight:900, lineHeight:0.95, margin:'0 0 22px', letterSpacing:-2 }}>TRANS<span style={{ color:c.accent }}>FORMEZ</span><br />VOTRE CORPS</h1>
        <div style={{ display:'flex', flexDirection:'column', gap:9, marginBottom:28, maxWidth:400 }}>
          <Bar w={340} h={12} color={`${c.muted}55`} /><Bar w={280} h={12} color={`${c.muted}40`} />
        </div>
        <div style={{ display:'flex', gap:14 }}>
          <div style={{ background:c.accent, color:'#0A0A0A', padding:'13px 42px', fontSize:21, fontWeight:900, borderRadius:6 }}>COMMENCER →</div>
          <div style={{ border:'1px solid #333', color:c.muted, padding:'13px 34px', fontSize:21, borderRadius:6 }}>Voir les programmes</div>
        </div>
      </div>
      <div style={{ display:'flex', gap:12, padding:'0 48px', flex:1 }}>
        {[{label:'Prise de masse',price:'79 €/mois'},{label:'Perte de poids',price:'69 €/mois'},{label:'Remise en forme',price:'49 €/mois'}].map((p,i)=>(
          <div key={i} style={{ flex:1, background:'#141400', border:`1px solid ${c.accent}30`, borderRadius:8, padding:'16px' }}>
            <div style={{ color:c.text, fontSize:17, fontWeight:800, marginBottom:5 }}>{p.label}</div>
            <div style={{ color:c.accent, fontSize:17, fontWeight:900, marginBottom:10 }}>{p.price}</div>
            <Bar w="80%" h={10} color={`${c.muted}40`} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Blog voyage ───────────────────────────────────────────────────────────────
function BlogMockup() {
  const c = { bg:'#FAFAF7', nav:'#FFFFFF', accent:'#7A4F2D', text:'#1A1A14', muted:'#888878', border:'#E8E4DC' }
  return (
    <div style={{ width:W, height:H, background:c.bg, fontFamily:'Georgia,serif', overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <div style={{ display:'flex', alignItems:'center', padding:'0 48px', height:60, background:c.nav, borderBottom:`1px solid ${c.border}`, flexShrink:0 }}>
        <span style={{ color:c.text, fontSize:26, fontWeight:700, fontStyle:'italic' }}>Le Journal du Voyageur</span>
        <div style={{ marginLeft:'auto', display:'flex', gap:34 }}>
          {['Articles','Destinations','Cartes','Newsletter'].map(l=><span key={l} style={{ color:c.muted, fontSize:18 }}>{l}</span>)}
        </div>
      </div>
      <div style={{ display:'flex', height:240, flexShrink:0 }}>
        <div style={{ flex:'0 0 380px', background:'#C8C4B8' }} />
        <div style={{ flex:1, padding:'36px 56px', background:'#FFFFFF' }}>
          <div style={{ color:c.accent, fontSize:12, letterSpacing:2, textTransform:'uppercase', marginBottom:10 }}>À la une — Asie du Sud-Est</div>
          <h2 style={{ color:c.text, fontSize:38, fontWeight:700, lineHeight:1.1, margin:'0 0 14px' }}>30 jours au Japon :<br />le guide ultime 2025</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
            <Bar w="85%" h={11} color="#1A1A1418" /><Bar w="70%" h={11} color="#1A1A1412" />
          </div>
          <div style={{ color:c.accent, fontSize:16, fontWeight:600 }}>Lire l&apos;article →</div>
        </div>
      </div>
      <div style={{ display:'flex', gap:14, padding:'14px 48px', flex:1 }}>
        {[{dest:'Bali, Indonésie',title:'Les temples cachés',bg:'#B8C4B0'},{dest:'Maroc',title:'Désert de Zagora en 4x4',bg:'#C4B8A8'},{dest:'Islande',title:'Aurores boréales & fjords',bg:'#B0B8C4'}].map((art,i)=>(
          <div key={i} style={{ flex:1, background:'#FFFFFF', border:`1px solid ${c.border}`, borderRadius:6, overflow:'hidden' }}>
            <div style={{ height:68, background:art.bg }} />
            <div style={{ padding:'11px 13px' }}>
              <div style={{ color:c.muted, fontSize:11, letterSpacing:1.5, textTransform:'uppercase', marginBottom:4 }}>{art.dest}</div>
              <div style={{ color:c.text, fontSize:14, fontWeight:700 }}>{art.title}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Routing & export ──────────────────────────────────────────────────────────

const SLUG_TO_THEME: Record<string, string> = {
  'restaurant-gastronomique': 'restaurant',
  'pizzeria-napolitaine':     'pizzeria',
  'cabinet-architecte':       'architecte',
  'agence-digitale':          'agence',
  'startup-tech':             'startup',
  'boutique-artisanale':      'boutique',
  'boutique-bijoux':          'bijoux',
  'portfolio-photographe':    'photo',
  'portfolio-designer':       'designer',
  'cabinet-medical':          'medical',
  'coach-sportif':            'coach',
  'blog-voyage':              'blog',
}

const SECTOR_FALLBACK: Record<string, string> = {
  restaurant: 'restaurant',
  portfolio:  'photo',
  boutique:   'boutique',
  agence:     'agence',
  coach:      'coach',
  blog:       'blog',
}

const THEME_BG: Record<string, string> = {
  restaurant: '#1A0D07', pizzeria: '#1C0A00', photo: '#F7F7F5',
  designer: '#0F0F14',   boutique: '#FFF8F0', bijoux: '#0C0808',
  architecte: '#FAFAF8', agence: '#0A0A14',   startup: '#0D0D1E',
  medical: '#F0F6FF',    coach: '#0A0A0A',    blog: '#FAFAF7',
}

const THEME_COMPONENTS: Record<string, () => React.ReactElement> = {
  restaurant: RestaurantMockup, pizzeria: PizzeriaMockup,
  photo: PhotoMockup,           designer: DesignerMockup,
  boutique: BoutiqueMockup,     bijoux: BijouxMockup,
  architecte: ArchitecteMockup, agence: AgenceMockup,
  startup: StartupMockup,       medical: MedicalMockup,
  coach: CoachMockup,           blog: BlogMockup,
}

interface Props {
  sector: string
  slug?: string
  /** Visual scale — defaults to fill a 200px-tall card */
  scale?: number
}

export default function SiteMockup({ sector, slug, scale = 200 / H }: Props) {
  const theme = (slug && SLUG_TO_THEME[slug]) ?? SECTOR_FALLBACK[sector] ?? 'agence'
  const Mockup = THEME_COMPONENTS[theme] ?? AgenceMockup
  const bg = THEME_BG[theme] ?? '#0A0A0A'

  return (
    <div style={{ position: 'absolute', inset: 0, background: bg, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: W, height: H,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        userSelect: 'none',
        pointerEvents: 'none',
      }}>
        <Mockup />
      </div>
    </div>
  )
}
