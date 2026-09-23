"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, Building2, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ReadinessScore } from "@/components/ui/readiness-score"

interface TopBarProps {
  orgName?: string
  readinessScore?: number
  userName?: string
  avatar?: string | null
  onMenuToggle?: () => void
}

interface Announcement {
  id: string
  title: string
  body: string
  kind: string
  link: string
  createdAt: string
}

const KIND_LABEL: Record<string, string> = {
  announcement: "Update",
  ticket: "Support",
  ticket_new: "Support",
  service: "Service",
  service_new: "Service",
  training: "Training",
  training_new: "Training",
  briefing: "Briefing",
}

const READ_KEY = "ctn-read-ntf"

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0 || !parts[0]) return "?"
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase()
}

export function TopBar({
  orgName = "My Organization",
  readinessScore = 0,
  userName = "",
  avatar = null,
  onMenuToggle,
}: TopBarProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Announcement[]>([])
  const [read, setRead] = useState<string[]>([])

  useEffect(() => {
    try {
      setRead(JSON.parse(window.localStorage.getItem(READ_KEY) || "[]"))
    } catch {}
    fetch("/api/notifications")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setItems(d.notifications || []))
      .catch(() => {})
  }, [])

  const unread = items.filter((n) => !read.includes(n.id)).length

  const markRead = () => {
    const ids = items.map((n) => n.id)
    setRead(ids)
    try {
      window.localStorage.setItem(READ_KEY, JSON.stringify(ids))
    } catch {}
  }

  return (
    <header className="relative flex items-center justify-between h-16 px-4 lg:px-6 border-b border-border bg-white">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => (onMenuToggle ? onMenuToggle() : router.push("/more"))}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Building2 className="h-4 w-4" />
          <span className="font-medium text-brand-navy">{orgName}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs text-gray-500">Readiness</span>
          <ReadinessScore score={readinessScore} size="sm" />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
          onClick={() => {
            const next = !open
            setOpen(next)
            if (next) markRead()
          }}
        >
          <Bell className="h-5 w-5 text-gray-600" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-status-critTx" />
          )}
        </Button>
        <Link
          href="/settings"
          aria-label="Account settings"
          className="h-8 w-8 rounded-full bg-brand-teal/20 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-brand-teal/40 transition-shadow"
        >
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt={userName || "Profile"} className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm font-medium text-brand-teal">{initials(userName)}</span>
          )}
        </Link>
      </div>

      {/* Notifications panel — product updates, not newsletter */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-2 sm:right-4 top-16 z-50 w-[calc(100vw-1rem)] max-w-sm bg-white rounded-xl border border-border shadow-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <p className="font-semibold text-brand-navy text-sm">Notifications</p>
              <p className="text-xs text-gray-500">Product news plus your ticket, service and training updates.</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <p className="text-sm text-gray-500 p-4">
                  Nothing yet. Updates from our team and activity on your account will appear here.
                </p>
              ) : (
                items.map((n) => {
                  const inner = (
                    <>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-brand-navy flex-1">{n.title}</p>
                        {n.kind && n.kind !== "announcement" && (
                          <span className="text-[10px] font-bold text-brand-teal bg-brand-teal/10 rounded px-1.5 py-0.5 flex-shrink-0">
                            {KIND_LABEL[n.kind] || n.kind}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-3">
                        {n.body}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {new Date(n.createdAt).toLocaleDateString("en-NG", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </p>
                    </>
                  )
                  return n.link ? (
                    <Link
                      key={n.id}
                      href={n.link}
                      onClick={() => setOpen(false)}
                      className="block px-4 py-3 border-b border-border last:border-0 hover:bg-brand-mist transition-colors"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div key={n.id} className="px-4 py-3 border-b border-border last:border-0">
                      {inner}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </>
      )}
    </header>
  )
}
