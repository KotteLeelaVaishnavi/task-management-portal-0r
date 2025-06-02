"use server"

import { createServerClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import type { Task } from "@/types/database"
import { sendTaskReminderEmail, sendTaskCreatedEmail, sendTaskCompletedEmail } from "./email"

export async function createTask(formData: FormData) {
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const priority = formData.get("priority") as "low" | "medium" | "high"
  const due_date = formData.get("due_date") as string
  const user_id = formData.get("user_id") as string

  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title,
      description: description || null,
      priority,
      due_date: due_date || null,
      status: "todo",
      user_id,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Get user email for notification
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user?.email) {
    // Send task created email (optional - could be controlled by user settings)
    await sendTaskCreatedEmail(user.email, data as Task)
  }

  revalidatePath("/dashboard")
  return { success: true }
}

export async function updateTaskStatus(taskId: string, status: Task["status"]) {
  const supabase = createServerClient()

  // Get the task and user info before updating
  const { data: task } = await supabase.from("tasks").select("*").eq("id", taskId).single()

  const { error } = await supabase
    .from("tasks")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)

  if (error) {
    return { error: error.message }
  }

  // Send completion email if task was completed
  if (status === "completed" && task) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user?.email) {
      await sendTaskCompletedEmail(user.email, task as Task)
    }
  }

  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteTask(taskId: string) {
  const supabase = createServerClient()

  const { error } = await supabase.from("tasks").delete().eq("id", taskId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  return { success: true }
}

export async function getTasks(userId: string, status?: Task["status"]) {
  const supabase = createServerClient()

  let query = supabase.from("tasks").select("*").eq("user_id", userId).order("created_at", { ascending: false })

  if (status) {
    query = query.eq("status", status)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return data as Task[]
}

export async function checkAndSendTaskReminders() {
  const supabase = createServerClient()

  // Get tasks due today or tomorrow that haven't been completed
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const { data: dueTasks, error } = await supabase
    .from("tasks")
    .select("*")
    .lte("due_date", tomorrow.toISOString().split("T")[0])
    .neq("status", "completed")

  if (error) {
    console.error("Error fetching due tasks:", error)
    return { error: error.message }
  }

  // Group tasks by user_id
  const tasksByUserId = dueTasks.reduce(
    (acc, task) => {
      if (!acc[task.user_id]) {
        acc[task.user_id] = []
      }
      acc[task.user_id].push(task)
      return acc
    },
    {} as Record<string, Task[]>,
  )

  let emailsSent = 0

  // Send emails to each user
  for (const [userId, tasks] of Object.entries(tasksByUserId)) {
    try {
      // Get user email from auth
      const {
        data: { user },
      } = await supabase.auth.admin.getUserById(userId)

      if (user?.email) {
        await sendTaskReminderEmail(user.email, tasks)
        emailsSent++
      }
    } catch (error) {
      console.error(`Error sending email to user ${userId}:`, error)
    }
  }

  return { success: true, emailsSent }
}
