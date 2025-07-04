"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
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
import { Search, Plus, Edit, Trash2, Tag, FileText, Loader2, Eye } from "lucide-react"
import Link from "next/link"

export default function NotesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTag, setSelectedTag] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [viewingNote, setViewingNote] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // 상태 변경
  const [notes, setNotes] = useState([])

  // API 호출로 데이터 가져오기
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setIsLoading(true)
        setError("")
        const response = await fetch('/api/notes')
        
        if (!response.ok) {
          throw new Error("노트를 불러오는데 실패했습니다")
        }
        
        const data = await response.json()
        setNotes(data)
      } catch (error) {
        console.error('노트 가져오기 실패:', error)
        setError("노트를 불러오는데 문제가 발생했습니다. 잠시 후 다시 시도해주세요.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotes()
  }, [])

  const allTags = [...new Set(notes.flatMap((note) => note.tags))]

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTag = selectedTag === "" || note.tags.includes(selectedTag)
    return matchesSearch && matchesTag
  })

  const handleSaveNote = async (noteData) => {
    try {
      setIsLoading(true)
      setError("")
      
      if (editingNote) {
        // 기존 노트 수정
        const response = await fetch(`/api/notes/${editingNote.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(noteData)
        })
        
        if (!response.ok) {
          throw new Error("노트 수정에 실패했습니다")
        }
        
        const updatedNote = await response.json()
        
        setNotes(notes.map((note) => 
          note.id === editingNote.id ? updatedNote : note
        ))
      } else {
        // 새 노트 추가
        const response = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(noteData)
        })
        
        if (!response.ok) {
          throw new Error("노트 생성에 실패했습니다")
        }
        
        const newNote = await response.json()
        
        setNotes([newNote, ...notes])
      }
      
      setIsDialogOpen(false)
      setEditingNote(null)
    } catch (error) {
      console.error('노트 저장 실패:', error)
      setError("노트를 저장하는데 문제가 발생했습니다. 잠시 후 다시 시도해주세요.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteNote = async (id) => {
    try {
      setIsLoading(true)
      setError("")
      
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error("노트 삭제에 실패했습니다")
      }
      
      setNotes(notes.filter((note) => note.id !== id))
    } catch (error) {
      console.error('노트 삭제 실패:', error)
      setError("노트를 삭제하는데 문제가 발생했습니다. 잠시 후 다시 시도해주세요.")
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
              <h1 className="text-3xl font-bold text-gray-900">연구 노트</h1>
              <p className="text-gray-600 mt-1">연구 아이디어와 메모를 체계적으로 관리하세요</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingNote(null)} disabled={isLoading}>
                  <Plus className="w-4 h-4 mr-2" />새 노트 작성
                </Button>
              </DialogTrigger>
              <NoteDialog
                note={editingNote}
                onSave={handleSaveNote}
                onClose={() => {
                  setIsDialogOpen(false)
                  setEditingNote(null)
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
        
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="노트 제목이나 내용으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button 
              variant={selectedTag === "" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setSelectedTag("")}
              disabled={isLoading}
            >
              전체
            </Button>
            {allTags.map((tag) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTag(tag)}
                disabled={isLoading}
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <Card key={note.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div 
                      className="flex-1"
                      onClick={() => {
                        setViewingNote(note)
                        setIsViewDialogOpen(true)
                      }}
                    >
                      <CardTitle className="text-lg">{note.title}</CardTitle>
                      <CardDescription className="mt-1">
                        작성: {new Date(note.createdAt).toLocaleDateString()} | 
                        수정: {new Date(note.updatedAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingNote(note)
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
                          handleDeleteNote(note.id)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent 
                  onClick={() => {
                    setViewingNote(note)
                    setIsViewDialogOpen(true)
                  }}
                >
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {note.content.replace(/[#*]/g, "").substring(0, 100)}...
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && filteredNotes.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">노트가 없습니다</h3>
            <p className="text-gray-600 mb-4">첫 번째 연구 노트를 작성해보세요.</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />새 노트 작성
            </Button>
          </div>
        )}
      </main>

      {/* 세부보기 다이얼로그 */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <NoteViewDialog
          note={viewingNote}
          onEdit={() => {
            setEditingNote(viewingNote)
            setIsViewDialogOpen(false)
            setIsDialogOpen(true)
          }}
          onDelete={() => {
            if (viewingNote) {
              handleDeleteNote(viewingNote.id)
              setIsViewDialogOpen(false)
            }
          }}
          onClose={() => {
            setIsViewDialogOpen(false)
            setViewingNote(null)
          }}
        />
      </Dialog>
    </div>
  )
}

function NoteViewDialog({ note, onEdit, onDelete, onClose }) {
  if (!note) return null

  const formatContent = (content) => {
    // 간단한 마크다운 렌더링
    return content
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
      .replace(/\n/g, '<br />')
  }

  return (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl">{note.title}</DialogTitle>
        <DialogDescription>
          작성: {new Date(note.createdAt).toLocaleDateString()} | 
          수정: {new Date(note.updatedAt).toLocaleDateString()}
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {note.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="prose max-w-none">
          <div 
            className="text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatContent(note.content) }}
          />
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

function NoteDialog({ note, onSave, onClose }) {
  const [title, setTitle] = useState(note?.title || "")
  const [content, setContent] = useState(note?.content || "")
  const [tags, setTags] = useState(note?.tags?.join(", ") || "")

  const handleSave = () => {
    if (!title.trim()) return

    onSave({
      title: title.trim(),
      content: content.trim(),
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
    })
  }

  return (
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{note ? "노트 수정" : "새 노트 작성"}</DialogTitle>
        <DialogDescription>연구 아이디어나 메모를 작성하세요. Markdown 문법을 지원합니다.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">제목</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="노트 제목을 입력하세요"
          />
        </div>
        <div>
          <Label htmlFor="content">내용</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="노트 내용을 입력하세요. Markdown 문법을 지원합니다."
            rows={10}
          />
        </div>
        <div>
          <Label htmlFor="tags">태그</Label>
          <Input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="쉼표로 구분하여 입력하세요 (예: 미디어, 교육, 리터러시)"
          />
          <p className="text-xs text-gray-500 mt-1">쉼표(,)로 구분하여 여러 태그를 입력할 수 있습니다.</p>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          취소
        </Button>
        <Button onClick={handleSave} disabled={!title.trim()}>
          저장
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
