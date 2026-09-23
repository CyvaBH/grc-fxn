"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { PublicHeader, PublicFooter } from "@/components/public-nav"
import { Bell } from "lucide-react"

interface Update {
  id: string
  title: string
  body: string
  createdAt: string
}

export default function UpdatesPage() {
  const [updates, setUpdates] = useState<Update[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/public/updates")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setUpdates(d.updates || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <section className="px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-brand-navy">Product updates</h1>
          <p className="mt-4 text-lg text-gray-500">
            New features, improvements and notices from the Cyber Trust Nest team.
          </p>
        </div>
      </section>
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-3xl mx-auto space-y-4">
          {loading ? (
            <p className="text-sm text-gray-500 text-center">Loading updates…</p>
          ) : updates.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-10 w-10 text-brand-teal mx-auto mb-3" />
                <p className="font-medium text-brand-navy">No updates yet</p>
                <p className="text-sm text-gray-500 mt-1">Check back soon — or get started and see them in-app.</p>
              </CardContent>
            </Card>
          ) : (
            updates.map((u) => (
              <Card key={u.id}>
                <CardContent className="p-6">
                  <p className="text-xs text-gray-400">
                    {new Date(u.createdAt).toLocaleDateString("en-NG", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                  <h2 className="font-semibold text-brand-navy mt-1 mb-1">{u.title}</h2>
                  <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap">{u.body}</p>
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
