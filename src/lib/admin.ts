import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

/** Comma-separated admin emails, e.g. ADMIN_EMAILS="you@company.com,teammate@company.com" */
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

export async function requireAdmin(req: Request) {
  const user = await requireUser(req)
  if (!user) {
    return { error: NextResponse.json({ error: "Not signed in" }, { status: 401 }) as NextResponse }
  }
  if (!isAdminEmail(user.email)) {
    return { error: NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 }) as NextResponse }
  }
  return { user }
}
