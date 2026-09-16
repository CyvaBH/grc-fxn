import Link from "next/link"
import { ShieldCheck } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-brand-teal" />
            <span className="text-lg font-bold text-brand-navy">Cyber Trust Nest</span>
          </Link>
          <Link href="/" className="text-sm text-brand-teal hover:underline">
            Back to home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-brand-navy mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">
          Last updated: September 16, 2026
        </p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-brand-navy mb-3">1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              Cyber Trust Nest (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our compliance guidance platform.
            </p>
            <p className="text-gray-600 leading-relaxed mt-3">
              By using our service, you agree to the collection and use of information in accordance with this policy. If you do not agree, please discontinue use.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-brand-navy mb-3">2. Information We Collect</h2>
            <h3 className="text-lg font-medium text-brand-navy mb-2">Account Information</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
              <li>Email address (for authentication and communications)</li>
              <li>Name (for your profile)</li>
              <li>Organization name and details</li>
            </ul>

            <h3 className="text-lg font-medium text-brand-navy mb-2 mt-4">Business Information (provided by you)</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
              <li>Industry and company size</li>
              <li>Types of personal data you handle</li>
              <li>Technology stack and systems</li>
              <li>Compliance-related answers to our profiler questions</li>
            </ul>

            <h3 className="text-lg font-medium text-brand-navy mb-2 mt-4">Usage Data</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
              <li>Pages visited and features used</li>
              <li>Session duration and interaction patterns</li>
              <li>Device type and browser information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-brand-navy mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li><strong>Generate your compliance profile</strong> — Your business answers are processed through our rules engine to determine which regulations apply to you.</li>
              <li><strong>Provide personalized guidance</strong> — We use your profile to generate actionable recommendations, policies, and action plans.</li>
              <li><strong>Send reminders and notifications</strong> — Deadline alerts, training reminders, and compliance updates.</li>
              <li><strong>Improve our service</strong> — Aggregate, anonymized usage data helps us improve accuracy and user experience.</li>
              <li><strong>Communicate with you</strong> — Account-related emails, security alerts, and service updates.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-brand-navy mb-3">4. How We Share Your Information</h2>
            <p className="text-gray-600 leading-relaxed">
              We do <strong>not</strong> sell your data. We do not share your organization&apos;s information with other organizations. Your data is isolated to your account.
            </p>
            <p className="text-gray-600 leading-relaxed mt-3">
              We may share information only in the following limited circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 mt-2">
              <li>With your explicit consent (e.g., generating a shareable Trust Center page)</li>
              <li>With service providers who assist in operating our platform (hosting, email delivery), bound by data processing agreements</li>
              <li>When required by law or to respond to legal process</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-brand-navy mb-3">5. Data Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We implement industry-standard security measures including encryption at rest and in transit, role-based access controls, regular security audits, and isolation between organization data. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-brand-navy mb-3">6. Data Retention</h2>
            <p className="text-gray-600 leading-relaxed">
              We retain your account and business data for as long as your account is active. Audit logs are retained for 12 months. You may request deletion of your data at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-brand-navy mb-3">7. Your Rights (NDPA Aligned)</h2>
            <p className="text-gray-600 leading-relaxed">
              Under the Nigeria Data Protection Act 2023, you have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 mt-2">
              <li>Access your personal data</li>
              <li>Rectify inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-3">
              To exercise these rights, contact us at privacy@cybertrustnest.com.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-brand-navy mb-3">8. Cookies</h2>
            <p className="text-gray-600 leading-relaxed">
              We use essential cookies for authentication and session management. We do not use advertising or tracking cookies. Analytics data is collected anonymously via PostHog.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-brand-navy mb-3">9. Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this policy from time to time. We will notify you of significant changes via email. The &quot;Last updated&quot; date at the top indicates when this policy was last revised.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-brand-navy mb-3">10. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have questions about this Privacy Policy, contact us at:
            </p>
            <p className="text-gray-600 mt-2">
              Email: privacy@cybertrustnest.com
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
