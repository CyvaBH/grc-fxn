"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/topbar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GraduationCap, Play, CheckCircle2, Clock, X, CalendarPlus, Video, Loader2 } from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { useOrgProfile } from "@/lib/profile-store"

interface Training {
  title: string
  desc: string
  duration: string
  required: boolean
  lessons: string[]
}

const TRAININGS: Training[] = [
  {
    title: "Phishing Awareness",
    desc: "Recognize and report phishing attempts",
    duration: "5 min",
    required: true,
    lessons: [
      "Phishing is the #1 way small businesses get breached — usually a fake email or WhatsApp message asking you to click, pay, or share a code.",
      "Red flags: urgency ('act now'), sender address that doesn't match the company, unexpected attachments, and requests for passwords or OTPs.",
      "Rule: never share OTPs or passwords, even with someone claiming to be IT or your bank. Verify through a separate channel first.",
      "If you clicked: disconnect, report to your security contact immediately, and change the password from a clean device.",
    ],
  },
  {
    title: "Data Protection Basics",
    desc: "Understanding NDPA obligations for staff",
    duration: "8 min",
    required: true,
    lessons: [
      "Under the NDPA, customer names, phone numbers, emails and IDs are personal data — handling them carelessly can lead to fines.",
      "Collect only what you need, use it only for the stated purpose, and never share customer data outside approved tools.",
      "Customers can ask what data you hold, and request correction or deletion — forward such requests to your DPO the same day.",
      "Lock your screen, use MFA, and report lost devices or suspected breaches within hours, not days.",
    ],
  },
  {
    title: "Password & Access Security",
    desc: "Creating strong passwords and using MFA",
    duration: "4 min",
    required: true,
    lessons: [
      "Use a password manager and a unique 12+ character password per service. Reused passwords turn one breach into many.",
      "Turn on MFA everywhere, especially email, admin and finance accounts — it blocks most account takeovers.",
      "Never share credentials, even with teammates. Provision separate accounts instead.",
    ],
  },
  {
    title: "Incident Reporting",
    desc: "How to report a data breach or security incident",
    duration: "5 min",
    required: true,
    lessons: [
      "Report anything suspicious immediately: phishing clicks, malware alerts, lost devices, unauthorized access, or customer data sent to the wrong person.",
      "Include: what happened, when, which systems or data, and who is affected. Don't investigate alone or delete evidence.",
      "Speed matters: NDPC breach notification can be due within 72 hours, so internal reporting must happen within hours.",
    ],
  },
  {
    title: "Physical Security",
    desc: "Office and device security best practices",
    duration: "3 min",
    required: false,
    lessons: [
      "Lock screens when you step away, secure laptops overnight, and challenge unfamiliar faces in restricted areas.",
      "Shred sensitive printouts, don't leave customer data on shared printers, and report lost access cards immediately.",
    ],
  },
]

const KEY = "ctn-trainings-v1"

const TRAINER_TOPICS = [
  "NDPA staff awareness (all staff)",
  "Phishing simulation + debrief",
  "DPO & compliance lead deep-dive",
  "Incident response tabletop drill",
  "Executive briefing (founders/board)",
]

interface TrainingRequest {
  id: string
  kind: string
  topic: string
  preferredDate: string
  teamSize: string
  status: string
  createdAt: string
}

export default function TrainingsPage() {
  const { data: session } = useSession()
  const { profile } = useOrgProfile()
  const [completed, setCompleted] = useState<string[]>([])
  const [open, setOpen] = useState<Training | null>(null)
  // Trainer booking form
  const [topic, setTopic] = useState(TRAINER_TOPICS[0])
  const [date, setDate] = useState("")
  const [teamSize, setTeamSize] = useState(profile.sizeBand || "")
  const [notes, setNotes] = useState("")
  const [booking, setBooking] = useState(false)
  const [booked, setBooked] = useState(false)
  const [bookError, setBookError] = useState("")
  // Internal session form
  const [inTopic, setInTopic] = useState("")
  const [inDate, setInDate] = useState("")
  const [inOwner, setInOwner] = useState("")
  const [requests, setRequests] = useState<TrainingRequest[]>([])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY)
      if (raw) setCompleted(JSON.parse(raw))
    } catch {}
    fetch("/api/training")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setRequests(d.requests || []))
      .catch(() => {})
  }, [])

  const markComplete = (title: string) => {
    setCompleted((prev) => {
      const next = prev.includes(title) ? prev : [...prev, title]
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next))
      } catch {}
      return next
    })
    setOpen(null)
  }

  const handleBookTrainer = async (e: React.FormEvent) => {
    e.preventDefault()
    setBooking(true)
    setBookError("")
    try {
      const res = await fetch("/api/training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "trainer", topic, preferredDate: date, teamSize, notes }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Booking failed")
      const data = await res.json()
      setRequests((prev) => [data.request, ...prev])
      setBooked(true)
      setDate("")
      setNotes("")
      setTimeout(() => setBooked(false), 5000)
    } catch (err) {
      setBookError((err as Error).message)
    } finally {
      setBooking(false)
    }
  }

  const handleScheduleInternal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inTopic.trim() || !inDate) return
    const entry: TrainingRequest = {
      id: `local-${Date.now()}`,
      kind: "internal",
      topic: inTopic.trim(),
      preferredDate: inDate,
      teamSize: "",
      status: "scheduled",
      createdAt: new Date().toISOString(),
    }
    setRequests((prev) => [entry, ...prev])
    setInTopic("")
    setInDate("")
    setInOwner("")
  }

  const total = TRAININGS.length
  const progress = (completed.length / total) * 100

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
              <h1 className="text-2xl font-bold text-brand-navy">
                Staff Training
              </h1>
              <p className="text-gray-500 mt-1">
                Book our trainers, schedule your own sessions, or run 5-minute refreshers.
              </p>
            </div>

            <Tabs defaultValue="book">
              <TabsList>
                <TabsTrigger value="book">Book a trainer</TabsTrigger>
                <TabsTrigger value="internal">Internal sessions</TabsTrigger>
                <TabsTrigger value="refreshers">5-min refreshers</TabsTrigger>
              </TabsList>

              {/* BOOK A TRAINER */}
              <TabsContent value="book" className="mt-4">
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Video className="h-4 w-4 text-brand-teal" />
                        Request a live session
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleBookTrainer} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="tr-topic">Topic</Label>
                          <select
                            id="tr-topic"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="flex h-10 w-full rounded-lg border border-border bg-white px-4 text-sm text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
                          >
                            {TRAINER_TOPICS.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="tr-date">Preferred date</Label>
                            <Input
                              id="tr-date"
                              type="date"
                              value={date}
                              onChange={(e) => setDate(e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="tr-size">Team size</Label>
                            <Input
                              id="tr-size"
                              placeholder="e.g. 12"
                              value={teamSize}
                              onChange={(e) => setTeamSize(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tr-notes">Notes (optional)</Label>
                          <Textarea
                            id="tr-notes"
                            rows={3}
                            placeholder="Onsite or remote? Any incidents to cover?"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                          />
                        </div>
                        {bookError && <p className="text-xs text-status-critTx">{bookError}</p>}
                        {booked && (
                          <p className="text-xs text-brand-teal font-medium">
                            Request received — we&apos;ll confirm your session by email.
                          </p>
                        )}
                        <Button type="submit" disabled={booking}>
                          {booking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Request session
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">How trainer sessions work</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-brand-navy">
                      {[
                        ["1. Request", "Pick a topic and your preferred date. No payment now — we confirm availability first."],
                        ["2. Confirm", "Our team confirms the trainer, format (onsite/remote) and quote by email within 2 business days."],
                        ["3. Train", "Live 60–90 minute session with Q&A, plus attendance sheet you can file as training evidence."],
                        ["4. Evidence", "Completed trainer sessions count toward your People & Training readiness score."],
                      ].map(([h, b]) => (
                        <div key={h} className="flex gap-3">
                          <div className="h-6 w-6 rounded-full bg-brand-teal/10 text-brand-teal text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {h[0]}
                          </div>
                          <div>
                            <p className="font-medium">{h}</p>
                            <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{b}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* INTERNAL SESSIONS */}
              <TabsContent value="internal" className="mt-4">
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <CalendarPlus className="h-4 w-4 text-brand-teal" />
                        Schedule an internal session
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleScheduleInternal} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="in-topic">Topic</Label>
                          <Input
                            id="in-topic"
                            placeholder="e.g. Phishing recap for support team"
                            value={inTopic}
                            onChange={(e) => setInTopic(e.target.value)}
                            required
                          />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="in-date">Date</Label>
                            <Input
                              id="in-date"
                              type="date"
                              value={inDate}
                              onChange={(e) => setInDate(e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="in-owner">Session owner</Label>
                            <Input
                              id="in-owner"
                              placeholder="e.g. Adaeze"
                              value={inOwner}
                              onChange={(e) => setInOwner(e.target.value)}
                            />
                          </div>
                        </div>
                        <Button type="submit">Schedule session</Button>
                        <p className="text-xs text-gray-500">
                          Tip: run the session, record attendance, then submit it as evidence under
                          “Run company-wide security awareness” to earn readiness points.
                        </p>
                      </form>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Upcoming & requested</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {requests.length === 0 && (
                        <p className="text-sm text-gray-500">Nothing scheduled yet.</p>
                      )}
                      {requests.map((r) => (
                        <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-brand-mist text-sm">
                          <div className="min-w-0">
                            <p className="font-medium text-brand-navy truncate">{r.topic}</p>
                            <p className="text-xs text-gray-500">
                              {r.kind === "trainer" ? "With our trainers" : `Internal${inOwner && r.id.startsWith("local-") ? ` • ${inOwner}` : ""}`} • {r.preferredDate}
                            </p>
                          </div>
                          <Badge variant={r.status === "done" ? "default" : r.status === "approved" || r.status === "scheduled" ? "likely" : "secondary"} className="text-[10px] flex-shrink-0">
                            {r.status}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* REFRESHERS */}
              <TabsContent value="refreshers" className="mt-4 space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-brand-navy">
                    Refresher progress
                  </span>
                  <span className="text-sm text-gray-500">
                    {completed.length} of {total} • {Math.round(progress)}%
                  </span>
                </div>
                <Progress value={progress} />
                <p className="text-xs text-gray-500 mt-2">
                  Quick self-study refreshers. For auditable training, book a live session above.
                </p>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {TRAININGS.map((training) => {
                const done = completed.includes(training.title)
                return (
                  <Card
                    key={training.title}
                    className={
                      done
                        ? "border-l-4 border-l-brand-teal"
                        : "hover:border-brand-teal/30 transition-colors"
                    }
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          done ? "bg-brand-teal/10" : "bg-brand-mist"
                        }`}
                      >
                        {done ? (
                          <CheckCircle2 className="h-5 w-5 text-brand-teal" />
                        ) : (
                          <GraduationCap className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className={`font-medium text-sm ${
                              done ? "text-gray-400 line-through" : "text-brand-navy"
                            }`}
                          >
                            {training.title}
                          </p>
                          {training.required && (
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                              Required
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{training.desc}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {training.duration}
                        </span>
                        {!done && (
                          <Button size="sm" variant="outline" onClick={() => setOpen(training)}>
                            <Play className="mr-1 h-3 w-3" />
                            Start
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      <MobileNav />

      {/* Lesson modal */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-brand-navy/50 p-0 sm:p-6">
          <div className="bg-white w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl">
            <div className="sticky top-0 bg-white border-b border-border px-5 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-brand-navy">{open.title}</h2>
                <p className="text-xs text-gray-500">{open.duration} • {open.desc}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(null)} aria-label="Close lesson">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-5 space-y-4">
              {open.lessons.map((lesson, i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-brand-teal/10 text-brand-teal text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-sm text-brand-navy leading-relaxed">{lesson}</p>
                </div>
              ))}
              <Button className="w-full" onClick={() => markComplete(open.title)}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark as complete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
