"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AttachmentView } from "@/components/attachment-view"
import { PasswordInput } from "@/components/password-input"
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
  Trash2,
  X,
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

interface ServiceRequest {
  id: string
  userId: string
  email: string
  service: string
  policy: string
  name: string
  org: string
  timeline: string
  currentState: string
  details: string
  status: string
  createdAt: string
}

interface PasswordAdmin {
  userId: string
  email: string
  name: string
  firstName: string
  lastName: string
  role: string
  mustChangePassword: boolean
  hasPassword: boolean
  totpEnrolled: boolean
  createdAt: string
}

interface UserDetail {
  user: { id: string; name: string; email: string; emailVerified: boolean; hasAvatar: boolean; createdAt: string }
  profile: {
    displayName: string; orgName: string; industry: string; sizeBand: string; states: string
    dataTypes: string[]; handlesPayments: boolean; healthData: boolean; hasWebsite: boolean
    enterpriseClients: boolean; context: string; newsletterOptOut: boolean
    createdAt: string; updatedAt: string
  } | null
  evidence: { id: string; actionId: string; title: string; evidence: string; hasAttachment: boolean; createdAt: string }[]
  tickets: { id: string; subject: string; category: string; status: string; messageCount: string; createdAt: string; updatedAt: string }[]
  training: { id: string; kind: string; topic: string; preferredDate: string; teamSize: string; status: string; createdAt: string }[]
  sessions: { total: number; lastSeen: string | null }
  adminRole: string | null
}

export default function AdminPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { profile } = useOrgProfile()
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [meRole, setMeRole] = useState<string>("super")
  const [detailId, setDetailId] = useState<string | null>(null)
  const [detail, setDetail] = useState<UserDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [tab, setTab] = useState<string | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [daily, setDaily] = useState<DayCount[]>([])
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([])
  const [recentTickets, setRecentTickets] = useState<AdminTicket[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [query, setQuery] = useState("")
  const [usersLoading, setUsersLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
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
  // Service requests
  const [services, setServices] = useState<ServiceRequest[]>([])
  const [servicesLoading, setServicesLoading] = useState(false)
  // Admins
  const [envAdmins, setEnvAdmins] = useState<string[]>([])
  const [pwAdmins, setPwAdmins] = useState<PasswordAdmin[]>([])
  const [newAdminFirst, setNewAdminFirst] = useState("")
  const [newAdminLast, setNewAdminLast] = useState("")
  const [newAdminEmail, setNewAdminEmail] = useState("")
  const [newAdminRole, setNewAdminRole] = useState("support")
  const [newAdminPw, setNewAdminPw] = useState("")
  const [adminBusy, setAdminBusy] = useState(false)
  const [adminResult, setAdminResult] = useState("")
  const [editingAdmin, setEditingAdmin] = useState<string | null>(null)
  const [editFirst, setEditFirst] = useState("")
  const [editLast, setEditLast] = useState("")
  const [editRole, setEditRole] = useState("support")

  // Gate: only admins may view (APIs enforce this too).
  // Pending first-time security (password change / 2FA) redirects away.
  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((d) => {
        setAllowed(d.isAdmin === true)
        if (d.isAdmin === true) {
          setMeRole(d.role || "super")
          if (d.mustChangePassword === true || d.totpEnrolled === false) {
            router.replace("/admin-security")
          }
        }
      })
      .catch(() => setAllowed(false))
  }, [router])

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

  const openUserDetail = async (id: string) => {
    setDetailId(id)
    setDetail(null)
    setDetailLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${id}`)
      if (res.ok) setDetail(await res.json())
    } catch {}
    setDetailLoading(false)
  }

  const loadServices = useCallback(async () => {
    setServicesLoading(true)
    try {
      const res = await fetch("/api/admin/service-requests?status=all")
      if (res.ok) setServices((await res.json()).requests || [])
    } catch {}
    setServicesLoading(false)
  }, [])

  const setServiceStatus = async (id: string, status: string) => {
    await fetch("/api/admin/service-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    })
    loadServices()
  }

  useEffect(() => {
    if (allowed) {
      loadUsers("")
      loadTickets("open")
      loadTraining()
      loadServices()
      loadAdmins()
    }
  }, [allowed, loadUsers, loadTickets, loadTraining, loadServices, loadAdmins])

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
        body: JSON.stringify({
          email: newAdminEmail,
          firstName: newAdminFirst,
          lastName: newAdminLast,
          role: newAdminRole,
          password: newAdminPw,
        }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || "Could not add admin")
      setAdminResult(`${newAdminEmail} added as ${newAdminRole}. They sign in at /admin-login, then must change the password and set up 2FA.`)
      setNewAdminFirst("")
      setNewAdminLast("")
      setNewAdminEmail("")
      setNewAdminPw("")
      loadAdmins()
    } catch (err) {
      setAdminResult((err as Error).message)
    } finally {
      setAdminBusy(false)
    }
  }

  const saveAdminEdit = async (userId: string) => {
    const res = await fetch("/api/admin/admins", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, firstName: editFirst, lastName: editLast, role: editRole }),
    })
    if (res.ok) {
      setEditingAdmin(null)
      loadAdmins()
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

            <Tabs
              value={tab || (meRole === "super" ? "overview" : meRole === "support" ? "users" : "newsletter")}
              onValueChange={setTab}
            >
              <TabsList className="flex-wrap h-auto">
                {meRole === "super" && <TabsTrigger value="overview">Overview</TabsTrigger>}
                {(meRole === "super" || meRole === "support") && <TabsTrigger value="users">Users</TabsTrigger>}
                {(meRole === "super" || meRole === "support") && (
                  <TabsTrigger value="tickets">
                    Tickets{stats && stats.openTickets > 0 ? ` (${stats.openTickets})` : ""}
                  </TabsTrigger>
                )}
                {(meRole === "super" || meRole === "content") && <TabsTrigger value="newsletter">Briefing</TabsTrigger>}
                {(meRole === "super" || meRole === "content") && <TabsTrigger value="announce">Announcements</TabsTrigger>}
                {(meRole === "super" || meRole === "support") && <TabsTrigger value="training">Training</TabsTrigger>}
                {(meRole === "super" || meRole === "support") && (
                  <TabsTrigger value="services">
                    Services{services.filter((s) => s.status === "pending").length > 0 ? ` (${services.filter((s) => s.status === "pending").length})` : ""}
                  </TabsTrigger>
                )}
                {meRole === "super" && <TabsTrigger value="admins">Admins</TabsTrigger>}
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
                        <div
                          key={u.id}
                          onClick={() => openUserDetail(u.id)}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-brand-mist cursor-pointer"
                        >
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
                          {confirmDelete === u.id ? (
                            <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={async () => {
                                  await fetch(`/api/admin/users?userId=${u.id}`, { method: "DELETE" })
                                  setConfirmDelete(null)
                                  loadUsers(query)
                                  loadOverview()
                                }}
                              >
                                Confirm
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(null)}>
                                Keep
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-gray-400 hover:text-status-critTx flex-shrink-0"
                              onClick={(e) => { e.stopPropagation(); setConfirmDelete(u.id) }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
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

              {/* SERVICE REQUESTS */}
              <TabsContent value="services" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Service requests</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {servicesLoading ? (
                      <p className="text-sm text-gray-500">Loading…</p>
                    ) : services.length === 0 ? (
                      <p className="text-sm text-gray-500">No service requests yet.</p>
                    ) : (
                      services.map((r) => (
                        <div key={r.id} className="p-3 rounded-lg bg-brand-mist text-sm">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <p className="font-medium text-brand-navy">
                              {r.service}{r.policy ? ` — ${r.policy}` : ""}
                            </p>
                            <Badge variant={r.status === "done" ? "default" : r.status === "pending" ? "destructive" : "likely"} className="text-[10px]">
                              {r.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {r.name} • {r.email}{r.org ? ` • ${r.org}` : ""} • {r.timeline}
                            {r.currentState ? ` • ${r.currentState}` : ""}
                          </p>
                          <p className="text-xs text-gray-600 mt-1 whitespace-pre-wrap leading-relaxed">{r.details}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {["pending", "quoted", "approved", "done"].filter((s) => s !== r.status).map((s) => (
                              <Button key={s} size="sm" variant="outline" onClick={() => setServiceStatus(r.id, s)}>
                                Mark {s}
                              </Button>
                            ))}
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
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">SUPER ADMIN (ENV, ALWAYS ON)</p>
                      {envAdmins.map((e) => (
                        <p key={e} className="text-sm text-brand-navy">• {e} <Badge variant="default" className="text-[10px] ml-1">super</Badge></p>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">
                        MANAGED ADMINS — roles: <strong>super</strong> (everything), <strong>support</strong> (users + tickets + training), <strong>content</strong> (briefing + announcements)
                      </p>
                      {pwAdmins.length === 0 ? (
                        <p className="text-sm text-gray-500">None yet — add the first below.</p>
                      ) : (
                        <div className="space-y-2">
                          {pwAdmins.map((a) => (
                            <div key={a.userId} className="p-3 rounded-lg bg-brand-mist text-sm">
                              {editingAdmin === a.userId ? (
                                <div className="space-y-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <Input value={editFirst} onChange={(e) => setEditFirst(e.target.value)} placeholder="First name" />
                                    <Input value={editLast} onChange={(e) => setEditLast(e.target.value)} placeholder="Last name" />
                                  </div>
                                  <select
                                    value={editRole}
                                    onChange={(e) => setEditRole(e.target.value)}
                                    className="flex h-9 w-full rounded-lg border border-border bg-white px-3 text-sm text-brand-navy"
                                  >
                                    <option value="super">super — everything</option>
                                    <option value="support">support — users, tickets, training</option>
                                    <option value="content">content — briefing, announcements</option>
                                  </select>
                                  <div className="flex gap-2">
                                    <Button size="sm" onClick={() => saveAdminEdit(a.userId)}>Save</Button>
                                    <Button size="sm" variant="ghost" onClick={() => setEditingAdmin(null)}>Cancel</Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="font-medium text-brand-navy truncate">
                                      {a.firstName || a.lastName ? `${a.firstName} ${a.lastName}`.trim() : a.name || a.email}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">{a.email}</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      <Badge variant={a.role === "super" ? "default" : "secondary"} className="text-[10px]">{a.role}</Badge>
                                      {!a.hasPassword && <Badge variant="destructive" className="text-[10px]">no password</Badge>}
                                      {a.mustChangePassword && <Badge variant="likely" className="text-[10px]">must change pw</Badge>}
                                      <Badge variant={a.totpEnrolled ? "applies" : "secondary"} className="text-[10px]">
                                        {a.totpEnrolled ? "2FA on" : "no 2FA"}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="flex flex-col gap-1 flex-shrink-0">
                                    <button
                                      onClick={() => { setEditingAdmin(a.userId); setEditFirst(a.firstName); setEditLast(a.lastName); setEditRole(a.role) }}
                                      className="text-xs text-brand-teal hover:underline"
                                    >
                                      Edit
                                    </button>
                                    <button onClick={() => removePasswordAdmin(a.userId)} className="text-xs text-status-critTx hover:underline">
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <form onSubmit={addAdmin} className="space-y-3 pt-3 border-t border-border">
                      <p className="text-xs font-medium text-gray-500">ADD ADMIN (FORCED PW CHANGE + 2FA ON FIRST SIGN-IN)</p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="adm-first">First name</Label>
                          <Input id="adm-first" value={newAdminFirst} onChange={(e) => setNewAdminFirst(e.target.value)} required />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="adm-last">Last name</Label>
                          <Input id="adm-last" value={newAdminLast} onChange={(e) => setNewAdminLast(e.target.value)} required />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="adm-email">Email</Label>
                          <Input id="adm-email" type="email" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} required />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="adm-role">Access level</Label>
                          <select
                            id="adm-role"
                            value={newAdminRole}
                            onChange={(e) => setNewAdminRole(e.target.value)}
                            className="flex h-10 w-full rounded-lg border border-border bg-white px-4 text-sm text-brand-navy"
                          >
                            <option value="support">support — users, tickets, training</option>
                            <option value="content">content — briefing, announcements</option>
                            <option value="super">super — everything</option>
                          </select>
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                          <PasswordInput id="adm-pw" label="Temporary password (min 8 chars — they must change it)" value={newAdminPw} onChange={setNewAdminPw} required minLength={8} />
                        </div>
                      </div>
                      {adminResult && <p className="text-xs text-brand-navy bg-brand-mist rounded-lg p-3">{adminResult}</p>}
                      <Button type="submit" size="sm" disabled={adminBusy}>
                        {adminBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add admin
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* USER DETAIL MODAL */}
            {detailId && (
              <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-brand-navy/50 p-0 sm:p-6">
                <div className="bg-white w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl">
                  <div className="sticky top-0 bg-white border-b border-border px-5 py-4 flex items-center justify-between">
                    <h2 className="font-bold text-brand-navy text-sm">User detail</h2>
                    <Button variant="ghost" size="icon" onClick={() => { setDetailId(null); setDetail(null) }} aria-label="Close">
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="p-5 space-y-5">
                    {detailLoading ? (
                      <p className="text-sm text-gray-500">Loading everything about this user…</p>
                    ) : !detail ? (
                      <p className="text-sm text-status-critTx">Could not load user.</p>
                    ) : (
                      <>
                        <section>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Account</p>
                          <div className="bg-brand-mist rounded-lg p-3 text-sm space-y-1">
                            <p className="font-semibold text-brand-navy">{detail.user.name || "—"}</p>
                            <p className="text-gray-600">{detail.user.email}</p>
                            <p className="text-xs text-gray-500">
                              Joined {new Date(detail.user.createdAt).toLocaleString("en-NG")} •
                              Email {detail.user.emailVerified ? "verified" : "not verified"} •
                              {detail.sessions.total} session(s)
                              {detail.sessions.lastSeen ? ` • last seen ${new Date(detail.sessions.lastSeen).toLocaleString("en-NG")}` : ""}
                              {detail.adminRole ? ` • admin (${detail.adminRole})` : ""}
                            </p>
                          </div>
                        </section>
                        <section>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Compliance profile</p>
                          {!detail.profile ? (
                            <p className="text-sm text-gray-500">No profiler answers yet.</p>
                          ) : (
                            <div className="bg-brand-mist rounded-lg p-3 text-sm space-y-1.5">
                              {[
                                ["Display name", detail.profile.displayName],
                                ["Organization", detail.profile.orgName],
                                ["Industry", detail.profile.industry],
                                ["Team size", detail.profile.sizeBand],
                                ["Operating states", detail.profile.states],
                                ["Data types", detail.profile.dataTypes.join(", ")],
                                ["Handles payments", detail.profile.handlesPayments ? "Yes" : "No"],
                                ["Health data", detail.profile.healthData ? "Yes" : "No"],
                                ["Has website/app", detail.profile.hasWebsite ? "Yes" : "No"],
                                ["Enterprise clients", detail.profile.enterpriseClients ? "Yes" : "No"],
                                ["Briefing emails", detail.profile.newsletterOptOut ? "Opted out" : "Subscribed"],
                              ].map(([k, v]) => (
                                <p key={k} className="text-gray-600">
                                  <span className="text-gray-400">{k}: </span>
                                  <span className="text-brand-navy font-medium break-words">{v || "—"}</span>
                                </p>
                              ))}
                              {detail.profile.context && (
                                <p className="text-gray-600">
                                  <span className="text-gray-400">Context: </span>
                                  <span className="text-brand-navy">{detail.profile.context}</span>
                                </p>
                              )}
                            </div>
                          )}
                        </section>
                        <section>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                            Evidence ({detail.evidence.length})
                          </p>
                          {detail.evidence.length === 0 ? (
                            <p className="text-sm text-gray-500">No evidence submitted — score is 0.</p>
                          ) : (
                            <div className="space-y-2">
                              {detail.evidence.map((e) => (
                                <div key={e.id} className="bg-brand-mist rounded-lg p-3 text-sm">
                                  <p className="font-medium text-brand-navy">{e.title || e.actionId} {e.hasAttachment && "📎"}</p>
                                  <p className="text-gray-600 text-xs mt-0.5 whitespace-pre-wrap">{e.evidence}</p>
                                  <p className="text-[11px] text-gray-400 mt-1">
                                    {new Date(e.createdAt).toLocaleString("en-NG")}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </section>
                        <section>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                            Support tickets ({detail.tickets.length})
                          </p>
                          {detail.tickets.length === 0 ? (
                            <p className="text-sm text-gray-500">No tickets.</p>
                          ) : (
                            <div className="space-y-2">
                              {detail.tickets.map((t) => (
                                <button
                                  key={t.id}
                                  onClick={() => { setDetailId(null); setDetail(null); setOpenId(t.id); setTab("tickets") }}
                                  className="w-full text-left bg-brand-mist rounded-lg p-3 text-sm hover:bg-gray-200/70"
                                >
                                  <p className="font-medium text-brand-navy">{t.subject}</p>
                                  <p className="text-xs text-gray-500">{t.category} • {t.status} • {t.messageCount} message(s)</p>
                                </button>
                              ))}
                            </div>
                          )}
                        </section>
                        <section>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                            Training requests ({detail.training.length})
                          </p>
                          {detail.training.length === 0 ? (
                            <p className="text-sm text-gray-500">None.</p>
                          ) : (
                            <div className="space-y-2">
                              {detail.training.map((t) => (
                                <div key={t.id} className="bg-brand-mist rounded-lg p-3 text-sm">
                                  <p className="font-medium text-brand-navy">{t.topic}</p>
                                  <p className="text-xs text-gray-500">{t.kind} • {t.preferredDate} • {t.status}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </section>
                        <p className="text-[11px] text-gray-400">
                          Note: deadlines live on the user&apos;s device only and aren&apos;t visible here.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
