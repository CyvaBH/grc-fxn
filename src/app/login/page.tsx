"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck, ArrowRight, Mail, Loader2 } from "lucide-react"
import { authClient } from "@/lib/auth-client"

function friendlyError(raw: string): string {
  const msg = raw || "Failed to send code. Try again."
  if (/rate.?limit|too many|429/i.test(msg)) {
    return "Too many attempts. Wait about a minute, then try again."
  }
  if (/rejected|only.*inbox|verify a domain/i.test(msg)) {
    return msg + " Also check your spam folder."
  }
  return msg
}

const RESEND_COOLDOWN = 30

function LoginNotice() {
  const [reason, setReason] = useState<string | null>(null)
  useEffect(() => {
    try {
      const r = new URLSearchParams(window.location.search).get("reason")
      if (r === "timeout" || r === "fresh") setReason(r)
    } catch {}
  }, [])
  if (!reason) return null
  return (
    <div className="mb-4 p-3 bg-status-infoBg rounded-lg text-sm text-brand-navy">
      {reason === "timeout"
        ? "You were signed out after a period of inactivity. Sign in again to continue."
        : "For your security, please sign in again to continue."}
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [cooldown, setCooldown] = useState(0)
  // Synchronous guard: React state updates async, so rapid double-clicks
  // would otherwise fire two sends (second code kills the first).
  const sendingRef = useRef(false)

  // Remember last email so re-login after timeout is one tap, no retyping
  useEffect(() => {
    try {
      const last = window.localStorage.getItem("ctn-last-email")
      if (last) setEmail(last)
    } catch {}
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sendingRef.current) return
    sendingRef.current = true
    setLoading(true)
    setError("")

    try {
      let otpError: { message?: string } | null = null
      try {
        ;({ error: otpError } = await authClient.emailOtp.sendVerificationOtp({
          email,
          type: "sign-in",
        }))
      } catch {
        // Transient network blip: one automatic retry before bothering the user
        await new Promise((r) => setTimeout(r, 1500))
        try {
          ;({ error: otpError } = await authClient.emailOtp.sendVerificationOtp({
            email,
            type: "sign-in",
          }))
        } catch {
          otpError = { message: "Network error. Check your connection and try again." }
        }
      }

      if (otpError) {
        setError(friendlyError(otpError.message ?? ""))
        setLoading(false)
        sendingRef.current = false
        return
      }

      setOtpSent(true)
      setCooldown(RESEND_COOLDOWN)
    } catch {
      setError("Something went wrong. Check your connection and try again.")
    } finally {
      setLoading(false)
      sendingRef.current = false
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { error: signInError } = await authClient.signIn.emailOtp({
        email,
        otp,
      })

      if (signInError) {
        const msg = (signInError as { message?: string }).message ?? ""
        setError(
          /invalid|expired|attempt/i.test(msg)
            ? "That code didn't work — it may have expired. Request a new one below."
            : msg || "Invalid code. Try again."
        )
        setLoading(false)
        return
      }

      try {
        window.localStorage.setItem("ctn-last-email", email.toLowerCase())
      } catch {}
      // Mark this tab freshly authenticated (fresh-tab guard lets it straight in)
      try {
        window.sessionStorage.setItem("ctn-just-authed", "1")
      } catch {}
      // Confirm the session cookie actually landed before navigating —
      // otherwise the dashboard guard bounces back to login.
      let confirmed = false
      for (let i = 0; i < 10; i++) {
        try {
          const r = await fetch("/api/auth/get-session")
          const j = await r.json()
          if (j?.session || j?.user) {
            confirmed = true
            break
          }
        } catch {}
        await new Promise((r) => setTimeout(r, 500))
      }
      if (!confirmed) {
        window.location.href = "/dashboard"
        return
      }
      router.push("/dashboard")
      router.refresh()
    } catch {
      setError("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-brand-mist">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <ShieldCheck className="h-6 w-6 text-brand-teal" />
          <span className="text-lg font-bold text-brand-navy">Cyber Trust Nest</span>
        </Link>

        <div className="bg-white rounded-xl border border-border shadow-sm p-8">
          <h1 className="text-2xl font-bold text-brand-navy mb-2">
            Welcome back
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            We&apos;ll email you a one-time code to sign in — no password needed.
          </p>

          <LoginNotice />

          {error && (
            <div className="mb-4 p-3 bg-status-critBg rounded-lg text-sm text-status-critTx">
              {error}
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Send verification code"
                )}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="flex items-center gap-2 bg-status-infoBg rounded-lg p-3 text-sm text-brand-navy">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>
                  Code sent to <strong>{email}</strong>. Check spam too.
                </span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp">Verification code</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  maxLength={6}
                  required
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Sign in"
                )}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => { setOtpSent(false); setOtp(""); setError("") }}
                  className="text-gray-500 hover:text-brand-navy"
                >
                  Use a different email
                </button>
                <button
                  type="button"
                  disabled={cooldown > 0 || loading}
                  onClick={handleSendOtp}
                  className="text-brand-teal font-medium hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-brand-teal font-medium hover:underline">
            Sign up free
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-gray-400">
          Administrator?{" "}
          <Link href="/admin-login" className="hover:text-brand-navy hover:underline">
            Admin sign-in
          </Link>
        </p>
      </div>
    </div>
  )
}
