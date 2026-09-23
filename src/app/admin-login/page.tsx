"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck, ArrowRight, Loader2, Lock } from "lucide-react"
import { authClient } from "@/lib/auth-client"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const { error: signInError } = await authClient.signIn.email({ email, password })
      if (signInError) {
        setError((signInError as { message?: string }).message || "Invalid email or password.")
        setLoading(false)
        return
      }
      // Confirm admin rights before entering
      const me = await fetch("/api/admin/me").then((r) => r.json())
      if (!me.isAdmin) {
        await authClient.signOut()
        setError("This account is not an admin.")
        setLoading(false)
        return
      }
      router.push("/admin")
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
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-5 w-5 text-brand-teal" />
            <h1 className="text-2xl font-bold text-brand-navy">Admin sign-in</h1>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Email + password access for administrators only.
          </p>
          {error && (
            <div className="mb-4 p-3 bg-status-critBg rounded-lg text-sm text-status-critTx">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Admin email</Label>
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign in as admin"}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>
        </div>
        <p className="mt-6 text-center text-sm text-gray-500">
          Regular user?{" "}
          <Link href="/login" className="text-brand-teal font-medium hover:underline">
            Sign in with email code
          </Link>
        </p>
      </div>
    </div>
  )
}
