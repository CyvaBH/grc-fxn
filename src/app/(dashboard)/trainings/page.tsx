"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/topbar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { GraduationCap, Play, CheckCircle2, Clock } from "lucide-react"

const trainings = [
  {
    title: "Phishing Awareness",
    desc: "Recognize and report phishing attempts",
    duration: "5 min",
    completed: false,
    required: true,
  },
  {
    title: "Data Protection Basics",
    desc: "Understanding NDPA obligations for staff",
    duration: "8 min",
    completed: true,
    required: true,
  },
  {
    title: "Password & Access Security",
    desc: "Creating strong passwords and using MFA",
    duration: "4 min",
    completed: false,
    required: true,
  },
  {
    title: "Incident Reporting",
    desc: "How to report a data breach or security incident",
    duration: "5 min",
    completed: false,
    required: true,
  },
  {
    title: "Physical Security",
    desc: "Office and device security best practices",
    duration: "3 min",
    completed: false,
    required: false,
  },
]

export default function TrainingsPage() {
  const completed = trainings.filter((t) => t.completed).length
  const total = trainings.length
  const progress = (completed / total) * 100

  return (
    <div className="min-h-screen bg-brand-mist flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-brand-navy">
                Staff Training
              </h1>
              <p className="text-gray-500 mt-1">
                {completed} of {total} modules completed
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
              {trainings.map((training) => (
                <Card
                  key={training.title}
                  className={
                    training.completed
                      ? "border-l-4 border-l-brand-teal"
                      : "hover:border-brand-teal/30 transition-colors"
                  }
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        training.completed
                          ? "bg-brand-teal/10"
                          : "bg-brand-mist"
                      }`}
                    >
                      {training.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-brand-teal" />
                      ) : (
                        <GraduationCap className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={`font-medium text-sm ${
                            training.completed
                              ? "text-gray-400 line-through"
                              : "text-brand-navy"
                          }`}
                        >
                          {training.title}
                        </p>
                        {training.required && (
                          <Badge
                            variant="destructive"
                            className="text-[10px] px-1.5 py-0"
                          >
                            Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {training.desc}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {training.duration}
                      </span>
                      {!training.completed && (
                        <Button size="sm" variant="outline">
                          <Play className="mr-1 h-3 w-3" />
                          Start
                        </Button>
                      )}
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
