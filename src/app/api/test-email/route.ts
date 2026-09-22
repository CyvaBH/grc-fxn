import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { getResend } from "@/lib/email"

export async function GET(req: Request) {
  const to = new URL(req.url).searchParams.get("to") || process.env.GMAIL_USER || ""
  if (!to) {
    return NextResponse.json(
      { success: false, error: "Pass ?to=someone@example.com" },
      { status: 400 }
    )
  }

  const subject = "Cyber Trust Nest — Test Email"
  const html =
    "<p>Congrats! <strong>Cyber Trust Nest</strong> can send email. OTP codes will use this same pipeline.</p>"

  // Same order as OTP sending: Gmail first, Resend fallback
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    try {
      const smtp = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
      })
      await smtp.sendMail({
        from: `"Cyber Trust Nest" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html,
      })
      return NextResponse.json({ success: true, via: "gmail", message: `Test email sent to ${to}` })
    } catch (error) {
      return NextResponse.json(
        { success: false, via: "gmail", error: (error as Error).message },
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
