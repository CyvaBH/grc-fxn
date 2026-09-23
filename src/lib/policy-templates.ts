export interface PolicyField {
  id: string
  label: string
  placeholder: string
}

export interface PolicyTemplate {
  id: string
  name: string
  required: boolean
  blurb: string
  fields: PolicyField[]
  body: string
}

const COMMON_FIELDS: PolicyField[] = [
  { id: "ORG_NAME", label: "Organization name", placeholder: "e.g. Acme Fintech Ltd" },
  { id: "EFFECTIVE_DATE", label: "Effective date", placeholder: "e.g. 01 Oct 2026" },
  { id: "CONTACT_EMAIL", label: "Contact email", placeholder: "e.g. privacy@company.com" },
  { id: "DPO_NAME", label: "Data Protection Officer", placeholder: "e.g. Adaeze Obi" },
]

function doc(title: string, sections: [string, string][]): string {
  return [
    `# ${title}`,
    ``,
    `**Organization:** {{ORG_NAME}}`,
    `**Effective date:** {{EFFECTIVE_DATE}}`,
    ``,
    ...sections.flatMap(([h, b]) => [`## ${h}`, ``, b, ``]),
    `---`,
    `Guidance only — not legal advice. Confirm with licensed counsel before filing.`,
  ].join("\n")
}

export const POLICY_TEMPLATES: PolicyTemplate[] = [
  {
    id: "data-protection",
    name: "Data Protection & Privacy Policy",
    required: true,
    blurb: "How you collect, use, store and protect personal data (NDPA-ready).",
    fields: COMMON_FIELDS,
    body: doc("Data Protection & Privacy Policy", [
      ["1. Purpose", `{{ORG_NAME}} collects personal data to provide its services. This policy explains what we collect, why, and how we protect it, in line with the Nigeria Data Protection Act (NDPA) 2023.`],
      ["2. Data we collect", `Names, phone numbers, email addresses and account records provided by customers and staff. Contact point for privacy requests: {{CONTACT_EMAIL}}.`],
      ["3. Lawful basis & consent", `We process data on the basis of consent and contractual necessity. Consent may be withdrawn at any time by emailing {{CONTACT_EMAIL}}.`],
      ["4. Security measures", `Access is limited to authorized staff, admin accounts use MFA, and records are reviewed quarterly. Our Data Protection Officer is {{DPO_NAME}}.`],
      ["5. Breach notification", `Suspected breaches are assessed within 24 hours and reported to the NDPC within 72 hours where required.`],
      ["6. Retention", `Personal data is kept only as long as needed for the purpose collected, then securely deleted.`],
    ]),
  },
  {
    id: "acceptable-use",
    name: "Acceptable Use Policy",
    required: true,
    blurb: "Rules for staff use of company devices, email and internet.",
    fields: COMMON_FIELDS,
    body: doc("Acceptable Use Policy", [
      ["1. Purpose", `This policy sets out acceptable use of {{ORG_NAME}} systems, devices and accounts.`],
      ["2. Acceptable use", `Company systems are for business purposes. Limited personal use is permitted where it does not affect security or productivity.`],
      ["3. Prohibited use", `No illegal activity, no sharing of credentials, no installing unapproved software, no bypassing security controls. Report concerns to {{CONTACT_EMAIL}}.`],
      ["4. Monitoring", `{{ORG_NAME}} may monitor systems for security purposes. Staff have no expectation of privacy on company devices.`],
      ["5. Violations", `Violations may lead to suspension of access and disciplinary action, effective {{EFFECTIVE_DATE}}.`],
    ]),
  },
  {
    id: "access-control",
    name: "Access Control & Password Policy",
    required: true,
    blurb: "Who gets access to what, MFA rules and password standards.",
    fields: COMMON_FIELDS,
    body: doc("Access Control & Password Policy", [
      ["1. Principle", `{{ORG_NAME}} grants the minimum access needed for each role (least privilege), reviewed quarterly.`],
      ["2. Passwords", `Minimum 12 characters, unique per service, stored in a password manager. No sharing of credentials.`],
      ["3. MFA", `MFA is required on all admin, email and finance accounts. Contact {{CONTACT_EMAIL}} if you lose your second factor.`],
      ["4. Joiners, movers, leavers", `Access is provisioned on start date, changed on role change, and revoked within 24 hours of exit.`],
      ["5. Reviews", `Access reviews are owned by {{DPO_NAME}} and logged for audit.`],
    ]),
  },
  {
    id: "incident-response",
    name: "Incident Response Plan",
    required: true,
    blurb: "Step-by-step: detect, contain, notify, recover, learn.",
    fields: COMMON_FIELDS,
    body: doc("Incident Response Plan", [
      ["1. Report", `Any suspected incident (phishing, breach, outage, lost device) must be reported immediately to {{CONTACT_EMAIL}}.`],
      ["2. Contain", `Isolate affected systems, revoke compromised credentials, preserve logs. Do not delete evidence.`],
      ["3. Assess & notify", `{{DPO_NAME}} assesses impact within 24 hours. NDPC notification within 72 hours where personal data is affected.`],
      ["4. Recover", `Restore from known-good backups, reset credentials, verify systems before returning to service.`],
      ["5. Learn", `Post-incident review within 7 days. Update this plan (effective {{EFFECTIVE_DATE}}) with lessons learned.`],
    ]),
  },
  {
    id: "business-continuity",
    name: "Business Continuity Plan",
    required: false,
    blurb: "Keep critical services running during disruptions.",
    fields: COMMON_FIELDS,
    body: doc("Business Continuity Plan", [
      ["1. Critical services", `{{ORG_NAME}} prioritizes customer-facing services, payments and communications during a disruption.`],
      ["2. Backup & recovery", `Critical data is backed up regularly and recovery is tested at least twice a year.`],
      ["3. Roles", `Incident lead: {{DPO_NAME}}. Communications: {{CONTACT_EMAIL}}.`],
      ["4. Review", `This plan is reviewed annually and after any major incident. Effective {{EFFECTIVE_DATE}}.`],
    ]),
  },
  {
    id: "hr-onboarding",
    name: "HR Onboarding & Exit Policy",
    required: false,
    blurb: "Security checks for joiners, movers and leavers.",
    fields: COMMON_FIELDS,
    body: doc("HR Onboarding & Exit Policy", [
      ["1. Onboarding", `New staff at {{ORG_NAME}} receive accounts on day one, complete security training within 14 days, and sign this policy.`],
      ["2. During employment", `Role changes trigger an access review by {{DPO_NAME}}.`],
      ["3. Exit", `On exit: revoke all access within 24 hours, recover devices, remind of ongoing confidentiality duties via {{CONTACT_EMAIL}}.`],
    ]),
  },
  {
    id: "byod",
    name: "BYOD / Mobile Device Policy",
    required: false,
    blurb: "Rules for personal phones and laptops used for work.",
    fields: COMMON_FIELDS,
    body: doc("BYOD / Mobile Device Policy", [
      ["1. Scope", `Personal devices used for {{ORG_NAME}} work must have a screen lock, OS updates enabled, and work apps separated from personal apps.`],
      ["2. Prohibited", `No jailbroken/rooted devices, no work data on shared devices. Report loss immediately to {{CONTACT_EMAIL}}.`],
      ["3. Remote wipe", `{{ORG_NAME}} may remotely wipe company data from enrolled devices on loss or exit.`],
    ]),
  },
  {
    id: "data-retention",
    name: "Data Retention & Disposal Policy",
    required: true,
    blurb: "How long you keep records and how you destroy them.",
    fields: COMMON_FIELDS,
    body: doc("Data Retention & Disposal Policy", [
      ["1. Principle", `{{ORG_NAME}} keeps personal data only as long as necessary for its purpose or as required by law.`],
      ["2. Schedule", `Customer records: duration of relationship + 5 years (or legal minimum). Logs: 12 months. CVs of unsuccessful candidates: 6 months.`],
      ["3. Disposal", `Digital records are securely deleted; paper is shredded. Disposal is logged by {{DPO_NAME}}.`],
    ]),
  },
  {
    id: "vendor-management",
    name: "Vendor Management Policy",
    required: false,
    blurb: "Due diligence before you share data with third parties.",
    fields: COMMON_FIELDS,
    body: doc("Vendor Management Policy", [
      ["1. Approval", `New vendors handling data for {{ORG_NAME}} must be approved after a basic security check.`],
      ["2. Contracts", `Contracts must include confidentiality, data protection and breach-notification clauses. Queries: {{CONTACT_EMAIL}}.`],
      ["3. Review", `Critical vendors are reviewed annually by {{DPO_NAME}}.`],
    ]),
  },
  {
    id: "physical-security",
    name: "Physical Security Policy",
    required: false,
    blurb: "Office access, visitors, devices and clean desk.",
    fields: COMMON_FIELDS,
    body: doc("Physical Security Policy", [
      ["1. Access", `{{ORG_NAME}} premises are locked; visitors sign in and are escorted.`],
      ["2. Devices", `Lock screens when away, secure laptops overnight, report lost devices to {{CONTACT_EMAIL}}.`],
      ["3. Clean desk", `Sensitive papers are filed or shredded daily, effective {{EFFECTIVE_DATE}}.`],
    ]),
  },
  {
    id: "network-cloud",
    name: "Network & Cloud Baseline Policy",
    required: false,
    blurb: "Minimum security baseline for networks and cloud accounts.",
    fields: COMMON_FIELDS,
    body: doc("Network & Cloud Baseline Policy", [
      ["1. Networks", `{{ORG_NAME}} Wi-Fi uses WPA2+ with a rotated guest password. Admin panels are never exposed to the internet.`],
      ["2. Cloud", `MFA on all cloud consoles, least-privilege IAM, and audit logging enabled. Owner: {{DPO_NAME}}.`],
      ["3. Changes", `Changes to production are reviewed and logged. Report issues to {{CONTACT_EMAIL}}.`],
    ]),
  },
  {
    id: "audit-logging",
    name: "Audit & Logging Policy",
    required: true,
    blurb: "What you log, how long you keep logs, who reviews them.",
    fields: COMMON_FIELDS,
    body: doc("Audit & Logging Policy", [
      ["1. What we log", `{{ORG_NAME}} logs sign-ins, admin actions, data exports and security alerts.`],
      ["2. Retention", `Logs are kept for a minimum of 12 months and protected from tampering.`],
      ["3. Review", `Logs are reviewed monthly by {{DPO_NAME}}; anomalies go to {{CONTACT_EMAIL}}.`],
    ]),
  },
  {
    id: "training-awareness",
    name: "Training & Awareness Policy",
    required: true,
    blurb: "Security training requirements for all staff.",
    fields: COMMON_FIELDS,
    body: doc("Training & Awareness Policy", [
      ["1. Requirement", `All {{ORG_NAME}} staff complete security awareness training on onboarding and annually thereafter.`],
      ["2. Content", `Phishing, passwords/MFA, data protection (NDPA), and incident reporting to {{CONTACT_EMAIL}}.`],
      ["3. Tracking", `Completion is tracked by {{DPO_NAME}}; overdue staff lose non-essential access until complete.`],
    ]),
  },
  {
    id: "dpo-letter",
    name: "DPO Designation Letter",
    required: true,
    blurb: "Formal letter appointing your Data Protection Officer.",
    fields: COMMON_FIELDS,
    body: doc("Data Protection Officer Designation Letter", [
      ["Appointment", `{{ORG_NAME}} hereby designates {{DPO_NAME}} as Data Protection Officer, effective {{EFFECTIVE_DATE}}.`],
      ["Duties", `Advise on NDPA compliance, monitor policies and training, cooperate with the NDPC, and serve as contact point via {{CONTACT_EMAIL}}.`],
      ["Independence", `The DPO operates independently and reports to the highest management level.`],
    ]),
  },
  {
    id: "dsr-procedure",
    name: "Data Subject Request Procedure",
    required: true,
    blurb: "How you handle access, correction and deletion requests.",
    fields: COMMON_FIELDS,
    body: doc("Data Subject Request Procedure", [
      ["1. Receiving", `Requests (access, correction, deletion, objection) go to {{CONTACT_EMAIL}} and are logged the same day.`],
      ["2. Verify", `Verify identity before disclosing data. {{DPO_NAME}} owns verification.`],
      ["3. Respond", `Respond within one month (NDPA). If complex, extend once and inform the requester.`],
      ["4. Records", `{{ORG_NAME}} keeps a register of requests and outcomes for audit.`],
    ]),
  },
  {
    id: "cross-border",
    name: "Cross-Border Transfer Policy",
    required: false,
    blurb: "Rules for sending personal data outside Nigeria.",
    fields: COMMON_FIELDS,
    body: doc("Cross-Border Data Transfer Policy", [
      ["1. When it applies", `Whenever {{ORG_NAME}} sends personal data outside Nigeria — cloud hosting abroad, foreign processors, or enterprise clients in other countries.`],
      ["2. Safeguards", `Transfers rely on adequacy, binding contracts with the recipient, or explicit consent. Each transfer is logged: what data, to whom, where, under which safeguard.`],
      ["3. Approval", `New cross-border transfers are approved by {{DPO_NAME}} before they start. Queries: {{CONTACT_EMAIL}}.`],
      ["4. Review", `Transfer register reviewed annually, effective {{EFFECTIVE_DATE}}.`],
    ]),
  },
]

export function fillTemplate(body: string, values: Record<string, string>): string {
  return body.replace(/{{(\w+)}}/g, (_, key: string) => values[key]?.trim() || `{{${key}}}`)
}

export function templateToTextFile(name: string, filled: string): string {
  return filled
}

export function downloadTextFile(filename: string, text: string) {
  const blob = new Blob([templateToTextFile(filename, text)], { type: "text/markdown;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
