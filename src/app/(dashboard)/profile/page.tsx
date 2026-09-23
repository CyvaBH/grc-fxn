"use client"

import { useState } from "react"
import Link from "next/link"
import { ReadinessScore } from "@/components/ui/readiness-score"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/topbar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EvidenceModal } from "@/components/evidence-modal"
import {
  FileCheck,
  ExternalLink,
  Download,
  ShieldCheck,
  Pencil,
  CheckCircle2,
} from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { useOrgProfile } from "@/lib/profile-store"
import { useReadiness } from "@/lib/use-readiness"
import {
  ACTIONS,
  firstFewActions,
  type Evidence,
  type ReadinessAction,
} from "@/lib/readiness"
import { DATA_TYPES } from "@/lib/data-types"
import { cn } from "@/lib/utils"

const BASE_REGULATIONS = [
  {
    name: "Nigeria Data Protection Act (NDPA) 2023",
    applies: true,
    confidence: "high",
    why: "Your organization stores customer phone numbers and names, which constitutes personal data under NDPA.",
    citations: ["NDPA §25", "NDPC GAID Art. 12"],
    obligations: [
      "Appoint a Data Protection Officer (DPO)",
      "Register with NDPC if processing >2,000 records",
      "Conduct Data Protection Impact Assessment",
      "File annual audit via DPCO",
    ],
  },
  {
    name: "NDPC General Application & Implementation Directive",
    applies: true,
    confidence: "high",
    why: "Supplements NDPA with specific implementation requirements for all data controllers.",
    citations: ["NDPC GAID Art. 3", "NDPC GAID Art. 8"],
    obligations: [
      "Implement data protection policies",
      "Conduct staff training annually",
      "Maintain records of processing activities",
    ],
  },
  {
    name: "CBN Cybersecurity Framework",
    applies: false,
    confidence: "medium",
    why: "Applies to licensed financial institutions. You are not a bank or licensed fintech.",
    citations: [],
    obligations: [],
  },
]

const LAGOS_REGULATION = {
  name: "Lagos State Cybersecurity Guidelines 2026",
  applies: true,
  confidence: "high",
  why: "You operate in Lagos. The state's 2026 guidelines (MIST, via the State Cybersecurity Advisory Council) translate national policy — NDPA 2023, Cybercrime Act 2024 — into practical expectations for every Lagos business. They are guidance, not a separate law, but following them is the clearest way to show diligence in Lagos.",
  citations: ["LASG Guidelines 2026", "MIST"],
  obligations: [
    "Run the state's cybersecurity self-assessment for your size (SME or enterprise track)",
    "Enforce MFA and password managers for all staff",
    "Separate guest Wi-Fi from business networks",
    "Run staff awareness training quarterly",
    "Keep automated, encrypted data backups",
    "Report incidents within 72 hours",
  ],
  links: [
    { label: "Official guidelines (lagosstate.gov.ng)", url: "https://lagosstate.gov.ng/cybersecguide" },
    { label: "Guardian: Lagos releases guidelines (Apr 2026)", url: "https://guardian.ng/news/lagos-to-strengthen-digital-safety-with-cybersecurity-guidelines/" },
  ],
}

function buildRegulations(states: string) {
  const isLagos = states.toLowerCase().includes("lagos")
  return isLagos ? [...BASE_REGULATIONS, LAGOS_REGULATION] : BASE_REGULATIONS
}

const frameworks = [
  {
    name: "ISO 27001:2022",
    recommended: true,
    effort: "Medium — 3-6 months",
    why: "Strong signal for enterprise clients. Start with Statement of Applicability.",
  },
  {
    name: "SOC 2 Type I",
    recommended: false,
    effort: "High — 6-9 months",
    why: "Only if selling to US enterprise clients. Defer until v2.",
  },
]

function dataLabel(id: string): string {
  return DATA_TYPES.find((d) => d.id === id)?.label || id
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const { profile } = useOrgProfile()
  const { score, byDimension, evidencedIds, evidence, reload } = useReadiness()
  const [evidenceFor, setEvidenceFor] = useState<ReadinessAction | null>(null)

  const displayName = profile.displayName || session?.user?.name || "—"
  const email = session?.user?.email || "—"
  const orgName = profile.orgName || "My Organization"

  const evidenceByAction = new Map<string, Evidence>()
  for (const e of evidence) evidenceByAction.set(e.actionId, e)

  const handleExport = () => {
    window.print()
  }

  const tailored = firstFewActions({
    industry: profile.industry,
    dataTypes: profile.dataTypes,
    handlesPayments: profile.handlesPayments,
    healthData: profile.healthData,
    enterpriseClients: profile.enterpriseClients,
  })
  const regs = buildRegulations(profile.states)
  const appliesCount = regs.filter((r) => r.applies).length

  return (
    <div className="min-h-screen bg-brand-mist flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          orgName={orgName}
          readinessScore={score}
          userName={profile.displayName || session?.user?.name || ""}
          avatar={profile.avatar}
        />
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-brand-navy">
                  Compliance Profile
                </h1>
                <p className="text-gray-500 mt-1">
                  {orgName} • Generated Sep 12, 2026 • Ruleset v0.1
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Link href="/onboarding">
                  <Button size="sm" className="font-bold">
                    Re-take profiler
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
              </div>
            </div>

            {/* General — your answers, editable */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  General
                </CardTitle>
                <Link href="/settings">
                  <Button variant="ghost" size="sm" className="text-brand-teal">
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  {[
                    ["Name", displayName],
                    ["Email", email],
                    ["Organization", profile.orgName || "—"],
                    ["Industry (locked)", profile.industry || "—"],
                    ["Team size", profile.sizeBand || "—"],
                    ["Operating states", profile.states || "—"],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-brand-mist rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                      <p className="font-medium text-brand-navy break-words">{value}</p>
                    </div>
                  ))}
                </div>
                {profile.context && (
                  <div className="bg-brand-mist rounded-lg p-3 mt-4 text-sm">
                    <p className="text-xs text-gray-500 mb-0.5">Organizational context</p>
                    <p className="text-brand-navy leading-relaxed whitespace-pre-wrap">{profile.context}</p>
                  </div>
                )}
                {profile.dataTypes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {profile.dataTypes.map((t) => (
                      <Badge key={t} variant="secondary">{dataLabel(t)}</Badge>
                    ))}
                  </div>
                )}
                {(!profile.orgName || !profile.industry) && (
                  <p className="text-sm text-gray-500 mt-3">
                    Missing details?{" "}
                    <Link href="/onboarding" className="text-brand-teal font-medium hover:underline">
                      Complete the profiler
                    </Link>{" "}
                    or edit in{" "}
                    <Link href="/settings" className="text-brand-teal font-medium hover:underline">
                      Settings
                    </Link>
                    .
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Score card */}
            <Card>
              <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                <ReadinessScore score={score} previousScore={0} />
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-lg font-semibold text-brand-navy">
                    Your Readiness Score: {score}/100
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {score === 0
                      ? "Starting at zero is honest — every point below was earned with evidence you submitted."
                      : "Every point below was earned with evidence you submitted. Keep going."}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="applies">{appliesCount} regulation{appliesCount === 1 ? "" : "s"} apply</Badge>
                    <Badge variant="likely">1 framework recommended</Badge>
                    <Badge variant="notapplies">{regs.length - appliesCount} do{regs.length - appliesCount === 1 ? "es" : ""} not apply</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How the score is calculated — full assessment breakdown */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  How your score is calculated
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {byDimension.map(({ dimension, earned, total }) => {
                  const pct = total > 0 ? Math.round((earned / total) * 100) : 0
                  return (
                    <div key={dimension.id}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-brand-navy">
                          {dimension.name} <span className="text-gray-400 font-normal">• {dimension.weight}% of score</span>
                        </p>
                        <p className="text-xs text-gray-500">{earned}/{total} pts ({pct}%)</p>
                      </div>
                      <div className="h-2 rounded-full bg-brand-mist overflow-hidden mb-2">
                        <div
                          className="h-full bg-brand-teal rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{dimension.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        <strong>What counts:</strong> {dimension.measures.join(" ")}
                      </p>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="regulations">
              <TabsList>
                <TabsTrigger value="regulations">Regulations</TabsTrigger>
                <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
                <TabsTrigger value="policies">Policies</TabsTrigger>
                <TabsTrigger value="plan">Action Plan</TabsTrigger>
              </TabsList>

              <TabsContent value="regulations" className="space-y-4 mt-4">
                {buildRegulations(profile.states).map((reg) => (
                  <Card
                    key={reg.name}
                    className={
                      reg.applies ? "border-l-4 border-l-brand-teal" : ""
                    }
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">
                            {reg.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant={
                                reg.applies
                                  ? reg.confidence === "high"
                                    ? "applies"
                                    : "likely"
                                  : "notapplies"
                              }
                            >
                              {reg.applies ? "Applies" : "Does not apply"}
                            </Badge>
                            {!reg.applies && (
                              <Badge variant="secondary">
                                {reg.confidence} confidence
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">{reg.why}</p>
                      {reg.citations.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {reg.citations.map((cite) => (
                            <span
                              key={cite}
                              className="text-xs font-mono bg-brand-mist px-2 py-1 rounded text-brand-navy"
                            >
                              {cite}
                            </span>
                          ))}
                        </div>
                      )}
                      {"links" in reg && Array.isArray((reg as { links?: { label: string; url: string }[] }).links) && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {((reg as { links: { label: string; url: string }[] }).links).map((l) => (
                            <a
                              key={l.url}
                              href={l.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-brand-teal font-medium hover:underline"
                            >
                              {l.label} ↗
                            </a>
                          ))}
                        </div>
                      )}
                      {reg.obligations.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-2">
                            KEY OBLIGATIONS
                          </p>
                          <ul className="space-y-1.5">
                            {reg.obligations.map((obl) => (
                              <li
                                key={obl}
                                className="flex items-start gap-2 text-sm text-brand-navy"
                              >
                                <ShieldCheck className="h-4 w-4 text-brand-teal mt-0.5 flex-shrink-0" />
                                {obl}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="frameworks" className="space-y-4 mt-4">
                {frameworks.map((fw) => (
                  <Card key={fw.name}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{fw.name}</CardTitle>
                        <Badge variant={fw.recommended ? "default" : "secondary"}>
                          {fw.recommended ? "Recommended" : "Optional"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-2">{fw.why}</p>
                      <p className="text-xs text-gray-500">
                        Effort: {fw.effort}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="policies" className="mt-4">
                <Card>
                  <CardContent className="p-6 text-center">
                    <FileCheck className="h-12 w-12 text-brand-teal mx-auto mb-3" />
                    <h3 className="font-semibold text-brand-navy mb-1">
                      Policy Templates
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Templates tailored to your industry and context.
                    </p>
                    <Link href="/policies">
                      <Button>
                        View policy library
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="plan" className="mt-4">
                <Card className="mb-4">
                  <CardContent className="p-4 text-xs text-gray-600 leading-relaxed">
                    Your plan is generated from your industry, data and context — and items
                    only complete with evidence. Each action is worth points toward your score.
                  </CardContent>
                </Card>
                <div className="space-y-3">
                  {[
                    { horizon: "First", items: tailored },
                    { horizon: "Next", items: ACTIONS.filter((a) => !tailored.some((t) => t.id === a.id)).slice(0, 5) },
                  ].map((phase) => (
                    <Card key={phase.horizon}>
                      <CardHeader>
                        <CardTitle className="text-base">{phase.horizon} actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {phase.items.map((item) => {
                          const ev = evidenceByAction.get(item.id)
                          return (
                            <button
                              key={item.id}
                              onClick={() => setEvidenceFor(item)}
                              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-brand-mist text-left transition-colors"
                            >
                              <div
                                className={cn(
                                  "h-5 w-5 rounded-md border-2 flex items-center justify-center flex-shrink-0",
                                  ev ? "bg-brand-teal border-brand-teal" : "border-gray-300"
                                )}
                              >
                                {ev && <CheckCircle2 className="h-3 w-3 text-white" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={cn("text-sm font-medium", ev ? "text-gray-400 line-through" : "text-brand-navy")}>
                                  {item.title} <span className="text-gray-400 font-normal">• +{item.points} pts</span>
                                </p>
                                {ev && (
                                  <p className="text-xs text-gray-500 truncate mt-0.5">“{ev.evidence}”</p>
                                )}
                              </div>
                              <Badge variant={item.effort === "Low" ? "default" : item.effort === "Med" ? "likely" : "destructive"}>
                                {item.effort}
                              </Badge>
                            </button>
                          )
                        })}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      <MobileNav />

      {evidenceFor && (
        <EvidenceModal
          action={evidenceFor}
          existing={evidenceByAction.get(evidenceFor.id) || null}
          onClose={() => setEvidenceFor(null)}
          onSaved={reload}
        />
      )}
    </div>
  )
}
