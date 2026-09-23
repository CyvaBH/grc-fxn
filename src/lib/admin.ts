import { NextResponse } from "next/server"
import { Pool } from "pg"
import { auth } from "@/lib/auth"

export type AdminRole = "super" | "support" | "content"

/** Comma-separated super-admin emails, e.g. ADMIN_EMAILS="you@company.com" */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false
  return adminEmails().includes(email.toLowerCase())
}

export async function requireUser(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers })
  return session?.user ?? null
}

export const ADMIN_PROFILE_TABLE = `CREATE TABLE IF NOT EXISTS "admin_profile" (
  "userId" text PRIMARY KEY REFERENCES "user"("id") ON DELETE CASCADE,
  "firstName" text NOT NULL DEFAULT '',
  "lastName" text NOT NULL DEFAULT '',
  "role" text NOT NULL DEFAULT 'support',
  "mustChangePassword" boolean NOT NULL DEFAULT false,
  "createdAt" timestamp NOT NULL DEFAULT now()
)`

export const TWO_FACTOR_TABLE = `CREATE TABLE IF NOT EXISTS "twoFactor" (
  "id" text PRIMARY KEY,
  "secret" text NOT NULL,
  "backupCodes" text NOT NULL,
  "userId" text NOT NULL UNIQUE REFERENCES "user"("id") ON DELETE CASCADE,
  "verified" boolean NOT NULL DEFAULT true,
  "failedVerificationCount" integer NOT NULL DEFAULT 0,
  "lockedUntil" timestamp,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
)`

export const ADMIN_SCHEMA_QUERIES = [
  ADMIN_PROFILE_TABLE,
  TWO_FACTOR_TABLE,
  `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "twoFactorEnabled" boolean NOT NULL DEFAULT false`,
]

export async function ensureAdminTables(pool: Pool) {
  for (const q of ADMIN_SCHEMA_QUERIES) {
    await pool.query(q)
  }
}

function adminPool() {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
}

export interface ResolvedAdmin {
  userId: string
  email: string
  role: AdminRole
  source: "env" | "profile"
  firstName: string
  lastName: string
  mustChangePassword: boolean
  totpEnrolled: boolean
}

/** Resolve admin identity + pending-security state. Env super-admins bypass pending checks. */
export async function resolveAdmin(req: Request): Promise<ResolvedAdmin | null> {
  const user = await requireUser(req)
  if (!user?.email) return null

  if (isAdminEmail(user.email)) {
    const name = (user.name || "").split(" ")
    return {
      userId: user.id,
      email: user.email,
      role: "super",
      source: "env",
      firstName: name[0] || "",
      lastName: name.slice(1).join(" ") || "",
      mustChangePassword: false,
      totpEnrolled: true,
    }
  }

  const db = adminPool()
  try {
    await ensureAdminTables(db)
    const { rows } = await db.query(`SELECT * FROM "admin_profile" WHERE "userId" = $1`, [user.id])
    const p = rows[0] as Record<string, unknown> | undefined
    if (!p) {
      await db.end()
      return null
    }
    let totpEnrolled = false
    try {
      const tf = await db.query(`SELECT id FROM "twoFactor" WHERE "userId" = $1`, [user.id])
      totpEnrolled = (tf.rows.length || 0) > 0
    } catch {
      totpEnrolled = false
    }
    await db.end()
    return {
      userId: user.id,
      email: user.email,
      role: (p.role as AdminRole) || "support",
      source: "profile",
      firstName: (p.firstName as string) || "",
      lastName: (p.lastName as string) || "",
      mustChangePassword: Boolean(p.mustChangePassword),
      totpEnrolled,
    }
  } catch {
    try {
      await db.end()
    } catch {}
    return null
  }
}

/**
 * Gate an admin endpoint by role. Profile admins with a pending password
 * change or missing 2FA get 403 with a machine-readable code (unless
 * allowPending). Env super-admins always pass.
 */
export async function requireRole(req: Request, ...allowed: AdminRole[]) {
  const admin = await resolveAdmin(req)
  if (!admin) {
    const user = await requireUser(req)
    if (!user) return { error: NextResponse.json({ error: "Not signed in" }, { status: 401 }) as NextResponse }
    return { error: NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 }) as NextResponse }
  }
  if (admin.source === "profile") {
    if (admin.mustChangePassword) {
      return {
        error: NextResponse.json(
          { error: "Password change required before admin access", code: "PASSWORD_CHANGE_REQUIRED" },
          { status: 403 }
        ) as NextResponse,
      }
    }
    if (!admin.totpEnrolled) {
      return {
        error: NextResponse.json(
          { error: "Two-factor setup required before admin access", code: "TOTP_REQUIRED" },
          { status: 403 }
        ) as NextResponse,
      }
    }
    if (!allowed.includes(admin.role)) {
      return {
        error: NextResponse.json(
          { error: `Forbidden — requires ${allowed.join(" or ")} access` },
          { status: 403 }
        ) as NextResponse,
      }
    }
  }
  return { admin }
}

/** Legacy gate: any admin role (still enforces pending password + 2FA). */
export async function requireAdmin(req: Request) {
  return requireRole(req, "super", "support", "content")
}
