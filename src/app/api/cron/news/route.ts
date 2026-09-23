import { NextResponse } from "next/server"
import { dbPool, ensureAppTables, ensureTicketTables, newId } from "@/lib/tickets-db"

interface FeedItem {
  title: string
  url: string
  summary: string
  publishedAt: string | null
}

const FEEDS = [
  { url: "https://nigeriadataprotection.com/feed/", segment: "Nigeria" },
  { url: "https://krebsonsecurity.com/feed/", segment: "Security" },
  { url: "https://www.bleepingcomputer.com/feed/", segment: "Security" },
]

function stripHtml(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
}

function parseRss(xml: string): FeedItem[] {
  const items: FeedItem[] = []
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || []
  for (const b of blocks.slice(0, 6)) {
    const pick = (tag: string) => {
      const m = b.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"))
      return m ? stripHtml(m[1]) : ""
    }
    const title = pick("title")
    const url = pick("link") || pick("guid")
    const summary = pick("description").slice(0, 600)
    const pubRaw = pick("pubDate")
    const publishedAt = pubRaw && !isNaN(Date.parse(pubRaw)) ? new Date(pubRaw).toISOString() : null
    if (title && /^https?:\/\//.test(url)) {
      items.push({ title: title.slice(0, 300), url: url.slice(0, 1000), summary, publishedAt })
    }
  }
  return items
}

// GET /api/cron/news — pull RSS feeds into the briefing library (dedupe by URL).
// Vercel Cron calls this daily. Optional CRON_SECRET: if set, the request must
// carry it as Bearer token or ?key=.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = req.headers.get("authorization") || ""
    const key = new URL(req.url).searchParams.get("key") || ""
    if (auth !== `Bearer ${secret}` && key !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  const db = dbPool()
  const imported: string[] = []
  const failed: string[] = []
  try {
    await ensureAppTables(db)
    await ensureTicketTables(db)
    for (const feed of FEEDS) {
      try {
        const res = await fetch(feed.url, {
          headers: { "user-agent": "CyberTrustNest-newsbot/1.0" },
          signal: AbortSignal.timeout(15000),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        for (const item of parseRss(await res.text())) {
          const r = await db.query(
            `INSERT INTO "newsletter" (id, title, summary, url, segment, source, "publishedAt")
             VALUES ($1, $2, $3, $4, $5, 'auto', COALESCE($6, now()))
             ON CONFLICT (url) DO NOTHING RETURNING id`,
            [newId("nl"), item.title, item.summary, item.url, feed.segment, item.publishedAt]
          )
          if (r.rows[0]) imported.push(item.title)
        }
      } catch (e) {
        failed.push(`${feed.url}: ${(e as Error).message}`)
      }
    }
    // Keep the auto shelf tidy: max 40 auto items
    await db.query(
      `DELETE FROM "newsletter" WHERE id IN (
        SELECT id FROM "newsletter" WHERE source = 'auto'
        ORDER BY "publishedAt" DESC OFFSET 40
      )`
    )
    // Evidence privacy: expire uploaded files after 180 days, keep written summaries
    const ev = await db.query(
      `UPDATE "action_evidence" SET attachment = NULL
       WHERE attachment IS NOT NULL AND "createdAt" < now() - interval '180 days'`
    )
    const tm = await db.query(
      `UPDATE "ticket_message" SET image = NULL
       WHERE image IS NOT NULL AND "createdAt" < now() - interval '180 days'`
    )
    await db.end()
    return NextResponse.json({
      ok: true,
      imported: imported.length,
      titles: imported.slice(0, 10),
      failed,
      expiredAttachments: (ev.rowCount || 0) + (tm.rowCount || 0),
    })
  } catch (error) {
    await db.end()
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
