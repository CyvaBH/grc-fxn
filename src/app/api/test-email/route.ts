import { NextResponse } from "next/server"
import { getResend } from "@/lib/email"

export async function GET() {
  try {
    const resend = getResend()

    await resend.emails.send({
      from: "Cyber Trust Nest <onboarding@resend.dev>",
      to: "balqeesthamzedu@gmail.com",
      subject: "Cyber Trust Nest — Test Email",
      html: "<p>Congrats! Your Resend API key is working. <strong>Cyber Trust Nest</strong> can now send OTP codes.</p>",
    })

    return NextResponse.json({ success: true, message: "Test email sent to balqeesthamzedu@gmail.com" })
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
