import { NextResponse } from "next/server"
import { Pool } from "pg"
import { NEWSLETTER_SEED } from "@/lib/newsletter-seed"

export async function GET() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })

  try {
    const queries = [
      `CREATE TABLE IF NOT EXISTS "user" (
        "id" text PRIMARY KEY,
        "name" text NOT NULL,
        "email" text NOT NULL UNIQUE,
        "emailVerified" boolean NOT NULL DEFAULT false,
        "image" text,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )`,
      `CREATE TABLE IF NOT EXISTS "session" (
        "id" text PRIMARY KEY,
        "expiresAt" timestamp NOT NULL,
        "token" text NOT NULL UNIQUE,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        "ipAddress" text,
        "userAgent" text,
        "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS "account" (
        "id" text PRIMARY KEY,
        "accountId" text NOT NULL,
        "providerId" text NOT NULL,
        "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "accessToken" text,
        "refreshToken" text,
        "idToken" text,
        "accessTokenExpiresAt" timestamp,
        "refreshTokenExpiresAt" timestamp,
        "scope" text,
        "password" text,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )`,
      `CREATE TABLE IF NOT EXISTS "organization_profile" (
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
      )`,
      `CREATE TABLE IF NOT EXISTS "support_ticket" (
        "id" text PRIMARY KEY,
        "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "email" text NOT NULL DEFAULT '',
        "subject" text NOT NULL DEFAULT '',
        "category" text NOT NULL DEFAULT 'Other',
        "status" text NOT NULL DEFAULT 'open',
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )`,
      `CREATE TABLE IF NOT EXISTS "ticket_message" (
        "id" text PRIMARY KEY,
        "ticketId" text NOT NULL REFERENCES "support_ticket"("id") ON DELETE CASCADE,
        "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "body" text NOT NULL DEFAULT '',
        "isAdmin" boolean NOT NULL DEFAULT false,
        "image" text,
        "createdAt" timestamp NOT NULL DEFAULT now()
      )`,
      `ALTER TABLE "ticket_message" ADD COLUMN IF NOT EXISTS "image" text`,
      `CREATE TABLE IF NOT EXISTS "action_evidence" (
        "id" text PRIMARY KEY,
        "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "actionId" text NOT NULL,
        "title" text NOT NULL DEFAULT '',
        "evidence" text NOT NULL DEFAULT '',
        "attachment" text,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        UNIQUE ("userId", "actionId")
      )`,
      `CREATE TABLE IF NOT EXISTS "notification" (
        "id" text PRIMARY KEY,
        "title" text NOT NULL DEFAULT '',
        "body" text NOT NULL DEFAULT '',
        "createdAt" timestamp NOT NULL DEFAULT now()
      )`,
      `CREATE TABLE IF NOT EXISTS "newsletter" (
        "id" text PRIMARY KEY,
        "title" text NOT NULL DEFAULT '',
        "summary" text NOT NULL DEFAULT '',
        "url" text NOT NULL DEFAULT '' UNIQUE,
        "segment" text NOT NULL DEFAULT 'All',
        "publishedAt" timestamp NOT NULL DEFAULT now()
      )`,
      `CREATE TABLE IF NOT EXISTS "training_request" (
        "id" text PRIMARY KEY,
        "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "email" text NOT NULL DEFAULT '',
        "kind" text NOT NULL DEFAULT 'trainer',
        "topic" text NOT NULL DEFAULT '',
        "preferredDate" text NOT NULL DEFAULT '',
        "teamSize" text NOT NULL DEFAULT '',
        "notes" text NOT NULL DEFAULT '',
        "status" text NOT NULL DEFAULT 'pending',
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )`,
      `ALTER TABLE "organization_profile" ADD COLUMN IF NOT EXISTS "context" text NOT NULL DEFAULT ''`,
      `ALTER TABLE "organization_profile" ADD COLUMN IF NOT EXISTS "newsletterOptOut" boolean NOT NULL DEFAULT false`,
      `ALTER TABLE "newsletter" ADD COLUMN IF NOT EXISTS "source" text NOT NULL DEFAULT 'manual'`,
      `CREATE TABLE IF NOT EXISTS "verification" (
        "id" text PRIMARY KEY,
        "identifier" text NOT NULL,
        "value" text NOT NULL,
        "expiresAt" timestamp NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )`,
    ]

    for (const query of queries) {
      await pool.query(query)
    }

    // Seed the GRC briefing library (idempotent)
    for (const s of NEWSLETTER_SEED) {
      await pool.query(
        `INSERT INTO "newsletter" (id, title, summary, url, segment)
         VALUES ($1, $2, $3, $4, $5) ON CONFLICT (url) DO NOTHING`,
        [`nl_seed_${Math.random().toString(36).slice(2, 10)}`, s.title, s.summary, s.url, s.segment]
      )
    }

    await pool.end()

    return NextResponse.json({
      success: true,
      message: "Tables created + migrated: user, session, account, verification, organization_profile, support_ticket, ticket_message, action_evidence, notification, newsletter, training_request",
    })
  } catch (error) {
    await pool.end()
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}
