import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateWebsiteStreaming } from '@/lib/claude'
import { TOKEN_COST_GENERATE, PLAN_TOKEN_LIMITS } from '@/types'
import { checkRateLimit } from '@/lib/ratelimit'

export const maxDuration = 300

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'balsanmathis08@gmail.com'

const HAIKU = 'claude-haiku-4-5-20251001'

// Haiku output: $4/1M tokens. Budget per tier (max $0.20/site):
//   rapide  : 10k tokens → ~$0.04   (fast, landing page)
//   standard: 20k tokens → ~$0.08   (site complet)
//   premium : 32k tokens → ~$0.13   (site riche + galerie)
//   ultra   : 46k tokens → ~$0.19   (site de qualité agence)
const QUALITY_CONFIG: Record<string, { maxTokens: number; tokenCost: number; model: string }> = {
  rapide:   { maxTokens: 10_000, tokenCost: 1 * TOKEN_COST_GENERATE, model: HAIKU },
  standard: { maxTokens: 20_000, tokenCost: 2 * TOKEN_COST_GENERATE, model: HAIKU },
  premium:  { maxTokens: 32_000, tokenCost: 4 * TOKEN_COST_GENERATE, model: HAIKU },
  ultra:    { maxTokens: 46_000, tokenCost: 8 * TOKEN_COST_GENERATE, model: HAIKU },
}

export async function POST(request: Request) {
  // Honeypot: silently absorb bot requests
  if (request.headers.get('x-honeypot')) {
    return NextResponse.json({ ok: true })
  }

  // Parse + validate body early (before auth, so clients get meaningful errors)
  const body = await request.json()
  const { prompt, name, quality = 'standard' } = body

  if (!prompt?.trim()) {
    return NextResponse.json({ error: 'Le prompt est requis' }, { status: 400 })
  }
  if (typeof prompt !== 'string' || prompt.trim().length > 5000) {
    return NextResponse.json({ error: 'Le prompt ne peut pas dépasser 5000 caractères' }, { status: 400 })
  }
  if (name && typeof name !== 'string') {
    return NextResponse.json({ error: 'Nom invalide' }, { status: 400 })
  }

  // Rate limiting
  const ip = (request.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim()
  const allowed = await checkRateLimit('generate', ip, 5, '1 m')
  if (!allowed) {
    return NextResponse.json({ error: 'Trop de tentatives, réessayez dans 1 minute' }, { status: 429 })
  }

  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const sanitizedPrompt = prompt.trim()
  const sanitizedName = (name ?? '').trim().slice(0, 200)

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
  const siteName = sanitizedName || `Site ${new Date().toLocaleDateString('fr-FR')}`

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
        const htmlContent = await generateWebsiteStreaming(sanitizedPrompt, (chars) => {
          emit({ type: 'progress', chars })
        }, {
          maxTokens: qualityConfig.maxTokens,
          model: qualityConfig.model,
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
