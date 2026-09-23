import { Resend } from "resend"

let resend: Resend | null = null

export function getResend() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

interface SendOTPEmailParams {
  email: string
  otp: string
  type: "sign-in" | "email-verification" | "forget-password" | "change-email"
}

const typeLabels = {
  "sign-in": "Sign in",
  "email-verification": "Verify your email",
  "forget-password": "Reset your password",
  "change-email": "Change your email",
}

export function buildOTPHtml(otp: string, type: SendOTPEmailParams["type"]): string {
  const label = typeLabels[type]
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#F4F6F8;font-family:'Inter','Plus Jakarta Sans',system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F6F8;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding:32px 40px;background-color:#0F2A44;">
              <h1 style="margin:0;color:#FFFFFF;font-size:20px;font-weight:700;">🛡️ Cyber Trust Nest</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 16px;color:#0F2A44;font-size:16px;font-weight:600;">${label}</p>
              <p style="margin:0 0 24px;color:#5B6B7F;font-size:14px;line-height:1.6;">
                Use the verification code below to ${type === "sign-in" ? "sign in to your account" : type === "email-verification" ? "verify your email address" : "reset your password"}.
              </p>
              <div style="background-color:#F4F6F8;border-radius:8px;padding:20px;text-align:center;margin-bottom:24px;">
                <p style="margin:0;color:#0F2A44;font-size:32px;font-weight:700;letter-spacing:8px;font-family:'IBM Plex Mono',monospace;">${otp}</p>
              </div>
              <p style="margin:0 0 8px;color:#5B6B7F;font-size:13px;line-height:1.5;">
                This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;background-color:#F4F6F8;border-top:1px solid #E2E8F0;">
              <p style="margin:0;color:#5B6B7F;font-size:12px;text-align:center;">
                Practical compliance guidance — confirm filings with licensed counsel or your DPCO.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

/** Brevo transactional email API — delivers to ANY inbox on the free plan. */
export async function sendBrevoEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) throw new Error("Brevo is not configured (missing BREVO_API_KEY)")
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "officialaisoafrica@gmail.com"

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "Cyber Trust Nest", email: senderEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Brevo rejected the send (HTTP ${res.status}): ${body.slice(0, 300)}`)
  }
}

async function sendViaResend(to: string, subject: string, html: string) {
  // NOTE: Resend free-tier sender (onboarding@resend.dev) only delivers
  // to the Resend account owner's inbox. To email ANY address, verify a
  // domain at resend.com/domains and set FROM_EMAIL env var, e.g.
  // FROM_EMAIL="Cyber Trust Nest <noreply@yourdomain.com>"
  const from = process.env.FROM_EMAIL || "Cyber Trust Nest <onboarding@resend.dev>"
  const { error } = await getResend().emails.send({ from, to, subject, html })
  if (error) {
    throw new Error(
      `Email provider rejected the send (${error.message || "unknown reason"}). ` +
      `If testing with onboarding@resend.dev, codes only arrive at the Resend account owner's inbox — verify a domain to email anyone.`
    )
  }
}

export async function sendOTPEmail({ email, otp, type }: SendOTPEmailParams) {
  const subject = `Your Cyber Trust Nest verification code`
  const html = buildOTPHtml(otp, type)

  // Brevo first (delivers to ANY inbox), Resend as fallback.
  const errors: string[] = []
  if (process.env.BREVO_API_KEY) {
    try {
      await sendBrevoEmail(email, subject, html)
      console.log(`[AUTH] OTP sent to ${email} via Brevo (type: ${type})`)
      return
    } catch (error) {
      const msg = (error as Error).message
      console.error(`[AUTH] Brevo send to ${email} failed:`, msg)
      errors.push(`Brevo: ${msg}`)
    }
  }
  try {
    await sendViaResend(email, subject, html)
    console.log(`[AUTH] OTP sent to ${email} via Resend (type: ${type})`)
    return
  } catch (error) {
    const msg = (error as Error).message
    console.error(`[AUTH] Resend send to ${email} failed:`, msg)
    errors.push(`Resend: ${msg}`)
  }

  // In development, log the OTP so you can test without email
  if (process.env.NODE_ENV === "development") {
    console.log(`[AUTH] DEV MODE — OTP for ${email}: ${otp}`)
  }
  // Re-throw so Better Auth returns the failure to the client
  // instead of silently pretending the code was sent.
  throw new Error(errors.join(" | ") || "Failed to send email")
}
