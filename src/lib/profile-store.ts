"use client"

import { useCallback, useEffect, useState } from "react"

export interface OrgProfile {
  displayName: string
  orgName: string
  industry: string
  sizeBand: string
  states: string
  dataTypes: string[]
  handlesPayments: boolean
  healthData: boolean
  hasWebsite: boolean
  enterpriseClients: boolean
  avatar: string | null
}

export const EMPTY_PROFILE: OrgProfile = {
  displayName: "",
  orgName: "",
  industry: "",
  sizeBand: "",
  states: "",
  dataTypes: [],
  handlesPayments: false,
  healthData: false,
  hasWebsite: false,
  enterpriseClients: false,
  avatar: null,
}

const KEY = "ctn-profile-v1"

export function getLocalProfile(): OrgProfile {
  if (typeof window === "undefined") return EMPTY_PROFILE
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return EMPTY_PROFILE
    return { ...EMPTY_PROFILE, ...JSON.parse(raw) }
  } catch {
    return EMPTY_PROFILE
  }
}

export function saveLocalProfile(patch: Partial<OrgProfile>): OrgProfile {
  const next = { ...getLocalProfile(), ...patch }
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // localStorage full (large avatar?) — keep going, server is source of truth
  }
  return next
}

/** Downscale an uploaded image to a small data-URL so it fits in DB/localStorage. */
export function fileToAvatarDataUrl(file: File, maxSize = 128): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error("Could not read image"))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error("Invalid image file"))
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        const w = Math.max(1, Math.round(img.width * scale))
        const h = Math.max(1, Math.round(img.height * scale))
        const canvas = document.createElement("canvas")
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Canvas not supported"))
          return
        }
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL("image/jpeg", 0.8))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

/** Reactive profile backed by localStorage, merged with the server copy when signed in. */
export function useOrgProfile() {
  const [profile, setProfile] = useState<OrgProfile>(EMPTY_PROFILE)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setProfile(getLocalProfile())
    setLoaded(true)
    // Merge server copy (authoritative after sign-in)
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.profile) {
          setProfile((prev) => {
            const merged = { ...prev, ...data.profile }
            try {
              window.localStorage.setItem(KEY, JSON.stringify(merged))
            } catch {}
            return merged
          })
        }
      })
      .catch(() => {})
  }, [])

  const update = useCallback((patch: Partial<OrgProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch }
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next))
      } catch {}
      return next
    })
    // Fire-and-forget server sync (user may be offline / logged out)
    fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }).catch(() => {})
  }, [])

  return { profile, update, loaded }
}
