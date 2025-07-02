"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle,
  Bell,
  FileText,
  ImageIcon,
  Video,
  Music,
  Archive,
} from "lucide-react"
import Link from "next/link"
import { NotificationPanelComponent } from "@/components/notification-panel"
import { PaperDialog } from "@/components/paper-dialog"
import { ExpertDialog } from "@/components/expert-dialog"
import { MaterialDialog } from "@/components/material-dialog"
import { toast } from "@/components/ui/use-toast"

// 타입 정의
interface Project {
  id: number;
  projectName: string;
  description: string;
  createdAt: string;
  tasks?: Task[];
  papers?: Paper[];
  experts?: Expert[];
  materials?: Material[];
}

interface Task {
  id: number;
  projectId: number;
  taskName: string;
  description: string;
  dueDate: string;
  status: string;
  createdAt: string;
  notifications: boolean;
  notificationTiming: string;
}

interface Paper {
  id: number;
  title: string;
  authors: string;
  year: number;
  publisher: string;
  filePath: string;
  fileName: string;
  fileSize: string;
  notes: string;
  createdAt: string;
  projectIds: number[];
}

interface Expert {
  id: number;
  name: string;
  affiliation: string;
  expertise: string;
  email: string;
  phone: string;
  notes: string;
  filePath: string;
  fileName: string;
  fileSize: string;
  projectIds: number[];
  createdAt: string;
}

interface Material {
  id: number;
  title: string;
  description: string;
  fileType: string;
  filePath: string;
  fileName: string;
  fileSize: string;
  tags: string[];
  projectIds: number[];
  createdAt: string;
}

interface Notification {
  id: number;
  taskName: string;
  projectName: string;
  dueDate: string;
  message: string;
  isOverdue: boolean;
}

interface ProjectDialogProps {
  project: Project | null;
  onSave: (data: Partial<Project>) => void;
  onClose: () => void;
}

function ProjectDialog({ project, onSave, onClose }: ProjectDialogProps) {
  const [projectName, setProjectName] = useState(project?.projectName || "")
  const [description, setDescription] = useState(project?.description || "")

  const handleSave = () => {
    if (!projectName.trim()) return

    onSave({
      projectName: projectName.trim(),
      description: description.trim(),
    })
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{project ? "프로젝트 수정" : "새 프로젝트 추가"}</DialogTitle>
        <DialogDescription>연구 프로젝트의 기본 정보를 입력하세요.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label htmlFor="projectName">프로젝트명 *</Label>
          <Input
            id="projectName"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="프로젝트명을 입력하세요"
          />
        </div>
        <div>
          <Label htmlFor="description">설명</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="프로젝트에 대한 간단한 설명을 입력하세요"
            rows={3}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          취소
        </Button>
        <Button onClick={handleSave} disabled={!projectName.trim()}>
          {project ? "수정" : "추가"}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

interface TaskDialogProps {
  task: Task | null;
  projects: Project[];
  onSave: (data: Partial<Task>) => void;
  onClose: () => void;
}

function TaskDialog({ task, projects, onSave, onClose }: TaskDialogProps) {
  const [projectId, setProjectId] = useState(task?.projectId?.toString() || "")
  const [taskName, setTaskName] = useState(task?.taskName || "")
  const [description, setDescription] = useState(task?.description || "")
  const [dueDate, setDueDate] = useState(task?.dueDate || "")
  const [notifications, setNotifications] = useState(task?.notifications ?? true)
  const [notificationTiming, setNotificationTiming] = useState(task?.notificationTiming || "1day")

  const notificationOptions = [
    { value: "1day", label: "1일 전" },
    { value: "3days", label: "3일 전" },
    { value: "1week", label: "1주일 전" },
    { value: "1month", label: "1개월 전" },
  ]

  const handleSave = () => {
    if (!projectId || !taskName.trim() || !dueDate) return

    onSave({
      projectId: Number.parseInt(projectId),
      taskName: taskName.trim(),
      description: description.trim(),
      dueDate: dueDate,
      notifications: notifications,
      notificationTiming: notificationTiming,
    })
  }

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>{task ? "작업 수정" : "새 작업 추가"}</DialogTitle>
        <DialogDescription>프로젝트의 세부 작업을 추가하세요.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label htmlFor="project">프로젝트 *</Label>
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger>
              <SelectValue placeholder="프로젝트를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id.toString()}>
                  {project.projectName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="taskName">작업명 *</Label>
          <Input
            id="taskName"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="작업명을 입력하세요"
          />
        </div>
        <div>
          <Label htmlFor="description">설명</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="작업에 대한 상세 설명을 입력하세요"
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor="dueDate">마감일 *</Label>
          <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>

        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications" className="text-sm font-medium">
              알림 설정
            </Label>
            <div className="flex items-center space-x-2">
              <input
                id="notifications"
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">알림 받기</span>
            </div>
          </div>

          {notifications && (
            <div>
              <Label htmlFor="notificationTiming" className="text-sm">
                알림 시기
              </Label>
              <Select value={notificationTiming} onValueChange={setNotificationTiming}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {notificationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          취소
        </Button>
        <Button onClick={handleSave} disabled={!projectId || !taskName.trim() || !dueDate}>
          {task ? "수정" : "추가"}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

export default function SchedulePage() {
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [selectedProject, setSelectedProject] = useState("")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [selectedProjectForPaper, setSelectedProjectForPaper] = useState<number | null>(null)
  const [isPaperDialogOpen, setIsPaperDialogOpen] = useState(false)
  const [selectedProjectForExpert, setSelectedProjectForExpert] = useState<number | null>(null)
  const [isExpertDialogOpen, setIsExpertDialogOpen] = useState(false)
  const [editingExpert, setEditingExpert] = useState<Expert | null>(null)
  const [selectedProjectForMaterial, setSelectedProjectForMaterial] = useState<number | null>(null)
  const [isMaterialDialogOpen, setIsMaterialDialogOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 실제 데이터 상태
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [papers, setPapers] = useState<Paper[]>([])
  const [experts, setExperts] = useState<Expert[]>([])
  const [materials, setMaterials] = useState<Material[]>([])

  // 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // 프로젝트 데이터 가져오기
        const projectsResponse = await fetch('/api/projects')
        if (!projectsResponse.ok) throw new Error('프로젝트를 불러오는데 실패했습니다')
        const projectsData = await projectsResponse.json()
        setProjects(projectsData)

        // 태스크 데이터 가져오기
        const tasksResponse = await fetch('/api/tasks')
        if (!tasksResponse.ok) throw new Error('태스크를 불러오는데 실패했습니다')
        const tasksData = await tasksResponse.json()
        setTasks(tasksData)

        // 논문 데이터 가져오기
        const papersResponse = await fetch('/api/papers')
        if (!papersResponse.ok) throw new Error('논문을 불러오는데 실패했습니다')
        const papersData = await papersResponse.json()
        setPapers(papersData)

        // 전문가 데이터와 자료 데이터도 필요하다면 추가로 로드
        // (현재 API가 구현되어 있다고 가정)
        // ...
        
        setError(null)
      } catch (err) {
        console.error('데이터 로딩 오류:', err)
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
        toast({
          title: "오류 발생",
          description: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다',
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const getTasksByProject = (projectId: number) => {
    return tasks.filter((task) => task.projectId === projectId)
  }

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTaskStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "완료"
      case "in-progress":
        return "진행중"
      case "pending":
        return "대기"
      default:
        return "대기"
    }
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  const handleSaveProject = async (projectData: Partial<Project>) => {
    try {
      if (editingProject) {
        // 프로젝트 업데이트
        const response = await fetch(`/api/projects/${editingProject.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectData)
        })
        
        if (!response.ok) throw new Error('프로젝트 업데이트에 실패했습니다')
        
        const updatedProject = await response.json()
        setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p))
        toast({ title: "성공", description: "프로젝트가 업데이트되었습니다" })
      } else {
        // 새 프로젝트 생성
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectData)
        })
        
        if (!response.ok) throw new Error('프로젝트 생성에 실패했습니다')
        
        const newProject = await response.json()
        setProjects([...projects, newProject])
        toast({ title: "성공", description: "새 프로젝트가 생성되었습니다" })
      }
      
      setIsProjectDialogOpen(false)
      setEditingProject(null)
    } catch (err) {
      console.error('프로젝트 저장 오류:', err)
      toast({
        title: "오류 발생",
        description: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다',
        variant: "destructive",
      })
    }
  }

  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      if (editingTask) {
        // 태스크 업데이트
        const response = await fetch(`/api/tasks/${editingTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        })
        
        if (!response.ok) throw new Error('태스크 업데이트에 실패했습니다')
        
        const updatedTask = await response.json()
        setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t))
        toast({ title: "성공", description: "태스크가 업데이트되었습니다" })
      } else {
        // 새 태스크 생성
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        })
        
        if (!response.ok) throw new Error('태스크 생성에 실패했습니다')
        
        const newTask = await response.json()
        setTasks([...tasks, newTask])
        toast({ title: "성공", description: "새 태스크가 생성되었습니다" })
      }
      
      setIsTaskDialogOpen(false)
      setEditingTask(null)
    } catch (err) {
      console.error('태스크 저장 오류:', err)
      toast({
        title: "오류 발생",
        description: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다',
        variant: "destructive",
      })
    }
  }

  const handleDeleteProject = async (id: number) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('프로젝트 삭제에 실패했습니다')
      
      setProjects(projects.filter(p => p.id !== id))
      toast({ title: "성공", description: "프로젝트가 삭제되었습니다" })
    } catch (err) {
      console.error('프로젝트 삭제 오류:', err)
      toast({
        title: "오류 발생",
        description: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다',
        variant: "destructive",
      })
    }
  }

  const handleDeleteTask = async (id: number) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('태스크 삭제에 실패했습니다')
      
      setTasks(tasks.filter(t => t.id !== id))
      toast({ title: "성공", description: "태스크가 삭제되었습니다" })
    } catch (err) {
      console.error('태스크 삭제 오류:', err)
      toast({
        title: "오류 발생",
        description: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다',
        variant: "destructive",
      })
    }
  }

  const toggleTaskStatus = async (taskId: number) => {
    try {
      const task = tasks.find(t => t.id === taskId)
      if (!task) return
      
      let newStatus
      if (task.status === "pending") newStatus = "in-progress"
      else if (task.status === "in-progress") newStatus = "completed"
      else newStatus = "pending"
      
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, status: newStatus })
      })
      
      if (!response.ok) throw new Error('태스크 상태 변경에 실패했습니다')
      
      const updatedTask = await response.json()
      setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t))
    } catch (err) {
      console.error('태스크 상태 변경 오류:', err)
      toast({
        title: "오류 발생",
        description: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다',
        variant: "destructive",
      })
    }
  }

  const generateNotifications = () => {
    const now = new Date()
    const activeNotifications: Notification[] = []

    tasks.forEach((task) => {
      if (!task.notifications || task.status === "completed") return

      const dueDate = new Date(task.dueDate)
      const timeDiff = dueDate.getTime() - now.getTime()
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))

      let shouldNotify = false
      let notificationMessage = ""

      switch (task.notificationTiming) {
        case "1day":
          if (daysDiff <= 1 && daysDiff >= 0) {
            shouldNotify = true
            notificationMessage = daysDiff === 0 ? "오늘이 마감일입니다!" : "내일이 마감일입니다!"
          }
          break
        case "3days":
          if (daysDiff <= 3 && daysDiff >= 0) {
            shouldNotify = true
            notificationMessage = `${daysDiff}일 후 마감입니다!`
          }
          break
        case "1week":
          if (daysDiff <= 7 && daysDiff >= 0) {
            shouldNotify = true
            notificationMessage = `${daysDiff}일 후 마감입니다!`
          }
          break
        case "1month":
          if (daysDiff <= 30 && daysDiff >= 0) {
            shouldNotify = true
            notificationMessage = `${daysDiff}일 후 마감입니다!`
          }
          break
      }

      if (shouldNotify) {
        const project = projects.find((p) => p.id === task.projectId)
        activeNotifications.push({
          id: task.id,
          taskName: task.taskName,
          projectName: project?.projectName || "알 수 없는 프로젝트",
          dueDate: task.dueDate,
          message: notificationMessage,
          isOverdue: daysDiff < 0,
        })
      }
    })

    setNotifications(activeNotifications)
  }

  useEffect(() => {
    generateNotifications()
    const interval = setInterval(generateNotifications, 60000) // 1분마다 체크
    return () => clearInterval(interval)
  }, [tasks, projects])

  const getProjectPapers = (projectId: number) => {
    return papers.filter((paper) => paper.projectIds && paper.projectIds.includes(projectId))
  }

  const handleSavePaperToProject = (paperData: Partial<Paper>) => {
    if (!selectedProjectForPaper) return;
    
    const newPaper = {
      id: Date.now(),
      title: "",
      authors: "",
      year: 0,
      publisher: "",
      filePath: "",
      fileName: "",
      fileSize: "",
      notes: "",
      ...paperData,
      projectIds: [selectedProjectForPaper],
      createdAt: new Date().toISOString().split("T")[0],
    } as Paper;
    
    setPapers([...papers, newPaper])
    setIsPaperDialogOpen(false)
    setSelectedProjectForPaper(null)
  }

  const handleRemovePaperFromProject = (paperId: number, projectId: number) => {
    setPapers(
      papers.map((paper) => {
        if (paper.id === paperId) {
          return {
            ...paper,
            projectIds: paper.projectIds.filter((id) => id !== projectId),
          }
        }
        return paper
      }),
    )
  }

  const getProjectExperts = (projectId: number) => {
    return experts.filter((expert) => expert.projectIds && expert.projectIds.includes(projectId))
  }

  const handleSaveExpertToProject = (expertData: Partial<Expert>) => {
    if (editingExpert) {
      setExperts(experts.map((expert) => (expert.id === editingExpert.id ? { ...expert, ...expertData } : expert)))
    } else {
      if (!selectedProjectForExpert) return;
      
      const newExpert = {
        id: Date.now(),
        name: "",
        affiliation: "",
        expertise: "",
        email: "",
        phone: "",
        notes: "",
        filePath: "",
        fileName: "",
        fileSize: "",
        ...expertData,
        projectIds: [selectedProjectForExpert],
        createdAt: new Date().toISOString().split("T")[0],
      } as Expert;
      
      setExperts([...experts, newExpert])
    }
    setIsExpertDialogOpen(false)
    setSelectedProjectForExpert(null)
    setEditingExpert(null)
  }

  const handleRemoveExpertFromProject = (expertId: number, projectId: number) => {
    setExperts(
      experts.map((expert) => {
        if (expert.id === expertId) {
          return {
            ...expert,
            projectIds: expert.projectIds.filter((id) => id !== projectId),
          }
        }
        return expert
      }),
    )
  }

  const getProjectMaterials = (projectId: number) => {
    return materials.filter((material) => material.projectIds && material.projectIds.includes(projectId))
  }

  const handleSaveMaterialToProject = (materialData: Partial<Material>) => {
    if (editingMaterial) {
      setMaterials(
        materials.map((material) => (material.id === editingMaterial.id ? { ...material, ...materialData } : material)),
      )
    } else {
      if (!selectedProjectForMaterial) return;
      
      const newMaterial = {
        id: Date.now(),
        title: "",
        description: "",
        fileType: "",
        filePath: "",
        fileName: "",
        fileSize: "",
        tags: [],
        ...materialData,
        projectIds: [selectedProjectForMaterial],
        createdAt: new Date().toISOString().split("T")[0],
      } as Material;
      
      setMaterials([...materials, newMaterial])
    }
    setIsMaterialDialogOpen(false)
    setSelectedProjectForMaterial(null)
    setEditingMaterial(null)
  }

  const handleRemoveMaterialFromProject = (materialId: number, projectId: number) => {
    setMaterials(
      materials.map((material) => {
        if (material.id === materialId) {
          return {
            ...material,
            projectIds: material.projectIds.filter((id) => id !== projectId),
          }
        }
        return material
      }),
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm mb-2 block">
                ← 대시보드로 돌아가기
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">프로젝트/일정 관리</h1>
              <p className="text-gray-600 mt-1">연구 프로젝트와 일정을 체계적으로 관리하세요</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNotifications(!showNotifications)} className="relative">
                <Bell className="w-4 h-4 mr-2" />
                알림
                {notifications.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 px-1 min-w-[1.25rem] h-5">{notifications.length}</Badge>
                )}
              </Button>
              <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={() => setEditingTask(null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    작업 추가
                  </Button>
                </DialogTrigger>
                <TaskDialog
                  task={editingTask}
                  projects={projects}
                  onSave={handleSaveTask}
                  onClose={() => {
                    setIsTaskDialogOpen(false)
                    setEditingTask(null)
                  }}
                />
              </Dialog>
              <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingProject(null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    프로젝트 추가
                  </Button>
                </DialogTrigger>
                <ProjectDialog
                  project={editingProject}
                  onSave={handleSaveProject}
                  onClose={() => {
                    setIsProjectDialogOpen(false)
                    setEditingProject(null)
                  }}
                />
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {showNotifications && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <NotificationPanelComponent
              notifications={notifications}
              onClose={() => setShowNotifications(false)}
              onMarkAsRead={(taskId) => {
                setNotifications(notifications.filter((n) => n.id !== taskId))
              }}
            />
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {projects.map((project) => {
            const projectTasks = getTasksByProject(project.id)
            const completedTasks = projectTasks.filter((task) => task.status === "completed").length
            const totalTasks = projectTasks.length

            return (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{project.projectName}</CardTitle>
                      <CardDescription className="mt-1">{project.description}</CardDescription>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>생성일: {project.createdAt}</span>
                        <span>
                          진행률: {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% (
                          {completedTasks}/{totalTasks})
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingProject(project)
                          setIsProjectDialogOpen(true)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteProject(project.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {projectTasks.length > 0 ? (
                    <div className="space-y-3">
                      {projectTasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3 flex-1">
                            <Button variant="ghost" size="sm" onClick={() => toggleTaskStatus(task.id)} className="p-1">
                              {task.status === "completed" ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                              )}
                            </Button>
                            <div className="flex-1">
                              <h4
                                className={`font-medium ${task.status === "completed" ? "line-through text-gray-500" : ""}`}
                              >
                                {task.taskName}
                              </h4>
                              <p className="text-sm text-gray-600">{task.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={getTaskStatusColor(task.status)}>
                                  {getTaskStatusText(task.status)}
                                </Badge>
                                {task.notifications && (
                                  <div className="flex items-center text-xs text-blue-600">
                                    <Bell className="w-3 h-3 mr-1" />
                                    <span>
                                      {task.notificationTiming === "1day"
                                        ? "1일전"
                                        : task.notificationTiming === "3days"
                                          ? "3일전"
                                          : task.notificationTiming === "1week"
                                            ? "1주일전"
                                            : task.notificationTiming === "1month"
                                              ? "1개월전"
                                              : "알림"}
                                    </span>
                                  </div>
                                )}
                                <div
                                  className={`flex items-center text-xs ${isOverdue(task.dueDate) && task.status !== "completed" ? "text-red-600" : "text-gray-500"}`}
                                >
                                  {isOverdue(task.dueDate) && task.status !== "completed" ? (
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                  ) : (
                                    <Clock className="w-3 h-3 mr-1" />
                                  )}
                                  {task.dueDate}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingTask(task)
                                setIsTaskDialogOpen(true)
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>아직 작업이 없습니다.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 bg-transparent"
                        onClick={() => {
                          setEditingTask({
                            id: 0,
                            projectId: project.id,
                            taskName: "",
                            description: "",
                            dueDate: "",
                            status: "pending",
                            createdAt: new Date().toISOString().split("T")[0],
                            notifications: true,
                            notificationTiming: "1day"
                          })
                          setIsTaskDialogOpen(true)
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />첫 작업 추가
                      </Button>
                    </div>
                  )}
                  {/* 관련 자료 섹션 추가 */}
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-900">관련 자료</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProjectForMaterial(project.id)
                          setEditingMaterial(null)
                          setIsMaterialDialogOpen(true)
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        자료 추가
                      </Button>
                    </div>
                    {getProjectMaterials(project.id).length > 0 ? (
                      <div className="space-y-2">
                        {getProjectMaterials(project.id)
                          .slice(0, 3)
                          .map((material) => {
                            const fileTypeInfo = [
                              { value: "document", label: "문서", icon: FileText },
                              { value: "image", label: "이미지", icon: ImageIcon },
                              { value: "video", label: "비디오", icon: Video },
                              { value: "audio", label: "오디오", icon: Music },
                              { value: "archive", label: "압축파일", icon: Archive },
                              { value: "other", label: "기타", icon: FileText },
                            ].find((t) => t.value === material.fileType) || { icon: FileText }
                            const Icon = fileTypeInfo.icon

                            return (
                              <div
                                key={material.id}
                                className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200"
                              >
                                <div className="flex items-start gap-3 flex-1">
                                  <div className="p-1 bg-purple-100 rounded">
                                    <Icon className="w-4 h-4 text-purple-600" />
                                  </div>
                                  <div className="flex-1">
                                    <span className="font-medium text-purple-900">{material.title}</span>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-purple-700">
                                      <span>{material.fileName}</span>
                                      {material.fileSize && <span>({material.fileSize})</span>}
                                    </div>
                                    {material.tags && material.tags.length > 0 && (
                                      <div className="flex gap-1 mt-1">
                                        {material.tags.slice(0, 3).map((tag) => (
                                          <span
                                            key={tag}
                                            className="text-xs bg-purple-100 text-purple-700 px-1 py-0.5 rounded"
                                          >
                                            {tag}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingMaterial(material)
                                      setSelectedProjectForMaterial(project.id)
                                      setIsMaterialDialogOpen(true)
                                    }}
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveMaterialFromProject(material.id, project.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            )
                          })}
                        {getProjectMaterials(project.id).length > 3 && (
                          <p className="text-xs text-gray-500">
                            +{getProjectMaterials(project.id).length - 3}개 더 보기
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">아직 추가된 관련 자료가 없습니다.</p>
                    )}
                  </div>
                  {/* 기존 작업 목록 다음에 참고문헌 섹션 추가 */}
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-900">참고문헌</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProjectForPaper(project.id)
                          setIsPaperDialogOpen(true)
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        문헌 추가
                      </Button>
                    </div>
                    {getProjectPapers(project.id).length > 0 ? (
                      <div className="space-y-2">
                        {getProjectPapers(project.id)
                          .slice(0, 3)
                          .map((paper) => (
                            <div
                              key={paper.id}
                              className="flex items-center justify-between p-2 bg-blue-50 rounded text-sm"
                            >
                              <div>
                                <span className="font-medium">{paper.title}</span>
                                <span className="text-gray-600 ml-2">({paper.year})</span>
                                {paper.fileName && (
                                  <div className="text-xs text-blue-600 mt-1">
                                    📄 {paper.fileName} {paper.fileSize && `(${paper.fileSize})`}
                                  </div>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemovePaperFromProject(paper.id, project.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        {getProjectPapers(project.id).length > 3 && (
                          <p className="text-xs text-gray-500">+{getProjectPapers(project.id).length - 3}개 더 보기</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">아직 추가된 참고문헌이 없습니다.</p>
                    )}
                  </div>
                  {/* 참고문헌 섹션 다음에 전문가 섹션 추가 */}
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-900">전문가 리스트</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProjectForExpert(project.id)
                          setEditingExpert(null)
                          setIsExpertDialogOpen(true)
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        전문가 추가
                      </Button>
                    </div>
                    {getProjectExperts(project.id).length > 0 ? (
                      <div className="space-y-3">
                        {getProjectExperts(project.id)
                          .slice(0, 3)
                          .map((expert) => (
                            <div
                              key={expert.id}
                              className="flex items-start justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-green-900">{expert.name}</span>
                                  {expert.affiliation && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                      {expert.affiliation}
                                    </span>
                                  )}
                                </div>
                                {expert.expertise && <p className="text-sm text-green-700 mb-1">{expert.expertise}</p>}
                                <div className="flex items-center gap-3 text-xs text-green-600">
                                  {expert.email && <span>{expert.email}</span>}
                                  {expert.phone && <span>{expert.phone}</span>}
                                  {expert.fileName && (
                                    <div className="flex items-center gap-1">
                                      <FileText className="w-3 h-3" />
                                      <span>
                                        {expert.fileName} {expert.fileSize && `(${expert.fileSize})`}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingExpert(expert)
                                    setSelectedProjectForExpert(project.id)
                                    setIsExpertDialogOpen(true)
                                  }}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveExpertFromProject(expert.id, project.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        {getProjectExperts(project.id).length > 3 && (
                          <p className="text-xs text-gray-500">+{getProjectExperts(project.id).length - 3}명 더 보기</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">아직 추가된 전문가가 없습니다.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">프로젝트가 없습니다</h3>
            <p className="text-gray-600 mb-4">첫 번째 연구 프로젝트를 시작해보세요.</p>
            <Button onClick={() => setIsProjectDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              프로젝트 추가
            </Button>
          </div>
        )}
      </main>

      {/* 다이얼로그들 */}
      <Dialog open={isPaperDialogOpen} onOpenChange={setIsPaperDialogOpen}>
        <PaperDialog
          onSave={handleSavePaperToProject}
          onClose={() => {
            setIsPaperDialogOpen(false)
            setSelectedProjectForPaper(null)
          }}
        />
      </Dialog>

      <Dialog open={isExpertDialogOpen} onOpenChange={setIsExpertDialogOpen}>
        <ExpertDialog
          expert={editingExpert}
          onSave={handleSaveExpertToProject}
          onClose={() => {
            setIsExpertDialogOpen(false)
            setSelectedProjectForExpert(null)
            setEditingExpert(null)
          }}
        />
      </Dialog>

      <Dialog open={isMaterialDialogOpen} onOpenChange={setIsMaterialDialogOpen}>
        <MaterialDialog
          material={editingMaterial}
          onSave={handleSaveMaterialToProject}
          onClose={() => {
            setIsMaterialDialogOpen(false)
            setSelectedProjectForMaterial(null)
            setEditingMaterial(null)
          }}
        />
      </Dialog>
    </div>
  )
}
