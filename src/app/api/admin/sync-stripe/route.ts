import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { syncAllUsersFromStripe, upsertSyncedUsers } from '@/lib/admin/syncStripeData'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'balsanmathis08@gmail.com'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const emails: string[] | undefined = Array.isArray(body.emails) ? body.emails : undefined

    const { synced, results } = await syncAllUsersFromStripe(emails)
    const { updated, errors } = await upsertSyncedUsers(results)

    return NextResponse.json({
      synced,
      updated,
      errors,
      results: results.map(r => ({
        email: r.email,
        plan: r.plan,
        status: r.subscriptionStatus,
        hasRefund: r.hasRefund,
        tokensLimit: r.tokensLimit,
      })),
    })
  } catch (err) {
    console.error('[sync-stripe] error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
