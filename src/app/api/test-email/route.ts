import { NextResponse } from "next/server"
import { getResend } from "@/lib/email"

export async function GET(req: Request) {
  const to = new URL(req.url).searchParams.get("to") || process.env.BREVO_SENDER_EMAIL || ""
  if (!to) {
    return NextResponse.json(
      { success: false, error: "Pass ?to=someone@example.com" },
      { status: 400 }
    )
  }

  const subject = "Cyber Trust Nest — Test Email"
  const html =
    "<p>Congrats! <strong>Cyber Trust Nest</strong> can send email. OTP codes will use this same pipeline.</p>"

  // Same order as OTP sending: Brevo first, Resend fallback
  if (process.env.BREVO_API_KEY) {
    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          accept: "application/json",
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: {
            name: "Cyber Trust Nest",
            email: process.env.BREVO_SENDER_EMAIL || "officialaisoafrica@gmail.com",
          },
          to: [{ email: to }],
          subject,
          htmlContent: html,
        }),
      })
      if (!res.ok) {
        const body = await res.text().catch(() => "")
        throw new Error(`HTTP ${res.status}: ${body.slice(0, 300)}`)
      }
      return NextResponse.json({ success: true, via: "brevo", message: `Test email sent to ${to}` })
    } catch (error) {
      return NextResponse.json(
        { success: false, via: "brevo", error: (error as Error).message },
        { status: 500 }
      )
    }
  }

  try {
    await getResend().emails.send({
      from: "Cyber Trust Nest <onboarding@resend.dev>",
      to,
      subject,
      html,
    })
    return NextResponse.json({ success: true, via: "resend", message: `Test email sent to ${to}` })
  } catch (error) {
    return NextResponse.json({ success: false, via: "resend", error: (error as Error).message }, { status: 500 })
  }
}
