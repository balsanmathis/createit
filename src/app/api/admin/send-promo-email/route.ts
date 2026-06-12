import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'balsanmathis08@gmail.com'

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!)
}

function buildEmailHtml(promoCode: string, expiryDate: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Offre exclusive CreateIt</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;min-height:100vh;">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Logo -->
        <tr><td align="center" style="padding-bottom:28px;">
          <span style="font-family:Georgia,serif;font-size:26px;font-weight:700;color:#0f172a;">
            Create<span style="color:#2563eb;">It</span>
          </span>
        </td></tr>

        <!-- Hero card -->
        <tr><td style="background:#eff6ff;border-radius:12px;padding:36px 32px;text-align:center;margin-bottom:0;">
          <div style="font-size:12px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px;">
            Offre exclusive — durée limitée
          </div>
          <div style="font-size:56px;font-weight:800;color:#0f172a;line-height:1;margin-bottom:10px;">
            -50%
          </div>
          <div style="font-size:16px;color:#475569;">
            sur votre abonnement CreateIt
          </div>
        </td></tr>

        <!-- Body card -->
        <tr><td style="background:#ffffff;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none;padding:32px;">
          <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 20px;">
            Bonne nouvelle ! Pendant une durée limitée, profitez de <strong>-50%</strong> sur n'importe quel plan CreateIt avec le code exclusif :
          </p>

          <!-- Promo code -->
          <div style="background:#f8fafc;border:2px dashed #2563eb;border-radius:8px;padding:18px 24px;text-align:center;margin:0 0 24px;">
            <span style="font-family:monospace;font-size:22px;font-weight:700;color:#2563eb;letter-spacing:0.12em;">
              ${promoCode}
            </span>
          </div>

          <!-- CTA -->
          <div style="text-align:center;margin:28px 0;">
            <a href="https://create-it.app/pricing?promo=${promoCode}"
               style="background:#2563eb;color:#ffffff;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block;">
              Profiter de l'offre →
            </a>
          </div>

          <!-- Plans reminder -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr>
              <td style="width:33%;text-align:center;padding:12px 8px;background:#f8fafc;border-radius:8px;margin:0 4px;">
                <div style="font-size:13px;font-weight:600;color:#0f172a;">Starter</div>
                <div style="font-size:11px;color:#64748b;margin-top:2px;"><s>20 €</s> → <strong style="color:#2563eb;">10 €</strong>/mois</div>
              </td>
              <td style="width:4px;"></td>
              <td style="width:33%;text-align:center;padding:12px 8px;background:#f8fafc;border-radius:8px;">
                <div style="font-size:13px;font-weight:600;color:#0f172a;">Pro</div>
                <div style="font-size:11px;color:#64748b;margin-top:2px;"><s>45 €</s> → <strong style="color:#2563eb;">22,50 €</strong>/mois</div>
              </td>
              <td style="width:4px;"></td>
              <td style="width:33%;text-align:center;padding:12px 8px;background:#f8fafc;border-radius:8px;">
                <div style="font-size:13px;font-weight:600;color:#0f172a;">Agency</div>
                <div style="font-size:11px;color:#64748b;margin-top:2px;"><s>250 €</s> → <strong style="color:#2563eb;">125 €</strong>/mois</div>
              </td>
            </tr>
          </table>

          <p style="font-size:13px;color:#94a3b8;text-align:center;margin:0;">
            Offre valable jusqu'au <strong>${expiryDate}</strong>
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td align="center" style="padding-top:24px;">
          <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
            Vous recevez cet email car vous êtes inscrit sur CreateIt.<br>
            <a href="https://create-it.app" style="color:#2563eb;text-decoration:none;">create-it.app</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`
}

export async function POST(req: Request) {
  // Admin check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await req.json()
  const { promoCode, expiryDate, testMode } = body as {
    promoCode: string
    expiryDate: string
    testMode: boolean
  }

  if (!promoCode || !expiryDate) {
    return NextResponse.json({ error: 'promoCode and expiryDate are required' }, { status: 400 })
  }

  const db = getServiceClient()
  const resend = getResend()

  // Fetch all user emails
  const { data: users, error } = await db
    .from('users')
    .select('email')
    .not('email', 'is', null)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const emails = (users ?? []).map((u: { email: string }) => u.email).filter(Boolean)
  const recipients = testMode ? [ADMIN_EMAIL] : emails

  const html = buildEmailHtml(promoCode, expiryDate)
  const subject = `🎉 -50% sur votre abonnement CreateIt — code ${promoCode}`

  const BATCH_SIZE = 50
  let sentCount = 0
  const failures: string[] = []

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE)

    await Promise.all(batch.map(async (email) => {
      try {
        await resend.emails.send({
          from: 'CreateIt <noreply@create-it.app>',
          to: email,
          subject,
          html,
        })
        sentCount++
      } catch (err) {
        console.error(`[send-promo-email] failed for ${email}:`, err)
        failures.push(email)
      }
    }))

    if (i + BATCH_SIZE < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  // Log campaign (best-effort — table may not exist yet)
  if (!testMode) {
    try {
      await db.from('email_campaigns').insert({
        name: `Promo ${promoCode} — ${expiryDate}`,
        recipients_count: sentCount,
      })
    } catch {
      // table not created yet
    }
  }

  return NextResponse.json({
    sent: sentCount,
    total: recipients.length,
    failures: failures.length,
    testMode,
  })
}

export async function GET() {
  // Return campaign history + total user count
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const db = getServiceClient()

  const [countResult, campaignsResult] = await Promise.all([
    db.from('users').select('*', { count: 'exact', head: true }),
    db.from('email_campaigns').select('*').order('sent_at', { ascending: false }).limit(10),
  ])

  return NextResponse.json({
    totalUsers: countResult.count ?? 0,
    campaigns: campaignsResult.data ?? [],
  })
}
