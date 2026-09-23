"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/topbar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Mail, ExternalLink, Calendar } from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { useOrgProfile } from "@/lib/profile-store"

interface Article {
  id: string
  title: string
  summary: string
  url: string
  segment: string
  publishedAt: string
}

export default function NewsletterPage() {
  const { data: session } = useSession()
  const { profile } = useOrgProfile()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/newsletters")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setArticles(d.newsletters || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

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
              <h1 className="text-2xl font-bold text-brand-navy">GRC Briefing</h1>
              <p className="text-gray-500 mt-1">
                Real cybersecurity & compliance news that affects Nigerian SMBs — also emailed to you when published.
              </p>
            </div>

            <div className="space-y-4">
              {loading ? (
                <p className="text-sm text-gray-500">Loading briefings…</p>
              ) : articles.length === 0 ? (
                <p className="text-sm text-gray-500">No briefings yet. Check back soon.</p>
              ) : (
                articles.map((nl) => (
                  <Card key={nl.id} className="hover:border-brand-teal/30 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{nl.segment}</Badge>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(nl.publishedAt).toLocaleDateString("en-NG", {
                                month: "short", year: "numeric",
                              })}
                            </span>
                          </div>
                          <h3 className="font-semibold text-brand-navy mb-1">
                            {nl.title}
                          </h3>
                          <p className="text-sm text-gray-500 leading-relaxed">
                            {nl.summary}
                          </p>
                          <a
                            href={nl.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-3 text-sm text-brand-teal font-medium hover:underline"
                          >
                            Read full article at source
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            <Card className="bg-status-infoBg border-status-infoBd">
              <CardContent className="p-6 text-center">
                <Mail className="h-8 w-8 text-brand-teal mx-auto mb-2" />
                <p className="text-sm text-brand-navy font-medium">
                  {profile.newsletterOptOut
                    ? "Briefing emails are off — turn them on in Settings"
                    : "You're subscribed — new briefings land in your inbox too"}
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
    </div>
  )
}
