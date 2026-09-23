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
  // Password login is admin-only: public sign-up is disabled, and password
  // accounts are created solely via /api/admin/admins (admin-gated).
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
  },
  plugins: [
    // TOTP second factor for password admins (authenticator app + backup codes)
    twoFactor({
      issuer: "Cyber Trust Nest",
    }),
    emailOTP({
      otpLength: 6,
      expiresIn: 600,
      allowedAttempts: 5,
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
