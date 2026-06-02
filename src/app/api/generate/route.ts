import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateWebsiteStreaming } from '@/lib/claude'
import { TOKEN_COST_GENERATE } from '@/types'
import { checkRateLimit } from '@/lib/ratelimit'

export const maxDuration = 300

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'balsanmathis08@gmail.com'
const HAIKU = 'claude-haiku-4-5-20251001'

const QUALITY_CONFIG: Record<string, { maxTokens: number; tokenCost: number; model: string }> = {
  rapide:   { maxTokens: 10_000, tokenCost: 1 * TOKEN_COST_GENERATE, model: HAIKU },
  standard: { maxTokens: 20_000, tokenCost: 2 * TOKEN_COST_GENERATE, model: HAIKU },
  premium:  { maxTokens: 32_000, tokenCost: 4 * TOKEN_COST_GENERATE, model: HAIKU },
  ultra:    { maxTokens: 46_000, tokenCost: 8 * TOKEN_COST_GENERATE, model: HAIKU },
}

// Refund tokens after a failed generation
async function refundTokens(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  amount: number,
) {
  try {
    await supabase.rpc('increment_tokens_used', { p_user_id: userId, p_amount: -amount })
  } catch (err) {
    console.error('[generate] refund failed:', err)
  }
}

export async function POST(request: Request) {
  // Honeypot: silently absorb known bot headers
  if (request.headers.get('x-honeypot')) {
    return NextResponse.json({ ok: true })
  }

  // Parse + validate body
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 })
  }

  const { prompt, name, quality = 'standard' } = body

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return NextResponse.json({ error: 'Le prompt est requis' }, { status: 400 })
  }
  if (prompt.trim().length > 10000) {
    return NextResponse.json({ error: 'Le prompt ne peut pas dépasser 10000 caractères' }, { status: 400 })
  }
  if (name !== undefined && (typeof name !== 'string' || name.length > 200)) {
    return NextResponse.json({ error: 'Nom invalide' }, { status: 400 })
  }

  const qualityConfig = QUALITY_CONFIG[quality as string] ?? QUALITY_CONFIG['standard']

  // ── Rate limit by IP (fail-closed) ────────────────────────────────────────
  // Prefer x-real-ip (set by Vercel edge, not spoofable) over x-forwarded-for
  const ip =
    request.headers.get('x-real-ip') ??
    (request.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim()

  const ipAllowed = await checkRateLimit('generate:ip', ip, 5, '1 m', false)
  if (!ipAllowed) {
    return NextResponse.json({ error: 'Trop de tentatives, réessayez dans 1 minute.' }, { status: 429 })
  }

  // ── Auth ───────────────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // ── Email verification required ────────────────────────────────────────────
  if (!user.email_confirmed_at) {
    return NextResponse.json(
      { error: 'Veuillez vérifier votre adresse email avant de générer un site.' },
      { status: 403 },
    )
  }

  // ── Rate limit by user ID (fail-closed, stricter than IP) ─────────────────
  const userAllowed = await checkRateLimit('generate:user', user.id, 3, '1 m', false)
  if (!userAllowed) {
    return NextResponse.json({ error: 'Trop de générations simultanées. Réessayez dans 1 minute.' }, { status: 429 })
  }

  const isAdmin = user.email === ADMIN_EMAIL
  const userId  = user.id
  const siteName = ((name as string | undefined) ?? '').trim().slice(0, 200) || `Site ${new Date().toLocaleDateString('fr-FR')}`
  const sanitizedPrompt = (prompt as string).trim()

  // ── Atomic token deduction (BEFORE generation to prevent race conditions) ──
  // The SQL function does check+deduct in a single UPDATE statement.
  // If insufficient tokens → returns success=false → reject immediately.
  if (!isAdmin) {
    const { data: deductRows, error: deductError } = await supabase.rpc('increment_tokens_used', {
      p_user_id: userId,
      p_amount: qualityConfig.tokenCost,
    })

    if (deductError) {
      console.error('[generate] token deduction error:', deductError)
      return NextResponse.json(
        { error: 'Erreur lors de la vérification des tokens. Réessayez.' },
        { status: 500 },
      )
    }

    const result = Array.isArray(deductRows) ? deductRows[0] : deductRows
    if (!result?.success) {
      return NextResponse.json(
        {
          error: 'Tokens insuffisants. Choisissez un plan pour continuer à créer des sites.',
          needsUpgrade: true,
        },
        { status: 403 },
      )
    }
  }

  // ── Stream generation ──────────────────────────────────────────────────────
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

        console.log(`[generate] HTML ready — ${htmlContent.length} chars, quality=${quality}`)

        // 2. Save to Supabase
        const { data: site, error: siteError } = await supabase
          .from('sites')
          .insert({
            user_id: userId,
            name: siteName,
            prompt: sanitizedPrompt,
            html_content: htmlContent,
          })
          .select('id')
          .single()

        if (siteError) {
          console.error('[generate] Supabase insert error:', siteError)
          // Refund tokens since the site was never saved
          if (!isAdmin) await refundTokens(supabase, userId, qualityConfig.tokenCost)
          emit({ type: 'error', message: 'Erreur lors de la sauvegarde du site.' })
          controller.close()
          return
        }

        console.log(`[generate] Site saved — id=${site.id}`)
        emit({ type: 'done', siteId: site.id })
        controller.close()
      } catch (err) {
        console.error('[generate] Unexpected error:', err)
        // Refund tokens on unexpected failure
        if (!isAdmin) await refundTokens(supabase, userId, qualityConfig.tokenCost)
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
