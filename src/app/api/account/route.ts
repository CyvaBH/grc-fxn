import { NextResponse } from "next/server"
import { requireUser } from "@/lib/admin"
import { dbPool } from "@/lib/tickets-db"

// DELETE /api/account — permanently delete the signed-in user's account.
// Cascades to sessions, profile, tickets, evidence and training requests.
export async function DELETE(req: Request) {
  const user = await requireUser(req)
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 })

  const body = (await req.json().catch(() => ({}))) as { confirmEmail?: string }
  if ((body.confirmEmail || "").trim().toLowerCase() !== (user.email || "").toLowerCase()) {
    return NextResponse.json({ error: "Confirmation email does not match" }, { status: 400 })
  }

  const db = dbPool()
  try {
    await db.query(`DELETE FROM "user" WHERE id = $1`, [user.id])
    // Scrub leftover OTP verification rows keyed by email (nothing retained)
    try {
      await db.query(`DELETE FROM "verification" WHERE identifier LIKE $1`, [`%${user.email}%`])
    } catch {}
    await db.end()
    return NextResponse.json({ ok: true })
  } catch (error) {
    await db.end()
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
