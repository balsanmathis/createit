import { NextResponse } from 'next/server'
import JSZip from 'jszip'
import { BLOCK_DEFS } from '@/lib/builder/blocks'
import type { Block } from '@/lib/builder/types'

const ANIMATION_CSS = `
/* Builder Animations */
[data-anim] {
  opacity: 0;
  transition-property: opacity, transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
[data-anim].anim-visible { opacity: 1; transform: none !important; }
[data-anim="fadeIn"] { opacity: 0; }
[data-anim="slideUp"] { opacity: 0; transform: translateY(40px); }
[data-anim="slideLeft"] { opacity: 0; transform: translateX(40px); }
[data-anim="slideRight"] { opacity: 0; transform: translateX(-40px); }
[data-anim="zoomIn"] { opacity: 0; transform: scale(0.9); }
[data-anim="bounce"] { opacity: 0; transform: translateY(-20px); }
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
      const { type, duration, delay, trigger } = block.animation

      if (type === 'none') return html

      // Wrap in animation div
      return `<div data-anim="${type}" data-anim-duration="${duration}" data-anim-delay="${delay}" data-anim-trigger="${trigger}">${html}</div>`
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
