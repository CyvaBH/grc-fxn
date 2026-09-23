"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useBadges } from "@/lib/use-badges"
import {
  LayoutDashboard,
  FileCheck,
  ShieldCheck,
  CalendarClock,
  MoreHorizontal,
} from "lucide-react"

const mobileNavItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/profile", label: "Profile", icon: FileCheck },
  { href: "/policies", label: "Policies", icon: ShieldCheck },
  { href: "/deadlines", label: "Deadlines", icon: CalendarClock },
  { href: "/more", label: "More", icon: MoreHorizontal },
]

export function MobileNav() {
  const pathname = usePathname()
  const { badges, adminTotal, userTotal, unread } = useBadges()
  const moreCount = userTotal + adminTotal + unread

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border">
      <div className="flex items-center justify-around h-16">
        {mobileNavItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/")
          const count = item.href === "/more" ? moreCount : 0
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-1 px-3 py-1 text-xs font-medium transition-colors",
                isActive ? "text-brand-teal" : "text-gray-500"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
              {count > 0 && (
                <span className="absolute top-0 right-1 min-w-4 h-4 px-1 rounded-full bg-status-critTx text-white text-[10px] font-bold flex items-center justify-center">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
