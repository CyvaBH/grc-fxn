import { NextResponse } from "next/server"
import { requireUser } from "@/lib/admin"
import { dbPool, ensureAppTables } from "@/lib/tickets-db"

// GET /api/notifications — global product announcements, newest first
export async function GET(req: Request) {
  const user = await requireUser(req)
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 })

  const db = dbPool()
  try {
    await ensureAppTables(db)
    const { rows } = await db.query(
      `SELECT * FROM "notification" ORDER BY "createdAt" DESC LIMIT 30`
    )
    await db.end()
    return NextResponse.json({ notifications: rows })
  } catch (error) {
    await db.end()
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
