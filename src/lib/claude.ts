import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `Tu es un expert développeur web. Génère un site HTML5 COMPLET et VISIBLE en un seul fichier.

ORDRE D'ÉCRITURE OBLIGATOIRE :
1. <!DOCTYPE html><html lang="fr"><head> avec <style> COMPACT (max 80 lignes de CSS)
2. </head><body> — IMPÉRATIF : écris <body> rapidement après le CSS
3. Toutes les sections avec du VRAI contenu
4. </body></html> — TOUJOURS en dernier

CSS COMPACT (80 lignes max) :
- :root avec 4-5 variables couleur
- Reset 3 lignes : * { box-sizing:border-box; margin:0; padding:0; }
- Navigation, hero, sections, footer
- Media query mobile simple (max-width:768px)
- hover sur boutons : transform translateY(-2px), transition 0.2s
- PAS de @keyframes complexes, PAS d'animations CSS élaborées

SECTIONS SELON LE TYPE :

Restaurant/Commerce :
- Navbar fixe avec logo + liens
- Hero plein écran avec titre et CTA
- Menu/Produits avec grille 3 colonnes et prix
- À propos / Histoire
- Témoignages (3 clients)
- Contact/Réservation avec formulaire
- Footer avec infos

Portfolio/Agence :
- Navbar avec liens
- Hero avec titre et baseline
- Services en cards (3-4)
- Réalisations en grille
- Témoignages
- Contact + formulaire
- Footer

SaaS/Tech :
- Navbar + CTA
- Hero avec proposition de valeur
- Features (3-6 en grille)
- Pricing 3 colonnes
- FAQ simple
- Footer

CONTENU :
- Réaliste et français (noms, adresses, prix cohérents)
- Pas de lorem ipsum
- Téléphones 0X XX XX XX XX

IMAGES : placeholders CSS — dégradés colorés (pas de balises <img>)

JAVASCRIPT : smooth scroll + hamburger mobile uniquement (20 lignes max)

FONTS : system-ui, -apple-system, 'Segoe UI', sans-serif

RÈGLE ABSOLUE :
- Commence TOUJOURS par <!DOCTYPE html>
- Écris </head><body> après maximum 80 lignes de CSS
- Le contenu visible doit être présent
- Finit TOUJOURS par </body></html>
- JAMAIS de markdown, JAMAIS de backticks`

function stripFences(text: string): string {
  let t = text.trim()
  if (t.startsWith('```html')) t = t.slice(7)
  else if (t.startsWith('```')) t = t.slice(3)
  if (t.endsWith('```')) t = t.slice(0, -3)
  return t.trim()
}

function isClosed(html: string): boolean {
  return /<\/html>/i.test(html)
}

// Smart force-close: detects where we were cut and closes properly
function forceClose(html: string): string {
  if (isClosed(html)) return html

  let result = html

  // Close unclosed <style> block if inside one
  const styleOpens  = (result.match(/<style[^>]*>/gi)  || []).length
  const styleCloses = (result.match(/<\/style>/gi)      || []).length
  if (styleOpens > styleCloses) {
    result += '\n}</style>'
  }

  // Close unclosed <script> block if inside one
  const scriptOpens  = (result.match(/<script[^>]*>/gi)  || []).length
  const scriptCloses = (result.match(/<\/script>/gi)      || []).length
  if (scriptOpens > scriptCloses) {
    result += '\n}</script>'
  }

  const hasBodyOpen  = /<body[\s>]/i.test(result)
  const hasBodyClose = /<\/body>/i.test(result)

  if (!hasBodyOpen) {
    // Was cut before <body> — close head and add minimal body
    const hasHeadClose = /<\/head>/i.test(result)
    if (!hasHeadClose) result += '\n</head>'
    result += '\n<body style="font-family:system-ui,sans-serif;padding:2rem">'
    result += '\n<p style="color:#666">Site partiellement généré. Relancez la génération pour un résultat complet.</p>'
    result += '\n</body>'
  } else if (!hasBodyClose) {
    result += '\n</body>'
  }

  result += '\n</html>'
  return result
}

async function streamCall(
  anthropic: Anthropic,
  params: Parameters<typeof anthropic.messages.stream>[0],
): Promise<{ text: string; stopReason: string }> {
  const stream = anthropic.messages.stream(params)
  const msg = await stream.finalMessage()
  const block = msg.content[0]
  const raw = block.type === 'text' ? block.text : ''
  return { text: stripFences(raw), stopReason: msg.stop_reason ?? 'end_turn' }
}

export async function generateWebsite(prompt: string): Promise<string> {
  return generateWebsiteStreaming(prompt, () => {})
}

// Leave 8s for Supabase save before Vercel Hobby's 60s hard limit
const VERCEL_TIMEOUT_MS = 50_000

export async function generateWebsiteStreaming(
  prompt: string,
  onChunk: (totalChars: number) => void,
): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  const deadline = Date.now() + VERCEL_TIMEOUT_MS

  let raw = ''
  let timedOut = false

  for await (const event of anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      raw += event.delta.text
      onChunk(raw.length)
    }
    if (Date.now() > deadline) {
      timedOut = true
      console.warn('[claude] deadline hit, stopping stream early')
      break
    }
  }

  let html = stripFences(raw)
  console.log(`[claude] ${html.length} chars | closed=${isClosed(html)} | timedOut=${timedOut} | hasBody=${/<body[\s>]/i.test(html)}`)

  // Continuation pass only if time remains and HTML is not closed
  if (!isClosed(html) && !timedOut && Date.now() + 15_000 < deadline) {
    const tail = html.slice(-400)
    const continueMsg =
      `Le HTML est incomplet. Termine-le — ferme toutes les balises ouvertes et finis par </body></html>. ` +
      `UNIQUEMENT la suite du code, sans rien répéter. Reprise : ${tail}`

    for await (const event of anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: prompt },
        { role: 'assistant', content: html },
        { role: 'user', content: continueMsg },
      ],
    })) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        html += event.delta.text
        onChunk(html.length)
      }
      if (Date.now() > deadline) break
    }
  }

  html = forceClose(html)
  console.log(`[claude] final | ${html.length} chars | hasBody=${/<body[\s>]/i.test(html)} | closed=${isClosed(html)}`)

  return html.trim()
}

const MODIFY_SYSTEM = `Tu es un expert développeur web. Tu reçois un site HTML complet et des instructions de modification.
RÈGLES :
- Applique EXACTEMENT les modifications demandées
- Retourne UNIQUEMENT le HTML complet (commence par <!DOCTYPE html>, termine par </html>)
- Conserve tout le contenu existant sauf ce qui est explicitement modifié
- Garde les mêmes styles, animations et structure sauf si demandé autrement
- Le HTML retourné doit être complet et valide`

export async function modifyWebsite(currentHtml: string, instruction: string): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  const htmlSnippet = currentHtml.length > 80_000
    ? currentHtml.slice(0, 40_000) + '\n<!-- ... -->\n' + currentHtml.slice(-10_000)
    : currentHtml

  const { text, stopReason } = await streamCall(anthropic, {
    model: 'claude-sonnet-4-6',
    max_tokens: 16000,
    system: MODIFY_SYSTEM,
    messages: [{
      role: 'user',
      content: `HTML actuel :\n\`\`\`html\n${htmlSnippet}\n\`\`\`\n\nModifications à apporter : ${instruction}`,
    }],
  })

  let html = text
  console.log(`[claude:modify] ${html.length} chars | stop=${stopReason} | closed=${isClosed(html)}`)

  html = forceClose(html)
  return html.trim()
}
