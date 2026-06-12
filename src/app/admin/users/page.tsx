import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import AdminUsersPanel from '@/components/admin/AdminUsersPanel'
import type { AdminUser } from '@/components/admin/AdminUsersPanel'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'balsanmathis08@gmail.com'

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getAllUsers(): Promise<AdminUser[]> {
  const db = getServiceClient()

  // Fetch users with subscription join
  const { data: users } = await db
    .from('users')
    .select('id, email, plan, tokens_used, tokens_limit, created_at')
    .order('created_at', { ascending: false })

  if (!users || users.length === 0) return []

  const userIds = users.map((u: { id: string }) => u.id)

  // Fetch subscriptions for all users
  const { data: subs } = await db
    .from('subscriptions')
    .select('user_id, stripe_customer_id, stripe_subscription_id, status, plan')
    .in('user_id', userIds)

  const subMap = new Map(
    (subs ?? []).map((s: {
      user_id: string;
      stripe_customer_id: string | null;
      stripe_subscription_id: string | null;
      status: string | null;
      plan: string | null;
    }) => [s.user_id, s])
  )

  return users.map((u: {
    id: string;
    email: string;
    plan: string;
    tokens_used: number;
    tokens_limit: number;
    created_at: string;
  }) => {
    const sub = subMap.get(u.id)
    return {
      id: u.id,
      email: u.email ?? '',
      plan: u.plan ?? 'free',
      tokensUsed: u.tokens_used ?? 0,
      tokensLimit: u.tokens_limit ?? 0,
      createdAt: u.created_at,
      stripeCustomerId: sub?.stripe_customer_id ?? null,
      stripeSubscriptionId: sub?.stripe_subscription_id ?? null,
      subscriptionStatus: sub?.status ?? null,
      // Fields not in DB yet — default to 0 until sync populates them
      discountPercent: 0,
      discountCode: null,
      hasRefund: false,
      refundDate: null,
      grossPaid: 0,
      netPaid: 0,
    }
  })
}

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) redirect('/dashboard')

  const users = await getAllUsers()

  return (
    <div className="min-h-screen bg-[#080810] text-white">
      <DashboardSidebar />
      <main className="md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <a href="/admin" className="text-white/30 hover:text-white/60 text-sm transition-colors">
                ← Admin
              </a>
              <div className="w-px h-4 bg-white/10" />
              <h1 className="text-2xl font-black text-white">Utilisateurs</h1>
              <span className="text-sm text-white/30">({users.length} inscrits)</span>
            </div>
            <p className="text-xs text-white/30">
              Cliquez sur un utilisateur pour modifier son compte.
              Lancez &quot;Sync Stripe&quot; depuis /admin pour enrichir les données Stripe.
            </p>
          </div>

          <AdminUsersPanel users={users} />
        </div>
      </main>
    </div>
  )
}
