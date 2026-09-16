"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/topbar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Mail, ExternalLink, Calendar } from "lucide-react"

const newsletters = [
  {
    title: "NDPA Update: New NDPC Guidance on Data Breach Notification",
    date: "Sep 2026",
    segment: "All",
    preview:
      "The NDPC has released new guidance on breach notification timelines. Key changes include a 72-hour reporting window and new DPCO audit requirements.",
  },
  {
    title: "Phishing Trend: Fake CBN Alert Scam Targeting Fintechs",
    date: "Aug 2026",
    segment: "Fintech",
    preview:
      "A new phishing campaign is impersonating CBN alerts to steal login credentials. Here's how to protect your team and what to tell staff.",
  },
  {
    title: "Policy Spotlight: Why Your Incident Response Plan Needs Updating",
    date: "Jul 2026",
    segment: "All",
    preview:
      "Most SMBs have an incident response plan but haven't updated it since creation. Here's a 5-point checklist to bring it current.",
  },
]

export default function NewsletterPage() {
  return (
    <div className="min-h-screen bg-brand-mist flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-brand-navy">Newsletter</h1>
              <p className="text-gray-500 mt-1">
                Monthly compliance updates, threat alerts, and tips
              </p>
            </div>

            <div className="space-y-4">
              {newsletters.map((nl) => (
                <Card
                  key={nl.title}
                  className="hover:border-brand-teal/30 transition-colors"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{nl.segment}</Badge>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {nl.date}
                          </span>
                        </div>
                        <h3 className="font-semibold text-brand-navy mb-1">
                          {nl.title}
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                          {nl.preview}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="flex-shrink-0">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-status-infoBg border-status-infoBd">
              <CardContent className="p-6 text-center">
                <Mail className="h-8 w-8 text-brand-teal mx-auto mb-2" />
                <p className="text-sm text-brand-navy font-medium">
                  You&apos;re subscribed to monthly newsletters
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Segmented by your industry: Fintech
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
