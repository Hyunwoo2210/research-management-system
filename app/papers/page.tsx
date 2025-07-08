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
import { Search, Plus, Edit, Trash2, BookOpen, FileText, Upload, Loader2, Eye, X } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

import { uploadFile, validateFile } from "@/lib/file-upload"

export default function PapersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPaper, setEditingPaper] = useState(null)
  const [viewingPaper, setViewingPaper] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
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
              <Card key={paper.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div 
                      className="flex-1"
                      onClick={() => {
                        setViewingPaper(paper)
                        setIsViewDialogOpen(true)
                      }}
                    >
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
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation()
                            // UploadThing URL인 경우 직접 열기
                            if (paper.filePath.startsWith('https://uploadthing-prod.s3.us-west-2.amazonaws.com') || 
                                paper.filePath.startsWith('https://utfs.io')) {
                              window.open(paper.filePath, '_blank')
                            } else {
                              window.open(paper.filePath, '_blank')
                            }
                          }}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          파일 보기
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingPaper(paper)
                          setIsDialogOpen(true)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeletePaper(paper.id)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {paper.notes && (
                  <CardContent 
                    onClick={() => {
                      setViewingPaper(paper)
                      setIsViewDialogOpen(true)
                    }}
                  >
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

      {/* 푸터 */}
      <footer className="bg-gray-900 text-white mt-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* 시스템 정보 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">언론재단 이박사의 연구관리 시스템</h3>
              <p className="text-gray-300 text-sm">
                언론 분야 연구를 체계적으로 관리하는 통합 플랫폼입니다.
              </p>
            </div>

            {/* 기술 스택 */}
            <div>
              <h4 className="text-md font-semibold mb-3">기술 스택</h4>
              <div className="space-y-1 text-sm text-gray-300">
                <div>• Frontend: Next.js, React, TypeScript</div>
                <div>• UI: Tailwind CSS, Radix UI</div>
                <div>• Database: PostgreSQL, Prisma ORM</div>
                <div>• Storage: UploadThing</div>
              </div>
            </div>

            {/* 개발 정보 */}
            <div>
              <h4 className="text-md font-semibold mb-3">개발 정보</h4>
              <div className="space-y-1 text-sm text-gray-300">
                <div>• 개발자: 이현우</div>
                <div>• 제작연도: 2025</div>
                <div>• 버전: 1.0.0</div>
                <div>• 최종 업데이트: {new Date().toLocaleDateString('ko-KR')}</div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-6 pt-6 text-center">
            <p className="text-sm text-gray-400">
              © 2025 언론재단 이박사의 연구관리 시스템. Developed by 이현우. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* 세부보기 다이얼로그 */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <PaperViewDialog
          paper={viewingPaper}
          onEdit={() => {
            setEditingPaper(viewingPaper)
            setIsViewDialogOpen(false)
            setIsDialogOpen(true)
          }}
          onDelete={() => {
            if (viewingPaper) {
              handleDeletePaper(viewingPaper.id)
              setIsViewDialogOpen(false)
            }
          }}
          onClose={() => {
            setIsViewDialogOpen(false)
            setViewingPaper(null)
          }}
        />
      </Dialog>
    </div>
  )
}

function PaperViewDialog({ paper, onEdit, onDelete, onClose }) {
  if (!paper) return null

  return (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl">{paper.title}</DialogTitle>
        <DialogDescription className="text-lg">
          <span className="font-medium">{paper.authors}</span> ({paper.year})
          {paper.publisher && (
            <>
              <br />
              <span className="text-gray-600">{paper.publisher}</span>
            </>
          )}
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6">
        {/* 프로젝트 연결 정보 */}
        {paper.projects && paper.projects.length > 0 && (
          <div>
            <h4 className="font-semibold text-lg mb-2">연결된 프로젝트</h4>
            <div className="flex flex-wrap gap-2">
              {paper.projects.map((project) => (
                <Badge key={project.id} variant="outline" className="text-sm px-3 py-1">
                  {project.projectName}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* 파일 정보 */}
        {paper.fileName && (
          <div>
            <h4 className="font-semibold text-lg mb-2">파일 정보</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-500" />
                <span className="font-medium">{paper.fileName}</span>
                {paper.fileSize && <span className="text-gray-500">({paper.fileSize})</span>}
              </div>
              {paper.filePath && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => {
                    // UploadThing URL인 경우 직접 열기
                    if (paper.filePath.startsWith('https://uploadthing-prod.s3.us-west-2.amazonaws.com') || 
                        paper.filePath.startsWith('https://utfs.io')) {
                      window.open(paper.filePath, '_blank')
                    } else {
                      window.open(paper.filePath, '_blank')
                    }
                  }}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  파일 열기
                </Button>
              )}
            </div>
          </div>
        )}
        
        {/* 메모 */}
        {paper.notes && (
          <div>
            <h4 className="font-semibold text-lg mb-2">메모</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{paper.notes}</p>
            </div>
          </div>
        )}
        
        {/* 메타데이터 */}
        <div>
          <h4 className="font-semibold text-lg mb-2">메타데이터</h4>
          <div className="bg-gray-50 p-4 rounded-lg space-y-1 text-sm">
            <div><span className="font-medium">등록일:</span> {new Date(paper.createdAt).toLocaleString()}</div>
            {paper.year && <div><span className="font-medium">출판년도:</span> {paper.year}</div>}
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

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadError("")

    // 파일 타입 제한 제거 (모든 파일 허용)
    // if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    //   setUploadError("PDF 파일만 업로드 가능합니다.")
    //   return
    // }

    // 파일 유효성 검사
    const validation = validateFile(file, 20 * 1024 * 1024) // 20MB 제한
    if (!validation.isValid) {
      setUploadError(validation.error || "파일 업로드 중 오류가 발생했습니다.")
      return
    }

    setIsUploading(true)

    try {
      const result = await uploadFile(file, "pdfUploader")

      setFileName(result.fileName)
      setFilePath(result.url)
      setFileSize(result.fileSize)

      // 제목이 비어있으면 파일명으로 설정 (확장자 제거)
      if (!title.trim()) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "")
        setTitle(nameWithoutExt)
      }
    } catch (error) {
      console.error("파일 업로드 오류:", error)
      setUploadError("파일 업로드 중 오류가 발생했습니다.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveFile = () => {
    setFileName("")
    setFilePath("")
    setFileSize("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
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
          <Label htmlFor="file">파일 업로드</Label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleFileSelect}
                disabled={isUploading}
                className="flex-1 bg-transparent"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    업로드 중...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    파일 업로드
                  </>
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept="*/*"
              />
            </div>

            {uploadError && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{uploadError}</div>}

            {fileName && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-500" />
                  <div>
                    <div className="font-medium text-sm">{fileName}</div>
                    {fileSize && <div className="text-xs text-gray-500">{fileSize}</div>}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
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
