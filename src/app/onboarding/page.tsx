"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

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

const dataTypes = [
  "Names & phone numbers",
  "Email addresses",
  "BVN / NIN / government IDs",
  "Health records",
  "Payment / card data",
  "Employee records",
  "Location data",
  "Biometric data",
  "Children's data",
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
  handlesPayments: boolean
  healthData: boolean
  hasWebsite: boolean
  enterpriseClients: boolean
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<ProfilerData>({
    orgName: "",
    industry: "",
    sizeBand: "",
    states: "",
    dataTypes: [],
    handlesPayments: false,
    healthData: false,
    hasWebsite: false,
    enterpriseClients: false,
  })

  const totalSteps = 5
  const progress = ((step + 1) / totalSteps) * 100

  const toggleDataType = (type: string) => {
    setData((prev) => ({
      ...prev,
      dataTypes: prev.dataTypes.includes(type)
        ? prev.dataTypes.filter((t) => t !== type)
        : [...prev.dataTypes, type],
    }))
  }

  const canAdvance = () => {
    switch (step) {
      case 0:
        return data.orgName.length > 0
      case 1:
        return data.industry.length > 0
      case 2:
        return data.sizeBand.length > 0
      case 3:
        return data.dataTypes.length > 0
      case 4:
        return true
      default:
        return false
    }
  }

  const handleFinish = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-brand-mist">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-brand-teal" />
            <span className="text-lg font-bold text-brand-navy">[Product]</span>
          </div>
          <span className="text-sm text-gray-500">
            Step {step + 1} of {totalSteps}
          </span>
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

          {/* Step 1: Industry */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-brand-navy">
                  What industry are you in?
                </h2>
                <p className="text-gray-500 mt-1">
                  This determines which regulations and frameworks apply.
                </p>
              </div>
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

          {/* Step 3: Data Types */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-brand-navy">
                  What types of personal data do you handle?
                </h2>
                <p className="text-gray-500 mt-1">
                  Select all that apply. This is critical for NDPA compliance.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {dataTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleDataType(type)}
                    className={cn(
                      "px-4 py-2 rounded-full border text-sm font-medium transition-all",
                      data.dataTypes.includes(type)
                        ? "border-brand-teal bg-brand-teal text-white"
                        : "border-border hover:border-gray-300 text-brand-navy"
                    )}
                  >
                    {data.dataTypes.includes(type) && (
                      <CheckCircle2 className="inline h-3.5 w-3.5 mr-1" />
                    )}
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Quick checks */}
          {step === 4 && (
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
              <Button onClick={handleFinish}>
                Generate my profile
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
