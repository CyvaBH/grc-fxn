import { NextResponse } from "next/server"
import { Pool } from "pg"
import { auth } from "@/lib/auth"

function pool() {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
}

export const CREATE_PROFILE_TABLE = `CREATE TABLE IF NOT EXISTS "organization_profile" (
  "id" text PRIMARY KEY,
  "userId" text NOT NULL UNIQUE REFERENCES "user"("id") ON DELETE CASCADE,
  "displayName" text NOT NULL DEFAULT '',
  "orgName" text NOT NULL DEFAULT '',
  "industry" text NOT NULL DEFAULT '',
  "sizeBand" text NOT NULL DEFAULT '',
  "states" text NOT NULL DEFAULT '',
  "dataTypes" text NOT NULL DEFAULT '[]',
  "handlesPayments" boolean NOT NULL DEFAULT false,
  "healthData" boolean NOT NULL DEFAULT false,
  "hasWebsite" boolean NOT NULL DEFAULT false,
  "enterpriseClients" boolean NOT NULL DEFAULT false,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
)`

async function getSessionUser(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers })
  return session?.user ?? null
}

function rowToProfile(row: Record<string, unknown>) {
  let dataTypes: string[] = []
  try {
    const parsed: unknown = JSON.parse((row.dataTypes as string) || "[]")
    if (Array.isArray(parsed)) dataTypes = parsed.filter((x): x is string => typeof x === "string")
  } catch {}
  return {
    displayName: (row.displayName as string) || "",
    orgName: (row.orgName as string) || "",
    industry: (row.industry as string) || "",
    sizeBand: (row.sizeBand as string) || "",
    states: (row.states as string) || "",
    dataTypes,
    handlesPayments: Boolean(row.handlesPayments),
    healthData: Boolean(row.healthData),
    hasWebsite: Boolean(row.hasWebsite),
    enterpriseClients: Boolean(row.enterpriseClients),
  }
}

export async function GET(req: Request) {
  const user = await getSessionUser(req)
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 })

  const db = pool()
  try {
    await db.query(CREATE_PROFILE_TABLE)
    const { rows } = await db.query(
      `SELECT * FROM "organization_profile" WHERE "userId" = $1 LIMIT 1`,
      [user.id]
    )
    const { rows: userRows } = await db.query(`SELECT name, email, image FROM "user" WHERE id = $1`, [
      user.id,
    ])
    const dbUser = userRows[0] as { name: string; email: string; image: string | null } | undefined
    await db.end()
    return NextResponse.json({
      user: { name: dbUser?.name ?? "", email: dbUser?.email ?? "", image: dbUser?.image ?? null },
      profile: rows[0] ? rowToProfile(rows[0] as Record<string, unknown>) : null,
    })
  } catch (error) {
    await db.end()
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

const PROFILE_FIELDS = [
  "displayName",
  "orgName",
  "industry",
  "sizeBand",
  "states",
  "handlesPayments",
  "healthData",
  "hasWebsite",
  "enterpriseClients",
] as const

export async function PUT(req: Request) {
  const user = await getSessionUser(req)
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 })

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>
  const db = pool()
  try {
    await db.query(CREATE_PROFILE_TABLE)

    // Name + avatar live on the user row
    if (typeof body.name === "string" && body.name.trim()) {
      await db.query(`UPDATE "user" SET name = $1, "updatedAt" = now() WHERE id = $2`, [
        body.name.trim(),
        user.id,
      ])
    }
    if (typeof body.avatar === "string") {
      await db.query(`UPDATE "user" SET image = $1, "updatedAt" = now() WHERE id = $2`, [
        body.avatar.slice(0, 200000),
        user.id,
      ])
    }

    const patch: Record<string, unknown> = {}
    for (const f of PROFILE_FIELDS) {
      if (body[f] !== undefined) patch[f] = body[f]
    }
    if (Array.isArray(body.dataTypes)) {
      patch.dataTypes = JSON.stringify(body.dataTypes.filter((x) => typeof x === "string"))
    }

    await db.query(
      `INSERT INTO "organization_profile" ("id", "userId") VALUES ($1, $1)
       ON CONFLICT ("userId") DO NOTHING`,
      [user.id]
    )
    if (Object.keys(patch).length > 0) {
      const cols = Object.keys(patch)
      const sets = cols.map((c, i) => `"${c}" = $${i + 1}`).join(", ")
      await db.query(
        `UPDATE "organization_profile" SET ${sets}, "updatedAt" = now() WHERE "userId" = $${cols.length + 1}`,
        [...cols.map((c) => patch[c]), user.id]
      )
    }

    const { rows } = await db.query(`SELECT * FROM "organization_profile" WHERE "userId" = $1`, [
      user.id,
    ])
    await db.end()
    return NextResponse.json({ profile: rows[0] ? rowToProfile(rows[0] as Record<string, unknown>) : null })
  } catch (error) {
    await db.end()
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
