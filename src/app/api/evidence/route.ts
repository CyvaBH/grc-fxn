import { NextResponse } from "next/server"
import { requireUser } from "@/lib/admin"
import { dbPool, ensureAppTables, newId } from "@/lib/tickets-db"

// GET /api/evidence — current user's evidence rows
export async function GET(req: Request) {
  const user = await requireUser(req)
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 })

  const db = dbPool()
  try {
    await ensureAppTables(db)
    const { rows } = await db.query(
      `SELECT * FROM "action_evidence" WHERE "userId" = $1 ORDER BY "createdAt" ASC`,
      [user.id]
    )
    await db.end()
    return NextResponse.json({ evidence: rows })
  } catch (error) {
    await db.end()
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

// POST /api/evidence — submit evidence { actionId, title?, evidence, attachment? }
export async function POST(req: Request) {
  const user = await requireUser(req)
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 })

  const body = (await req.json().catch(() => ({}))) as {
    actionId?: string
    title?: string
    evidence?: string
    attachment?: string | null
  }
  const actionId = (body.actionId || "").trim().slice(0, 100)
  const evidence = (body.evidence || "").trim().slice(0, 5000)
  if (!actionId || !evidence) {
    return NextResponse.json({ error: "Action and evidence description are required" }, { status: 400 })
  }
  const attachment =
    typeof body.attachment === "string" &&
    (body.attachment.startsWith("data:image/") ||
      body.attachment.startsWith("data:video/") ||
      body.attachment.startsWith("data:application/pdf"))
      ? body.attachment.slice(0, 5500000)
      : null

  const db = dbPool()
  try {
    await ensureAppTables(db)
    const { rows } = await db.query(
      `INSERT INTO "action_evidence" (id, "userId", "actionId", title, evidence, attachment)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT ("userId", "actionId")
       DO UPDATE SET title = $4, evidence = $5, attachment = $6, "createdAt" = now()
       RETURNING *`,
      [newId("ev"), user.id, actionId, (body.title || "").trim().slice(0, 200), evidence, attachment]
    )
    await db.end()
    return NextResponse.json({ evidence: rows[0] })
  } catch (error) {
    await db.end()
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
