"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PublicHeader, PublicFooter } from "@/components/public-nav"
import { ExternalLink, Calendar } from "lucide-react"

interface Article {
  id: string
  title: string
  summary: string
  url: string
  segment: string
  publishedAt: string
}

export default function BlogPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/public/newsletters")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setArticles(d.newsletters || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <section className="px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-brand-navy">GRC Briefing</h1>
          <p className="mt-4 text-lg text-gray-500">
            Real cybersecurity and compliance news affecting Nigerian businesses — curated by our team.
          </p>
        </div>
      </section>
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-3xl mx-auto space-y-4">
          {loading ? (
            <p className="text-sm text-gray-500 text-center">Loading briefings…</p>
          ) : (
            articles.map((a) => (
              <Card key={a.id} className="hover:border-brand-teal/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{a.segment}</Badge>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(a.publishedAt).toLocaleDateString("en-NG", { month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <h2 className="font-semibold text-brand-navy mb-1">{a.title}</h2>
                  <p className="text-sm text-gray-500 leading-relaxed">{a.summary}</p>
                  <a href={a.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-3 text-sm text-brand-teal font-medium hover:underline">
                    Read full article at source <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>
      <PublicFooter />
    </div>
  )
}
