import { NextResponse } from "next/server"
import { requireUser } from "@/lib/admin"
import { dbPool, ensureAppTables, newId } from "@/lib/tickets-db"
import { SERVICES } from "@/lib/services"

const TIMELINES = ["ASAP", "Within 2 weeks", "Within a month", "Flexible"]

// GET /api/services/request — current user's service requests
export async function GET(req: Request) {
  const user = await requireUser(req)
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 })

  const db = dbPool()
  try {
    await ensureAppTables(db)
    const { rows } = await db.query(
      `SELECT * FROM "service_request" WHERE "userId" = $1 ORDER BY "createdAt" DESC`,
      [user.id]
    )
    await db.end()
    return NextResponse.json({ requests: rows })
  } catch (error) {
    await db.end()
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

// POST /api/services/request — { service, policy?, name, org?, timeline, currentState?, details }
export async function POST(req: Request) {
  const user = await requireUser(req)
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 })

  const body = (await req.json().catch(() => ({}))) as {
    service?: string
    policy?: string
    name?: string
    org?: string
    timeline?: string
    currentState?: string
    details?: string
  }
  const service = SERVICES.find((s) => s.id === body.service)
  if (!service) return NextResponse.json({ error: "Choose a valid service" }, { status: 400 })
  const name = (body.name || "").trim().slice(0, 200)
  const details = (body.details || "").trim().slice(0, 5000)
  if (!name || details.length < 20) {
    return NextResponse.json(
      { error: "Your name and a few sentences of detail (20+ characters) are required" },
      { status: 400 }
    )
  }
  const timeline = TIMELINES.includes(body.timeline || "") ? (body.timeline as string) : "Flexible"

  const db = dbPool()
  try {
    await ensureAppTables(db)
    const { rows } = await db.query(
      `INSERT INTO "service_request" (id, "userId", email, service, policy, name, org, timeline, "currentState", details, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending') RETURNING *`,
      [
        newId("sr"),
        user.id,
        user.email,
        service.id,
        (body.policy || "").trim().slice(0, 200),
        name,
        (body.org || "").trim().slice(0, 200),
        timeline,
        (body.currentState || "").trim().slice(0, 100),
        details,
      ]
    )
    try {
      const { alertAdmins } = await import("@/lib/notify")
      await alertAdmins(db, "service_new", {
        title: `New service request: ${service.name}`,
        body: `${name} (${user.email}) — ${timeline}: ${details.slice(0, 200)}`,
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
