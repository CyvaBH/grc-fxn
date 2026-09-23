export interface NewsletterSeed {
  title: string
  summary: string
  url: string
  segment: string
}

// Real, verifiable GRC stories (checked Sep 2026). New items are published
// from the admin dashboard; these seed the library on first setup.
export const NEWSLETTER_SEED: NewsletterSeed[] = [
  {
    title: "NDPC probes CAC data breach, signals tighter enforcement",
    summary:
      "The NDPC invoked Section 46(3) of the NDPA to investigate a reported breach of the Corporate Affairs Commission database — reviewing access controls, DPIAs and third-party processors. Lesson for SMBs: the regulator now audits your controls, not just your paperwork.",
    url: "https://businessday.ng/news/article/ndpc-probes-cac-data-breach-signals-tighter-enforcement",
    segment: "All",
  },
  {
    title: "FG orders MDAs to comply with Data Protection Act, appoint data officers",
    summary:
      "A circular from the Secretary to the Government of the Federation directs every federal MDA to comply fully with the NDPA, designate qualified DPOs, engage licensed DPCOs and file audit returns — with Permanent Secretaries personally responsible. Private-sector enforcement follows the same playbook.",
    url: "https://www.vanguardngr.com/2026/08/fg-orders-mdas-to-comply-with-data-protection-act-appoint-data-officers",
    segment: "All",
  },
  {
    title: "NDPC extends 2025 audit return deadline to 30 May 2026 — use the window",
    summary:
      "Organisations classed as Data Controllers/Processors of Major Importance got extra time to file 2025 Compliance Audit Returns. OAL's advisory lays out a week-by-week plan: assess position, close gaps, then file. If you haven't started, start now.",
    url: "https://oal.law/ndpc-extends-2025-data-protection-audit-return-deadline-to-30-may-2026",
    segment: "All",
  },
  {
    title: "Google fined €403M over location data: lessons for African startups",
    summary:
      "Ireland's regulator fined Google €403 million not for a breach but for unclear location-data consent. Any app collecting location, delivery addresses or analytics can make the same mistake. NDPA fines for major controllers reach ₦10M or 2% of turnover.",
    url: "https://www.nta.ng/news/nigeria/google-fined-e403-million-over-location-data-what-african-startups-must-learn-before-their-own-apps-trap-them",
    segment: "SaaS / Technology",
  },
  {
    title: "NDPC concludes 246 investigations, generates ₦5.2bn in enforcement",
    summary:
      "The Commission's enforcement tally — including the Meta ($32.8M), Multichoice (₦766.2M) and Fidelity Bank (₦555.8M) actions — shows audits and fines are routine now, not theoretical. Evidence of compliance beats promises.",
    url: "https://businessday.ng/technology/article/ndpc-concludes-246-investigations-generates-n5-2bn-revenue-in-show-of-ironclad-enforcement",
    segment: "All",
  },
  {
    title: "Tougher NDPA rules coming for finance and tech",
    summary:
      "BusinessDay reports the NDPC intensifying oversight of finance and tech, with non-compliant firms publicly listed and given 21 days to submit audit returns, DPO proof and safeguards — or face fines, enforcement orders or prosecution.",
    url: "https://businessday.ng/technology/article/nigerias-data-protection-push-signals-tougher-rules-for-finance-tech",
    segment: "Fintech",
  },
]
