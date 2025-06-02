import { getCurrentUser } from "@/actions/auth"
import { redirect } from "next/navigation"
import AuthForm from "@/components/auth-form"

export default async function HomePage() {
  const user = await getCurrentUser()

  if (user) {
    redirect("/dashboard")
  }

  return <AuthForm />
}
