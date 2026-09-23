import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PublicHeader, PublicFooter } from "@/components/public-nav"
import { Users, GraduationCap, ShieldCheck, Code2, ArrowRight } from "lucide-react"

const GROUPS = [
  {
    icon: ShieldCheck,
    role: "GRC Advisory",
    desc: "Compliance consultants who map regulations to your business, review evidence, and draft audit-ready policies.",
  },
  {
    icon: GraduationCap,
    role: "Training Team",
    desc: "Trainers delivering staff awareness, phishing simulations, executive briefings and DPO deep-dives.",
  },
  {
    icon: Code2,
    role: "Product & Engineering",
    desc: "Builders keeping the profiler, scoring engine and deadline systems honest, fast and simple.",
  },
  {
    icon: Users,
    role: "Support",
    desc: "Humans answering every support ticket — the same people who write the guidance in the app.",
  },
]

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <section className="px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-brand-navy">The team behind the Nest</h1>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            A small Nigerian team of compliance consultants, trainers and engineers.
            Individual profiles are on the way — here&apos;s how we&apos;re organized.
          </p>
        </div>
      </section>
      <section className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 gap-6">
          {GROUPS.map((g) => (
            <Card key={g.role}>
              <CardContent className="p-6">
                <g.icon className="h-8 w-8 text-brand-teal mb-3" />
                <h2 className="font-semibold text-brand-navy mb-1">{g.role}</h2>
                <p className="text-sm text-gray-500 leading-relaxed">{g.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-3xl mx-auto text-center bg-brand-mist rounded-2xl p-8">
          <h2 className="text-xl font-bold text-brand-navy mb-2">Work with us directly</h2>
          <p className="text-sm text-gray-500 mb-6">
            Book our consultants for drafting, training, audits and implementation.
          </p>
          <Link href="/services">
            <Button>
              See services
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
      <PublicFooter />
    </div>
  )
}
