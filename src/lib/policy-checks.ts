export interface PolicyCheck {
  label: string
  keywords: string[]
  why: string
}

/**
 * Required points per policy document. The checker looks for these concepts
 * in the user's own policy text (paste or .txt/.md upload) and reports exactly
 * which points are missing. Keyword matching is a preliminary screen — it
 * tells you what to fix before paying a professional to review.
 */
export const POLICY_CHECKS: Record<string, PolicyCheck[]> = {
  "data-protection": [
    { label: "Lawful basis for each processing purpose", keywords: ["lawful basis", "consent", "legitimate interest", "contract"], why: "NDPA requires a named lawful basis per purpose. Without it, all processing is presumptively unlawful." },
    { label: "Data subject rights + how to exercise them", keywords: ["right to access", "rectification", "erasure", "deletion", "data subject right"], why: "Customers must be told how to access, correct and delete their data — and given a working contact." },
    { label: "Breach notification (72-hour) flow", keywords: ["72 hour", "breach notification", "ndpc"], why: "Likely-to-cause-risk breaches must reach the NDPC within 72 hours. The policy must say who does that." },
    { label: "Retention limits", keywords: ["retention", "retain", "delete", "disposal"], why: "Keeping data forever is itself a violation. State how long each category lives." },
    { label: "Named DPO / privacy contact", keywords: ["data protection officer", "dpo", "privacy@", "contact"], why: "Someone must be accountable and reachable. Anonymous policies fail audits." },
  ],
  "acceptable-use": [
    { label: "Business vs personal use boundary", keywords: ["personal use", "business purpose"], why: "Without a boundary, you can't act when staff misuse systems." },
    { label: "Credential sharing ban", keywords: ["password", "credential", "share"], why: "Shared logins destroy accountability and are the #1 internal finding." },
    { label: "Unapproved software rule", keywords: ["software", "install", "approved", "application"], why: "Shadow IT is how breaches enter. Name who approves tools." },
    { label: "Consequences of violation", keywords: ["violation", "disciplinary", "consequence", "suspend"], why: "A rule with no consequence is a suggestion, not a policy." },
  ],
  "access-control": [
    { label: "Password standard (12+ chars, manager)", keywords: ["12", "password manager", "character"], why: "Vague 'strong password' language can't be audited. State the measurable standard." },
    { label: "MFA requirement", keywords: ["mfa", "multi-factor", "two-factor", "2fa", "second factor"], why: "Stolen credentials are the top break-in method. MFA on admin/finance/mail must be written, not assumed." },
    { label: "Joiner-mover-leaver process", keywords: ["leaver", "revoke", "onboarding", "exit", "24 hour"], why: "Ex-staff with live access is the most common audit failure. Name the 24-hour rule." },
    { label: "Least privilege + reviews", keywords: ["least privilege", "minimum access", "review", "quarter"], why: "Access must be minimal and re-checked, or it silently accumulates." },
  ],
  "incident-response": [
    { label: "Single reporting channel", keywords: ["report", "contact", "email", "phone"], why: "In a panic, staff need one obvious place to report — not a committee." },
    { label: "Containment steps", keywords: ["contain", "isolate", "disconnect", "revoke"], why: "The first hour decides the blast radius. Write the first three moves down." },
    { label: "72-hour NDPC assessment", keywords: ["72", "assess", "ndpc", "notif"], why: "Someone must assess within 24 hours so notification fits the 72-hour legal window." },
    { label: "Post-incident review", keywords: ["lesson", "post-incident", "review", "update"], why: "Repeat incidents mean the plan never improved. Mandate a review within 7 days." },
  ],
  "business-continuity": [
    { label: "Prioritized critical services", keywords: ["critical", "priorit", "essential service"], why: "You can't protect everything equally. Name what must survive a disruption." },
    { label: "Backup + recovery testing", keywords: ["backup", "recover", "restore", "test"], why: "Untested backups fail when needed. State frequency and last test." },
    { label: "Named roles", keywords: ["incident lead", "role", "responsib"], why: "Confusion burns the first hours. Name the lead and deputy." },
  ],
  "hr-onboarding": [
    { label: "Day-one provisioning + training deadline", keywords: ["day one", "14 day", "training", "onboard"], why: "New hires are highest-risk. Bound their training window in writing." },
    { label: "24-hour exit revocation", keywords: ["24 hour", "revoke", "exit", "device"], why: "Same-day deprovisioning is the control auditors always sample." },
    { label: "Confidentiality reminder on exit", keywords: ["confidential", "ongoing", "duty"], why: "Duties survive employment — say so explicitly at exit." },
  ],
  "byod": [
    { label: "Device baseline (lock, updates, separation)", keywords: ["screen lock", "update", "separat"], why: "Personal devices need a minimum bar before touching work data." },
    { label: "Lost-device reporting + remote wipe", keywords: ["lost", "wipe", "remote"], why: "A lost phone with customer data is a breach unless you can wipe company data." },
    { label: "Banned states (rooted/jailbroken)", keywords: ["jailbreak", "root", "compromised"], why: "Compromised OSes bypass every other control. Ban them outright." },
  ],
  "data-retention": [
    { label: "Per-category retention periods", keywords: ["month", "year", "period", "schedule"], why: "'As long as needed' is unenforceable. Name months/years per category." },
    { label: "Secure disposal method", keywords: ["shred", "secure delet", "wipe", "destroy"], why: "Deletion must be irreversible — and someone must log that it happened." },
    { label: "Legal-hold exception", keywords: ["legal", "hold", "litigation", "tax"], why: "Tax and litigation records have minimum holds that override disposal." },
  ],
  "vendor-management": [
    { label: "Pre-engagement security check", keywords: ["due diligence", "assess", "approv", "check"], why: "Your vendors' breaches become your NDPC notification. Check before signing." },
    { label: "Contract clauses (confidentiality, breach notice)", keywords: ["clause", "confidential", "breach", "notif"], why: "Without contract terms you can't compel a vendor to tell you about their breach." },
    { label: "Annual critical-vendor review", keywords: ["annual", "review", "critical"], why: "Vendor risk drifts. Re-check the important ones yearly." },
  ],
  "physical-security": [
    { label: "Premises access + visitors", keywords: ["visitor", "sign in", "escort", "lock"], why: "Tailgating defeats digital controls. Write the visitor rule." },
    { label: "Device handling (lock, overnight, loss)", keywords: ["lock screen", "overnight", "lost", "laptop"], why: "Most device loss is opportunistic — locks and overnight storage stop it." },
    { label: "Clean desk / print handling", keywords: ["clean desk", "print", "shred", "file"], why: "Customer data on shared printers is a breach waiting to happen." },
  ],
  "network-cloud": [
    { label: "Network baseline (WPA2+, guest, admin panels)", keywords: ["wpa", "guest", "admin", "firewall"], why: "Default router settings and exposed admin panels are scanned within hours." },
    { label: "Cloud IAM least-privilege + logging", keywords: ["iam", "least privilege", "mfa", "log"], why: "Over-permissioned cloud keys are the fastest path to total compromise." },
    { label: "Change control for production", keywords: ["change", "approv", "production", "log"], why: "Untracked production changes can't be rolled back or audited." },
  ],
  "audit-logging": [
    { label: "What gets logged (sign-ins, admin, exports)", keywords: ["sign-in", "log in", "admin", "export", "log"], why: "If it isn't logged, it didn't happen — for forensics or auditors." },
    { label: "12-month tamper-proof retention", keywords: ["12 month", "retain", "tamper", "protect"], why: "Short or editable logs are useless in an investigation." },
    { label: "Monthly review owner", keywords: ["review", "month", "owner", "responsib"], why: "Logs nobody reads are decoration. Name the reviewer." },
  ],
  "training-awareness": [
    { label: "Onboarding + annual requirement", keywords: ["onboard", "annual", "yearly", "mandatory", "required"], why: "One-off training decays. The NDPA expectation is onboarding plus annual refresh." },
    { label: "Core topics (phishing, MFA, reporting)", keywords: ["phish", "mfa", "password", "report", "incident"], why: "Name the topics so sessions can't quietly shrink to a slideshow." },
    { label: "Completion tracking + consequences", keywords: ["track", "complet", "attendance", "overdue"], why: "Untracked training is unprovable training." },
  ],
  "dpo-letter": [
    { label: "Named appointee + effective date", keywords: ["designat", "appoint", "effective", "date"], why: "An unnamed DPO doesn't exist for audit purposes." },
    { label: "Duties (advise, monitor, NDPC liaison)", keywords: ["dut", "advise", "monitor", "ndpc", "liaison"], why: "Spell out the mandate or the role gets ignored." },
    { label: "Independence + reporting line", keywords: ["independ", "report", "management", "direct"], why: "A DPO who reports to the person they must challenge can't function." },
  ],
  "dsr-procedure": [
    { label: "Intake channel + same-day logging", keywords: ["request", "log", "same day", "email"], why: "The one-month clock starts at receipt — log immediately or miss it." },
    { label: "Identity verification step", keywords: ["verif", "identity", "confirm"], why: "Disclosing data to the wrong 'requester' is itself a breach." },
    { label: "One-month response + extension rule", keywords: ["one month", "30 day", "extend"], why: "State the statutory timeline and the single-extension rule." },
    { label: "Request register for audit", keywords: ["register", "record", "outcome", "audit"], why: "Prove every request was handled — auditors will ask." },
  ],
  "cross-border": [
    { label: "Transfer scenarios named", keywords: ["transfer", "outside nigeria", "abroad", "hosting", "processor"], why: "You can't govern transfers you haven't inventoried." },
    { label: "Safeguard per transfer (contract/consent/adequacy)", keywords: ["safeguard", "contract", "consent", "adequacy", "clause"], why: "Each transfer needs a named legal safeguard, not a blanket statement." },
    { label: "Pre-transfer approval owner", keywords: ["approv", "dpo", "before"], why: "New transfers must be gated before data moves, not discovered after." },
  ],
}

export interface CheckResult {
  label: string
  found: boolean
  why: string
}

export function analyzePolicy(templateId: string, text: string): CheckResult[] {
  const checks = POLICY_CHECKS[templateId] || []
  const lower = text.toLowerCase()
  return checks.map((c) => ({
    label: c.label,
    found: c.keywords.some((k) => lower.includes(k.toLowerCase())),
    why: c.why,
  }))
}
