import { NextResponse } from "next/server"
import { requireRole } from "@/lib/admin"
import { dbPool } from "@/lib/tickets-db"
import { CREATE_PROFILE_TABLE } from "@/app/api/profile/route"

// GET /api/admin/users?q=&limit= — searchable user directory
export async function GET(req: Request) {
  const gate = await requireRole(req, "super", "support")
  if ("error" in gate) return gate.error

  const q = new URL(req.url).searchParams.get("q")?.trim() || ""
  const db = dbPool()
  try {
    await db.query(CREATE_PROFILE_TABLE)
    const { rows } = q
      ? await db.query(
          `SELECT u.id, u.name, u.email, u."emailVerified", u.image IS NOT NULL AS "hasAvatar", u."createdAt",
            (SELECT p."orgName" FROM "organization_profile" p WHERE p."userId" = u.id) AS "orgName",
            (SELECT p.industry FROM "organization_profile" p WHERE p."userId" = u.id) AS industry,
            (SELECT COUNT(*) FROM "support_ticket" t WHERE t."userId" = u.id) AS "ticketCount"
           FROM "user" u
           WHERE u.email ILIKE $1 OR u.name ILIKE $1
           ORDER BY u."createdAt" DESC LIMIT 50`,
          [`%${q}%`]
        )
      : await db.query(
          `SELECT u.id, u.name, u.email, u."emailVerified", u.image IS NOT NULL AS "hasAvatar", u."createdAt",
            (SELECT p."orgName" FROM "organization_profile" p WHERE p."userId" = u.id) AS "orgName",
            (SELECT p.industry FROM "organization_profile" p WHERE p."userId" = u.id) AS industry,
            (SELECT COUNT(*) FROM "support_ticket" t WHERE t."userId" = u.id) AS "ticketCount"
           FROM "user" u ORDER BY u."createdAt" DESC LIMIT 50`
        )
    await db.end()
    return NextResponse.json({ users: rows })
  } catch (error) {
    await db.end()
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

// DELETE /api/admin/users?userId= — permanently delete a user and everything
// attached (sessions, profile, tickets, evidence, training). Cannot delete self.
export async function DELETE(req: Request) {
  const gate = await requireRole(req, "super")
  if ("error" in gate) return gate.error

  const userId = new URL(req.url).searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })
  if (userId === gate.admin.userId) {
    return NextResponse.json({ error: "You cannot delete your own admin account" }, { status: 400 })
  }

  const db = dbPool()
  try {
    const { rows: target } = await db.query(`SELECT email FROM "user" WHERE id = $1`, [userId])
    if (!target[0]) {
      await db.end()
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    const { rowCount } = await db.query(`DELETE FROM "user" WHERE id = $1`, [userId])
    // Scrub leftover OTP verification rows keyed by email (nothing retained)
    try {
      await db.query(`DELETE FROM "verification" WHERE identifier LIKE $1`, [`%${target[0].email}%`])
    } catch {}
    await db.end()
    if (!rowCount) return NextResponse.json({ error: "User not found" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    await db.end()
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
