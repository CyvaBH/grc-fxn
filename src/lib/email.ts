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

export async function sendOTPEmail({ email, otp, type }: SendOTPEmailParams) {
  const subject = `Your Cyber Trust Nest verification code`
  const label = typeLabels[type]

  const html = `
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
                This code expires in 5 minutes. If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;background-color:#F4F6F8;border-top:1px solid #E2E8F0;">
              <p style="margin:0;color:#5B6B7F;font-size:12px;text-align:center;">
                Guidance only — not legal advice. Confirm with licensed counsel before filing.
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

  try {
    await getResend().emails.send({
      from: "Cyber Trust Nest <noreply@cybertrustnest.com>",
      to: email,
      subject,
      html,
    })
    console.log(`[AUTH] OTP sent to ${email} (type: ${type})`)
  } catch (error) {
    console.error(`[AUTH] Failed to send OTP to ${email}:`, error)
    // In development, log the OTP so you can test without Resend
    if (process.env.NODE_ENV === "development") {
      console.log(`[AUTH] DEV MODE — OTP for ${email}: ${otp}`)
    }
  }
}
