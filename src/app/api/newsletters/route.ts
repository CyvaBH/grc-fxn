import { NextResponse } from "next/server"
import { requireUser } from "@/lib/admin"
import { dbPool, ensureAppTables } from "@/lib/tickets-db"

// GET /api/newsletters — published GRC news library
export async function GET(req: Request) {
  const user = await requireUser(req)
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 })

  const db = dbPool()
  try {
    await ensureAppTables(db)
    const { rows } = await db.query(
      `SELECT * FROM "newsletter" ORDER BY "publishedAt" DESC LIMIT 50`
    )
    await db.end()
    return NextResponse.json({ newsletters: rows })
  } catch (error) {
    await db.end()
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
