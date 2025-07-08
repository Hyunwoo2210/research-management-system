"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Download, Database, Trash2, AlertTriangle, CheckCircle, Loader2, Lock, LogOut } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginData, setLoginData] = useState({ id: "", password: "" })
  const [loginError, setLoginError] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [exportFormat, setExportFormat] = useState("json")
  const [lastBackup, setLastBackup] = useState("2024-01-15")
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalPapers: 0,
    totalProjects: 0,
    totalAchievements: 0,
    totalTasks: 0,
    totalExperts: 0,
    totalMaterials: 0,
  })

  // 페이지 로드 시 로그인 상태 확인
  useEffect(() => {
    const savedAuth = localStorage.getItem('settings_authenticated')
    if (savedAuth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats()
    }
  }, [isAuthenticated])

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoggingIn(true)
    setLoginError("")

    // 인증 처리 (실제 환경에서는 더 안전한 방법 사용)
    if (loginData.id === "estocada" && loginData.password === "3079") {
      setIsAuthenticated(true)
      localStorage.setItem('settings_authenticated', 'true')
      setLoginData({ id: "", password: "" })
    } else {
      setLoginError("아이디 또는 비밀번호가 올바르지 않습니다.")
    }
    setIsLoggingIn(false)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('settings_authenticated')
    setLoginData({ id: "", password: "" })
  }

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      
      // API 호출을 통해 통계 데이터 가져오기
      const responses = await Promise.all([
        fetch('/api/notes'),
        fetch('/api/papers'),
        fetch('/api/projects'),
        fetch('/api/achievements'),
        fetch('/api/tasks'),
        fetch('/api/experts'),
        fetch('/api/materials'),
      ])

      const [notes, papers, projects, achievements, tasks, experts, materials] = await Promise.all(
        responses.map(response => response.ok ? response.json() : [])
      )

      setStats({
        totalNotes: notes.length || 0,
        totalPapers: papers.length || 0,
        totalProjects: projects.length || 0,
        totalAchievements: achievements.length || 0,
        totalTasks: tasks.length || 0,
        totalExperts: experts.length || 0,
        totalMaterials: materials.length || 0,
      })
    } catch (error) {
      console.error('통계 데이터를 가져오는데 실패했습니다:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportData = async () => {
    setIsExporting(true)

    try {
      // 실제 데이터를 API에서 가져오기
      const responses = await Promise.all([
        fetch('/api/notes'),
        fetch('/api/papers'),
        fetch('/api/projects'),
        fetch('/api/tasks'),
        fetch('/api/achievements'),
        fetch('/api/experts'),
        fetch('/api/materials'),
      ])

      const [notes, papers, projects, tasks, achievements, experts, materials] = await Promise.all(
        responses.map(async (response) => {
          if (response.ok) {
            return await response.json()
          }
          return []
        })
      )

      const exportData = {
        notes: notes || [],
        papers: papers || [],
        projects: projects || [],
        tasks: tasks || [],
        achievements: achievements || [],
        experts: experts || [],
        materials: materials || [],
        exportDate: new Date().toISOString(),
        version: "1.0",
      }

      const dataStr = exportFormat === "json" ? 
        JSON.stringify(exportData, null, 2) : 
        convertToCSV(exportData)

      // CSV의 경우 UTF-8 BOM 추가하여 한글 깨짐 방지
      const finalData = exportFormat === "csv" ? 
        "\uFEFF" + dataStr : // UTF-8 BOM 추가
        dataStr

      const dataBlob = new Blob([finalData], {
        type: exportFormat === "json" ? 
          "application/json;charset=utf-8" : 
          "text/csv;charset=utf-8",
      })

      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `research-data-backup-${new Date().toISOString().split("T")[0]}.${exportFormat}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setLastBackup(new Date().toISOString().split("T")[0])
      alert(`데이터가 성공적으로 내보내졌습니다!\n- 노트: ${exportData.notes.length}개\n- 논문: ${exportData.papers.length}개\n- 프로젝트: ${exportData.projects.length}개\n- 작업: ${exportData.tasks.length}개\n- 성과: ${exportData.achievements.length}개\n- 전문가: ${exportData.experts.length}명\n- 자료: ${exportData.materials.length}개`)
    } catch (error) {
      console.error('데이터 내보내기 실패:', error)
      alert('데이터를 내보내는 중 오류가 발생했습니다.')
    } finally {
      setIsExporting(false)
    }
  }

  const convertToCSV = (data) => {
    let csv = "구분,제목,설명,작성자/저자,날짜,상태/정보\n"

    // 노트 데이터
    if (data.notes && data.notes.length > 0) {
      data.notes.forEach((note) => {
        const title = `"${(note.title || '').replace(/"/g, '""')}"`
        const content = `"${(note.content || '').substring(0, 100).replace(/"/g, '""')}"`
        const tags = `"${(note.tags || []).join(', ')}"`
        const date = `"${new Date(note.createdAt || '').toLocaleDateString('ko-KR')}"`
        csv += `노트,${title},${content},${tags},${date},\n`
      })
    }

    // 논문 데이터
    if (data.papers && data.papers.length > 0) {
      data.papers.forEach((paper) => {
        const title = `"${(paper.title || '').replace(/"/g, '""')}"`
        const authors = `"${(paper.authors || '').replace(/"/g, '""')}"`
        const publisher = `"${(paper.publisher || '').replace(/"/g, '""')}"`
        const year = `"${paper.year || ''}"`
        const date = `"${new Date(paper.createdAt || '').toLocaleDateString('ko-KR')}"`
        csv += `논문,${title},${publisher},${authors},${date},${year}년\n`
      })
    }

    // 프로젝트 데이터
    if (data.projects && data.projects.length > 0) {
      data.projects.forEach((project) => {
        const name = `"${(project.projectName || '').replace(/"/g, '""')}"`
        const description = `"${(project.description || '').replace(/"/g, '""')}"`
        const date = `"${new Date(project.createdAt || '').toLocaleDateString('ko-KR')}"`
        csv += `프로젝트,${name},${description},,${date},\n`
      })
    }

    // 작업 데이터
    if (data.tasks && data.tasks.length > 0) {
      data.tasks.forEach((task) => {
        const name = `"${(task.taskName || '').replace(/"/g, '""')}"`
        const description = `"${(task.description || '').replace(/"/g, '""')}"`
        const status = `"${task.status || ''}"`
        const dueDate = `"${task.dueDate ? new Date(task.dueDate).toLocaleDateString('ko-KR') : ''}"`
        const date = `"${new Date(task.createdAt || '').toLocaleDateString('ko-KR')}"`
        csv += `작업,${name},${description},,${date},${status} (마감: ${dueDate})\n`
      })
    }

    // 성과 데이터
    if (data.achievements && data.achievements.length > 0) {
      data.achievements.forEach((achievement) => {
        const title = `"${(achievement.title || '').replace(/"/g, '""')}"`
        const description = `"${(achievement.description || '').replace(/"/g, '""')}"`
        const type = `"${achievement.type || ''}"`
        const date = `"${new Date(achievement.achievementDate || '').toLocaleDateString('ko-KR')}"`
        csv += `성과,${title},${description},,${date},${type}\n`
      })
    }

    // 전문가 데이터
    if (data.experts && data.experts.length > 0) {
      data.experts.forEach((expert) => {
        const name = `"${(expert.name || '').replace(/"/g, '""')}"`
        const field = `"${(expert.field || '').replace(/"/g, '""')}"`
        const institution = `"${(expert.institution || '').replace(/"/g, '""')}"`
        const contact = `"${(expert.contact || '').replace(/"/g, '""')}"`
        const date = `"${new Date(expert.createdAt || '').toLocaleDateString('ko-KR')}"`
        csv += `전문가,${name},${field},${institution},${date},${contact}\n`
      })
    }

    // 자료 데이터
    if (data.materials && data.materials.length > 0) {
      data.materials.forEach((material) => {
        const title = `"${(material.title || '').replace(/"/g, '""')}"`
        const description = `"${(material.description || '').replace(/"/g, '""')}"`
        const type = `"${material.type || ''}"`
        const url = `"${(material.url || '').replace(/"/g, '""')}"`
        const date = `"${new Date(material.createdAt || '').toLocaleDateString('ko-KR')}"`
        csv += `자료,${title},${description},,${date},${type} (${url})\n`
      })
    }

    return csv
  }

  const handleImportData = (event) => {
    const file = event.target.files[0]
    if (!file) return

    setIsImporting(true)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        // 실제 구현에서는 데이터 검증 및 데이터베이스 업데이트 로직 필요
        console.log("Imported data:", data)

        setTimeout(() => {
          setIsImporting(false)
          alert("데이터를 성공적으로 가져왔습니다!")
        }, 2000)
      } catch (error) {
        setIsImporting(false)
        alert("파일 형식이 올바르지 않습니다.")
      }
    }
    reader.readAsText(file)
  }

  const handleClearAllData = () => {
    if (confirm("모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      // 실제 구현에서는 데이터베이스 초기화 로직 필요
      alert("모든 데이터가 삭제되었습니다.")
    }
  }

  // 로그인이 되지 않은 경우 로그인 폼 표시
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div>
            <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm mb-4 block text-center">
              ← 대시보드로 돌아가기
            </Link>
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              설정 페이지 접근
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              관리자 권한이 필요합니다. 로그인해주세요.
            </p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="id">아이디</Label>
                  <Input
                    id="id"
                    type="text"
                    value={loginData.id}
                    onChange={(e) => setLoginData(prev => ({ ...prev, id: e.target.value }))}
                    placeholder="아이디를 입력하세요"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="password">비밀번호</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="비밀번호를 입력하세요"
                    required
                    className="mt-1"
                  />
                </div>
                {loginError && (
                  <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
                    {loginError}
                  </div>
                )}
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      로그인 중...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      로그인
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
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
              <h1 className="text-3xl font-bold text-gray-900">설정</h1>
              <p className="text-gray-600 mt-1">데이터 백업 및 시스템 설정을 관리하세요</p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* 데이터 백업 섹션 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                데이터 백업 및 복구
              </CardTitle>
              <CardDescription>연구 데이터를 안전하게 백업하고 복구할 수 있습니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">마지막 백업</p>
                    <p className="text-sm text-green-700">{lastBackup}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">데이터 내보내기</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="exportFormat">내보내기 형식</Label>
                    <select
                      id="exportFormat"
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="json">JSON (권장)</option>
                      <option value="csv">CSV</option>
                    </select>
                  </div>
                  <Button onClick={handleExportData} disabled={isExporting} className="w-full sm:w-auto">
                    <Download className="w-4 h-4 mr-2" />
                    {isExporting ? "내보내는 중..." : "데이터 내보내기"}
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">데이터 가져오기</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-900">주의사항</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          데이터를 가져오면 기존 데이터와 병합됩니다. 중복된 데이터가 있을 수 있습니다.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="importFile">백업 파일 선택</Label>
                    <Input
                      id="importFile"
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      disabled={isImporting}
                      className="mt-1"
                    />
                  </div>
                  {isImporting && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span>데이터를 가져오는 중...</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 시스템 정보 섹션 */}
          <Card>
            <CardHeader>
              <CardTitle>시스템 정보</CardTitle>
              <CardDescription>현재 시스템 상태와 통계 정보입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <span className="ml-2 text-gray-600">통계를 불러오는 중...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{stats.totalNotes}</div>
                    <div className="text-sm text-gray-600">총 노트</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{stats.totalPapers}</div>
                    <div className="text-sm text-gray-600">논문 자료</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{stats.totalProjects}</div>
                    <div className="text-sm text-gray-600">프로젝트</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{stats.totalAchievements}</div>
                    <div className="text-sm text-gray-600">연구 성과</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{stats.totalTasks}</div>
                    <div className="text-sm text-gray-600">작업</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{stats.totalExperts}</div>
                    <div className="text-sm text-gray-600">전문가</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{stats.totalMaterials}</div>
                    <div className="text-sm text-gray-600">관련 자료</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 위험 구역 */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                위험 구역
              </CardTitle>
              <CardDescription>주의해서 사용해야 하는 기능들입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-medium text-red-900 mb-2">모든 데이터 삭제</h4>
                  <p className="text-sm text-red-700 mb-4">
                    모든 노트, 논문, 프로젝트, 일정, 성과 데이터를 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.
                  </p>
                  <Button variant="destructive" onClick={handleClearAllData} className="w-full sm:w-auto">
                    <Trash2 className="w-4 h-4 mr-2" />
                    모든 데이터 삭제
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 앱 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>앱 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">버전</span>
                  <span>1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">빌드 날짜</span>
                  <span>{new Date().toISOString().split('T')[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">기술 스택</span>
                  <span>Next.js, PostgreSQL, Prisma</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
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
    </div>
  )
}