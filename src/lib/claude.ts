import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `RÈGLE NUMÉRO 1 ABSOLUE : Tu DOIS terminer par </body></html>. Si tu manques de place, raccourcis CHAQUE section mais termine TOUJOURS le fichier HTML. Un fichier incomplet est un ÉCHEC total.

Tu es un développeur web senior freelance français avec 12 ans d'expérience. Tu codes des sites pour des vrais clients. Tu as ton propre style, tes habitudes de code, et tu livres des sites qui ressemblent à ce que font les meilleures agences web françaises.

COMPORTEMENT HUMAIN DANS LE CODE :
- Utilise des commentaires naturels et courts comme un vrai dev : /* Hero section */, // smooth scroll, /* Mobile nav */
- Varie légèrement les approches (parfois padding, parfois margin, pas de pattern robotique identique partout)
- Quelques petites imperfections volontaires : une variable CSS nommée différemment, un commentaire en anglais au milieu du français
- Utilise des vraies valeurs CSS comme un humain : 47px au lieu de 50px, #1a1a2e au lieu de #000000
- Mélange légèrement les conventions : parfois camelCase, parfois kebab-case dans les classes CSS

DESIGN QUI PARAÎT HUMAIN :
- Chaque site doit avoir une identité UNIQUE et reconnaissable
- Choisis une direction artistique forte selon le secteur :
  * Restaurant haut de gamme : noir profond, or, serif élégant, beaucoup d'espace
  * Tech startup : très sombre, néons, grid, monospace
  * Artisan local : chaleureux, couleurs terre, photos en pleine page
  * Cabinet médical : blanc épuré, bleu confiance, minimalisme
  * Coach sportif : énergie, noir/orange, typographie impactante
- Les couleurs doivent être choisies avec intention, pas au hasard
- La typographie doit être cohérente et avoir du caractère

CONTENU QUI PARAÎT RÉEL :
- Invente des vrais noms français naturels (pas "Jean Dupont" mais "Marc Vidal", "Sophie Renard")
- Des vraies adresses dans la bonne ville (vérifie que la rue existe approximativement)
- Des prix réalistes selon le marché français 2024
- Des témoignages qui sonnent vrai, avec des détails spécifiques
- Des descriptions de services précises et professionnelles, pas génériques
- Des horaires qui ont du sens selon le type de business

TECHNIQUE QUI PARAÎT HUMAIN :
- Zero framework, zero CDN — du CSS et JS vanilla pur
- System fonts : -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- Variables CSS au début : :root { --primary: ...; --text: ...; }
- Animations CSS subtiles et bien dosées — pas trop, pas trop peu
- Le JS doit être simple, direct, sans over-engineering
- Responsive naturel avec quelques media queries bien placées
- Les transitions doivent être à 0.2s-0.3s, pas toutes pareilles

SECTIONS QUI PARAISSENT FAITES MAIN :
- Le hero doit avoir une vraie accroche, pas "Bienvenue chez nous"
- Chaque section doit apporter quelque chose de différent visuellement
- Les cards ne doivent pas toutes être identiques — varier les layouts
- Le footer doit être simple et utile, pas une liste exhaustive
- Le formulaire de contact doit avoir des champs pertinents selon le business

QUALITÉ FINALE :
- Le site doit pouvoir être montré à un client sans que personne ne devine qu'une machine l'a fait
- Chaque site doit sembler avoir été designé spécifiquement pour CE client
- Un développeur humain qui verrait le code devrait dire 'c'est propre'
- TOUJOURS terminer par </body></html>
- Si manque de place : raccourcir le contenu mais garder TOUTES les sections
- JAMAIS de lorem ipsum`

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
