import { Pool } from "pg"

export function dbPool() {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
}

export const TICKET_TABLES = [
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
]

export async function ensureTicketTables(pool: Pool) {
  for (const q of TICKET_TABLES) {
    await pool.query(q)
  }
}

export const APP_TABLES = [
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
  `CREATE TABLE IF NOT EXISTS "service_request" (
    "id" text PRIMARY KEY,
    "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "email" text NOT NULL DEFAULT '',
    "service" text NOT NULL DEFAULT '',
    "policy" text NOT NULL DEFAULT '',
    "name" text NOT NULL DEFAULT '',
    "org" text NOT NULL DEFAULT '',
    "timeline" text NOT NULL DEFAULT '',
    "currentState" text NOT NULL DEFAULT '',
    "details" text NOT NULL DEFAULT '',
    "status" text NOT NULL DEFAULT 'pending',
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now()
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
  // Schema evolutions for tables that may already exist
  `ALTER TABLE "newsletter" ADD COLUMN IF NOT EXISTS "source" text NOT NULL DEFAULT 'manual'`,
  `ALTER TABLE "organization_profile" ADD COLUMN IF NOT EXISTS "contextDetail" text NOT NULL DEFAULT ''`,
  `ALTER TABLE "ticket_message" ADD COLUMN IF NOT EXISTS "image" text`,
  `ALTER TABLE "organization_profile" ADD COLUMN IF NOT EXISTS "context" text NOT NULL DEFAULT ''`,
  `ALTER TABLE "organization_profile" ADD COLUMN IF NOT EXISTS "newsletterOptOut" boolean NOT NULL DEFAULT false`,
]

export async function ensureAppTables(pool: Pool) {
  for (const q of APP_TABLES) {
    await pool.query(q)
  }
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}
