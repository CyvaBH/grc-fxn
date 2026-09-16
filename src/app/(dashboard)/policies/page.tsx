"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/topbar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { FileText, Download, ArrowRight } from "lucide-react"

const policies = [
  {
    name: "Data Protection & Privacy Policy",
    status: "ready",
    variables: 5,
    required: true,
  },
  {
    name: "Acceptable Use Policy",
    status: "ready",
    variables: 3,
    required: true,
  },
  {
    name: "Access Control & Password Policy",
    status: "ready",
    variables: 4,
    required: true,
  },
  {
    name: "Incident Response Plan",
    status: "ready",
    variables: 6,
    required: true,
  },
  {
    name: "Business Continuity Plan",
    status: "ready",
    variables: 5,
    required: false,
  },
  {
    name: "HR Onboarding & Exit Policy",
    status: "ready",
    variables: 4,
    required: false,
  },
  {
    name: "BYOD / Mobile Device Policy",
    status: "ready",
    variables: 3,
    required: false,
  },
  {
    name: "Data Retention & Disposal Policy",
    status: "ready",
    variables: 4,
    required: true,
  },
  {
    name: "Vendor Management Policy",
    status: "ready",
    variables: 5,
    required: false,
  },
  {
    name: "Physical Security Policy",
    status: "ready",
    variables: 3,
    required: false,
  },
  {
    name: "Network & Cloud Baseline Policy",
    status: "ready",
    variables: 4,
    required: false,
  },
  {
    name: "Audit & Logging Policy",
    status: "ready",
    variables: 3,
    required: true,
  },
  {
    name: "Training & Awareness Policy",
    status: "ready",
    variables: 3,
    required: true,
  },
  {
    name: "DPO Designation Letter",
    status: "ready",
    variables: 4,
    required: true,
  },
  {
    name: "Data Subject Request Procedure",
    status: "ready",
    variables: 5,
    required: true,
  },
]

export default function PoliciesPage() {
  const requiredCount = policies.filter((p) => p.required).length

  return (
    <div className="min-h-screen bg-brand-mist flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-brand-navy">
                Policy Templates
              </h1>
              <p className="text-gray-500 mt-1">
                {policies.length} templates available • {requiredCount} required
                for your profile
              </p>
            </div>

            <div className="grid gap-4">
              {policies.map((policy) => (
                <Card
                  key={policy.name}
                  className="hover:border-brand-teal/30 transition-colors"
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-brand-teal/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-brand-teal" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-brand-navy text-sm truncate">
                          {policy.name}
                        </p>
                        {policy.required && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                            Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {policy.variables} fields to customize
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm">
                        Use template
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
