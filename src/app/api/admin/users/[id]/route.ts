import { NextResponse } from "next/server"
import { requireRole } from "@/lib/admin"
import { dbPool } from "@/lib/tickets-db"
import { CREATE_PROFILE_TABLE } from "@/app/api/profile/route"

// GET /api/admin/users/[id] — everything about one user (super + support roles)
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(req, "super", "support")
  if ("error" in gate) return gate.error
  const { id } = await params

  const db = dbPool()
  try {
    await db.query(CREATE_PROFILE_TABLE)
    const { rows } = await db.query(`SELECT * FROM "user" WHERE id = $1`, [id])
    const user = rows[0] as Record<string, unknown> | undefined
    if (!user) {
      await db.end()
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    const { rows: profiles } = await db.query(
      `SELECT * FROM "organization_profile" WHERE "userId" = $1`, [id]
    )
    const { rows: evidence } = await db.query(
      `SELECT id, "actionId", title, evidence, attachment IS NOT NULL AS "hasAttachment", "createdAt"
       FROM "action_evidence" WHERE "userId" = $1 ORDER BY "createdAt" ASC`, [id]
    )
    const { rows: tickets } = await db.query(
      `SELECT t.id, t.subject, t.category, t.status, t."createdAt", t."updatedAt",
        (SELECT COUNT(*) FROM "ticket_message" m WHERE m."ticketId" = t.id) AS "messageCount"
       FROM "support_ticket" t WHERE t."userId" = $1 ORDER BY t."updatedAt" DESC`, [id]
    )
    const { rows: training } = await db.query(
      `SELECT id, kind, topic, "preferredDate", "teamSize", status, "createdAt"
       FROM "training_request" WHERE "userId" = $1 ORDER BY "createdAt" DESC`, [id]
    )
    const { rows: sessions } = await db.query(
      `SELECT COUNT(*) AS c, MAX("createdAt") AS "lastSeen" FROM "session" WHERE "userId" = $1`,
      [id]
    )
    const { rows: admins } = await db.query(
      `SELECT role FROM "admin_profile" WHERE "userId" = $1`, [id]
    )
    await db.end()

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      hasAvatar: !!(user.image as string | null),
      createdAt: user.createdAt,
    }
    let dataTypes: string[] = []
    const prof = profiles[0] as Record<string, unknown> | undefined
    if (prof) {
      try {
        const parsed: unknown = JSON.parse((prof.dataTypes as string) || "[]")
        if (Array.isArray(parsed)) dataTypes = parsed.filter((x): x is string => typeof x === "string")
      } catch {}
    }
    return NextResponse.json({
      user: safeUser,
      profile: prof
        ? {
            displayName: prof.displayName,
            orgName: prof.orgName,
            industry: prof.industry,
            sizeBand: prof.sizeBand,
            states: prof.states,
            dataTypes,
            handlesPayments: prof.handlesPayments,
            healthData: prof.healthData,
            hasWebsite: prof.hasWebsite,
            enterpriseClients: prof.enterpriseClients,
            context: prof.context,
            newsletterOptOut: prof.newsletterOptOut,
            createdAt: prof.createdAt,
            updatedAt: prof.updatedAt,
          }
        : null,
      evidence,
      tickets,
      training,
      sessions: { total: Number(sessions[0]?.c || 0), lastSeen: sessions[0]?.lastSeen || null },
      adminRole: (admins[0]?.role as string) || null,
    })
  } catch (error) {
    await db.end()
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
