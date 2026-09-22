"use client"

import { useState } from "react"
import Link from "next/link"
import { ReadinessScore } from "@/components/ui/readiness-score"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/topbar"
import { MobileNav } from "@/components/layout/mobile-nav"
import {
  CalendarClock,
  FileCheck,
  ArrowRight,
  CheckCircle2,
} from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { useOrgProfile } from "@/lib/profile-store"

const upcomingDeadlines = [
  {
    title: "NDPC Audit Filing",
    due: "2026-10-15",
    daysLeft: 33,
    owner: "You",
  },
  {
    title: "Access Policy Review",
    due: "2026-09-30",
    daysLeft: 18,
    owner: "You",
  },
  {
    title: "Staff Security Training",
    due: "2026-09-25",
    daysLeft: 13,
    owner: "You",
  },
]

const initialActions = [
  { title: "Appoint a Data Protection Officer", effort: "High", done: false },
  { title: "Create Incident Response Plan", effort: "Med", done: false },
  { title: "Enable MFA on all admin accounts", effort: "Low", done: true },
  { title: "Draft Data Protection Policy", effort: "Med", done: false },
  { title: "Set up access control guidelines", effort: "Low", done: false },
]

export default function DashboardPage() {
  const { data: session } = useSession()
  const { profile } = useOrgProfile()
  const [actions, setActions] = useState(initialActions)

  const firstName =
    profile.displayName.split(" ")[0] ||
    session?.user?.name?.split(" ")[0] ||
    "there"
  const orgName = profile.orgName || "My Organization"
  const doneCount = actions.filter((a) => a.done).length
  const score = Math.min(95, 30 + doneCount * 7)

  const toggleAction = (title: string) =>
    setActions((prev) =>
      prev.map((a) => (a.title === title ? { ...a, done: !a.done } : a))
    )

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
                Good afternoon, {firstName}
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
                <CardContent className="flex justify-center py-4">
                  <ReadinessScore score={score} previousScore={32} />
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
                  <div className="space-y-3">
                    {upcomingDeadlines.map((deadline) => (
                      <Link key={deadline.title} href="/deadlines">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-brand-mist hover:bg-gray-200/70 transition-colors">
                          <div className="flex items-center gap-3">
                            <CalendarClock
                              className={
                                deadline.daysLeft <= 14
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
                          <Badge
                            variant={
                              deadline.daysLeft <= 14 ? "likely" : "secondary"
                            }
                          >
                            {deadline.daysLeft}d left
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Actions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Top 5 Actions ({doneCount}/{actions.length} done)
                </CardTitle>
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="text-brand-teal">
                    View full plan
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {actions.map((action) => (
                    <button
                      key={action.title}
                      onClick={() => toggleAction(action.title)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-brand-mist transition-colors text-left"
                    >
                      <div
                        className={
                          action.done
                            ? "h-5 w-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 bg-brand-teal border-brand-teal"
                            : "h-5 w-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 border-gray-300"
                        }
                      >
                        {action.done && (
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span
                        className={
                          action.done
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
                  ))}
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
                        15 ready-to-customize
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
    </div>
  )
}
