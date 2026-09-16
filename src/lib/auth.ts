import { betterAuth } from "better-auth"
import { emailOTP } from "better-auth/plugins"
import { createClient } from "@libsql/client"
import { sendOTPEmail } from "@/lib/email"

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
})

export const auth = betterAuth({
  database: db,
  emailAndPassword: {
    enabled: false,
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 300,
      allowedAttempts: 3,
      sendVerificationOnSignUp: true,
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
