"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AttachmentView } from "@/components/attachment-view"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/topbar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Ticket as TicketIcon,
  UserPlus,
  Activity,
  Search,
  Send,
  Loader2,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { useOrgProfile } from "@/lib/profile-store"
import { cn } from "@/lib/utils"

interface Stats {
  totalUsers: number
  new7d: number
  totalTickets: number
  openTickets: number
  activeSessions: number
}

interface DayCount {
  day: string
  count: number
}

interface AdminUser {
  id: string
  name: string
  email: string
  emailVerified: boolean
  hasAvatar: boolean
  createdAt: string
  orgName: string | null
  industry: string | null
  ticketCount: string
}

interface AdminTicket {
  id: string
  userId: string
  email: string
  subject: string
  category: string
  status: string
  messageCount: string
  lastMessage: string | null
  lastByAdmin: boolean | null
  createdAt: string
  updatedAt: string
}

interface TicketMessage {
  id: string
  body: string
  isAdmin: boolean
  authorName: string | null
  image: string | null
  createdAt: string
}

interface TrainingRequest {
  id: string
  userId: string
  email: string
  kind: string
  topic: string
  preferredDate: string
  teamSize: string
  notes: string
  status: string
  createdAt: string
}

interface PasswordAdmin {
  userId: string
  email: string
  name: string
  createdAt: string
}

export default function AdminPage() {
  const { data: session } = useSession()
  const { profile } = useOrgProfile()
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [daily, setDaily] = useState<DayCount[]>([])
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([])
  const [recentTickets, setRecentTickets] = useState<AdminTicket[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [query, setQuery] = useState("")
  const [usersLoading, setUsersLoading] = useState(false)
  const [tickets, setTickets] = useState<AdminTicket[]>([])
  const [ticketFilter, setTicketFilter] = useState("open")
  const [ticketsLoading, setTicketsLoading] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)
  const [thread, setThread] = useState<TicketMessage[]>([])
  const [reply, setReply] = useState("")
  const [sending, setSending] = useState(false)
  // Newsletter publishing
  const [nlTitle, setNlTitle] = useState("")
  const [nlSummary, setNlSummary] = useState("")
  const [nlUrl, setNlUrl] = useState("")
  const [nlSegment, setNlSegment] = useState("All")
  const [nlSend, setNlSend] = useState(true)
  const [nlBusy, setNlBusy] = useState(false)
  const [nlResult, setNlResult] = useState("")
  // Announcements
  const [anTitle, setAnTitle] = useState("")
  const [anBody, setAnBody] = useState("")
  const [anSend, setAnSend] = useState(false)
  const [anBusy, setAnBusy] = useState(false)
  const [anResult, setAnResult] = useState("")
  // Training requests
  const [training, setTraining] = useState<TrainingRequest[]>([])
  const [trainingLoading, setTrainingLoading] = useState(false)
  // Admins
  const [envAdmins, setEnvAdmins] = useState<string[]>([])
  const [pwAdmins, setPwAdmins] = useState<PasswordAdmin[]>([])
  const [newAdminEmail, setNewAdminEmail] = useState("")
  const [newAdminPw, setNewAdminPw] = useState("")
  const [adminBusy, setAdminBusy] = useState(false)
  const [adminResult, setAdminResult] = useState("")

  // Gate: only admins may view (APIs enforce this too)
  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((d) => setAllowed(d.isAdmin === true))
      .catch(() => setAllowed(false))
  }, [])

  const loadOverview = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/overview")
      if (!res.ok) return
      const d = await res.json()
      setStats(d.stats)
      setDaily(d.dailySignups || [])
      setRecentUsers(d.recentUsers || [])
      setRecentTickets(d.recentTickets || [])
    } catch {}
  }, [])

  useEffect(() => {
    if (allowed) loadOverview()
  }, [allowed, loadOverview])

  const loadUsers = useCallback(async (q: string) => {
    setUsersLoading(true)
    try {
      const res = await fetch(`/api/admin/users?q=${encodeURIComponent(q)}`)
      if (res.ok) setUsers((await res.json()).users || [])
    } catch {}
    setUsersLoading(false)
  }, [])

  const loadTickets = useCallback(async (status: string) => {
    setTicketsLoading(true)
    try {
      const res = await fetch(`/api/admin/tickets?status=${status}`)
      if (res.ok) setTickets((await res.json()).tickets || [])
    } catch {}
    setTicketsLoading(false)
  }, [])

  const loadTraining = useCallback(async () => {
    setTrainingLoading(true)
    try {
      const res = await fetch("/api/admin/training?status=all")
      if (res.ok) setTraining((await res.json()).requests || [])
    } catch {}
    setTrainingLoading(false)
  }, [])

  const loadAdmins = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/admins")
      if (res.ok) {
        const d = await res.json()
        setEnvAdmins(d.envAdmins || [])
        setPwAdmins(d.passwordAdmins || [])
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (allowed) {
      loadUsers("")
      loadTickets("open")
      loadTraining()
      loadAdmins()
    }
  }, [allowed, loadUsers, loadTickets, loadTraining, loadAdmins])

  const publishNewsletter = async (e: React.FormEvent) => {
    e.preventDefault()
    setNlBusy(true)
    setNlResult("")
    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: nlTitle, summary: nlSummary, url: nlUrl, segment: nlSegment, sendEmail: nlSend }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || "Publish failed")
      setNlResult(`Published${nlSend ? ` and emailed to ${d.emailed} user(s)` : ""}.${d.emailError ? ` Email note: ${d.emailError}` : ""}`)
      setNlTitle("")
      setNlSummary("")
      setNlUrl("")
    } catch (err) {
      setNlResult((err as Error).message)
    } finally {
      setNlBusy(false)
    }
  }

  const publishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    setAnBusy(true)
    setAnResult("")
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: anTitle, body: anBody, sendEmail: anSend }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || "Publish failed")
      setAnResult(`Published${anSend ? ` and emailed to ${d.emailed} user(s)` : " in-app only"}.${d.emailError ? ` Email note: ${d.emailError}` : ""}`)
      setAnTitle("")
      setAnBody("")
    } catch (err) {
      setAnResult((err as Error).message)
    } finally {
      setAnBusy(false)
    }
  }

  const setTrainingStatus = async (id: string, status: string) => {
    await fetch("/api/admin/training", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    })
    loadTraining()
  }

  const addAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdminBusy(true)
    setAdminResult("")
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newAdminEmail, password: newAdminPw }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || "Could not add admin")
      setAdminResult(`${newAdminEmail} can now sign in at /admin-login with a password.`)
      setNewAdminEmail("")
      setNewAdminPw("")
      loadAdmins()
    } catch (err) {
      setAdminResult((err as Error).message)
    } finally {
      setAdminBusy(false)
    }
  }

  const removePasswordAdmin = async (userId: string) => {
    await fetch(`/api/admin/admins?userId=${userId}`, { method: "DELETE" })
    loadAdmins()
  }

  const openTicket = async (id: string) => {
    setOpenId(id)
    setThread([])
    try {
      const res = await fetch(`/api/tickets/${id}`)
      if (res.ok) setThread((await res.json()).messages || [])
    } catch {}
  }

  const refreshThread = async (id: string) => {
    const res = await fetch(`/api/tickets/${id}`)
    if (res.ok) setThread((await res.json()).messages || [])
    loadTickets(ticketFilter)
    loadOverview()
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reply.trim() || !openId) return
    setSending(true)
    try {
      await fetch(`/api/tickets/${openId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: reply.trim() }),
      })
      setReply("")
      refreshThread(openId)
    } catch {}
    setSending(false)
  }

  const setStatus = async (id: string, status: "open" | "closed") => {
    await fetch("/api/admin/tickets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    })
    refreshThread(id)
  }

  // 30-day chart with zero-filled gaps
  const chart = useMemo(() => {
    const map = new Map(daily.map((d) => [d.day, d.count]))
    const days: DayCount[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      days.push({ day: key, count: map.get(key) || 0 })
    }
    return days
  }, [daily])
  const maxCount = Math.max(1, ...chart.map((d) => d.count))

  const activeTicket = tickets.find((t) => t.id === openId) ||
    recentTickets.find((t) => t.id === openId)

  if (allowed === null) {
    return (
      <div className="min-h-screen bg-brand-mist flex items-center justify-center">
        <p className="text-sm text-gray-500">Checking access…</p>
      </div>
    )
  }

  if (!allowed) {
    return (
      <div className="min-h-screen bg-brand-mist flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 p-4 lg:p-6 flex items-center justify-center">
            <Card className="max-w-sm w-full">
              <CardContent className="p-8 text-center">
                <ShieldAlert className="h-10 w-10 text-status-critTx mx-auto mb-3" />
                <p className="font-semibold text-brand-navy">Admins only</p>
                <p className="text-sm text-gray-500 mt-1">
                  This area is restricted. Signed in as {session?.user?.email || "unknown"}.
                </p>
              </CardContent>
            </Card>
          </main>
        </div>
        <MobileNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-mist flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          orgName={profile.orgName || "My Organization"}
          userName={profile.displayName || session?.user?.name || ""}
          avatar={profile.avatar}
        />
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-brand-navy">Admin</h1>
              <p className="text-gray-500 mt-1">Users, signups, and support tickets.</p>
            </div>

            <Tabs defaultValue="overview">
              <TabsList className="flex-wrap h-auto">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="tickets">
                  Tickets{stats && stats.openTickets > 0 ? ` (${stats.openTickets})` : ""}
                </TabsTrigger>
                <TabsTrigger value="newsletter">Briefing</TabsTrigger>
                <TabsTrigger value="announce">Announcements</TabsTrigger>
                <TabsTrigger value="training">Training</TabsTrigger>
                <TabsTrigger value="admins">Admins</TabsTrigger>
              </TabsList>

              {/* OVERVIEW */}
              <TabsContent value="overview" className="space-y-6 mt-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Total users", value: stats?.totalUsers ?? "—", icon: Users },
                    { label: "New (7 days)", value: stats?.new7d ?? "—", icon: UserPlus },
                    { label: "Open tickets", value: stats?.openTickets ?? "—", icon: TicketIcon },
                    { label: "Active sessions", value: stats?.activeSessions ?? "—", icon: Activity },
                  ].map((s) => (
                    <Card key={s.label}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-gray-500">
                          <s.icon className="h-4 w-4" />
                          <p className="text-xs">{s.label}</p>
                        </div>
                        <p className="text-2xl font-bold text-brand-navy mt-1">{s.value}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Signups — last 30 days
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end gap-1 h-28">
                      {chart.map((d) => (
                        <div
                          key={d.day}
                          title={`${d.day}: ${d.count}`}
                          className="flex-1 bg-brand-teal/70 hover:bg-brand-teal rounded-t min-h-[3px] transition-colors"
                          style={{ height: `${Math.max(2, (d.count / maxCount) * 100)}%` }}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium text-gray-500">
                        Recent signups
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {recentUsers.map((u) => (
                        <div key={u.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-brand-mist text-sm">
                          <div className="min-w-0">
                            <p className="font-medium text-brand-navy truncate">{u.name || "—"}</p>
                            <p className="text-xs text-gray-500 truncate">{u.email}{u.orgName ? ` • ${u.orgName}` : ""}</p>
                          </div>
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            {new Date(u.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      ))}
                      {recentUsers.length === 0 && <p className="text-sm text-gray-500">No users yet.</p>}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium text-gray-500">
                        Latest tickets
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {recentTickets.map((t) => (
                        <button key={t.id} onClick={() => setOpenId(t.id)} className="w-full text-left">
                          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-brand-mist text-sm">
                            <div className="min-w-0">
                              <p className="font-medium text-brand-navy truncate">{t.subject}</p>
                              <p className="text-xs text-gray-500 truncate">{t.email}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {t.status === "open" && !t.lastByAdmin && (
                                <Badge variant="destructive" className="text-[10px]">Needs reply</Badge>
                              )}
                              <Badge variant={t.status === "open" ? "likely" : "secondary"} className="text-[10px]">
                                {t.status}
                              </Badge>
                            </div>
                          </div>
                        </button>
                      ))}
                      {recentTickets.length === 0 && <p className="text-sm text-gray-500">No tickets yet.</p>}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* USERS */}
              <TabsContent value="users" className="space-y-4 mt-4">
                <form
                  onSubmit={(e) => { e.preventDefault(); loadUsers(query) }}
                  className="flex gap-2"
                >
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search name or email…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button type="submit">Search</Button>
                </form>
                <Card>
                  <CardContent className="p-2">
                    {usersLoading ? (
                      <p className="text-sm text-gray-500 p-4">Loading users…</p>
                    ) : users.length === 0 ? (
                      <p className="text-sm text-gray-500 p-4">No users found.</p>
                    ) : (
                      users.map((u) => (
                        <div key={u.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-brand-mist">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-brand-navy text-sm truncate">
                              {u.name || "—"}{" "}
                              {!u.emailVerified && (
                                <Badge variant="secondary" className="text-[10px] ml-1">unverified</Badge>
                              )}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {u.email}
                              {u.orgName ? ` • ${u.orgName}` : ""}
                              {u.industry ? ` (${u.industry})` : ""}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-gray-500">
                              {Number(u.ticketCount) > 0 ? `${u.ticketCount} ticket(s)` : "No tickets"}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              Joined {new Date(u.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TICKETS */}
              <TabsContent value="tickets" className="space-y-4 mt-4">
                {!openId ? (
                  <>
                    <div className="flex gap-2">
                      {(["open", "closed", "all"] as const).map((s) => (
                        <Button
                          key={s}
                          size="sm"
                          variant={ticketFilter === s ? "default" : "outline"}
                          onClick={() => { setTicketFilter(s); loadTickets(s) }}
                        >
                          {s[0].toUpperCase() + s.slice(1)}
                        </Button>
                      ))}
                    </div>
                    <div className="space-y-2">
                      {ticketsLoading ? (
                        <p className="text-sm text-gray-500">Loading tickets…</p>
                      ) : tickets.length === 0 ? (
                        <p className="text-sm text-gray-500">No tickets here.</p>
                      ) : (
                        tickets.map((t) => (
                          <button key={t.id} onClick={() => openTicket(t.id)} className="w-full text-left">
                            <Card className="hover:border-brand-teal/40 transition-colors">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-medium text-brand-navy text-sm">{t.subject}</p>
                                  {t.status === "open" && !t.lastByAdmin && (
                                    <Badge variant="destructive" className="text-[10px]">Needs reply</Badge>
                                  )}
                                  <Badge variant={t.status === "open" ? "likely" : "secondary"} className="text-[10px]">
                                    {t.status}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 truncate">
                                  {t.email} • {t.category} • {t.messageCount} message(s) • updated{" "}
                                  {new Date(t.updatedAt).toLocaleString("en-NG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </p>
                                {t.lastMessage && (
                                  <p className="text-xs text-gray-400 mt-1 truncate">“{t.lastMessage}”</p>
                                )}
                              </CardContent>
                            </Card>
                          </button>
                        ))
                      )}
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={() => { setOpenId(null); setThread([]) }}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-navy"
                    >
                      <ArrowLeft className="h-4 w-4" /> Back to queue
                    </button>
                    {activeTicket && (
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between gap-4">
                          <div>
                            <CardTitle className="text-base">{activeTicket.subject}</CardTitle>
                            <p className="text-xs text-gray-500 mt-1">
                              {activeTicket.email} • {activeTicket.category}
                            </p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            {activeTicket.status === "open" ? (
                              <Button size="sm" variant="outline" onClick={() => setStatus(activeTicket.id, "closed")}>
                                <CheckCircle2 className="mr-1 h-3 w-3" /> Close
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => setStatus(activeTicket.id, "open")}>
                                Reopen
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {thread.map((m) => (
                            <div
                              key={m.id}
                              className={cn(
                                "rounded-lg p-3 text-sm max-w-[90%]",
                                m.isAdmin ? "bg-brand-teal/10 text-brand-navy ml-auto" : "bg-brand-mist text-brand-navy"
                              )}
                            >
                              <p className="text-[11px] mb-1 font-medium text-gray-500">
                                {m.isAdmin ? "You (support)" : m.authorName || activeTicket.email} •{" "}
                                {new Date(m.createdAt).toLocaleString("en-NG", {
                                  month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                                })}
                              </p>
                              <p className="whitespace-pre-wrap leading-relaxed">{m.body}</p>
                              {m.image && <AttachmentView src={m.image} />}
                            </div>
                          ))}
                          <form onSubmit={handleReply} className="flex gap-2 pt-2">
                            <Input
                              placeholder="Reply as support…"
                              value={reply}
                              onChange={(e) => setReply(e.target.value)}
                            />
                            <Button type="submit" disabled={sending || !reply.trim()}>
                              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                          </form>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* NEWSLETTER */}
              <TabsContent value="newsletter" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Publish a GRC briefing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={publishNewsletter} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="nl-title">Headline</Label>
                        <Input id="nl-title" value={nlTitle} onChange={(e) => setNlTitle(e.target.value)} placeholder="e.g. NDPC fines X for…" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nl-summary">Summary (why it matters to SMBs)</Label>
                        <Textarea id="nl-summary" rows={4} value={nlSummary} onChange={(e) => setNlSummary(e.target.value)} required />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nl-url">Source URL (real article)</Label>
                          <Input id="nl-url" value={nlUrl} onChange={(e) => setNlUrl(e.target.value)} placeholder="https://…" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="nl-seg">Segment</Label>
                          <Input id="nl-seg" value={nlSegment} onChange={(e) => setNlSegment(e.target.value)} placeholder="All" />
                        </div>
                      </div>
                      <label className="flex items-center gap-2 text-sm text-brand-navy">
                        <input type="checkbox" checked={nlSend} onChange={(e) => setNlSend(e.target.checked)} className="h-4 w-4 accent-brand-teal" />
                        Also email to all subscribed users
                      </label>
                      {nlResult && <p className="text-xs text-brand-navy bg-brand-mist rounded-lg p-3">{nlResult}</p>}
                      <Button type="submit" disabled={nlBusy}>
                        {nlBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Publish briefing
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ANNOUNCEMENTS */}
              <TabsContent value="announce" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Product announcements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-500 mb-4">
                      Shows under every user&apos;s notification bell. Optionally emailed to everyone.
                    </p>
                    <form onSubmit={publishAnnouncement} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="an-title">Title</Label>
                        <Input id="an-title" value={anTitle} onChange={(e) => setAnTitle(e.target.value)} placeholder="e.g. New: evidence attachments" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="an-body">Message</Label>
                        <Textarea id="an-body" rows={4} value={anBody} onChange={(e) => setAnBody(e.target.value)} required />
                      </div>
                      <label className="flex items-center gap-2 text-sm text-brand-navy">
                        <input type="checkbox" checked={anSend} onChange={(e) => setAnSend(e.target.checked)} className="h-4 w-4 accent-brand-teal" />
                        Also email to all users
                      </label>
                      {anResult && <p className="text-xs text-brand-navy bg-brand-mist rounded-lg p-3">{anResult}</p>}
                      <Button type="submit" disabled={anBusy}>
                        {anBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Publish update
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TRAINING */}
              <TabsContent value="training" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Training requests</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {trainingLoading ? (
                      <p className="text-sm text-gray-500">Loading…</p>
                    ) : training.length === 0 ? (
                      <p className="text-sm text-gray-500">No requests yet.</p>
                    ) : (
                      training.map((r) => (
                        <div key={r.id} className="p-3 rounded-lg bg-brand-mist text-sm">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <p className="font-medium text-brand-navy">{r.topic}</p>
                            <Badge variant={r.status === "done" ? "default" : r.status === "approved" ? "likely" : "secondary"} className="text-[10px]">
                              {r.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {r.email} • {r.kind === "trainer" ? "With our trainers" : "Internal"} • {r.preferredDate}
                            {r.teamSize ? ` • ${r.teamSize} staff` : ""}{r.notes ? ` • “${r.notes}”` : ""}
                          </p>
                          <div className="flex gap-2 mt-2">
                            {r.status === "pending" && (
                              <Button size="sm" variant="outline" onClick={() => setTrainingStatus(r.id, "approved")}>Approve</Button>
                            )}
                            {r.status !== "done" && (
                              <Button size="sm" variant="outline" onClick={() => setTrainingStatus(r.id, "done")}>Mark done</Button>
                            )}
                            {r.status === "done" && (
                              <Button size="sm" variant="ghost" onClick={() => setTrainingStatus(r.id, "pending")}>Reopen</Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ADMINS */}
              <TabsContent value="admins" className="mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Administrators</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">ALWAYS ADMIN (ENV LIST)</p>
                      {envAdmins.map((e) => (
                        <p key={e} className="text-sm text-brand-navy">• {e}</p>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">PASSWORD ADMINS</p>
                      {pwAdmins.length === 0 ? (
                        <p className="text-sm text-gray-500">None yet — add the first below.</p>
                      ) : (
                        pwAdmins.map((a) => (
                          <div key={a.userId} className="flex items-center justify-between p-2 rounded-lg hover:bg-brand-mist text-sm">
                            <span className="text-brand-navy">{a.email}</span>
                            <button onClick={() => removePasswordAdmin(a.userId)} className="text-xs text-status-critTx hover:underline">
                              Remove password access
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                    <form onSubmit={addAdmin} className="space-y-3 pt-2 border-t border-border">
                      <p className="text-xs font-medium text-gray-500">ADD / RESET PASSWORD ADMIN</p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="adm-email">Email</Label>
                          <Input id="adm-email" type="email" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} required />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="adm-pw">Password (min 8 chars)</Label>
                          <Input id="adm-pw" type="password" value={newAdminPw} onChange={(e) => setNewAdminPw(e.target.value)} required minLength={8} />
                        </div>
                      </div>
                      {adminResult && <p className="text-xs text-brand-navy bg-brand-mist rounded-lg p-3">{adminResult}</p>}
                      <Button type="submit" size="sm" disabled={adminBusy}>
                        {adminBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save admin
                      </Button>
                      <p className="text-xs text-gray-400">They sign in at /admin-login with email + password.</p>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
