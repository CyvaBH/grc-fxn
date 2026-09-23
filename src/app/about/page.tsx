import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PublicHeader, PublicFooter } from "@/components/public-nav"
import { ShieldCheck, ArrowRight } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <section className="px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-brand-navy leading-tight">
            Compliance shouldn&apos;t require a <span className="text-brand-teal">GRC department</span>
          </h1>
          <div className="mt-8 space-y-5 text-gray-600 leading-relaxed">
            <p>
              Cyber Trust Nest is a virtual GRC (Governance, Risk and Compliance) officer for
              Nigerian small and medium businesses. Most SMBs know the NDPA applies to them but
              have no idea where to start — hiring consultants for every step is out of reach,
              and ignoring the law is getting expensive.
            </p>
            <p>
              We built the tool we wished existed: answer plain-language questions about your
              business, and get a tailored compliance profile — which regulations apply, which
              policies you need, what to do first, and when everything is due. Every
              recommendation cites its source, and your Readiness Score only moves when you
              submit real evidence.
            </p>
            <p>
              When software isn&apos;t enough, our consultants step in: policy drafting,
              staff training, ISO 27001 implementation, internal audits and audit filing
              support. Software plus humans — that&apos;s the whole idea.
            </p>
          </div>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link href="/signup">
              <Button size="lg">
                Get my compliance profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/services">
              <Button size="lg" variant="outline">
                Explore services
              </Button>
            </Link>
          </div>
          <div className="mt-12 p-5 bg-brand-mist rounded-xl flex gap-3">
            <ShieldCheck className="h-6 w-6 text-brand-teal flex-shrink-0" />
            <p className="text-sm text-gray-600 leading-relaxed">
              Guidance only — not legal advice. Our content is based on published regulations
              (NDPA 2023, NDPC directives, ISO standards). Always confirm filings with licensed
              counsel or a licensed DPCO.
            </p>
          </div>
        </div>
      </section>
      <PublicFooter />
    </div>
  )
}
