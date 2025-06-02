export interface Task {
  id: string
  title: string
  description?: string
  status: "todo" | "in_progress" | "completed"
  priority: "low" | "medium" | "high"
  due_date?: string
  created_at: string
  updated_at: string
  user_id: string
}

export interface User {
  id: string
  email: string
  created_at: string
}
