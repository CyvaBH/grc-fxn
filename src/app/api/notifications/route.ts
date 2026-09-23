import { NextResponse } from "next/server"
import { requireUser } from "@/lib/admin"
import { dbPool, ensureAppTables } from "@/lib/tickets-db"
import { ensureNotifyTables } from "@/lib/notify"

// GET /api/notifications — global announcements + your personal alerts, newest first
export async function GET(req: Request) {
  const user = await requireUser(req)
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 })

  const db = dbPool()
  try {
    await ensureAppTables(db)
    await ensureNotifyTables(db)
    const { rows } = await db.query(
      `SELECT id, title, body, kind, link, "createdAt" FROM "notification"
       WHERE "userId" IS NULL OR "userId" = $1
       ORDER BY "createdAt" DESC LIMIT 40`,
      [user.id]
    )
    await db.end()
    return NextResponse.json({ notifications: rows })
  } catch (error) {
    await db.end()
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
