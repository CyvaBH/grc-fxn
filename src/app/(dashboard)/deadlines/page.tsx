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
} from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { useOrgProfile } from "@/lib/profile-store"
import { cn } from "@/lib/utils"

interface Deadline {
  id: number
  title: string
  due: string
  owner: string
  recurrence: string
  done: boolean
}

const SEED: Deadline[] = [
  { id: 1, title: "NDPC Annual Audit Filing", due: "2026-10-15", owner: "You", recurrence: "yearly", done: false },
  { id: 2, title: "Access Control Policy Review", due: "2026-09-30", owner: "You", recurrence: "quarterly", done: false },
  { id: 3, title: "Staff Security Training", due: "2026-09-25", owner: "You", recurrence: "yearly", done: false },
  { id: 4, title: "Data Protection Impact Assessment", due: "2026-11-01", owner: "You", recurrence: "yearly", done: false },
  { id: 5, title: "ISO 27001 Surveillance Audit", due: "2027-03-15", owner: "External", recurrence: "yearly", done: false },
]

const KEY = "ctn-deadlines-v1"

function daysLeft(due: string): number {
  const ms = new Date(due + "T00:00:00").getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / 86400000))
}

export default function DeadlinesPage() {
  const { data: session } = useSession()
  const { profile } = useOrgProfile()
  const [deadlines, setDeadlines] = useState<Deadline[]>(SEED)
  const [showAdd, setShowAdd] = useState(false)
  const [title, setTitle] = useState("")
  const [due, setDue] = useState("")
  const [owner, setOwner] = useState("")
  const [recurrence, setRecurrence] = useState("yearly")

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY)
      if (raw) setDeadlines(JSON.parse(raw))
    } catch {}
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
        owner: owner.trim() || "You",
        recurrence: recurrence.trim() || "once",
        done: false,
      },
    ])
    setTitle("")
    setDue("")
    setOwner("")
    setRecurrence("yearly")
    setShowAdd(false)
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-brand-navy">
                  Deadlines & Renewals
                </h1>
                <p className="text-gray-500 mt-1">
                  {active.length} active deadlines •{" "}
                  {active.filter((d) => daysLeft(d.due) <= 14).length} due soon
                </p>
              </div>
              <Button onClick={() => setShowAdd(!showAdd)}>
                <Plus className="mr-2 h-4 w-4" />
                Add deadline
              </Button>
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
                        <Label htmlFor="dl-due">Due date</Label>
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
                          placeholder="e.g. Adaeze"
                          value={owner}
                          onChange={(e) => setOwner(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dl-rec">Recurrence</Label>
                        <Input
                          id="dl-rec"
                          placeholder="e.g. yearly"
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
                          Owner: {deadline.owner} • Recurs: {deadline.recurrence}
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
              {deadlines.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">
                  No deadlines yet. Add your first one above.
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
