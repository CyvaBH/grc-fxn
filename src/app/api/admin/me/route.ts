import { NextResponse } from "next/server"
import { requireUser, isAdminEmail } from "@/lib/admin"

// GET /api/admin/me — { isAdmin, email } for conditional nav links
export async function GET(req: Request) {
  const user = await requireUser(req)
  if (!user) return NextResponse.json({ isAdmin: false })
  return NextResponse.json({ isAdmin: isAdminEmail(user.email), email: user.email })
}
