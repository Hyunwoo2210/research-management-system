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
  Eye,
  Users,
  FolderOpen,
  Download,
  Mail,
  Phone,
  User,
  BookOpen,
  Tag,
  ExternalLink,
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
  projects: { id: number; projectName: string }[];
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
  projects: { id: number; projectName: string }[];
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
  projects: { id: number; projectName: string }[];
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

// 논문 세부보기 다이얼로그
function PaperDetailDialog({ paper, onClose, onEdit, onDelete }) {
  if (!paper) return null

  const handleDownload = async (filePath, fileName) => {
    if (!filePath) return
    
    try {
      // UploadThing URL인 경우 직접 다운로드
      if (filePath.startsWith('https://uploadthing-prod.s3.us-west-2.amazonaws.com') || 
          filePath.startsWith('https://utfs.io')) {
        
        const response = await fetch(filePath)
        if (!response.ok) throw new Error('파일 다운로드에 실패했습니다')
        
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName || 'download'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast({
          title: "다운로드 완료",
          description: `${fileName} 파일이 다운로드되었습니다.`,
        })
      } else {
        // 로컬 파일의 경우 기존 API 사용
        const response = await fetch(`/api/download?path=${encodeURIComponent(filePath)}`)
        if (!response.ok) throw new Error('파일 다운로드에 실패했습니다')
        
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName || 'download'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast({
          title: "다운로드 완료",
          description: `${fileName} 파일이 다운로드되었습니다.`,
        })
      }
    } catch (error) {
      toast({
        title: "다운로드 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-blue-600" />
          논문 세부 정보
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-6">
        {/* 논문 기본 정보 */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-blue-900 mb-3">{paper.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-700">저자:</span>
              <p className="text-blue-800 mt-1">{paper.authors}</p>
            </div>
            <div>
              <span className="font-medium text-blue-700">발행년도:</span>
              <p className="text-blue-800 mt-1">{paper.year}</p>
            </div>
            {paper.publisher && (
              <div>
                <span className="font-medium text-blue-700">출판사:</span>
                <p className="text-blue-800 mt-1">{paper.publisher}</p>
              </div>
            )}
            <div>
              <span className="font-medium text-blue-700">등록일:</span>
              <p className="text-blue-800 mt-1">{new Date(paper.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* 첨부 파일 */}
        {paper.filePath && (
          <div>
            <h4 className="font-semibold text-lg mb-3">첨부 파일</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium">{paper.fileName}</p>
                    {paper.fileSize && (
                      <p className="text-sm text-gray-600">{paper.fileSize}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(paper.filePath, paper.fileName)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    다운로드
                  </Button>
                  {paper.filePath.match(/\.(pdf|txt|doc|docx)$/i) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // UploadThing URL인 경우 직접 열기
                        if (paper.filePath.startsWith('https://uploadthing-prod.s3.us-west-2.amazonaws.com') || 
                            paper.filePath.startsWith('https://utfs.io')) {
                          window.open(paper.filePath, '_blank')
                        } else {
                          window.open(`/api/view?path=${encodeURIComponent(paper.filePath)}`, '_blank')
                        }
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      미리보기
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 노트 */}
        {paper.notes && (
          <div>
            <h4 className="font-semibold text-lg mb-3">노트</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{paper.notes}</p>
            </div>
          </div>
        )}

        {/* 연관 프로젝트 */}
        {paper.projects && paper.projects.length > 0 && (
          <div>
            <h4 className="font-semibold text-lg mb-3">연관 프로젝트</h4>
            <div className="flex flex-wrap gap-2">
              {paper.projects.map((project) => (
                <Badge key={project.id} variant="secondary">
                  {project.projectName}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          닫기
        </Button>
        <Button variant="outline" onClick={onEdit}>
          <Edit className="w-4 h-4 mr-2" />
          수정
        </Button>
        <Button variant="destructive" onClick={onDelete}>
          <Trash2 className="w-4 h-4 mr-2" />
          삭제
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

// 전문가 세부보기 다이얼로그
function ExpertDetailDialog({ expert, onClose, onEdit, onDelete }) {
  if (!expert) return null

  const handleDownload = async (filePath, fileName) => {
    if (!filePath) return
    
    try {
      // UploadThing URL인 경우 직접 다운로드
      if (filePath.startsWith('https://uploadthing-prod.s3.us-west-2.amazonaws.com') || 
          filePath.startsWith('https://utfs.io')) {
        
        const response = await fetch(filePath)
        if (!response.ok) throw new Error('파일 다운로드에 실패했습니다')
        
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName || 'download'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast({
          title: "다운로드 완료",
          description: `${fileName} 파일이 다운로드되었습니다.`,
        })
      } else {
        // 로컬 파일의 경우 기존 API 사용
        const response = await fetch(`/api/download?path=${encodeURIComponent(filePath)}`)
        if (!response.ok) throw new Error('파일 다운로드에 실패했습니다')
        
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName || 'download'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast({
          title: "다운로드 완료",
          description: `${fileName} 파일이 다운로드되었습니다.`,
        })
      }
    } catch (error) {
      toast({
        title: "다운로드 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl flex items-center gap-3">
          <User className="w-6 h-6 text-green-600" />
          전문가 세부 정보
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-6">
        {/* 전문가 기본 정보 */}
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-green-900 mb-4">{expert.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {expert.affiliation && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-green-700">소속:</span>
                <span className="text-green-800">{expert.affiliation}</span>
              </div>
            )}
            {expert.expertise && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-green-700">전문분야:</span>
                <span className="text-green-800">{expert.expertise}</span>
              </div>
            )}
            {expert.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-700">이메일:</span>
                <a 
                  href={`mailto:${expert.email}`}
                  className="text-green-800 hover:text-green-900 underline"
                >
                  {expert.email}
                </a>
              </div>
            )}
            {expert.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-700">전화번호:</span>
                <a 
                  href={`tel:${expert.phone}`}
                  className="text-green-800 hover:text-green-900 underline"
                >
                  {expert.phone}
                </a>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="font-medium text-green-700">등록일:</span>
              <span className="text-green-800">{new Date(expert.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* 첨부 파일 */}
        {expert.filePath && (
          <div>
            <h4 className="font-semibold text-lg mb-3">첨부 파일</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium">{expert.fileName}</p>
                    {expert.fileSize && (
                      <p className="text-sm text-gray-600">{expert.fileSize}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(expert.filePath, expert.fileName)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    다운로드
                  </Button>
                  {expert.filePath.match(/\.(pdf|txt|doc|docx)$/i) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // UploadThing URL인 경우 직접 열기
                        if (expert.filePath.startsWith('https://uploadthing-prod.s3.us-west-2.amazonaws.com') || 
                            expert.filePath.startsWith('https://utfs.io')) {
                          window.open(expert.filePath, '_blank')
                        } else {
                          window.open(`/api/view?path=${encodeURIComponent(expert.filePath)}`, '_blank')
                        }
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      미리보기
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 노트 */}
        {expert.notes && (
          <div>
            <h4 className="font-semibold text-lg mb-3">노트</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{expert.notes}</p>
            </div>
          </div>
        )}

        {/* 연관 프로젝트 */}
        {expert.projects && expert.projects.length > 0 && (
          <div>
            <h4 className="font-semibold text-lg mb-3">연관 프로젝트</h4>
            <div className="flex flex-wrap gap-2">
              {expert.projects.map((project) => (
                <Badge key={project.id} variant="secondary">
                  {project.projectName}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          닫기
        </Button>
        <Button variant="outline" onClick={onEdit}>
          <Edit className="w-4 h-4 mr-2" />
          수정
        </Button>
        <Button variant="destructive" onClick={onDelete}>
          <Trash2 className="w-4 h-4 mr-2" />
          삭제
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

// 자료 세부보기 다이얼로그
function MaterialDetailDialog({ material, onClose, onEdit, onDelete }) {
  if (!material) return null

  const handleDownload = async (filePath, fileName) => {
    if (!filePath) return
    
    try {
      // UploadThing URL인 경우 직접 다운로드
      if (filePath.startsWith('https://uploadthing-prod.s3.us-west-2.amazonaws.com') || 
          filePath.startsWith('https://utfs.io')) {
        
        const response = await fetch(filePath)
        if (!response.ok) throw new Error('파일 다운로드에 실패했습니다')
        
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName || 'download'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast({
          title: "다운로드 완료",
          description: `${fileName} 파일이 다운로드되었습니다.`,
        })
      } else {
        // 로컬 파일의 경우 기존 API 사용
        const response = await fetch(`/api/download?path=${encodeURIComponent(filePath)}`)
        if (!response.ok) throw new Error('파일 다운로드에 실패했습니다')
        
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName || 'download'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast({
          title: "다운로드 완료",
          description: `${fileName} 파일이 다운로드되었습니다.`,
        })
      }
    } catch (error) {
      toast({
        title: "다운로드 실패",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case "image": return ImageIcon
      case "video": return Video
      case "audio": return Music
      case "archive": return Archive
      default: return FileText
    }
  }

  const FileIcon = getFileIcon(material.fileType)

  return (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl flex items-center gap-3">
          <FileIcon className="w-6 h-6 text-purple-600" />
          자료 세부 정보
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-6">
        {/* 자료 기본 정보 */}
        <div className="bg-purple-50 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-purple-900 mb-3">{material.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {material.description && (
              <div className="md:col-span-2">
                <span className="font-medium text-purple-700">설명:</span>
                <p className="text-purple-800 mt-1">{material.description}</p>
              </div>
            )}
            <div>
              <span className="font-medium text-purple-700">파일 타입:</span>
              <p className="text-purple-800 mt-1">
                {material.fileType === "document" ? "문서" :
                 material.fileType === "image" ? "이미지" :
                 material.fileType === "video" ? "비디오" :
                 material.fileType === "audio" ? "오디오" :
                 material.fileType === "archive" ? "압축파일" : "기타"}
              </p>
            </div>
            <div>
              <span className="font-medium text-purple-700">등록일:</span>
              <p className="text-purple-800 mt-1">{new Date(material.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* 파일 정보 */}
        <div>
          <h4 className="font-semibold text-lg mb-3">파일 정보</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileIcon className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium">{material.fileName}</p>
                  {material.fileSize && (
                    <p className="text-sm text-gray-600">{material.fileSize}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(material.filePath, material.fileName)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  다운로드
                </Button>
                {(material.fileType === "image" || 
                  material.fileType === "document" ||
                  material.filePath.match(/\.(pdf|txt|doc|docx|jpg|jpeg|png|gif)$/i)) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // UploadThing URL인 경우 직접 열기
                      if (material.filePath.startsWith('https://uploadthing-prod.s3.us-west-2.amazonaws.com') || 
                          material.filePath.startsWith('https://utfs.io')) {
                        window.open(material.filePath, '_blank')
                      } else {
                        window.open(`/api/view?path=${encodeURIComponent(material.filePath)}`, '_blank')
                      }
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    미리보기
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 태그 */}
        {material.tags && material.tags.length > 0 && (
          <div>
            <h4 className="font-semibold text-lg mb-3">태그</h4>
            <div className="flex flex-wrap gap-2">
              {material.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 연관 프로젝트 */}
        {material.projects && material.projects.length > 0 && (
          <div>
            <h4 className="font-semibold text-lg mb-3">연관 프로젝트</h4>
            <div className="flex flex-wrap gap-2">
              {material.projects.map((project) => (
                <Badge key={project.id} variant="secondary">
                  {project.projectName}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          닫기
        </Button>
        <Button variant="outline" onClick={onEdit}>
          <Edit className="w-4 h-4 mr-2" />
          수정
        </Button>
        <Button variant="destructive" onClick={onDelete}>
          <Trash2 className="w-4 h-4 mr-2" />
          삭제
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

function ProjectViewDialog({ project, tasks, papers, experts, materials, onEdit, onDelete, onClose }) {
  if (!project) return null

  const completedTasks = tasks.filter(task => task.status === "completed").length
  const progressPercentage = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0

  return (
    <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl flex items-center gap-3">
          <FolderOpen className="w-6 h-6 text-blue-600" />
          {project.projectName}
        </DialogTitle>
        <DialogDescription className="text-lg">
          {project.description}
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6">
        {/* 프로젝트 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{tasks.length}</div>
              <p className="text-sm text-gray-600">총 작업</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
              <p className="text-sm text-gray-600">완료된 작업</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-600">{papers.length}</div>
              <p className="text-sm text-gray-600">참고문헌</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-purple-600">{experts.length + materials.length}</div>
              <p className="text-sm text-gray-600">전문가+자료</p>
            </CardContent>
          </Card>
        </div>

        {/* 진행률 */}
        <div>
          <h4 className="font-semibold text-lg mb-2">프로젝트 진행률</h4>
          <div className="bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-1">{progressPercentage}% 완료</p>
        </div>

        {/* 최근 작업 */}
        {tasks.length > 0 && (
          <div>
            <h4 className="font-semibold text-lg mb-3">작업 목록</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {tasks.slice(0, 5).map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                  {task.status === "completed" ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-gray-400" />
                  )}
                  <div className="flex-1">
                    <span className={task.status === "completed" ? "line-through text-gray-500" : ""}>
                      {task.taskName}
                    </span>
                    <div className="text-xs text-gray-500">{task.dueDate}</div>
                  </div>
                </div>
              ))}
              {tasks.length > 5 && (
                <p className="text-sm text-gray-500 text-center">+{tasks.length - 5}개 더</p>
              )}
            </div>
          </div>
        )}

        {/* 메타데이터 */}
        <div>
          <h4 className="font-semibold text-lg mb-3">프로젝트 정보</h4>
          <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-1">
            <div><span className="font-medium">생성일:</span> {new Date(project.createdAt).toLocaleDateString()}</div>
            <div><span className="font-medium">참고문헌:</span> {papers.length}개</div>
            <div><span className="font-medium">전문가:</span> {experts.length}명</div>
            <div><span className="font-medium">관련 자료:</span> {materials.length}개</div>
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          닫기
        </Button>
        <Button variant="outline" onClick={onEdit}>
          <Edit className="w-4 h-4 mr-2" />
          수정
        </Button>
        <Button variant="destructive" onClick={onDelete}>
          <Trash2 className="w-4 h-4 mr-2" />
          삭제
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

function TaskViewDialog({ task, project, onEdit, onDelete, onToggleStatus, onClose }) {
  if (!task) return null

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "text-green-600"
      case "in-progress": return "text-blue-600"
      case "pending": return "text-gray-600"
      default: return "text-gray-600"
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "completed": return "완료"
      case "in-progress": return "진행중"
      case "pending": return "대기"
      default: return "대기"
    }
  }

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "completed"

  return (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl flex items-center gap-3">
          {task.status === "completed" ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <Clock className="w-6 h-6 text-gray-400" />
          )}
          {task.taskName}
        </DialogTitle>
        <DialogDescription className="text-lg">
          <span className="font-medium">{project?.projectName}</span>
          <div className="flex items-center gap-3 mt-2">
            <Badge className={`${getStatusColor(task.status)} bg-opacity-10`}>
              {getStatusText(task.status)}
            </Badge>
            <span className={`text-sm ${isOverdue ? "text-red-600" : "text-gray-600"}`}>
              {isOverdue && <AlertCircle className="w-4 h-4 inline mr-1" />}
              마감일: {new Date(task.dueDate).toLocaleDateString()}
            </span>
          </div>
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6">
        {/* 작업 설명 */}
        {task.description && (
          <div>
            <h4 className="font-semibold text-lg mb-3">상세 설명</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          </div>
        )}

        {/* 알림 설정 */}
        {task.notifications && (
          <div>
            <h4 className="font-semibold text-lg mb-3">알림 설정</h4>
            <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800">
                {task.notificationTiming === "1day" ? "1일 전" :
                 task.notificationTiming === "3days" ? "3일 전" :
                 task.notificationTiming === "1week" ? "1주일 전" :
                 task.notificationTiming === "1month" ? "1개월 전" : "알림"} 알림 설정됨
              </span>
            </div>
          </div>
        )}

        {/* 작업 정보 */}
        <div>
          <h4 className="font-semibold text-lg mb-3">작업 정보</h4>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">프로젝트:</span>
              <span>{project?.projectName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">상태:</span>
              <span className={getStatusColor(task.status)}>{getStatusText(task.status)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">마감일:</span>
              <span className={isOverdue ? "text-red-600" : ""}>{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">생성일:</span>
              <span>{new Date(task.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          닫기
        </Button>
        <Button variant="outline" onClick={onToggleStatus}>
          {task.status === "completed" ? "미완료로 변경" : "완료로 변경"}
        </Button>
        <Button variant="outline" onClick={onEdit}>
          <Edit className="w-4 h-4 mr-2" />
          수정
        </Button>
        <Button variant="destructive" onClick={onDelete}>
          <Trash2 className="w-4 h-4 mr-2" />
          삭제
        </Button>
      </DialogFooter>
    </DialogContent>
  )
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
  defaultProjectId?: number;
  onSave: (data: Partial<Task>) => void;
  onClose: () => void;
}

function TaskDialog({ task, projects, defaultProjectId, onSave, onClose }: TaskDialogProps) {
  const [projectId, setProjectId] = useState(task?.projectId?.toString() || defaultProjectId?.toString() || "")
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
  const [selectedProjectForTask, setSelectedProjectForTask] = useState<number | null>(null)
  const [viewingProject, setViewingProject] = useState<Project | null>(null)
  const [isProjectViewDialogOpen, setIsProjectViewDialogOpen] = useState(false)
  const [viewingTask, setViewingTask] = useState<Task | null>(null)
  const [isTaskViewDialogOpen, setIsTaskViewDialogOpen] = useState(false)
  const [viewingPaper, setViewingPaper] = useState<Paper | null>(null)
  const [isPaperDetailDialogOpen, setIsPaperDetailDialogOpen] = useState(false)
  const [viewingExpert, setViewingExpert] = useState<Expert | null>(null)
  const [isExpertDetailDialogOpen, setIsExpertDetailDialogOpen] = useState(false)
  const [viewingMaterial, setViewingMaterial] = useState<Material | null>(null)
  const [isMaterialDetailDialogOpen, setIsMaterialDetailDialogOpen] = useState(false)
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

        // 전문가 데이터 가져오기
        const expertsResponse = await fetch('/api/experts')
        if (!expertsResponse.ok) throw new Error('전문가 데이터를 불러오는데 실패했습니다')
        const expertsData = await expertsResponse.json()
        setExperts(expertsData)

        // 자료 데이터 가져오기
        const materialsResponse = await fetch('/api/materials')
        if (!materialsResponse.ok) throw new Error('자료 데이터를 불러오는데 실패했습니다')
        const materialsData = await materialsResponse.json()
        setMaterials(materialsData)
        
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
      if (editingTask && editingTask.id > 0) {
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
    return papers.filter((paper) => paper.projects && paper.projects.some(project => project.id === projectId))
  }

  const handleSavePaperToProject = async (paperData: Partial<Paper>) => {
    if (!selectedProjectForPaper) return;
    
    try {
      console.log('Saving paper data:', paperData); // 디버깅용
      console.log('Selected project:', selectedProjectForPaper); // 디버깅용
      
      const payload = {
        ...paperData,
        projectIds: [selectedProjectForPaper]
      };
      
      console.log('API payload:', payload); // 디버깅용
      
      const response = await fetch('/api/papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      console.log('API response status:', response.status); // 디버깅용
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error:', errorData); // 디버깅용
        throw new Error(errorData.details || errorData.error || '논문 추가에 실패했습니다')
      }
      
      const newPaper = await response.json()
      console.log('New paper created:', newPaper); // 디버깅용
      
      setPapers([...papers, newPaper])
      toast({ title: "성공", description: "논문이 추가되었습니다" })
    } catch (err) {
      console.error('논문 저장 오류:', err)
      toast({
        title: "오류 발생",
        description: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다',
        variant: "destructive",
      })
    }
    
    setIsPaperDialogOpen(false)
    setSelectedProjectForPaper(null)
  }

  const handleRemovePaperFromProject = async (paperId: number, projectId: number) => {
    try {
      const paper = papers.find(p => p.id === paperId)
      if (!paper) return
      
      const updatedProjectIds = paper.projects.filter(p => p.id !== projectId).map(p => p.id)
      
      const response = await fetch(`/api/papers/${paperId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...paper,
          projectIds: updatedProjectIds
        })
      })
      
      if (!response.ok) throw new Error('논문 제거에 실패했습니다')
      
      const updatedPaper = await response.json()
      setPapers(papers.map(p => p.id === updatedPaper.id ? updatedPaper : p))
      toast({ title: "성공", description: "논문이 제거되었습니다" })
    } catch (err) {
      console.error('논문 제거 오류:', err)
      toast({
        title: "오류 발생",
        description: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다',
        variant: "destructive",
      })
    }
  }

  const getProjectExperts = (projectId: number) => {
    return experts.filter((expert) => expert.projects && expert.projects.some(project => project.id === projectId))
  }

  const handleSaveExpertToProject = async (expertData: Partial<Expert>) => {
    try {
      if (editingExpert) {
        // 전문가 업데이트
        const response = await fetch(`/api/experts/${editingExpert.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(expertData)
        })
        
        if (!response.ok) throw new Error('전문가 업데이트에 실패했습니다')
        
        const updatedExpert = await response.json()
        setExperts(experts.map(expert => expert.id === updatedExpert.id ? updatedExpert : expert))
        toast({ title: "성공", description: "전문가 정보가 업데이트되었습니다" })
      } else {
        // 새 전문가 추가
        if (!selectedProjectForExpert) return;
        
        const response = await fetch('/api/experts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...expertData,
            projectIds: [selectedProjectForExpert]
          })
        })
        
        if (!response.ok) throw new Error('전문가 추가에 실패했습니다')
        
        const newExpert = await response.json()
        setExperts([...experts, newExpert])
        toast({ title: "성공", description: "전문가가 추가되었습니다" })
      }
    } catch (err) {
      console.error('전문가 저장 오류:', err)
      toast({
        title: "오류 발생",
        description: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다',
        variant: "destructive",
      })
    }
    
    setIsExpertDialogOpen(false)
    setSelectedProjectForExpert(null)
    setEditingExpert(null)
  }

  const handleRemoveExpertFromProject = async (expertId: number, projectId: number) => {
    try {
      const expert = experts.find(e => e.id === expertId)
      if (!expert) return
      
      const updatedProjectIds = expert.projects.filter(p => p.id !== projectId).map(p => p.id)
      
      const response = await fetch(`/api/experts/${expertId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...expert,
          projectIds: updatedProjectIds
        })
      })
      
      if (!response.ok) throw new Error('전문가 제거에 실패했습니다')
      
      const updatedExpert = await response.json()
      setExperts(experts.map(e => e.id === updatedExpert.id ? updatedExpert : e))
      toast({ title: "성공", description: "전문가가 제거되었습니다" })
    } catch (err) {
      console.error('전문가 제거 오류:', err)
      toast({
        title: "오류 발생",
        description: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다',
        variant: "destructive",
      })
    }
  }

  const getProjectMaterials = (projectId: number) => {
    return materials.filter((material) => material.projects && material.projects.some(project => project.id === projectId))
  }

  const handleSaveMaterialToProject = async (materialData: Partial<Material>) => {
    try {
      if (editingMaterial) {
        // 자료 업데이트
        const response = await fetch(`/api/materials/${editingMaterial.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(materialData)
        })
        
        if (!response.ok) throw new Error('자료 업데이트에 실패했습니다')
        
        const updatedMaterial = await response.json()
        setMaterials(materials.map(material => material.id === updatedMaterial.id ? updatedMaterial : material))
        toast({ title: "성공", description: "자료가 업데이트되었습니다" })
      } else {
        // 새 자료 추가
        if (!selectedProjectForMaterial) return;
        
        const response = await fetch('/api/materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...materialData,
            projectIds: [selectedProjectForMaterial]
          })
        })
        
        if (!response.ok) throw new Error('자료 추가에 실패했습니다')
        
        const newMaterial = await response.json()
        setMaterials([...materials, newMaterial])
        toast({ title: "성공", description: "자료가 추가되었습니다" })
      }
    } catch (err) {
      console.error('자료 저장 오류:', err)
      toast({
        title: "오류 발생",
        description: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다',
        variant: "destructive",
      })
    }
    
    setIsMaterialDialogOpen(false)
    setSelectedProjectForMaterial(null)
    setEditingMaterial(null)
  }

  const handleRemoveMaterialFromProject = async (materialId: number, projectId: number) => {
    try {
      const material = materials.find(m => m.id === materialId)
      if (!material) return
      
      const updatedProjectIds = material.projects.filter(p => p.id !== projectId).map(p => p.id)
      
      const response = await fetch(`/api/materials/${materialId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...material,
          projectIds: updatedProjectIds
        })
      })
      
      if (!response.ok) throw new Error('자료 제거에 실패했습니다')
      
      const updatedMaterial = await response.json()
      setMaterials(materials.map(m => m.id === updatedMaterial.id ? updatedMaterial : m))
      toast({ title: "성공", description: "자료가 제거되었습니다" })
    } catch (err) {
      console.error('자료 제거 오류:', err)
      toast({
        title: "오류 발생",
        description: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다',
        variant: "destructive",
      })
    }
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
                  defaultProjectId={selectedProjectForTask}
                  onSave={handleSaveTask}
                  onClose={() => {
                    setIsTaskDialogOpen(false)
                    setEditingTask(null)
                    setSelectedProjectForTask(null)
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
                    <div 
                      className="cursor-pointer flex-1"
                      onClick={() => {
                        setViewingProject(project)
                        setIsProjectViewDialogOpen(true)
                      }}
                    >
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
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingProject(project)
                          setIsProjectDialogOpen(true)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteProject(project.id)
                        }}
                      >
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
                            <div 
                              className="flex-1 cursor-pointer"
                              onClick={() => {
                                setViewingTask(task)
                                setIsTaskViewDialogOpen(true)
                              }}
                            >
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
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingTask(task)
                                setIsTaskDialogOpen(true)
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteTask(task.id)
                              }}
                            >
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
                          setEditingTask(null)
                          setSelectedProjectForTask(project.id)
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
                                className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200 cursor-pointer hover:bg-purple-100 transition-colors"
                                onClick={() => {
                                  setViewingMaterial(material)
                                  setIsMaterialDetailDialogOpen(true)
                                }}
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
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setViewingMaterial(material)
                                      setIsMaterialDetailDialogOpen(true)
                                    }}
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
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
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleRemoveMaterialFromProject(material.id, project.id)
                                    }}
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
                              className="flex items-center justify-between p-2 bg-blue-50 rounded text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                              onClick={() => {
                                setViewingPaper(paper)
                                setIsPaperDetailDialogOpen(true)
                              }}
                            >
                              <div>
                                <span className="font-medium">{paper.title}</span>
                                <span className="text-gray-600 ml-2">({paper.year})</span>
                                {paper.fileName && (
                                  <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    {paper.fileName} {paper.fileSize && `(${paper.fileSize})`}
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setViewingPaper(paper)
                                    setIsPaperDetailDialogOpen(true)
                                  }}
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemovePaperFromProject(paper.id, project.id)
                                  }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
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
                              className="flex items-start justify-between p-3 bg-green-50 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
                              onClick={() => {
                                setViewingExpert(expert)
                                setIsExpertDetailDialogOpen(true)
                              }}
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
                                  {expert.email && (
                                    <div className="flex items-center gap-1">
                                      <Mail className="w-3 h-3" />
                                      <span>{expert.email}</span>
                                    </div>
                                  )}
                                  {expert.phone && (
                                    <div className="flex items-center gap-1">
                                      <Phone className="w-3 h-3" />
                                      <span>{expert.phone}</span>
                                    </div>
                                  )}
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
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setViewingExpert(expert)
                                    setIsExpertDetailDialogOpen(true)
                                  }}
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
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
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemoveExpertFromProject(expert.id, project.id)
                                  }}
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

      {/* 프로젝트 세부보기 다이얼로그 */}
      <Dialog open={isProjectViewDialogOpen} onOpenChange={setIsProjectViewDialogOpen}>
        <ProjectViewDialog
          project={viewingProject}
          tasks={viewingProject ? getTasksByProject(viewingProject.id) : []}
          papers={viewingProject ? getProjectPapers(viewingProject.id) : []}
          experts={viewingProject ? getProjectExperts(viewingProject.id) : []}
          materials={viewingProject ? getProjectMaterials(viewingProject.id) : []}
          onEdit={() => {
            setEditingProject(viewingProject)
            setIsProjectViewDialogOpen(false)
            setIsProjectDialogOpen(true)
          }}
          onDelete={() => {
            if (viewingProject) {
              handleDeleteProject(viewingProject.id)
              setIsProjectViewDialogOpen(false)
            }
          }}
          onClose={() => {
            setIsProjectViewDialogOpen(false)
            setViewingProject(null)
          }}
        />
      </Dialog>

      {/* 작업 세부보기 다이얼로그 */}
      <Dialog open={isTaskViewDialogOpen} onOpenChange={setIsTaskViewDialogOpen}>
        <TaskViewDialog
          task={viewingTask}
          project={viewingTask ? projects.find(p => p.id === viewingTask.projectId) : null}
          onEdit={() => {
            setEditingTask(viewingTask)
            setIsTaskViewDialogOpen(false)
            setIsTaskDialogOpen(true)
          }}
          onDelete={() => {
            if (viewingTask) {
              handleDeleteTask(viewingTask.id)
              setIsTaskViewDialogOpen(false)
            }
          }}
          onToggleStatus={() => {
            if (viewingTask) {
              toggleTaskStatus(viewingTask.id)
            }
          }}
          onClose={() => {
            setIsTaskViewDialogOpen(false)
            setViewingTask(null)
          }}
        />
      </Dialog>

      {/* 논문 세부보기 다이얼로그 */}
      <Dialog open={isPaperDetailDialogOpen} onOpenChange={setIsPaperDetailDialogOpen}>
        <PaperDetailDialog
          paper={viewingPaper}
          onEdit={() => {
            // 논문 수정 기능은 별도 구현 필요
            toast({
              title: "알림",
              description: "논문 수정 기능은 준비 중입니다.",
            })
          }}
          onDelete={() => {
            if (viewingPaper) {
              // 논문 삭제 기능 구현
              toast({
                title: "알림",
                description: "논문 삭제 기능은 준비 중입니다.",
              })
            }
          }}
          onClose={() => {
            setIsPaperDetailDialogOpen(false)
            setViewingPaper(null)
          }}
        />
      </Dialog>

      {/* 전문가 세부보기 다이얼로그 */}
      <Dialog open={isExpertDetailDialogOpen} onOpenChange={setIsExpertDetailDialogOpen}>
        <ExpertDetailDialog
          expert={viewingExpert}
          onEdit={() => {
            setEditingExpert(viewingExpert)
            setIsExpertDetailDialogOpen(false)
            setIsExpertDialogOpen(true)
          }}
          onDelete={() => {
            if (viewingExpert) {
              // 전문가 삭제 기능 구현
              toast({
                title: "알림",
                description: "전문가 삭제 기능은 준비 중입니다.",
              })
            }
          }}
          onClose={() => {
            setIsExpertDetailDialogOpen(false)
            setViewingExpert(null)
          }}
        />
      </Dialog>

      {/* 자료 세부보기 다이얼로그 */}
      <Dialog open={isMaterialDetailDialogOpen} onOpenChange={setIsMaterialDetailDialogOpen}>
        <MaterialDetailDialog
          material={viewingMaterial}
          onEdit={() => {
            setEditingMaterial(viewingMaterial)
            setIsMaterialDetailDialogOpen(false)
            setIsMaterialDialogOpen(true)
          }}
          onDelete={() => {
            if (viewingMaterial) {
              // 자료 삭제 기능 구현
              toast({
                title: "알림",
                description: "자료 삭제 기능은 준비 중입니다.",
              })
            }
          }}
          onClose={() => {
            setIsMaterialDetailDialogOpen(false)
            setViewingMaterial(null)
          }}
        />
      </Dialog>
    </div>
  )
}
