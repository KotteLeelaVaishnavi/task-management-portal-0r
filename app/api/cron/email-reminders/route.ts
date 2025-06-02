import { checkAndSendTaskReminders } from "@/actions/tasks"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  // Verify the request is from a cron job (in production, you'd check authorization)
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await checkAndSendTaskReminders()

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Email reminders sent to ${result.emailsSent} users`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in email reminder cron job:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// For testing purposes, allow POST requests too
export async function POST() {
  try {
    const result = await checkAndSendTaskReminders()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error sending test reminders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
