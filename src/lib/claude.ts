import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `RÈGLE NUMÉRO 1 ABSOLUE : Tu DOIS terminer par </body></html>. Si tu manques de place, raccourcis CHAQUE section mais termine TOUJOURS le fichier HTML. Un fichier incomplet est un ÉCHEC total.

Tu es un expert développeur web. Génère un site HTML5 COMPLET en un seul fichier.
RÈGLES ABSOLUES :
- Commence TOUJOURS par <!DOCTYPE html><html lang="fr">
- Termine TOUJOURS par </body></html> — OBLIGATOIRE
- Tout le CSS dans <style>, tout le JS dans <script>
- Zero dépendance externe — system fonts uniquement
- Le site doit être beau, professionnel, avec du vrai contenu
- Animations CSS : fadeIn au scroll, hover sur les cards et boutons
- Responsive mobile avec hamburger menu
- TOUTES les sections demandées doivent être présentes
- Si le contenu risque d'être trop long : raccourcis CHAQUE section mais garde-les TOUTES
- Priorité absolue : finir le fichier HTML correctement plutôt que d'avoir du contenu long
- NE T'ARRÊTE JAMAIS avant </html>`

export interface GenerateOptions {
  maxTokens?: number
  systemPrompt?: string
}

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

function forceClose(html: string): string {
  if (isClosed(html)) return html

  let result = html

  const styleOpens  = (result.match(/<style[^>]*>/gi)  || []).length
  const styleCloses = (result.match(/<\/style>/gi)      || []).length
  if (styleOpens > styleCloses) result += '\n}</style>'

  const scriptOpens  = (result.match(/<script[^>]*>/gi)  || []).length
  const scriptCloses = (result.match(/<\/script>/gi)      || []).length
  if (scriptOpens > scriptCloses) result += '\n}</script>'

  const hasBodyOpen  = /<body[\s>]/i.test(result)
  const hasBodyClose = /<\/body>/i.test(result)

  if (!hasBodyOpen) {
    if (!/<\/head>/i.test(result)) result += '\n</head>'
    result += '\n<body style="font-family:system-ui,sans-serif;padding:2rem">'
    result += '\n<p style="color:#666">Site partiellement généré. Relancez la génération pour un résultat complet.</p>'
    result += '\n</body>'
  } else if (!hasBodyClose) {
    result += '\n</body>'
  }

  result += '\n</html>'
  return result
}

// Build a targeted continuation message based on current HTML state
function getContinueMsg(html: string): string {
  const tail = html.slice(-300)
  const hasBody = /<body[\s>]/i.test(html)

  if (!hasBody) {
    // Model is stuck in <head>/<style> — force it past that
    return `Tu générais un site HTML mais tu n'as pas encore écrit <body>. Contexte actuel : ...${tail}. MAINTENANT : ferme les balises CSS et head en cours si nécessaire (</style></head>), puis génère immédiatement <body> avec tout le contenu du site (navbar, hero, toutes les sections, footer) et termine par </body></html>. Ne répète pas le CSS déjà écrit.`
  }

  // Model is inside <body> — continue normally
  return `Tu générais un site HTML. Voici où tu t'es arrêté : ${tail}. Continue EXACTEMENT depuis cet endroit et termine jusqu'à </body></html>. Ne répète rien du début.`
}

// Total budget for the whole generation (leaves 8s for Supabase save)
const VERCEL_TIMEOUT_MS = 50_000
// First pass is capped so continuations always have time to run
const FIRST_PASS_MS = 20_000

export async function generateWebsite(prompt: string): Promise<string> {
  return generateWebsiteStreaming(prompt, () => {})
}

export async function generateWebsiteStreaming(
  prompt: string,
  onChunk: (totalChars: number) => void,
  options: GenerateOptions = {},
): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  const deadline        = Date.now() + VERCEL_TIMEOUT_MS
  const firstPassLimit  = Date.now() + FIRST_PASS_MS
  const maxTokens   = options.maxTokens   ?? 8000
  const systemToUse = options.systemPrompt ?? SYSTEM_PROMPT

  let html = ''
  let timedOut = false

  // ── Pass 1: capped at FIRST_PASS_MS so continuations always have time ──
  for await (const event of anthropic.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: maxTokens,
    system: systemToUse,
    messages: [{ role: 'user', content: prompt }],
  })) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      html += event.delta.text
      onChunk(html.length)
    }
    if (Date.now() > deadline) { timedOut = true; break }
    if (Date.now() > firstPassLimit) {
      console.warn('[claude] pass 1 time cap hit — handing off to continuation')
      break
    }
  }

  html = stripFences(html)
  console.log(`[claude] pass 1 | ${html.length} chars | closed=${isClosed(html)} | hasBody=${/<body[\s>]/i.test(html)} | timedOut=${timedOut}`)

  // ── Passes 2–6: up to 5 continuation attempts ──
  for (let pass = 0; pass < 5 && !isClosed(html) && !timedOut && Date.now() + 8_000 < deadline; pass++) {
    const continueMsg = getContinueMsg(html)

    for await (const event of anthropic.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      system: systemToUse,
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
      if (Date.now() > deadline) { timedOut = true; break }
    }

    console.log(`[claude] pass ${pass + 2} | ${html.length} chars | closed=${isClosed(html)} | hasBody=${/<body[\s>]/i.test(html)} | timedOut=${timedOut}`)
  }

  // Always guarantee valid HTML before returning
  html = forceClose(html)
  console.log(`[claude] final | ${html.length} chars | closed=${isClosed(html)}`)

  return html.trim()
}

const MODIFY_SYSTEM = `Tu es un expert développeur web. Tu reçois un site HTML complet et des instructions de modification.
RÈGLES :
- Applique EXACTEMENT les modifications demandées
- Retourne UNIQUEMENT le HTML complet (commence par <!DOCTYPE html>, termine par </html>)
- Conserve tout le contenu existant sauf ce qui est explicitement modifié
- Garde les mêmes styles, animations et structure sauf si demandé autrement
- Le HTML retourné doit être complet et valide`

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

export async function modifyWebsite(currentHtml: string, instruction: string): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  const htmlSnippet = currentHtml.length > 80_000
    ? currentHtml.slice(0, 40_000) + '\n<!-- ... -->\n' + currentHtml.slice(-10_000)
    : currentHtml

  const { text, stopReason } = await streamCall(anthropic, {
    model: 'claude-haiku-4-5-20251001',
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
