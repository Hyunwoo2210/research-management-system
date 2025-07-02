"use client"

import { useState, useEffect, useRef } from "react"
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
import { Search, Plus, Edit, Trash2, BookOpen, FileText, Upload, Loader2 } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function PapersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPaper, setEditingPaper] = useState(null)
  const [selectedProjectFilter, setSelectedProjectFilter] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // 상태 변경
  const [papers, setPapers] = useState([])
  const [projects, setProjects] = useState([])

  // API 호출로 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError("")
        
        // 논문 데이터 가져오기
        const papersResponse = await fetch('/api/papers')
        if (!papersResponse.ok) {
          throw new Error("논문 목록을 불러오는데 실패했습니다")
        }
        const papersData = await papersResponse.json()
        setPapers(papersData)
        
        // 프로젝트 데이터 가져오기
        const projectsResponse = await fetch('/api/projects')
        if (!projectsResponse.ok) {
          throw new Error("프로젝트 목록을 불러오는데 실패했습니다")
        }
        const projectsData = await projectsResponse.json()
        setProjects(projectsData)
      } catch (error) {
        console.error('데이터 가져오기 실패:', error)
        setError("데이터를 불러오는데 문제가 발생했습니다. 잠시 후 다시 시도해주세요.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredPapers = papers.filter((paper) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      paper.title.toLowerCase().includes(searchLower) ||
      paper.authors.toLowerCase().includes(searchLower) ||
      (paper.publisher && paper.publisher.toLowerCase().includes(searchLower)) ||
      paper.year.toString().includes(searchLower)
    const matchesProject =
      selectedProjectFilter === "" ||
      (paper.projects && paper.projects.some(project => project.id.toString() === selectedProjectFilter))
    return matchesSearch && matchesProject
  })

  const handleSavePaper = async (paperData) => {
    try {
      setIsLoading(true)
      setError("")
      
      if (editingPaper) {
        // 기존 논문 수정
        const response = await fetch(`/api/papers/${editingPaper.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(paperData)
        })
        
        if (!response.ok) {
          throw new Error("논문 수정에 실패했습니다")
        }
        
        const updatedPaper = await response.json()
        
        setPapers(papers.map((paper) => 
          paper.id === editingPaper.id ? updatedPaper : paper
        ))
      } else {
        // 새 논문 추가
        const response = await fetch('/api/papers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(paperData)
        })
        
        if (!response.ok) {
          throw new Error("논문 생성에 실패했습니다")
        }
        
        const newPaper = await response.json()
        
        setPapers([newPaper, ...papers])
      }
      
      setIsDialogOpen(false)
      setEditingPaper(null)
    } catch (error) {
      console.error('논문 저장 실패:', error)
      setError("논문을 저장하는데 문제가 발생했습니다. 잠시 후 다시 시도해주세요.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePaper = async (id) => {
    try {
      setIsLoading(true)
      setError("")
      
      const response = await fetch(`/api/papers/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error("논문 삭제에 실패했습니다")
      }
      
      setPapers(papers.filter((paper) => paper.id !== id))
    } catch (error) {
      console.error('논문 삭제 실패:', error)
      setError("논문을 삭제하는데 문제가 발생했습니다. 잠시 후 다시 시도해주세요.")
    } finally {
      setIsLoading(false)
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
              <h1 className="text-3xl font-bold text-gray-900">논문 관리</h1>
              <p className="text-gray-600 mt-1">연구 논문과 자료를 체계적으로 관리하세요</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingPaper(null)} disabled={isLoading}>
                  <Plus className="w-4 h-4 mr-2" />
                  논문 추가
                </Button>
              </DialogTrigger>
              <PaperDialog
                paper={editingPaper}
                projects={projects}
                onSave={handleSavePaper}
                onClose={() => {
                  setIsDialogOpen(false)
                  setEditingPaper(null)
                }}
              />
            </Dialog>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
        )}
      
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="논문 제목, 저자, 출판기관으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant={selectedProjectFilter === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedProjectFilter("")}
              disabled={isLoading}
            >
              전체 프로젝트
            </Button>
            {projects.map((project) => (
              <Button
                key={project.id}
                variant={selectedProjectFilter === project.id.toString() ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedProjectFilter(project.id.toString())}
                disabled={isLoading}
              >
                {project.projectName}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <span className="ml-2 text-gray-600">데이터를 불러오는 중...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPapers.map((paper) => (
              <Card key={paper.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{paper.title}</CardTitle>
                      <CardDescription className="text-base">
                        <span className="font-medium">{paper.authors}</span> ({paper.year})
                        <br />
                        <span className="text-sm text-gray-500">{paper.publisher}</span>
                      </CardDescription>
                      {paper.projects && paper.projects.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {paper.projects.map((project) => (
                            <Badge key={project.id} variant="outline" className="text-xs">
                              {project.projectName}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {paper.filePath && (
                        <Button variant="outline" size="sm" onClick={() => window.open(paper.filePath, '_blank')}>
                          <FileText className="w-4 h-4 mr-2" />
                          PDF 보기
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingPaper(paper)
                          setIsDialogOpen(true)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeletePaper(paper.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {paper.notes && (
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">메모</h4>
                      <p className="text-sm text-gray-600">{paper.notes}</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

        {!isLoading && filteredPapers.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">논문이 없습니다</h3>
            <p className="text-gray-600 mb-4">첫 번째 논문을 추가해보세요.</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              논문 추가
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}

function PaperDialog({ paper, projects, onSave, onClose }) {
  const [title, setTitle] = useState(paper?.title || "")
  const [authors, setAuthors] = useState(paper?.authors || "")
  const [year, setYear] = useState(paper?.year?.toString() || new Date().getFullYear().toString())
  const [publisher, setPublisher] = useState(paper?.publisher || "")
  const [notes, setNotes] = useState(paper?.notes || "")
  const [filePath, setFilePath] = useState(paper?.filePath || "")
  const [fileName, setFileName] = useState(paper?.fileName || "")
  const [fileSize, setFileSize] = useState(paper?.fileSize || "")
  const [selectedProjectIds, setSelectedProjectIds] = useState(
    paper?.projects?.map(p => p.id) || []
  )
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const fileInputRef = useRef(null)

  const handleProjectToggle = (projectId) => {
    setSelectedProjectIds(prev => {
      if (prev.includes(projectId)) {
        return prev.filter(id => id !== projectId)
      } else {
        return [...prev, projectId]
      }
    })
  }

  const handleSave = () => {
    if (!title.trim() || !authors.trim()) return

    onSave({
      title: title.trim(),
      authors: authors.trim(),
      year: Number.parseInt(year) || new Date().getFullYear(),
      publisher: publisher.trim(),
      notes: notes.trim(),
      filePath: filePath.trim(),
      fileName: fileName.trim(),
      fileSize: fileSize.trim(),
      projectIds: selectedProjectIds
    })
  }

  const handleFileUpload = async () => {
    // UploadThing 구현 관련 코드
    // 실제 구현에서는 파일 업로드 로직 추가
  }

  return (
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{paper ? "논문 수정" : "논문 추가"}</DialogTitle>
        <DialogDescription>연구 논문 정보를 입력하세요.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">논문 제목 *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="논문 제목을 입력하세요"
          />
        </div>
        <div>
          <Label htmlFor="authors">저자 *</Label>
          <Input
            id="authors"
            value={authors}
            onChange={(e) => setAuthors(e.target.value)}
            placeholder="저자명을 입력하세요 (예: Smith, J., Johnson, M.)"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="year">출판년도</Label>
            <Input id="year" type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2024" />
          </div>
          <div>
            <Label htmlFor="publisher">출판기관</Label>
            <Input
              id="publisher"
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
              placeholder="Journal of Media Studies"
            />
          </div>
        </div>

        <div>
          <Label>프로젝트 연결</Label>
          <div className="border rounded-md p-3 mt-1 space-y-2">
            {projects.length === 0 ? (
              <p className="text-sm text-gray-500">연결할 프로젝트가 없습니다.</p>
            ) : (
              projects.map(project => (
                <div key={project.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`project-${project.id}`}
                    checked={selectedProjectIds.includes(project.id)}
                    onChange={() => handleProjectToggle(project.id)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor={`project-${project.id}`} className="text-sm">
                    {project.projectName}
                  </label>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="filePath">PDF 파일 경로</Label>
          <Input
            id="filePath"
            value={filePath}
            onChange={(e) => setFilePath(e.target.value)}
            placeholder="파일 경로 또는 URL"
          />
          <p className="text-xs text-gray-500 mt-1">
            파일 업로드 기능이 구현되면 자동으로 채워집니다.
          </p>
        </div>

        <div>
          <Label htmlFor="notes">메모</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="논문에 대한 메모나 요약을 입력하세요"
            rows={4}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          취소
        </Button>
        <Button onClick={handleSave} disabled={!title.trim() || !authors.trim()}>
          저장
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
