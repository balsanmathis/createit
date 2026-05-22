'use client'

import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { useBuilder } from '@/lib/builder/context'
import { BLOCK_DEFS } from '@/lib/builder/blocks'
import { TEMPLATES } from '@/lib/builder/templates'
import type { BlockCategory } from '@/lib/builder/types'

const CATEGORY_LABELS: Record<BlockCategory, string> = {
  layout: 'Mise en page',
  navigation: 'Navigation',
  hero: 'Hero',
  text: 'Texte',
  media: 'Médias',
  buttons: 'Boutons',
  cards: 'Cartes',
  sections: 'Sections',
  forms: 'Formulaires',
  effects: 'Effets',
}

const CATEGORY_ORDER: BlockCategory[] = [
  'layout', 'navigation', 'hero', 'text', 'media', 'buttons', 'cards', 'sections', 'forms', 'effects'
]

// ─── Premium templates ─────────────────────────────────────────────────────────
interface PremiumTemplate {
  id: string
  label: string
  category: string
  emoji: string
  html: string
}

const PREMIUM_TEMPLATES: PremiumTemplate[] = [
  {
    id: 'hero-gradient',
    label: 'Hero Gradient',
    category: 'Hero',
    emoji: '🌈',
    html: `<section style="min-height:90vh;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);display:flex;align-items:center;justify-content:center;text-align:center;padding:80px 40px;font-family:system-ui,sans-serif"><div style="max-width:700px"><span style="display:inline-block;background:rgba(255,255,255,0.2);color:#fff;font-size:13px;font-weight:600;padding:6px 18px;border-radius:999px;margin-bottom:24px;backdrop-filter:blur(10px)">✨ Nouveau</span><h1 style="color:#fff;font-size:clamp(2.5rem,5vw,4rem);font-weight:800;line-height:1.1;margin:0 0 20px">Créez quelque chose <em style="font-style:normal;background:linear-gradient(to right,#ffd700,#ffaa00);-webkit-background-clip:text;-webkit-text-fill-color:transparent">d'extraordinaire</em></h1><p style="color:rgba(255,255,255,0.85);font-size:1.2rem;line-height:1.7;margin:0 0 40px">La plateforme qui transforme vos idées en réalité numérique.</p><div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap"><a href="#" style="background:#fff;color:#764ba2;font-weight:700;padding:16px 36px;border-radius:12px;text-decoration:none;font-size:15px">Commencer gratuitement</a><a href="#" style="background:rgba(255,255,255,0.15);color:#fff;font-weight:600;padding:16px 36px;border-radius:12px;text-decoration:none;font-size:15px;border:1px solid rgba(255,255,255,0.3);backdrop-filter:blur(10px)">En savoir plus</a></div></div></section>`,
  },
  {
    id: 'hero-split',
    label: 'Hero Split',
    category: 'Hero',
    emoji: '⬛',
    html: `<section style="min-height:90vh;display:grid;grid-template-columns:1fr 1fr;align-items:center;font-family:system-ui,sans-serif"><div style="padding:80px 60px;background:#0f172a"><span style="display:inline-block;background:#1e293b;color:#7c3aed;font-size:12px;font-weight:700;padding:5px 14px;border-radius:999px;margin-bottom:24px;letter-spacing:0.05em">SOLUTION INNOVANTE</span><h1 style="color:#f8fafc;font-size:clamp(2rem,3.5vw,3.2rem);font-weight:800;line-height:1.15;margin:0 0 20px">Votre succès commence <span style="color:#7c3aed">ici</span></h1><p style="color:#94a3b8;font-size:1.05rem;line-height:1.75;margin:0 0 36px">Une description percutante de votre valeur unique. Simple, claire, mémorable.</p><div style="display:flex;gap:12px;flex-wrap:wrap"><a href="#" style="background:#7c3aed;color:#fff;font-weight:700;padding:14px 32px;border-radius:10px;text-decoration:none;font-size:14px">Démarrer →</a><a href="#" style="color:#94a3b8;font-weight:600;padding:14px 20px;text-decoration:none;font-size:14px">Voir une démo ▶</a></div></div><div style="background:#1e293b;height:100%;min-height:90vh;display:flex;align-items:center;justify-content:center"><img src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=700&auto=format&fit=crop" alt="Hero" style="width:100%;height:100%;object-fit:cover;min-height:90vh" /></div></section>`,
  },
  {
    id: 'hero-minimal',
    label: 'Hero Minimal',
    category: 'Hero',
    emoji: '⬜',
    html: `<section style="min-height:85vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:80px 40px;background:#fff;font-family:system-ui,sans-serif"><div style="max-width:640px"><p style="font-size:14px;font-weight:600;color:#7c3aed;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 20px">Votre tagline ici</p><h1 style="font-size:clamp(2.8rem,6vw,4.5rem);font-weight:900;color:#09090b;line-height:1.05;letter-spacing:-0.03em;margin:0 0 24px">Moins de bruit,<br>plus de résultats.</h1><p style="font-size:1.15rem;color:#71717a;line-height:1.7;margin:0 0 40px">Conçu pour les équipes qui veulent aller à l'essentiel sans sacrifier la qualité.</p><div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap"><a href="#" style="background:#09090b;color:#fff;font-weight:700;padding:15px 36px;border-radius:999px;text-decoration:none;font-size:14px">Essayer gratuitement</a><a href="#" style="background:transparent;color:#09090b;font-weight:600;padding:15px 24px;text-decoration:none;font-size:14px;border:1px solid #e4e4e7;border-radius:999px">Voir les fonctionnalités</a></div></div></section>`,
  },
  {
    id: 'features-bento',
    label: 'Features Bento',
    category: 'Section',
    emoji: '🔲',
    html: `<section style="padding:80px 40px;background:#09090b;font-family:system-ui,sans-serif"><div style="max-width:1100px;margin:0 auto"><p style="color:#7c3aed;font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;text-align:center;margin:0 0 12px">Fonctionnalités</p><h2 style="color:#f8fafc;font-size:clamp(2rem,4vw,3rem);font-weight:800;text-align:center;margin:0 0 48px;line-height:1.2">Tout ce dont vous avez besoin</h2><div style="display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:auto auto;gap:16px"><div style="grid-column:span 2;background:#18181b;border:1px solid #27272a;border-radius:20px;padding:40px"><div style="font-size:36px;margin-bottom:16px">⚡</div><h3 style="color:#f8fafc;font-size:1.4rem;font-weight:700;margin:0 0 10px">Ultra performant</h3><p style="color:#71717a;line-height:1.65;margin:0;font-size:14px">Une vitesse d'exécution inégalée grâce à une architecture optimisée pour la performance.</p></div><div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);border-radius:20px;padding:40px"><div style="font-size:36px;margin-bottom:16px">🎯</div><h3 style="color:#fff;font-size:1.4rem;font-weight:700;margin:0 0 10px">Précis</h3><p style="color:rgba(255,255,255,0.8);line-height:1.65;margin:0;font-size:14px">Analyses en temps réel.</p></div><div style="background:#18181b;border:1px solid #27272a;border-radius:20px;padding:40px"><div style="font-size:36px;margin-bottom:16px">🔒</div><h3 style="color:#f8fafc;font-size:1.4rem;font-weight:700;margin:0 0 10px">Sécurisé</h3><p style="color:#71717a;line-height:1.65;margin:0;font-size:14px">Chiffrement de bout en bout.</p></div><div style="grid-column:span 2;background:#18181b;border:1px solid #27272a;border-radius:20px;padding:40px;display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:center"><div><div style="font-size:36px;margin-bottom:16px">🤝</div><h3 style="color:#f8fafc;font-size:1.4rem;font-weight:700;margin:0 0 10px">Collaboration</h3><p style="color:#71717a;line-height:1.65;margin:0;font-size:14px">Travaillez en équipe en temps réel.</p></div><div style="background:#27272a;border-radius:12px;padding:20px;display:flex;flex-direction:column;gap:10px">${[1,2,3].map(i=>`<div style="display:flex;align-items:center;gap:10px"><div style="width:32px;height:32px;border-radius:50%;background:#7c3aed;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:700">${i}</div><div style="height:8px;flex:1;background:#3f3f46;border-radius:4px"></div></div>`).join('')}</div></div></div></div></section>`,
  },
  {
    id: 'testimonials-marquee',
    label: 'Témoignages Défilants',
    category: 'Section',
    emoji: '💬',
    html: `<section style="padding:80px 0;background:#fafafa;overflow:hidden;font-family:system-ui,sans-serif"><h2 style="text-align:center;font-size:2rem;font-weight:800;color:#09090b;margin:0 0 48px;padding:0 40px">Ils nous font confiance</h2><div style="display:flex;gap:20px;animation:marquee 30s linear infinite;width:max-content">${[
      {text:'Service exceptionnel, livraison impeccable !',name:'Sophie M.',role:'CEO'},
      {text:'Vraiment au-dessus de mes attentes. Je recommande.',name:'Thomas B.',role:'Directeur'},
      {text:'Une équipe réactive et professionnelle.',name:'Lucie P.',role:'Marketing'},
      {text:'Le meilleur investissement de cette année.',name:'Marc L.',role:'Fondateur'},
      {text:'Qualité irréprochable, délais respectés.',name:'Anna K.',role:'Product'},
      {text:'Interface intuitive, résultats rapides.',name:'Julien R.',role:'Dev'},
    ].map(t=>`<div style="background:#fff;border:1px solid #e4e4e7;border-radius:16px;padding:24px 28px;min-width:280px;flex-shrink:0"><div style="color:#f59e0b;font-size:16px;margin-bottom:12px">⭐⭐⭐⭐⭐</div><p style="color:#18181b;line-height:1.65;margin:0 0 16px;font-style:italic;font-size:14px">"${t.text}"</p><div style="font-size:13px;font-weight:700;color:#09090b">${t.name}</div><div style="font-size:12px;color:#71717a">${t.role}</div></div>`).join('')}</div><style>@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}</style></section>`,
  },
  {
    id: 'pricing-toggle',
    label: 'Pricing avec Toggle',
    category: 'Section',
    emoji: '💰',
    html: `<section style="padding:80px 40px;background:#fff;font-family:system-ui,sans-serif"><h2 style="text-align:center;font-size:2.2rem;font-weight:800;color:#09090b;margin:0 0 8px">Tarifs simples et transparents</h2><p style="text-align:center;color:#71717a;font-size:15px;margin:0 0 48px">Annuel — <strong style="color:#7c3aed">économisez 20%</strong></p><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:960px;margin:0 auto;align-items:start">${[
      {plan:'Starter',price:'9€',desc:'Pour les indépendants',features:['3 projets','Support email','Exports illimités'],highlight:false},
      {plan:'Pro',price:'29€',desc:'Pour les équipes',features:['Projets illimités','Support prioritaire','API access','Analytics avancés'],highlight:true},
      {plan:'Agency',price:'99€',desc:'Pour les agences',features:['Tout illimité','Account manager','SLA garanti','White-label'],highlight:false},
    ].map(p=>`<div style="border:${p.highlight?'2px solid #7c3aed':'1px solid #e4e4e7'};border-radius:20px;padding:36px 28px;background:${p.highlight?'#faf5ff':'#fff'};position:relative">${p.highlight?'<span style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:#7c3aed;color:#fff;font-size:11px;font-weight:700;padding:4px 16px;border-radius:999px">POPULAIRE</span>':''}<h3 style="font-size:1.1rem;font-weight:700;color:#09090b;margin:0 0 4px">${p.plan}</h3><p style="color:#71717a;font-size:13px;margin:0 0 20px">${p.desc}</p><div style="font-size:2.8rem;font-weight:900;color:${p.highlight?'#7c3aed':'#09090b'};margin-bottom:4px">${p.price}<span style="font-size:14px;font-weight:500;color:#71717a">/mois</span></div><ul style="list-style:none;padding:0;margin:24px 0 28px;display:flex;flex-direction:column;gap:10px">${p.features.map(f=>`<li style="display:flex;align-items:center;gap:8px;font-size:13px;color:#374151"><span style="color:#7c3aed;font-weight:700">✓</span>${f}</li>`).join('')}</ul><a href="#" style="display:block;text-align:center;background:${p.highlight?'#7c3aed':'transparent'};color:${p.highlight?'#fff':'#7c3aed'};border:${p.highlight?'none':'2px solid #7c3aed'};font-weight:700;padding:13px;border-radius:10px;text-decoration:none;font-size:14px">Choisir ${p.plan}</a></div>`).join('')}</div></section>`,
  },
  {
    id: 'logo-cloud',
    label: 'Logo Cloud',
    category: 'Section',
    emoji: '🏢',
    html: `<section style="padding:60px 40px;background:#f8fafc;font-family:system-ui,sans-serif"><p style="text-align:center;font-size:13px;color:#94a3b8;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 32px">Ils nous font confiance</p><div style="display:flex;flex-wrap:wrap;gap:32px 48px;justify-content:center;align-items:center;max-width:900px;margin:0 auto">${['Airbnb','Stripe','Notion','Linear','Vercel','Figma','Shopify','Slack'].map(n=>`<div style="font-size:20px;font-weight:800;color:#94a3b8;letter-spacing:-0.02em;opacity:0.6">${n}</div>`).join('')}</div></section>`,
  },
  {
    id: 'timeline',
    label: 'Timeline',
    category: 'Section',
    emoji: '📅',
    html: `<section style="padding:80px 40px;background:#fff;font-family:system-ui,sans-serif"><div style="max-width:700px;margin:0 auto"><h2 style="font-size:2rem;font-weight:800;color:#09090b;margin:0 0 48px;text-align:center">Notre histoire</h2><div style="position:relative;padding-left:32px;border-left:2px solid #e4e4e7">${[
      {year:'2021',title:'Fondation',desc:'Création de l\'entreprise avec une vision claire : simplifier le web.'},
      {year:'2022',title:'Lancement produit',desc:'Premier client, première version stable, premières étoiles sur GitHub.'},
      {year:'2023',title:'Croissance',desc:'100 clients, levée de fonds de 2M€, équipe doublée.'},
      {year:'2024',title:'Aujourd\'hui',desc:'10 000 utilisateurs actifs dans 40 pays. La suite s\'écrit avec vous.'},
    ].map(e=>`<div style="position:relative;margin-bottom:40px"><div style="position:absolute;left:-41px;top:4px;width:18px;height:18px;border-radius:50%;background:#7c3aed;border:3px solid #fff;box-shadow:0 0 0 2px #7c3aed"></div><span style="font-size:12px;font-weight:700;color:#7c3aed;letter-spacing:0.08em;text-transform:uppercase">${e.year}</span><h3 style="font-size:1.1rem;font-weight:700;color:#09090b;margin:4px 0 8px">${e.title}</h3><p style="color:#71717a;line-height:1.65;font-size:14px;margin:0">${e.desc}</p></div>`).join('')}</div></div></section>`,
  },
  {
    id: 'cta-banner',
    label: 'CTA Banner',
    category: 'Section',
    emoji: '🚀',
    html: `<section style="padding:0;font-family:system-ui,sans-serif"><div style="margin:40px;background:linear-gradient(135deg,#7c3aed 0%,#4f46e5 50%,#2563eb 100%);border-radius:24px;padding:64px 48px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:32px"><div style="max-width:540px"><h2 style="color:#fff;font-size:clamp(1.8rem,3vw,2.5rem);font-weight:800;margin:0 0 12px;line-height:1.2">Prêt à transformer votre business ?</h2><p style="color:rgba(255,255,255,0.85);font-size:15px;line-height:1.65;margin:0">Rejoignez 10 000+ entreprises qui ont déjà fait le pas. Sans engagement, sans carte bleue.</p></div><div style="display:flex;flex-direction:column;gap:12px;min-width:200px"><a href="#" style="background:#fff;color:#7c3aed;font-weight:800;padding:16px 32px;border-radius:12px;text-decoration:none;font-size:15px;text-align:center">Commencer maintenant</a><a href="#" style="color:rgba(255,255,255,0.8);font-size:13px;text-align:center;text-decoration:underline">Voir une démo →</a></div></div></section>`,
  },
  {
    id: 'navbar-glass',
    label: 'Navbar Glassmorphism',
    category: 'Navigation',
    emoji: '🪟',
    html: `<nav style="position:sticky;top:0;z-index:100;padding:0 40px;height:68px;display:flex;align-items:center;justify-content:space-between;font-family:system-ui,sans-serif;background:rgba(255,255,255,0.75);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(0,0,0,0.06);box-shadow:0 1px 3px rgba(0,0,0,0.05)"><span style="font-size:20px;font-weight:800;color:#09090b;letter-spacing:-0.5px">Brand<span style="color:#7c3aed">.</span></span><div style="display:flex;gap:28px;align-items:center"><a href="#" style="color:#52525b;text-decoration:none;font-size:14px;font-weight:500">Produit</a><a href="#" style="color:#52525b;text-decoration:none;font-size:14px;font-weight:500">Tarifs</a><a href="#" style="color:#52525b;text-decoration:none;font-size:14px;font-weight:500">Docs</a><a href="#" style="background:#09090b;color:#fff;text-decoration:none;font-size:13px;font-weight:700;padding:8px 20px;border-radius:8px">Se connecter</a></div></nav>`,
  },
  {
    id: 'footer-dark',
    label: 'Footer Dark',
    category: 'Navigation',
    emoji: '🌑',
    html: `<footer style="background:#09090b;color:#a1a1aa;padding:64px 40px 32px;font-family:system-ui,sans-serif"><div style="max-width:1100px;margin:0 auto"><div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:48px;margin-bottom:48px"><div><div style="font-size:22px;font-weight:800;color:#fff;margin-bottom:16px">Brand<span style="color:#7c3aed">.</span></div><p style="font-size:13px;line-height:1.7;max-width:220px;color:#71717a">La plateforme qui propulse votre croissance digitale.</p></div>${['Produit','Entreprise','Support'].map(col=>`<div><h4 style="color:#fff;font-size:13px;font-weight:700;margin:0 0 16px;letter-spacing:0.05em;text-transform:uppercase">${col}</h4><ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px">${['Fonctionnalités','Tarifs','Changelog','API'].map(l=>`<li><a href="#" style="color:#71717a;text-decoration:none;font-size:13px;transition:color 0.15s" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#71717a'">${l}</a></li>`).join('')}</ul></div>`).join('')}</div><div style="border-top:1px solid #27272a;padding-top:32px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px"><p style="font-size:13px;margin:0;color:#52525b">© 2024 Brand. Tous droits réservés.</p><div style="display:flex;gap:16px">${['Twitter','GitHub','LinkedIn'].map(s=>`<a href="#" style="color:#52525b;font-size:13px;text-decoration:none">${s}</a>`).join('')}</div></div></div></footer>`,
  },
  {
    id: 'newsletter-section',
    label: 'Newsletter',
    category: 'Section',
    emoji: '📧',
    html: `<section style="padding:80px 40px;background:#faf5ff;font-family:system-ui,sans-serif"><div style="max-width:560px;margin:0 auto;text-align:center"><div style="width:56px;height:56px;background:#7c3aed;border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;font-size:24px">📧</div><h2 style="font-size:2rem;font-weight:800;color:#09090b;margin:0 0 12px">Restez informé</h2><p style="color:#71717a;font-size:15px;line-height:1.65;margin:0 0 32px">Recevez nos dernières actualités, conseils et offres exclusives directement dans votre boîte mail. Pas de spam.</p><form style="display:flex;gap:8px;max-width:440px;margin:0 auto"><input type="email" placeholder="votre@email.com" style="flex:1;padding:12px 16px;border:1px solid #e4e4e7;border-radius:10px;font-size:14px;outline:none;background:#fff" /><button type="submit" style="background:#7c3aed;color:#fff;font-weight:700;padding:12px 24px;border-radius:10px;border:none;cursor:pointer;font-size:14px;white-space:nowrap">S'abonner →</button></form><p style="font-size:12px;color:#94a3b8;margin:16px 0 0">Désinscription en 1 clic. Vos données sont protégées.</p></div></section>`,
  },
  {
    id: 'stats-dark',
    label: 'Stats Dark',
    category: 'Section',
    emoji: '📊',
    html: `<section style="padding:80px 40px;background:#09090b;font-family:system-ui,sans-serif"><div style="max-width:1000px;margin:0 auto;text-align:center"><p style="color:#7c3aed;font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 40px">Chiffres clés</p><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:40px">${[
      {n:'50K+',l:'Utilisateurs actifs'},{n:'99.9%',l:'Disponibilité'},{n:'< 100ms',l:'Temps de réponse'},{n:'4.9★',l:'Note moyenne'}
    ].map(s=>`<div><div style="font-size:2.8rem;font-weight:900;color:#fff;margin-bottom:8px;letter-spacing:-0.02em">${s.n}</div><div style="font-size:14px;color:#71717a;font-weight:500">${s.l}</div></div>`).join('')}</div></div></section>`,
  },
  {
    id: 'team-grid',
    label: 'Équipe Grid',
    category: 'Section',
    emoji: '👥',
    html: `<section style="padding:80px 40px;background:#fff;font-family:system-ui,sans-serif"><div style="max-width:1000px;margin:0 auto"><h2 style="text-align:center;font-size:2rem;font-weight:800;color:#09090b;margin:0 0 12px">Notre équipe</h2><p style="text-align:center;color:#71717a;font-size:15px;margin:0 0 56px">Des experts passionnés qui donnent vie à votre vision.</p><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:32px">${[
      {n:'Sophie Martin',r:'CEO & Co-founder',img:'https://images.unsplash.com/photo-1494790108755-2616b612b047?w=300&q=80&auto=format&fit=crop'},
      {n:'Thomas Leroy',r:'CTO',img:'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80&auto=format&fit=crop'},
      {n:'Emma Bernard',r:'Design Lead',img:'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80&auto=format&fit=crop'},
      {n:'Lucas Petit',r:'Head of Sales',img:'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=300&q=80&auto=format&fit=crop'},
    ].map(m=>`<div style="text-align:center"><div style="position:relative;margin-bottom:16px;display:inline-block"><img src="${m.img}" alt="${m.n}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:3px solid #f3e8ff" /></div><h3 style="font-size:15px;font-weight:700;color:#09090b;margin:0 0 4px">${m.n}</h3><p style="font-size:13px;color:#7c3aed;font-weight:500;margin:0">${m.r}</p></div>`).join('')}</div></div></section>`,
  },
]

// ─── Draggable block item ──────────────────────────────────────────────────────
function DraggableBlockItem({ type, icon, label, onAdd }: { type: string; icon: string; label: string; onAdd: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { type: 'palette', blockType: type },
  })

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onAdd}
      title={`Ajouter : ${label}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 8, width: '100%',
        height: 36, padding: '0 10px',
        background: isDragging ? '#eff6ff' : 'transparent',
        border: '1px solid transparent', borderRadius: 6,
        cursor: 'grab', textAlign: 'left', transition: 'all 0.12s',
        opacity: isDragging ? 0.5 : 1,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#e2e8f0' }}
      onMouseLeave={e => { if (!isDragging) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' } }}
    >
      <span style={{ fontSize: 14, width: 20, textAlign: 'center', flexShrink: 0, color: '#64748b' }}>{icon}</span>
      <span style={{ fontSize: 13, color: '#374151', fontWeight: 500, flex: 1 }}>{label}</span>
      <span style={{ fontSize: 10, color: '#cbd5e1', opacity: 0, transition: 'opacity 0.12s' }} className="drag-hint">⠿</span>
    </button>
  )
}

// ─── BlockPanel ────────────────────────────────────────────────────────────────
export default function BlockPanel() {
  const { addBlock, dispatch, state } = useBuilder()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'blocks' | 'templates' | 'premium'>('blocks')
  const [expanded, setExpanded] = useState<Set<BlockCategory>>(new Set(['layout', 'hero', 'sections']))
  const [htmlImport, setHtmlImport] = useState('')
  const [htmlError, setHtmlError] = useState('')
  const [premiumCategory, setPremiumCategory] = useState('Tous')

  const filtered = BLOCK_DEFS.filter(d =>
    d.label.toLowerCase().includes(search.toLowerCase()) || d.type.toLowerCase().includes(search.toLowerCase())
  )

  const grouped = CATEGORY_ORDER.reduce<Record<BlockCategory, typeof filtered>>((acc, cat) => {
    acc[cat] = filtered.filter(d => d.category === cat)
    return acc
  }, {} as Record<BlockCategory, typeof filtered>)

  function toggleCategory(cat: BlockCategory) {
    setExpanded(prev => { const n = new Set(prev); if (n.has(cat)) n.delete(cat); else n.add(cat); return n })
  }

  function loadTemplate(templateId: string) {
    const tpl = TEMPLATES.find(t => t.id === templateId)
    if (!tpl) return
    const blocks = tpl.blocks.map(b => ({ ...b, id: Math.random().toString(36).slice(2) + Date.now().toString(36) }))
    dispatch({ type: 'LOAD', payload: { id: state.siteId || '', name: tpl.label, blocks, styles: {} } })
  }

  function importPremium(tpl: PremiumTemplate) {
    const genId = Math.random().toString(36).slice(2) + Date.now().toString(36)
    dispatch({
      type: 'ADD_BLOCK',
      payload: {
        block: {
          id: genId,
          type: 'custom-html',
          content: { html: tpl.html },
          style: {},
          animation: { type: 'none', duration: 0.6, delay: 0, trigger: 'scroll' },
        },
      },
    })
  }

  function importCustomHtml() {
    const h = htmlImport.trim()
    if (!h) { setHtmlError('Le champ est vide.'); return }
    if (!/<[a-z][\s\S]*>/i.test(h)) { setHtmlError('HTML invalide — aucune balise détectée.'); return }
    setHtmlError('')
    const genId = Math.random().toString(36).slice(2) + Date.now().toString(36)
    dispatch({
      type: 'ADD_BLOCK',
      payload: {
        block: {
          id: genId,
          type: 'custom-html',
          content: { html: h },
          style: {},
          animation: { type: 'none', duration: 0.6, delay: 0, trigger: 'scroll' },
        },
      },
    })
    setHtmlImport('')
  }

  const premiumCategories = ['Tous', ...Array.from(new Set(PREMIUM_TEMPLATES.map(t => t.category)))]
  const filteredPremium = premiumCategory === 'Tous' ? PREMIUM_TEMPLATES : PREMIUM_TEMPLATES.filter(t => t.category === premiumCategory)

  const tabs: { key: 'blocks' | 'templates' | 'premium'; label: string }[] = [
    { key: 'blocks', label: 'Blocs' },
    { key: 'templates', label: 'Pages' },
    { key: 'premium', label: 'Premium' },
  ]

  return (
    <aside style={{ width: 280, flexShrink: 0, background: '#ffffff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Header + Search */}
      <div style={{ padding: '16px 16px 10px', borderBottom: '1px solid #f1f5f9' }}>
        <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Blocs</p>
        <input
          type="text"
          placeholder="🔍 Rechercher..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', height: 32, padding: '0 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, background: '#f8fafc', color: '#374151', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', padding: '0 8px' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{ flex: 1, padding: '8px 4px', background: 'none', border: 'none', borderBottom: activeTab === t.key ? '2px solid #2563eb' : '2px solid transparent', color: activeTab === t.key ? '#2563eb' : '#94a3b8', fontSize: 12, fontWeight: 600, cursor: 'pointer', marginBottom: -1 }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px 20px' }}>

        {/* ── Blocks Tab ── */}
        {activeTab === 'blocks' && (
          CATEGORY_ORDER.map(cat => {
            const items = grouped[cat]
            if (items.length === 0) return null
            const isOpen = expanded.has(cat) || search.length > 0
            return (
              <div key={cat}>
                <button
                  onClick={() => toggleCategory(cat)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '12px 8px 4px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 4 }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {CATEGORY_LABELS[cat]}
                  </span>
                  <span style={{ fontSize: 10, color: '#cbd5e1', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', lineHeight: 1 }}>▼</span>
                </button>
                {isOpen && (
                  <div>
                    {items.map(def => (
                      <DraggableBlockItem key={def.type} type={def.type} icon={def.icon} label={def.label} onAdd={() => addBlock(def.type)} />
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}

        {/* ── Templates Tab ── */}
        {activeTab === 'templates' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 4px' }}>
            {TEMPLATES.map(tpl => (
              <button
                key={tpl.id}
                onClick={() => loadTemplate(tpl.id)}
                style={{ display: 'flex', gap: 12, padding: '12px 14px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, cursor: 'pointer', textAlign: 'left', transition: 'all 0.12s', alignItems: 'flex-start' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.background = '#eff6ff' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff' }}
              >
                <span style={{ fontSize: 24, lineHeight: 1 }}>{tpl.emoji}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>{tpl.label}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>{tpl.description}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── Premium Tab ── */}
        {activeTab === 'premium' && (
          <div>
            {/* Category filter */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '8px 4px' }}>
              {premiumCategories.map(cat => (
                <button key={cat} onClick={() => setPremiumCategory(cat)} style={{ padding: '3px 10px', fontSize: 11, fontWeight: 600, border: '1px solid', borderColor: premiumCategory === cat ? '#2563eb' : '#e2e8f0', borderRadius: 999, cursor: 'pointer', background: premiumCategory === cat ? '#eff6ff' : '#fff', color: premiumCategory === cat ? '#2563eb' : '#64748b' }}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Premium templates grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '4px 4px' }}>
              {filteredPremium.map(tpl => (
                <div key={tpl.id} style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
                  <div style={{ background: '#f8fafc', padding: '20px', textAlign: 'center', fontSize: 28 }}>{tpl.emoji}</div>
                  <div style={{ padding: '10px 12px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{tpl.label}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, color: '#7c3aed', background: '#f3e8ff', padding: '2px 6px', borderRadius: 4 }}>{tpl.category}</span>
                    </div>
                    <button
                      onClick={() => importPremium(tpl)}
                      style={{ width: '100%', padding: '7px 0', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
                    >
                      + Importer
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* HTML Import */}
            <div style={{ margin: '16px 4px 0', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '10px 12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{'</>'} Importer du code</span>
              </div>
              <div style={{ padding: 12 }}>
                <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 8px', lineHeight: 1.4 }}>
                  Collez du HTML (shadcn, 21st.dev, Tailwind...)
                </p>
                <textarea
                  value={htmlImport}
                  onChange={e => { setHtmlImport(e.target.value); setHtmlError('') }}
                  placeholder="<section>...</section>"
                  rows={5}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12, fontFamily: 'monospace', color: '#374151', background: '#f8fafc', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                />
                {htmlError && <p style={{ fontSize: 11, color: '#ef4444', margin: '4px 0 0' }}>{htmlError}</p>}
                <button
                  onClick={importCustomHtml}
                  style={{ width: '100%', marginTop: 8, padding: '8px 0', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
                >
                  Ajouter au canvas
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
