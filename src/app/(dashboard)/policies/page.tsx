"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/topbar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { PolicyChecker } from "@/components/policy-checker"
import { EvidenceModal } from "@/components/evidence-modal"
import { FileText, ArrowRight, Stethoscope, PenLine } from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { useOrgProfile } from "@/lib/profile-store"
import { useReadiness } from "@/lib/use-readiness"
import { tailorPolicies } from "@/lib/policy-engine"
import { ACTIONS, type ReadinessAction } from "@/lib/readiness"
import { useState as usePrefillState } from "react"
import { DATA_TYPES } from "@/lib/data-types"

// Which policy maps to a scored readiness action (for "submit as evidence")
const POLICY_TO_ACTION: Record<string, string> = {
  "data-protection": "policy-dataprotection",
  "incident-response": "incident-plan",
  "access-control": "access-policy",
}

function dataLabel(id: string): string {
  return DATA_TYPES.find((d) => d.id === id)?.label || id
}

export default function PoliciesPage() {
  const { data: session } = useSession()
  const { profile } = useOrgProfile()
  const { reload } = useReadiness()
  const [checking, setChecking] = useState<string | null>(null)
  const [evidenceFor, setEvidenceFor] = useState<{ action: ReadinessAction; summary: string } | null>(null)

  const tailored = tailorPolicies({
    industry: profile.industry,
    states: profile.states,
    dataTypes: profile.dataTypes,
    sizeBand: profile.sizeBand,
    enterpriseClients: profile.enterpriseClients,
    handlesPayments: profile.handlesPayments,
    healthData: profile.healthData,
    context: profile.context,
  })
  const requiredCount = tailored.filter((p) => p.required).length
  const orgLine = `${profile.orgName || "your organisation"}${profile.industry ? ` (${profile.industry})` : ""}${
    profile.dataTypes.length > 0
      ? ` handling ${profile.dataTypes.slice(0, 3).map(dataLabel).join(", ")}${profile.dataTypes.length > 3 ? " and more" : ""}`
      : ""
  }`

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
              <h1 className="text-2xl font-bold text-brand-navy">
                Policy Library
              </h1>
              <p className="text-gray-500 mt-1">
                {tailored.length} policies • {requiredCount} required for{" "}
                {profile.industry || "your profile"}
                {profile.states ? ` • ${profile.states}` : ""}
              </p>
            </div>

            <Card className="bg-brand-navy text-white border-brand-navy">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <p className="font-semibold">Two ways to get compliant policies</p>
                  <p className="text-sm text-white/70 mt-1 leading-relaxed">
                    <strong className="text-white">1. Health-check</strong> your existing policy
                    against your organisational context — see exactly what&apos;s missing.{" "}
                    <strong className="text-white">2. Invite our team</strong> to draft a detailed,
                    audit-ready policy for you.
                  </p>
                </div>
                <Link href="/service-request?service=policy-drafting" className="flex-shrink-0">
                  <Button variant="default" className="bg-brand-teal hover:bg-brand-tealDark">
                    <PenLine className="mr-2 h-4 w-4" />
                    Invite our team
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {tailored.map((policy) => {
                const actionId = POLICY_TO_ACTION[policy.id]
                const action = actionId ? ACTIONS.find((a) => a.id === actionId) : undefined
                return (
                  <Card
                    key={policy.id}
                    className={
                      policy.required
                        ? "border-l-4 border-l-brand-teal hover:border-brand-teal/50 transition-colors"
                        : "hover:border-brand-teal/30 transition-colors"
                    }
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-lg bg-brand-teal/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-5 w-5 text-brand-teal" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-brand-navy text-sm">
                              {policy.name}
                            </p>
                            {policy.required && (
                              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                                Required
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {policy.blurb}
                          </p>
                          <p className="text-xs text-brand-teal mt-1 leading-relaxed">
                            {policy.required ? "Why you need it: " : "Why it's optional: "}{policy.reason}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <Button size="sm" variant="outline" onClick={() => setChecking(policy.id)}>
                              <Stethoscope className="mr-1 h-3 w-3" />
                              Check my policy
                            </Button>
                            <Link href={`/service-request?service=policy-drafting&policy=${policy.id}`}>
                              <Button size="sm">
                                Invite our team
                                <ArrowRight className="ml-1 h-3 w-3" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </main>
      </div>
      <MobileNav />

      {checking && (
        <PolicyChecker
          templateId={checking}
          templateName={tailored.find((t) => t.id === checking)?.name || ""}
          orgLine={orgLine}
          evidenceAction={
            POLICY_TO_ACTION[checking]
              ? (() => {
                  const a = ACTIONS.find((x) => x.id === POLICY_TO_ACTION[checking])
                  return a ? { id: a.id, title: a.title } : null
                })()
              : null
          }
          onUseAsEvidence={(actionId, summary) => {
            const a = ACTIONS.find((x) => x.id === actionId)
            if (a) {
              setChecking(null)
              setEvidenceFor({ action: a, summary })
            }
          }}
          onClose={() => setChecking(null)}
        />
      )}

      {evidenceFor && (
        <PrefilledEvidence
          action={evidenceFor.action}
          summary={evidenceFor.summary}
          onClose={() => setEvidenceFor(null)}
          onSaved={() => {
            reload()
            setEvidenceFor(null)
          }}
        />
      )}
    </div>
  )
}

/** Thin wrapper that posts a prefilled evidence note (from a health-check). */
function PrefilledEvidence({
  action,
  summary,
  onClose,
  onSaved,
}: {
  action: ReadinessAction
  summary: string
  onClose: () => void
  onSaved: () => void
}) {
  const [done, setDone] = usePrefillState(false)
  if (!done) {
    return (
      <EvidenceModal
        action={action}
        existing={{ evidence: summary, attachment: null }}
        onClose={onClose}
        onSaved={() => {
          setDone(true)
          onSaved()
        }}
      />
    )
  }
  return null
}
