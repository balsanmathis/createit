import type { BlockDef, BlockStyle } from './types'

function styleToPartialCss(style: BlockStyle): string {
  const parts: string[] = []
  // Gradient takes priority over flat background
  if (style.gradientEnabled && style.gradientColor1 && style.gradientColor2) {
    parts.push(`background:linear-gradient(${style.gradientAngle ?? 135}deg,${style.gradientColor1},${style.gradientColor2})`)
  } else if (style.background) {
    parts.push(`background:${style.background}`)
  }
  if (style.color) parts.push(`color:${style.color}`)
  if (style.paddingTop !== undefined) parts.push(`padding-top:${style.paddingTop}px`)
  if (style.paddingRight !== undefined) parts.push(`padding-right:${style.paddingRight}px`)
  if (style.paddingBottom !== undefined) parts.push(`padding-bottom:${style.paddingBottom}px`)
  if (style.paddingLeft !== undefined) parts.push(`padding-left:${style.paddingLeft}px`)
  if (style.marginTop !== undefined) parts.push(`margin-top:${style.marginTop}px`)
  if (style.marginBottom !== undefined) parts.push(`margin-bottom:${style.marginBottom}px`)
  if (style.borderRadius !== undefined) parts.push(`border-radius:${style.borderRadius}px`)
  if (style.textAlign) parts.push(`text-align:${style.textAlign}`)
  if (style.fontSize) parts.push(`font-size:${style.fontSize}px`)
  if (style.fontWeight) parts.push(`font-weight:${style.fontWeight}`)
  if (style.fontFamily) parts.push(`font-family:${style.fontFamily}`)
  if (style.opacity !== undefined) parts.push(`opacity:${style.opacity / 100}`)
  if (style.minHeight) parts.push(`min-height:${style.minHeight}`)
  if (style.height) parts.push(`height:${style.height}`)
  return parts.join(';')
}

function normalizeHref(href: string): string {
  if (!href) return '#'
  if (href.startsWith('#') || href.startsWith('/') || href.startsWith('http') ||
      href.startsWith('mailto:') || href.startsWith('tel:')) return href
  return `https://${href}`
}

function buildVideoEmbed(
  url: string,
  opts: { autoplay?: string; muted?: string; loop?: string; controls?: string; ratio?: string }
): string {
  const autoplay = opts.autoplay === 'true'
  const muted = opts.muted !== 'false'
  const loop = opts.loop === 'true'
  const controls = opts.controls !== 'false'
  const ratio = opts.ratio || '16/9'
  const [rw, rh] = ratio.split('/').map(Number)
  const pb = rw && rh ? `${((rh / rw) * 100).toFixed(2)}%` : '56.25%'

  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (ytMatch) {
    const p = new URLSearchParams()
    if (autoplay) p.set('autoplay', '1')
    if (muted) p.set('mute', '1')
    if (loop) { p.set('loop', '1'); p.set('playlist', ytMatch[1]) }
    if (!controls) p.set('controls', '0')
    p.set('rel', '0')
    return `<div style="position:relative;padding-bottom:${pb};height:0;overflow:hidden;border-radius:12px"><iframe src="https://www.youtube.com/embed/${ytMatch[1]}?${p}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none" allowfullscreen allow="autoplay;encrypted-media"></iframe></div>`
  }

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) {
    const p = new URLSearchParams()
    if (autoplay) p.set('autoplay', '1')
    if (muted) p.set('muted', '1')
    if (loop) p.set('loop', '1')
    if (!controls) p.set('controls', '0')
    return `<div style="position:relative;padding-bottom:${pb};height:0;overflow:hidden;border-radius:12px"><iframe src="https://player.vimeo.com/video/${vimeoMatch[1]}?${p}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none" allowfullscreen allow="autoplay"></iframe></div>`
  }

  if (/\.mp4(\?.*)?$/i.test(url)) {
    const attrs = [controls ? 'controls' : '', autoplay ? 'autoplay' : '', muted ? 'muted' : '', loop ? 'loop' : '', 'playsinline'].filter(Boolean).join(' ')
    return `<video src="${url}" ${attrs} style="width:100%;border-radius:12px;aspect-ratio:${ratio.replace('/', '/')}"></video>`
  }

  return `<div style="position:relative;padding-bottom:${pb};height:0;overflow:hidden;border-radius:12px"><iframe src="${url}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none" allowfullscreen></iframe></div>`
}

const GALLERY_LIGHTBOX_SCRIPT = `<script>(function(){if(window.__gb_lb__)return;window.__gb_lb__=true;var o=document.createElement('div');o.style.cssText='display:none;position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:9999;cursor:zoom-out;align-items:center;justify-content:center;';var i=document.createElement('img');i.style.cssText='max-width:90vw;max-height:88vh;object-fit:contain;border-radius:8px;box-shadow:0 0 60px rgba(0,0,0,0.5);pointer-events:none;';o.appendChild(i);document.body.appendChild(o);function cl(){o.style.display='none';document.body.style.overflow='';}o.addEventListener('click',cl);document.addEventListener('keydown',function(e){if(e.key==='Escape')cl();});document.addEventListener('click',function(e){var t=e.target;if(t.tagName!=='IMG'||!t.closest('.gallery-item'))return;i.src=t.src;o.style.display='flex';document.body.style.overflow='hidden';});})()</script>`

export const BLOCK_DEFS: BlockDef[] = [
  // ─── LAYOUT ───────────────────────────────────────────────────────────────
  {
    type: 'section-empty',
    label: 'Section vide',
    category: 'layout',
    icon: '⬜',
    defaultContent: { bg: '#ffffff' },
    defaultStyle: { paddingTop: 60, paddingBottom: 60, paddingLeft: 40, paddingRight: 40 },
    render(content, style) {
      const bg = content.bg || '#ffffff'
      const css = styleToPartialCss(style)
      return `<div style="background:${bg};${css};min-height:80px;width:100%"></div>`
    },
  },
  {
    type: 'section-colored',
    label: 'Section colorée',
    category: 'layout',
    icon: '🟪',
    defaultContent: { bg: '#f3e8ff' },
    defaultStyle: { paddingTop: 60, paddingBottom: 60, paddingLeft: 40, paddingRight: 40 },
    render(content, style) {
      const bg = content.bg || '#f3e8ff'
      const css = styleToPartialCss(style)
      return `<div style="background:${bg};${css};min-height:80px;width:100%"></div>`
    },
  },
  {
    type: 'divider',
    label: 'Séparateur',
    category: 'layout',
    icon: '➖',
    defaultContent: { color: '#e4e4e7' },
    defaultStyle: { marginTop: 16, marginBottom: 16 },
    render(content, style) {
      const css = styleToPartialCss(style)
      return `<hr style="border:none;border-top:1px solid ${content.color || '#e4e4e7'};${css};margin-left:auto;margin-right:auto;width:90%">`
    },
  },
  {
    type: 'spacer',
    label: 'Espaceur',
    category: 'layout',
    icon: '↕️',
    defaultContent: { height: '40' },
    defaultStyle: {},
    render(content) {
      const h = parseInt(content.height || '40')
      return `<div style="height:${h}px;width:100%"></div>`
    },
  },
  {
    type: 'two-columns',
    label: '2 Colonnes',
    category: 'layout',
    icon: '◫',
    defaultContent: { left: 'Colonne gauche — ajoutez votre contenu ici.', right: 'Colonne droite — ajoutez votre contenu ici.' },
    defaultStyle: { paddingTop: 40, paddingBottom: 40, paddingLeft: 40, paddingRight: 40 },
    render(content, style) {
      const css = styleToPartialCss(style)
      return `<div style="${css};display:grid;grid-template-columns:1fr 1fr;gap:32px;width:100%">
  <div style="padding:24px;background:#f9f9f9;border-radius:8px">${content.left || 'Colonne gauche'}</div>
  <div style="padding:24px;background:#f9f9f9;border-radius:8px">${content.right || 'Colonne droite'}</div>
</div>`
    },
  },
  {
    type: 'three-columns',
    label: '3 Colonnes',
    category: 'layout',
    icon: '⊞',
    defaultContent: { col1: 'Colonne 1', col2: 'Colonne 2', col3: 'Colonne 3' },
    defaultStyle: { paddingTop: 40, paddingBottom: 40, paddingLeft: 40, paddingRight: 40 },
    render(content, style) {
      const css = styleToPartialCss(style)
      return `<div style="${css};display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;width:100%">
  <div style="padding:24px;background:#f9f9f9;border-radius:8px">${content.col1 || 'Colonne 1'}</div>
  <div style="padding:24px;background:#f9f9f9;border-radius:8px">${content.col2 || 'Colonne 2'}</div>
  <div style="padding:24px;background:#f9f9f9;border-radius:8px">${content.col3 || 'Colonne 3'}</div>
</div>`
    },
  },

  // ─── NAVIGATION ──────────────────────────────────────────────────────────
  {
    type: 'navbar-simple',
    label: 'Navbar simple',
    category: 'navigation',
    icon: '🔝',
    defaultContent: { logo: 'MonSite', link1: 'Accueil', link1Href: '#', link2: 'Services', link2Href: '#services', link3: 'Contact', link3Href: '#contact', cta: 'Commencer', ctaHref: '#' },
    defaultStyle: {},
    render(content) {
      return `<nav style="position:sticky;top:0;z-index:100;background:#ffffff;border-bottom:1px solid #e4e4e7;padding:0 40px;height:64px;display:flex;align-items:center;justify-content:space-between;font-family:system-ui,sans-serif">
  <span style="font-size:20px;font-weight:700;color:#7c3aed">${content.logo || 'MonSite'}</span>
  <div style="display:flex;gap:32px;align-items:center">
    <a href="${content.link1Href || '#'}" style="color:#52525b;text-decoration:none;font-size:14px;font-weight:500">${content.link1 || 'Accueil'}</a>
    <a href="${content.link2Href || '#'}" style="color:#52525b;text-decoration:none;font-size:14px;font-weight:500">${content.link2 || 'Services'}</a>
    <a href="${content.link3Href || '#'}" style="color:#52525b;text-decoration:none;font-size:14px;font-weight:500">${content.link3 || 'Contact'}</a>
    <a href="${content.ctaHref || '#'}" style="background:#7c3aed;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:8px 20px;border-radius:8px">${content.cta || 'Commencer'}</a>
  </div>
</nav>`
    },
  },
  {
    type: 'footer-simple',
    label: 'Footer simple',
    category: 'navigation',
    icon: '📄',
    defaultContent: { logo: 'MonSite', copyright: '© 2024 MonSite. Tous droits réservés.' },
    defaultStyle: {},
    render(content) {
      return `<footer style="background:#18181b;color:#a1a1aa;padding:40px;text-align:center;font-family:system-ui,sans-serif">
  <div style="font-size:22px;font-weight:700;color:#ffffff;margin-bottom:12px">${content.logo || 'MonSite'}</div>
  <p style="font-size:14px;margin:0">${content.copyright || '© 2024 MonSite. Tous droits réservés.'}</p>
</footer>`
    },
  },

  // ─── HERO ─────────────────────────────────────────────────────────────────
  {
    type: 'hero-centered',
    label: 'Hero centré',
    category: 'hero',
    icon: '🌟',
    defaultContent: {
      title: 'Bienvenue sur notre site',
      subtitle: 'Nous créons des expériences digitales exceptionnelles pour votre entreprise.',
      cta: 'Commencer maintenant',
      ctaHref: '#contact',
    },
    defaultStyle: {},
    render(content) {
      return `<section style="min-height:80vh;background:linear-gradient(135deg,#1e1b4b 0%,#7c3aed 50%,#4f46e5 100%);display:flex;align-items:center;justify-content:center;text-align:center;padding:80px 40px;font-family:system-ui,sans-serif">
  <div style="max-width:720px">
    <h1 style="color:#ffffff;font-size:clamp(2rem,5vw,3.5rem);font-weight:800;line-height:1.15;margin:0 0 24px">${content.title || 'Bienvenue sur notre site'}</h1>
    <p style="color:rgba(255,255,255,0.8);font-size:clamp(1rem,2vw,1.25rem);line-height:1.6;margin:0 0 40px">${content.subtitle || 'Une description convaincante de votre offre.'}</p>
    <a href="${content.ctaHref || '#'}" style="display:inline-block;background:#ffffff;color:#7c3aed;font-weight:700;font-size:16px;padding:16px 40px;border-radius:12px;text-decoration:none">${content.cta || 'Commencer maintenant'}</a>
  </div>
</section>`
    },
  },
  {
    type: 'hero-left',
    label: 'Hero gauche',
    category: 'hero',
    icon: '◀️',
    defaultContent: {
      title: 'Solutions innovantes pour votre entreprise',
      subtitle: 'Transformez votre vision en réalité avec nos services experts.',
      cta: 'Découvrir',
      ctaHref: '#services',
      image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=700&auto=format&fit=crop',
    },
    defaultStyle: {},
    render(content) {
      return `<section style="min-height:80vh;background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 100%);display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:60px;padding:80px 60px;font-family:system-ui,sans-serif">
  <div>
    <h1 style="color:#ffffff;font-size:clamp(1.8rem,3.5vw,3rem);font-weight:800;line-height:1.2;margin:0 0 20px">${content.title || 'Solutions innovantes'}</h1>
    <p style="color:rgba(255,255,255,0.75);font-size:1.1rem;line-height:1.7;margin:0 0 36px">${content.subtitle || 'Description de votre offre.'}</p>
    <a href="${content.ctaHref || '#'}" style="display:inline-block;background:#7c3aed;color:#fff;font-weight:700;font-size:15px;padding:14px 36px;border-radius:10px;text-decoration:none">${content.cta || 'Découvrir'}</a>
  </div>
  <div>
    <img src="${content.image || 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=700&auto=format&fit=crop'}" alt="Hero" style="width:100%;border-radius:16px;object-fit:cover;height:400px" />
  </div>
</section>`
    },
  },
  {
    type: 'hero-fullscreen',
    label: 'Hero plein écran',
    category: 'hero',
    icon: '🖼️',
    defaultContent: {
      title: 'Découvrez une expérience unique',
      subtitle: 'Une cuisine authentique dans un cadre exceptionnel',
      cta: 'Réserver une table',
      ctaHref: '#contact',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&auto=format&fit=crop',
    },
    defaultStyle: {},
    render(content) {
      return `<section style="min-height:100vh;position:relative;display:flex;align-items:center;justify-content:center;text-align:center;font-family:system-ui,sans-serif;overflow:hidden">
  <img src="${content.image || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&auto=format&fit=crop'}" alt="Background" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none" />
  <div style="position:absolute;inset:0;background:rgba(0,0,0,0.55)"></div>
  <div style="position:relative;z-index:1;max-width:800px;padding:40px">
    <h1 style="color:#ffffff;font-size:clamp(2.5rem,6vw,4.5rem);font-weight:800;line-height:1.1;margin:0 0 20px;text-shadow:0 2px 20px rgba(0,0,0,0.5)">${content.title || 'Découvrez une expérience unique'}</h1>
    <p style="color:rgba(255,255,255,0.9);font-size:clamp(1.1rem,2.5vw,1.4rem);margin:0 0 40px">${content.subtitle || 'Une cuisine authentique dans un cadre exceptionnel'}</p>
    <a href="${content.ctaHref || '#'}" style="display:inline-block;background:#7c3aed;color:#fff;font-weight:700;font-size:16px;padding:18px 48px;border-radius:12px;text-decoration:none">${content.cta || 'Réserver une table'}</a>
  </div>
</section>`
    },
  },

  // ─── TEXTE ────────────────────────────────────────────────────────────────
  {
    type: 'heading-h1',
    label: 'Titre H1',
    category: 'text',
    icon: 'H1',
    defaultContent: { text: 'Titre principal de votre page' },
    defaultStyle: { paddingTop: 40, paddingBottom: 16, paddingLeft: 40, paddingRight: 40 },
    render(content, style) {
      const css = styleToPartialCss(style)
      return `<h1 style="font-size:2.5rem;font-weight:800;color:#0a0a0a;line-height:1.2;${css};font-family:system-ui,sans-serif">${content.text || 'Titre principal'}</h1>`
    },
  },
  {
    type: 'heading-h2',
    label: 'Titre H2',
    category: 'text',
    icon: 'H2',
    defaultContent: { text: 'Sous-titre de section' },
    defaultStyle: { paddingTop: 32, paddingBottom: 12, paddingLeft: 40, paddingRight: 40 },
    render(content, style) {
      const css = styleToPartialCss(style)
      return `<h2 style="font-size:1.875rem;font-weight:700;color:#0a0a0a;line-height:1.3;${css};font-family:system-ui,sans-serif">${content.text || 'Sous-titre'}</h2>`
    },
  },
  {
    type: 'paragraph',
    label: 'Paragraphe',
    category: 'text',
    icon: '¶',
    defaultContent: { text: 'Votre texte ici. Cliquez pour modifier ce paragraphe et ajouter votre contenu personnalisé.' },
    defaultStyle: { paddingTop: 16, paddingBottom: 16, paddingLeft: 40, paddingRight: 40 },
    render(content, style) {
      const css = styleToPartialCss(style)
      return `<p style="font-size:1rem;color:#52525b;line-height:1.7;${css};font-family:system-ui,sans-serif">${content.text || 'Votre texte ici.'}</p>`
    },
  },
  {
    type: 'quote',
    label: 'Citation',
    category: 'text',
    icon: '❝',
    defaultContent: { text: 'Une citation inspirante qui marque les esprits et donne envie d\'en savoir plus.', author: '— Jean Dupont' },
    defaultStyle: { paddingTop: 40, paddingBottom: 40, paddingLeft: 60, paddingRight: 60 },
    render(content, style) {
      const css = styleToPartialCss(style)
      return `<blockquote style="border-left:4px solid #7c3aed;padding-left:24px;${css};font-family:system-ui,sans-serif">
  <p style="font-size:1.25rem;color:#18181b;font-style:italic;line-height:1.7;margin:0 0 12px">"${content.text || 'Citation ici.'}"</p>
  <cite style="font-size:0.875rem;color:#7c3aed;font-weight:600;font-style:normal">${content.author || '— Auteur'}</cite>
</blockquote>`
    },
  },
  {
    type: 'badge',
    label: 'Badge',
    category: 'text',
    icon: '🏷️',
    defaultContent: { text: 'Nouveau' },
    defaultStyle: { paddingTop: 16, paddingBottom: 16, paddingLeft: 40, paddingRight: 40 },
    render(content, style) {
      const css = styleToPartialCss(style)
      return `<div style="${css}"><span style="display:inline-block;background:#f3e8ff;color:#7c3aed;font-size:13px;font-weight:700;padding:6px 16px;border-radius:999px;font-family:system-ui,sans-serif">${content.text || 'Badge'}</span></div>`
    },
  },

  // ─── MÉDIAS ───────────────────────────────────────────────────────────────
  {
    type: 'image-simple',
    label: 'Image',
    category: 'media',
    icon: '🖼',
    defaultContent: {
      src: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&auto=format&fit=crop',
      alt: 'Image descriptive',
    },
    defaultStyle: { paddingTop: 24, paddingBottom: 24, paddingLeft: 40, paddingRight: 40 },
    render(content, style) {
      const css = styleToPartialCss(style)
      return `<div style="${css}"><img src="${content.src || 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&auto=format&fit=crop'}" alt="${content.alt || 'Image'}" style="width:100%;border-radius:12px;object-fit:cover;display:block" /></div>`
    },
  },
  {
    type: 'gallery-2col',
    label: 'Galerie 2 colonnes',
    category: 'media',
    icon: '🖼🖼',
    defaultContent: {
      img1: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&auto=format&fit=crop',
      img2: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop',
      img3: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop',
      img4: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&auto=format&fit=crop',
    },
    defaultStyle: { paddingTop: 40, paddingBottom: 40, paddingLeft: 40, paddingRight: 40 },
    render(content, style) {
      const css = styleToPartialCss(style)
      const srcs = [
        content.img1 || 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&auto=format&fit=crop',
        content.img2 || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop',
        content.img3 || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop',
        content.img4 || 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&auto=format&fit=crop',
      ]
      const items = srcs.map((src, n) =>
        `  <div class="gallery-item" style="overflow:hidden;border-radius:10px;cursor:zoom-in"><img src="${src}" alt="Galerie ${n + 1}" style="width:100%;height:260px;object-fit:cover;display:block;transition:transform 0.35s" onmouseover="this.style.transform='scale(1.06)'" onmouseout="this.style.transform=''" /></div>`
      ).join('\n')
      return `<div class="gallery-block" style="${css}"><div class="gallery-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:16px">\n${items}\n</div>${GALLERY_LIGHTBOX_SCRIPT}</div>`
    },
  },
  {
    type: 'gallery-3col',
    label: 'Galerie 3 colonnes',
    category: 'media',
    icon: '🗃️',
    defaultContent: {
      img1: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&auto=format&fit=crop',
      img2: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop',
      img3: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop',
      img4: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&auto=format&fit=crop',
      img5: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop',
      img6: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop',
    },
    defaultStyle: { paddingTop: 40, paddingBottom: 40, paddingLeft: 40, paddingRight: 40 },
    render(content, style) {
      const css = styleToPartialCss(style)
      const srcs = [
        content.img1 || 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&auto=format&fit=crop',
        content.img2 || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop',
        content.img3 || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop',
        content.img4 || 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&auto=format&fit=crop',
        content.img5 || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop',
        content.img6 || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop',
      ]
      const items = srcs.map((src, n) =>
        `  <div class="gallery-item" style="overflow:hidden;border-radius:10px;cursor:zoom-in"><img src="${src}" alt="Photo ${n + 1}" style="width:100%;height:220px;object-fit:cover;display:block;transition:transform 0.35s" onmouseover="this.style.transform='scale(1.06)'" onmouseout="this.style.transform=''" /></div>`
      ).join('\n')
      return `<div class="gallery-block" style="${css}"><div class="gallery-grid" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px">\n${items}\n</div>${GALLERY_LIGHTBOX_SCRIPT}</div>`
    },
  },
  {
    type: 'gallery-4col',
    label: 'Galerie 4 colonnes',
    category: 'media',
    icon: '🏙️',
    defaultContent: {
      img1: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&auto=format&fit=crop',
      img2: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop',
      img3: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop',
      img4: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&auto=format&fit=crop',
      img5: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop',
      img6: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop',
      img7: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=600&auto=format&fit=crop',
      img8: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop',
    },
    defaultStyle: { paddingTop: 40, paddingBottom: 40, paddingLeft: 40, paddingRight: 40 },
    render(content, style) {
      const css = styleToPartialCss(style)
      const srcs = [
        content.img1 || 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&auto=format&fit=crop',
        content.img2 || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop',
        content.img3 || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop',
        content.img4 || 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&auto=format&fit=crop',
        content.img5 || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop',
        content.img6 || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop',
        content.img7 || 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=600&auto=format&fit=crop',
        content.img8 || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop',
      ]
      const items = srcs.map((src, n) =>
        `  <div class="gallery-item" style="overflow:hidden;border-radius:10px;cursor:zoom-in"><img src="${src}" alt="Photo ${n + 1}" style="width:100%;height:180px;object-fit:cover;display:block;transition:transform 0.35s" onmouseover="this.style.transform='scale(1.06)'" onmouseout="this.style.transform=''" /></div>`
      ).join('\n')
      return `<div class="gallery-block" style="${css}"><div class="gallery-grid" style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:12px">\n${items}\n</div>${GALLERY_LIGHTBOX_SCRIPT}</div>`
    },
  },
  {
    type: 'video-embed',
    label: 'Vidéo (YouTube / Vimeo / mp4)',
    category: 'media',
    icon: '▶️',
    defaultContent: {
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      autoplay: 'false',
      muted: 'true',
      loop: 'false',
      controls: 'true',
      ratio: '16/9',
    },
    defaultStyle: { paddingTop: 40, paddingBottom: 40, paddingLeft: 40, paddingRight: 40 },
    render(content, style) {
      const css = styleToPartialCss(style)
      const embed = buildVideoEmbed(content.url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', content)
      return `<div style="${css}">${embed}</div>`
    },
  },

  // ─── BOUTONS ──────────────────────────────────────────────────────────────
  {
    type: 'button-primary',
    label: 'Bouton primaire',
    category: 'buttons',
    icon: '🔵',
    defaultContent: { text: 'Cliquez ici', href: '#' },
    defaultStyle: { paddingTop: 24, paddingBottom: 24, paddingLeft: 40, paddingRight: 40, textAlign: 'center' },
    render(content, style) {
      const css = styleToPartialCss(style)
      const href = normalizeHref(content.href || '#')
      const isExternal = href.startsWith('http://') || href.startsWith('https://')
      const target = content.hrefTarget || (isExternal ? '_blank' : '')
      const targetAttr = target ? ` target="${target}"` : ''
      const relAttr = (target === '_blank' || isExternal) ? ' rel="noopener noreferrer"' : ''
      return `<div style="${css}"><a href="${href}"${targetAttr}${relAttr} style="display:inline-block;background:#7c3aed;color:#fff;font-weight:700;font-size:15px;padding:14px 36px;border-radius:10px;text-decoration:none;font-family:system-ui,sans-serif">${content.text || 'Cliquez ici'}</a></div>`
    },
  },
  {
    type: 'button-outline',
    label: 'Bouton outline',
    category: 'buttons',
    icon: '⭕',
    defaultContent: { text: 'En savoir plus', href: '#' },
    defaultStyle: { paddingTop: 24, paddingBottom: 24, paddingLeft: 40, paddingRight: 40, textAlign: 'center' },
    render(content, style) {
      const css = styleToPartialCss(style)
      const href = normalizeHref(content.href || '#')
      const isExternal = href.startsWith('http://') || href.startsWith('https://')
      const target = content.hrefTarget || (isExternal ? '_blank' : '')
      const targetAttr = target ? ` target="${target}"` : ''
      const relAttr = (target === '_blank' || isExternal) ? ' rel="noopener noreferrer"' : ''
      return `<div style="${css}"><a href="${href}"${targetAttr}${relAttr} style="display:inline-block;background:transparent;color:#7c3aed;font-weight:700;font-size:15px;padding:13px 35px;border-radius:10px;text-decoration:none;border:2px solid #7c3aed;font-family:system-ui,sans-serif">${content.text || 'En savoir plus'}</a></div>`
    },
  },
  {
    type: 'button-group',
    label: 'Groupe de boutons',
    category: 'buttons',
    icon: '⬛⬛',
    defaultContent: { text1: 'Commencer', href1: '#', text2: 'En savoir plus', href2: '#' },
    defaultStyle: { paddingTop: 24, paddingBottom: 24, paddingLeft: 40, paddingRight: 40, textAlign: 'center' },
    render(content, style) {
      const css = styleToPartialCss(style)
      const href1 = normalizeHref(content.href1 || '#')
      const href2 = normalizeHref(content.href2 || '#')
      const isExt1 = href1.startsWith('http://') || href1.startsWith('https://')
      const isExt2 = href2.startsWith('http://') || href2.startsWith('https://')
      const t1 = content.href1Target || (isExt1 ? '_blank' : '')
      const t2 = content.href2Target || (isExt2 ? '_blank' : '')
      const ta1 = t1 ? ` target="${t1}"` : ''
      const ta2 = t2 ? ` target="${t2}"` : ''
      const r1 = (t1 === '_blank' || isExt1) ? ' rel="noopener noreferrer"' : ''
      const r2 = (t2 === '_blank' || isExt2) ? ' rel="noopener noreferrer"' : ''
      return `<div style="${css};display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
  <a href="${href1}"${ta1}${r1} style="display:inline-block;background:#7c3aed;color:#fff;font-weight:700;font-size:15px;padding:14px 36px;border-radius:10px;text-decoration:none;font-family:system-ui,sans-serif">${content.text1 || 'Commencer'}</a>
  <a href="${href2}"${ta2}${r2} style="display:inline-block;background:transparent;color:#7c3aed;font-weight:700;font-size:15px;padding:13px 35px;border-radius:10px;text-decoration:none;border:2px solid #7c3aed;font-family:system-ui,sans-serif">${content.text2 || 'En savoir plus'}</a>
</div>`
    },
  },

  // ─── CARDS ────────────────────────────────────────────────────────────────
  {
    type: 'card-simple',
    label: 'Carte simple',
    category: 'cards',
    icon: '🃏',
    defaultContent: { title: 'Titre de la carte', text: 'Description de votre service ou produit.', cta: 'En savoir plus' },
    defaultStyle: { paddingTop: 40, paddingBottom: 40, paddingLeft: 40, paddingRight: 40 },
    render(content, style) {
      const css = styleToPartialCss(style)
      return `<div style="${css}">
  <div style="border:1px solid #e4e4e7;border-radius:12px;padding:32px;background:#fff;font-family:system-ui,sans-serif">
    <h3 style="font-size:1.25rem;font-weight:700;color:#0a0a0a;margin:0 0 12px">${content.title || 'Titre'}</h3>
    <p style="color:#52525b;line-height:1.6;margin:0 0 20px">${content.text || 'Description'}</p>
    <a href="#" style="color:#7c3aed;font-weight:600;text-decoration:none;font-size:14px">${content.cta || 'En savoir plus'} →</a>
  </div>
</div>`
    },
  },
  {
    type: 'card-service',
    label: 'Carte service',
    category: 'cards',
    icon: '💼',
    defaultContent: { icon: '⚡', title: 'Nom du service', text: 'Description complète de votre service premium.', price: 'À partir de 99€' },
    defaultStyle: { paddingTop: 40, paddingBottom: 40, paddingLeft: 40, paddingRight: 40 },
    render(content, style) {
      const css = styleToPartialCss(style)
      return `<div style="${css}">
  <div style="border:1px solid #e4e4e7;border-radius:16px;padding:36px;background:#fff;text-align:center;font-family:system-ui,sans-serif">
    <div style="font-size:48px;margin-bottom:16px">${content.icon || '⚡'}</div>
    <h3 style="font-size:1.375rem;font-weight:700;color:#0a0a0a;margin:0 0 12px">${content.title || 'Service'}</h3>
    <p style="color:#52525b;line-height:1.6;margin:0 0 20px">${content.text || 'Description du service.'}</p>
    <span style="display:inline-block;background:#f3e8ff;color:#7c3aed;font-weight:700;font-size:14px;padding:8px 20px;border-radius:8px">${content.price || 'Contactez-nous'}</span>
  </div>
</div>`
    },
  },
  {
    type: 'card-testimonial',
    label: 'Carte témoignage',
    category: 'cards',
    icon: '💬',
    defaultContent: {
      text: 'Ce service a complètement transformé notre entreprise. Je recommande vivement à tous !',
      name: 'Marie Leblanc',
      role: 'Directrice Marketing',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b047?w=80&auto=format&fit=crop&q=60',
    },
    defaultStyle: { paddingTop: 24, paddingBottom: 24, paddingLeft: 24, paddingRight: 24 },
    render(content, style) {
      const css = styleToPartialCss(style)
      return `<div style="${css}">
  <div style="border:1px solid #e4e4e7;border-radius:16px;padding:28px;background:#fff;font-family:system-ui,sans-serif">
    <div style="color:#f59e0b;font-size:18px;margin-bottom:16px">⭐⭐⭐⭐⭐</div>
    <p style="color:#18181b;line-height:1.7;margin:0 0 20px;font-style:italic">"${content.text || 'Excellent service !'}"</p>
    <div style="display:flex;align-items:center;gap:12px">
      <img src="${content.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b047?w=80&auto=format&fit=crop&q=60'}" alt="${content.name}" style="width:44px;height:44px;border-radius:50%;object-fit:cover" />
      <div>
        <div style="font-weight:700;color:#0a0a0a;font-size:14px">${content.name || 'Client'}</div>
        <div style="color:#71717a;font-size:12px">${content.role || 'Client satisfait'}</div>
      </div>
    </div>
  </div>
</div>`
    },
  },
  {
    type: 'card-team',
    label: 'Carte équipe',
    category: 'cards',
    icon: '👤',
    defaultContent: {
      name: 'Jean Martin',
      role: 'Directeur Général',
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    },
    defaultStyle: { paddingTop: 32, paddingBottom: 32, paddingLeft: 32, paddingRight: 32, textAlign: 'center' },
    render(content, style) {
      const css = styleToPartialCss(style)
      return `<div style="${css};font-family:system-ui,sans-serif">
  <img src="${content.photo || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop'}" alt="${content.name}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;margin:0 auto 16px;display:block;border:3px solid #7c3aed" />
  <h3 style="font-size:1.125rem;font-weight:700;color:#0a0a0a;margin:0 0 4px">${content.name || 'Membre'}</h3>
  <p style="color:#7c3aed;font-size:14px;font-weight:500;margin:0">${content.role || 'Rôle'}</p>
</div>`
    },
  },

  // ─── SECTIONS PRÊTES ─────────────────────────────────────────────────────
  {
    type: 'features-section',
    label: 'Section fonctionnalités',
    category: 'sections',
    icon: '⭐',
    defaultContent: {
      title: 'Pourquoi nous choisir ?',
      feat1: 'Performance optimale',
      desc1: 'Une vitesse et des performances inégalées pour votre site web.',
      feat2: 'Design magnifique',
      desc2: 'Des designs modernes et personnalisés qui captivent vos visiteurs.',
      feat3: 'Livraison rapide',
      desc3: 'Vos projets livrés dans les délais avec une qualité irréprochable.',
    },
    defaultStyle: {},
    render(content) {
      return `<section style="padding:80px 40px;background:#fafafa;font-family:system-ui,sans-serif">
  <h2 style="text-align:center;font-size:2rem;font-weight:800;color:#0a0a0a;margin:0 0 60px">${content.title || 'Nos avantages'}</h2>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:32px;max-width:1100px;margin:0 auto">
    <div style="text-align:center;padding:36px 28px;background:#fff;border-radius:16px;border:1px solid #e4e4e7">
      <div style="font-size:48px;margin-bottom:16px">⚡</div>
      <h3 style="font-size:1.125rem;font-weight:700;color:#0a0a0a;margin:0 0 10px">${content.feat1 || 'Fonctionnalité 1'}</h3>
      <p style="color:#71717a;line-height:1.6;margin:0;font-size:14px">${content.desc1 || 'Description de la fonctionnalité.'}</p>
    </div>
    <div style="text-align:center;padding:36px 28px;background:#fff;border-radius:16px;border:1px solid #e4e4e7">
      <div style="font-size:48px;margin-bottom:16px">🎨</div>
      <h3 style="font-size:1.125rem;font-weight:700;color:#0a0a0a;margin:0 0 10px">${content.feat2 || 'Fonctionnalité 2'}</h3>
      <p style="color:#71717a;line-height:1.6;margin:0;font-size:14px">${content.desc2 || 'Description de la fonctionnalité.'}</p>
    </div>
    <div style="text-align:center;padding:36px 28px;background:#fff;border-radius:16px;border:1px solid #e4e4e7">
      <div style="font-size:48px;margin-bottom:16px">📦</div>
      <h3 style="font-size:1.125rem;font-weight:700;color:#0a0a0a;margin:0 0 10px">${content.feat3 || 'Fonctionnalité 3'}</h3>
      <p style="color:#71717a;line-height:1.6;margin:0;font-size:14px">${content.desc3 || 'Description de la fonctionnalité.'}</p>
    </div>
  </div>
</section>`
    },
  },
  {
    type: 'testimonials-section',
    label: 'Section témoignages',
    category: 'sections',
    icon: '💬',
    defaultContent: {
      title: 'Ce que disent nos clients',
      t1: 'Service exceptionnel ! L\'équipe est très professionnelle et réactive.',
      n1: 'Sophie Moreau', r1: 'CEO, StartupFR',
      t2: 'Résultats au-delà de nos attentes. Je recommande à 100% !',
      n2: 'Thomas Bernard', r2: 'Directeur Commercial',
      t3: 'Un travail de qualité, livré dans les temps. Parfait !',
      n3: 'Lucie Petit', r3: 'Responsable Marketing',
    },
    defaultStyle: {},
    render(content) {
      return `<section style="padding:80px 40px;background:#fff;font-family:system-ui,sans-serif">
  <h2 style="text-align:center;font-size:2rem;font-weight:800;color:#0a0a0a;margin:0 0 60px">${content.title || 'Témoignages'}</h2>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:1100px;margin:0 auto">
    ${[1,2,3].map(i => `<div style="border:1px solid #e4e4e7;border-radius:16px;padding:28px;background:#fafafa">
      <div style="color:#f59e0b;margin-bottom:14px">⭐⭐⭐⭐⭐</div>
      <p style="color:#18181b;line-height:1.7;margin:0 0 18px;font-style:italic">"${content[`t${i}`] || 'Excellent !'}"</p>
      <div style="font-weight:700;color:#0a0a0a;font-size:14px">${content[`n${i}`] || `Client ${i}`}</div>
      <div style="color:#71717a;font-size:12px;margin-top:4px">${content[`r${i}`] || 'Client'}</div>
    </div>`).join('')}
  </div>
</section>`
    },
  },
  {
    type: 'pricing-section',
    label: 'Section tarifs',
    category: 'sections',
    icon: '💰',
    defaultContent: {
      title: 'Nos tarifs transparents',
      plan1: 'Gratuit', price1: '0€/mois', feat1: 'Jusqu\'à 3 projets\n1 utilisateur\nSupport email',
      plan2: 'Pro', price2: '29€/mois', feat2: 'Projets illimités\n5 utilisateurs\nSupport prioritaire',
      plan3: 'Premium', price3: '99€/mois', feat3: 'Tout illimité\nÉquipe illimitée\nAccount manager',
    },
    defaultStyle: {},
    render(content) {
      const renderPlan = (plan: string, price: string, feat: string, highlighted: boolean) => {
        const features = feat.split('\n').filter(Boolean)
        return `<div style="border:${highlighted ? '2px solid #7c3aed' : '1px solid #e4e4e7'};border-radius:20px;padding:40px 32px;background:${highlighted ? '#f3e8ff' : '#fff'};text-align:center;position:relative">
  ${highlighted ? '<span style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:#7c3aed;color:#fff;font-size:12px;font-weight:700;padding:4px 16px;border-radius:999px">POPULAIRE</span>' : ''}
  <h3 style="font-size:1.25rem;font-weight:700;color:#0a0a0a;margin:0 0 8px">${plan}</h3>
  <div style="font-size:2.5rem;font-weight:800;color:${highlighted ? '#7c3aed' : '#0a0a0a'};margin:0 0 24px">${price}</div>
  <ul style="list-style:none;padding:0;margin:0 0 32px;text-align:left">
    ${features.map(f => `<li style="padding:8px 0;color:#52525b;border-bottom:1px solid #f0f0f0;font-size:14px">✓ ${f}</li>`).join('')}
  </ul>
  <a href="#" style="display:block;background:${highlighted ? '#7c3aed' : '#e4e4e7'};color:${highlighted ? '#fff' : '#0a0a0a'};font-weight:700;padding:14px;border-radius:10px;text-decoration:none;font-size:14px">Choisir ce plan</a>
</div>`
      }
      return `<section style="padding:80px 40px;background:#fafafa;font-family:system-ui,sans-serif">
  <h2 style="text-align:center;font-size:2rem;font-weight:800;color:#0a0a0a;margin:0 0 60px">${content.title || 'Nos tarifs'}</h2>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:1000px;margin:0 auto;align-items:start">
    ${renderPlan(content.plan1||'Gratuit', content.price1||'0€', content.feat1||'3 projets\n1 utilisateur', false)}
    ${renderPlan(content.plan2||'Pro', content.price2||'29€/mois', content.feat2||'Illimité\n5 utilisateurs', true)}
    ${renderPlan(content.plan3||'Premium', content.price3||'99€/mois', content.feat3||'Tout illimité', false)}
  </div>
</section>`
    },
  },
  {
    type: 'stats-section',
    label: 'Section statistiques',
    category: 'sections',
    icon: '📊',
    defaultContent: {
      stat1: '500+', label1: 'Clients satisfaits',
      stat2: '98%', label2: 'Taux de satisfaction',
      stat3: '10 ans', label3: 'D\'expérience',
      stat4: '24/7', label4: 'Support disponible',
    },
    defaultStyle: {},
    render(content) {
      return `<section style="padding:80px 40px;background:linear-gradient(135deg,#7c3aed,#4f46e5);font-family:system-ui,sans-serif">
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:40px;max-width:1000px;margin:0 auto;text-align:center">
    ${[1,2,3,4].map(i => `<div>
      <div style="font-size:2.5rem;font-weight:800;color:#fff;margin-bottom:8px">${content[`stat${i}`] || '100'}</div>
      <div style="font-size:14px;color:rgba(255,255,255,0.8);font-weight:500">${content[`label${i}`] || 'Statistique'}</div>
    </div>`).join('')}
  </div>
</section>`
    },
  },
  {
    type: 'faq-section',
    label: 'Section FAQ',
    category: 'sections',
    icon: '❓',
    defaultContent: {
      title: 'Questions fréquentes',
      q1: 'Comment fonctionne votre service ?', a1: 'Notre service est simple et intuitif. Vous créez votre compte, choisissez votre formule et commencez immédiatement.',
      q2: 'Puis-je annuler à tout moment ?', a2: 'Oui, vous pouvez annuler votre abonnement à tout moment sans frais supplémentaires.',
      q3: 'Proposez-vous un support technique ?', a3: 'Absolument ! Notre équipe support est disponible 7j/7 pour vous aider.',
    },
    defaultStyle: {},
    render(content) {
      const faqs = [1,2,3].map(i => ({ q: content[`q${i}`], a: content[`a${i}`] }))
      return `<section style="padding:80px 40px;background:#fff;font-family:system-ui,sans-serif">
  <h2 style="text-align:center;font-size:2rem;font-weight:800;color:#0a0a0a;margin:0 0 60px">${content.title || 'FAQ'}</h2>
  <div style="max-width:720px;margin:0 auto">
    ${faqs.map((faq, idx) => `<div style="border-bottom:1px solid #e4e4e7;margin-bottom:4px">
      <button onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'block':'none';this.querySelector('span').textContent=this.nextElementSibling.style.display==='block'?'−':'+';" style="width:100%;text-align:left;padding:20px 0;background:none;border:none;cursor:pointer;font-size:1rem;font-weight:600;color:#0a0a0a;display:flex;justify-content:space-between;align-items:center">
        ${faq.q || `Question ${idx+1}`} <span style="font-size:1.5rem;color:#7c3aed">+</span>
      </button>
      <div style="display:none;padding:0 0 20px;color:#52525b;line-height:1.7">${faq.a || 'Réponse ici.'}</div>
    </div>`).join('')}
  </div>
</section>`
    },
  },
  {
    type: 'cta-section',
    label: 'Section CTA',
    category: 'sections',
    icon: '🚀',
    defaultContent: { title: 'Prêt à démarrer votre projet ?', subtitle: 'Rejoignez des milliers de clients satisfaits.', cta: 'Commencer gratuitement', ctaHref: '#' },
    defaultStyle: {},
    render(content) {
      return `<section style="padding:100px 40px;background:linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%);text-align:center;font-family:system-ui,sans-serif">
  <h2 style="font-size:2.5rem;font-weight:800;color:#fff;margin:0 0 16px">${content.title || 'Prêt à démarrer ?'}</h2>
  <p style="font-size:1.2rem;color:rgba(255,255,255,0.85);margin:0 0 40px">${content.subtitle || 'Rejoignez-nous dès aujourd\'hui.'}</p>
  <a href="${content.ctaHref || '#'}" style="display:inline-block;background:#fff;color:#7c3aed;font-weight:800;font-size:16px;padding:18px 48px;border-radius:12px;text-decoration:none">${content.cta || 'Commencer'}</a>
</section>`
    },
  },
  {
    type: 'contact-section',
    label: 'Section contact',
    category: 'sections',
    icon: '📬',
    defaultContent: {
      title: 'Contactez-nous',
      subtitle: 'Notre équipe vous répond sous 24h.',
      email: 'contact@monsite.fr',
      phone: '+33 1 23 45 67 89',
      address: '123 Rue de Paris, 75001 Paris',
    },
    defaultStyle: {},
    render(content) {
      return `<section style="padding:80px 40px;background:#fafafa;font-family:system-ui,sans-serif">
  <div style="max-width:1000px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:start">
    <div>
      <h2 style="font-size:2rem;font-weight:800;color:#0a0a0a;margin:0 0 12px">${content.title || 'Contact'}</h2>
      <p style="color:#52525b;line-height:1.7;margin:0 0 32px">${content.subtitle || 'Contactez-nous.'}</p>
      <div style="display:flex;flex-direction:column;gap:16px">
        <div style="display:flex;gap:12px;align-items:center"><span style="font-size:20px">📧</span><span style="color:#18181b">${content.email || 'contact@site.fr'}</span></div>
        <div style="display:flex;gap:12px;align-items:center"><span style="font-size:20px">📞</span><span style="color:#18181b">${content.phone || '+33 1 23 45 67 89'}</span></div>
        <div style="display:flex;gap:12px;align-items:center"><span style="font-size:20px">📍</span><span style="color:#18181b">${content.address || 'Paris, France'}</span></div>
      </div>
    </div>
    <form style="display:flex;flex-direction:column;gap:16px">
      <input type="text" placeholder="Votre nom" style="padding:12px 16px;border:1px solid #e4e4e7;border-radius:8px;font-size:14px;outline:none" />
      <input type="email" placeholder="Votre email" style="padding:12px 16px;border:1px solid #e4e4e7;border-radius:8px;font-size:14px;outline:none" />
      <textarea placeholder="Votre message" rows="5" style="padding:12px 16px;border:1px solid #e4e4e7;border-radius:8px;font-size:14px;outline:none;resize:none"></textarea>
      <button type="submit" style="background:#7c3aed;color:#fff;font-weight:700;padding:14px;border-radius:8px;border:none;cursor:pointer;font-size:15px">Envoyer le message</button>
    </form>
  </div>
</section>`
    },
  },

  // ─── FORMULAIRES ─────────────────────────────────────────────────────────
  {
    type: 'form-contact',
    label: 'Formulaire contact',
    category: 'forms',
    icon: '📝',
    defaultContent: { title: 'Envoyez-nous un message', submitLabel: 'Envoyer' },
    defaultStyle: { paddingTop: 60, paddingBottom: 60, paddingLeft: 40, paddingRight: 40 },
    render(content, style) {
      const css = styleToPartialCss(style)
      return `<div style="${css};font-family:system-ui,sans-serif">
  <h2 style="font-size:1.5rem;font-weight:700;color:#0a0a0a;margin:0 0 32px;text-align:center">${content.title || 'Contactez-nous'}</h2>
  <form style="max-width:560px;margin:0 auto;display:flex;flex-direction:column;gap:20px">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <input type="text" placeholder="Prénom" style="padding:12px 16px;border:1px solid #e4e4e7;border-radius:8px;font-size:14px" />
      <input type="text" placeholder="Nom" style="padding:12px 16px;border:1px solid #e4e4e7;border-radius:8px;font-size:14px" />
    </div>
    <input type="email" placeholder="Adresse email" style="padding:12px 16px;border:1px solid #e4e4e7;border-radius:8px;font-size:14px" />
    <textarea placeholder="Votre message" rows="5" style="padding:12px 16px;border:1px solid #e4e4e7;border-radius:8px;font-size:14px;resize:none"></textarea>
    <button style="background:#7c3aed;color:#fff;font-weight:700;padding:14px;border-radius:8px;border:none;cursor:pointer;font-size:15px">${content.submitLabel || 'Envoyer'}</button>
  </form>
</div>`
    },
  },

  // ─── EFFETS ───────────────────────────────────────────────────────────────
  {
    type: 'accordion-faq',
    label: 'Accordéon FAQ',
    category: 'effects',
    icon: '📋',
    defaultContent: {
      q1: 'Quelle est votre politique de remboursement ?',
      a1: 'Nous offrons un remboursement complet sous 30 jours si vous n\'êtes pas satisfait.',
      q2: 'Comment fonctionne votre support ?',
      a2: 'Notre support est disponible par email et chat 7j/7, 24h/24.',
      q3: 'Proposez-vous des formations ?',
      a3: 'Oui, nous proposons des formations en ligne et en présentiel.',
      q4: 'Puis-je personnaliser mon abonnement ?',
      a4: 'Bien sûr ! Contactez-nous pour un devis personnalisé selon vos besoins.',
      q5: 'Où sont hébergées mes données ?',
      a5: 'Vos données sont hébergées en Europe, conformément au RGPD.',
    },
    defaultStyle: { paddingTop: 60, paddingBottom: 60, paddingLeft: 40, paddingRight: 40 },
    render(content, style) {
      const css = styleToPartialCss(style)
      const items = [1,2,3,4,5].map(i => ({ q: content[`q${i}`], a: content[`a${i}`] }))
      return `<div style="${css};font-family:system-ui,sans-serif;max-width:720px;margin:0 auto">
  ${items.map((item, idx) => `<div style="border-bottom:1px solid #e4e4e7">
    <button onclick="var el=this.nextElementSibling;el.style.display=el.style.display==='none'?'block':'none';this.querySelector('span').textContent=el.style.display==='block'?'−':'+';" style="width:100%;text-align:left;padding:20px 0;background:none;border:none;cursor:pointer;font-size:0.95rem;font-weight:600;color:#18181b;display:flex;justify-content:space-between;align-items:center">
      ${item.q || `Question ${idx+1}`} <span style="font-size:1.5rem;color:#7c3aed;line-height:1">+</span>
    </button>
    <div style="${idx===0?'display:block':'display:none'};padding:0 0 20px;color:#52525b;line-height:1.7;font-size:14px">${item.a || 'Réponse ici.'}</div>
  </div>`).join('')}
</div>`
    },
  },
  {
    type: 'custom-html',
    label: 'HTML personnalisé',
    category: 'layout',
    icon: '</>',
    defaultContent: { html: '<div style="padding:48px 40px;background:#f8fafc;border:2px dashed #cbd5e1;border-radius:12px;text-align:center;font-family:system-ui,sans-serif"><p style="color:#64748b;font-size:15px;font-weight:600;margin:0">Collez votre HTML ici via le panneau de style →</p></div>' },
    defaultStyle: {},
    render(content) {
      return content.html || ''
    },
  },
  {
    type: 'counter-animated',
    label: 'Compteurs animés',
    category: 'effects',
    icon: '🔢',
    defaultContent: {
      count1: '500', label1: 'Clients',
      count2: '1200', label2: 'Projets',
      count3: '98', label3: '% Satisfaction',
      count4: '10', label4: 'Années',
    },
    defaultStyle: {},
    render(content) {
      return `<section style="padding:80px 40px;background:#0a0a0a;font-family:system-ui,sans-serif">
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:40px;max-width:900px;margin:0 auto;text-align:center">
    ${[1,2,3,4].map(i => `<div class="counter-item">
      <div class="counter-value" data-target="${content[`count${i}`]||'0'}" style="font-size:3rem;font-weight:800;color:#7c3aed">0</div>
      <div style="font-size:14px;color:#a1a1aa;margin-top:8px;font-weight:500">${content[`label${i}`]||'Stat'}</div>
    </div>`).join('')}
  </div>
  <script>
  (function(){
    var items=document.querySelectorAll('.counter-value');
    var started=false;
    function animateCounters(){
      if(started)return;started=true;
      items.forEach(function(el){
        var target=parseInt(el.dataset.target)||0;
        var current=0;
        var step=Math.ceil(target/60);
        var timer=setInterval(function(){
          current=Math.min(current+step,target);
          el.textContent=current;
          if(current>=target)clearInterval(timer);
        },16);
      });
    }
    var observer=new IntersectionObserver(function(entries){
      if(entries[0].isIntersecting)animateCounters();
    },{threshold:0.3});
    var section=document.currentScript.closest('section');
    if(section)observer.observe(section);
  })();
  </script>
</section>`
    },
  },

  // ─── HTML BRUT ───────────────────────────────────────────────────────────────
  {
    type: 'html-embed',
    label: 'HTML importé',
    category: 'layout',
    icon: '📄',
    defaultContent: { html: '<section style="padding:60px 40px;font-family:system-ui,sans-serif"><p>Collez votre HTML ici</p></section>' },
    defaultStyle: {},
    render(content) {
      return content.html || '<div style="padding:40px;color:#a1a1aa;text-align:center;font-family:system-ui">Section vide</div>'
    },
  },
]
