"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/topbar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { GraduationCap, Play, CheckCircle2, Clock, X } from "lucide-react"
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

export default function TrainingsPage() {
  const { data: session } = useSession()
  const { profile } = useOrgProfile()
  const [completed, setCompleted] = useState<string[]>([])
  const [open, setOpen] = useState<Training | null>(null)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY)
      if (raw) setCompleted(JSON.parse(raw))
    } catch {}
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
                {completed.length} of {total} modules completed
              </p>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-brand-navy">
                    Overall progress
                  </span>
                  <span className="text-sm text-gray-500">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress value={progress} />
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
