"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck, ArrowRight, Loader2, CheckCircle2 } from "lucide-react"
import { authClient } from "@/lib/auth-client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const { error: fpError } = await authClient.$fetch("/forget-password", {
        method: "POST",
        body: { email, redirectTo: "/reset-password" },
      })
      if (fpError) {
        setError((fpError as { message?: string }).message || "Could not send the link. Try again.")
        setLoading(false)
        return
      }
      setSent(true)
    } catch {
      setError("Something went wrong. Check your connection and try again.")
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
            {sent ? "Check your inbox" : "Reset your password"}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {sent
              ? `We sent a password link to ${email}. It expires in 1 hour. (Signed up with a code before? This same link sets your first password.)`
              : "Enter your account email and we'll send you a password link."}
          </p>
          {error && (
            <div className="mb-4 p-3 bg-status-critBg rounded-lg text-sm text-status-critTx">
              {error}
            </div>
          )}
          {sent ? (
            <div className="flex items-center gap-2 text-sm text-brand-teal font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Link sent — check spam too.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send reset link"}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          )}
        </div>
        <p className="mt-6 text-center text-sm text-gray-500">
          <Link href="/login" className="text-brand-teal font-medium hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
