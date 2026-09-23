import { NextResponse } from "next/server"
import { requireRole } from "@/lib/admin"
import { dbPool, ensureAppTables, newId } from "@/lib/tickets-db"
import { sendBrevoEmail } from "@/lib/email"
import { NEWSLETTER_SEED } from "@/lib/newsletter-seed"

// POST /api/admin/newsletter — { title, summary, url, segment?, sendEmail? }
export async function POST(req: Request) {
  const gate = await requireRole(req, "super", "content")
  if ("error" in gate) return gate.error

  const body = (await req.json().catch(() => ({}))) as {
    title?: string
    summary?: string
    url?: string
    segment?: string
    sendEmail?: boolean
  }
  const title = (body.title || "").trim().slice(0, 300)
  const summary = (body.summary || "").trim().slice(0, 2000)
  const url = (body.url || "").trim().slice(0, 1000)
  if (!title || !summary || !url || !/^https?:\/\//.test(url)) {
    return NextResponse.json({ error: "Title, summary and a valid https URL are required" }, { status: 400 })
  }

  const db = dbPool()
  try {
    await ensureAppTables(db)
    // Seed the starter library once
    for (const s of NEWSLETTER_SEED) {
      await db.query(
        `INSERT INTO "newsletter" (id, title, summary, url, segment) VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (url) DO NOTHING`,
        [newId("nl"), s.title, s.summary, s.url, s.segment]
      )
    }
    const { rows } = await db.query(
      `INSERT INTO "newsletter" (id, title, summary, url, segment) VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (url) DO UPDATE SET title = $2, summary = $3, segment = $4, "publishedAt" = now()
       RETURNING *`,
      [newId("nl"), title, summary, url, (body.segment || "All").slice(0, 100)]
    )

    let emailed = 0
    let emailError: string | null = null
    if (body.sendEmail) {
      if (!process.env.BREVO_API_KEY) {
        emailError = "BREVO_API_KEY is not configured"
      } else {
        const { rows: users } = await db.query(
          `SELECT u.email FROM "user" u LEFT JOIN "organization_profile" p ON p."userId" = u.id
           WHERE COALESCE(p."newsletterOptOut", false) = false`
        )
        const html = `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <p style="color:#0E9F6E;font-size:12px;font-weight:700;letter-spacing:1px;margin:0 0 8px;">CYBER TRUST NEST • GRC BRIEFING</p>
          <h2 style="color:#0F2A44;margin:0 0 12px;">${title.replace(/</g, "&lt;")}</h2>
          <p style="color:#334155;line-height:1.6;">${summary.replace(/</g, "&lt;")}</p>
          <a href="${url}" style="display:inline-block;margin-top:12px;background:#0E9F6E;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;">Read full article</a>
          <p style="color:#94A3B8;font-size:12px;margin-top:24px;">You're receiving this because you subscribed in Settings. Turn off newsletter emails there anytime.</p>
        </div>`
        for (const r of users as { email: string }[]) {
          try {
            await sendBrevoEmail(r.email, `GRC briefing: ${title}`, html)
            emailed++
          } catch (e) {
            emailError = (e as Error).message
          }
        }
      }
    }
    await db.end()
    return NextResponse.json({ ok: true, newsletter: rows[0], emailed, emailError })
  } catch (error) {
    await db.end()
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
