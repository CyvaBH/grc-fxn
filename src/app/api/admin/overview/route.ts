import { NextResponse } from "next/server"
import { requireRole } from "@/lib/admin"
import { dbPool, ensureTicketTables } from "@/lib/tickets-db"
import { CREATE_PROFILE_TABLE } from "@/app/api/profile/route"

// GET /api/admin/overview — stat cards, signup chart data, recent activity
export async function GET(req: Request) {
  const gate = await requireRole(req, "super")
  if ("error" in gate) return gate.error

  const db = dbPool()
  try {
    await ensureTicketTables(db)
    await db.query(CREATE_PROFILE_TABLE)

    const [{ rows: u }] = [await db.query(`SELECT COUNT(*) AS c FROM "user"`)]
    const totalUsers = Number(u[0].c)
    const { rows: w } = await db.query(
      `SELECT COUNT(*) AS c FROM "user" WHERE "createdAt" > now() - interval '7 days'`
    )
    const new7d = Number(w[0].c)
    const { rows: t } = await db.query(`SELECT COUNT(*) AS c FROM "support_ticket"`)
    const totalTickets = Number(t[0].c)
    const { rows: o } = await db.query(
      `SELECT COUNT(*) AS c FROM "support_ticket" WHERE status = 'open'`
    )
    const openTickets = Number(o[0].c)
    const { rows: s } = await db.query(`SELECT COUNT(*) AS c FROM "session" WHERE "expiresAt" > now()`)
    const activeSessions = Number(s[0].c)

    const { rows: daily } = await db.query(
      `SELECT to_char("createdAt", 'YYYY-MM-DD') AS day, COUNT(*) AS c
       FROM "user" WHERE "createdAt" > now() - interval '30 days'
       GROUP BY 1 ORDER BY 1`
    )

    const { rows: recentUsers } = await db.query(
      `SELECT u.id, u.name, u.email, u."emailVerified", u."createdAt",
        (SELECT p."orgName" FROM "organization_profile" p WHERE p."userId" = u.id) AS "orgName"
       FROM "user" u ORDER BY u."createdAt" DESC LIMIT 8`
    )
    const { rows: recentTickets } = await db.query(
      `SELECT t.*, (SELECT m.body FROM "ticket_message" m WHERE m."ticketId" = t.id ORDER BY m."createdAt" DESC LIMIT 1) AS "lastMessage",
        (SELECT m."isAdmin" FROM "ticket_message" m WHERE m."ticketId" = t.id ORDER BY m."createdAt" DESC LIMIT 1) AS "lastByAdmin"
       FROM "support_ticket" t ORDER BY t."updatedAt" DESC LIMIT 8`
    )

    await db.end()
    return NextResponse.json({
      stats: { totalUsers, new7d, totalTickets, openTickets, activeSessions },
      dailySignups: daily.map((d) => ({ day: d.day as string, count: Number(d.c) })),
      recentUsers,
      recentTickets,
    })
  } catch (error) {
    await db.end()
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
