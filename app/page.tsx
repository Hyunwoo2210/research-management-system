"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Calendar, FileText, Trophy, Plus, Clock, Loader2 } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalPapers: 0,
    activeProjects: 0,
    totalAchievements: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // 상태 변경
  const [recentNotes, setRecentNotes] = useState([])
  const [projects, setProjects] = useState([])
  const [recentPapers, setRecentPapers] = useState([])
  const [upcomingTasks, setUpcomingTasks] = useState([])
  const [recentAchievements, setRecentAchievements] = useState([])

  // 실제 데이터를 API에서 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError("")

        // 노트 데이터 가져오기
        const notesResponse = await fetch('/api/notes')
        if (!notesResponse.ok) throw new Error("노트 데이터를 불러오는데 실패했습니다")
        const notesData = await notesResponse.json()
        
        // 논문 데이터 가져오기
        const papersResponse = await fetch('/api/papers')
        if (!papersResponse.ok) throw new Error("논문 데이터를 불러오는데 실패했습니다")
        const papersData = await papersResponse.json()
        
        // 프로젝트 데이터 가져오기
        const projectsResponse = await fetch('/api/projects')
        if (!projectsResponse.ok) throw new Error("프로젝트 데이터를 불러오는데 실패했습니다")
        const projectsData = await projectsResponse.json()
        
        // 태스크 데이터 가져오기
        const tasksResponse = await fetch('/api/tasks')
        if (!tasksResponse.ok) throw new Error("태스크 데이터를 불러오는데 실패했습니다")
        const tasksData = await tasksResponse.json()
        
        // 성과 데이터 가져오기
        const achievementsResponse = await fetch('/api/achievements')
        if (!achievementsResponse.ok) throw new Error("성과 데이터를 불러오는데 실패했습니다")
        const achievementsData = await achievementsResponse.json()

        // 통계 설정
        setStats({
          totalNotes: notesData.length,
          totalPapers: papersData.length,
          activeProjects: projectsData.length,
          totalAchievements: achievementsData.length,
        })

        // 최근 노트
        setRecentNotes(
          notesData
            .slice(0, 2)
            .map(note => ({
              id: note.id,
              title: note.title,
              tags: note.tags,
              updatedAt: new Date(note.updatedAt).toLocaleDateString()
            }))
        )

        // 프로젝트
        setProjects(
          projectsData
            .slice(0, 3)
            .map(project => ({
              id: project.id,
              projectName: project.projectName
            }))
        )

        // 최근 논문
        setRecentPapers(
          papersData
            .slice(0, 2)
            .map(paper => ({
              id: paper.id,
              title: paper.title.length > 30 ? paper.title.substring(0, 30) + '...' : paper.title,
              authors: paper.authors.split(',')[0] + (paper.authors.includes(',') ? ' 외' : ''),
              year: paper.year,
              projectIds: paper.projects.map(p => p.id)
            }))
        )

        // 예정된 태스크
        const today = new Date()
        const upcomingTasksData = tasksData
          .filter(task => 
            task.status !== 'completed' && 
            task.dueDate && 
            new Date(task.dueDate) > today
          )
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
          .slice(0, 2)
          .map(task => ({
            id: task.id,
            taskName: task.taskName,
            dueDate: new Date(task.dueDate).toLocaleDateString(),
            projectName: task.project.projectName
          }))
        
        setUpcomingTasks(upcomingTasksData)

        // 최근 성과
        setRecentAchievements(
          achievementsData
            .slice(0, 1)
            .map(achievement => ({
              id: achievement.id,
              title: achievement.title,
              date: new Date(achievement.achievementDate).toLocaleDateString(),
              description: achievement.description
            }))
        )
      } catch (error) {
        console.error('데이터 가져오기 실패:', error)
        setError("데이터를 불러오는데 문제가 발생했습니다. 잠시 후 다시 시도해주세요.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">연구 관리 대시보드</h1>
              <p className="text-gray-600 mt-1">언론 분야 연구를 체계적으로 관리하세요</p>
            </div>
            <nav className="flex space-x-4">
              <Link href="/notes">
                <Button variant="ghost" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  노트
                </Button>
              </Link>
              <Link href="/papers">
                <Button variant="ghost" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  논문
                </Button>
              </Link>
              <Link href="/schedule">
                <Button variant="ghost" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  프로젝트/일정
                </Button>
              </Link>
              <Link href="/achievements">
                <Button variant="ghost" className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  성과
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="ghost">설정</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <span className="ml-3 text-lg text-gray-600">데이터를 불러오는 중...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">총 노트</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalNotes}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">총 논문</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPapers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">활성 프로젝트</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeProjects}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">총 성과</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalAchievements}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">최근 노트</CardTitle>
                    <Link href="/notes">
                      <Button variant="ghost" size="sm">
                        전체보기
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentNotes.length > 0 ? (
                    <div className="space-y-4">
                      {recentNotes.map((note) => (
                        <div key={note.id} className="border-b pb-3 last:border-0 last:pb-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-900">{note.title}</h3>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {note.tags.slice(0, 3).map((tag) => (
                                  <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
                                    {tag}
                                  </span>
                                ))}
                                {note.tags.length > 3 && (
                                  <span className="text-gray-500 text-xs">+{note.tags.length - 3}개</span>
                                )}
                              </div>
                            </div>
                            <span className="text-xs text-gray-500">{note.updatedAt}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>노트가 없습니다</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">프로젝트</CardTitle>
                    <Link href="/schedule">
                      <Button variant="ghost" size="sm">
                        전체보기
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {projects.length > 0 ? (
                    <div className="space-y-2">
                      {projects.map((project) => (
                        <div key={project.id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                          <span className="font-medium text-gray-900">{project.projectName}</span>
                          <Link href={`/schedule?project=${project.id}`} passHref>
                            <Button variant="outline" size="sm">
                              자세히
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>프로젝트가 없습니다</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">최근 논문</CardTitle>
                    <Link href="/papers">
                      <Button variant="ghost" size="sm">
                        전체보기
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentPapers.length > 0 ? (
                    <div className="space-y-4">
                      {recentPapers.map((paper) => (
                        <div key={paper.id} className="border-b pb-3 last:border-0 last:pb-0">
                          <h3 className="font-medium text-gray-900">{paper.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {paper.authors} ({paper.year})
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>논문이 없습니다</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">예정된 일정</CardTitle>
                    <Link href="/schedule">
                      <Button variant="ghost" size="sm">
                        전체보기
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {upcomingTasks.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingTasks.map((task) => (
                        <div key={task.id} className="border-b pb-3 last:border-0 last:pb-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-900">{task.taskName}</h3>
                              <p className="text-sm text-gray-600 mt-1">{task.projectName}</p>
                            </div>
                            <div className="flex items-center text-xs">
                              <Clock className="w-3 h-3 mr-1 text-gray-500" />
                              <span>{task.dueDate}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>예정된 일정이 없습니다</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">최근 성과</CardTitle>
                    <Link href="/achievements">
                      <Button variant="ghost" size="sm">
                        전체보기
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentAchievements.length > 0 ? (
                    <div className="space-y-4">
                      {recentAchievements.map((achievement) => (
                        <div key={achievement.id} className="border-b pb-3 last:border-0 last:pb-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-900">{achievement.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                            </div>
                            <span className="text-xs text-gray-500">{achievement.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Trophy className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>등록된 성과가 없습니다</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
