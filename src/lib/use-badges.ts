"use client"

import { useCallback, useEffect, useState } from "react"

export interface Badges {
  tickets: number
  services: number
  training: number
  adminTickets: number
  adminServices: number
  adminTraining: number
}

const EMPTY: Badges = {
  tickets: 0,
  services: 0,
  training: 0,
  adminTickets: 0,
  adminServices: 0,
  adminTraining: 0,
}

const READ_KEY = "ctn-read-ntf"

/** Live attention counts for nav badges. Refreshes on mount, focus, and every minute. */
export function useBadges() {
  const [badges, setBadges] = useState<Badges>(EMPTY)
  const [unread, setUnread] = useState(0)

  const refresh = useCallback(async () => {
    try {
      const [b, n] = await Promise.all([
        fetch("/api/badges").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/notifications").then((r) => (r.ok ? r.json() : null)),
      ])
      if (b?.badges) setBadges({ ...EMPTY, ...b.badges })
      if (n?.notifications) {
        let read: string[] = []
        try {
          read = JSON.parse(window.localStorage.getItem(READ_KEY) || "[]")
        } catch {}
        setUnread(
          (n.notifications as { id: string }[]).filter((x) => !read.includes(x.id)).length
        )
      }
    } catch {}
  }, [])

  useEffect(() => {
    refresh()
    const t = setInterval(refresh, 60000)
    window.addEventListener("focus", refresh)
    return () => {
      clearInterval(t)
      window.removeEventListener("focus", refresh)
    }
  }, [refresh])

  const adminTotal = badges.adminTickets + badges.adminServices + badges.adminTraining
  const userTotal = badges.tickets + badges.services + badges.training

  return { badges, unread, adminTotal, userTotal, refresh }
}

export function unreadCount(notifications: { id: string }[]): number {
  let read: string[] = []
  try {
    read = JSON.parse(window.localStorage.getItem(READ_KEY) || "[]")
  } catch {}
  return notifications.filter((x) => !read.includes(x.id)).length
}
