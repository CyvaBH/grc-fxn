"use client"

/** User's IANA timezone, auto-detected from the browser (their location). */
export function userTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  } catch {
    return "UTC"
  }
}

export function daypart(date = new Date()): "morning" | "afternoon" | "evening" {
  const h = date.getHours()
  if (h < 12) return "morning"
  if (h < 17) return "afternoon"
  return "evening"
}

/** "Good morning, Adaeze" — no awkward fallback when the name is unknown. */
export function greeting(name?: string | null, orgName?: string | null): string {
  const who = (name || "").trim().split(" ")[0] || (orgName || "").trim()
  return who ? `Good ${daypart()}, ${who}` : `Good ${daypart()}`
}

/** Date formatted in the user's own timezone (defaults to their locale). */
export function formatDate(
  iso: string | Date,
  opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }
): string {
  try {
    return new Date(iso).toLocaleDateString("en-NG", { ...opts, timeZone: userTimeZone() })
  } catch {
    return new Date(iso).toLocaleDateString("en-NG", opts)
  }
}

/** Date + time formatted in the user's own timezone. */
export function formatDateTime(iso: string | Date): string {
  return formatDate(iso, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
