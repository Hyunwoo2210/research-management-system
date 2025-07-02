"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Clock, AlertTriangle, CheckCircle } from "lucide-react"

interface Notification {
  id: number
  taskName: string
  projectName: string
  dueDate: string
  message: string
  isOverdue: boolean
}

interface NotificationPanelProps {
  notifications: Notification[]
  onClose: () => void
  onMarkAsRead: (taskId: number) => void
}

export function NotificationPanelComponent({ notifications, onClose, onMarkAsRead }: NotificationPanelProps) {
  const handleMarkAllAsRead = () => {
    notifications.forEach((notification) => {
      onMarkAsRead(notification.id)
    })
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">알림</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>새로운 알림이 없습니다.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">알림</CardTitle>
          <Badge variant="secondary">{notifications.length}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
            모두 읽음
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border ${
                notification.isOverdue ? "bg-red-50 border-red-200" : "bg-orange-50 border-orange-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-1 rounded-full ${notification.isOverdue ? "bg-red-100" : "bg-orange-100"}`}>
                    {notification.isOverdue ? (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-orange-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{notification.taskName}</h4>
                    <p className="text-sm text-gray-600">{notification.projectName}</p>
                    <p
                      className={`text-sm font-medium mt-1 ${
                        notification.isOverdue ? "text-red-700" : "text-orange-700"
                      }`}
                    >
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">마감일: {notification.dueDate}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkAsRead(notification.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
