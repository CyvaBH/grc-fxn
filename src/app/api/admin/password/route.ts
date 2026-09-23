import { NextResponse } from "next/server"
import { hashPassword, verifyPassword } from "better-auth/crypto"
import { resolveAdmin } from "@/lib/admin"
import { dbPool } from "@/lib/tickets-db"

// PUT /api/admin/password — { currentPassword, newPassword }
// Used for the forced first-time change and later voluntary changes.
export async function PUT(req: Request) {
  const admin = await resolveAdmin(req)
  if (!admin) return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  if (admin.source === "env") {
    return NextResponse.json({ error: "Env super-admins don't use password login" }, { status: 400 })
  }

  const body = (await req.json().catch(() => ({}))) as {
    currentPassword?: string
    newPassword?: string
  }
  const next = body.newPassword || ""
  if (next.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 })
  }

  const db = dbPool()
  try {
    const { rows } = await db.query(
      `SELECT password FROM "account" WHERE "userId" = $1 AND "providerId" = 'credential'`,
      [admin.userId]
    )
    const hash = rows[0]?.password as string | undefined
    if (!hash) {
      await db.end()
      return NextResponse.json({ error: "No password login on this account" }, { status: 400 })
    }
    const ok = await verifyPassword({ hash, password: body.currentPassword || "" })
    if (!ok) {
      await db.end()
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }
    await db.query(
      `UPDATE "account" SET password = $1, "updatedAt" = now() WHERE "userId" = $2 AND "providerId" = 'credential'`,
      [await hashPassword(next), admin.userId]
    )
    await db.query(`UPDATE "admin_profile" SET "mustChangePassword" = false WHERE "userId" = $1`, [
      admin.userId,
    ])
    await db.end()
    return NextResponse.json({ ok: true })
  } catch (error) {
    await db.end()
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
