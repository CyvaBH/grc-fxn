import { NextResponse } from "next/server"
import { dbPool, ensureAppTables } from "@/lib/tickets-db"

// Public, read-only product updates for the marketing updates page.
export async function GET() {
  const db = dbPool()
  try {
    await ensureAppTables(db)
    const { rows } = await db.query(
      `SELECT id, title, body, "createdAt" FROM "notification" ORDER BY "createdAt" DESC LIMIT 20`
    )
    await db.end()
    return NextResponse.json({ updates: rows })
  } catch (error) {
    await db.end()
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
