"use client"

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

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0 || !parts[0]) return "?"
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase()
}

export function TopBar({
  orgName = "My Organization",
  readinessScore = 45,
  userName = "",
  avatar = null,
  onMenuToggle,
}: TopBarProps) {
  const router = useRouter()

  return (
    <header className="flex items-center justify-between h-16 px-4 lg:px-6 border-b border-border bg-white">
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
        <Link href="/newsletter" aria-label="Notifications">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-status-critTx" />
          </Button>
        </Link>
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
    </header>
  )
}
