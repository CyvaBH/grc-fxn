"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { DATA_TYPES } from "@/lib/data-types"
import { StateSelector, statesArray } from "@/components/state-selector"
import {
  ContextBuilder,
  composeContext,
  contextDetailComplete,
  parseContextDetail,
  EMPTY_CONTEXT_DETAIL,
  type ContextDetail,
} from "@/components/context-builder"
import { getLocalProfile, saveLocalProfile } from "@/lib/profile-store"
import { useSession } from "@/lib/auth-client"

const industries = [
  "Fintech / Financial Services",
  "Healthcare / Health Tech",
  "E-commerce / Retail",
  "EdTech / Education",
  "Logistics / Delivery",
  "SaaS / Technology",
  "Consulting / Professional Services",
  "Media / Entertainment",
  "Agriculture / AgriTech",
  "Real Estate / PropTech",
  "Other",
]

const sizeBands = [
  { label: "1-10", value: "1-10" },
  { label: "11-50", value: "11-50" },
  { label: "51-100", value: "51-100" },
  { label: "101+", value: "101+" },
]

interface ProfilerData {
  orgName: string
  industry: string
  sizeBand: string
  states: string
  dataTypes: string[]
  context: string
  handlesPayments: boolean
  healthData: boolean
  hasWebsite: boolean
  enterpriseClients: boolean
}

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [step, setStep] = useState(0)
  const [industryLocked, setIndustryLocked] = useState(false)
  const [saving, setSaving] = useState(false)
  const [ctxDetail, setCtxDetail] = useState<ContextDetail>(EMPTY_CONTEXT_DETAIL)
  const [data, setData] = useState<ProfilerData>({
    orgName: "",
    industry: "",
    sizeBand: "",
    states: "",
    dataTypes: [],
    context: "",
    handlesPayments: false,
    healthData: false,
    hasWebsite: false,
    enterpriseClients: false,
  })

  const totalSteps = 7
  const progress = ((step + 1) / totalSteps) * 100

  // Resume saved answers; lock industry if already set on the server
  useEffect(() => {
    const saved = getLocalProfile()
    setData((prev) => ({
      ...prev,
      orgName: saved.orgName,
      industry: saved.industry,
      sizeBand: saved.sizeBand,
      states: saved.states,
      dataTypes: saved.dataTypes,
      context: saved.context,
      handlesPayments: saved.handlesPayments,
      healthData: saved.healthData,
      hasWebsite: saved.hasWebsite,
      enterpriseClients: saved.enterpriseClients,
    }))
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res?.profile) {
          const p = res.profile
          if (p.industry) {
            setIndustryLocked(true)
            setData((prev) => ({ ...prev, industry: p.industry }))
          }
          setData((prev) => ({
            ...prev,
            orgName: prev.orgName || p.orgName || "",
            sizeBand: prev.sizeBand || p.sizeBand || "",
            states: prev.states || p.states || "",
            dataTypes: prev.dataTypes.length > 0 ? prev.dataTypes : p.dataTypes || [],
            context: prev.context || p.context || "",
          }))
          if (p.contextDetail || p.context) {
            setCtxDetail(parseContextDetail(p.contextDetail || "", p.context || ""))
          }
        }
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleDataType = (id: string) => {
    setData((prev) => ({
      ...prev,
      dataTypes: prev.dataTypes.includes(id)
        ? prev.dataTypes.filter((t) => t !== id)
        : [...prev.dataTypes, id],
    }))
  }

  const canAdvance = () => {
    switch (step) {
      case 0:
        return data.orgName.trim().length > 0
      case 1:
        return data.industry.length > 0
      case 2:
        return data.sizeBand.length > 0
      case 3:
        return statesArray(data.states).length > 0
      case 4:
        return data.dataTypes.length > 0
      case 5:
        return contextDetailComplete(ctxDetail)
      case 6:
        return true
      default:
        return false
    }
  }

  const handleFinish = async () => {
    setSaving(true)
    const composed = composeContext(ctxDetail)
    const payload = { ...data, context: composed, contextDetail: JSON.stringify(ctxDetail) }
    saveLocalProfile(payload)
    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    } catch {
      // Server sync failed — local copy still lets them continue
    } finally {
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen bg-brand-mist">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-brand-teal" />
            <span className="text-lg font-bold text-brand-navy">Cyber Trust Nest</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:inline">
              Step {step + 1} of {totalSteps}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                saveLocalProfile({ ...data })
                try {
                  await fetch("/api/profile", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                  })
                } catch {}
                router.push(session ? "/dashboard" : "/")
              }}
            >
              Save & exit
            </Button>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="bg-white border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <Progress value={progress} />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl border border-border shadow-sm p-8">
          {/* Step 0: Org Name */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-brand-navy">
                  What&apos;s your organization called?
                </h2>
                <p className="text-gray-500 mt-1">
                  This appears on your compliance profile and reports.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization name</Label>
                <Input
                  id="orgName"
                  placeholder="e.g. Acme Fintech Ltd"
                  value={data.orgName}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, orgName: e.target.value }))
                  }
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Step 1: Industry (locks after first save) */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-brand-navy">
                  What industry are you in?
                </h2>
                <p className="text-gray-500 mt-1">
                  This determines which regulations and policies apply. You choose
                  once — it locks permanently and cannot be changed afterwards.
                </p>
              </div>
              {industryLocked ? (
                <div className="p-4 bg-brand-mist rounded-lg flex items-center gap-3">
                  <Lock className="h-5 w-5 text-brand-teal flex-shrink-0" />
                  <div>
                    <p className="font-medium text-brand-navy text-sm">{data.industry}</p>
                    <p className="text-xs text-gray-500">
                      Locked permanently. It cannot be changed.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {industries.map((industry) => (
                    <button
                      key={industry}
                      onClick={() =>
                        setData((prev) => ({ ...prev, industry }))
                      }
                      className={cn(
                        "p-3 rounded-lg border text-left text-sm font-medium transition-all",
                        data.industry === industry
                          ? "border-brand-teal bg-brand-teal/5 text-brand-teal"
                          : "border-border hover:border-gray-300 text-brand-navy"
                      )}
                    >
                      {industry}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Size */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-brand-navy">
                  How many people work at {data.orgName || "your org"}?
                </h2>
                <p className="text-gray-500 mt-1">
                  This affects which obligations apply and how complex your plan
                  is.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {sizeBands.map((band) => (
                  <button
                    key={band.value}
                    onClick={() =>
                      setData((prev) => ({ ...prev, sizeBand: band.value }))
                    }
                    className={cn(
                      "p-4 rounded-lg border text-center text-lg font-semibold transition-all",
                      data.sizeBand === band.value
                        ? "border-brand-teal bg-brand-teal/5 text-brand-teal"
                        : "border-border hover:border-gray-300 text-brand-navy"
                    )}
                  >
                    {band.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Operating states */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-brand-navy">
                  Where do you operate?
                </h2>
                <p className="text-gray-500 mt-1">
                  Select every state you have staff, customers or offices in. This
                  shapes cross-border and transfer obligations.
                </p>
              </div>
              <StateSelector
                value={data.states}
                onChange={(states) => setData((prev) => ({ ...prev, states }))}
              />
              {statesArray(data.states).length > 0 && (
                <p className="text-xs text-gray-500">
                  Selected: {statesArray(data.states).join(", ")}
                </p>
              )}
            </div>
          )}

          {/* Step 4: Data Types with explanations */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-brand-navy">
                  What types of personal data do you handle?
                </h2>
                <p className="text-gray-500 mt-1">
                  Select all that apply. Each item explains why it matters for NDPA compliance.
                </p>
              </div>
              <div className="space-y-2">
                {DATA_TYPES.map((type) => {
                  const on = data.dataTypes.includes(type.id)
                  return (
                    <button
                      key={type.id}
                      onClick={() => toggleDataType(type.id)}
                      className={cn(
                        "w-full p-3 rounded-lg border text-left transition-all",
                        on ? "border-brand-teal bg-brand-teal/5" : "border-border hover:border-gray-300"
                      )}
                    >
                      <span className="flex items-center gap-2 text-sm font-medium text-brand-navy">
                        {on && <CheckCircle2 className="h-4 w-4 text-brand-teal flex-shrink-0" />}
                        {type.label}
                      </span>
                      <span className="block text-xs text-gray-500 mt-1 leading-relaxed">
                        {type.explain}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 5: Organizational context (checklists + notes) */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-brand-navy">
                  Describe your organizational context
                </h2>
                <p className="text-gray-500 mt-1">
                  Like ISO 27001 Clause 4 and the NDPA require: tick what applies, add
                  notes only where you want. This tailors your policy list.
                </p>
              </div>
              <ContextBuilder value={ctxDetail} onChange={setCtxDetail} />
            </div>
          )}

          {/* Step 6: Quick checks */}
          {step === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-brand-navy">
                  A few more details
                </h2>
                <p className="text-gray-500 mt-1">
                  These help us tailor your compliance profile.
                </p>
              </div>
              <div className="space-y-4">
                {[
                  {
                    key: "handlesPayments" as const,
                    label: "Do you handle card payments or transfers?",
                  },
                  {
                    key: "healthData" as const,
                    label: "Do you process health-related data?",
                  },
                  {
                    key: "hasWebsite" as const,
                    label: "Do you have a website or mobile app?",
                  },
                  {
                    key: "enterpriseClients" as const,
                    label: "Do you sell to enterprise clients?",
                  },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() =>
                      setData((prev) => ({
                        ...prev,
                        [item.key]: !prev[item.key],
                      }))
                    }
                    className={cn(
                      "w-full p-4 rounded-lg border text-left text-sm font-medium transition-all flex items-center justify-between",
                      data[item.key]
                        ? "border-brand-teal bg-brand-teal/5"
                        : "border-border hover:border-gray-300"
                    )}
                  >
                    <span className="text-brand-navy">{item.label}</span>
                    <div
                      className={cn(
                        "h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors",
                        data[item.key]
                          ? "bg-brand-teal border-brand-teal"
                          : "border-gray-300"
                      )}
                    >
                      {data[item.key] && (
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            {step > 0 ? (
              <Button
                variant="ghost"
                onClick={() => setStep((s) => s - 1)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            ) : (
              <div />
            )}
            {step < totalSteps - 1 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canAdvance()}
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleFinish} disabled={saving}>
                {saving ? "Saving…" : "Generate my profile"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Preview hint */}
        {step >= 1 && (
          <div className="mt-6 p-4 bg-status-infoBg rounded-lg">
            <p className="text-sm text-brand-navy">
              <strong>Likely applies:</strong>{" "}
              {data.dataTypes.length > 0
                ? "NDPA likely applies because you handle personal data."
                : "Complete the profiler to see which regulations apply."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
