"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/topbar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { ShieldCheck, Loader2, CheckCircle2, Smartphone } from "lucide-react"
import { authClient } from "@/lib/auth-client"

/**
 * Forced first-time security: change the temporary password, then enroll
 * an authenticator app (TOTP). Admins can't use the panel until both are done.
 */
export default function AdminSecurityPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [mustChange, setMustChange] = useState(false)
  const [totpDone, setTotpDone] = useState(false)
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [pwBusy, setPwBusy] = useState(false)
  const [pwError, setPwError] = useState("")
  const [enrollPw, setEnrollPw] = useState("")
  const [totpUri, setTotpUri] = useState("")
  const [secret, setSecret] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [code, setCode] = useState("")
  const [tBusy, setTBusy] = useState(false)
  const [tError, setTError] = useState("")

  const refreshMe = async () => {
    const me = await fetch("/api/admin/me").then((r) => r.json())
    if (!me.isAdmin) {
      router.replace("/admin-login")
      return null
    }
    setMustChange(me.mustChangePassword === true)
    setTotpDone(me.totpEnrolled === true)
    if (me.mustChangePassword !== true && me.totpEnrolled === true) {
      router.replace("/admin")
      return null
    }
    return me
  }

  useEffect(() => {
    refreshMe().finally(() => setChecking(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwBusy(true)
    setPwError("")
    try {
      const res = await fetch("/api/admin/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || "Could not change password")
      setCurrent("")
      setNext("")
      setEnrollPw("")
      await refreshMe()
    } catch (err) {
      setPwError((err as Error).message)
    } finally {
      setPwBusy(false)
    }
  }

  const startEnroll = async (e: React.FormEvent) => {
    e.preventDefault()
    setTBusy(true)
    setTError("")
    try {
      const { data, error } = await authClient.twoFactor.enable({ password: enrollPw })
      if (error) throw new Error((error as { message?: string }).message || "Could not start enrollment")
      const uri = (data as { totpURI?: string })?.totpURI || ""
      const codes = ((data as { backupCodes?: string[] })?.backupCodes || []) as string[]
      setTotpUri(uri)
      const m = uri.match(/secret=([^&]+)/)
      setSecret(m ? decodeURIComponent(m[1]) : "")
      setBackupCodes(codes)
    } catch (err) {
      setTError((err as Error).message)
    } finally {
      setTBusy(false)
    }
  }

  const verifyEnroll = async (e: React.FormEvent) => {
    e.preventDefault()
    setTBusy(true)
    setTError("")
    try {
      const { error } = await authClient.twoFactor.verifyTotp({ code: code.trim() })
      if (error) throw new Error((error as { message?: string }).message || "Invalid code — try again")
      const me = await refreshMe()
      if (me && me.mustChangePassword !== true && me.totpEnrolled === true) {
        router.replace("/admin")
      }
    } catch (err) {
      setTError((err as Error).message)
    } finally {
      setTBusy(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-brand-mist flex items-center justify-center">
        <p className="text-sm text-gray-500">Checking security status…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-mist flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          <div className="max-w-xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-brand-navy">Secure your admin access</h1>
              <p className="text-gray-500 mt-1">
                First-time setup is required before you can use the admin panel.
              </p>
            </div>

            {mustChange && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-brand-teal text-white text-xs flex items-center justify-center font-bold">1</span>
                    Change your temporary password
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cur">Current (temporary) password</Label>
                      <Input id="cur" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nxt">New password (min 8 characters)</Label>
                      <Input id="nxt" type="password" value={next} onChange={(e) => setNext(e.target.value)} required minLength={8} />
                    </div>
                    {pwError && <p className="text-xs text-status-critTx">{pwError}</p>}
                    <Button type="submit" disabled={pwBusy}>
                      {pwBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Set new password
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {!totpDone && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-brand-teal text-white text-xs flex items-center justify-center font-bold">2</span>
                    <Smartphone className="h-4 w-4" />
                    Set up two-factor authentication
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!totpUri ? (
                    <form onSubmit={startEnroll} className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Confirm your {mustChange ? "new" : "current"} password to generate an
                        authenticator key for Google Authenticator, Authy or 1Password.
                      </p>
                      <div className="space-y-2">
                        <Label htmlFor="enr-pw">Password</Label>
                        <Input id="enr-pw" type="password" value={enrollPw} onChange={(e) => setEnrollPw(e.target.value)} required />
                      </div>
                      {tError && <p className="text-xs text-status-critTx">{tError}</p>}
                      <Button type="submit" disabled={tBusy}>
                        {tBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Generate authenticator key
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={verifyEnroll} className="space-y-4">
                      <div className="bg-brand-mist rounded-lg p-4">
                        <p className="text-xs text-gray-500 mb-1">In your authenticator app, add an account manually with this key:</p>
                        <p className="font-mono text-sm font-bold text-brand-navy break-all">{secret || totpUri}</p>
                      </div>
                      {backupCodes.length > 0 && (
                        <div className="bg-status-warnBg rounded-lg p-4">
                          <p className="text-xs font-bold text-status-warnTx mb-1">BACKUP CODES — SAVE THESE NOW</p>
                          <p className="font-mono text-xs text-brand-navy break-all">{backupCodes.join("  ")}</p>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="totp-code">6-digit code from the app</Label>
                        <Input
                          id="totp-code"
                          inputMode="numeric"
                          maxLength={6}
                          value={code}
                          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                          required
                        />
                      </div>
                      {tError && <p className="text-xs text-status-critTx">{tError}</p>}
                      <Button type="submit" disabled={tBusy}>
                        {tBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                        Verify & finish
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            )}

            {!mustChange && totpDone && (
              <Card>
                <CardContent className="p-6 text-center">
                  <ShieldCheck className="h-10 w-10 text-brand-teal mx-auto mb-2" />
                  <p className="font-medium text-brand-navy">All set — redirecting to admin…</p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
