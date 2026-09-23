import { NextResponse } from "next/server"
import { requireUser } from "@/lib/admin"
import { dbPool, ensureAppTables } from "@/lib/tickets-db"
import { ensureNotifyTables, getPrefs, setPref, EVENTS, type AlertChannel, type AlertEvent } from "@/lib/notify"

// GET /api/notifications/prefs — current user's per-event/channel switches
export async function GET(req: Request) {
  const user = await requireUser(req)
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 })

  const db = dbPool()
  try {
    await ensureAppTables(db)
    await ensureNotifyTables(db)
    const prefs = await getPrefs(db, user.id)
    await db.end()
    return NextResponse.json({ prefs, events: EVENTS })
  } catch (error) {
    await db.end()
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

// PUT /api/notifications/prefs — { event, channel, enabled }
export async function PUT(req: Request) {
  const user = await requireUser(req)
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 })

  const body = (await req.json().catch(() => ({}))) as {
    event?: string
    channel?: string
    enabled?: boolean
  }
  if (!body.event || !EVENTS.includes(body.event as AlertEvent)) {
    return NextResponse.json({ error: "Valid event required" }, { status: 400 })
  }
  if (body.channel !== "app" && body.channel !== "email") {
    return NextResponse.json({ error: "Valid channel required" }, { status: 400 })
  }

  const db = dbPool()
  try {
    await ensureAppTables(db)
    await ensureNotifyTables(db)
    await setPref(db, user.id, body.event, body.channel as AlertChannel, body.enabled !== false)
    await db.end()
    return NextResponse.json({ ok: true })
  } catch (error) {
    await db.end()
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
