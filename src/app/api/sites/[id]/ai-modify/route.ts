import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { modifyWebsite } from '@/lib/claude'
import { TOKEN_COST_MODIFY } from '@/types'

export const maxDuration = 300

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'balsanmathis08@gmail.com'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const isAdmin = user.email === ADMIN_EMAIL

    // Fetch site (verify ownership)
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('id, html_content')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (siteError || !site) {
      return NextResponse.json({ error: 'Site introuvable' }, { status: 404 })
    }

    if (!isAdmin) {
      // Token check
      const { data: profile } = await supabase
        .from('users')
        .select('tokens_used, tokens_limit, plan')
        .eq('id', user.id)
        .single()

      const tokensUsed  = profile?.tokens_used  ?? 0
      const tokensLimit = profile?.tokens_limit ?? 8_000

      if (tokensUsed + TOKEN_COST_MODIFY > tokensLimit) {
        const isPaid = profile?.plan && profile.plan !== 'free'
        const error = isPaid
          ? `Tokens insuffisants (${(tokensLimit - tokensUsed).toLocaleString()} restants). Votre plan se renouvelle le mois prochain.`
          : 'Tokens gratuits épuisés. Choisissez un plan pour modifier avec l\'IA.'
        return NextResponse.json({ error, needsUpgrade: true }, { status: 403 })
      }
    }

    const { instruction } = await request.json()
    if (!instruction?.trim()) {
      return NextResponse.json({ error: 'Instruction requise' }, { status: 400 })
    }

    const newHtml = await modifyWebsite(site.html_content, instruction)

    // Save the modified HTML
    const { error: updateError } = await supabase
      .from('sites')
      .update({ html_content: newHtml })
      .eq('id', id)
      .eq('user_id', user.id)

    if (updateError) throw updateError

    // Deduct tokens
    if (!isAdmin) {
      const { data: currentProfile } = await supabase
        .from('users')
        .select('tokens_used')
        .eq('id', user.id)
        .single()

      await supabase
        .from('users')
        .update({ tokens_used: (currentProfile?.tokens_used ?? 0) + TOKEN_COST_MODIFY })
        .eq('id', user.id)
    }

    // Return updated token balance
    const { data: updatedProfile } = await supabase
      .from('users')
      .select('tokens_used, tokens_limit')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      html: newHtml,
      tokensUsed:  updatedProfile?.tokens_used  ?? 0,
      tokensLimit: updatedProfile?.tokens_limit ?? 8_000,
    })
  } catch (error) {
    console.error('AI modify error:', error)
    return NextResponse.json({ error: 'Erreur lors de la modification' }, { status: 500 })
  }
}
