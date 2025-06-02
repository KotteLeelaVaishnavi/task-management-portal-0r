"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function TestEmailButton() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    type: "success" | "error" | null
    message: string
    details?: any
  }>({ type: null, message: "" })

  const handleSendTest = async () => {
    if (!email) {
      setResult({
        type: "error",
        message: "Please enter an email address",
      })
      return
    }

    setIsLoading(true)
    setResult({ type: null, message: "" })

    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setResult({
          type: "success",
          message: "✅ Test email sent successfully!",
          details: data,
        })
      } else {
        setResult({
          type: "error",
          message: `❌ Failed to send: ${data.error}`,
          details: data.details,
        })
      }
    } catch (error) {
      setResult({
        type: "error",
        message: "❌ Network error - please try again",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Test Email Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-email">Email Address</Label>
          <Input
            id="test-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <Button onClick={handleSendTest} disabled={isLoading || !email} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending via Resend...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Test Email
            </>
          )}
        </Button>

        {result.type && (
          <div
            className={`text-sm p-4 rounded-md border ${
              result.type === "success"
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            <div className="flex items-start gap-2">
              {result.type === "success" ? (
                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="font-medium">{result.message}</p>
                {result.details && result.type === "success" && (
                  <div className="mt-2 text-xs space-y-1">
                    <p>📧 Email ID: {result.details.emailId}</p>
                    <p>📋 Sample tasks: {result.details.tasksIncluded}</p>
                    <p>⚠️ Overdue: {result.details.breakdown?.overdue}</p>
                    <p>📅 Due today: {result.details.breakdown?.dueToday}</p>
                    <p>📋 Due tomorrow: {result.details.breakdown?.dueTomorrow}</p>
                  </div>
                )}
                {result.details && result.type === "error" && <p className="mt-1 text-xs">{result.details}</p>}
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-2">
          <p>This will send a sample email with 3 test tasks:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>1 overdue task (high priority)</li>
            <li>1 task due today (medium priority)</li>
            <li>1 task due tomorrow (low priority)</li>
          </ul>
          <p className="font-medium">Check your inbox and spam folder!</p>
        </div>
      </CardContent>
    </Card>
  )
}
