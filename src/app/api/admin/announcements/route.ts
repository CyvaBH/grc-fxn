import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"
import { dbPool, ensureAppTables, newId } from "@/lib/tickets-db"
import { sendBrevoEmail } from "@/lib/email"

// POST /api/admin/announcements — { title, body, sendEmail? }
// In-app notification for all users, optionally emailed to everyone.
export async function POST(req: Request) {
  const gate = await requireAdmin(req)
  if ("error" in gate) return gate.error

  const body = (await req.json().catch(() => ({}))) as {
    title?: string
    body?: string
    sendEmail?: boolean
  }
  const title = (body.title || "").trim().slice(0, 200)
  const text = (body.body || "").trim().slice(0, 5000)
  if (!title || !text) {
    return NextResponse.json({ error: "Title and body are required" }, { status: 400 })
  }

  const db = dbPool()
  try {
    await ensureAppTables(db)
    await db.query(`INSERT INTO "notification" (id, title, body) VALUES ($1, $2, $3)`, [
      newId("ntf"),
      title,
      text,
    ])

    let emailed = 0
    let emailError: string | null = null
    if (body.sendEmail) {
      if (!process.env.BREVO_API_KEY) {
        emailError = "BREVO_API_KEY is not configured"
      } else {
        const { rows } = await db.query(`SELECT email FROM "user"`)
        const html = `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <h2 style="color:#0F2A44;margin:0 0 12px;">${title.replace(/</g, "&lt;")}</h2>
          <p style="color:#334155;line-height:1.6;white-space:pre-wrap;">${text.replace(/</g, "&lt;")}</p>
          <p style="color:#94A3B8;font-size:12px;margin-top:24px;">Cyber Trust Nest update. Guidance only — not legal advice.</p>
        </div>`
        for (const r of rows as { email: string }[]) {
          try {
            await sendBrevoEmail(r.email, `Cyber Trust Nest: ${title}`, html)
            emailed++
          } catch (e) {
            emailError = (e as Error).message
          }
        }
      }
    }
    await db.end()
    return NextResponse.json({ ok: true, emailed, emailError })
  } catch (error) {
    await db.end()
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
