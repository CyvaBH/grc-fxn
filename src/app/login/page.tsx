"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck, ArrowRight, Mail } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState("")

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) setOtpSent(true)
  }

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault()
    if (otp) {
      window.location.href = "/dashboard"
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-brand-mist">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <ShieldCheck className="h-6 w-6 text-brand-teal" />
          <span className="text-lg font-bold text-brand-navy">[Product]</span>
        </Link>

        <div className="bg-white rounded-xl border border-border shadow-sm p-8">
          <h1 className="text-2xl font-bold text-brand-navy mb-2">
            Welcome back
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Sign in to your compliance dashboard.
          </p>

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
              <Button type="submit" className="w-full" size="lg">
                Send verification code
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="flex items-center gap-2 bg-status-infoBg rounded-lg p-3 text-sm text-brand-navy">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>
                  Code sent to <strong>{email}</strong>
                </span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp">Verification code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
                Sign in
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="w-full text-sm text-gray-500 hover:text-brand-navy"
              >
                Use a different email
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-brand-teal font-medium hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  )
}
