"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/topbar"
import { MobileNav } from "@/components/layout/mobile-nav"
import {
  GraduationCap,
  Mail,
  Settings,
  ShieldCheck,
  FileCheck,
  CalendarClock,
  LogOut,
} from "lucide-react"

const menuItems = [
  { href: "/trainings", label: "Staff Training", icon: GraduationCap, desc: "Phishing awareness & security basics" },
  { href: "/newsletter", label: "Newsletter", icon: Mail, desc: "Monthly compliance updates" },
  { href: "/policies", label: "Policy Library", icon: FileCheck, desc: "15 ready-to-customize templates" },
  { href: "/deadlines", label: "Deadline Tracker", icon: CalendarClock, desc: "Never miss a renewal" },
  { href: "/profile", label: "Compliance Profile", icon: ShieldCheck, desc: "Your regulations & action plan" },
  { href: "/settings", label: "Settings", icon: Settings, desc: "Account & billing" },
]

export default function MorePage() {
  return (
    <div className="min-h-screen bg-brand-mist flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-brand-navy">More</h1>
            <div className="space-y-3">
              {menuItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Card className="hover:border-brand-teal/30 transition-colors cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-brand-teal/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="h-5 w-5 text-brand-teal" />
                      </div>
                      <div>
                        <p className="font-medium text-brand-navy text-sm">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <Card className="border-status-critBg">
              <CardContent className="p-4 flex items-center gap-4 cursor-pointer hover:bg-status-critBg/50 transition-colors">
                <LogOut className="h-5 w-5 text-status-critTx" />
                <p className="font-medium text-status-critTx text-sm">Sign out</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
