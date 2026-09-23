import { NextResponse } from "next/server"
import { dbPool, ensureAppTables } from "@/lib/tickets-db"

// Public, read-only briefing library for the marketing blog page.
export async function GET() {
  const db = dbPool()
  try {
    await ensureAppTables(db)
    const { rows } = await db.query(
      `SELECT id, title, summary, url, segment, source, "publishedAt" FROM "newsletter" ORDER BY "publishedAt" DESC LIMIT 30`
    )
    await db.end()
    return NextResponse.json({ newsletters: rows })
  } catch (error) {
    await db.end()
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
