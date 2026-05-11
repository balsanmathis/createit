import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateWebsite } from '@/lib/claude'
import { TOKEN_COST_GENERATE, PLAN_TOKEN_LIMITS } from '@/types'

export const maxDuration = 300

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'balsanmathis08@gmail.com'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const isAdmin = user.email === ADMIN_EMAIL

    if (!isAdmin) {
      // Fetch user token balance
      const { data: profile } = await supabase
        .from('users')
        .select('tokens_used, tokens_limit, plan')
        .eq('id', user.id)
        .single()

      const tokensUsed  = profile?.tokens_used  ?? 0
      const tokensLimit = profile?.tokens_limit ?? PLAN_TOKEN_LIMITS.free
      const plan        = profile?.plan         ?? 'free'

      if (tokensUsed + TOKEN_COST_GENERATE > tokensLimit) {
        const isPaidPlan = plan !== 'free' && plan !== null
        const error = isPaidPlan
          ? `Tokens insuffisants. Vous avez utilisé ${tokensUsed.toLocaleString()}/${tokensLimit.toLocaleString()} tokens ce mois.`
          : 'Vous avez épuisé vos tokens gratuits. Choisissez un plan pour continuer.'
        return NextResponse.json({ error, needsUpgrade: true }, { status: 403 })
      }
    }

    const { prompt, name } = await request.json()

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Le prompt est requis' }, { status: 400 })
    }

    const htmlContent = await generateWebsite(prompt)

    const { data: site, error: siteError } = await supabase
      .from('sites')
      .insert({
        user_id: user.id,
        name: name || `Site ${new Date().toLocaleDateString('fr-FR')}`,
        prompt: prompt.trim(),
        html_content: htmlContent,
      })
      .select()
      .single()

    if (siteError) throw siteError

    // Deduct tokens (skip for admin)
    if (!isAdmin) {
      await supabase.rpc('increment_tokens_used', {
        user_id: user.id,
        amount: TOKEN_COST_GENERATE,
      }).then(({ error }) => {
        if (error) {
          // Fallback if RPC doesn't exist yet
          return supabase
            .from('users')
            .select('tokens_used')
            .eq('id', user.id)
            .single()
            .then(({ data }) => supabase
              .from('users')
              .update({ tokens_used: (data?.tokens_used ?? 0) + TOKEN_COST_GENERATE })
              .eq('id', user.id)
            )
        }
      })
    }

    return NextResponse.json({ siteId: site.id, success: true })
  } catch (error) {
    console.error('Generate error:', error)
    return NextResponse.json({ error: 'Erreur lors de la génération' }, { status: 500 })
  }
}
