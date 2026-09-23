"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/topbar"
import { MobileNav } from "@/components/layout/mobile-nav"
import {
  LifeBuoy,
  Plus,
  ArrowLeft,
  Send,
  Loader2,
  MessageCircle,
  ImagePlus,
} from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { useOrgProfile, EVIDENCE_ACCEPT, fileToEvidenceDataUrl } from "@/lib/profile-store"
import { AttachmentView } from "@/components/attachment-view"
import { cn } from "@/lib/utils"

const CATEGORIES = [
  "Account & login",
  "OTP / email issues",
  "Bug report",
  "Billing",
  "Feature request",
  "Other",
]

interface Ticket {
  id: string
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

export default function SupportPage() {
  const { data: session } = useSession()
  const { profile } = useOrgProfile()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [subject, setSubject] = useState("")
  const [category, setCategory] = useState(CATEGORIES[0])
  const [message, setMessage] = useState("")
  const [creating, setCreating] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)
  const [thread, setThread] = useState<TicketMessage[]>([])
  const [threadLoading, setThreadLoading] = useState(false)
  const [reply, setReply] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const [attach, setAttach] = useState<string | null>(null)
  const [replyAttach, setReplyAttach] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const replyFileRef = useRef<HTMLInputElement>(null)

  const pickImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    set: (v: string | null) => void
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      set(await fileToEvidenceDataUrl(file))
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const loadTickets = useCallback(async () => {
    try {
      const res = await fetch("/api/tickets")
      if (res.ok) {
        const data = await res.json()
        setTickets(data.tickets || [])
      }
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    loadTickets()
  }, [loadTickets])



  const openTicket = async (id: string) => {
    setOpenId(id)
    setThreadLoading(true)
    try {
      const res = await fetch(`/api/tickets/${id}`)
      if (res.ok) {
        const data = await res.json()
        setThread(data.messages || [])
      }
    } catch {}
    setThreadLoading(false)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) return
    setCreating(true)
    setError("")
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim(), category, message: message.trim(), image: attach }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Could not create ticket")
      const data = await res.json()
      setSubject("")
      setMessage("")
      setAttach(null)
      setShowNew(false)
      await loadTickets()
      openTicket(data.ticket.id)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setCreating(false)
    }
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reply.trim() || !openId) return
    setSending(true)
    try {
      const res = await fetch(`/api/tickets/${openId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: reply.trim(), image: replyAttach }),
      })
      if (!res.ok) throw new Error("Could not send reply")
      setReply("")
      setReplyAttach(null)
      openTicket(openId)
      loadTickets()
    } catch {}
    setSending(false)
  }

  const activeTicket = tickets.find((t) => t.id === openId)

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
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-brand-navy flex items-center gap-2">
                  <LifeBuoy className="h-6 w-6 text-brand-teal" />
                  Support
                </h1>
                <p className="text-gray-500 mt-1">
                  Ask us anything — we reply to every ticket.
                </p>
              </div>
              {!openId && (
                <Button onClick={() => setShowNew(!showNew)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New ticket
                </Button>
              )}
            </div>

            {error && (
              <div className="p-3 bg-status-critBg rounded-lg text-sm text-status-critTx">
                {error}
              </div>
            )}

            {/* New ticket form */}
            {showNew && !openId && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Open a support ticket</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="t-subject">Subject</Label>
                      <Input
                        id="t-subject"
                        placeholder="e.g. I didn't receive my OTP code"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="t-cat">Category</Label>
                      <select
                        id="t-cat"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="flex h-10 w-full rounded-lg border border-border bg-white px-4 text-sm text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="t-msg">Describe the issue</Label>
                      <Textarea
                        id="t-msg"
                        rows={5}
                        placeholder="What happened? What did you expect? Include steps if it's a bug."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Attachment — image, video or PDF (optional)</Label>
                      <input
                        ref={fileRef}
                        type="file"
                        accept={EVIDENCE_ACCEPT}
                        className="hidden"
                        onChange={(e) => pickImage(e, setAttach)}
                      />
                      {attach ? (
                        <div className="flex items-center gap-3">
                          <AttachmentView src={attach} compact />
                          <button type="button" onClick={() => setAttach(null)} className="text-xs text-gray-500 hover:text-status-critTx">
                            Remove
                          </button>
                        </div>
                      ) : (
                        <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                          <ImagePlus className="mr-2 h-4 w-4" />
                          Attach file
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={creating}>
                        {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit ticket
                      </Button>
                      <Button variant="ghost" type="button" onClick={() => setShowNew(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Thread view */}
            {openId && activeTicket && (
              <div className="space-y-4">
                <button
                  onClick={() => { setOpenId(null); setThread([]) }}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-navy"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to tickets
                </button>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{activeTicket.subject}</CardTitle>
                      <p className="text-xs text-gray-500 mt-1">
                        {activeTicket.category} • Opened{" "}
                        {new Date(activeTicket.createdAt).toLocaleDateString("en-NG", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </p>
                    </div>
                    <Badge variant={activeTicket.status === "open" ? "likely" : "secondary"}>
                      {activeTicket.status === "open" ? "Open" : "Closed"}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {threadLoading ? (
                      <p className="text-sm text-gray-500">Loading messages…</p>
                    ) : (
                      thread.map((m) => (
                        <div
                          key={m.id}
                          className={cn(
                            "rounded-lg p-3 text-sm max-w-[90%]",
                            m.isAdmin
                              ? "bg-brand-navy text-white ml-auto"
                              : "bg-brand-mist text-brand-navy"
                          )}
                        >
                          <p className={cn("text-[11px] mb-1 font-medium", m.isAdmin ? "text-white/70" : "text-gray-500")}>
                            {m.isAdmin ? "Support team" : m.authorName || "You"} •{" "}
                            {new Date(m.createdAt).toLocaleString("en-NG", {
                              month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                          <p className="whitespace-pre-wrap leading-relaxed">{m.body}</p>
                          {m.image && <AttachmentView src={m.image} />}
                        </div>
                      ))
                    )}
                    {activeTicket.status === "open" ? (
                      <div className="pt-2 space-y-2">
                        {replyAttach && (
                          <div className="flex items-center gap-3">
                            <AttachmentView src={replyAttach} compact />
                            <button type="button" onClick={() => setReplyAttach(null)} className="text-xs text-gray-500 hover:text-status-critTx">
                              Remove
                            </button>
                          </div>
                        )}
                        <form onSubmit={handleReply} className="flex gap-2">
                          <input
                            ref={replyFileRef}
                            type="file"
                            accept={EVIDENCE_ACCEPT}
                            className="hidden"
                            onChange={(e) => pickImage(e, setReplyAttach)}
                          />
                          <Button type="button" variant="ghost" size="icon" onClick={() => replyFileRef.current?.click()} aria-label="Attach image">
                            <ImagePlus className="h-4 w-4" />
                          </Button>
                          <Input
                            placeholder="Write a reply…"
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                          />
                          <Button type="submit" disabled={sending || !reply.trim()}>
                            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          </Button>
                        </form>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 pt-2">
                        This ticket is closed. Open a new ticket if you need more help.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Ticket list */}
            {!openId && (
              <div className="space-y-3">
                {loading ? (
                  <p className="text-sm text-gray-500">Loading your tickets…</p>
                ) : tickets.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <MessageCircle className="h-10 w-10 text-brand-teal mx-auto mb-3" />
                      <p className="font-medium text-brand-navy">No tickets yet</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Open your first ticket and we&apos;ll get back to you.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  tickets.map((t) => (
                    <button key={t.id} onClick={() => openTicket(t.id)} className="w-full text-left">
                      <Card className="hover:border-brand-teal/40 transition-colors">
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-brand-navy text-sm truncate">
                                {t.subject}
                              </p>
                              <Badge variant={t.status === "open" ? "likely" : "secondary"} className="text-[10px]">
                                {t.status === "open" ? "Open" : "Closed"}
                              </Badge>
                              {t.status === "open" && t.lastByAdmin && (
                                <Badge variant="default" className="text-[10px]">New reply</Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              {t.lastMessage || `${t.messageCount} message(s)`} • {t.category}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
