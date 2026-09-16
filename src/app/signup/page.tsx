"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck, ArrowRight, Mail } from "lucide-react"

export default function SignupPage() {
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
      window.location.href = "/onboarding"
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <ShieldCheck className="h-6 w-6 text-brand-teal" />
            <span className="text-lg font-bold text-brand-navy">[Product]</span>
          </Link>

          <h1 className="text-2xl font-bold text-brand-navy mb-2">
            Create your account
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Get your compliance profile in 15 minutes.
          </p>

          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
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
              <Button type="submit" className="w-full" size="lg">
                Continue with email
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="flex items-center gap-2 bg-status-infoBg rounded-lg p-3 text-sm text-brand-navy">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>
                  We sent a code to <strong>{email}</strong>
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
                Verify & continue
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
