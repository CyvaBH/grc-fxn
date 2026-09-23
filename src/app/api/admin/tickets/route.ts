import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"
import { dbPool, ensureTicketTables } from "@/lib/tickets-db"

// GET /api/admin/tickets?status=open|closed|all — full queue
export async function GET(req: Request) {
  const gate = await requireAdmin(req)
  if ("error" in gate) return gate.error
  const status = new URL(req.url).searchParams.get("status") || "all"

  const db = dbPool()
  try {
    await ensureTicketTables(db)
    const { rows } = await db.query(
      `SELECT t.*,
        (SELECT COUNT(*) FROM "ticket_message" m WHERE m."ticketId" = t.id) AS "messageCount",
        (SELECT m.body FROM "ticket_message" m WHERE m."ticketId" = t.id ORDER BY m."createdAt" DESC LIMIT 1) AS "lastMessage",
        (SELECT m."isAdmin" FROM "ticket_message" m WHERE m."ticketId" = t.id ORDER BY m."createdAt" DESC LIMIT 1) AS "lastByAdmin"
       FROM "support_ticket" t
       ${status === "all" ? "" : "WHERE t.status = $1"}
       ORDER BY t."updatedAt" DESC LIMIT 100`,
      status === "all" ? [] : [status]
    )
    await db.end()
    return NextResponse.json({ tickets: rows })
  } catch (error) {
    await db.end()
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

// PATCH /api/admin/tickets — { id, status: 'open' | 'closed' }
export async function PATCH(req: Request) {
  const gate = await requireAdmin(req)
  if ("error" in gate) return gate.error

  const body = (await req.json().catch(() => ({}))) as { id?: string; status?: string }
  if (!body.id || !["open", "closed"].includes(body.status || "")) {
    return NextResponse.json({ error: "id and valid status required" }, { status: 400 })
  }

  const db = dbPool()
  try {
    await ensureTicketTables(db)
    await db.query(`UPDATE "support_ticket" SET status = $1, "updatedAt" = now() WHERE id = $2`, [
      body.status,
      body.id,
    ])
    await db.end()
    return NextResponse.json({ ok: true })
  } catch (error) {
    await db.end()
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
