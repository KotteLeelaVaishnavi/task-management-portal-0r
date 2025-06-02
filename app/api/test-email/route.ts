import { NextResponse } from "next/server"
import { sendTaskReminderEmail } from "@/actions/email"
import type { Task } from "@/types/database"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Create sample tasks for testing with realistic data
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const sampleTasks: Task[] = [
      {
        id: "test-1",
        title: "Complete project proposal",
        description: "Finish the Q4 project proposal for the client meeting. Include budget estimates and timeline.",
        status: "todo",
        priority: "high",
        due_date: today.toISOString().split("T")[0], // Today
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: "test-user",
      },
      {
        id: "test-2",
        title: "Review team feedback",
        description: "Go through the feedback from last week's sprint review and prepare action items.",
        status: "in_progress",
        priority: "medium",
        due_date: yesterday.toISOString().split("T")[0], // Yesterday (overdue)
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: "test-user",
      },
      {
        id: "test-3",
        title: "Update documentation",
        description: "Update the API documentation with the latest changes from version 2.1.",
        status: "todo",
        priority: "low",
        due_date: tomorrow.toISOString().split("T")[0], // Tomorrow
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: "test-user",
      },
    ]

    console.log(`🧪 Sending test email to: ${email}`)
    const result = await sendTaskReminderEmail(email, sampleTasks)

    if (result.error) {
      return NextResponse.json(
        {
          error: result.error,
          details: "Failed to send email via Resend",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully via Resend!",
      emailId: result.emailId,
      tasksIncluded: sampleTasks.length,
      breakdown: {
        overdue: 1,
        dueToday: 1,
        dueTomorrow: 1,
      },
    })
  } catch (error) {
    console.error("Error sending test email:", error)
    return NextResponse.json(
      {
        error: "Failed to send test email",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
