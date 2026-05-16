import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `Tu es un expert développeur web. Génère un site HTML5 COMPLET en un seul fichier.
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

const CONTINUE_MSG = `Continue et termine le HTML précédent. Reprends exactement là où tu t'es arrêté et termine jusqu'à </body></html>. Ne répète rien du début.`

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

// Leave 8s for Supabase save before Vercel Hobby's 60s hard limit
const VERCEL_TIMEOUT_MS = 50_000

export async function generateWebsite(prompt: string): Promise<string> {
  return generateWebsiteStreaming(prompt, () => {})
}

export async function generateWebsiteStreaming(
  prompt: string,
  onChunk: (totalChars: number) => void,
  options: GenerateOptions = {},
): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  const deadline = Date.now() + VERCEL_TIMEOUT_MS
  const maxTokens = options.maxTokens ?? 8000
  const systemToUse = options.systemPrompt ?? SYSTEM_PROMPT

  let html = ''
  let timedOut = false

  // First generation pass
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
    if (Date.now() > deadline) {
      timedOut = true
      console.warn('[claude] deadline hit, stopping stream early')
      break
    }
  }

  html = stripFences(html)
  console.log(`[claude] pass 1 | ${html.length} chars | closed=${isClosed(html)} | timedOut=${timedOut}`)

  // Up to 3 continuation passes if HTML not closed and time remains
  for (let pass = 0; pass < 3 && !isClosed(html) && !timedOut && Date.now() + 10_000 < deadline; pass++) {
    for await (const event of anthropic.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      system: systemToUse,
      messages: [
        { role: 'user', content: prompt },
        { role: 'assistant', content: html },
        { role: 'user', content: CONTINUE_MSG },
      ],
    })) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        html += event.delta.text
        onChunk(html.length)
      }
      if (Date.now() > deadline) {
        timedOut = true
        break
      }
    }
    console.log(`[claude] pass ${pass + 2} | ${html.length} chars | closed=${isClosed(html)} | timedOut=${timedOut}`)
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
