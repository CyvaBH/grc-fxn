"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileCheck,
  CalendarClock,
  ShieldCheck,
  GraduationCap,
  Mail,
  Settings,
  ChevronLeft,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/profile", label: "Profile", icon: FileCheck },
  { href: "/policies", label: "Policies", icon: ShieldCheck },
  { href: "/deadlines", label: "Deadlines", icon: CalendarClock },
  { href: "/trainings", label: "Trainings", icon: GraduationCap },
  { href: "/newsletter", label: "Newsletter", icon: Mail },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r border-border bg-white">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
        <ShieldCheck className="h-7 w-7 text-brand-teal" />
        <span className="text-lg font-bold text-brand-navy">Cyber Trust Nest</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-teal/10 text-brand-teal"
                  : "text-gray-600 hover:bg-brand-mist hover:text-brand-navy"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="px-3 py-4 border-t border-border">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-brand-mist hover:text-brand-navy transition-colors"
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
      </div>
    </aside>
  )
}
