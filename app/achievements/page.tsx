"use client"

import { useState } from "react"
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
import { Search, Plus, Edit, Trash2, Trophy, Award, BookOpen, Presentation } from "lucide-react"
import Link from "next/link"

export default function AchievementsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAchievement, setEditingAchievement] = useState(null)
  const [selectedType, setSelectedType] = useState("")

  // 모의 데이터
  const [achievements, setAchievements] = useState([
    {
      id: 1,
      title: "국제 미디어 학술대회 발표",
      achievementDate: "2024-01-10",
      description: "미디어 리터러시 교육 방안에 대한 연구 결과를 국제 학술대회에서 발표",
      type: "presentation",
      createdAt: "2024-01-10",
    },
    {
      id: 2,
      title: "Journal of Media Studies 논문 게재",
      achievementDate: "2023-12-15",
      description: "소셜미디어 알고리즘이 여론 형성에 미치는 영향에 대한 연구 논문 게재",
      type: "publication",
      createdAt: "2023-12-15",
    },
    {
      id: 3,
      title: "연구 우수상 수상",
      achievementDate: "2023-11-20",
      description: "대학원 연구 우수상 수상 (가짜뉴스 탐지 시스템 연구)",
      type: "award",
      createdAt: "2023-11-20",
    },
    {
      id: 4,
      title: "Communication Research Quarterly 논문 게재",
      achievementDate: "2023-10-05",
      description: "디지털 미디어와 민주주의에 관한 연구 논문 게재",
      type: "publication",
      createdAt: "2023-10-05",
    },
  ])

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

  const handleSaveAchievement = (achievementData) => {
    if (editingAchievement) {
      setAchievements(
        achievements.map((achievement) =>
          achievement.id === editingAchievement.id ? { ...achievement, ...achievementData } : achievement,
        ),
      )
    } else {
      const newAchievement = {
        id: Date.now(),
        ...achievementData,
        createdAt: new Date().toISOString().split("T")[0],
      }
      setAchievements([newAchievement, ...achievements])
    }
    setIsDialogOpen(false)
    setEditingAchievement(null)
  }

  const handleDeleteAchievement = (id) => {
    setAchievements(achievements.filter((achievement) => achievement.id !== id))
  }

  const getAchievementsByYear = () => {
    const grouped = achievements.reduce((acc, achievement) => {
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
                <Button onClick={() => setEditingAchievement(null)}>
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
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="성과 제목이나 설명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant={selectedType === "" ? "default" : "outline"} size="sm" onClick={() => setSelectedType("")}>
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
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {type.label}
                </Button>
              )
            })}
          </div>
        </div>

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
                  .filter((achievement) => {
                    const matchesSearch =
                      achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      achievement.description.toLowerCase().includes(searchTerm.toLowerCase())
                    const matchesType = selectedType === "" || achievement.type === selectedType
                    return matchesSearch && matchesType
                  })
                  .sort((a, b) => new Date(b.achievementDate) - new Date(a.achievementDate))
                  .map((achievement) => {
                    const typeInfo = getTypeInfo(achievement.type)
                    const Icon = typeInfo.icon
                    return (
                      <Card key={achievement.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Icon className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-lg">{achievement.title}</CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary">{typeInfo.label}</Badge>
                                  <span className="text-sm text-gray-500">{achievement.achievementDate}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingAchievement(achievement)
                                  setIsDialogOpen(true)
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteAchievement(achievement.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600">{achievement.description}</p>
                        </CardContent>
                      </Card>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>

        {filteredAchievements.length === 0 && (
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
    </div>
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
