import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PublicHeader, PublicFooter } from "@/components/public-nav"
import {
  ShieldCheck,
  FileCheck,
  CalendarClock,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Zap,
  Lock,
  BookOpen,
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-status-infoBg text-brand-navy rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Zap className="h-4 w-4 text-brand-teal" />
            Built for Nigerian SMBs
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-navy leading-tight tracking-tight">
            Know exactly what compliance{" "}
            <span className="text-brand-teal">applies to your business</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Answer 15 minutes of questions. Get your NDPA + industry action plan,
            policies, and deadline reminders — without hiring a GRC team.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="xl" className="w-full sm:w-auto">
                Get my Compliance Profile
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="text-sm text-gray-400">
              Free profile • No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-brand-mist">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-brand-navy text-center mb-12">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Tell us about your business",
                desc: "Industry, size, data you handle, tech you use — takes 5 minutes.",
                icon: FileCheck,
              },
              {
                step: "2",
                title: "Answer tailored questions",
                desc: "Smart branching means you only see what matters to you.",
                icon: BookOpen,
              },
              {
                step: "3",
                title: "Get your action plan",
                desc: "Which regulations apply, policies to adopt, deadlines to track.",
                icon: CalendarClock,
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white rounded-xl p-8 border border-border shadow-sm text-center"
              >
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-brand-teal/10 text-brand-teal font-bold text-lg mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-brand-navy mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-brand-navy text-center mb-4">
            Everything you need to stay compliant
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Not just a report — a living system that keeps you ready.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: "Compliance Profile",
                desc: "Know which regulations, frameworks, and certifications apply to you — with citations.",
              },
              {
                icon: FileCheck,
                title: "Policy Templates",
                desc: "15 ready-to-customize templates: data protection, access control, incident response, and more.",
              },
              {
                icon: CalendarClock,
                title: "Deadline Tracker",
                desc: "Never miss an audit filing, certification renewal, or compliance deadline again.",
              },
              {
                icon: GraduationCap,
                title: "Staff Training",
                desc: "Phishing awareness, security basics, and role-based training modules.",
              },
              {
                icon: Lock,
                title: "Expert services",
                desc: "Policy drafting, training, ISO implementation and audits — request a quote.",
              },
              {
                icon: CheckCircle2,
                title: "Readiness Score",
                desc: "Track your compliance progress with a clear 0-100 score that improves over time.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-xl border border-border hover:border-brand-teal/30 hover:shadow-md transition-all"
              >
                <item.icon className="h-8 w-8 text-brand-teal mb-3" />
                <h3 className="font-semibold text-brand-navy mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-brand-mist">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-brand-navy mb-4">
            Simple, honest pricing
          </h2>
          <p className="text-gray-500 mb-12">
            Start free. Pay only for expert help you actually request.
          </p>
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-white rounded-xl p-8 border border-border shadow-sm text-left">
              <h3 className="text-lg font-semibold text-brand-navy">Free</h3>
              <p className="text-3xl font-bold text-brand-navy mt-2">
                ₦0
                <span className="text-sm font-normal text-gray-500">
                  {" "}
                  /forever
                </span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-teal flex-shrink-0" />
                  Compliance profile + readiness score
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-teal flex-shrink-0" />
                  Policy health-checks
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-teal flex-shrink-0" />
                  Deadline tracker
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-teal flex-shrink-0" />
                  GRC briefing
                </li>
              </ul>
              <Link href="/signup" className="mt-8 block">
                <Button variant="outline" className="w-full">
                  Get started
                </Button>
              </Link>
            </div>
            <div className="bg-white rounded-xl p-8 border-2 border-brand-teal shadow-md text-left relative">
              <div className="absolute -top-3 left-6 bg-brand-teal text-white text-xs font-bold px-3 py-1 rounded-full">
                EXPERT HELP
              </div>
              <h3 className="text-lg font-semibold text-brand-navy">Services</h3>
              <p className="text-3xl font-bold text-brand-navy mt-2">
                Custom
                <span className="text-sm font-normal text-gray-500">
                  {" "}
                  /quote
                </span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-teal flex-shrink-0" />
                  Policy drafting & review
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-teal flex-shrink-0" />
                  Staff training sessions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-teal flex-shrink-0" />
                  ISO 27001 implementation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-teal flex-shrink-0" />
                  Internal audits & NDPA filing
                </li>
              </ul>
              <Link href="/services" className="mt-8 block">
                <Button className="w-full">
                  Request a quote
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-brand-navy text-center mb-12">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "Is this legal advice?",
                a: "No. We provide guidance based on published regulations and frameworks. Every recommendation includes citations to the original source. Always have a licensed counsel or DPCO review before filing.",
              },
              {
                q: "Which regulations do you cover?",
                a: "We start with Nigeria's NDPA 2023, NDPC guidance, and sector-specific rules (CBN, NCC). We're expanding to Ghana, Kenya, South Africa, and UK/EU GDPR.",
              },
              {
                q: "How long does it take to get my profile?",
                a: "About 15 minutes. Answer questions about your business, and we generate your personalized compliance profile instantly.",
              },
              {
                q: "Can I get human help, not just software?",
                a: "Yes. Our services cover policy drafting, staff training, ISO 27001 implementation, internal audits and NDPA filing support — request a quote and we reply with scope and pricing.",
              },
            ].map((item) => (
              <div
                key={item.q}
                className="p-6 rounded-xl border border-border"
              >
                <h3 className="font-semibold text-brand-navy mb-2">
                  {item.q}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
