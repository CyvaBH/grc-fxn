"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck, ArrowRight, Mail, Loader2 } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

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

async function confirmSession(): Promise<boolean> {
  for (let i = 0; i < 10; i++) {
    try {
      const r = await fetch("/api/auth/get-session")
      const j = await r.json()
      if (j?.session || j?.user) return true
    } catch {}
    await new Promise((r) => setTimeout(r, 500))
  }
  return false
}

export default function SignupPage() {
  const router = useRouter()
  const [mode, setMode] = useState<"password" | "otp">("password")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [cooldown, setCooldown] = useState(0)
  const sendingRef = useRef(false)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const enterApp = async (to: string) => {
    try {
      window.localStorage.setItem("ctn-last-email", email.toLowerCase())
    } catch {}
    try {
      window.sessionStorage.setItem("ctn-just-authed", "1")
    } catch {}
    if (await confirmSession()) {
      router.push(to)
      router.refresh()
    } else {
      window.location.href = to
    }
  }

  const handlePasswordSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sendingRef.current) return
    sendingRef.current = true
    setLoading(true)
    setError("")
    try {
      const { error: signUpError } = await authClient.signUp.email({
        email,
        password,
        name,
      })
      if (signUpError) {
        const msg = (signUpError as { message?: string }).message ?? ""
        setError(
          /already|exists|taken/i.test(msg)
            ? "This email is already registered. Sign in instead — or reset your password."
            : msg || "Could not create your account. Try again."
        )
        return
      }
      await enterApp("/onboarding")
    } catch {
      setError("Something went wrong. Check your connection and try again.")
    } finally {
      setLoading(false)
      sendingRef.current = false
    }
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sendingRef.current) return
    sendingRef.current = true
    setLoading(true)
    setError("")

    try {
      const { error: otpError } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      })

      if (otpError) {
        setError(friendlyError((otpError as { message?: string }).message ?? ""))
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
        name: name || undefined,
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

      await enterApp("/onboarding")
    } catch {
      setError("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <ShieldCheck className="h-6 w-6 text-brand-teal" />
            <span className="text-lg font-bold text-brand-navy">Cyber Trust Nest</span>
          </Link>

          <h1 className="text-2xl font-bold text-brand-navy mb-2">
            Create your account
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Get your compliance profile in 15 minutes.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-status-critBg rounded-lg text-sm text-status-critTx">
              {error}
            </div>
          )}

          {/* Mode tabs */}
          <div className="grid grid-cols-2 gap-1 bg-brand-mist rounded-lg p-1 mb-6">
            {(
              [
                { id: "password", label: "Password" },
                { id: "otp", label: "Email code" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => { setMode(t.id); setError(""); setOtpSent(false); setOtp("") }}
                className={cn(
                  "py-2 rounded-md text-sm font-medium transition-colors",
                  mode === t.id ? "bg-white text-brand-navy shadow-sm" : "text-gray-500 hover:text-brand-navy"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {mode === "password" ? (
            <form onSubmit={handlePasswordSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g. Adaeze Obi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Work email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password (min 8 characters)</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Choose a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Create account"
                )}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          ) : !otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp-name">Your name</Label>
                <Input
                  id="otp-name"
                  type="text"
                  placeholder="e.g. Adaeze Obi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp-email">Work email</Label>
                <Input
                  id="otp-email"
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
                  "Continue with email"
                )}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="flex items-center gap-2 bg-status-infoBg rounded-lg p-3 text-sm text-brand-navy">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>
                  We sent a code to <strong>{email}</strong>. Check spam too.
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
                  "Verify & continue"
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

          <p className="mt-8 text-xs text-gray-400 text-center">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-brand-navy">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-brand-navy">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Right — Illustration panel */}
      <div className="hidden lg:flex lg:flex-1 bg-brand-navy items-center justify-center p-12">
        <div className="max-w-md text-white">
          <ShieldCheck className="h-16 w-16 text-brand-teal mb-6" />
          <h2 className="text-2xl font-bold mb-4">
            Your virtual GRC officer
          </h2>
          <ul className="space-y-3 text-white/80 text-sm">
            <li className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-brand-teal flex-shrink-0" />
              Know which regulations apply to you
            </li>
            <li className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-brand-teal flex-shrink-0" />
              Get a 30-60-90 day action plan
            </li>
            <li className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-brand-teal flex-shrink-0" />
              Track deadlines and renewals
            </li>
            <li className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-brand-teal flex-shrink-0" />
              Prove compliance to clients
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
