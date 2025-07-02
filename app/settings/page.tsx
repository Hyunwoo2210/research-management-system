"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Download, Database, Trash2, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [exportFormat, setExportFormat] = useState("json")
  const [lastBackup, setLastBackup] = useState("2024-01-15")

  const handleExportData = async () => {
    setIsExporting(true)

    // 모의 데이터 생성
    const mockData = {
      notes: [
        {
          id: 1,
          title: "미디어 리터러시 연구 아이디어",
          content: "# 미디어 리터러시 연구\n\n디지털 시대의 미디어 리터러시 교육 방안에 대한 연구...",
          tags: ["미디어", "교육", "리터러시"],
          createdAt: "2024-01-15",
          updatedAt: "2024-01-15",
        },
      ],
      papers: [
        {
          id: 1,
          title: "Digital Media and Democracy: Challenges and Opportunities",
          authors: "Smith, J., Johnson, M.",
          year: 2023,
          publisher: "Journal of Media Studies",
          notes: "민주주의에 대한 디지털 미디어의 영향을 분석한 중요한 연구.",
          createdAt: "2024-01-15",
        },
      ],
      projects: [
        {
          id: 1,
          projectName: "미디어 리터러시 연구",
          description: "디지털 시대의 미디어 리터러시 교육 방안 연구",
          createdAt: "2024-01-01",
        },
      ],
      tasks: [
        {
          id: 1,
          projectId: 1,
          taskName: "문헌 조사",
          description: "미디어 리터러시 관련 기존 연구 조사",
          dueDate: "2024-01-25",
          status: "completed",
          createdAt: "2024-01-15",
        },
      ],
      achievements: [
        {
          id: 1,
          title: "국제 미디어 학술대회 발표",
          achievementDate: "2024-01-10",
          description: "미디어 리터러시 교육 방안에 대한 연구 결과를 국제 학술대회에서 발표",
          type: "presentation",
          createdAt: "2024-01-10",
        },
      ],
      exportDate: new Date().toISOString(),
      version: "1.0",
    }

    // 실제 구현에서는 실제 데이터를 가져와야 함
    setTimeout(() => {
      const dataStr = exportFormat === "json" ? JSON.stringify(mockData, null, 2) : convertToCSV(mockData)

      const dataBlob = new Blob([dataStr], {
        type: exportFormat === "json" ? "application/json" : "text/csv",
      })

      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `research-data-backup-${new Date().toISOString().split("T")[0]}.${exportFormat}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setIsExporting(false)
      setLastBackup(new Date().toISOString().split("T")[0])
    }, 2000)
  }

  const convertToCSV = (data) => {
    // 간단한 CSV 변환 (실제 구현에서는 더 정교하게 구현)
    let csv = "Type,Title,Description,Date\n"

    data.notes.forEach((note) => {
      csv += `Note,"${note.title}","${note.content.substring(0, 100)}","${note.createdAt}"\n`
    })

    data.papers.forEach((paper) => {
      csv += `Paper,"${paper.title}","${paper.authors} (${paper.year})","${paper.createdAt}"\n`
    })

    data.achievements.forEach((achievement) => {
      csv += `Achievement,"${achievement.title}","${achievement.description}","${achievement.achievementDate}"\n`
    })

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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">24</div>
                  <div className="text-sm text-gray-600">총 노트</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">18</div>
                  <div className="text-sm text-gray-600">논문 자료</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">3</div>
                  <div className="text-sm text-gray-600">프로젝트</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">7</div>
                  <div className="text-sm text-gray-600">연구 성과</div>
                </div>
              </div>
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
                  <span>2024-01-15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">기술 스택</span>
                  <span>Next.js, SQLite</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
