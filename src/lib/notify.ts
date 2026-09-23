import type { Pool } from "pg"
import { sendBrevoEmail } from "@/lib/email"
import { adminEmails } from "@/lib/admin"

// Event catalogue. A missing pref row means ENABLED (opt-out model).
export const EVENTS = [
  "ticket", // replies + status on your tickets
  "service", // status on your service requests
  "training", // status on your training requests
  "ticket_new", // (admins) a user opened a ticket
  "service_new", // (admins) a user requested a service
  "training_new", // (admins) a user requested training
  "briefing", // new GRC briefing published
  "announcement", // product updates
] as const

export type AlertEvent = (typeof EVENTS)[number]
export type AlertChannel = "app" | "email"

export const PREF_TABLE = `CREATE TABLE IF NOT EXISTS "notification_pref" (
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "event" text NOT NULL,
  "channel" text NOT NULL,
  "enabled" boolean NOT NULL DEFAULT true,
  PRIMARY KEY ("userId", "event", "channel")
)`

export const NOTIFICATION_ALTERS = [
  `ALTER TABLE "notification" ADD COLUMN IF NOT EXISTS "userId" text REFERENCES "user"("id") ON DELETE CASCADE`,
  `ALTER TABLE "notification" ADD COLUMN IF NOT EXISTS "kind" text NOT NULL DEFAULT 'announcement'`,
  `ALTER TABLE "notification" ADD COLUMN IF NOT EXISTS "link" text NOT NULL DEFAULT ''`,
]

export async function ensureNotifyTables(pool: Pool) {
  await pool.query(PREF_TABLE)
  for (const q of NOTIFICATION_ALTERS) {
    await pool.query(q)
  }
}

/** True unless the user explicitly disabled this event+channel. */
export async function isEnabled(
  db: Pool,
  userId: string,
  event: AlertEvent,
  channel: AlertChannel
): Promise<boolean> {
  try {
    const { rows } = await db.query(
      `SELECT enabled FROM "notification_pref" WHERE "userId" = $1 AND event = $2 AND channel = $3`,
      [userId, event, channel]
    )
    if (rows[0] !== undefined) return rows[0].enabled as boolean
  } catch {
    return true
  }
  // Backward compat: legacy briefing opt-out disables briefing emails
  if (event === "briefing" && channel === "email") {
    try {
      const { rows } = await db.query(
        `SELECT "newsletterOptOut" FROM "organization_profile" WHERE "userId" = $1`,
        [userId]
      )
      if (rows[0]?.newsletterOptOut === true) return false
    } catch {}
  }
  return true
}

export async function setPref(
  db: Pool,
  userId: string,
  event: string,
  channel: string,
  enabled: boolean
) {
  await db.query(
    `INSERT INTO "notification_pref" ("userId", event, channel, enabled)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT ("userId", event, channel) DO UPDATE SET enabled = $4`,
    [userId, event, channel, enabled]
  )
}

export async function getPrefs(db: Pool, userId: string): Promise<Record<string, Record<string, boolean>>> {
  const out: Record<string, Record<string, boolean>> = {}
  try {
    const { rows } = await db.query(
      `SELECT event, channel, enabled FROM "notification_pref" WHERE "userId" = $1`,
      [userId]
    )
    for (const r of rows as { event: string; channel: string; enabled: boolean }[]) {
      out[r.event] = out[r.event] || {}
      out[r.event][r.channel] = r.enabled
    }
  } catch {}
  return out
}

export interface Alert {
  title: string
  body: string
  link?: string
  emailSubject?: string
  emailHtml?: string
}

function emailWrap(title: string, body: string, link?: string): string {
  return `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
    <h2 style="color:#0F2A44;margin:0 0 12px;">${title.replace(/</g, "&lt;")}</h2>
    <p style="color:#334155;line-height:1.6;white-space:pre-wrap;">${body.replace(/</g, "&lt;")}</p>
    ${link ? `<a href="https://cybertrustnest.vercel.app${link}" style="display:inline-block;margin-top:12px;background:#0E9F6E;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;">Open in app</a>` : ""}
    <p style="color:#94A3B8;font-size:12px;margin-top:24px;">Cyber Trust Nest alert. Manage these in Settings → Notifications.</p>
  </div>`
}

/** In-app + email alert to one user, honoring their per-channel prefs. */
export async function alertUser(
  db: Pool,
  userId: string,
  email: string | null,
  event: AlertEvent,
  alert: Alert
) {
  await ensureNotifyTables(db)
  if (await isEnabled(db, userId, event, "app")) {
    const { randomUUID } = await import("crypto")
    await db.query(
      `INSERT INTO "notification" (id, "userId", title, body, kind, link) VALUES ($1, $2, $3, $4, $5, $6)`,
      [randomUUID(), userId, alert.title.slice(0, 200), alert.body.slice(0, 5000), event, alert.link || ""]
    )
  }
  if (email && (await isEnabled(db, userId, event, "email")) && process.env.BREVO_API_KEY) {
    try {
      await sendBrevoEmail(
        email,
        alert.emailSubject || `Cyber Trust Nest: ${alert.title}`,
        alert.emailHtml || emailWrap(alert.title, alert.body, alert.link)
      )
    } catch (e) {
      console.error(`[ALERT] email to ${email} failed:`, (e as Error).message)
    }
  }
}

async function adminUserIds(db: Pool): Promise<{ userId: string; email: string }[]> {
  const out = new Map<string, string>()
  try {
    const { rows } = await db.query(
      `SELECT p."userId", u.email FROM "admin_profile" p JOIN "user" u ON u.id = p."userId"`
    )
    for (const r of rows as { userId: string; email: string }[]) out.set(r.userId, r.email)
  } catch {}
  const envs = adminEmails()
  if (envs.length > 0) {
    try {
      const { rows } = await db.query(`SELECT id, email FROM "user"`)
      for (const r of rows as { id: string; email: string }[]) {
        if (r.email && envs.includes(r.email.toLowerCase())) out.set(r.id, r.email)
      }
    } catch {}
  }
  return [...out.entries()].map(([userId, email]) => ({ userId, email }))
}

/** In-app + email alert to every admin, honoring each admin's prefs. */
export async function alertAdmins(db: Pool, event: AlertEvent, alert: Alert) {
  await ensureNotifyTables(db)
  for (const a of await adminUserIds(db)) {
    await alertUser(db, a.userId, a.email, event, alert)
  }
}

/** Emails of users subscribed to an event's email channel (default: all users). */
export async function subscribers(db: Pool, event: AlertEvent): Promise<string[]> {
  await ensureNotifyTables(db)
  const { rows } = await db.query(`SELECT id, email FROM "user"`)
  const out: string[] = []
  for (const r of rows as { id: string; email: string }[]) {
    if (!r.email) continue
    if (await isEnabled(db, r.id, event, "email")) out.push(r.email)
  }
  return out
}
