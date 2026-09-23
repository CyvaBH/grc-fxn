"use client"

import { useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/topbar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { FileText, Download, ArrowRight, X, Copy, Check } from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { useOrgProfile } from "@/lib/profile-store"
import {
  POLICY_TEMPLATES,
  downloadTextFile,
  fillTemplate,
  type PolicyTemplate,
} from "@/lib/policy-templates"
import { tailorPolicies } from "@/lib/policy-engine"

export default function PoliciesPage() {
  const { data: session } = useSession()
  const { profile } = useOrgProfile()
  const [active, setActive] = useState<PolicyTemplate | null>(null)
  const [values, setValues] = useState<Record<string, string>>({})
  const [body, setBody] = useState("")
  const [copied, setCopied] = useState(false)
  // While true, field edits re-fill the document; typing in the
  // document switches to manual mode so edits are never wiped.
  const autoFill = useRef(true)

  // Tailored to industry, location, data and organisational context
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
  const byId = new Map(POLICY_TEMPLATES.map((t) => [t.id, t]))
  const requiredCount = tailored.filter((p) => p.required).length

  const defaultValues = (tpl: PolicyTemplate): Record<string, string> => {
    const defaults: Record<string, string> = {
      ORG_NAME: profile.orgName || "",
      INDUSTRY: profile.industry || "",
      CONTACT_EMAIL: session?.user?.email || "",
      DPO_NAME: profile.displayName || session?.user?.name || "",
      EFFECTIVE_DATE: new Date().toLocaleDateString("en-NG", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    }
    const initial: Record<string, string> = {}
    for (const f of tpl.fields) initial[f.id] = defaults[f.id] ?? ""
    return initial
  }

  const openTemplate = (tpl: PolicyTemplate) => {
    const initial = defaultValues(tpl)
    setValues(initial)
    setBody(fillTemplate(tpl.body, initial))
    setCopied(false)
    autoFill.current = true
    setActive(tpl)
  }

  const quickDownload = (tpl: PolicyTemplate) => {
    downloadTextFile(`${tpl.id}-policy.md`, fillTemplate(tpl.body, defaultValues(tpl)))
  }

  const preview = body

  const setField = (id: string, v: string) => {
    const next = { ...values, [id]: v }
    setValues(next)
    if (active && autoFill.current) setBody(fillTemplate(active.body, next))
  }

  const handleDownload = () => {
    if (!active) return
    const filename = `${active.id}-policy.md`
    downloadTextFile(filename, preview)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(preview)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

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
                Policy Templates
              </h1>
              <p className="text-gray-500 mt-1">
                {tailored.length} templates • {requiredCount} required for{" "}
                {profile.industry || "your profile"}
                {profile.states ? ` • ${profile.states}` : ""}
              </p>
            </div>

            <div className="grid gap-4">
              {tailored.map((policy) => {
                const tpl = byId.get(policy.id)
                if (!tpl) return null
                return (
                <Card
                  key={policy.id}
                  className={
                    policy.required
                      ? "border-l-4 border-l-brand-teal hover:border-brand-teal/50 transition-colors"
                      : "hover:border-brand-teal/30 transition-colors"
                  }
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
                        {policy.blurb}
                      </p>
                      <p className="text-xs text-brand-teal mt-1 leading-relaxed">
                        {policy.required ? "Why you need it: " : "Why it's optional: "}{policy.reason}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Download ${policy.name}`}
                        onClick={() => quickDownload(tpl)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={() => openTemplate(tpl)}>
                        Use template
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
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

      {/* Editor modal */}
      {active && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-brand-navy/50 p-0 sm:p-6">
          <div className="bg-white w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl">
            <div className="sticky top-0 bg-white border-b border-border px-5 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-brand-navy">{active.name}</h2>
                <p className="text-xs text-gray-500">
                  Fill the fields, edit the text, then download or copy.
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setActive(null)} aria-label="Close editor">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-5 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                {active.fields.map((f) => (
                  <div key={f.id} className="space-y-1.5">
                    <Label htmlFor={`tpl-${f.id}`}>{f.label}</Label>
                    <Input
                      id={`tpl-${f.id}`}
                      value={values[f.id] ?? ""}
                      placeholder={f.placeholder}
                      onChange={(e) => setField(f.id, e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tpl-body">Document (editable)</Label>
                <Textarea
                  id="tpl-body"
                  value={preview}
                  onChange={(e) => {
                    autoFill.current = false
                    setBody(e.target.value)
                  }}
                  rows={18}
                  className="font-mono text-xs leading-relaxed"
                />
              </div>
              <div className="flex flex-wrap gap-2 pb-2">
                <Button onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download .md
                </Button>
                <Button variant="outline" onClick={handleCopy}>
                  {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                  {copied ? "Copied!" : "Copy text"}
                </Button>
                <Button variant="ghost" onClick={() => setActive(null)}>
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
