import { NextResponse } from "next/server"
import { requireUser } from "@/lib/admin"
import { dbPool, ensureAppTables, newId } from "@/lib/tickets-db"

// GET /api/training — current user's training requests
export async function GET(req: Request) {
  const user = await requireUser(req)
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 })

  const db = dbPool()
  try {
    await ensureAppTables(db)
    const { rows } = await db.query(
      `SELECT * FROM "training_request" WHERE "userId" = $1 ORDER BY "createdAt" DESC`,
      [user.id]
    )
    await db.end()
    return NextResponse.json({ requests: rows })
  } catch (error) {
    await db.end()
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

// POST /api/training — { kind: 'trainer'|'internal', topic, preferredDate, teamSize?, notes? }
export async function POST(req: Request) {
  const user = await requireUser(req)
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 })

  const body = (await req.json().catch(() => ({}))) as {
    kind?: string
    topic?: string
    preferredDate?: string
    teamSize?: string
    notes?: string
  }
  const kind = body.kind === "internal" ? "internal" : "trainer"
  const topic = (body.topic || "").trim().slice(0, 200)
  const preferredDate = (body.preferredDate || "").trim().slice(0, 50)
  if (!topic || !preferredDate) {
    return NextResponse.json({ error: "Topic and preferred date are required" }, { status: 400 })
  }

  const db = dbPool()
  try {
    await ensureAppTables(db)
    const { rows } = await db.query(
      `INSERT INTO "training_request" (id, "userId", email, kind, topic, "preferredDate", "teamSize", notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending') RETURNING *`,
      [
        newId("tr"),
        user.id,
        user.email,
        kind,
        topic,
        preferredDate,
        (body.teamSize || "").trim().slice(0, 50),
        (body.notes || "").trim().slice(0, 2000),
      ]
    )
    try {
      const { alertAdmins } = await import("@/lib/notify")
      await alertAdmins(db, "training_new", {
        title: `New training request: ${topic}`,
        body: `${user.email} — ${kind === "trainer" ? "with our trainers" : "internal"} on ${preferredDate}.`,
        link: "/admin",
      })
    } catch {}
    await db.end()
    return NextResponse.json({ request: rows[0] })
  } catch (error) {
    await db.end()
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
