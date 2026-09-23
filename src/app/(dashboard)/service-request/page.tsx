"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/topbar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { CheckCircle2, Loader2, PenLine } from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { useOrgProfile } from "@/lib/profile-store"
import { SERVICES, serviceById } from "@/lib/services"
import { POLICY_TEMPLATES } from "@/lib/policy-templates"

const TIMELINES = ["ASAP", "Within 2 weeks", "Within a month", "Flexible"]
const POLICY_STATES = ["Starting fresh", "Have a draft to review", "Have one but it's outdated"]

interface ServiceRequest {
  id: string
  service: string
  policy: string
  status: string
  timeline: string
  createdAt: string
}

function serviceName(id: string): string {
  return serviceById(id)?.name || id
}

export default function ServiceRequestPage() {
  const { data: session } = useSession()
  const { profile } = useOrgProfile()
  const [serviceId, setServiceId] = useState("policy-drafting")
  const [policyId, setPolicyId] = useState("")
  const [currentState, setCurrentState] = useState(POLICY_STATES[0])
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [timeline, setTimeline] = useState(TIMELINES[2])
  const [details, setDetails] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)
  const [mine, setMine] = useState<ServiceRequest[]>([])

  // Preselect from CTAs: /service-request?service=policy-drafting&policy=data-protection
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const s = params.get("service")
      if (s && serviceById(s)) setServiceId(s)
      const p = params.get("policy")
      if (p && POLICY_TEMPLATES.some((t) => t.id === p)) {
        setServiceId("policy-drafting")
        setPolicyId(p)
      }
      window.history.replaceState({}, "", "/service-request")
    } catch {}
    fetch("/api/services/request")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setMine(d.requests || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const display = profile.displayName || session?.user?.name || ""
    if (display) setName((n) => n || display)
  }, [profile.displayName, session])

  const service = serviceById(serviceId)
  const isPolicy = serviceId === "policy-drafting"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError("")
    try {
      const res = await fetch("/api/services/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: serviceId,
          policy: isPolicy ? policyId : "",
          name: name.trim(),
          org: profile.orgName || "",
          timeline,
          currentState: isPolicy ? currentState : "",
          details: `${phone.trim() ? `Phone: ${phone.trim()}\n` : ""}${details.trim()}`,
        }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || "Could not send request")
      setDone(true)
      setDetails("")
      setMine((prev) => [d.request, ...prev])
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-mist flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          orgName={profile.orgName || "My Organization"}
          userName={profile.displayName || session?.user?.name || ""}
          avatar={profile.avatar}
        />
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-brand-navy flex items-center gap-2">
                <PenLine className="h-6 w-6 text-brand-teal" />
                Request a service
              </h1>
              <p className="text-gray-500 mt-1">
                Tell us what you need — we reply with scope and a quote. No payment now.
              </p>
            </div>

            {done && (
              <div className="p-4 bg-brand-teal/10 rounded-lg flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-brand-teal flex-shrink-0" />
                <p className="text-sm text-brand-navy">
                  Request received. Our team will reply by email with scope and a quote.
                </p>
              </div>
            )}
            {error && (
              <div className="p-3 bg-status-critBg rounded-lg text-sm text-status-critTx">
                {error}
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Service details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sr-service">Which service?</Label>
                    <select
                      id="sr-service"
                      value={serviceId}
                      onChange={(e) => setServiceId(e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-border bg-white px-4 text-sm text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
                    >
                      {SERVICES.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    {service && (
                      <p className="text-xs text-gray-500 leading-relaxed">{service.desc}</p>
                    )}
                  </div>

                  {isPolicy && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="sr-policy">Which policy?</Label>
                        <select
                          id="sr-policy"
                          value={policyId}
                          onChange={(e) => setPolicyId(e.target.value)}
                          className="flex h-10 w-full rounded-lg border border-border bg-white px-4 text-sm text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
                        >
                          <option value="">General policy help (not sure yet)</option>
                          {POLICY_TEMPLATES.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sr-state">Where are you starting from?</Label>
                        <select
                          id="sr-state"
                          value={currentState}
                          onChange={(e) => setCurrentState(e.target.value)}
                          className="flex h-10 w-full rounded-lg border border-border bg-white px-4 text-sm text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
                        >
                          {POLICY_STATES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sr-name">Your name</Label>
                      <Input
                        id="sr-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Adaeze Obi"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sr-phone">Phone / WhatsApp (optional)</Label>
                      <Input
                        id="sr-phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 0803…"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sr-timeline">Preferred timeline</Label>
                    <select
                      id="sr-timeline"
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-border bg-white px-4 text-sm text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
                    >
                      {TIMELINES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sr-details">What do you need? (min 20 characters)</Label>
                    <Textarea
                      id="sr-details"
                      rows={5}
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      placeholder={
                        isPolicy
                          ? "E.g. We need a Data Protection Policy for our 25-person fintech before onboarding an enterprise client next month. We have no draft."
                          : "E.g. What you're trying to achieve, team size, deadlines you're working toward."
                      }
                      required
                    />
                  </div>
                  <Button type="submit" disabled={sending}>
                    {sending ? "Sending…" : "Send service request"}
                  </Button>
                  <p className="text-xs text-gray-400">
                    Replies go to {session?.user?.email || "your account email"}.
                  </p>
                </form>
              </CardContent>
            </Card>

            {mine.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Your requests</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {mine.map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-brand-mist text-sm">
                      <div className="min-w-0">
                        <p className="font-medium text-brand-navy truncate">{serviceName(r.service)}</p>
                        <p className="text-xs text-gray-500">
                          {r.timeline} • {new Date(r.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <Badge
                        variant={r.status === "done" ? "default" : r.status === "pending" ? "likely" : "secondary"}
                        className="text-[10px] flex-shrink-0"
                      >
                        {r.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
