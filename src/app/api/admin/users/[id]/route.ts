import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { PLAN_TOKEN_LIMITS } from '@/types'

const ADMIN_EMAIL = 'balsanmathis08@gmail.com'

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface Params {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { plan, status, tokensLimit } = body

    const service = getServiceClient()

    // Fetch current state for audit
    const { data: current } = await service
      .from('users')
      .select('id, email, plan, tokens_limit')
      .eq('id', id)
      .single()

    // Build users update
    const usersUpdate: Record<string, unknown> = {}
    if (plan !== undefined) {
      usersUpdate.plan = plan
      // Auto-adjust tokens_limit when plan changes (unless overridden)
      if (tokensLimit === undefined && plan in PLAN_TOKEN_LIMITS) {
        usersUpdate.tokens_limit = PLAN_TOKEN_LIMITS[plan as keyof typeof PLAN_TOKEN_LIMITS]
      }
    }
    if (tokensLimit !== undefined) usersUpdate.tokens_limit = tokensLimit

    if (Object.keys(usersUpdate).length > 0) {
      const { error } = await service.from('users').update(usersUpdate).eq('id', id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update subscription status if provided
    if (status !== undefined) {
      await service
        .from('subscriptions')
        .update({ status })
        .eq('user_id', id)
    }

    // Audit log (best-effort — table may not exist yet)
    try {
      await service.from('admin_actions').insert({
        admin_email: user!.email,
        target_user_email: current?.email ?? id,
        action: 'update_user',
        old_value: current ?? {},
        new_value: body,
      })
    } catch {
      // Table doesn't exist yet — no-op
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
