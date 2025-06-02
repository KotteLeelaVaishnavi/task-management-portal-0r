"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Clock } from "lucide-react"

interface EmailSettingsProps {
  userId: string
}

export default function EmailSettings({ userId }: EmailSettingsProps) {
  const [settings, setSettings] = useState({
    dailyReminders: true,
    overdueReminders: true,
    taskCreated: false,
    taskCompleted: true,
    reminderTime: "09:00",
  })

  const handleSave = async () => {
    // In a real app, you would save these settings to the database
    console.log("Saving email settings:", settings)
    // await saveEmailSettings(userId, settings)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="daily-reminders">Daily Reminders</Label>
              <p className="text-sm text-gray-500">Get daily emails about upcoming tasks</p>
            </div>
            <Switch
              id="daily-reminders"
              checked={settings.dailyReminders}
              onCheckedChange={(checked) => setSettings({ ...settings, dailyReminders: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="overdue-reminders">Overdue Alerts</Label>
              <p className="text-sm text-gray-500">Get notified about overdue tasks</p>
            </div>
            <Switch
              id="overdue-reminders"
              checked={settings.overdueReminders}
              onCheckedChange={(checked) => setSettings({ ...settings, overdueReminders: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="task-created">Task Created</Label>
              <p className="text-sm text-gray-500">Confirm when tasks are created</p>
            </div>
            <Switch
              id="task-created"
              checked={settings.taskCreated}
              onCheckedChange={(checked) => setSettings({ ...settings, taskCreated: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="task-completed">Task Completed</Label>
              <p className="text-sm text-gray-500">Celebrate completed tasks</p>
            </div>
            <Switch
              id="task-completed"
              checked={settings.taskCompleted}
              onCheckedChange={(checked) => setSettings({ ...settings, taskCompleted: checked })}
            />
          </div>
        </div>

        {settings.dailyReminders && (
          <div className="space-y-2">
            <Label htmlFor="reminder-time" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Reminder Time
            </Label>
            <Select
              value={settings.reminderTime}
              onValueChange={(value) => setSettings({ ...settings, reminderTime: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="07:00">7:00 AM</SelectItem>
                <SelectItem value="08:00">8:00 AM</SelectItem>
                <SelectItem value="09:00">9:00 AM</SelectItem>
                <SelectItem value="10:00">10:00 AM</SelectItem>
                <SelectItem value="18:00">6:00 PM</SelectItem>
                <SelectItem value="19:00">7:00 PM</SelectItem>
                <SelectItem value="20:00">8:00 PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <Button onClick={handleSave} className="w-full">
          Save Settings
        </Button>
      </CardContent>
    </Card>
  )
}
