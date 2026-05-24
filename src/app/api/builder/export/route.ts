import { NextResponse } from 'next/server'
import JSZip from 'jszip'
import { BLOCK_DEFS } from '@/lib/builder/blocks'
import type { Block } from '@/lib/builder/types'

const ANIMATION_CSS = `
/* ─── Keyframes ──────────────────────────────────────────────── */
@keyframes fadeIn        { from { opacity:0 } to { opacity:1 } }
@keyframes fadeInDown    { from { opacity:0; transform:translateY(-30px) } to { opacity:1; transform:none } }
@keyframes fadeInLeft    { from { opacity:0; transform:translateX(-30px) } to { opacity:1; transform:none } }
@keyframes fadeInRight   { from { opacity:0; transform:translateX(30px)  } to { opacity:1; transform:none } }
@keyframes slideUp       { from { opacity:0; transform:translateY(40px)  } to { opacity:1; transform:none } }
@keyframes slideLeft     { from { opacity:0; transform:translateX(40px)  } to { opacity:1; transform:none } }
@keyframes slideRight    { from { opacity:0; transform:translateX(-40px) } to { opacity:1; transform:none } }
@keyframes zoomIn        { from { opacity:0; transform:scale(0.85) } to { opacity:1; transform:none } }
@keyframes zoomOut       { from { opacity:0; transform:scale(1.15) } to { opacity:1; transform:none } }
@keyframes flipX         { from { opacity:0; transform:perspective(400px) rotateX(90deg) } to { opacity:1; transform:none } }
@keyframes flipY         { from { opacity:0; transform:perspective(400px) rotateY(90deg) } to { opacity:1; transform:none } }
@keyframes bounce        { 0%,100%{ transform:translateY(0) } 30%{ transform:translateY(-24px) } 60%{ transform:translateY(-12px) } }
@keyframes swing         { 20%{ transform:rotate(12deg) } 40%{ transform:rotate(-10deg) } 60%{ transform:rotate(6deg) } 80%{ transform:rotate(-4deg) } 100%{ transform:rotate(0) } }
@keyframes shake         { 0%,100%{ transform:translateX(0) } 20%,60%{ transform:translateX(-8px) } 40%,80%{ transform:translateX(8px) } }
@keyframes pulse         { 0%,100%{ transform:scale(1) } 50%{ transform:scale(1.06) } }
@keyframes heartbeat     { 0%,100%{ transform:scale(1) } 14%{ transform:scale(1.15) } 28%{ transform:scale(1) } 42%{ transform:scale(1.15) } 70%{ transform:scale(1) } }
@keyframes rubberBand    { 0%,100%{ transform:scale(1,1) } 30%{ transform:scale(1.25,0.75) } 40%{ transform:scale(0.75,1.25) } 60%{ transform:scale(1.15,0.85) } 80%{ transform:scale(0.95,1.05) } }
@keyframes tada          { 0%,100%{ transform:scale(1) } 10%,20%{ transform:scale(0.9) rotate(-3deg) } 30%,50%,70%,90%{ transform:scale(1.1) rotate(3deg) } 40%,60%,80%{ transform:scale(1.1) rotate(-3deg) } }
@keyframes float         { 0%,100%{ transform:translateY(0) } 50%{ transform:translateY(-12px) } }
@keyframes spin          { from{ transform:rotate(0deg) } to{ transform:rotate(360deg) } }
@keyframes ping          { 0%{ transform:scale(1); opacity:1 } 75%,100%{ transform:scale(1.5); opacity:0 } }
@keyframes shimmer       { 0%{ background-position:-200% center } 100%{ background-position:200% center } }

/* ─── Entrance animation base ──────────────────────────────── */
[data-anim] {
  animation-fill-mode: both;
  animation-play-state: paused;
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
[data-anim].anim-visible { animation-play-state: running; }

[data-anim="fadeIn"].anim-visible        { animation-name: fadeIn; }
[data-anim="fadeInDown"].anim-visible    { animation-name: fadeInDown; }
[data-anim="fadeInLeft"].anim-visible    { animation-name: fadeInLeft; }
[data-anim="fadeInRight"].anim-visible   { animation-name: fadeInRight; }
[data-anim="slideUp"].anim-visible       { animation-name: slideUp; }
[data-anim="slideLeft"].anim-visible     { animation-name: slideLeft; }
[data-anim="slideRight"].anim-visible    { animation-name: slideRight; }
[data-anim="zoomIn"].anim-visible        { animation-name: zoomIn; }
[data-anim="zoomOut"].anim-visible       { animation-name: zoomOut; }
[data-anim="flipX"].anim-visible         { animation-name: flipX; }
[data-anim="flipY"].anim-visible         { animation-name: flipY; }
[data-anim="bounce"].anim-visible        { animation-name: bounce; }
[data-anim="swing"].anim-visible         { animation-name: swing; animation-transform-origin: top center; }
[data-anim="shake"].anim-visible         { animation-name: shake; }
[data-anim="pulse"].anim-visible         { animation-name: pulse; animation-iteration-count: infinite; }
[data-anim="heartbeat"].anim-visible     { animation-name: heartbeat; animation-iteration-count: infinite; }
[data-anim="rubberBand"].anim-visible    { animation-name: rubberBand; }
[data-anim="tada"].anim-visible          { animation-name: tada; }

/* Continuous: always run */
[data-anim="float"] { animation-name: float; animation-iteration-count: infinite; animation-timing-function: ease-in-out; animation-play-state: running; }
[data-anim="spin"]  { animation-name: spin;  animation-iteration-count: infinite; animation-timing-function: linear; animation-play-state: running; }
[data-anim="ping"]  { animation-name: ping;  animation-iteration-count: infinite; animation-play-state: running; }
[data-anim="shimmer"] { animation-name: shimmer; animation-iteration-count: infinite; animation-timing-function: linear; animation-play-state: running; }

/* ─── Hover effects ──────────────────────────────────────────── */
.bh-lift:hover    { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.15); transition: all 0.25s; }
.bh-grow:hover    { transform: scale(1.05); transition: transform 0.25s; }
.bh-shrink:hover  { transform: scale(0.95); transition: transform 0.25s; }
.bh-glow:hover    { box-shadow: 0 0 0 3px rgba(124,58,237,0.4), 0 8px 24px rgba(124,58,237,0.2); transition: box-shadow 0.25s; }
.bh-tilt:hover    { transform: perspective(600px) rotateX(3deg) rotateY(3deg); transition: transform 0.25s; }
.bh-underline     { position: relative; }
.bh-underline::after { content:''; position:absolute; bottom:0; left:0; width:0; height:2px; background:currentColor; transition: width 0.3s; }
.bh-underline:hover::after { width: 100%; }
`

const ANIMATION_JS = `
(function() {
  var els = document.querySelectorAll('[data-anim]');
  var loadEls = [];
  var scrollEls = [];

  els.forEach(function(el) {
    var trigger = el.dataset.animTrigger || 'scroll';
    el.style.transitionDuration = (el.dataset.animDuration || '0.6') + 's';
    el.style.transitionDelay = (el.dataset.animDelay || '0') + 's';
    if (trigger === 'load') loadEls.push(el);
    else scrollEls.push(el);
  });

  // Load animations
  requestAnimationFrame(function() {
    loadEls.forEach(function(el) { el.classList.add('anim-visible'); });
  });

  // Scroll animations
  if (scrollEls.length > 0 && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('anim-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    scrollEls.forEach(function(el) { observer.observe(el); });
  } else {
    scrollEls.forEach(function(el) { el.classList.add('anim-visible'); });
  }
})();
`

export async function POST(request: Request) {
  try {
    const { blocks, name }: { blocks: Block[]; name: string } = await request.json()

    if (!Array.isArray(blocks)) {
      return NextResponse.json({ error: 'Blocks invalides' }, { status: 400 })
    }

    // Generate HTML for each block
    const bodyParts = blocks.map(block => {
      const def = BLOCK_DEFS.find(d => d.type === block.type)
      if (!def) return `<!-- Unknown block: ${block.type} -->`

      const html = def.render(block.content, block.style)
      const { type, duration, delay, trigger, hover } = block.animation
      const anchor = block.style.anchor

      const hoverClass = hover && hover !== 'none' ? ` bh-${hover}` : ''
      const idAttr = anchor ? ` id="${anchor}"` : ''

      if (type === 'none' && !hoverClass && !anchor) return html
      if (type === 'none' && !hoverClass) return html.replace(/^(<\w+)/, `$1${idAttr}`)
      if (type === 'none') return `<div${idAttr} class="${hoverClass.trim()}">${html}</div>`

      return `<div${idAttr} class="${hoverClass.trim()}" data-anim="${type}" data-anim-duration="${duration}" data-anim-delay="${delay}" data-anim-trigger="${trigger}">${html}</div>`
    }).join('\n')

    const fullHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="${name}">
<title>${name}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    margin: 0;
    font-family: system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  img { max-width: 100%; height: auto; display: block; }
  a { text-decoration: none; }

${ANIMATION_CSS}
</style>
</head>
<body>

${bodyParts}

<script>
${ANIMATION_JS}
</script>
</body>
</html>`

    // Create ZIP
    const zip = new JSZip()
    zip.file('index.html', fullHtml)
    zip.file('README.txt', `Site: ${name}\nGénéré par CreateIt Builder\nhttps://createit.app\n\nPour publier ce site, uploadez le dossier sur votre hébergeur web.`)

    const zipBuffer = await zip.generateAsync({ type: 'arraybuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } })

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${name.replace(/[^a-z0-9]/gi, '-')}.zip"`,
      },
    })
  } catch (err) {
    console.error('Export error:', err)
    return NextResponse.json({ error: 'Erreur export' }, { status: 500 })
  }
}
