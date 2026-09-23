import { NextResponse } from "next/server"
import { requireUser, isAdminEmail } from "@/lib/admin"
import { dbPool, ensureAppTables, ensureTicketTables } from "@/lib/tickets-db"

// GET /api/badges — attention counts for nav badges (red dots/numbers)
export async function GET(req: Request) {
  const user = await requireUser(req)
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 })

  const db = dbPool()
  try {
    await ensureAppTables(db)
    await ensureTicketTables(db)

    // Your tickets with an unread admin reply (open only)
    const { rows: t } = await db.query(
      `SELECT COUNT(*) AS c FROM "support_ticket" t
       WHERE t."userId" = $1 AND t.status = 'open'
       AND EXISTS (
         SELECT 1 FROM "ticket_message" m WHERE m."ticketId" = t.id
         ORDER BY m."createdAt" DESC LIMIT 1
       )
       AND (SELECT m."isAdmin" FROM "ticket_message" m WHERE m."ticketId" = t.id ORDER BY m."createdAt" DESC LIMIT 1) = true`,
      [user.id]
    )
    // Your service requests with movement (quoted/approved — needs your eyes)
    const { rows: s } = await db.query(
      `SELECT COUNT(*) AS c FROM "service_request" WHERE "userId" = $1 AND status IN ('quoted', 'approved')`,
      [user.id]
    )
    // Your training requests confirmed or completed
    const { rows: tr } = await db.query(
      `SELECT COUNT(*) AS c FROM "training_request" WHERE "userId" = $1 AND status IN ('approved', 'done')`,
      [user.id]
    )

    const out: Record<string, number> = {
      tickets: Number(t[0]?.c || 0),
      services: Number(s[0]?.c || 0),
      training: Number(tr[0]?.c || 0),
      adminTickets: 0,
      adminServices: 0,
      adminTraining: 0,
    }

    if (isAdminEmail(user.email)) {
      const [at, as, atr] = await Promise.all([
        db.query(`SELECT COUNT(*) AS c FROM "support_ticket" WHERE status = 'open'`),
        db.query(`SELECT COUNT(*) AS c FROM "service_request" WHERE status = 'pending'`),
        db.query(`SELECT COUNT(*) AS c FROM "training_request" WHERE status = 'pending'`),
      ])
      // Support/content roles see everything here; tab-level gating stays in UI
      out.adminTickets = Number(at.rows[0]?.c || 0)
      out.adminServices = Number(as.rows[0]?.c || 0)
      out.adminTraining = Number(atr.rows[0]?.c || 0)
    }

    await db.end()
    return NextResponse.json({ badges: out })
  } catch (error) {
    await db.end()
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
