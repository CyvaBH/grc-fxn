"use client"

import { useCallback, useEffect, useState } from "react"
import { scoreReadiness, type Evidence } from "@/lib/readiness"

/** Evidence-backed readiness: starts at 0, grows only with submitted evidence. */
export function useReadiness() {
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [loaded, setLoaded] = useState(false)

  const reload = useCallback(async () => {
    try {
      const res = await fetch("/api/evidence")
      if (res.ok) {
        const data = await res.json()
        setEvidence(
          (data.evidence || []).map((e: Record<string, unknown>) => ({
            id: e.id as string,
            actionId: e.actionId as string,
            evidence: (e.evidence as string) || "",
            attachment: (e.attachment as string) || null,
            createdAt: e.createdAt as string,
          }))
        )
      }
    } catch {}
    setLoaded(true)
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { ...scoreReadiness(evidence), evidence, loaded, reload }
}
