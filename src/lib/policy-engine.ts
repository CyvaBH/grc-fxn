import { POLICY_TEMPLATES } from "@/lib/policy-templates"

export interface TailorProfile {
  industry: string
  states: string
  dataTypes: string[]
  sizeBand: string
  enterpriseClients: boolean
  handlesPayments: boolean
  healthData: boolean
  context: string
}

export interface TailoredPolicy {
  id: string
  name: string
  blurb: string
  required: boolean
  reason: string
}

function hasOutsideNigeria(states: string): boolean {
  return states.toLowerCase().includes("outside nigeria")
}

function isBigTeam(sizeBand: string): boolean {
  return sizeBand.startsWith("51") || sizeBand.startsWith("101")
}

/**
 * Tailor the policy list to the organisation. Every required flag carries a
 * human-readable reason so the list is explainable, not generic.
 */
export function tailorPolicies(p: TailorProfile): TailoredPolicy[] {
  const industry = p.industry || ""
  const ctx = (p.context || "").toLowerCase()
  const isFintech = /fintech|financial|bank|payment|insurance/i.test(industry) || p.handlesPayments
  const isHealth = /health/i.test(industry) || p.healthData || p.dataTypes.includes("health")
  const hasKids = p.dataTypes.includes("children") || p.dataTypes.includes("students")
  const hasBiometric = p.dataTypes.includes("biometric")
  const hasLocation = p.dataTypes.includes("location")
  const hasCctv = p.dataTypes.includes("cctv")
  const crossBorder = hasOutsideNigeria(p.states) || p.enterpriseClients
  const mentions = (...words: string[]) => words.some((w) => ctx.includes(w))

  const required = new Map<string, string>()
  const req = (id: string, reason: string) => {
    if (!required.has(id)) required.set(id, reason)
  }

  // Baseline every data-handling organisation needs
  req("data-protection", "Every organisation handling personal data needs this under the NDPA — it is your core evidence of lawful processing.")
  req("acceptable-use", "Staff need written rules for devices and accounts; most breaches start with misuse, not hacking.")
  req("access-control", "Auditors check passwords, MFA and leaver handling first. Non-negotiable baseline.")
  req("incident-response", "The NDPC's 72-hour breach notification window means you must have a written response flow before anything happens.")
  req("audit-logging", "Without logs you cannot investigate incidents or prove anything to an auditor.")
  req("training-awareness", "Untrained staff are the top breach cause. Annual training is an explicit NDPA expectation.")
  req("dpo-letter", "A named DPO is required for organisations of major importance and expected of everyone else.")
  req("dsr-procedure", "Customers have NDPA rights to access, correct and delete their data — you need a working process.")
  req("data-retention", "Keeping data forever is itself a violation. A schedule plus one disposal pass fixes it.")

  if (isFintech) {
    req("vendor-management", `Financial services face CBN-grade expectations on third parties — your ${industry || "payments"} profile means vendor due diligence is required, not optional.`)
    req("network-cloud", "Money movement over networks draws attacker and regulator attention. A documented baseline is required for fintech.")
  }
  if (isHealth) {
    req("data-retention", "Health records are sensitive data with strict storage limits — your retention schedule must explicitly cover them.")
    req("training-awareness", "Staff handling health records need role-specific privacy training beyond the basics.")
  }
  if (hasKids) {
    req("dsr-procedure", "You handle children's or student data, which needs parental-consent flows — your request procedure must cover them.")
  }
  if (hasBiometric) {
    req("data-protection", "Biometrics can't be reissued if leaked, so your policy must justify and ring-fence biometric processing explicitly.")
  }
  if (hasLocation || hasCctv) {
    req("data-protection", "Location tracking and camera footage are surveillance-adjacent — your notices and retention limits must spell them out.")
  }
  if (p.handlesPayments && !isFintech) {
    req("network-cloud", "You take card payments, so the systems touching money need a documented security baseline.")
  }
  if (isBigTeam(p.sizeBand)) {
    req("business-continuity", "At 50+ staff, a disruption hits customers hard — continuity planning becomes required.")
    req("hr-onboarding", "Larger teams mean constant joiners and leavers — formalize the security checks.")
  }
  if (crossBorder) {
    req("cross-border", "You operate across borders or serve enterprise clients abroad — cross-border transfer rules apply to you.")
  }
  if (mentions("vendor", "supplier", "third part", "outsource")) {
    req("vendor-management", "You mentioned third parties in your organisational context — vendor due diligence is required.")
  }
  if (mentions("remote", "work from home", "hybrid", "personal phone", "byod")) {
    req("byod", "Your context mentions remote/personal devices — put the rules in writing.")
  }
  if (mentions("cloud", "aws", "azure", "hosting", "server")) {
    req("network-cloud", "Your context mentions cloud/hosting — a documented baseline is required.")
  }
  if (mentions("branch", "office", "shop", "store", "premises")) {
    req("physical-security", "Your context mentions physical premises — office and device rules are required.")
  }

  const byId = new Map(POLICY_TEMPLATES.map((t) => [t.id, t]))
  const out: TailoredPolicy[] = []
  for (const t of POLICY_TEMPLATES) {
    const reason = required.get(t.id)
    out.push({
      id: t.id,
      name: t.name,
      blurb: t.blurb,
      required: reason !== undefined,
      reason:
        reason ||
        "Good practice for your profile, but not in your required set — adopt it when the required ones are done.",
    })
  }
  // Required first, then the rest in library order
  void byId
  return out.sort((a, b) => Number(b.required) - Number(a.required))
}
