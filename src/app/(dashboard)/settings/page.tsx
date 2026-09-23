"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/topbar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { StateSelector } from "@/components/state-selector"
import {
  ContextBuilder,
  composeContext,
  parseContextDetail,
  EMPTY_CONTEXT_DETAIL,
  type ContextDetail,
} from "@/components/context-builder"
import { User, CreditCard, Bell, Shield, LogOut, Camera, Loader2, CheckCircle2, Lock, Trash2 } from "lucide-react"
import { authClient, useSession } from "@/lib/auth-client"
import { userTimeZone } from "@/lib/format"
import { fileToAvatarDataUrl, getLocalProfile, saveLocalProfile } from "@/lib/profile-store"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const fileRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [avatar, setAvatar] = useState<string | null>(null)
  const [orgName, setOrgName] = useState("")
  const [industry, setIndustry] = useState("")
  const [sizeBand, setSizeBand] = useState("")
  const [states, setStates] = useState("")
  const [context, setContext] = useState("")
  const [ctxDetail, setCtxDetail] = useState<ContextDetail>(EMPTY_CONTEXT_DETAIL)
  const [prefs, setPrefs] = useState<Record<string, Record<string, boolean>>>({})
  const [prefsLoaded, setPrefsLoaded] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  const USER_GROUPS = [
    { key: "ticket", label: "Support ticket updates", desc: "Replies and status changes on your tickets", channels: ["app", "email"] as const },
    { key: "service", label: "Service request updates", desc: "Quote and status updates on your requests", channels: ["app", "email"] as const },
    { key: "training", label: "Training updates", desc: "Confirmations and status of training requests", channels: ["app", "email"] as const },
    { key: "briefing", label: "GRC briefing emails", desc: "Real compliance news, emailed when published", channels: ["email"] as const },
    { key: "announcement", label: "Product announcements", desc: "New features and notices from our team", channels: ["app", "email"] as const },
  ]
  const ADMIN_GROUPS = [
    { key: "ticket_new", label: "New tickets", desc: "A user opened a support ticket", channels: ["app", "email"] as const },
    { key: "service_new", label: "New service requests", desc: "A user requested a service", channels: ["app", "email"] as const },
    { key: "training_new", label: "New training requests", desc: "A user requested training", channels: ["app", "email"] as const },
  ]

  const prefOn = (event: string, channel: string): boolean =>
    prefs[event]?.[channel] ?? true

  const setToggle = async (event: string, channel: string, on: boolean) => {
    setPrefs((prev) => ({ ...prev, [event]: { ...prev[event], [channel]: on } }))
    try {
      await fetch("/api/notifications/prefs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, channel, enabled: on }),
      })
    } catch {}
  }
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [avatarError, setAvatarError] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  // Load session + server profile, fall back to local copy
  useEffect(() => {
    const local = getLocalProfile()
    setOrgName(local.orgName)
    setIndustry(local.industry)
    setSizeBand(local.sizeBand)
    setStates(local.states)
    setContext(local.context)
    if (local.contextDetail || local.context) {
      setCtxDetail(parseContextDetail(local.contextDetail || "", local.context || ""))
    }
    setAvatar(local.avatar)
    setName(local.displayName)
    fetch("/api/notifications/prefs")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.prefs) setPrefs(d.prefs)
        setPrefsLoaded(true)
      })
      .catch(() => setPrefsLoaded(true))
    fetch("/api/admin/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setIsAdmin(d.isAdmin === true))
      .catch(() => {})
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return
        if (data.user) {
          setName((n) => data.user.name || n)
          setEmail(data.user.email || "")
          if (data.user.image) setAvatar(data.user.image)
        }
        if (data.profile) {
          const p = data.profile
          setOrgName(p.orgName || "")
          setIndustry(p.industry || "")
          setSizeBand(p.sizeBand || "")
          setStates(p.states || "")
          setContext(p.context || "")
          if (p.displayName && !data.user?.name) setName(p.displayName)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (session?.user?.email) setEmail(session.user.email)
    if (session?.user?.name) setName((n) => n || session.user.name)
  }, [session])

  const handleAvatarPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarError("")
    try {
      const dataUrl = await fileToAvatarDataUrl(file)
      setAvatar(dataUrl)
    } catch {
      setAvatarError("Could not read that image. Try a JPG or PNG.")
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    // Industry is locked after first save — never send a change for it
    const composed = composeContext(ctxDetail)
    setContext(composed)
    const patch = {
      displayName: name.trim(),
      orgName: orgName.trim(),
      sizeBand,
      states,
      context: composed,
      contextDetail: JSON.stringify(ctxDetail),
      avatar,
    }
    saveLocalProfile({ ...patch, industry })
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), ...patch }),
      })
      if (!res.ok) throw new Error("save failed")
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setAvatarError("Saved on this device, but server sync failed. Check your connection.")
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await authClient.signOut()
    } finally {
      router.push("/login")
      router.refresh()
    }
  }

  const handleDelete = async () => {
    if (deleteConfirm.trim().toLowerCase() !== email.toLowerCase() || !email) return
    setDeleting(true)
    try {
      const res = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmEmail: deleteConfirm.trim() }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Delete failed")
      try {
        window.localStorage.clear()
      } catch {}
      await authClient.signOut()
      router.push("/")
      router.refresh()
    } catch {
      setAvatarError("Could not delete your account. Contact support and we'll do it.")
    } finally {
      setDeleting(false)
    }
  }

  const Toggle = ({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) => (
    <button onClick={onClick} aria-label={label} className={cn("h-5 w-9 rounded-full relative transition-colors flex-shrink-0", on ? "bg-brand-teal" : "bg-gray-300")}>
      <div className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all", on ? "right-0.5" : "left-0.5")} />
    </button>
  )

  return (
    <div className="min-h-screen bg-brand-mist flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar orgName={orgName || "My Organization"} userName={name} avatar={avatar} />
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-brand-navy">Settings</h1>

            {/* Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-brand-teal/15 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatar} alt="Profile photo" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold text-brand-teal">
                        {(name.trim()[0] || "?").toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleAvatarPick}
                    />
                    <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                      <Camera className="mr-2 h-4 w-4" />
                      {avatar ? "Change photo" : "Upload photo"}
                    </Button>
                    {avatar && (
                      <button
                        onClick={() => setAvatar(null)}
                        className="ml-3 text-xs text-gray-500 hover:text-status-critTx"
                      >
                        Remove
                      </button>
                    )}
                    <p className="text-xs text-gray-400 mt-1">JPG or PNG, cropped to a small square.</p>
                  </div>
                </div>
                {avatarError && <p className="text-xs text-status-critTx">{avatarError}</p>}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="set-name">Name</Label>
                    <Input
                      id="set-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Adaeze Obi"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="set-email">Email</Label>
                    <Input id="set-email" value={email} disabled placeholder="you@company.com" />
                  </div>
                </div>
                <p className="text-xs text-gray-400">
                  Dates and greetings use your location timezone: {userTimeZone()} (auto-detected).
                </p>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="mr-2 h-4 w-4" /> : null}
                  {saving ? "Saving…" : saved ? "Saved!" : "Save changes"}
                </Button>
              </CardContent>
            </Card>

            {/* Organization */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Organization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="set-org">Organization name</Label>
                    <Input
                      id="set-org"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="e.g. Acme Fintech Ltd"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="set-industry">Industry (locked)</Label>
                    <div className="relative">
                      <Input
                        id="set-industry"
                        value={industry}
                        disabled
                        placeholder="Set during profiler"
                      />
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-400">
                      Chosen once during setup — it drives your entire profile and cannot be changed.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="set-size">Team size</Label>
                    <Input
                      id="set-size"
                      value={sizeBand}
                      onChange={(e) => setSizeBand(e.target.value)}
                      placeholder="e.g. 11-50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Operating states</Label>
                  <StateSelector value={states} onChange={setStates} />
                </div>
                <div className="space-y-2">
                  <Label>Organizational context</Label>
                  <ContextBuilder value={ctxDetail} onChange={setCtxDetail} />
                  <p className="text-xs text-gray-400">Editing this re-tailors your policy list.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button size="sm" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving…" : "Save organization"}
                  </Button>
                  <Link href="/onboarding" className="text-sm text-brand-teal hover:underline">
                    Re-take profiler
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Billing */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Billing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-brand-mist rounded-lg">
                  <div>
                    <p className="font-medium text-brand-navy text-sm">
                      Free Plan
                    </p>
                    <p className="text-xs text-gray-500">
                      Profile, health-checks, deadlines, briefing
                    </p>
                  </div>
                  <Button size="sm" onClick={() => router.push("/services")}>Request a quote</Button>
                </div>
              </CardContent>
            </Card>

            {/* Notifications — every alert, both channels, all switchable */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {!prefsLoaded ? (
                  <p className="text-sm text-gray-500 p-2">Loading preferences…</p>
                ) : (
                  USER_GROUPS.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-brand-mist"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-brand-navy">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {item.channels.map((ch) => (
                          <span key={ch} className="flex items-center gap-1.5">
                            <span className="text-[11px] text-gray-400">
                              {ch === "app" ? "In-app" : "Email"}
                            </span>
                            <Toggle
                              on={prefOn(item.key, ch)}
                              onClick={() => setToggle(item.key, ch, !prefOn(item.key, ch))}
                              label={`${item.label} ${ch}`}
                            />
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Admin alerts — only visible to admins */}
            {isAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Admin alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {!prefsLoaded ? (
                    <p className="text-sm text-gray-500 p-2">Loading preferences…</p>
                  ) : (
                    ADMIN_GROUPS.map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-brand-mist"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-brand-navy">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {item.channels.map((ch) => (
                            <span key={ch} className="flex items-center gap-1.5">
                              <span className="text-[11px] text-gray-400">
                                {ch === "app" ? "In-app" : "Email"}
                              </span>
                              <Toggle
                                on={prefOn(item.key, ch)}
                                onClick={() => setToggle(item.key, ch, !prefOn(item.key, ch))}
                                label={`${item.label} ${ch}`}
                              />
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )}

            {/* Sign out */}
            <Card className="border-status-critBg">
              <CardContent className="p-4">
                <Button variant="destructive" className="w-full" onClick={handleSignOut} disabled={signingOut}>
                  {signingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                  {signingOut ? "Signing out…" : "Sign out"}
                </Button>
              </CardContent>
            </Card>

            {/* Delete account */}
            <Card className="border-status-critTx">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-status-critTx">
                  <Trash2 className="h-4 w-4" />
                  Danger zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!showDelete ? (
                  <Button variant="outline" size="sm" onClick={() => setShowDelete(true)} className="text-status-critTx border-status-critTx/30">
                    Delete my account…
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      This permanently deletes your account, profile, tickets, evidence and
                      deadlines. This cannot be undone. Type your email to confirm:
                    </p>
                    <Input
                      placeholder={email || "you@company.com"}
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={deleting || deleteConfirm.trim().toLowerCase() !== (email || "").toLowerCase() || !email}
                        onClick={handleDelete}
                      >
                        {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {deleting ? "Deleting…" : "Delete everything"}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setShowDelete(false); setDeleteConfirm("") }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
