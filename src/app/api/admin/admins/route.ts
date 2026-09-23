import { NextResponse } from "next/server"
import { hashPassword } from "better-auth/crypto"
import { requireAdmin, adminEmails } from "@/lib/admin"
import { dbPool, newId } from "@/lib/tickets-db"

// GET /api/admin/admins — list admins (env list + password accounts)
export async function GET(req: Request) {
  const gate = await requireAdmin(req)
  if ("error" in gate) return gate.error

  const db = dbPool()
  try {
    const { rows } = await db.query(
      `SELECT a."userId", a."createdAt", u.email, u.name
       FROM "account" a JOIN "user" u ON u.id = a."userId"
       WHERE a."providerId" = 'credential' ORDER BY a."createdAt" DESC`
    )
    await db.end()
    return NextResponse.json({ envAdmins: adminEmails(), passwordAdmins: rows })
  } catch (error) {
    await db.end()
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

// POST /api/admin/admins — { email, password } create/upgrade a password admin.
// The user must already exist (via OTP signup), or is created here.
export async function POST(req: Request) {
  const gate = await requireAdmin(req)
  if ("error" in gate) return gate.error

  const body = (await req.json().catch(() => ({}))) as { email?: string; password?: string }
  const email = (body.email || "").trim().toLowerCase()
  const password = body.password || ""
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
  }

  const db = dbPool()
  try {
    let userId: string
    const { rows } = await db.query(`SELECT id FROM "user" WHERE email = $1`, [email])
    if (rows[0]) {
      userId = rows[0].id as string
    } else {
      userId = newId("usr")
      await db.query(
        `INSERT INTO "user" (id, name, email, "emailVerified") VALUES ($1, $2, $3, true)`,
        [userId, email.split("@")[0], email]
      )
    }
    const hash = await hashPassword(password)
    await db.query(`DELETE FROM "account" WHERE "userId" = $1 AND "providerId" = 'credential'`, [userId])
    await db.query(
      `INSERT INTO "account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
       VALUES ($1, $2, 'credential', $3, $4, now(), now())`,
      [newId("acc"), email, userId, hash]
    )
    await db.end()
    return NextResponse.json({ ok: true })
  } catch (error) {
    await db.end()
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

// DELETE /api/admin/admins?userId= — remove password login (keeps the user + env access)
export async function DELETE(req: Request) {
  const gate = await requireAdmin(req)
  if ("error" in gate) return gate.error

  const userId = new URL(req.url).searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  const db = dbPool()
  try {
    await db.query(`DELETE FROM "account" WHERE "userId" = $1 AND "providerId" = 'credential'`, [userId])
    await db.end()
    return NextResponse.json({ ok: true })
  } catch (error) {
    await db.end()
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
