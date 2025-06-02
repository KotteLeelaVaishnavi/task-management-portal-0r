"use server"

import type { Task } from "@/types/database"
import { Resend } from "resend"

export async function sendTaskReminderEmail(userEmail: string, tasks: Task[]) {
  const resend = new Resend(process.env.RESEND_API_KEY)

  const overdueTasks = tasks.filter((task) => task.due_date && new Date(task.due_date) < new Date())
  const dueTodayTasks = tasks.filter(
    (task) => task.due_date && new Date(task.due_date).toDateString() === new Date().toDateString(),
  )
  const dueTomorrowTasks = tasks.filter((task) => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return task.due_date && new Date(task.due_date).toDateString() === tomorrow.toDateString()
  })

  const emailSubject = getEmailSubject(overdueTasks.length, dueTodayTasks.length, dueTomorrowTasks.length)
  const emailContent = generateEmailContent(overdueTasks, dueTodayTasks, dueTomorrowTasks)

  try {
    const { data, error } = await resend.emails.send({
      from: "Task Manager <noreply@taskmanager.dev>",
      to: userEmail,
      subject: emailSubject,
      html: emailContent,
    })

    if (error) {
      console.error("Error sending email:", error)
      return { error: error.message }
    }

    console.log("📧 Email sent successfully:", data?.id)
    return { success: true, emailId: data?.id }
  } catch (error) {
    console.error("Error sending email:", error)
    return { error: "Failed to send email" }
  }
}

function getEmailSubject(overdueCount: number, dueTodayCount: number, dueTomorrowCount: number): string {
  if (overdueCount > 0) {
    return `⚠️ You have ${overdueCount} overdue task${overdueCount > 1 ? "s" : ""}`
  }
  if (dueTodayCount > 0) {
    return `📅 You have ${dueTodayCount} task${dueTodayCount > 1 ? "s" : ""} due today`
  }
  return `📋 You have ${dueTomorrowCount} task${dueTomorrowCount > 1 ? "s" : ""} due tomorrow`
}

function generateEmailContent(overdueTasks: Task[], dueTodayTasks: Task[], dueTomorrowTasks: Task[]): string {
  const formatTaskList = (tasks: Task[]) =>
    tasks
      .map(
        (task) => `
      <li style="margin-bottom: 12px; padding: 12px; background-color: #f8f9fa; border-radius: 6px; border-left: 4px solid ${task.priority === "high" ? "#dc3545" : task.priority === "medium" ? "#ffc107" : "#28a745"};">
        <strong>${task.title}</strong>
        ${task.description ? `<br><span style="color: #6c757d; font-size: 14px;">${task.description}</span>` : ""}
        <br><span style="color: #6c757d; font-size: 12px;">Priority: ${task.priority} | Due: ${new Date(task.due_date!).toLocaleDateString()}</span>
      </li>
    `,
      )
      .join("")

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Task Reminder</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #4f46e5; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 24px;">📋 Task Reminder</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Stay on top of your tasks</p>
      </div>
      
      ${
        overdueTasks.length > 0
          ? `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #dc3545; border-bottom: 2px solid #dc3545; padding-bottom: 8px;">⚠️ Overdue Tasks (${overdueTasks.length})</h2>
          <ul style="list-style: none; padding: 0;">
            ${formatTaskList(overdueTasks)}
          </ul>
        </div>
      `
          : ""
      }
      
      ${
        dueTodayTasks.length > 0
          ? `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #fd7e14; border-bottom: 2px solid #fd7e14; padding-bottom: 8px;">📅 Due Today (${dueTodayTasks.length})</h2>
          <ul style="list-style: none; padding: 0;">
            ${formatTaskList(dueTodayTasks)}
          </ul>
        </div>
      `
          : ""
      }
      
      ${
        dueTomorrowTasks.length > 0
          ? `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #0d6efd; border-bottom: 2px solid #0d6efd; padding-bottom: 8px;">📋 Due Tomorrow (${dueTomorrowTasks.length})</h2>
          <ul style="list-style: none; padding: 0;">
            ${formatTaskList(dueTomorrowTasks)}
          </ul>
        </div>
      `
          : ""
      }
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin-top: 30px;">
        <p style="margin: 0 0 15px 0; color: #6c757d;">Ready to tackle your tasks?</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard" 
           style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
          Open Task Manager
        </a>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 12px;">
        <p>You're receiving this because you have tasks due soon in Task Manager.</p>
        <p>© ${new Date().getFullYear()} Task Manager. All rights reserved.</p>
      </div>
    </body>
    </html>
  `
}

export async function sendTaskCreatedEmail(userEmail: string, task: Task) {
  const resend = new Resend(process.env.RESEND_API_KEY)

  const emailContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Task Created</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #10b981; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 24px;">✅ Task Created Successfully</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Your new task has been added</p>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="margin: 0 0 10px 0; color: #1f2937;">${task.title}</h2>
        ${task.description ? `<p style="margin: 0 0 10px 0; color: #6b7280;">${task.description}</p>` : ""}
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <span style="background-color: ${task.priority === "high" ? "#fecaca" : task.priority === "medium" ? "#fef3c7" : "#d1fae5"}; 
                       color: ${task.priority === "high" ? "#991b1b" : task.priority === "medium" ? "#92400e" : "#065f46"}; 
                       padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
            ${task.priority.toUpperCase()} PRIORITY
          </span>
          ${
            task.due_date
              ? `<span style="background-color: #e5e7eb; color: #374151; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
            Due: ${new Date(task.due_date).toLocaleDateString()}
          </span>`
              : ""
          }
        </div>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
        <p style="margin: 0 0 15px 0; color: #6c757d;">Ready to get started?</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
           style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
          View Task
        </a>
      </div>
    </body>
    </html>
  `

  try {
    const { data, error } = await resend.emails.send({
      from: "Task Manager <noreply@taskmanager.dev>",
      to: userEmail,
      subject: `✅ Task Created: ${task.title}`,
      html: emailContent,
    })

    if (error) {
      console.error("Error sending task created email:", error)
      return { error: error.message }
    }

    return { success: true, emailId: data?.id }
  } catch (error) {
    console.error("Error sending task created email:", error)
    return { error: "Failed to send email" }
  }
}

export async function sendTaskCompletedEmail(userEmail: string, task: Task) {
  const resend = new Resend(process.env.RESEND_API_KEY)

  const emailContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Task Completed</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #059669; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 24px;">🎉 Congratulations!</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">You completed a task</p>
      </div>
      
      <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 20px;">
        <h2 style="margin: 0 0 10px 0; color: #1f2937;">✅ ${task.title}</h2>
        ${task.description ? `<p style="margin: 0 0 10px 0; color: #6b7280;">${task.description}</p>` : ""}
        <p style="margin: 0; color: #059669; font-weight: bold;">Status: COMPLETED</p>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
        <p style="margin: 0 0 15px 0; color: #6c757d;">Keep up the great work!</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
           style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
          View All Tasks
        </a>
      </div>
    </body>
    </html>
  `

  try {
    const { data, error } = await resend.emails.send({
      from: "Task Manager <noreply@taskmanager.dev>",
      to: userEmail,
      subject: `🎉 Task Completed: ${task.title}`,
      html: emailContent,
    })

    if (error) {
      console.error("Error sending task completed email:", error)
      return { error: error.message }
    }

    return { success: true, emailId: data?.id }
  } catch (error) {
    console.error("Error sending task completed email:", error)
    return { error: "Failed to send email" }
  }
}
