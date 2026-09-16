"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  Clock,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"

const deadlines = [
  {
    id: 1,
    title: "NDPC Annual Audit Filing",
    type: "filing",
    due: "2026-10-15",
    daysLeft: 33,
    owner: "Adaeze",
    status: "upcoming",
    recurrence: "yearly",
  },
  {
    id: 2,
    title: "Access Control Policy Review",
    type: "review",
    due: "2026-09-30",
    daysLeft: 18,
    owner: "Tunde",
    status: "upcoming",
    recurrence: "quarterly",
  },
  {
    id: 3,
    title: "Staff Security Training",
    type: "training",
    due: "2026-09-25",
    daysLeft: 13,
    owner: "Fatima",
    status: "upcoming",
    recurrence: "yearly",
  },
  {
    id: 4,
    title: "Data Protection Impact Assessment",
    type: "assessment",
    due: "2026-11-01",
    daysLeft: 50,
    owner: "Tunde",
    status: "upcoming",
    recurrence: "yearly",
  },
  {
    id: 5,
    title: "ISO 27001 Surveillance Audit",
    type: "audit",
    due: "2027-03-15",
    daysLeft: 184,
    owner: "External",
    status: "upcoming",
    recurrence: "yearly",
  },
]

export default function DeadlinesPage() {
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="min-h-screen bg-brand-mist flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-brand-navy">
                  Deadlines & Renewals
                </h1>
                <p className="text-gray-500 mt-1">
                  {deadlines.length} active deadlines •{" "}
                  {deadlines.filter((d) => d.daysLeft <= 14).length} due soon
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
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input id="title" placeholder="e.g. NDPC Filing" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="due">Due date</Label>
                      <Input id="due" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="owner">Owner</Label>
                      <Input id="owner" placeholder="e.g. Adaeze" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recurrence">Recurrence</Label>
                      <Input id="recurrence" placeholder="e.g. yearly" />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button>Add deadline</Button>
                    <Button variant="ghost" onClick={() => setShowAdd(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Overdue warning */}
            {deadlines.some((d) => d.daysLeft <= 7) && (
              <div className="flex items-center gap-3 p-4 bg-status-critBg rounded-lg">
                <AlertTriangle className="h-5 w-5 text-status-critTx flex-shrink-0" />
                <p className="text-sm text-status-critTx">
                  <strong>Action needed:</strong>{" "}
                  {deadlines.filter((d) => d.daysLeft <= 7).length} deadline(s)
                  due within 7 days.
                </p>
              </div>
            )}

            {/* Timeline */}
            <div className="space-y-4">
              {deadlines
                .sort((a, b) => a.daysLeft - b.daysLeft)
                .map((deadline) => (
                  <Card
                    key={deadline.id}
                    className={cn(
                      "border-l-4",
                      deadline.daysLeft <= 7
                        ? "border-l-status-critTx"
                        : deadline.daysLeft <= 14
                        ? "border-l-status-warnTx"
                        : "border-l-brand-teal"
                    )}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div
                        className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
                          deadline.daysLeft <= 7
                            ? "bg-status-critBg"
                            : deadline.daysLeft <= 14
                            ? "bg-status-warnBg"
                            : "bg-brand-teal/10"
                        )}
                      >
                        <CalendarClock
                          className={cn(
                            "h-5 w-5",
                            deadline.daysLeft <= 7
                              ? "text-status-critTx"
                              : deadline.daysLeft <= 14
                              ? "text-status-warnTx"
                              : "text-brand-teal"
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-brand-navy text-sm">
                          {deadline.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Owner: {deadline.owner} • Recurs: {deadline.recurrence}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {new Date(deadline.due).toLocaleDateString("en-NG", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                          <p
                            className={cn(
                              "text-xs font-medium",
                              deadline.daysLeft <= 7
                                ? "text-status-critTx"
                                : deadline.daysLeft <= 14
                                ? "text-status-warnTx"
                                : "text-brand-teal"
                            )}
                          >
                            {deadline.daysLeft} days left
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
