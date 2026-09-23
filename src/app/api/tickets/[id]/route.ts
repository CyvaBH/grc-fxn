import { NextResponse } from "next/server"
import { requireUser, isAdminEmail } from "@/lib/admin"
import { dbPool, ensureTicketTables, newId } from "@/lib/tickets-db"

// GET /api/tickets/[id] — thread (owner or admin only)
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(req)
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  const { id } = await params

  const db = dbPool()
  try {
    await ensureTicketTables(db)
    const { rows } = await db.query(`SELECT * FROM "support_ticket" WHERE id = $1`, [id])
    const ticket = rows[0] as Record<string, unknown> | undefined
    if (!ticket) {
      await db.end()
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }
    if (ticket.userId !== user.id && !isAdminEmail(user.email)) {
      await db.end()
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const { rows: messages } = await db.query(
      `SELECT m.*, u.name AS "authorName" FROM "ticket_message" m
       LEFT JOIN "user" u ON u.id = m."userId"
       WHERE m."ticketId" = $1 ORDER BY m."createdAt" ASC`,
      [id]
    )
    await db.end()
    return NextResponse.json({ ticket, messages })
  } catch (error) {
    await db.end()
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

// POST /api/tickets/[id] — reply { message } (owner or admin)
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(req)
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  const { id } = await params

  const body = (await req.json().catch(() => ({}))) as { message?: string; image?: string | null }
  const message = (body.message || "").trim().slice(0, 5000)
  if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 })
  const image =
    typeof body.image === "string" &&
    (body.image.startsWith("data:image/") ||
      body.image.startsWith("data:video/") ||
      body.image.startsWith("data:application/pdf"))
      ? body.image.slice(0, 5500000)
      : null

  const admin = isAdminEmail(user.email)
  const db = dbPool()
  try {
    await ensureTicketTables(db)
    const { rows } = await db.query(`SELECT * FROM "support_ticket" WHERE id = $1`, [id])
    const ticket = rows[0] as Record<string, unknown> | undefined
    if (!ticket) {
      await db.end()
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }
    if (ticket.userId !== user.id && !admin) {
      await db.end()
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    await db.query(
      `INSERT INTO "ticket_message" (id, "ticketId", "userId", body, "isAdmin", image)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [newId("msg"), id, user.id, message, admin, image]
    )
    // User reply re-opens / flags for admin; admin reply keeps status
    await db.query(
      `UPDATE "support_ticket" SET "updatedAt" = now()${admin ? "" : `, status = 'open'`} WHERE id = $1`,
      [id]
    )
    await db.end()
    return NextResponse.json({ ok: true })
  } catch (error) {
    await db.end()
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
