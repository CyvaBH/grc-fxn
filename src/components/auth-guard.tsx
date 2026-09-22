"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { ShieldCheck } from "lucide-react"

/** Redirects signed-out visitors to /login instead of showing a dead dashboard. */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login")
    }
  }, [isPending, session, router])

  if (isPending) {
    return (
      <div className="min-h-screen bg-brand-mist flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-brand-navy">
          <ShieldCheck className="h-8 w-8 text-brand-teal animate-pulse" />
          <p className="text-sm text-gray-500">Loading your workspace…</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return <>{children}</>
}
