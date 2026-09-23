"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ReadinessScore } from "@/components/ui/readiness-score"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/topbar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { EvidenceModal } from "@/components/evidence-modal"
import {
  CalendarClock,
  FileCheck,
  ArrowRight,
  CheckCircle2,
  Info,
} from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { greeting } from "@/lib/format"
import { useOrgProfile } from "@/lib/profile-store"
import { useReadiness } from "@/lib/use-readiness"
import { firstFewActions, ACTIONS, type ReadinessAction } from "@/lib/readiness"

interface StoredDeadline {
  id: number
  title: string
  due: string
  owner: string
  recurrence: string
  done: boolean
}

function daysLeft(due: string): number {
  const ms = new Date(due + "T00:00:00").getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / 86400000))
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const { profile } = useOrgProfile()
  const { score, evidencedIds, reload } = useReadiness()
  const [deadlines, setDeadlines] = useState<StoredDeadline[]>([])
  const [evidenceFor, setEvidenceFor] = useState<ReadinessAction | null>(null)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("ctn-deadlines-v1")
      if (raw) setDeadlines(JSON.parse(raw))
    } catch {}
  }, [])

  const orgName = profile.orgName || "My Organization"
  const hello = greeting(
    profile.displayName || session?.user?.name || "",
    profile.orgName
  )

  const actions = firstFewActions({
    industry: profile.industry,
    dataTypes: profile.dataTypes,
    handlesPayments: profile.handlesPayments,
    healthData: profile.healthData,
    enterpriseClients: profile.enterpriseClients,
  })
  const doneCount = actions.filter((a) => evidencedIds.has(a.id)).length
  const upcoming = deadlines
    .filter((d) => !d.done)
    .sort((a, b) => daysLeft(a.due) - daysLeft(b.due))
    .slice(0, 3)

  const actionById = (id: string) => ACTIONS.find((a) => a.id === id)

  return (
    <div className="min-h-screen bg-brand-mist flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          orgName={orgName}
          readinessScore={score}
          userName={profile.displayName || session?.user?.name || ""}
          avatar={profile.avatar}
        />
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Welcome */}
            <div>
              <h1 className="text-2xl font-bold text-brand-navy">
                {hello}
              </h1>
              <p className="text-gray-500 mt-1">
                Here&apos;s your compliance status at a glance.
              </p>
            </div>

            {/* Score + Deadlines row */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Readiness Score */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Readiness Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center py-4 gap-2">
                  <ReadinessScore score={score} previousScore={0} />
                  <Link
                    href="/profile"
                    className="flex items-center gap-1 text-xs text-brand-teal hover:underline"
                  >
                    <Info className="h-3 w-3" />
                    How is this calculated?
                  </Link>
                </CardContent>
              </Card>

              {/* Upcoming Deadlines */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Upcoming Deadlines
                  </CardTitle>
                  <Link href="/deadlines">
                    <Button variant="ghost" size="sm" className="text-brand-teal">
                      View all
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {upcoming.length === 0 ? (
                    <div className="p-4 rounded-lg bg-brand-mist text-sm text-gray-500">
                      No deadlines yet.{" "}
                      <Link href="/deadlines" className="text-brand-teal font-medium hover:underline">
                        Add your first deadline
                      </Link>{" "}
                      or generate them from your action plan.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcoming.map((deadline) => {
                        const left = daysLeft(deadline.due)
                        return (
                          <Link key={deadline.id} href="/deadlines">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-brand-mist hover:bg-gray-200/70 transition-colors">
                              <div className="flex items-center gap-3">
                                <CalendarClock
                                  className={
                                    left <= 14
                                      ? "h-5 w-5 text-status-warnTx"
                                      : "h-5 w-5 text-gray-400"
                                  }
                                />
                                <div>
                                  <p className="text-sm font-medium text-brand-navy">
                                    {deadline.title}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Owner: {deadline.owner}
                                  </p>
                                </div>
                              </div>
                              <Badge variant={left <= 14 ? "likely" : "secondary"}>
                                {left}d left
                              </Badge>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* First few actions — evidence-gated */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  First few actions ({doneCount}/{actions.length} evidenced)
                </CardTitle>
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="text-brand-teal">
                    View full plan
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500 mb-3">
                  Actions only count when you submit evidence — that&apos;s what moves your score.
                </p>
                <div className="space-y-2">
                  {actions.map((action) => {
                    const done = evidencedIds.has(action.id)
                    return (
                      <button
                        key={action.id}
                        onClick={() => setEvidenceFor(actionById(action.id)!)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-brand-mist transition-colors text-left"
                      >
                        <div
                          className={
                            done
                              ? "h-5 w-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 bg-brand-teal border-brand-teal"
                              : "h-5 w-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 border-gray-300"
                          }
                        >
                          {done && <CheckCircle2 className="h-3 w-3 text-white" />}
                        </div>
                        <span
                          className={
                            done
                              ? "text-sm flex-1 text-gray-400 line-through"
                              : "text-sm flex-1 text-brand-navy font-medium"
                          }
                        >
                          {action.title}
                        </span>
                        <Badge
                          variant={
                            action.effort === "Low"
                              ? "default"
                              : action.effort === "Med"
                              ? "likely"
                              : "destructive"
                          }
                        >
                          {action.effort}
                        </Badge>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick links */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Link href="/profile">
                <Card className="hover:border-brand-teal/30 transition-colors cursor-pointer h-full">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-brand-teal/10 flex items-center justify-center">
                      <FileCheck className="h-5 w-5 text-brand-teal" />
                    </div>
                    <div>
                      <p className="font-medium text-brand-navy text-sm">
                        View your profile
                      </p>
                      <p className="text-xs text-gray-500">
                        Regulations, frameworks, plan
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/policies">
                <Card className="hover:border-brand-teal/30 transition-colors cursor-pointer h-full">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-brand-teal/10 flex items-center justify-center">
                      <FileCheck className="h-5 w-5 text-brand-teal" />
                    </div>
                    <div>
                      <p className="font-medium text-brand-navy text-sm">
                        Policy templates
                      </p>
                      <p className="text-xs text-gray-500">
                        Tailored to your industry
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/deadlines">
                <Card className="hover:border-brand-teal/30 transition-colors cursor-pointer h-full">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-brand-teal/10 flex items-center justify-center">
                      <CalendarClock className="h-5 w-5 text-brand-teal" />
                    </div>
                    <div>
                      <p className="font-medium text-brand-navy text-sm">
                        Add a deadline
                      </p>
                      <p className="text-xs text-gray-500">
                        Never miss a renewal
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </main>
      </div>
      <MobileNav />

      {evidenceFor && (
        <EvidenceModal
          action={evidenceFor}
          onClose={() => setEvidenceFor(null)}
          onSaved={reload}
        />
      )}
    </div>
  )
}
