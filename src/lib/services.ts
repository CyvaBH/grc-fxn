export interface Service {
  id: string
  name: string
  tagline: string
  desc: string
  deliverables: string[]
}

export const SERVICES: Service[] = [
  {
    id: "policy-drafting",
    name: "Policy Drafting & Review",
    tagline: "Audit-ready policies written for your business",
    desc: "Our GRC consultants draft detailed, tailored policies from your organisational context — or review your drafts point-by-point against NDPA and ISO expectations.",
    deliverables: [
      "Tailored policy set matched to your industry and data",
      "Clause-by-clause gap review of your existing drafts",
      "DPO sign-off note for your records",
    ],
  },
  {
    id: "org-training",
    name: "Organizational Training",
    tagline: "Live sessions your staff will actually remember",
    desc: "Onsite or remote training for all staff, executives, or your compliance lead — including phishing simulations with debriefs.",
    deliverables: [
      "60–90 minute live sessions with Q&A",
      "Phishing simulation + click-rate report",
      "Attendance sheets valid as audit evidence",
    ],
  },
  {
    id: "iso-implementation",
    name: "ISO 27001 Implementation & Audit Readiness",
    tagline: "From zero to certification-ready",
    desc: "End-to-end guidance: scope, risk assessment, Statement of Applicability, controls implementation, and internal audit before the certification body arrives.",
    deliverables: [
      "ISMS scope and risk assessment",
      "Statement of Applicability + control evidence pack",
      "Pre-certification internal audit",
    ],
  },
  {
    id: "internal-audit",
    name: "Internal Auditing & Gap Assessment",
    tagline: "Know your gaps before the regulator does",
    desc: "Independent review of your controls, policies and evidence against NDPA/NDPC and ISO expectations — with a prioritized fix list.",
    deliverables: [
      "Control-by-control gap report",
      "Prioritized 30-60-90 remediation plan",
      "Evidence quality review",
    ],
  },
  {
    id: "dpo-service",
    name: "DPO-as-a-Service",
    tagline: "A named Data Protection Officer without the hire",
    desc: "A qualified DPO on retainer: staff guidance, request handling oversight, breach support and NDPC liaison.",
    deliverables: [
      "Named DPO + designation letter",
      "Monthly compliance check-in",
      "Breach and request handling support",
    ],
  },
  {
    id: "ndpa-filing",
    name: "NDPA Audit Filing Support",
    tagline: "File your Compliance Audit Return correctly",
    desc: "Through a licensed DPCO partner: scoping, evidence collation, DPIA support and filing of your NDPC audit returns before the deadline.",
    deliverables: [
      "Scoping call + filing checklist",
      "Evidence collation support",
      "Filed audit return + confirmation",
    ],
  },
]

export function serviceById(id: string | null): Service | null {
  if (!id) return null
  return SERVICES.find((s) => s.id === id) || null
}
