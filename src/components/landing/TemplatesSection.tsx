'use client'

import { useState, useEffect, useRef } from 'react'

/* ─────────────────────────────────────────────────────────────────
   PREVIEW COMPONENTS — purely static CSS, zero animations
   (animations inside 24+ simultaneous cards = browser crash)
   ───────────────────────────────────────────────────────────────── */

function RestaurantGastroPreview() {
  return (
    <div style={{ width:'100%',height:'100%',background:'#050300',fontFamily:'Georgia,serif',overflow:'hidden',position:'relative' }}>
      <div style={{ position:'absolute',top:'25%',left:'50%',transform:'translateX(-50%)',width:120,height:50,background:'radial-gradient(ellipse,rgba(212,175,55,0.18) 0%,transparent 70%)',filter:'blur(18px)' }} />
      <div style={{ padding:'7px 12px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid rgba(212,175,55,0.18)' }}>
        <span style={{ color:'#d4af37',fontSize:7.5,fontWeight:700,letterSpacing:4 }}>LE BERNARDIN</span>
        <div style={{ display:'flex',gap:7,fontSize:6,color:'#6b5c2a' }}><span>Menu</span><span>Cave</span><span>Réserver</span></div>
      </div>
      <div style={{ height:72,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',position:'relative' }}>
        <div style={{ fontSize:5.5,color:'#d4af37',letterSpacing:6,marginBottom:5 }}>GASTRONOMIQUE · PARIS</div>
        <div style={{ fontSize:16,fontWeight:700,color:'#f5f0e8',letterSpacing:0.5,textAlign:'center',lineHeight:1.1 }}>L'Excellence<br /><span style={{ background:'linear-gradient(90deg,#b8960c,#d4af37,#f0d060)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>à Table</span></div>
        <div style={{ marginTop:7,fontSize:6.5,background:'rgba(212,175,55,0.12)',border:'1px solid rgba(212,175,55,0.3)',color:'#d4af37',padding:'3px 10px',borderRadius:20,letterSpacing:2 }}>RÉSERVER</div>
      </div>
      <div style={{ padding:'5px 10px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:3 }}>
        {[['Amuse-bouche','—'],['Homard Bleu','72€'],['Filet de Bœuf','58€'],['Soufflé Praline','24€']].map(([dish,price])=>(
          <div key={dish} style={{ padding:'4px 6px',borderBottom:'1px solid rgba(212,175,55,0.1)' }}>
            <div style={{ fontSize:6.5,color:'#e5dfc7',fontWeight:600 }}>{dish}</div>
            <div style={{ fontSize:5.5,color:'#6b5c2a' }}>{price}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StartupTechPreview() {
  return (
    <div style={{ width:'100%',height:'100%',background:'#020409',fontFamily:'system-ui,sans-serif',overflow:'hidden',position:'relative' }}>
      <div style={{ position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(56,189,248,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(56,189,248,0.04) 1px,transparent 1px)',backgroundSize:'20px 20px' }} />
      <div style={{ padding:'7px 12px',display:'flex',justifyContent:'space-between',alignItems:'center',position:'relative' }}>
        <span style={{ fontSize:8,fontWeight:800,color:'#38bdf8' }}>◈ NexAI</span>
        <div style={{ background:'#38bdf8',color:'#020409',fontSize:6.5,padding:'2px 8px',borderRadius:20,fontWeight:800 }}>Beta</div>
      </div>
      <div style={{ padding:'4px 12px 6px',position:'relative' }}>
        <div style={{ fontSize:5.5,color:'#38bdf8',letterSpacing:3,marginBottom:4 }}>🚀 INTELLIGENCE ARTIFICIELLE</div>
        <div style={{ fontSize:14,fontWeight:900,color:'#f1f5f9',lineHeight:1.1,letterSpacing:-0.5,marginBottom:5 }}>Du concept<br />au produit<br /><span style={{ color:'#38bdf8' }}>en 48h.</span></div>
        <div style={{ display:'flex',gap:4 }}>
          <div style={{ fontSize:6.5,padding:'3px 8px',background:'#38bdf8',color:'#020409',borderRadius:20,fontWeight:700 }}>Démarrer</div>
          <div style={{ fontSize:6.5,padding:'3px 8px',border:'1px solid rgba(56,189,248,0.3)',color:'#38bdf8',borderRadius:20 }}>Démo</div>
        </div>
      </div>
      <div style={{ padding:'5px 10px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:3 }}>
        {[['⚡','Ultra rapide'],['🔒','Sécurisé'],['📊','Analytics'],['🤖','IA native']].map(([icon,label])=>(
          <div key={label} style={{ display:'flex',alignItems:'center',gap:4,padding:'3px 5px',background:'rgba(56,189,248,0.05)',border:'1px solid rgba(56,189,248,0.1)',borderRadius:4 }}>
            <span style={{ fontSize:7 }}>{icon}</span><span style={{ fontSize:6,color:'#94a3b8' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AgenceCreativePreview() {
  return (
    <div style={{ width:'100%',height:'100%',background:'#03010a',fontFamily:'system-ui,sans-serif',overflow:'hidden',position:'relative' }}>
      <div style={{ padding:'7px 12px',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
        <div style={{ display:'flex',alignItems:'center',gap:4 }}>
          <div style={{ width:14,height:14,borderRadius:3,background:'linear-gradient(135deg,#7c3aed,#ec4899)' }} />
          <span style={{ fontSize:8,fontWeight:800,color:'#fff' }}>APEX</span>
        </div>
        <div style={{ background:'linear-gradient(90deg,#7c3aed,#ec4899)',color:'#fff',fontSize:6.5,padding:'2px 8px',borderRadius:20,fontWeight:700 }}>Contact</div>
      </div>
      <div style={{ padding:'5px 12px' }}>
        <div style={{ fontSize:5.5,color:'#f9a8d4',letterSpacing:3,marginBottom:4 }}>CREATIVE STUDIO · PARIS</div>
        <div style={{ fontSize:18,fontWeight:900,color:'#fff',lineHeight:1.0,letterSpacing:-1,marginBottom:6 }}>We Build<br /><span style={{ background:'linear-gradient(90deg,#c084fc,#f472b6)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>Bold</span> Brands.</div>
        <div style={{ display:'flex',gap:4,flexWrap:'wrap' }}>
          {['Branding','Web','Motion','UI/UX'].map(s=>(
            <span key={s} style={{ fontSize:6,padding:'2px 6px',border:'1px solid rgba(244,114,182,0.25)',borderRadius:20,color:'#f472b6' }}>{s}</span>
          ))}
        </div>
      </div>
      <div style={{ padding:'5px 10px',display:'grid',gridTemplateColumns:'2fr 1fr',gap:4 }}>
        <div style={{ height:44,borderRadius:6,background:'linear-gradient(135deg,rgba(124,58,237,0.3),rgba(236,72,153,0.2))',border:'1px solid rgba(236,72,153,0.25)',display:'flex',alignItems:'flex-end',padding:'5px 6px' }}>
          <span style={{ fontSize:6,color:'#f9a8d4',fontWeight:700 }}>Campaign 2025</span>
        </div>
        <div style={{ display:'flex',flexDirection:'column',gap:4 }}>
          <div style={{ height:20,borderRadius:4,background:'rgba(236,72,153,0.15)',border:'1px solid rgba(236,72,153,0.15)' }} />
          <div style={{ height:20,borderRadius:4,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)' }} />
        </div>
      </div>
    </div>
  )
}

function PortfolioPhotoPreview() {
  return (
    <div style={{ width:'100%',height:'100%',background:'#f9f8f6',fontFamily:'system-ui,sans-serif',overflow:'hidden' }}>
      <div style={{ padding:'7px 12px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #e5e5e5' }}>
        <span style={{ fontSize:8,fontWeight:800,color:'#111',letterSpacing:1 }}>LÉNA MARTIN</span>
        <div style={{ display:'flex',gap:8,fontSize:6.5,color:'#737373' }}><span>Work</span><span>About</span><span>Contact</span></div>
      </div>
      <div style={{ padding:'10px 12px 6px',borderBottom:'1px solid #f0f0f0' }}>
        <div style={{ fontSize:5.5,color:'#a3a3a3',letterSpacing:3,marginBottom:3 }}>PHOTOGRAPHE · DIRECTRICE ARTISTIQUE</div>
        <div style={{ fontSize:15,fontWeight:900,color:'#111',lineHeight:1.1,letterSpacing:-0.5 }}>Capturer<br />l&apos;Instant</div>
      </div>
      <div style={{ padding:'8px 10px',display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:3 }}>
        {[{bg:'#1a1a2e',h:42},{bg:'#16213e',h:42},{bg:'#0f3460',h:42},{bg:'#533483',h:30},{bg:'#2c2c54',h:30},{bg:'#474787',h:30}].map((cell,i)=>(
          <div key={i} style={{ background:cell.bg,borderRadius:3,height:cell.h,opacity:0.85 }} />
        ))}
      </div>
    </div>
  )
}

function EcommerceBijouxPreview() {
  return (
    <div style={{ width:'100%',height:'100%',background:'#fdf8f3',fontFamily:'Georgia,serif',overflow:'hidden' }}>
      <div style={{ padding:'7px 12px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #e8d5c4' }}>
        <span style={{ fontSize:8,fontWeight:700,color:'#4a3728',letterSpacing:3 }}>AUREL</span>
        <div style={{ display:'flex',gap:8,fontSize:6,color:'#9c7d6a' }}><span>Collections</span><span>Savoir-faire</span><span>🛍</span></div>
      </div>
      <div style={{ height:20,background:'linear-gradient(90deg,#b87333,#d4a574,#c8935c)',display:'flex',alignItems:'center',justifyContent:'center' }}>
        <span style={{ fontSize:6,color:'#fff',letterSpacing:3,fontWeight:600 }}>✦ COLLECTION ÉTÉ 2025 ✦</span>
      </div>
      <div style={{ padding:'7px 12px 4px',textAlign:'center' }}>
        <div style={{ fontSize:5.5,color:'#b87333',letterSpacing:4,marginBottom:3 }}>HAUTE JOAILLERIE</div>
        <div style={{ fontSize:13,fontWeight:700,color:'#2d1f14',lineHeight:1.2,marginBottom:5 }}>L'Art de<br /><span style={{ color:'#b87333' }}>Briller</span></div>
      </div>
      <div style={{ padding:'0 10px',display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:4 }}>
        {[{bg:'linear-gradient(135deg,#f3e4d7,#e8cfc0)',price:'420€',name:'Bague Or'},{bg:'linear-gradient(135deg,#e8d5c4,#d4b99a)',price:'680€',name:'Collier'},{bg:'linear-gradient(135deg,#f5ebe0,#dfc9b6)',price:'290€',name:'Boucles'}].map(p=>(
          <div key={p.name} style={{ borderRadius:6,overflow:'hidden',border:'1px solid #e8d5c4' }}>
            <div style={{ height:42,background:p.bg }} />
            <div style={{ padding:'3px 5px',background:'#fffaf7' }}>
              <div style={{ fontSize:6.5,fontWeight:700,color:'#4a3728' }}>{p.name}</div>
              <div style={{ fontSize:6,color:'#b87333' }}>{p.price}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CabinetMedicalPreview() {
  return (
    <div style={{ width:'100%',height:'100%',background:'#fff',fontFamily:'system-ui,sans-serif',overflow:'hidden' }}>
      <div style={{ padding:'7px 12px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #e0f2fe',background:'#f0f9ff' }}>
        <div style={{ display:'flex',alignItems:'center',gap:4 }}>
          <div style={{ width:12,height:12,borderRadius:'50%',background:'#0284c7' }} />
          <span style={{ fontSize:8,fontWeight:800,color:'#0c4a6e' }}>MedCare+</span>
        </div>
        <div style={{ background:'#0284c7',color:'#fff',fontSize:6.5,padding:'2px 8px',borderRadius:20,fontWeight:700 }}>Prendre RDV</div>
      </div>
      <div style={{ padding:'8px 12px 5px',background:'linear-gradient(180deg,#f0f9ff 0%,#fff 100%)' }}>
        <div style={{ fontSize:5.5,color:'#0284c7',letterSpacing:3,marginBottom:3,fontWeight:700 }}>CABINET MÉDICAL · PARIS</div>
        <div style={{ fontSize:13,fontWeight:800,color:'#0c4a6e',lineHeight:1.2,marginBottom:5 }}>Votre santé,<br />notre priorité</div>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:3,marginBottom:5 }}>
          {[{label:'Lun',slots:3},{label:'Mar',slots:1},{label:'Mer',slots:5}].map(d=>(
            <div key={d.label} style={{ background:'#f0f9ff',border:'1px solid #bae6fd',borderRadius:5,padding:'4px',textAlign:'center' }}>
              <div style={{ fontSize:6,color:'#0284c7',fontWeight:700,marginBottom:2 }}>{d.label}</div>
              <div style={{ fontSize:8,fontWeight:800,color:'#0c4a6e' }}>{d.slots}</div>
              <div style={{ fontSize:5,color:'#7dd3fc' }}>créneaux</div>
            </div>
          ))}
        </div>
        <div style={{ display:'flex',gap:3 }}>
          {['Généraliste','Pédiatrie','Dermato'].map(s=>(
            <span key={s} style={{ fontSize:6,padding:'2px 5px',background:'#e0f2fe',color:'#0284c7',borderRadius:20,fontWeight:600 }}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

function StudioFitnessPreview() {
  return (
    <div style={{ width:'100%',height:'100%',background:'#02050a',fontFamily:'system-ui,sans-serif',overflow:'hidden',position:'relative' }}>
      <div style={{ position:'absolute',top:0,left:0,width:100,height:80,background:'radial-gradient(circle,rgba(57,255,20,0.18) 0%,transparent 70%)',filter:'blur(20px)' }} />
      <div style={{ padding:'7px 12px',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
        <span style={{ fontSize:8,fontWeight:900,color:'#fff',letterSpacing:2 }}>FORCE<span style={{ color:'#39ff14' }}>FIT</span></span>
        <div style={{ fontSize:6.5,padding:'2px 8px',background:'#39ff14',color:'#000',borderRadius:4,fontWeight:800 }}>REJOINDRE</div>
      </div>
      <div style={{ padding:'4px 12px 6px' }}>
        <div style={{ fontSize:5.5,color:'#39ff14',letterSpacing:4,marginBottom:4 }}>NUTRITION · FORCE · CARDIO</div>
        <div style={{ fontSize:16,fontWeight:900,color:'#fff',lineHeight:1.1,marginBottom:6 }}>Forge ton<br /><span style={{ color:'#39ff14' }}>Futur.</span></div>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:3,marginBottom:5 }}>
          {[['24/7','accès'],['50+','coachs'],['∞','séances']].map(([v,l])=>(
            <div key={l} style={{ textAlign:'center',padding:'3px',background:'rgba(57,255,20,0.05)',border:'1px solid rgba(57,255,20,0.15)',borderRadius:4 }}>
              <div style={{ fontSize:9,fontWeight:900,color:'#39ff14' }}>{v}</div>
              <div style={{ fontSize:5.5,color:'#2a4a20' }}>{l}</div>
            </div>
          ))}
        </div>
        <div>
          <div style={{ display:'flex',justifyContent:'space-between',fontSize:5.5,marginBottom:2 }}>
            <span style={{ color:'#444' }}>Objectif du mois</span>
            <span style={{ color:'#39ff14' }}>85%</span>
          </div>
          <div style={{ height:3,background:'#111',borderRadius:2,overflow:'hidden' }}>
            <div style={{ height:'100%',width:'85%',background:'linear-gradient(90deg,#39ff14,#7fff00)',borderRadius:2 }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function AgenceImmoPreview() {
  return (
    <div style={{ width:'100%',height:'100%',background:'#1a1a18',fontFamily:'system-ui,sans-serif',overflow:'hidden' }}>
      <div style={{ padding:'7px 12px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid rgba(210,185,155,0.2)' }}>
        <span style={{ fontSize:8,fontWeight:800,color:'#d2b99b',letterSpacing:2 }}>RÉSIDENCE+</span>
        <div style={{ background:'#d2b99b',color:'#1a1a18',fontSize:6.5,padding:'2px 8px',borderRadius:4,fontWeight:700 }}>Estimer</div>
      </div>
      <div style={{ padding:'8px 12px 5px' }}>
        <div style={{ fontSize:5.5,color:'#8c7a60',letterSpacing:2,marginBottom:3 }}>AGENCE IMMOBILIÈRE · PARIS</div>
        <div style={{ fontSize:13,fontWeight:900,color:'#e8ddd0',lineHeight:1.2,marginBottom:5 }}>Votre bien<br />idéal <span style={{ color:'#d2b99b' }}>ici.</span></div>
        <div style={{ display:'flex',alignItems:'center',gap:2,padding:'4px 8px',background:'rgba(210,185,155,0.08)',borderRadius:8,border:'1px solid rgba(210,185,155,0.2)',marginBottom:5 }}>
          <span style={{ fontSize:7,color:'#6b5c42',flex:1 }}>Paris, Lyon, Bordeaux...</span>
          <span style={{ fontSize:6,color:'#1a1a18',background:'#d2b99b',padding:'2px 6px',borderRadius:4,fontWeight:700 }}>Go</span>
        </div>
      </div>
      <div style={{ padding:'0 10px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:4 }}>
        {[{price:'320 000€',type:'Appt 3P',loc:'Paris 11e',tag:'Nouveau',tc:'#d2b99b'},{price:'485 000€',type:'Maison 4P',loc:'Lyon 6e',tag:'Coup ♥',tc:'#e11d48'}].map(p=>(
          <div key={p.type} style={{ background:'rgba(210,185,155,0.06)',borderRadius:6,overflow:'hidden',border:'1px solid rgba(210,185,155,0.15)' }}>
            <div style={{ height:32,background:'linear-gradient(135deg,#2e2e2a,#3a3a34)',position:'relative',display:'flex',alignItems:'flex-start',justifyContent:'flex-end',padding:3 }}>
              <span style={{ fontSize:6,background:p.tc,color:'#fff',padding:'1px 5px',borderRadius:20,fontWeight:700 }}>{p.tag}</span>
            </div>
            <div style={{ padding:'4px 6px' }}>
              <div style={{ fontSize:7,fontWeight:800,color:'#e8ddd0' }}>{p.price}</div>
              <div style={{ fontSize:5.5,color:'#8c7a60' }}>{p.type} · {p.loc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BlogVoyagesPreview() {
  return (
    <div style={{ width:'100%',height:'100%',background:'#0d0a07',fontFamily:'Georgia,serif',overflow:'hidden',position:'relative' }}>
      <div style={{ position:'absolute',bottom:'35%',right:'10%',width:90,height:45,background:'radial-gradient(ellipse,rgba(251,146,60,0.3) 0%,transparent 70%)',filter:'blur(14px)' }} />
      <div style={{ padding:'7px 12px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid rgba(251,146,60,0.15)',position:'relative' }}>
        <span style={{ fontSize:8,fontWeight:800,color:'#fb923c',fontStyle:'italic' }}>Wanderlust</span>
        <div style={{ display:'flex',gap:7,fontSize:6,color:'#6b4c2a' }}><span>Destinations</span><span>Blog</span><span>Guide</span></div>
      </div>
      <div style={{ padding:'8px 12px 4px',position:'relative' }}>
        <div style={{ fontSize:5.5,color:'#fb923c',letterSpacing:4,marginBottom:4,fontWeight:700 }}>BLOG VOYAGE · 48 DESTINATIONS</div>
        <div style={{ fontSize:14,fontWeight:900,color:'#f5e6d3',lineHeight:1.2,marginBottom:3 }}>Le monde<br /><span style={{ color:'#fb923c' }}>t&apos;attend.</span></div>
        <div style={{ fontSize:7,color:'#5a3c20',marginBottom:7,lineHeight:1.5 }}>Récits, conseils et carnets de voyage...</div>
      </div>
      <div style={{ padding:'0 10px',display:'flex',flexDirection:'column',gap:4 }}>
        {[{dest:'Kyoto, Japon',tag:'Asie',img:'linear-gradient(135deg,#854d0e,#431407)'},{dest:'Santorini, Grèce',tag:'Europe',img:'linear-gradient(135deg,#1e3a5f,#0f2342)'}].map(a=>(
          <div key={a.dest} style={{ display:'flex',gap:6,alignItems:'center',padding:'4px 6px',background:'rgba(251,146,60,0.04)',border:'1px solid rgba(251,146,60,0.1)',borderRadius:5 }}>
            <div style={{ width:28,height:22,borderRadius:3,background:a.img,flexShrink:0 }} />
            <div>
              <div style={{ fontSize:7,fontWeight:700,color:'#f5e6d3' }}>{a.dest}</div>
              <div style={{ fontSize:5.5,color:'#fb923c' }}>{a.tag}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SaasDashboardPreview() {
  return (
    <div style={{ width:'100%',height:'100%',background:'#0a0a1a',fontFamily:'system-ui,sans-serif',overflow:'hidden',position:'relative' }}>
      <div style={{ position:'absolute',top:0,right:0,width:70,height:70,background:'radial-gradient(circle,rgba(124,58,237,0.4) 0%,transparent 70%)',filter:'blur(14px)' }} />
      <div style={{ padding:'7px 12px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid rgba(124,58,237,0.2)' }}>
        <span style={{ fontSize:8,fontWeight:800,color:'#fff' }}>⬡ <span style={{ color:'#7c3aed' }}>NexAI</span></span>
        <div style={{ background:'linear-gradient(90deg,#7c3aed,#4f46e5)',color:'#fff',fontSize:6.5,padding:'2px 8px',borderRadius:20,fontWeight:700 }}>Essai gratuit</div>
      </div>
      <div style={{ padding:'8px 12px 4px',position:'relative' }}>
        <div style={{ fontSize:5.5,color:'#7c3aed',letterSpacing:3,marginBottom:4 }}>SAAS · DATA · AUTOMATISATION</div>
        <div style={{ fontSize:13,fontWeight:900,color:'#fff',lineHeight:1.1,marginBottom:4 }}>L&apos;IA qui<br /><span style={{ background:'linear-gradient(90deg,#7c3aed,#38bdf8)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>transforme</span><br />votre workflow</div>
      </div>
      <div style={{ padding:'0 10px 5px',display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:3 }}>
        {[['+340%','perf.'],['2.4M','users'],['99.9%','uptime']].map(([v,l])=>(
          <div key={l} style={{ background:'rgba(124,58,237,0.08)',border:'1px solid rgba(124,58,237,0.15)',borderRadius:4,padding:'4px',textAlign:'center' }}>
            <div style={{ fontSize:9,fontWeight:800,color:'#7c3aed' }}>{v}</div>
            <div style={{ fontSize:5.5,color:'#4b5563' }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ padding:'0 10px',display:'flex',flexDirection:'column',gap:3 }}>
        {['Analyse prédictive','Automatisation IA','Dashboard temps réel'].map((f,i)=>(
          <div key={f} style={{ display:'flex',alignItems:'center',gap:5,padding:'3px 6px',background:'rgba(255,255,255,0.02)',borderRadius:4,border:'1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ width:8,height:8,borderRadius:2,background:['#7c3aed','#4f46e5','#38bdf8'][i],opacity:0.8,flexShrink:0 }} />
            <span style={{ fontSize:6.5,color:'#94a3b8' }}>{f}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AvocatPreview() {
  return (
    <div style={{ width:'100%',height:'100%',background:'#fefefe',fontFamily:'Georgia,serif',overflow:'hidden' }}>
      <div style={{ padding:'7px 12px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'2px solid #6b1c28' }}>
        <div style={{ display:'flex',alignItems:'center',gap:5 }}>
          <div style={{ width:10,height:10,background:'#6b1c28' }} />
          <span style={{ fontSize:7.5,fontWeight:700,color:'#1a0a0d',letterSpacing:2 }}>MOREAU & ASSOCIÉS</span>
        </div>
        <div style={{ fontSize:6,color:'#9a8080' }}>Cabinet d&apos;Avocats</div>
      </div>
      <div style={{ padding:'9px 12px 5px',background:'linear-gradient(180deg,#fdf5f6 0%,#fefefe 100%)' }}>
        <div style={{ fontSize:5.5,color:'#6b1c28',letterSpacing:4,marginBottom:4,fontWeight:700 }}>DROIT DES AFFAIRES · PARIS</div>
        <div style={{ fontSize:13,fontWeight:700,color:'#1a0a0d',lineHeight:1.2,marginBottom:5 }}>Votre défense,<br />notre engagement.</div>
        <div style={{ display:'flex',gap:4,marginBottom:6 }}>
          <div style={{ fontSize:6.5,padding:'3px 8px',background:'#6b1c28',color:'#fff',borderRadius:3,fontWeight:700 }}>Consultation</div>
          <div style={{ fontSize:6.5,padding:'3px 8px',border:'1px solid #6b1c28',color:'#6b1c28',borderRadius:3 }}>En savoir plus</div>
        </div>
      </div>
      <div style={{ padding:'0 10px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:3 }}>
        {[['⚖️','Droit pénal'],['📋','Droit civil'],['💼','Droit fiscal'],['🤝','Droit social']].map(([icon,d])=>(
          <div key={d} style={{ display:'flex',alignItems:'center',gap:4,padding:'3px 6px',background:'#f8f4f5',border:'1px solid #e8d5d8',borderRadius:4 }}>
            <span style={{ fontSize:7 }}>{icon}</span>
            <span style={{ fontSize:6.5,color:'#4a2428',fontWeight:600 }}>{d}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function EcoleMusiquePreview() {
  return (
    <div style={{ width:'100%',height:'100%',background:'#050305',fontFamily:'Georgia,serif',overflow:'hidden',position:'relative' }}>
      <div style={{ position:'absolute',top:'20%',right:'15%',width:70,height:60,background:'radial-gradient(circle,rgba(212,175,55,0.2) 0%,transparent 70%)',filter:'blur(14px)' }} />
      <div style={{ padding:'7px 12px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid rgba(212,175,55,0.15)',position:'relative' }}>
        <span style={{ fontSize:7.5,fontWeight:700,color:'#d4af37',letterSpacing:3 }}>CONSERVATOIRE</span>
        <div style={{ display:'flex',gap:6,fontSize:6,color:'#5c4a1e' }}><span>Cours</span><span>Agenda</span><span>Inscrire</span></div>
      </div>
      <div style={{ padding:'8px 12px 5px',position:'relative' }}>
        <div style={{ fontSize:5.5,color:'#d4af37',letterSpacing:4,marginBottom:4 }}>ÉCOLE DE MUSIQUE · DEPUIS 1987</div>
        <div style={{ fontSize:14,fontWeight:700,color:'#f5edd0',lineHeight:1.1,marginBottom:5 }}>L&apos;Art de la<br /><span style={{ background:'linear-gradient(90deg,#b8960c,#d4af37,#f0d060)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>Musique</span></div>
      </div>
      <div style={{ padding:'0 10px',display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:3 }}>
        {[['🎹','Piano'],['🎸','Guitare'],['🎻','Violon'],['🥁','Batterie'],['🎷','Sax'],['🎺','Trompette']].map(([icon,name])=>(
          <div key={name} style={{ textAlign:'center',padding:'4px 2px',background:'rgba(212,175,55,0.05)',border:'1px solid rgba(212,175,55,0.12)',borderRadius:5 }}>
            <div style={{ fontSize:10 }}>{icon}</div>
            <div style={{ fontSize:5.5,color:'#8c7a42',marginTop:1 }}>{name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   DATA — 2 rows × 6 cards
   ───────────────────────────────────────────────────────────────── */

interface CarouselItem {
  key: string
  label: string
  category: string
  prompt: string
  Preview: React.ComponentType
}

const ROW1: CarouselItem[] = [
  { key:'gastro',  label:'Restaurant Gastronomique', category:'Restaurant', prompt:'Crée un site restaurant gastronomique élégant, fond noir avec accents dorés, police serif, avec menu, galerie et réservation en ligne', Preview:RestaurantGastroPreview },
  { key:'tech',    label:'Startup Tech IA',           category:'Tech',       prompt:'Crée un site startup tech IA, fond très sombre #020409, accents cyan #38bdf8, grille animée, hero futuriste avec stats et CTA', Preview:StartupTechPreview },
  { key:'agence',  label:'Agence Créative',           category:'Créatif',    prompt:'Crée un site agence créative bold, fond très sombre, dégradé violet/rose, typographie massive, showcase projets et contact', Preview:AgenceCreativePreview },
  { key:'photo',   label:'Portfolio Photographe',     category:'Portfolio',  prompt:'Crée un portfolio photographe minimaliste, fond blanc cassé, typographie épurée, grande galerie pleine page', Preview:PortfolioPhotoPreview },
  { key:'bijoux',  label:'E-commerce Bijoux',         category:'E-commerce', prompt:'Crée un site e-commerce de bijoux luxueux, fond crème, accents or rose, haute joaillerie, grille produits et lookbook', Preview:EcommerceBijouxPreview },
  { key:'medical', label:'Cabinet Médical',           category:'Santé',      prompt:'Crée un site cabinet médical professionnel, fond blanc, accents bleu médical, prise de RDV, spécialités et équipe', Preview:CabinetMedicalPreview },
]

const ROW2: CarouselItem[] = [
  { key:'fitness', label:'Studio Fitness',     category:'Fitness',    prompt:'Crée un site studio fitness, fond noir, accents vert néon, compteurs animés, planning cours et abonnements', Preview:StudioFitnessPreview },
  { key:'immo',    label:'Agence Immobilière', category:'Immobilier', prompt:'Crée un site agence immobilière moderne, fond gris foncé, accents beige doré, recherche de biens et estimateur', Preview:AgenceImmoPreview },
  { key:'voyage',  label:'Blog Voyages',       category:'Blog',       prompt:'Crée un blog voyages inspirant, fond sombre, accents orange coucher de soleil, articles destinations et newsletter', Preview:BlogVoyagesPreview },
  { key:'saas',    label:'SaaS Dashboard',     category:'SaaS',       prompt:'Crée un site SaaS sombre #0a0a1a, accents violet, hero avec stats animées, features, pricing et témoignages', Preview:SaasDashboardPreview },
  { key:'avocat',  label:'Cabinet Juridique',  category:'Juridique',  prompt:'Crée un site cabinet d\'avocats sobre, fond blanc, accents bordeaux, domaines d\'expertise, équipe et contact', Preview:AvocatPreview },
  { key:'musique', label:'École de Musique',   category:'Musique',    prompt:'Crée un site école de musique élégant, fond noir, accents or, liste instruments, planning et inscription', Preview:EcoleMusiquePreview },
]

/* ─────────────────────────────────────────────────────────────────
   MODAL
   ───────────────────────────────────────────────────────────────── */

function CarouselModal({ item, onClose, onSelect }: { item: CarouselItem; onClose: () => void; onSelect: (p: string) => void }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(3)
  const Preview = item.Preview

  useEffect(() => {
    const update = () => {
      if (!wrapRef.current) return
      setScale(Math.min(wrapRef.current.clientWidth / 280, 3.5))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-md" style={{ background:'rgba(2,2,15,0.85)' }} onClick={onClose} />
      <div
        className="relative z-10 w-full rounded-2xl overflow-hidden"
        style={{ maxWidth:'min(80vw, 840px)', background:'#0a0a1e', border:'1px solid rgba(124,58,237,0.25)', boxShadow:'0 0 80px rgba(124,58,237,0.15)' }}
      >
        <button onClick={onClose} className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors" aria-label="Fermer">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        {/* Scaled preview */}
        <div ref={wrapRef} style={{ width:'100%', overflow:'hidden', height: Math.round(215 * scale), background:'#050510' }}>
          <div style={{ width:280, height:215, transformOrigin:'top left', transform:`scale(${scale})` }}>
            <Preview />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding:'16px 22px', borderTop:'1px solid rgba(124,58,237,0.15)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
              <h3 style={{ fontSize:15, fontWeight:800, color:'#e2e8f0', margin:0 }}>{item.label}</h3>
              <span style={{ fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:20, background:'rgba(124,58,237,0.2)', color:'#c4b5fd', border:'1px solid rgba(124,58,237,0.3)' }}>{item.category}</span>
            </div>
            <p style={{ fontSize:12, color:'#64748b', margin:0 }}>Généré par Claude AI · moins de 30 secondes</p>
          </div>
          <button
            onClick={() => { onSelect(item.prompt); onClose() }}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'11px 20px', borderRadius:10, background:'linear-gradient(135deg,#6d28d9,#4338ca)', color:'#fff', fontSize:13, fontWeight:700, border:'none', cursor:'pointer', boxShadow:'0 4px 20px rgba(109,40,217,0.4)', flexShrink:0 }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 28px rgba(109,40,217,0.65)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(109,40,217,0.4)')}
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
            </svg>
            Créer un site similaire
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   CARD — margin-right instead of gap (critical for loop math)
   Card = 280px + 16px margin = 296px
   6 cards × 296 = 1776px = exactly 50% of doubled track (3552px)
   → translate(-50%) lands perfectly, zero jump
   ───────────────────────────────────────────────────────────────── */

const CARD_W = 280
const CARD_H = 215
const CARD_MARGIN = 16

function CarouselCard({ item, onClick }: { item: CarouselItem; onClick: (item: CarouselItem) => void }) {
  const Preview = item.Preview
  return (
    <button
      onClick={() => onClick(item)}
      style={{
        flexShrink: 0,
        width: CARD_W,
        height: CARD_H,
        marginRight: CARD_MARGIN,
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid rgba(30,27,75,0.8)',
        position: 'relative',
        cursor: 'pointer',
        transition: 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease',
        background: '#050510',
        padding: 0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.35)'
        e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.borderColor = 'rgba(30,27,75,0.8)'
      }}
      aria-label={`Voir ${item.label}`}
    >
      <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
        <Preview />
      </div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'20px 10px 8px', background:'linear-gradient(0deg,rgba(4,4,15,0.96) 0%,rgba(4,4,15,0.6) 55%,transparent 100%)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:10, fontWeight:700, color:'#e2e8f0' }}>{item.label}</span>
        <span style={{ fontSize:9, fontWeight:600, padding:'2px 7px', borderRadius:20, background:'rgba(124,58,237,0.3)', color:'#c4b5fd', border:'1px solid rgba(124,58,237,0.3)' }}>{item.category}</span>
      </div>
    </button>
  )
}

/* ─────────────────────────────────────────────────────────────────
   DOUBLE-ROW CAROUSEL
   ───────────────────────────────────────────────────────────────── */

function TemplateCarousel({ onSelect }: { onSelect: (p: string) => void }) {
  const [modal, setModal] = useState<CarouselItem | null>(null)

  const row1 = [...ROW1, ...ROW1]
  const row2 = [...ROW2, ...ROW2]

  return (
    <div className="carousel-wrapper">
      {/* Row 1 — left */}
      <div style={{ overflow:'hidden', position:'relative', marginBottom:14 }}>
        <div style={{ position:'absolute', left:0, top:0, bottom:0, width:100, background:'linear-gradient(90deg,#04040f,transparent)', zIndex:10, pointerEvents:'none' }} />
        <div style={{ position:'absolute', right:0, top:0, bottom:0, width:100, background:'linear-gradient(-90deg,#04040f,transparent)', zIndex:10, pointerEvents:'none' }} />
        <div className="carousel-track">
          {row1.map((item, i) => <CarouselCard key={`r1-${item.key}-${i}`} item={item} onClick={setModal} />)}
        </div>
      </div>

      {/* Row 2 — right */}
      <div style={{ overflow:'hidden', position:'relative' }}>
        <div style={{ position:'absolute', left:0, top:0, bottom:0, width:100, background:'linear-gradient(90deg,#04040f,transparent)', zIndex:10, pointerEvents:'none' }} />
        <div style={{ position:'absolute', right:0, top:0, bottom:0, width:100, background:'linear-gradient(-90deg,#04040f,transparent)', zIndex:10, pointerEvents:'none' }} />
        <div className="carousel-track-reverse">
          {row2.map((item, i) => <CarouselCard key={`r2-${item.key}-${i}`} item={item} onClick={setModal} />)}
        </div>
      </div>

      {modal && <CarouselModal item={modal} onClose={() => setModal(null)} onSelect={onSelect} />}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   EXPORT
   ───────────────────────────────────────────────────────────────── */

interface Props {
  onSelect: (prompt: string) => void
}

export default function TemplatesSection({ onSelect }: Props) {
  return (
    <section id="templates" className="py-20 overflow-hidden" style={{ background:'#04040f' }}>
      <div className="text-center mb-10 px-6">
        <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color:'#e2e8f0' }}>
          Des sites qui impressionnent
        </h2>
        <p className="text-sm md:text-base" style={{ color:'#64748b' }}>
          CreateIt génère des sites professionnels dans tous les styles —{' '}
          <span style={{ color:'#7c3aed' }}>cliquez pour en créer un similaire</span>
        </p>
      </div>
      <TemplateCarousel onSelect={onSelect} />
    </section>
  )
}
