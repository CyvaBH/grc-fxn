import { NextResponse } from "next/server"
import { requireUser } from "@/lib/admin"
import { dbPool, ensureTicketTables, newId } from "@/lib/tickets-db"

export const TICKET_CATEGORIES = [
  "Account & login",
  "OTP / email issues",
  "Bug report",
  "Billing",
  "Feature request",
  "Other",
]

// GET /api/tickets — current user's tickets with latest-message preview
export async function GET(req: Request) {
  const user = await requireUser(req)
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 })

  const db = dbPool()
  try {
    await ensureTicketTables(db)
    const { rows } = await db.query(
      `SELECT t.*,
        (SELECT COUNT(*) FROM "ticket_message" m WHERE m."ticketId" = t.id) AS "messageCount",
        (SELECT m.body FROM "ticket_message" m WHERE m."ticketId" = t.id ORDER BY m."createdAt" DESC LIMIT 1) AS "lastMessage",
        (SELECT m."isAdmin" FROM "ticket_message" m WHERE m."ticketId" = t.id ORDER BY m."createdAt" DESC LIMIT 1) AS "lastByAdmin"
       FROM "support_ticket" t
       WHERE t."userId" = $1
       ORDER BY t."updatedAt" DESC`,
      [user.id]
    )
    await db.end()
    return NextResponse.json({ tickets: rows })
  } catch (error) {
    await db.end()
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

// POST /api/tickets — open a ticket { subject, category, message }
export async function POST(req: Request) {
  const user = await requireUser(req)
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 })

  const body = (await req.json().catch(() => ({}))) as {
    subject?: string
    category?: string
    message?: string
    image?: string | null
  }
  const subject = (body.subject || "").trim().slice(0, 200)
  const message = (body.message || "").trim().slice(0, 5000)
  const image =
    typeof body.image === "string" && body.image.startsWith("data:image/")
      ? body.image.slice(0, 1500000)
      : null
  const category = TICKET_CATEGORIES.includes(body.category || "")
    ? (body.category as string)
    : "Other"
  if (!subject || !message) {
    return NextResponse.json({ error: "Subject and message are required" }, { status: 400 })
  }

  const db = dbPool()
  try {
    await ensureTicketTables(db)
    const ticketId = newId("tkt")
    await db.query(
      `INSERT INTO "support_ticket" (id, "userId", email, subject, category, status)
       VALUES ($1, $2, $3, $4, $5, 'open')`,
      [ticketId, user.id, user.email, subject, category]
    )
    await db.query(
      `INSERT INTO "ticket_message" (id, "ticketId", "userId", body, "isAdmin", image)
       VALUES ($1, $2, $3, $4, false, $5)`,
      [newId("msg"), ticketId, user.id, message, image]
    )
    const { rows } = await db.query(`SELECT * FROM "support_ticket" WHERE id = $1`, [ticketId])
    await db.end()
    return NextResponse.json({ ticket: rows[0] })
  } catch (error) {
    await db.end()
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
