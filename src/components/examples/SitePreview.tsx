'use client'

/* eslint-disable @next/next/no-img-element */
import { useRef, useEffect, useState } from 'react'
import type { Example } from '@/data/examples'

const W = 1024
const H = 680

/* ─────────────────────────────────────────────────────────────────
   1. Restaurant gastronomique
   Style : luxe sombre, typo serif, dorure, centré
───────────────────────────────────────────────────────────────── */
function RestaurantGastro({ ex }: { ex: Example }) {
  return (
    <div style={{ width: W, height: H, position: 'relative', overflow: 'hidden', fontFamily: "Georgia,'Times New Roman',serif" }}>
      <img src={ex.img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg,rgba(6,4,2,.72) 0%,rgba(6,4,2,.48) 50%,rgba(6,4,2,.78) 100%)' }} />
      {/* nav */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 52px', borderBottom: '1px solid rgba(198,155,60,.28)' }}>
        <span style={{ fontSize: 12, letterSpacing: '.32em', textTransform: 'uppercase', color: '#C69B3C', fontWeight: 400 }}>Le Grand Véfour</span>
        <div style={{ display: 'flex', gap: 32 }}>
          {['Menu', 'Réservations', 'Galerie', 'Notre histoire'].map(l => (
            <span key={l} style={{ fontSize: 11, color: 'rgba(255,255,255,.55)', letterSpacing: '.12em', textTransform: 'uppercase' }}>{l}</span>
          ))}
        </div>
        <div style={{ border: '1px solid rgba(198,155,60,.65)', color: '#C69B3C', padding: '8px 22px', fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase' }}>Réserver</div>
      </div>
      {/* centre */}
      <div style={{ position: 'absolute', inset: '0 100px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 18 }}>
        <div style={{ fontSize: 10, letterSpacing: '.38em', textTransform: 'uppercase', color: '#C69B3C' }}>Gastronomie française · Paris 6e</div>
        <div style={{ fontSize: 46, fontWeight: 400, color: '#fff', lineHeight: 1.12 }}>Une expérience culinaire<br />d'exception</div>
        <div style={{ width: 56, height: 1, background: '#C69B3C' }} />
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', letterSpacing: '.07em' }}>Menu dégustation — Cave à vins — Privatisation</div>
        <div style={{ marginTop: 10, border: '1px solid #C69B3C', color: '#C69B3C', padding: '13px 38px', fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase' }}>Réserver une table</div>
      </div>
      {/* bas */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 60, padding: '16px 52px', borderTop: '1px solid rgba(198,155,60,.22)', background: 'rgba(6,4,2,.55)' }}>
        {[['Ouvert', 'Mar – Dim'], ['Service', '12h – 22h30'], ['Récompense', 'Étoile 2024']].map(([k, v]) => (
          <div key={k} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 8, letterSpacing: '.22em', textTransform: 'uppercase', color: '#C69B3C', marginBottom: 5 }}>{k}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.82)', fontWeight: 400 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   2. Pizzeria napolitaine
   Style : panneau gauche sombre/rouge, photo plein droite, bold
───────────────────────────────────────────────────────────────── */
function Pizzeria({ ex }: { ex: Example }) {
  return (
    <div style={{ width: W, height: H, display: 'flex', overflow: 'hidden', fontFamily: "system-ui,-apple-system,sans-serif" }}>
      <div style={{ width: 390, flexShrink: 0, background: '#14070A', display: 'flex', flexDirection: 'column', padding: '38px 44px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'auto' }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: '#B91C1C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fff' }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '-.02em' }}>Napoli Vera</span>
        </div>
        <div style={{ marginTop: 56 }}>
          <div style={{ fontSize: 10, color: '#B91C1C', fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 14 }}>Pizzeria napolitaine — STG certifiée</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#fff', lineHeight: 1.06, marginBottom: 18 }}>La vraie pizza<br />depuis 1987</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', lineHeight: 1.72, marginBottom: 32 }}>Pâte fermentée 48h, four à bois 450°C, tomates San Marzano DOP importées directement de Naples.</div>
          <div style={{ background: '#B91C1C', color: '#fff', padding: '14px 28px', fontSize: 13, fontWeight: 700, display: 'inline-block', borderRadius: 6, marginBottom: 40 }}>Commander en ligne</div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: 24, display: 'flex', gap: 32 }}>
            {[['–30 min', 'Livraison'], ['4.9 / 5', 'Google']].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#B91C1C', letterSpacing: '-.02em' }}>{n}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: '.12em', marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', gap: 22 }}>
          {['Menu', 'Livraison', 'Contact'].map(l => (
            <span key={l} style={{ fontSize: 11, color: 'rgba(255,255,255,.28)', fontWeight: 500 }}>{l}</span>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        <img src={ex.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right,rgba(20,7,10,.45) 0%,transparent 35%)' }} />
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   3. Cabinet d'architecte
   Style : Swiss minimal, photo dominante, texte blanc ancré en bas
───────────────────────────────────────────────────────────────── */
function Architecte({ ex }: { ex: Example }) {
  return (
    <div style={{ width: W, height: H, position: 'relative', overflow: 'hidden', fontFamily: "system-ui,-apple-system,sans-serif" }}>
      <img src={ex.img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(12,12,12,.38)' }} />
      {/* nav minimal */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 52px' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '.05em' }}>ATELIER MOREAU</span>
        <div style={{ display: 'flex', gap: 36 }}>
          {['Projets', 'Services', 'Équipe', 'Contact'].map(l => (
            <span key={l} style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', fontWeight: 400 }}>{l}</span>
          ))}
        </div>
      </div>
      {/* bas gauche */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px 52px', background: 'linear-gradient(to top,rgba(12,12,12,.78) 0%,transparent 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 10 }}>Architecture & design d'intérieur · Paris</div>
            <div style={{ fontSize: 40, fontWeight: 300, color: '#fff', lineHeight: 1.1, letterSpacing: '-.02em' }}>Concevoir des espaces<br />qui racontent votre histoire.</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            {[['85+', 'Projets livrés'], ['14', 'Ans d\'expérience'], ['3', 'Prix d\'architecture']].map(([n, l]) => (
              <div key={l} style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginRight: 8 }}>{n}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 24, display: 'flex', gap: 16 }}>
          <div style={{ background: '#fff', color: '#111', padding: '12px 28px', fontSize: 13, fontWeight: 700, borderRadius: 4 }}>Voir les réalisations</div>
          <div style={{ border: '1px solid rgba(255,255,255,.5)', color: '#fff', padding: '12px 28px', fontSize: 13, fontWeight: 400, borderRadius: 4 }}>Prendre contact</div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   4. Agence digitale
   Style : overlay gradient violet-bleu, centré, modern agency
───────────────────────────────────────────────────────────────── */
function AgenceDigitale({ ex }: { ex: Example }) {
  return (
    <div style={{ width: W, height: H, position: 'relative', overflow: 'hidden', fontFamily: "system-ui,-apple-system,sans-serif" }}>
      <img src={ex.img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(76,29,149,.88) 0%,rgba(30,64,175,.82) 100%)' }} />
      {/* nav */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 52px' }}>
        <span style={{ fontSize: 17, fontWeight: 900, color: '#fff', letterSpacing: '-.03em' }}>Shift<span style={{ color: '#A78BFA' }}>Lab</span></span>
        <div style={{ display: 'flex', gap: 32 }}>
          {['Services', 'Réalisations', 'Équipe', 'Contact'].map(l => (
            <span key={l} style={{ fontSize: 13, color: 'rgba(255,255,255,.65)', fontWeight: 500 }}>{l}</span>
          ))}
        </div>
        <div style={{ background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.3)', color: '#fff', padding: '9px 22px', fontSize: 12, fontWeight: 700, borderRadius: 8 }}>Obtenir un devis</div>
      </div>
      {/* centre */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 20 }}>
        <div style={{ background: 'rgba(167,139,250,.2)', border: '1px solid rgba(167,139,250,.5)', color: '#DDD6FE', padding: '6px 18px', fontSize: 11, fontWeight: 700, borderRadius: 100, letterSpacing: '.1em', textTransform: 'uppercase' }}>Agence digitale full-service</div>
        <div style={{ fontSize: 52, fontWeight: 900, color: '#fff', lineHeight: 1.05, letterSpacing: '-.03em', maxWidth: 680 }}>Votre croissance<br />digitale commence ici</div>
        <div style={{ fontSize: 16, color: 'rgba(255,255,255,.65)', maxWidth: 480 }}>Stratégie, design, développement et performance — une seule équipe, un seul interlocuteur.</div>
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <div style={{ background: '#fff', color: '#1e1b4b', padding: '14px 32px', fontSize: 14, fontWeight: 700, borderRadius: 10 }}>Obtenir un devis gratuit</div>
          <div style={{ border: '1px solid rgba(255,255,255,.35)', color: '#fff', padding: '14px 32px', fontSize: 14, fontWeight: 500, borderRadius: 10 }}>Voir les réalisations</div>
        </div>
      </div>
      {/* bas */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 56, padding: '16px', borderTop: '1px solid rgba(255,255,255,.12)', background: 'rgba(0,0,0,.25)' }}>
        {[['12 experts', 'En interne'], ['150+ clients', 'Accompagnés'], ['9 ans', 'D\'expérience']].map(([n, l]) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{n}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.45)', letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 3 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   5. Startup tech / SaaS
   Style : photo gauche, panneau sombre droite avec dashboard feel
───────────────────────────────────────────────────────────────── */
function StartupTech({ ex }: { ex: Example }) {
  return (
    <div style={{ width: W, height: H, display: 'flex', overflow: 'hidden', fontFamily: "system-ui,-apple-system,sans-serif" }}>
      {/* gauche photo */}
      <div style={{ flex: 1, position: 'relative' }}>
        <img src={ex.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left,rgba(10,12,18,.5) 0%,transparent 50%)' }} />
      </div>
      {/* droite panneau */}
      <div style={{ width: 420, flexShrink: 0, background: '#0A0C12', display: 'flex', flexDirection: 'column', padding: '36px 44px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'auto' }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-.03em' }}>Pulse<span style={{ color: '#22D3EE' }}>HQ</span></span>
          <span style={{ fontSize: 11, color: '#22D3EE', background: 'rgba(34,211,238,.1)', border: '1px solid rgba(34,211,238,.3)', padding: '4px 10px', borderRadius: 100 }}>Gratuit 14 jours</span>
        </div>
        <div style={{ marginTop: 48 }}>
          <div style={{ fontSize: 10, color: '#22D3EE', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 14, fontWeight: 600 }}>Plateforme SaaS</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#fff', lineHeight: 1.06, letterSpacing: '-.02em', marginBottom: 18 }}>Gérez vos projets<br />10× plus vite</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', lineHeight: 1.72, marginBottom: 32 }}>Automatisation, collaboration en temps réel, analytics intégrés. Tout ce dont votre équipe a besoin.</div>
          {/* mini metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
            {[['5 000+', 'Équipes actives'], ['99.9%', 'Disponibilité'], ['–60%', 'Temps de réunion'], ['4.8 / 5', 'Satisfaction']].map(([n, l]) => (
              <div key={l} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#22D3EE', letterSpacing: '-.02em' }}>{n}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#22D3EE', color: '#0A0C12', padding: '14px', fontSize: 14, fontWeight: 800, borderRadius: 10, textAlign: 'center' }}>Commencer gratuitement</div>
        </div>
        <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,.06)', display: 'flex', gap: 20 }}>
          {['Fonctionnalités', 'Tarifs', 'Documentation'].map(l => (
            <span key={l} style={{ fontSize: 11, color: 'rgba(255,255,255,.25)' }}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   6. Boutique artisanale
   Style : tons chauds, serif, centré éditorial
───────────────────────────────────────────────────────────────── */
function BoutiqueArtisanale({ ex }: { ex: Example }) {
  return (
    <div style={{ width: W, height: H, position: 'relative', overflow: 'hidden', fontFamily: "Georgia,'Times New Roman',serif" }}>
      <img src={ex.img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(62,32,16,.55) 0%,rgba(62,32,16,.65) 100%)' }} />
      {/* nav */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 52px' }}>
        <span style={{ fontSize: 14, fontWeight: 400, color: '#F5DEB3', letterSpacing: '.12em', textTransform: 'uppercase' }}>Maison Céleste</span>
        <div style={{ display: 'flex', gap: 32 }}>
          {['Boutique', 'Collections', 'Atelier', 'Contact'].map(l => (
            <span key={l} style={{ fontSize: 12, color: 'rgba(245,222,179,.6)', fontWeight: 400 }}>{l}</span>
          ))}
        </div>
        <span style={{ fontSize: 12, color: '#F5DEB3', fontWeight: 400 }}>Mon panier (0)</span>
      </div>
      {/* centre */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 20 }}>
        <div style={{ fontSize: 10, letterSpacing: '.32em', textTransform: 'uppercase', color: 'rgba(245,222,179,.6)' }}>Artisanat français · Fait à la main</div>
        <div style={{ fontSize: 44, fontWeight: 400, color: '#F5DEB3', lineHeight: 1.15, maxWidth: 560 }}>L'artisanat français,<br />pièce par pièce.</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 40, height: 1, background: 'rgba(245,222,179,.4)' }} />
          <span style={{ fontSize: 13, color: 'rgba(245,222,179,.55)', fontStyle: 'italic' }}>Créations uniques, matières naturelles</span>
          <div style={{ width: 40, height: 1, background: 'rgba(245,222,179,.4)' }} />
        </div>
        <div style={{ marginTop: 8, background: '#F5DEB3', color: '#3E2010', padding: '14px 38px', fontSize: 13, fontWeight: 700, borderRadius: 4, letterSpacing: '.04em' }}>Découvrir la collection</div>
      </div>
      {/* bas */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 48, padding: '20px 52px', background: 'rgba(38,18,6,.55)', borderTop: '1px solid rgba(245,222,179,.15)' }}>
        {['Livraison offerte dès 60€', 'Fait main en France', 'Retours 30 jours'].map(t => (
          <span key={t} style={{ fontSize: 12, color: 'rgba(245,222,179,.6)', fontStyle: 'italic' }}>{t}</span>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   7. Boutique bijoux
   Style : ultra luxe, noir presque total, or, minimalisme extrême
───────────────────────────────────────────────────────────────── */
function Bijoux({ ex }: { ex: Example }) {
  return (
    <div style={{ width: W, height: H, position: 'relative', overflow: 'hidden', fontFamily: "Georgia,'Times New Roman',serif" }}>
      <img src={ex.img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,3,1,.86)' }} />
      {/* nav */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 60px' }}>
        <span style={{ fontSize: 11, letterSpacing: '.42em', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', fontWeight: 400 }}>Collections</span>
        <span style={{ fontSize: 14, letterSpacing: '.3em', textTransform: 'uppercase', color: '#BFA060', fontWeight: 400 }}>Auréa</span>
        <span style={{ fontSize: 11, letterSpacing: '.42em', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', fontWeight: 400 }}>Atelier</span>
      </div>
      {/* centre */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22 }}>
        <div style={{ fontSize: 9, letterSpacing: '.55em', textTransform: 'uppercase', color: 'rgba(191,160,96,.6)' }}>Joaillerie artisanale · Paris</div>
        <div style={{ fontSize: 40, fontWeight: 400, color: '#fff', letterSpacing: '.06em', textAlign: 'center', lineHeight: 1.3 }}>Bijoux créés pour<br />traverser les générations</div>
        <div style={{ width: 1, height: 36, background: 'rgba(191,160,96,.4)' }} />
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', letterSpacing: '.25em', textTransform: 'uppercase' }}>Or 18 carats · Pierres naturelles · Sur mesure</div>
        <div style={{ marginTop: 12, border: '1px solid rgba(191,160,96,.5)', color: '#BFA060', padding: '12px 40px', fontSize: 10, letterSpacing: '.28em', textTransform: 'uppercase' }}>Explorer la collection</div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   8. Portfolio photographe
   Style : photo domine tout, bande sombre en bas seulement
───────────────────────────────────────────────────────────────── */
function Photographe({ ex }: { ex: Example }) {
  return (
    <div style={{ width: W, height: H, position: 'relative', overflow: 'hidden', fontFamily: "system-ui,-apple-system,sans-serif" }}>
      <img src={ex.img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.15)' }} />
      {/* nav */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 52px' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '.02em' }}>Lucas Revel — Photographe</span>
        <div style={{ display: 'flex', gap: 28 }}>
          {['Portfolio', 'Mariages', 'Tarifs', 'Contact'].map(l => (
            <span key={l} style={{ fontSize: 12, color: 'rgba(255,255,255,.75)', fontWeight: 400 }}>{l}</span>
          ))}
        </div>
      </div>
      {/* bande bas */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(10,10,10,.88)', padding: '28px 52px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 8 }}>Photographe de mariage & portrait · Paris</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: '-.02em' }}>Capturer l'instant parfait</div>
          </div>
          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-end' }}>
            {[['300+', 'Mariages'], ['10 ans', 'D\'expérience']].map(([n, l]) => (
              <div key={l} style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{n}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.38)', textTransform: 'uppercase', letterSpacing: '.12em' }}>{l}</div>
              </div>
            ))}
            <div style={{ background: '#fff', color: '#111', padding: '12px 24px', fontSize: 13, fontWeight: 700, borderRadius: 6, marginLeft: 8 }}>Voir le portfolio</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   9. Portfolio designer UX
   Style : panneau gauche créatif, grand numéro, gras asymétrique
───────────────────────────────────────────────────────────────── */
function Designer({ ex }: { ex: Example }) {
  return (
    <div style={{ width: W, height: H, display: 'flex', overflow: 'hidden', fontFamily: "system-ui,-apple-system,sans-serif" }}>
      {/* gauche */}
      <div style={{ width: 420, flexShrink: 0, background: '#0D0D0D', display: 'flex', flexDirection: 'column', padding: '36px 48px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -20, right: -30, fontSize: 160, fontWeight: 900, color: 'rgba(255,255,255,.03)', lineHeight: 1, userSelect: 'none' }}>UX</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Sophie Marceau</span>
          <span style={{ fontSize: 10, color: '#A78BFA', letterSpacing: '.15em', textTransform: 'uppercase' }}>Disponible</span>
        </div>
        <div style={{ marginTop: 'auto' }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 18 }}>Product designer · UX Research</div>
          <div style={{ fontSize: 38, fontWeight: 900, color: '#fff', lineHeight: 1.05, letterSpacing: '-.02em', marginBottom: 22 }}>Design centré<br />sur l'humain,<br /><span style={{ color: '#A78BFA' }}>résultats réels.</span></div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', lineHeight: 1.7, marginBottom: 32 }}>6 ans d'expérience, 1M+ d'utilisateurs touchés. Wireframes, prototypes, design systems.</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ background: '#A78BFA', color: '#1a0050', padding: '12px 22px', fontSize: 13, fontWeight: 700, borderRadius: 8 }}>Voir mes projets</div>
            <div style={{ border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.5)', padding: '12px 22px', fontSize: 13, borderRadius: 8 }}>Contact</div>
          </div>
        </div>
        <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,.06)', fontSize: 11, color: 'rgba(255,255,255,.2)' }}>
          Figma · React · Framer · Notion
        </div>
      </div>
      {/* droite photo */}
      <div style={{ flex: 1, position: 'relative' }}>
        <img src={ex.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right,rgba(13,13,13,.35) 0%,transparent 30%)' }} />
        {/* badge flottant */}
        <div style={{ position: 'absolute', top: 32, right: 32, background: 'rgba(13,13,13,.85)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, padding: '16px 20px', backdropFilter: 'blur(8px)' }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 6 }}>Dernier projet</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Refonte app mobile</div>
          <div style={{ fontSize: 11, color: '#A78BFA', marginTop: 3 }}>+32% de conversion</div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   10. Cabinet médical
   Style : overlay bleu clinique, nav propre, info structurée
───────────────────────────────────────────────────────────────── */
function CabinetMedical({ ex }: { ex: Example }) {
  return (
    <div style={{ width: W, height: H, position: 'relative', overflow: 'hidden', fontFamily: "system-ui,-apple-system,sans-serif" }}>
      <img src={ex.img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(3,53,100,.82) 0%,rgba(3,53,100,.68) 60%,rgba(3,53,100,.88) 100%)' }} />
      {/* nav */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 52px', borderBottom: '1px solid rgba(255,255,255,.12)' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Dr. Claire Fontaine</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 2 }}>Médecine générale · Paris 9e</div>
        </div>
        <div style={{ display: 'flex', gap: 28 }}>
          {['Spécialités', 'L\'équipe', 'Accès'].map(l => (
            <span key={l} style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', fontWeight: 400 }}>{l}</span>
          ))}
        </div>
        <div style={{ background: '#fff', color: '#033564', padding: '10px 22px', fontSize: 13, fontWeight: 700, borderRadius: 8 }}>Prendre rendez-vous</div>
      </div>
      {/* centre */}
      <div style={{ position: 'absolute', inset: '80px 52px 120px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', letterSpacing: '.18em', textTransform: 'uppercase' }}>Votre santé, notre priorité</div>
        <div style={{ fontSize: 44, fontWeight: 700, color: '#fff', lineHeight: 1.1, maxWidth: 560 }}>Un suivi médical<br />de proximité et de confiance</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,.6)', maxWidth: 500, lineHeight: 1.65 }}>Consultations en cabinet, téléconsultation disponible. Prises en charge Carte Vitale.</div>
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <div style={{ background: '#fff', color: '#033564', padding: '13px 28px', fontSize: 14, fontWeight: 700, borderRadius: 8 }}>Prendre rendez-vous</div>
          <div style={{ border: '1px solid rgba(255,255,255,.3)', color: '#fff', padding: '13px 28px', fontSize: 14, borderRadius: 8 }}>Téléconsultation</div>
        </div>
      </div>
      {/* bas */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', gap: 0, borderTop: '1px solid rgba(255,255,255,.12)' }}>
        {[['Consultation', 'Lun – Sam, 9h – 18h'], ['Urgences', 'Créneaux du jour disponibles'], ['Téléconsultation', 'Disponible sous 2h']].map(([t, d], i) => (
          <div key={t} style={{ flex: 1, padding: '16px 24px', borderRight: i < 2 ? '1px solid rgba(255,255,255,.1)' : 'none', background: 'rgba(3,53,100,.6)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{t}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)' }}>{d}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   11. Coach sportif
   Style : énergie, overlay sombre haut/bas, bande verte, bold
───────────────────────────────────────────────────────────────── */
function CoachSportif({ ex }: { ex: Example }) {
  return (
    <div style={{ width: W, height: H, position: 'relative', overflow: 'hidden', fontFamily: "system-ui,-apple-system,sans-serif" }}>
      <img src={ex.img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(5,5,5,.7) 0%,rgba(5,5,5,.25) 45%,rgba(5,5,5,.8) 100%)' }} />
      {/* bande verte top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: '#16A34A' }} />
      {/* nav */}
      <div style={{ position: 'absolute', top: 4, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 52px' }}>
        <span style={{ fontSize: 16, fontWeight: 900, color: '#fff', letterSpacing: '-.03em' }}>MAX<span style={{ color: '#16A34A' }}>FIT</span></span>
        <div style={{ display: 'flex', gap: 28 }}>
          {['Programmes', 'Tarifs', 'Témoignages', 'Contact'].map(l => (
            <span key={l} style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', fontWeight: 500 }}>{l}</span>
          ))}
        </div>
        <div style={{ background: '#16A34A', color: '#fff', padding: '10px 22px', fontSize: 13, fontWeight: 700, borderRadius: 8 }}>Commencer maintenant</div>
      </div>
      {/* bas gauche */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px 52px', background: 'linear-gradient(to top,rgba(5,5,5,.92) 0%,transparent 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: '#16A34A', letterSpacing: '.18em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>Coach certifié · En ligne & présentiel</div>
            <div style={{ fontSize: 44, fontWeight: 900, color: '#fff', lineHeight: 1.0, letterSpacing: '-.03em', marginBottom: 18 }}>Atteignez vos objectifs.<br />Pour de bon.</div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ background: '#16A34A', color: '#fff', padding: '13px 28px', fontSize: 14, fontWeight: 700, borderRadius: 8 }}>Commencer maintenant</div>
              <div style={{ border: '1px solid rgba(255,255,255,.3)', color: '#fff', padding: '13px 28px', fontSize: 14, borderRadius: 8 }}>Voir les programmes</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 28, flexShrink: 0, paddingLeft: 32 }}>
            {[['300+', 'Clients coachés'], ['8 ans', 'D\'expérience'], ['4.9/5', 'Avis clients']].map(([n, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#16A34A', letterSpacing: '-.02em' }}>{n}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.1em', marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   12. Blog voyage
   Style : éditorial magazine, photo top, bande sombre bas
───────────────────────────────────────────────────────────────── */
function BlogVoyage({ ex }: { ex: Example }) {
  return (
    <div style={{ width: W, height: H, display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: "Georgia,'Times New Roman',serif" }}>
      {/* photo top */}
      <div style={{ flex: 1, position: 'relative' }}>
        <img src={ex.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.22)' }} />
        {/* nav */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 52px' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: "system-ui,sans-serif", letterSpacing: '-.01em' }}>Atlas & Routes</span>
          <div style={{ display: 'flex', gap: 28 }}>
            {['Destinations', 'Articles', 'Galerie', 'Newsletter'].map(l => (
              <span key={l} style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', fontFamily: "system-ui,sans-serif", fontWeight: 400 }}>{l}</span>
            ))}
          </div>
        </div>
        {/* surtitre sur la photo */}
        <div style={{ position: 'absolute', bottom: 24, left: 52 }}>
          <span style={{ background: '#0D9488', color: '#fff', padding: '5px 14px', fontSize: 11, fontFamily: "system-ui,sans-serif", fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>À la une</span>
        </div>
      </div>
      {/* bas éditorial */}
      <div style={{ height: 220, background: '#111', display: 'flex', flexDirection: 'column', padding: '24px 52px 20px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 28, fontWeight: 400, color: '#fff', lineHeight: 1.2, marginBottom: 12 }}>Le monde vu autrement — 40 pays, des récits vrais</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', lineHeight: 1.65, maxWidth: 560, fontFamily: "system-ui,sans-serif" }}>Pas de tourisme de masse : des expériences authentiques, des rencontres humaines, des adresses confidentielles partagées après des années de voyages.</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,.1)', paddingTop: 16 }}>
          <div style={{ display: 'flex', gap: 40 }}>
            {[['40 pays', 'Visités'], ['50 000', 'Lecteurs/mois'], ['6 ans', 'En ligne']].map(([n, l]) => (
              <div key={l}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: "system-ui,sans-serif" }}>{n} </span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', fontFamily: "system-ui,sans-serif", textTransform: 'uppercase', letterSpacing: '.1em' }}>{l}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ background: '#0D9488', color: '#fff', padding: '10px 22px', fontSize: 13, fontWeight: 700, borderRadius: 6, fontFamily: "system-ui,sans-serif" }}>Explorer</div>
            <div style={{ border: '1px solid rgba(255,255,255,.15)', color: 'rgba(255,255,255,.5)', padding: '10px 22px', fontSize: 13, borderRadius: 6, fontFamily: "system-ui,sans-serif" }}>Newsletter</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Routing ─────────────────────────────────────────────────── */
const LAYOUTS: Record<string, (props: { ex: Example }) => React.ReactElement> = {
  'restaurant-gastronomique': ({ ex }) => <RestaurantGastro ex={ex} />,
  'pizzeria-napolitaine':     ({ ex }) => <Pizzeria ex={ex} />,
  'cabinet-architecte':       ({ ex }) => <Architecte ex={ex} />,
  'agence-digitale':          ({ ex }) => <AgenceDigitale ex={ex} />,
  'startup-tech':             ({ ex }) => <StartupTech ex={ex} />,
  'boutique-artisanale':      ({ ex }) => <BoutiqueArtisanale ex={ex} />,
  'boutique-bijoux':          ({ ex }) => <Bijoux ex={ex} />,
  'portfolio-photographe':    ({ ex }) => <Photographe ex={ex} />,
  'portfolio-designer':       ({ ex }) => <Designer ex={ex} />,
  'cabinet-medical':          ({ ex }) => <CabinetMedical ex={ex} />,
  'coach-sportif':            ({ ex }) => <CoachSportif ex={ex} />,
  'blog-voyage':              ({ ex }) => <BlogVoyage ex={ex} />,
}

/* ── Wrapper responsive ──────────────────────────────────────── */
export default function SitePreview({ example }: { example: Example }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.55)

  useEffect(() => {
    if (!wrapperRef.current) return
    const update = () => {
      if (wrapperRef.current) setScale(wrapperRef.current.offsetWidth / W)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(wrapperRef.current)
    return () => ro.disconnect()
  }, [])

  const Layout = LAYOUTS[example.slug]

  return (
    <div ref={wrapperRef} style={{ position: 'relative', overflow: 'hidden', height: Math.round(H * scale) }}>
      {Layout ? (
        <div style={{ position: 'absolute', top: 0, left: 0, transformOrigin: 'top left', transform: `scale(${scale})` }}>
          <Layout ex={example} />
        </div>
      ) : (
        <img src={example.img} alt={example.label} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
      )}
    </div>
  )
}
