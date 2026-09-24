"use client"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ContextDetail {
  /** What the organization does — focus and objectives (required, free text). */
  about: string
  dataLive: string[]
  handlers: string[]
  thirdParties: string[]
  access: string[]
  /** Anything else, in their own words (required). */
  notes: string
}

export const EMPTY_CONTEXT_DETAIL: ContextDetail = {
  about: "",
  dataLive: [],
  handlers: [],
  thirdParties: [],
  access: [],
  notes: "",
}

export const ABOUT_MIN = 30

type ArrayKey = "dataLive" | "handlers" | "thirdParties" | "access"

const GROUPS: { key: ArrayKey; title: string; hint: string; options: string[] }[] = [
  {
    key: "dataLive",
    title: "Where does customer and staff data live?",
    hint: "Select all that apply",
    options: [
      "Our own office servers",
      "Cloud hosting (AWS, Azure, Google Cloud)",
      "SaaS tools (CRM, accounting, marketing)",
      "Staff laptops and phones",
      "Paper files and cabinets",
      "Not sure yet",
    ],
  },
  {
    key: "handlers",
    title: "Who handles data day-to-day?",
    hint: "Everyone who can see customer or staff records",
    options: [
      "Founders only",
      "Onsite employees",
      "Hybrid staff",
      "Remote staff",
      "Contractors / freelancers",
      "Interns / volunteers",
    ],
  },
  {
    key: "thirdParties",
    title: "Which third parties touch your data?",
    hint: "Vendors and providers outside your company",
    options: [
      "Payment processor (e.g. Paystack, Flutterwave)",
      "Cloud / hosting provider",
      "Email or SMS provider",
      "KYC / verification vendor",
      "Accountant or auditor",
      "No third parties",
    ],
  },
  {
    key: "access",
    title: "How do staff access work systems?",
    hint: "The devices work happens on",
    options: [
      "Company-owned devices",
      "Personal devices (BYOD)",
      "Shared computers",
      "Not sure yet",
    ],
  },
]

/** Compose the plain-language paragraph the tailoring engine reads. */
export function composeContext(v: ContextDetail): string {
  const parts = [
    `About the organization — focus and objectives: ${v.about.trim() || "—"}.`,
    `Customer and staff data lives in: ${v.dataLive.join("; ") || "—"}.`,
    `Day-to-day, data is handled by: ${v.handlers.join("; ") || "—"}.`,
    `Third parties with data access: ${v.thirdParties.join("; ") || "—"}.`,
    `Staff access work systems through: ${v.access.join("; ") || "—"}.`,
    `Additional notes: ${v.notes.trim() || "—"}.`,
  ]
  return parts.join(" ")
}

export function contextDetailComplete(v: ContextDetail): boolean {
  return (
    v.about.trim().length >= ABOUT_MIN &&
    v.dataLive.length > 0 &&
    v.handlers.length > 0 &&
    v.thirdParties.length > 0 &&
    v.access.length > 0
  )
}

function strArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []
}

export function parseContextDetail(json: string, fallbackNotes: string): ContextDetail {
  try {
    const parsed = JSON.parse(json) as Record<string, unknown>
    if (parsed && (Array.isArray(parsed.dataLive) || typeof parsed.about === "string")) {
      return {
        about: typeof parsed.about === "string" ? parsed.about : "",
        dataLive: strArray(parsed.dataLive),
        handlers: strArray(parsed.handlers),
        thirdParties: strArray(parsed.thirdParties),
        access: strArray(parsed.access),
        notes: typeof parsed.notes === "string" ? parsed.notes : "",
      }
    }
  } catch {}
  // Legacy free-text context becomes the notes field so nothing is lost
  return { ...EMPTY_CONTEXT_DETAIL, notes: fallbackNotes || "" }
}

/** Checklist-based context builder with a free-text box only where composition is needed. */
export function ContextBuilder({
  value,
  onChange,
}: {
  value: ContextDetail
  onChange: (next: ContextDetail) => void
}) {
  const toggle = (key: ArrayKey, option: string) => {
    const current = value[key]
    onChange({
      ...value,
      [key]: current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option],
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="ctx-about">
          What does your organization do? Focus and objectives{" "}
          <span className="text-gray-400 font-normal">(required)</span>
        </Label>
        <Textarea
          id="ctx-about"
          rows={4}
          value={value.about}
          onChange={(e) => onChange({ ...value, about: e.target.value })}
          placeholder="E.g. We are a 25-person Lagos fintech helping market traders save daily via a mobile wallet. Our objective this year is 100,000 active savers while keeping customer funds and data safe."
        />
        <p className={value.about.trim().length >= ABOUT_MIN ? "text-xs text-brand-teal" : "text-xs text-gray-400"}>
          {value.about.trim().length}/{ABOUT_MIN} characters minimum
        </p>
      </div>
      {GROUPS.map((g) => (
        <div key={g.key} className="space-y-2">
          <Label>
            {g.title} <span className="text-gray-400 font-normal">— {g.hint}</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {g.options.map((opt) => {
              const on = value[g.key].includes(opt)
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggle(g.key, opt)}
                  className={cn(
                    "px-3 py-1.5 rounded-full border text-xs font-medium transition-all text-left",
                    on
                      ? "border-brand-teal bg-brand-teal text-white"
                      : "border-border hover:border-gray-300 text-brand-navy"
                  )}
                >
                  {on && <CheckCircle2 className="inline h-3 w-3 mr-1" />}
                  {opt}
                </button>
              )
            })}
          </div>
        </div>
      ))}
      <div className="space-y-2">
        <Label htmlFor="ctx-notes">
          Anything else in your own words? <span className="text-gray-400 font-normal">(optional)</span>
        </Label>
        <Textarea
          id="ctx-notes"
          rows={4}
          value={value.notes}
          onChange={(e) => onChange({ ...value, notes: e.target.value })}
          placeholder="E.g. We share KYC data with two verification vendors; 3 contractors have database access; planning to launch in Ghana next year."
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">What you do</Badge>
        <Badge variant="secondary">Who handles data</Badge>
        <Badge variant="secondary">Vendors & cloud</Badge>
        <Badge variant="secondary">Staff & devices</Badge>
      </div>
    </div>
  )
}
