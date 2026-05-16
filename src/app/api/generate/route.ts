import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateWebsiteStreaming } from '@/lib/claude'
import { TOKEN_COST_GENERATE, PLAN_TOKEN_LIMITS } from '@/types'

export const maxDuration = 300

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'balsanmathis08@gmail.com'

const ULTRA_SYSTEM_PROMPT = `RÈGLE NUMÉRO 1 ABSOLUE : Tu DOIS terminer par </body></html>. Si tu manques de place, raccourcis CHAQUE section mais termine TOUJOURS le fichier HTML. Un fichier incomplet est un ÉCHEC total.

Tu es un expert développeur web. Génère un site web exceptionnel de qualité maximale. Design premium digne d'une agence haut de gamme. Animations CSS complexes, micro-interactions sur chaque élément, contenu ultra-détaillé et réaliste, sections très complètes. Chaque section doit être développée au maximum. C'est le niveau de qualité le plus élevé possible.
RÈGLES ABSOLUES :
- Commence TOUJOURS par <!DOCTYPE html><html lang="fr">
- Termine TOUJOURS par </body></html> — OBLIGATOIRE
- Tout le CSS dans <style>, tout le JS dans <script>
- Zero dépendance externe — system fonts uniquement
- NE T'ARRÊTE JAMAIS avant </html>`

const QUALITY_CONFIG: Record<string, { maxTokens: number; tokenCost: number; systemPrompt?: string }> = {
  rapide:   { maxTokens: 4_000,  tokenCost: 1 * TOKEN_COST_GENERATE },
  standard: { maxTokens: 8_000,  tokenCost: 2 * TOKEN_COST_GENERATE },
  premium:  { maxTokens: 16_000, tokenCost: 4 * TOKEN_COST_GENERATE },
  ultra:    { maxTokens: 32_000, tokenCost: 8 * TOKEN_COST_GENERATE, systemPrompt: ULTRA_SYSTEM_PROMPT },
}

export async function POST(request: Request) {
  // Auth check first
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // Parse body early (quality affects token cost check)
  const body = await request.json()
  const { prompt, name, quality = 'standard' } = body

  if (!prompt?.trim()) {
    return NextResponse.json({ error: 'Le prompt est requis' }, { status: 400 })
  }

  const qualityConfig = QUALITY_CONFIG[quality] ?? QUALITY_CONFIG['standard']
  const isAdmin = user.email === ADMIN_EMAIL

  if (!isAdmin) {
    const { data: profile } = await supabase
      .from('users')
      .select('tokens_used, tokens_limit, plan')
      .eq('id', user.id)
      .single()

    const tokensUsed  = profile?.tokens_used  ?? 0
    const tokensLimit = profile?.tokens_limit ?? PLAN_TOKEN_LIMITS.free
    const plan        = profile?.plan         ?? 'free'

    if (tokensUsed + qualityConfig.tokenCost > tokensLimit) {
      const isPaidPlan = plan !== 'free' && plan !== null
      const error = isPaidPlan
        ? `Tokens insuffisants. Vous avez utilisé ${tokensUsed.toLocaleString()}/${tokensLimit.toLocaleString()} tokens ce mois.`
        : 'Vous avez épuisé vos tokens gratuits. Choisissez un plan pour continuer.'
      return NextResponse.json({ error, needsUpgrade: true }, { status: 403 })
    }
  }

  const userId   = user.id
  const siteName = name || `Site ${new Date().toLocaleDateString('fr-FR')}`

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (data: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch { /* client disconnected */ }
      }

      try {
        // 1. Generate HTML
        const htmlContent = await generateWebsiteStreaming(prompt.trim(), (chars) => {
          emit({ type: 'progress', chars })
        }, {
          maxTokens: qualityConfig.maxTokens,
          systemPrompt: qualityConfig.systemPrompt,
        })

        console.log(`[generate] HTML ready — ${htmlContent.length} chars, quality=${quality}, saving…`)

        // 2. Save to Supabase
        const { data: site, error: siteError } = await supabase
          .from('sites')
          .insert({
            user_id: userId,
            name: siteName,
            prompt: prompt.trim(),
            html_content: htmlContent,
          })
          .select('id')
          .single()

        if (siteError) {
          console.error('[generate] Supabase insert error:', siteError)
          emit({ type: 'error', message: 'Erreur lors de la sauvegarde du site.' })
          controller.close()
          return
        }

        console.log(`[generate] Site saved — id=${site.id}`)

        // 3. Deduct tokens
        if (!isAdmin) {
          const { error: rpcError } = await supabase.rpc('increment_tokens_used', {
            user_id: userId,
            amount: qualityConfig.tokenCost,
          })
          if (rpcError) {
            const { data: current } = await supabase
              .from('users')
              .select('tokens_used')
              .eq('id', userId)
              .single()
            await supabase
              .from('users')
              .update({ tokens_used: (current?.tokens_used ?? 0) + qualityConfig.tokenCost })
              .eq('id', userId)
          }
        }

        emit({ type: 'done', siteId: site.id })
        controller.close()
      } catch (err) {
        console.error('[generate] Unexpected error:', err)
        emit({ type: 'error', message: 'Erreur lors de la génération.' })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
