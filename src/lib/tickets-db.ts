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
    "createdAt" timestamp NOT NULL DEFAULT now()
  )`,
]

export async function ensureTicketTables(pool: Pool) {
  for (const q of TICKET_TABLES) {
    await pool.query(q)
  }
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}
