"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { authClient, useSession } from "@/lib/auth-client"
import { ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

// 2 minutes idle → ask "still working or sign out" (never force).
// Fresh tab with no live siblings (closed browser/tab, bookmark) → re-sign in.
const IDLE_MS = 120_000
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
  const [askIdle, setAskIdle] = useState(false)
  const tabId = useRef(`tab-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`)
  const lastActive = useRef(Date.now())
  const freshChecked = useRef(false)

  const stayAwake = () => {
    lastActive.current = Date.now()
    setAskIdle(false)
  }

  const doSignOut = async (reason: "timeout" | "fresh") => {
    try {
      await authClient.signOut()
    } catch {}
    router.replace(`/login?reason=${reason}`)
  }

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

  // Fresh-tab check (runs ONCE per mount): no sibling live tabs + not just
  // authenticated → re-sign in. Delayed so restored tabs can register first;
  // skipped while hidden. The once-ref stops session refetches from
  // re-triggering the check (which caused instant logouts). Fails OPEN when
  // device storage is unavailable — enforcement must never lock out
  // legitimate users.
  useEffect(() => {
    if (isPending || !session || freshChecked.current) return
    freshChecked.current = true
    try {
      const k = "ctn-probe"
      window.localStorage.setItem(k, "1")
      window.localStorage.removeItem(k)
      window.sessionStorage.setItem(k, "1")
      window.sessionStorage.removeItem(k)
    } catch {
      return
    }
    const justAuthed = window.sessionStorage.getItem(JUST_AUTHED) === "1"
    window.sessionStorage.removeItem(JUST_AUTHED)
    if (justAuthed) return
    const timer = setTimeout(async () => {
      if (document.visibilityState !== "visible") return
      const now = Date.now()
      const tabs = readTabs()
      const siblings = Object.entries(tabs).filter(
        ([id, ts]) => id !== tabId.current && now - ts < STALE_MS
      )
      if (siblings.length === 0) {
        await doSignOut("fresh")
      }
    }, 2500)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending, session])

  // Idle detection → ask, never force. Any activity dismisses + resets.
  useEffect(() => {
    if (isPending || !session) return
    const poke = () => {
      lastActive.current = Date.now()
      setAskIdle(false)
    }
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"]
    events.forEach((e) => window.addEventListener(e, poke, { passive: true }))
    const t = setInterval(() => {
      if (Date.now() - lastActive.current >= IDLE_MS) {
        setAskIdle(true)
      }
    }, 5000)
    return () => {
      events.forEach((e) => window.removeEventListener(e, poke))
      clearInterval(t)
    }
  }, [isPending, session])

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
      {askIdle && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-brand-navy/60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <ShieldCheck className="h-10 w-10 text-status-warnTx mx-auto mb-3" />
            <h2 className="font-bold text-brand-navy">Still working?</h2>
            <p className="text-sm text-gray-500 mt-1">
              You&apos;ve been idle for 2 minutes. Stay signed in, or sign out now —
              we&apos;ll never sign you out automatically.
            </p>
            <div className="flex gap-2 mt-4">
              <Button className="flex-1" onClick={stayAwake}>
                I&apos;m still working
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => doSignOut("timeout")}>
                Sign out
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
