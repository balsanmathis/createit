import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `Tu es un expert développeur web. Génère un site web HTML5 COMPLET en un seul fichier.
RÈGLES ABSOLUES - AUCUNE EXCEPTION :
- Commence TOUJOURS par <!DOCTYPE html><html lang='fr'>
- Termine TOUJOURS par </body></html> - c'est OBLIGATOIRE
- TOUTES les sections demandées doivent être présentes et complètes
- Zero dépendance externe - tout CSS inline dans <style>
- Zero Google Fonts - utilise Georgia, Arial uniquement
- Animations CSS pures avec @keyframes
- Effets 3D avec CSS transform perspective
- IntersectionObserver JavaScript pour les animations au scroll
- Le site doit être magnifique, professionnel, complet
- NE T'ARRÊTE JAMAIS avant la balise </html>

RÈGLE ABSOLUE : Tu as exactement 16000 tokens pour générer le site complet.
Tu DOIS terminer par </body></html>.
Si le contenu risque d'être trop long, raccourcis chaque section MAIS inclus TOUTES les sections demandées.
Préfère un site plus court mais 100% complet plutôt qu'un site long mais tronqué.
Ne t'arrête JAMAIS avant </html>.`

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
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  const { text: first, stopReason: stop0 } = await streamCall(anthropic, {
    model: 'claude-sonnet-4-6',
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  let html = first
  console.log(`[claude] pass 0 | ${html.length} chars | stop=${stop0} | closed=${isClosed(html)}`)

  for (let pass = 1; pass <= 3 && !isClosed(html); pass++) {
    const tail = html.slice(-500)
    const continueMsg =
      `Le HTML précédent est incomplet. Termine-le maintenant en fermant toutes les balises ouvertes et en terminant par </body></html>. ` +
      `Génère UNIQUEMENT la suite du code HTML, sans rien répéter. ` +
      `Voici où tu t'es arrêté : ${tail}`

    const { text: chunk, stopReason } = await streamCall(anthropic, {
      model: 'claude-sonnet-4-6',
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: prompt },
        { role: 'assistant', content: html },
        { role: 'user', content: continueMsg },
      ],
    })
    html += chunk
    console.log(`[claude] pass ${pass} | +${chunk.length} chars | stop=${stopReason} | closed=${isClosed(html)}`)
  }

  if (!isClosed(html)) {
    if (!/<\/body>/i.test(html)) html += '\n</body>'
    html += '\n</html>'
    console.warn('[claude] HTML force-closed after all passes')
  }

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

  // Limit input to prevent context overflow while keeping enough for context
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

  if (!isClosed(html)) {
    if (!/<\/body>/i.test(html)) html += '\n</body>'
    html += '\n</html>'
  }

  return html.trim()
}
