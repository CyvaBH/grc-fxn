import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"
import { dbPool, ensureAppTables } from "@/lib/tickets-db"

// GET /api/admin/training?status= — all training requests
export async function GET(req: Request) {
  const gate = await requireAdmin(req)
  if ("error" in gate) return gate.error
  const status = new URL(req.url).searchParams.get("status") || "all"

  const db = dbPool()
  try {
    await ensureAppTables(db)
    const { rows } = await db.query(
      `SELECT * FROM "training_request" ${status === "all" ? "" : "WHERE status = $1"} ORDER BY "createdAt" DESC LIMIT 100`,
      status === "all" ? [] : [status]
    )
    await db.end()
    return NextResponse.json({ requests: rows })
  } catch (error) {
    await db.end()
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

// PATCH /api/admin/training — { id, status: 'pending'|'approved'|'done' }
export async function PATCH(req: Request) {
  const gate = await requireAdmin(req)
  if ("error" in gate) return gate.error

  const body = (await req.json().catch(() => ({}))) as { id?: string; status?: string }
  if (!body.id || !["pending", "approved", "done"].includes(body.status || "")) {
    return NextResponse.json({ error: "id and valid status required" }, { status: 400 })
  }

  const db = dbPool()
  try {
    await ensureAppTables(db)
    await db.query(`UPDATE "training_request" SET status = $1, "updatedAt" = now() WHERE id = $2`, [
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
