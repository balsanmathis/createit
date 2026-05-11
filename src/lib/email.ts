import { Resend } from 'resend'

const FROM = process.env.RESEND_FROM_EMAIL ?? 'CreateIt <hello@create-it.app>'

function getResend(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured')
  }
  return new Resend(process.env.RESEND_API_KEY)
}

export function generateWelcomeCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return `WELCOME20-${code}`
}

export async function sendWelcomeEmail(to: string, promoCode: string): Promise<void> {
  const pricingUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://create-it.app'}/pricing`

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Bienvenue sur CreateIt</title>
</head>
<body style="margin:0;padding:0;background:#04040f;font-family:Arial,Helvetica,sans-serif;color:#e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#04040f;min-height:100vh;">
    <tr><td align="center" style="padding:40px 20px;">

      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Logo -->
        <tr><td align="center" style="padding-bottom:32px;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="background:linear-gradient(135deg,#5b21b6,#1d4ed8);border-radius:12px;width:40px;height:40px;text-align:center;vertical-align:middle;">
                <span style="color:white;font-size:18px;font-weight:bold;">✦</span>
              </td>
              <td style="padding-left:10px;">
                <span style="font-size:22px;font-weight:bold;color:#e2e8f0;">Create<span style="color:#7c3aed;">It</span></span>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:#080820;border:1px solid #1e1b4b;border-radius:20px;padding:40px;">

          <!-- Gift icon -->
          <p style="text-align:center;font-size:48px;margin:0 0 20px;">🎁</p>

          <h1 style="margin:0 0 12px;font-size:26px;font-weight:900;text-align:center;color:#e2e8f0;">
            Bienvenue sur CreateIt !
          </h1>
          <p style="margin:0 0 24px;font-size:15px;color:#94a3b8;text-align:center;line-height:1.6;">
            Merci de nous rejoindre. Votre premier site est <strong style="color:#7c3aed;">offert</strong> dès maintenant.<br>
            Et pour aller plus loin, voici votre cadeau d'inscription :
          </p>

          <!-- Promo code box -->
          <div style="background:#0d0d2e;border:2px dashed #5b21b6;border-radius:14px;padding:24px;text-align:center;margin-bottom:28px;">
            <p style="margin:0 0 8px;font-size:12px;color:#7c3aed;font-weight:600;letter-spacing:2px;text-transform:uppercase;">Votre code promo</p>
            <p style="margin:0 0 10px;font-size:28px;font-weight:900;letter-spacing:4px;color:#e2e8f0;font-family:monospace;">${promoCode}</p>
            <p style="margin:0;font-size:13px;color:#64748b;">
              <strong style="color:#a78bfa;">-20% à vie</strong> sur n'importe quel plan payant
            </p>
          </div>

          <!-- Urgency -->
          <p style="margin:0 0 28px;font-size:13px;color:#ef4444;text-align:center;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:8px;padding:10px;">
            ⏰ Offre valable <strong>48h seulement</strong>
          </p>

          <!-- CTA -->
          <div style="text-align:center;margin-bottom:28px;">
            <a href="${pricingUrl}" style="display:inline-block;background:#5b21b6;color:white;text-decoration:none;font-weight:700;font-size:16px;padding:16px 40px;border-radius:50px;">
              Choisir mon plan avec -20% →
            </a>
          </div>

          <!-- Features reminder -->
          <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #1e1b4b;padding-top:24px;">
            <tr>
              <td width="33%" style="text-align:center;padding:12px 8px;">
                <p style="margin:0 0 6px;font-size:20px;">⚡</p>
                <p style="margin:0;font-size:12px;color:#64748b;">Génération en 30s</p>
              </td>
              <td width="33%" style="text-align:center;padding:12px 8px;">
                <p style="margin:0 0 6px;font-size:20px;">🎨</p>
                <p style="margin:0;font-size:12px;color:#64748b;">Éditeur visuel</p>
              </td>
              <td width="33%" style="text-align:center;padding:12px 8px;">
                <p style="margin:0 0 6px;font-size:20px;">📦</p>
                <p style="margin:0;font-size:12px;color:#64748b;">Export ZIP</p>
              </td>
            </tr>
          </table>

        </td></tr>

        <!-- Footer -->
        <tr><td align="center" style="padding-top:24px;">
          <p style="margin:0;font-size:12px;color:#334155;">
            © 2025 CreateIt · Propulsé par Claude AI<br>
            <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://create-it.app'}" style="color:#5b21b6;text-decoration:none;">create-it.app</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  const resend = getResend()
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Bienvenue sur CreateIt — Votre cadeau d\'inscription 🎁',
    html,
  })
}
