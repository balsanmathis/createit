import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateWebsite } from '@/lib/claude'
import { PLAN_LIMITS } from '@/types'

// Claude API can take up to 3 continuation passes (~3–4 min for complex sites).
// Vercel Pro max is 300s — without this export the function times out at 60s.
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
    let usedCount = 0

    if (!isAdmin) {
      // Fetch any subscription to distinguish "no plan" from "payment failed"
      const { data: anySub } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .single()

      if (!anySub) {
        return NextResponse.json(
          { error: 'Aucun plan actif. Choisissez un plan pour générer des sites.' },
          { status: 403 }
        )
      }

      if (anySub.status !== 'active') {
        const msg = anySub.status === 'past_due' || anySub.status === 'unpaid'
          ? 'Paiement en échec. Mettez à jour votre moyen de paiement dans les paramètres.'
          : 'Abonnement inactif. Choisissez un plan pour continuer.'
        return NextResponse.json({ error: msg }, { status: 403 })
      }

      // Re-fetch full subscription for plan data
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (!subscription) {
        return NextResponse.json(
          { error: 'Aucun plan actif. Choisissez un plan pour générer des sites.' },
          { status: 403 }
        )
      }

      // Check monthly limit
      const { data: profile } = await supabase
        .from('users')
        .select('sites_used_this_month, plan')
        .eq('id', user.id)
        .single()

      const plan = profile?.plan || subscription.plan
      const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || 0
      usedCount = profile?.sites_used_this_month || 0

      if (usedCount >= limit) {
        return NextResponse.json(
          { error: `Limite mensuelle atteinte (${limit} sites). Passez à un plan supérieur.` },
          { status: 403 }
        )
      }
    }

    const { prompt, name } = await request.json()

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Le prompt est requis' }, { status: 400 })
    }

    // Generate HTML with Claude
    const htmlContent = await generateWebsite(prompt)

    // Save to database
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

    // Increment usage counter (skip for admin)
    if (!isAdmin) {
      await supabase
        .from('users')
        .update({ sites_used_this_month: usedCount + 1 })
        .eq('id', user.id)
    }

    return NextResponse.json({ siteId: site.id, success: true })
  } catch (error) {
    console.error('Generate error:', error)
    return NextResponse.json({ error: 'Erreur lors de la génération' }, { status: 500 })
  }
}
