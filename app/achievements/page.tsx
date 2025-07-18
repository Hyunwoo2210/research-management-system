"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, Trophy, Award, BookOpen, Presentation, Loader2, Eye } from "lucide-react"
import Link from "next/link"

export default function AchievementsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAchievement, setEditingAchievement] = useState(null)
  const [selectedType, setSelectedType] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [viewingAchievement, setViewingAchievement] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // 실제 데이터 상태
  const [achievements, setAchievements] = useState([])

  // API 호출로 데이터 가져오기
  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setIsLoading(true)
        setError("")
        const response = await fetch('/api/achievements')
        
        if (!response.ok) {
          throw new Error("성과 목록을 불러오는데 실패했습니다")
        }
        
        const data = await response.json()
        setAchievements(data)
      } catch (error) {
        console.error('성과 가져오기 실패:', error)
        setError("성과 목록을 불러오는데 문제가 발생했습니다. 잠시 후 다시 시도해주세요.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAchievements()
  }, [])

  const achievementTypes = [
    { value: "publication", label: "논문 게재", icon: BookOpen },
    { value: "presentation", label: "학술 발표", icon: Presentation },
    { value: "award", label: "수상", icon: Award },
    { value: "other", label: "기타", icon: Trophy },
  ]

  const getTypeInfo = (type) => {
    return achievementTypes.find((t) => t.value === type) || achievementTypes[3]
  }

  const filteredAchievements = achievements.filter((achievement) => {
    const matchesSearch =
      achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      achievement.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "" || achievement.type === selectedType
    return matchesSearch && matchesType
  })

  const handleSaveAchievement = async (achievementData) => {
    try {
      setIsLoading(true)
      setError("")
      
      if (editingAchievement) {
        // 기존 성과 수정
        const response = await fetch(`/api/achievements/${editingAchievement.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(achievementData)
        })
        
        if (!response.ok) {
          throw new Error("성과 수정에 실패했습니다")
        }
        
        const updatedAchievement = await response.json()
        
        setAchievements(achievements.map((achievement) =>
          achievement.id === editingAchievement.id ? updatedAchievement : achievement
        ))
      } else {
        // 새 성과 추가
        const response = await fetch('/api/achievements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(achievementData)
        })
        
        if (!response.ok) {
          throw new Error("성과 생성에 실패했습니다")
        }
        
        const newAchievement = await response.json()
        
        setAchievements([newAchievement, ...achievements])
      }
      
      setIsDialogOpen(false)
      setEditingAchievement(null)
    } catch (error) {
      console.error('성과 저장 실패:', error)
      setError("성과를 저장하는데 문제가 발생했습니다. 잠시 후 다시 시도해주세요.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAchievement = async (id) => {
    try {
      setIsLoading(true)
      setError("")
      
      const response = await fetch(`/api/achievements/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error("성과 삭제에 실패했습니다")
      }
      
      setAchievements(achievements.filter((achievement) => achievement.id !== id))
    } catch (error) {
      console.error('성과 삭제 실패:', error)
      setError("성과를 삭제하는데 문제가 발생했습니다. 잠시 후 다시 시도해주세요.")
    } finally {
      setIsLoading(false)
    }
  }

  const getAchievementsByYear = () => {
    const grouped = filteredAchievements.reduce((acc, achievement) => {
      const year = new Date(achievement.achievementDate).getFullYear()
      if (!acc[year]) acc[year] = []
      acc[year].push(achievement)
      return acc
    }, {})

    return Object.keys(grouped)
      .sort((a, b) => b - a)
      .map((year) => ({ year, achievements: grouped[year] }))
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
              <h1 className="text-3xl font-bold text-gray-900">연구 성과</h1>
              <p className="text-gray-600 mt-1">연구 성과와 업적을 체계적으로 기록하세요</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingAchievement(null)} disabled={isLoading}>
                  <Plus className="w-4 h-4 mr-2" />
                  성과 추가
                </Button>
              </DialogTrigger>
              <AchievementDialog
                achievement={editingAchievement}
                onSave={handleSaveAchievement}
                onClose={() => {
                  setIsDialogOpen(false)
                  setEditingAchievement(null)
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="성과 제목이나 설명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button 
              variant={selectedType === "" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setSelectedType("")}
              disabled={isLoading}
            >
              전체
            </Button>
            {achievementTypes.map((type) => {
              const Icon = type.icon
              return (
                <Button
                  key={type.value}
                  variant={selectedType === type.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(type.value)}
                  disabled={isLoading}
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {type.label}
                </Button>
              )
            })}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <span className="ml-2 text-gray-600">데이터를 불러오는 중...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              {achievementTypes.map((type) => {
                const count = achievements.filter((a) => a.type === type.value).length
                const Icon = type.icon
                return (
                  <Card key={type.value}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{type.label}</CardTitle>
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{count}</div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="space-y-8">
              {getAchievementsByYear().map(({ year, achievements: yearAchievements }) => (
                <div key={year}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{year}년</h2>
                  <div className="space-y-4">
                    {yearAchievements
                      .sort((a, b) => new Date(b.achievementDate) - new Date(a.achievementDate))
                      .map((achievement) => {
                        const typeInfo = getTypeInfo(achievement.type)
                        const Icon = typeInfo.icon
                        return (
                          <Card key={achievement.id} className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-start gap-3">
                                <div 
                                  className="flex items-start gap-3 flex-1 min-w-0 overflow-hidden"
                                  onClick={() => {
                                    setViewingAchievement(achievement)
                                    setIsViewDialogOpen(true)
                                  }}
                                >
                                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                    <Icon className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div className="flex-1 min-w-0 overflow-hidden">
                                    <CardTitle className="text-lg break-words line-clamp-2 overflow-hidden text-ellipsis">
                                      {achievement.title}
                                    </CardTitle>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                      <Badge variant="secondary" className="flex-shrink-0">{typeInfo.label}</Badge>
                                      <span className="text-sm text-gray-500 flex-shrink-0">
                                        {new Date(achievement.achievementDate).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setEditingAchievement(achievement)
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
                                      handleDeleteAchievement(achievement.id)
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent 
                              className="pt-0 overflow-hidden"
                              onClick={() => {
                                setViewingAchievement(achievement)
                                setIsViewDialogOpen(true)
                              }}
                            >
                              <div className="text-gray-600 break-all line-clamp-3 overflow-hidden text-ellipsis leading-relaxed">
                                {achievement.description}
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!isLoading && filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">성과가 없습니다</h3>
            <p className="text-gray-600 mb-4">첫 번째 연구 성과를 기록해보세요.</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              성과 추가
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
        <AchievementViewDialog
          achievement={viewingAchievement}
          onEdit={() => {
            setEditingAchievement(viewingAchievement)
            setIsViewDialogOpen(false)
            setIsDialogOpen(true)
          }}
          onDelete={() => {
            if (viewingAchievement) {
              handleDeleteAchievement(viewingAchievement.id)
              setIsViewDialogOpen(false)
            }
          }}
          onClose={() => {
            setIsViewDialogOpen(false)
            setViewingAchievement(null)
          }}
        />
      </Dialog>
    </div>
  )
}

function AchievementViewDialog({ achievement, onEdit, onDelete, onClose }) {
  if (!achievement) return null

  const achievementTypes = [
    { value: "publication", label: "논문 게재", icon: BookOpen },
    { value: "presentation", label: "학술 발표", icon: Presentation },
    { value: "award", label: "수상", icon: Award },
    { value: "other", label: "기타", icon: Trophy },
  ]

  const getTypeInfo = (type) => {
    return achievementTypes.find((t) => t.value === type) || achievementTypes[3]
  }

  const typeInfo = getTypeInfo(achievement.type)
  const Icon = typeInfo.icon

  return (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl flex items-start gap-3 break-words pr-8">
          <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
          <span className="break-all overflow-wrap-anywhere leading-tight">
            {achievement.title}
          </span>
        </DialogTitle>
        <DialogDescription className="text-lg">
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <Badge variant="secondary" className="text-sm px-3 py-1 flex-shrink-0">
              {typeInfo.label}
            </Badge>
            <span className="text-gray-600 flex-shrink-0">
              {new Date(achievement.achievementDate).toLocaleDateString()}
            </span>
          </div>
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6 overflow-hidden">
        {/* 설명 */}
        {achievement.description && (
          <div className="overflow-hidden">
            <h4 className="font-semibold text-lg mb-3">상세 설명</h4>
            <div className="bg-gray-50 p-4 rounded-lg overflow-hidden">
              <div className="text-gray-700 leading-relaxed break-all overflow-wrap-anywhere whitespace-pre-wrap">
                {achievement.description}
              </div>
            </div>
          </div>
        )}
        
        {/* 메타데이터 */}
        <div className="overflow-hidden">
          <h4 className="font-semibold text-lg mb-3">정보</h4>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm overflow-hidden">
            <div className="flex justify-between items-start gap-2">
              <span className="font-medium text-gray-600 flex-shrink-0">성과 유형:</span>
              <span className="break-words text-right">{typeInfo.label}</span>
            </div>
            <div className="flex justify-between items-start gap-2">
              <span className="font-medium text-gray-600 flex-shrink-0">성과 날짜:</span>
              <span className="break-words text-right">{new Date(achievement.achievementDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between items-start gap-2">
              <span className="font-medium text-gray-600 flex-shrink-0">등록일:</span>
              <span className="break-words text-right">{new Date(achievement.createdAt).toLocaleDateString()}</span>
            </div>
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

function AchievementDialog({ achievement, onSave, onClose }) {
  const [title, setTitle] = useState(achievement?.title || "")
  const [achievementDate, setAchievementDate] = useState(achievement?.achievementDate || "")
  const [description, setDescription] = useState(achievement?.description || "")
  const [type, setType] = useState(achievement?.type || "publication")

  const achievementTypes = [
    { value: "publication", label: "논문 게재" },
    { value: "presentation", label: "학술 발표" },
    { value: "award", label: "수상" },
    { value: "other", label: "기타" },
  ]

  const handleSave = () => {
    if (!title.trim() || !achievementDate) return

    onSave({
      title: title.trim(),
      achievementDate: achievementDate,
      description: description.trim(),
      type: type,
    })
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{achievement ? "성과 수정" : "새 성과 추가"}</DialogTitle>
        <DialogDescription>연구 성과나 업적을 기록하세요.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">제목 *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="성과 제목을 입력하세요"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type">유형 *</Label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {achievementTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="achievementDate">날짜 *</Label>
            <Input
              id="achievementDate"
              type="date"
              value={achievementDate}
              onChange={(e) => setAchievementDate(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="description">설명</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="성과에 대한 상세 설명을 입력하세요"
            rows={4}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          취소
        </Button>
        <Button onClick={handleSave} disabled={!title.trim() || !achievementDate}>
          {achievement ? "수정" : "추가"}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
