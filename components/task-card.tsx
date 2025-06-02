"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Calendar, Flag, Clock } from "lucide-react"
import { updateTaskStatus, deleteTask } from "@/actions/tasks"
import type { Task } from "@/types/database"

interface TaskCardProps {
  task: Task
}

export default function TaskCard({ task }: TaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (newStatus: Task["status"]) => {
    setIsUpdating(true)
    await updateTaskStatus(task.id, newStatus)
    setIsUpdating(false)
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this task?")) {
      setIsUpdating(true)
      await deleteTask(task.id)
      setIsUpdating(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "todo":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed"

  return (
    <Card className={`w-full transition-all hover:shadow-md ${task.status === "completed" ? "opacity-75" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className={`text-lg ${task.status === "completed" ? "line-through text-gray-500" : ""}`}>
            {task.title}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isUpdating}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge className={getPriorityColor(task.priority)}>
            <Flag className="h-3 w-3 mr-1" />
            {task.priority}
          </Badge>
          <Badge className={getStatusColor(task.status)}>{task.status.replace("_", " ")}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {task.description && <p className="text-sm text-gray-600 leading-relaxed">{task.description}</p>}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Created {formatDate(task.created_at)}
          </div>
        </div>

        {task.due_date && (
          <div className={`flex items-center text-sm ${isOverdue ? "text-red-600" : "text-gray-500"}`}>
            <Calendar className="h-4 w-4 mr-1" />
            Due: {formatDate(task.due_date)}
            {isOverdue && <span className="ml-2 text-xs font-medium">(Overdue)</span>}
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {task.status !== "todo" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange("todo")}
              disabled={isUpdating}
              className="text-xs"
            >
              To Do
            </Button>
          )}
          {task.status !== "in_progress" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange("in_progress")}
              disabled={isUpdating}
              className="text-xs"
            >
              In Progress
            </Button>
          )}
          {task.status !== "completed" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange("completed")}
              disabled={isUpdating}
              className="text-xs"
            >
              Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
