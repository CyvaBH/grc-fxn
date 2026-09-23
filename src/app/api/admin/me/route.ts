import { NextResponse } from "next/server"
import { resolveAdmin } from "@/lib/admin"

// GET /api/admin/me — identity + role + pending-security state for nav gating
export async function GET(req: Request) {
  const admin = await resolveAdmin(req)
  if (!admin) {
    const { requireUser } = await import("@/lib/admin")
    const user = await requireUser(req)
    if (!user) return NextResponse.json({ isAdmin: false })
    return NextResponse.json({ isAdmin: false })
  }
  return NextResponse.json({
    isAdmin: true,
    email: admin.email,
    role: admin.role,
    source: admin.source,
    firstName: admin.firstName,
    lastName: admin.lastName,
    mustChangePassword: admin.mustChangePassword,
    totpEnrolled: admin.totpEnrolled,
  })
}
