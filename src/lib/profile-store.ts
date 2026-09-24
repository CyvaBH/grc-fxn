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
  context: string
  contextDetail: string
  newsletterOptOut: boolean
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
  context: "",
  contextDetail: "",
  newsletterOptOut: false,
}

const KEY = "ctn-profile-v1"
const UID_KEY = "ctn-profile-uid"

export function profileOwnerId(): string | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(UID_KEY)
  } catch {
    return null
  }
}
const DEVICE_KEYS = [KEY, "ctn-deadlines-v1", "ctn-trainings-v1", "ctn-read-ntf"]

/**
 * Tie on-device caches to the signed-in account ID (not email — a deleted
 * account re-created with the same email is a different account and must
 * start completely fresh). On mismatch, wipe stale device data and reload.
 */
export function syncProfileOwner(userId: string | null | undefined) {
  if (typeof window === "undefined" || !userId) return
  const current = window.localStorage.getItem(UID_KEY)
  if (!current) {
    try {
      window.localStorage.setItem(UID_KEY, userId)
    } catch {}
    return
  }
  if (current !== userId) {
    try {
      for (const k of DEVICE_KEYS) window.localStorage.removeItem(k)
      window.localStorage.setItem(UID_KEY, userId)
    } catch {}
    window.location.reload()
  }
}

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

/** Downscale any uploaded image to a data-URL (JPEG) so it fits in DB/localStorage. */
export function fileToImageDataUrl(file: File, maxSize = 1024, quality = 0.8): Promise<string> {
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
        resolve(canvas.toDataURL("image/jpeg", quality))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

/** Avatar-sized shortcut (128px). */
export function fileToAvatarDataUrl(file: File): Promise<string> {
  return fileToImageDataUrl(file, 128)
}

export const EVIDENCE_ACCEPT = "image/*,video/*,application/pdf"
const MAX_RAW_BYTES = 4 * 1024 * 1024 // 4MB for video/PDF passthrough

/** Read any file as a data-URL without transforming it. */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error("Could not read file"))
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(file)
  })
}

/**
 * Evidence upload: images are downscaled, video/PDF pass through if under 4MB.
 * Throws a user-friendly message for anything else.
 */
export async function fileToEvidenceDataUrl(file: File): Promise<string> {
  if (file.type.startsWith("image/")) {
    return fileToImageDataUrl(file, 1024)
  }
  if (file.type.startsWith("video/") || file.type === "application/pdf") {
    if (file.size > MAX_RAW_BYTES) {
      throw new Error("That file is over 4MB. Compress it or split it and try again.")
    }
    return readFileAsDataUrl(file)
  }
  throw new Error("Only images, videos and PDFs are accepted as evidence.")
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
        if (data?.user?.id) syncProfileOwner(data.user.id as string)
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
