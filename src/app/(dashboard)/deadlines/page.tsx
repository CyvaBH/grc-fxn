"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/topbar"
import { MobileNav } from "@/components/layout/mobile-nav"
import {
  CalendarClock,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Sparkles,
} from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { useOrgProfile } from "@/lib/profile-store"
import { useReadiness } from "@/lib/use-readiness"
import { firstFewActions } from "@/lib/readiness"
import { cn } from "@/lib/utils"

interface Deadline {
  id: number
  title: string
  due: string
  owner: string
  recurrence: string
  priority: "High" | "Med" | "Low"
  done: boolean
}

const KEY = "ctn-deadlines-v1"

/** Sensible default horizons by priority — editable per deadline. */
const PRIORITY_DAYS: Record<Deadline["priority"], number> = {
  High: 30,
  Med: 60,
  Low: 90,
}

function isoPlus(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function daysLeft(due: string): number {
  const ms = new Date(due + "T00:00:00").getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / 86400000))
}

export default function DeadlinesPage() {
  const { data: session } = useSession()
  const { profile } = useOrgProfile()
  const { evidencedIds } = useReadiness()
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [loaded, setLoaded] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [title, setTitle] = useState("")
  const [due, setDue] = useState("")
  const [owner, setOwner] = useState("")
  const [recurrence, setRecurrence] = useState("once")
  const [priority, setPriority] = useState<Deadline["priority"]>("Med")

  const userName = profile.displayName || session?.user?.name || "You"

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY)
      if (raw) {
        setDeadlines(JSON.parse(raw))
      }
    } catch {}
    setLoaded(true)
  }, [])

  const persist = (next: Deadline[]) => {
    setDeadlines(next)
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next))
    } catch {}
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !due) return
    persist([
      ...deadlines,
      {
        id: Date.now(),
        title: title.trim(),
        due,
        owner: owner.trim() || userName,
        recurrence: recurrence.trim() || "once",
        priority,
        done: false,
      },
    ])
    setTitle("")
    setDue("")
    setOwner("")
    setRecurrence("once")
    setPriority("Med")
    setShowAdd(false)
  }

  /** Generate deadlines from unevidenced plan actions, dated by effort-based horizons. */
  const generateFromPlan = () => {
    const actions = firstFewActions({
      industry: profile.industry,
      dataTypes: profile.dataTypes,
      handlesPayments: profile.handlesPayments,
      healthData: profile.healthData,
      enterpriseClients: profile.enterpriseClients,
    }).filter((a) => !evidencedIds.has(a.id))
    const existing = new Set(deadlines.map((d) => d.title.toLowerCase()))
    const fresh: Deadline[] = actions
      .filter((a) => !existing.has(a.title.toLowerCase()))
      .map((a, i) => ({
        id: Date.now() + i,
        title: a.title,
        due: isoPlus(a.effort === "High" ? 30 : a.effort === "Med" ? 60 : 90),
        owner: userName,
        recurrence: "once",
        priority: (a.effort === "High" ? "High" : a.effort === "Med" ? "Med" : "Low") as Deadline["priority"],
        done: false,
      }))
    if (fresh.length > 0) persist([...deadlines, ...fresh])
  }

  const toggleDone = (id: number) =>
    persist(deadlines.map((d) => (d.id === id ? { ...d, done: !d.done } : d)))

  const remove = (id: number) => persist(deadlines.filter((d) => d.id !== id))

  const active = deadlines.filter((d) => !d.done)
  const urgent = active.filter((d) => daysLeft(d.due) <= 7)
  const sorted = [...deadlines].sort((a, b) => daysLeft(a.due) - daysLeft(b.due))

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
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-bold text-brand-navy">
                  Deadlines & Renewals
                </h1>
                <p className="text-gray-500 mt-1">
                  {active.length} active deadlines •{" "}
                  {active.filter((d) => daysLeft(d.due) <= 14).length} due soon
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={generateFromPlan}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate from my plan
                </Button>
                <Button onClick={() => { setDue(isoPlus(PRIORITY_DAYS[priority])); setShowAdd(!showAdd) }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add deadline
                </Button>
              </div>
            </div>

            {/* Add form */}
            {showAdd && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Add a deadline</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAdd}>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dl-title">Title</Label>
                        <Input
                          id="dl-title"
                          placeholder="e.g. NDPC Filing"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dl-priority">Priority (sets a suggested date)</Label>
                        <select
                          id="dl-priority"
                          value={priority}
                          onChange={(e) => {
                            const p = e.target.value as Deadline["priority"]
                            setPriority(p)
                            setDue(isoPlus(PRIORITY_DAYS[p]))
                          }}
                          className="flex h-10 w-full rounded-lg border border-border bg-white px-4 text-sm text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
                        >
                          <option value="High">High — due in ~30 days</option>
                          <option value="Med">Medium — due in ~60 days</option>
                          <option value="Low">Low — due in ~90 days</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dl-due">Due date (adjust freely)</Label>
                        <Input
                          id="dl-due"
                          type="date"
                          value={due}
                          onChange={(e) => setDue(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dl-owner">Owner</Label>
                        <Input
                          id="dl-owner"
                          placeholder={userName}
                          value={owner}
                          onChange={(e) => setOwner(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="dl-rec">Recurrence</Label>
                        <Input
                          id="dl-rec"
                          placeholder="e.g. once, yearly, quarterly"
                          value={recurrence}
                          onChange={(e) => setRecurrence(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button type="submit">Add deadline</Button>
                      <Button variant="ghost" type="button" onClick={() => setShowAdd(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Overdue warning */}
            {urgent.length > 0 && (
              <div className="flex items-center gap-3 p-4 bg-status-critBg rounded-lg">
                <AlertTriangle className="h-5 w-5 text-status-critTx flex-shrink-0" />
                <p className="text-sm text-status-critTx">
                  <strong>Action needed:</strong> {urgent.length} deadline(s)
                  due within 7 days.
                </p>
              </div>
            )}

            {/* Timeline */}
            <div className="space-y-4">
              {loaded && sorted.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CalendarClock className="h-10 w-10 text-brand-teal mx-auto mb-3" />
                    <p className="font-medium text-brand-navy">No deadlines yet</p>
                    <p className="text-sm text-gray-500 mt-1 mb-4">
                      Generate them from your action plan, or add filings, renewals and reviews manually.
                    </p>
                    <Button onClick={generateFromPlan}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate from my plan
                    </Button>
                  </CardContent>
                </Card>
              )}
              {sorted.map((deadline) => {
                const left = daysLeft(deadline.due)
                return (
                  <Card
                    key={deadline.id}
                    className={cn(
                      "border-l-4",
                      deadline.done
                        ? "border-l-brand-teal opacity-70"
                        : left <= 7
                        ? "border-l-status-critTx"
                        : left <= 14
                        ? "border-l-status-warnTx"
                        : "border-l-brand-teal"
                    )}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div
                        className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
                          left <= 7 && !deadline.done
                            ? "bg-status-critBg"
                            : left <= 14 && !deadline.done
                            ? "bg-status-warnBg"
                            : "bg-brand-teal/10"
                        )}
                      >
                        <CalendarClock
                          className={cn(
                            "h-5 w-5",
                            left <= 7 && !deadline.done
                              ? "text-status-critTx"
                              : left <= 14 && !deadline.done
                              ? "text-status-warnTx"
                              : "text-brand-teal"
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("font-medium text-sm", deadline.done ? "text-gray-400 line-through" : "text-brand-navy")}>
                          {deadline.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Owner: {deadline.owner} • {deadline.priority} priority • Recurs: {deadline.recurrence}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {new Date(deadline.due + "T00:00:00").toLocaleDateString("en-NG", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                          <p
                            className={cn(
                              "text-xs font-medium",
                              deadline.done
                                ? "text-brand-teal"
                                : left <= 7
                                ? "text-status-critTx"
                                : left <= 14
                                ? "text-status-warnTx"
                                : "text-brand-teal"
                            )}
                          >
                            {deadline.done ? "Done" : `${left} days left`}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={deadline.done ? "Reopen deadline" : "Mark deadline done"}
                          onClick={() => toggleDone(deadline.id)}
                        >
                          <CheckCircle2 className={cn("h-4 w-4", deadline.done ? "text-brand-teal" : "text-gray-400")} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label="Delete deadline"
                          onClick={() => remove(deadline.id)}
                        >
                          <Trash2 className="h-4 w-4 text-gray-400 hover:text-status-critTx" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
