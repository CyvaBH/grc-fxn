"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/password-input"
import { ShieldCheck, ArrowRight, Loader2 } from "lucide-react"
import { authClient } from "@/lib/auth-client"

function ResetForm() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    try {
      setToken(new URLSearchParams(window.location.search).get("token"))
    } catch {}
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      setError("This link is missing its token. Request a fresh reset link.")
      return
    }
    setLoading(true)
    setError("")
    try {
      const { error: rsError } = await authClient.resetPassword({
        newPassword: password,
        token,
      })
      if (rsError) {
        setError(
          (rsError as { message?: string }).message ||
            "Link invalid or expired. Request a fresh one."
        )
        setLoading(false)
        return
      }
      router.push("/login")
      router.refresh()
    } catch {
      setError("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PasswordInput
        id="password"
        label="New password (min 8 characters)"
        value={password}
        onChange={setPassword}
        required
        minLength={8}
      />
      {error && (
        <div className="p-3 bg-status-critBg rounded-lg text-sm text-status-critTx">
          {error}
        </div>
      )}
      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Set password"}
        {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-brand-mist">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <ShieldCheck className="h-6 w-6 text-brand-teal" />
          <span className="text-lg font-bold text-brand-navy">Cyber Trust Nest</span>
        </Link>
        <div className="bg-white rounded-xl border border-border shadow-sm p-8">
          <h1 className="text-2xl font-bold text-brand-navy mb-2">Set new password</h1>
          <p className="text-sm text-gray-500 mb-6">
            Choose the password you&apos;ll sign in with from now on.
          </p>
          <Suspense>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
