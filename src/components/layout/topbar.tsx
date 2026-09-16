"use client"

import { Bell, Building2, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ReadinessScore } from "@/components/ui/readiness-score"

interface TopBarProps {
  orgName?: string
  readinessScore?: number
  onMenuToggle?: () => void
}

export function TopBar({
  orgName = "Acme Fintech",
  readinessScore = 45,
  onMenuToggle,
}: TopBarProps) {
  return (
    <header className="flex items-center justify-between h-16 px-4 lg:px-6 border-b border-border bg-white">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuToggle}
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
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-status-critTx" />
        </Button>
        <div className="h-8 w-8 rounded-full bg-brand-teal/20 flex items-center justify-center">
          <span className="text-sm font-medium text-brand-teal">A</span>
        </div>
      </div>
    </header>
  )
}
