import { NextResponse } from "next/server"
import { hashPassword } from "better-auth/crypto"
import { requireRole, adminEmails, ensureAdminTables, type AdminRole } from "@/lib/admin"
import { dbPool, newId } from "@/lib/tickets-db"

const ROLES: AdminRole[] = ["super", "support", "content"]

// GET /api/admin/admins — env supers + managed admins (super only)
export async function GET(req: Request) {
  const gate = await requireRole(req, "super")
  if ("error" in gate) return gate.error

  const db = dbPool()
  try {
    await ensureAdminTables(db)
    const { rows } = await db.query(
      `SELECT p."userId", p."firstName", p."lastName", p.role, p."mustChangePassword", p."createdAt",
        u.email, u.name,
        EXISTS (SELECT 1 FROM "account" a WHERE a."userId" = p."userId" AND a."providerId" = 'credential') AS "hasPassword",
        EXISTS (SELECT 1 FROM "twoFactor" t WHERE t."userId" = p."userId") AS "totpEnrolled"
       FROM "admin_profile" p JOIN "user" u ON u.id = p."userId"
       ORDER BY p."createdAt" DESC`
    )
    await db.end()
    return NextResponse.json({ envAdmins: adminEmails(), passwordAdmins: rows })
  } catch (error) {
    await db.end()
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

// POST /api/admin/admins — { email, firstName, lastName, role, password } (super only)
// New admins must change the password and enroll 2FA on first sign-in.
export async function POST(req: Request) {
  const gate = await requireRole(req, "super")
  if ("error" in gate) return gate.error

  const body = (await req.json().catch(() => ({}))) as {
    email?: string
    firstName?: string
    lastName?: string
    role?: string
    password?: string
  }
  const email = (body.email || "").trim().toLowerCase()
  const password = body.password || ""
  const role: AdminRole = ROLES.includes(body.role as AdminRole) ? (body.role as AdminRole) : "support"
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
  }

  const db = dbPool()
  try {
    await ensureAdminTables(db)
    let userId: string
    const { rows } = await db.query(`SELECT id FROM "user" WHERE email = $1`, [email])
    if (rows[0]) {
      userId = rows[0].id as string
      await db.query(`UPDATE "user" SET name = $1, "updatedAt" = now() WHERE id = $2`, [
        `${(body.firstName || "").trim()} ${(body.lastName || "").trim()}`.trim() || email.split("@")[0],
        userId,
      ])
    } else {
      userId = newId("usr")
      await db.query(
        `INSERT INTO "user" (id, name, email, "emailVerified") VALUES ($1, $2, $3, true)`,
        [
          userId,
          `${(body.firstName || "").trim()} ${(body.lastName || "").trim()}`.trim() || email.split("@")[0],
          email,
        ]
      )
    }
    const hash = await hashPassword(password)
    await db.query(`DELETE FROM "account" WHERE "userId" = $1 AND "providerId" = 'credential'`, [userId])
    await db.query(
      `INSERT INTO "account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
       VALUES ($1, $2, 'credential', $3, $4, now(), now())`,
      [newId("acc"), email, userId, hash]
    )
    // Fresh 2FA: drop any previous enrollment so they enroll anew
    await db.query(`DELETE FROM "twoFactor" WHERE "userId" = $1`, [userId])
    await db.query(
      `INSERT INTO "admin_profile" ("userId", "firstName", "lastName", role, "mustChangePassword")
       VALUES ($1, $2, $3, $4, true)
       ON CONFLICT ("userId") DO UPDATE SET "firstName" = $2, "lastName" = $3, role = $4, "mustChangePassword" = true`,
      [userId, (body.firstName || "").trim(), (body.lastName || "").trim(), role]
    )
    await db.end()
    return NextResponse.json({ ok: true })
  } catch (error) {
    await db.end()
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

// PUT /api/admin/admins — { userId, firstName?, lastName?, role? } edit name/role (super only)
export async function PUT(req: Request) {
  const gate = await requireRole(req, "super")
  if ("error" in gate) return gate.error

  const body = (await req.json().catch(() => ({}))) as {
    userId?: string
    firstName?: string
    lastName?: string
    role?: string
  }
  if (!body.userId) return NextResponse.json({ error: "userId required" }, { status: 400 })
  if (body.role && !ROLES.includes(body.role as AdminRole)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  }

  const db = dbPool()
  try {
    await ensureAdminTables(db)
    const sets: string[] = []
    const vals: unknown[] = []
    if (body.firstName !== undefined) {
      sets.push(`"firstName" = $${vals.length + 1}`)
      vals.push(body.firstName.trim().slice(0, 100))
    }
    if (body.lastName !== undefined) {
      sets.push(`"lastName" = $${vals.length + 1}`)
      vals.push(body.lastName.trim().slice(0, 100))
    }
    if (body.role) {
      sets.push(`role = $${vals.length + 1}`)
      vals.push(body.role)
    }
    if (sets.length > 0) {
      await db.query(`UPDATE "admin_profile" SET ${sets.join(", ")} WHERE "userId" = $${vals.length + 1}`, [
        ...vals,
        body.userId,
      ])
    }
    const { rows } = await db.query(`SELECT "firstName", "lastName" FROM "admin_profile" WHERE "userId" = $1`, [
      body.userId,
    ])
    if (rows[0]) {
      await db.query(`UPDATE "user" SET name = $1, "updatedAt" = now() WHERE id = $2`, [
        `${rows[0].firstName} ${rows[0].lastName}`.trim(),
        body.userId,
      ])
    }
    await db.end()
    return NextResponse.json({ ok: true })
  } catch (error) {
    await db.end()
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

// DELETE /api/admin/admins?userId= — remove password login + admin role (super only)
export async function DELETE(req: Request) {
  const gate = await requireRole(req, "super")
  if ("error" in gate) return gate.error

  const userId = new URL(req.url).searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })
  if (userId === gate.admin.userId) {
    return NextResponse.json({ error: "You cannot remove your own admin access" }, { status: 400 })
  }

  const db = dbPool()
  try {
    await db.query(`DELETE FROM "account" WHERE "userId" = $1 AND "providerId" = 'credential'`, [userId])
    await db.query(`DELETE FROM "twoFactor" WHERE "userId" = $1`, [userId])
    await db.query(`DELETE FROM "admin_profile" WHERE "userId" = $1`, [userId])
    await db.end()
    return NextResponse.json({ ok: true })
  } catch (error) {
    await db.end()
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
