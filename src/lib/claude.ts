import Anthropic from '@anthropic-ai/sdk'

// ─── System prompts ───────────────────────────────────────────────────────────

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
- NE T'ARRÊTE JAMAIS avant la balise </html>`

const CONTINUE_MSG =
  'Continue exactement où tu t\'es arrêté et termine le HTML jusqu\'à </body></html>. ' +
  'Génère UNIQUEMENT la suite du code HTML, sans rien répéter.'

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Main export ──────────────────────────────────────────────────────────────

export async function generateWebsite(prompt: string): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  // ── Pass 0 : premier appel ──────────────────────────────────────────────
  const { text: first, stopReason: stop0 } = await streamCall(anthropic, {
    model: 'claude-sonnet-4-6',
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  let html = first
  console.log(`[claude] pass 0 | ${html.length} chars | stop=${stop0} | closed=${isClosed(html)}`)

  // ── Passes 1-3 : continuation si HTML incomplet ────────────────────────
  for (let pass = 1; pass <= 3 && !isClosed(html); pass++) {
    const { text: chunk, stopReason } = await streamCall(anthropic, {
      model: 'claude-sonnet-4-6',
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: prompt },
        { role: 'assistant', content: html },
        { role: 'user', content: CONTINUE_MSG },
      ],
    })
    html += chunk
    console.log(`[claude] pass ${pass} | +${chunk.length} chars | stop=${stopReason} | closed=${isClosed(html)}`)
  }

  // ── Fermeture forcée si toujours incomplet ─────────────────────────────
  if (!isClosed(html)) {
    if (!/<\/body>/i.test(html)) html += '\n</body>'
    html += '\n</html>'
    console.warn('[claude] HTML force-closed after all passes')
  }

  return html.trim()
}
