export interface DataTypeInfo {
  id: string
  label: string
  explain: string
}

export const DATA_TYPES: DataTypeInfo[] = [
  { id: "names-phones", label: "Names & phone numbers", explain: "Basic identifiers. NDPA still counts these as personal data — they must be collected lawfully and protected." },
  { id: "emails", label: "Email addresses", explain: "Used for accounts and marketing. You need a lawful basis to email people and must honor opt-outs." },
  { id: "gov-ids", label: "BVN / NIN / government IDs", explain: "Highly sensitive identity numbers. Loss or leak enables identity fraud — store encrypted, access strictly limited." },
  { id: "health", label: "Health records", explain: "Special-category sensitive data. Needs extra safeguards, explicit consent, and usually a Data Protection Impact Assessment." },
  { id: "payments", label: "Payment / card data", explain: "Card numbers and bank details. Never store full card data yourself — use a licensed processor, and lock down who touches payouts." },
  { id: "staff", label: "Employee records", explain: "Salaries, performance, next-of-kin. Staff are data subjects too — limit HR access and secure leavers' data." },
  { id: "location", label: "Location data", explain: "GPS or delivery addresses reveal movement patterns. Collect only while needed (e.g. active delivery), never continuous tracking without consent." },
  { id: "biometric", label: "Biometric data", explain: "Fingerprints, face scans. Can't be changed if leaked, so this is top-sensitivity — needs explicit consent and strong justification." },
  { id: "children", label: "Children's data", explain: "Data of anyone under 18. Requires parental/guardian consent and extra care in apps, schools and content platforms." },
  { id: "cctv", label: "CCTV / camera footage", explain: "Video of staff, customers or premises. Put up notices, keep retention short (e.g. 30 days), limit who can review." },
  { id: "calls", label: "Call recordings", explain: "Support or sales calls. Inform callers ('this call may be recorded'), store securely, delete when no longer needed." },
  { id: "cookies", label: "Cookies & device IDs", explain: "Website/app trackers. Needs a cookie notice with real accept/reject choice — silent tracking breaks NDPA consent rules." },
  { id: "financial", label: "Financial records (non-card)", explain: "Invoices, account statements, loan history. Needed for tax/audit, but access must be role-based and logged." },
  { id: "students", label: "Student / pupil records", explain: "Grades, attendance, guardian details. Often mixes children's data — schools need parental consent flows." },
  { id: "marketing", label: "Marketing preferences", explain: "Opt-ins, campaign engagement. You must prove consent and make unsubscribing one click." },
  { id: "logs", label: "Security / access logs", explain: "Sign-in records, audit trails. Keep at least 12 months for incident investigation, protected from tampering." },
]

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT – Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
  "Outside Nigeria",
]
