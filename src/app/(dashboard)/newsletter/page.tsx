"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/topbar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Mail, BookOpen, Calendar, X } from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { useOrgProfile } from "@/lib/profile-store"

interface Article {
  title: string
  date: string
  segment: string
  preview: string
  body: string[]
}

const NEWSLETTERS: Article[] = [
  {
    title: "NDPA Update: New NDPC Guidance on Data Breach Notification",
    date: "Sep 2026",
    segment: "All",
    preview:
      "The NDPC has released new guidance on breach notification timelines. Key changes include a 72-hour reporting window and new DPCO audit requirements.",
    body: [
      "The Nigeria Data Protection Commission has clarified that controllers must notify the Commission within 72 hours of becoming aware of a breach that risks the rights of data subjects.",
      "What to do now: (1) make sure your Incident Response Plan names who assesses breaches within 24 hours, (2) keep a breach register even for near-misses, (3) confirm your DPCO's audit calendar covers the new filing window.",
      "Template help: use the Incident Response Plan in your Policy Library — it already follows the 24h assess / 72h notify rhythm.",
    ],
  },
  {
    title: "Phishing Trend: Fake CBN Alert Scam Targeting Fintechs",
    date: "Aug 2026",
    segment: "Fintech",
    preview:
      "A new phishing campaign is impersonating CBN alerts to steal login credentials. Here's how to protect your team and what to tell staff.",
    body: [
      "Attackers are sending SMS and emails that look like CBN compliance alerts, linking to login pages that harvest credentials and OTPs.",
      "Tell your team: the CBN will never ask for passwords or OTPs by link. Verify any 'compliance' request through your official relationship channel before clicking.",
      "Run the 5-minute Phishing Awareness module under Staff Training with every new hire — and re-run it after any click incident.",
    ],
  },
  {
    title: "Policy Spotlight: Why Your Incident Response Plan Needs Updating",
    date: "Jul 2026",
    segment: "All",
    preview:
      "Most SMBs have an incident response plan but haven't updated it since creation. Here's a 5-point checklist to bring it current.",
    body: [
      "An outdated plan is almost as bad as none: contacts change, tools change, and the NDPC's expectations have sharpened.",
      "5-point refresh: (1) current incident lead + deputy with phone numbers, (2) 24h assessment / 72h notification flow, (3) backup + restore verification date, (4) staff reporting channel everyone knows, (5) post-incident review scheduled within 7 days.",
      "Open your plan in the Policy Library, update the fields, and download a fresh copy for your records.",
    ],
  },
]

export default function NewsletterPage() {
  const { data: session } = useSession()
  const { profile } = useOrgProfile()
  const [open, setOpen] = useState<Article | null>(null)

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
              <h1 className="text-2xl font-bold text-brand-navy">Newsletter</h1>
              <p className="text-gray-500 mt-1">
                Monthly compliance updates, threat alerts, and tips
              </p>
            </div>

            <div className="space-y-4">
              {NEWSLETTERS.map((nl) => (
                <Card key={nl.title} className="hover:border-brand-teal/30 transition-colors">
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-shrink-0"
                        aria-label={`Read ${nl.title}`}
                        onClick={() => setOpen(nl)}
                      >
                        <BookOpen className="h-4 w-4" />
                      </Button>
                    </div>
                    <button
                      onClick={() => setOpen(nl)}
                      className="mt-3 text-sm text-brand-teal font-medium hover:underline"
                    >
                      Read full article
                    </button>
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
                  Segmented by your industry: {profile.industry || "General"}
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      <MobileNav />

      {/* Article modal */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-brand-navy/50 p-0 sm:p-6">
          <div className="bg-white w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl">
            <div className="sticky top-0 bg-white border-b border-border px-5 py-4 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary">{open.segment}</Badge>
                  <span className="text-xs text-gray-500">{open.date}</span>
                </div>
                <h2 className="font-bold text-brand-navy leading-snug">{open.title}</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(null)} aria-label="Close article" className="flex-shrink-0">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-5 space-y-4">
              {open.body.map((para, i) => (
                <p key={i} className="text-sm text-brand-navy leading-relaxed">{para}</p>
              ))}
              <p className="text-xs text-gray-400 pt-2 border-t border-border">
                Guidance only — not legal advice. Confirm with licensed counsel before filing.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
