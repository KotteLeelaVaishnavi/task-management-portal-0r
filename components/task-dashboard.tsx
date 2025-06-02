"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Filter, Search, CheckCircle, Clock, AlertCircle, Mail, Send } from "lucide-react"
import { getTasks, checkAndSendTaskReminders } from "@/actions/tasks"
import { signOut } from "@/actions/auth"
import TaskCard from "./task-card"
import CreateTaskForm from "./create-task-form"
import type { Task } from "@/types/database"
import EmailSettings from "./email-settings"
import TestEmailButton from "./test-email-button"

interface TaskDashboardProps {
  userId: string
  userEmail: string
}

export default function TaskDashboard({ userId, userEmail }: TaskDashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [activeFilter, setActiveFilter] = useState<Task["status"] | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showEmailSettings, setShowEmailSettings] = useState(false)
  const [showTestEmail, setShowTestEmail] = useState(false)

  useEffect(() => {
    loadTasks()
  }, [])

  useEffect(() => {
    let filtered = tasks

    // Filter by status
    if (activeFilter !== "all") {
      filtered = filtered.filter((task) => task.status === activeFilter)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredTasks(filtered)
  }, [tasks, activeFilter, searchQuery])

  const loadTasks = async () => {
    try {
      const data = await getTasks(userId)
      setTasks(data)
    } catch (error) {
      console.error("Error loading tasks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendTestReminder = async () => {
    const result = await checkAndSendTaskReminders()
    if (result.success) {
      alert(`Test reminder sent! ${result.emailsSent} emails would be sent.`)
    } else {
      alert("Error sending test reminder")
    }
  }

  const getTaskCounts = () => {
    return {
      all: tasks.length,
      todo: tasks.filter((t) => t.status === "todo").length,
      in_progress: tasks.filter((t) => t.status === "in_progress").length,
      completed: tasks.filter((t) => t.status === "completed").length,
    }
  }

  const getOverdueTasks = () => {
    const today = new Date()
    return tasks.filter((task) => task.due_date && new Date(task.due_date) < today && task.status !== "completed")
      .length
  }

  const counts = getTaskCounts()
  const overdueCount = getOverdueTasks()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
              <p className="text-sm text-gray-500">{userEmail}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
              <Button variant="outline" onClick={() => setShowEmailSettings(true)}>
                <Mail className="h-4 w-4 mr-2" />
                Email Settings
              </Button>
              <Button variant="outline" onClick={() => setShowTestEmail(true)}>
                <Send className="h-4 w-4 mr-2" />
                Test Email
              </Button>
              <form action={signOut}>
                <Button variant="outline" type="submit">
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{counts.completed}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{counts.in_progress}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-gray-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">To Do</p>
                <p className="text-2xl font-bold text-gray-900">{counts.todo}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">{overdueCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={activeFilter === "all" ? "default" : "outline"}
                  onClick={() => setActiveFilter("all")}
                  size="sm"
                  className="gap-2"
                >
                  All
                  <Badge variant="secondary">{counts.all}</Badge>
                </Button>
                <Button
                  variant={activeFilter === "todo" ? "default" : "outline"}
                  onClick={() => setActiveFilter("todo")}
                  size="sm"
                  className="gap-2"
                >
                  To Do
                  <Badge variant="secondary">{counts.todo}</Badge>
                </Button>
                <Button
                  variant={activeFilter === "in_progress" ? "default" : "outline"}
                  onClick={() => setActiveFilter("in_progress")}
                  size="sm"
                  className="gap-2"
                >
                  In Progress
                  <Badge variant="secondary">{counts.in_progress}</Badge>
                </Button>
                <Button
                  variant={activeFilter === "completed" ? "default" : "outline"}
                  onClick={() => setActiveFilter("completed")}
                  size="sm"
                  className="gap-2"
                >
                  Completed
                  <Badge variant="secondary">{counts.completed}</Badge>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <div className="max-w-md mx-auto">
              <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery
                  ? "No tasks found"
                  : activeFilter === "all"
                    ? "No tasks yet"
                    : `No ${activeFilter.replace("_", " ")} tasks`}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery ? "Try adjusting your search terms" : "Get started by creating your first task"}
              </p>
              {!searchQuery && (
                <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Task
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </main>

      {/* Create Task Modal */}
      {showCreateForm && (
        <CreateTaskForm
          userId={userId}
          onClose={() => {
            setShowCreateForm(false)
            loadTasks()
          }}
        />
      )}

      {/* Email Settings Modal */}
      {showEmailSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="relative">
            <EmailSettings userId={userId} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEmailSettings(false)}
              className="absolute -top-2 -right-2 bg-white shadow-md"
            >
              ✕
            </Button>
          </div>
        </div>
      )}

      {/* Test Email Modal */}
      {showTestEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="relative">
            <TestEmailButton />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTestEmail(false)}
              className="absolute -top-2 -right-2 bg-white shadow-md"
            >
              ✕
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
