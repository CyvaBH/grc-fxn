import { betterAuth } from "better-auth"
import { emailOTP, twoFactor } from "better-auth/plugins"
import { Pool } from "pg"
import { sendOTPEmail } from "@/lib/email"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

export const auth = betterAuth({
  appName: "Cyber Trust Nest",
  database: pool,
  // Production URL must be trusted or the hosted client gets rejected.
  trustedOrigins: [
    "https://cybertrustnest.vercel.app",
    "http://localhost:3000",
  ],
  // Password is the primary login; OTP email code is the alternative.
  // Existing OTP-only users set a password via the reset flow (Settings).
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
    requireEmailVerification: false,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      const { sendBrevoEmail } = await import("@/lib/email")
      await sendBrevoEmail(
        user.email,
        "Set your Cyber Trust Nest password",
        `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <h2 style="color:#0F2A44;margin:0 0 12px;">Set your password</h2>
          <p style="color:#334155;line-height:1.6;">Click the link below to set (or reset) your Cyber Trust Nest password. It expires in 1 hour.</p>
          <a href="${url}" style="display:inline-block;margin-top:12px;background:#0E9F6E;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;">Set password</a>
          <p style="color:#94A3B8;font-size:12px;margin-top:24px;">If you didn't ask for this, ignore it. Practical compliance guidance — confirm filings with licensed counsel or your DPCO.</p>
        </div>`
      )
    },
  },
  logger: {
    disabled: false,
    level: "debug",
  },
  plugins: [
    // TOTP second factor for password admins (authenticator app + backup codes)
    twoFactor({
      issuer: "Cyber Trust Nest",
    }),
    emailOTP({
      otpLength: 6,
      expiresIn: 600,
      // Lenient on typos: 8 tries per code within its 10-minute life.
      // Abuse is still capped by the per-minute send rate limit.
      allowedAttempts: 8,
      // Resends deliver the SAME unexpired code — a second send never kills
      // the code already sitting in the inbox (the classic "double OTP" bug).
      resendStrategy: "reuse",
      sendVerificationOnSignUp: true,
      rateLimit: {
        window: 60,
        max: 5,
      },
      async sendVerificationOTP({ email, otp, type }) {
        await sendOTPEmail({ email, otp, type })
      },
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
})
