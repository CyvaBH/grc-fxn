"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { authClient, useSession } from "@/lib/auth-client"
import { ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

// Unused tab = signed out. 60s idle → 30s warning → signed out.
const IDLE_MS = 60_000
const WARN_MS = 30_000
const TABS_KEY = "ctn-live-tabs"
const JUST_AUTHED = "ctn-just-authed"
const HEARTBEAT_MS = 5_000
const STALE_MS = 15_000

function readTabs(): Record<string, number> {
  try {
    return JSON.parse(window.localStorage.getItem(TABS_KEY) || "{}")
  } catch {
    return {}
  }
}

function writeTabs(tabs: Record<string, number>) {
  try {
    window.localStorage.setItem(TABS_KEY, JSON.stringify(tabs))
  } catch {}
}

/**
 * Session guard + activity enforcement:
 * - signed-out visitors go to /login
 * - 60s without mouse/keyboard/scroll/touch → 30s warning → auto sign-out
 * - fresh tab with no other live app tabs (browser closed, tab closed,
 *   bookmark revisit) → must sign in again
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [warnLeft, setWarnLeft] = useState<number | null>(null)
  const tabId = useRef(`tab-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`)
  const lastActive = useRef(Date.now())
  const warned = useRef(false)

  // Redirect signed-out visitors
  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login")
    }
  }, [isPending, session, router])

  // Tab registry heartbeat (multi-tab aware, crash-safe via staleness)
  useEffect(() => {
    if (isPending || !session) return
    const id = tabId.current
    const beat = () => {
      const tabs = readTabs()
      tabs[id] = Date.now()
      writeTabs(tabs)
    }
    beat()
    const t = setInterval(beat, HEARTBEAT_MS)
    const onHide = () => {
      const tabs = readTabs()
      delete tabs[id]
      writeTabs(tabs)
    }
    window.addEventListener("pagehide", onHide)
    return () => {
      clearInterval(t)
      window.removeEventListener("pagehide", onHide)
    }
  }, [isPending, session])

  // Fresh-tab check: no sibling live tabs + not just authenticated → re-sign in.
  // Delayed slightly so simultaneously-restored tabs can register first.
  useEffect(() => {
    if (isPending || !session) return
    const justAuthed = window.sessionStorage.getItem(JUST_AUTHED) === "1"
    window.sessionStorage.removeItem(JUST_AUTHED)
    if (justAuthed) return
    const timer = setTimeout(async () => {
      const now = Date.now()
      const tabs = readTabs()
      const siblings = Object.entries(tabs).filter(
        ([id, ts]) => id !== tabId.current && now - ts < STALE_MS
      )
      if (siblings.length === 0) {
        try {
          await authClient.signOut()
        } catch {}
        router.replace("/login?reason=fresh")
      }
    }, 1500)
    return () => clearTimeout(timer)
  }, [isPending, session, router])

  // Idle detection → warning → auto sign-out
  useEffect(() => {
    if (isPending || !session) return
    const poke = () => {
      lastActive.current = Date.now()
      if (warned.current) {
        warned.current = false
        setWarnLeft(null)
      }
    }
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"]
    events.forEach((e) => window.addEventListener(e, poke, { passive: true }))
    const t = setInterval(async () => {
      const idle = Date.now() - lastActive.current
      if (idle >= IDLE_MS + WARN_MS) {
        clearInterval(t)
        try {
          await authClient.signOut()
        } catch {}
        router.replace("/login?reason=timeout")
      } else if (idle >= IDLE_MS && !warned.current) {
        warned.current = true
        setWarnLeft(WARN_MS)
      } else if (warned.current) {
        setWarnLeft(Math.max(0, IDLE_MS + WARN_MS - idle))
      }
    }, 1000)
    return () => {
      events.forEach((e) => window.removeEventListener(e, poke))
      clearInterval(t)
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

  return (
    <>
      {children}
      {warnLeft !== null && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-brand-navy/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <ShieldCheck className="h-10 w-10 text-status-warnTx mx-auto mb-3" />
            <h2 className="font-bold text-brand-navy">Still there?</h2>
            <p className="text-sm text-gray-500 mt-1">
              You&apos;ll be signed out in {Math.ceil(warnLeft / 1000)}s for security.
            </p>
            <Button
              className="w-full mt-4"
              onClick={() => {
                lastActive.current = Date.now()
                warned.current = false
                setWarnLeft(null)
              }}
            >
              Stay signed in
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
