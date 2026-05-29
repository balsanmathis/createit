import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import SubscriptionClient from './SubscriptionClient'

const PLAN_INFO: Record<string, { label: string; color: string; price: string; tokens: string }> = {
  free:    { label: 'Gratuit',  color: '#64748b', price: '0 €/mois',   tokens: '8 000' },
  starter: { label: 'Starter', color: '#2563eb', price: '20 €/mois',  tokens: '800 000' },
  pro:     { label: 'Pro',      color: '#7c3aed', price: '45 €/mois',  tokens: '2 400 000' },
  agency:  { label: 'Agency',  color: '#059669', price: '250 €/mois', tokens: '16 000 000' },
}

export default async function SubscriptionPage() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) redirect('/auth/login')

    const [profileResult, subscriptionResult] = await Promise.all([
      supabase.from('users').select('*').eq('id', user.id).single(),
      supabase.from('subscriptions').select('*').eq('user_id', user.id).maybeSingle(),
    ])

    const profile = profileResult.data
    const subscription = subscriptionResult.data
    const planKey = profile?.plan ?? 'free'
    const plan = PLAN_INFO[planKey] ?? PLAN_INFO.free

    const tokensUsed = profile?.tokens_used ?? 0
    const tokensLimit = profile?.tokens_limit ?? 8000

    // Fetch last 3 invoices from Stripe
    let invoices: { id: string; amount: number; date: string; status: string }[] = []
    if (subscription?.stripe_customer_id) {
      try {
        const stripeInvoices = await stripe.invoices.list({
          customer: subscription.stripe_customer_id,
          limit: 3,
          status: 'paid',
        })
        invoices = stripeInvoices.data.map(inv => ({
          id: inv.id,
          amount: (inv.amount_paid ?? 0) / 100,
          date: new Date(inv.created * 1000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
          status: 'Payé',
        }))
      } catch {
        // Stripe not configured or error — ignore
      }
    }

    const isCanceling = subscription?.status === 'canceling'
    const cancelAt = subscription?.cancel_at
      ? new Date(subscription.cancel_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
      : null

    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <DashboardSidebar />
        <main className="md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-8" style={{ color: 'var(--fg)' }}>Mon abonnement</h1>
            <SubscriptionClient
              planKey={planKey}
              plan={plan}
              tokensUsed={tokensUsed}
              tokensLimit={tokensLimit}
              hasSubscription={!!subscription && subscription.status !== 'canceled'}
              isCanceling={isCanceling}
              cancelAt={cancelAt}
              invoices={invoices}
              email={user.email ?? ''}
            />
          </div>
        </main>
      </div>
    )
  } catch {
    redirect('/auth/login')
  }
}
