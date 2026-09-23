export type DimensionId =
  | "governance"
  | "policies"
  | "people"
  | "access"
  | "incident"
  | "data"

export interface Dimension {
  id: DimensionId
  name: string
  weight: number
  /** Plain-language explanation of what this assessment measures and why it matters. */
  description: string
  /** What counts toward this dimension — shown so nothing feels fabricated. */
  measures: string[]
}

export const DIMENSIONS: Dimension[] = [
  {
    id: "governance",
    name: "Governance & Accountability",
    weight: 20,
    description:
      "Whether someone is clearly responsible for data protection and your organisation is visible to the regulator. Without an accountable owner, every other control drifts — the NDPA names the DPO and NDPC registration as the backbone of compliance.",
    measures: [
      "A named Data Protection Officer (evidence: designation letter or appointment note)",
      "NDPC registration started or completed (evidence: registration reference or DPCO engagement)",
    ],
  },
  {
    id: "policies",
    name: "Policies & Documentation",
    weight: 20,
    description:
      "Whether the rules your team must follow actually exist on paper. Auditors and enterprise clients ask for policies first — a control nobody wrote down cannot be proven, trained, or enforced.",
    measures: [
      "Data Protection & Privacy Policy customized for your organisation",
      "Incident Response Plan customized for your organisation",
      "Access Control & Password Policy customized for your organisation",
    ],
  },
  {
    id: "people",
    name: "People & Training",
    weight: 15,
    description:
      "Whether your staff know enough not to cause a breach. Most breaches start with a person — a clicked link, a shared password, a misaddressed email — so trained people are a measurable control, not a formality.",
    measures: [
      "Company-wide security awareness completed (evidence: session date, attendance count or photos)",
      "Phishing refresher completed (evidence: test results or session note)",
    ],
  },
  {
    id: "access",
    name: "Access & Authentication",
    weight: 15,
    description:
      "Whether only the right people can reach your systems and data. Stolen credentials are the most common break-in method, so MFA and regular access reviews carry real weight in this score.",
    measures: [
      "MFA enabled on all admin, email and finance accounts (evidence: screenshot or provider report)",
      "Quarterly access review done — joiners/movers/leavers handled (evidence: review sheet or note)",
    ],
  },
  {
    id: "incident",
    name: "Incident Readiness",
    weight: 15,
    description:
      "Whether you can detect, contain and report a breach within the NDPC's 72-hour notification window. Readiness is proven by practice and records, not by owning a plan document alone.",
    measures: [
      "Tabletop drill or walkthrough of the incident plan (evidence: drill date, attendees, lessons)",
      "Breach register started — even with zero incidents logged (evidence: register screenshot or file)",
    ],
  },
  {
    id: "data",
    name: "Data Subject & Lifecycle",
    weight: 15,
    description:
      "Whether you can honor people's rights over their data and dispose of it properly. The NDPA gives customers rights to access, correct and delete their data — and punishes keeping data forever.",
    measures: [
      "Data Subject Request process tested or used (evidence: procedure doc, log entry, or test note)",
      "Retention schedule applied — old data actually deleted (evidence: before/after note or disposal log)",
    ],
  },
]

export interface ReadinessAction {
  id: string
  title: string
  dimension: DimensionId
  points: number
  effort: "Low" | "Med" | "High"
  priority: number
  /** Step-by-step guidance shown in the app. */
  howTo: string
  /** What evidence the user must provide to mark it complete. */
  evidencePrompt: string
  industries?: string[]
  dataTriggers?: string[]
}

export const ACTIONS: ReadinessAction[] = [
  {
    id: "dpo-appoint",
    title: "Appoint a Data Protection Officer",
    dimension: "governance",
    points: 12,
    effort: "High",
    priority: 1,
    howTo: "Pick a responsible person (can be part-time or outsourced to a DPCO). Write a one-page designation letter naming them, then tell all staff who the DPO is and how to reach them.",
    evidencePrompt: "Upload or paste your DPO designation letter (names + date), or describe the appointment.",
  },
  {
    id: "mfa-admin",
    title: "Enable MFA on all admin accounts",
    dimension: "access",
    points: 8,
    effort: "Low",
    priority: 2,
    howTo: "List every admin, email and finance account (Google Workspace, Microsoft 365, hosting, bank). Turn on 2-step verification on each and store backup codes safely.",
    evidencePrompt: "Describe which accounts now have MFA (e.g. 'Workspace + hosting + GTB admin, done 12 Oct') or attach a screenshot.",
  },
  {
    id: "policy-dataprotection",
    title: "Customize your Data Protection Policy",
    dimension: "policies",
    points: 8,
    effort: "Med",
    priority: 3,
    howTo: "Run the policy health-check on your Data Protection Policy in the Policy Library (paste the text, fix missing points to 70%+), or invite our team to draft it via Services.",
    evidencePrompt: "Health-check result (coverage %) or drafting request reference, plus where the policy is shared.",
  },
  {
    id: "staff-training",
    title: "Run company-wide security awareness",
    dimension: "people",
    points: 8,
    effort: "Med",
    priority: 4,
    howTo: "Book a trainer session or run an internal session covering phishing, passwords/MFA and incident reporting. Record the date and who attended.",
    evidencePrompt: "Session date, topic and attendance (e.g. '14 Oct, 12 staff, phishing + MFA') — photos optional.",
  },
  {
    id: "incident-plan",
    title: "Customize your Incident Response Plan",
    dimension: "policies",
    points: 6,
    effort: "Med",
    priority: 5,
    howTo: "Run the policy health-check on your Incident Response Plan in the Policy Library (paste the text, fix missing points to 70%+), then tell every staff member the single reporting channel.",
    evidencePrompt: "Health-check result plus confirmation staff know where to report.",
  },
  {
    id: "access-policy",
    title: "Customize your Access Control Policy",
    dimension: "policies",
    points: 6,
    effort: "Low",
    priority: 6,
    howTo: "Run the policy health-check on your Access Control Policy in the Policy Library, enforce the 12-character + manager rule, and remove ex-staff access the same day.",
    evidencePrompt: "Health-check result plus confirmation leavers' access was reviewed.",
  },
  {
    id: "ndpc-register",
    title: "Start NDPC registration / engage a DPCO",
    dimension: "governance",
    points: 8,
    effort: "High",
    priority: 7,
    howTo: "Check if you process enough data to be of 'major importance'. Either way, contact a licensed DPCO for a scoping call and keep the engagement note.",
    evidencePrompt: "DPCO name + date of scoping call, or NDPC registration reference.",
  },
  {
    id: "access-review",
    title: "Run a quarterly access review",
    dimension: "access",
    points: 7,
    effort: "Low",
    priority: 8,
    howTo: "Export user lists from email, cloud and finance tools. Remove leavers, downgrade movers, confirm the rest. Repeat every quarter.",
    evidencePrompt: "Review date + what changed (e.g. 'removed 2 ex-interns, 14 accounts confirmed').",
  },
  {
    id: "incident-drill",
    title: "Run an incident tabletop drill",
    dimension: "incident",
    points: 8,
    effort: "Med",
    priority: 9,
    howTo: "Gather 3+ staff for 30 minutes. Scenario: 'a laptop with customer data is stolen on Friday night.' Walk through who does what in the first 24 hours. Write down lessons.",
    evidencePrompt: "Drill date, attendees and one lesson learned.",
  },
  {
    id: "breach-register",
    title: "Start a breach register",
    dimension: "incident",
    points: 7,
    effort: "Low",
    priority: 10,
    howTo: "Create a simple log (spreadsheet is fine): date, what happened, data affected, action taken. Log near-misses too. Zero incidents so far is a valid first entry.",
    evidencePrompt: "Describe your register and its first entry (even if 'no incidents to date').",
  },
  {
    id: "dsr-process",
    title: "Set up Data Subject Request handling",
    dimension: "data",
    points: 8,
    effort: "Med",
    priority: 11,
    howTo: "Customize the DS request procedure, publish the request email (e.g. privacy@), and do one dry run: can you find and export one customer's data within a week?",
    evidencePrompt: "Request email published + dry-run result.",
  },
  {
    id: "retention-schedule",
    title: "Apply a retention & disposal schedule",
    dimension: "data",
    points: 7,
    effort: "Med",
    priority: 12,
    howTo: "Customize the retention policy, then do one disposal pass: delete expired records (old CVs, stale logs, dead leads) and note what was removed.",
    evidencePrompt: "What was deleted and when (e.g. 'purged 340 stale leads + 2022 logs, 15 Oct').",
  },
  {
    id: "phishing-refresh",
    title: "Run a phishing refresher",
    dimension: "people",
    points: 7,
    effort: "Low",
    priority: 13,
    howTo: "Send the team one simulated phish or a 5-minute recap quiz. Anyone who clicks gets a friendly 1-on-1, not punishment.",
    evidencePrompt: "Date + click rate or quiz result.",
  },
]

export interface Evidence {
  id: string
  actionId: string
  evidence: string
  attachment: string | null
  createdAt: string
}

export interface DimensionScore {
  dimension: Dimension
  earned: number
  total: number
}

export function scoreReadiness(evidence: Evidence[]): {
  score: number
  byDimension: DimensionScore[]
  evidencedIds: Set<string>
} {
  const evidencedIds = new Set(evidence.map((e) => e.actionId))
  const byDimension: DimensionScore[] = DIMENSIONS.map((dimension) => {
    const actions = ACTIONS.filter((a) => a.dimension === dimension.id)
    const total = actions.reduce((s, a) => s + a.points, 0)
    const earned = actions
      .filter((a) => evidencedIds.has(a.id))
      .reduce((s, a) => s + a.points, 0)
    return { dimension, earned, total }
  })
  const totalPoints = ACTIONS.reduce((s, a) => s + a.points, 0)
  const earnedPoints = byDimension.reduce((s, d) => s + d.earned, 0)
  return {
    score: Math.round((earnedPoints / totalPoints) * 100),
    byDimension,
    evidencedIds,
  }
}

export interface TailorInput {
  industry: string
  dataTypes: string[]
  handlesPayments: boolean
  healthData: boolean
  enterpriseClients: boolean
}

/** First-few actions: industry/data boosts, then priority order. */
export function firstFewActions(input: TailorInput, count = 5): ReadinessAction[] {
  const ranked = ACTIONS.map((a) => {
    let boost = 0
    if (a.industries && input.industry && a.industries.some((i) => input.industry.includes(i))) boost -= 2
    if (a.dataTriggers && a.dataTriggers.some((d) => input.dataTypes.includes(d))) boost -= 2
    if (input.handlesPayments && a.id === "mfa-admin") boost -= 1
    if (input.enterpriseClients && a.id === "ndpc-register") boost -= 1
    return { a, rank: a.priority + boost }
  })
  return ranked.sort((x, y) => x.rank - y.rank).slice(0, count).map((x) => x.a)
}
