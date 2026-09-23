import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PublicHeader, PublicFooter } from "@/components/public-nav"
import { SERVICES } from "@/lib/services"
import { ArrowRight, CheckCircle2 } from "lucide-react"

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <section className="px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-brand-navy leading-tight">
            Expert services, <span className="text-brand-teal">when you need humans</span>
          </h1>
          <p className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            The app gets you organized. Our consultants get you over the finish line —
            drafting, training, auditing and filing, done with you.
          </p>
        </div>
      </section>
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
          {SERVICES.map((s) => (
            <Card key={s.id} id={s.id} className="hover:border-brand-teal/40 transition-colors scroll-mt-20">
              <CardContent className="p-6 sm:p-8">
                <p className="text-xs font-bold text-brand-teal uppercase tracking-wide mb-2">
                  {s.tagline}
                </p>
                <h2 className="text-xl font-bold text-brand-navy mb-2">{s.name}</h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{s.desc}</p>
                <ul className="space-y-2 mb-6">
                  {s.deliverables.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-sm text-brand-navy">
                      <CheckCircle2 className="h-4 w-4 text-brand-teal mt-0.5 flex-shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
                <Link href={`/service-request?service=${s.id}`}>
                  <Button>
                    Request this service
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-center text-sm text-gray-400 mt-10">
          Requesting opens a dedicated service request (separate from support tickets) — we reply with scope and quote. No payment now.
        </p>
      </section>
      <PublicFooter />
    </div>
  )
}
