import { getCurrentUser } from "@/actions/auth"
import { redirect } from "next/navigation"
import TaskDashboard from "@/components/task-dashboard"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  return <TaskDashboard userId={user.id} userEmail={user.email!} />
}
