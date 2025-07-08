"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Upload, FileText, X, Loader2 } from "lucide-react"
import { uploadFile, validateFile } from "@/lib/file-upload"

interface PaperDialogProps {
  onSave: (paperData: any) => void
  onClose: () => void
}

export function PaperDialog({ onSave, onClose }: PaperDialogProps) {
  const [title, setTitle] = useState("")
  const [authors, setAuthors] = useState("")
  const [year, setYear] = useState("")
  const [publisher, setPublisher] = useState("")
  const [notes, setNotes] = useState("")
  const [filePath, setFilePath] = useState("")
  const [fileName, setFileName] = useState("")
  const [fileSize, setFileSize] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    })

    // 폼 초기화
    setTitle("")
    setAuthors("")
    setYear("")
    setPublisher("")
    setNotes("")
    setFilePath("")
    setFileName("")
    setFileSize("")
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
        <DialogTitle>프로젝트에 참고문헌 추가</DialogTitle>
        <DialogDescription>이 프로젝트와 관련된 참고문헌을 추가하세요.</DialogDescription>
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
                  <X className="w-4 h-4" />
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
        <Button onClick={handleSave} disabled={!title.trim() || !authors.trim() || isUploading}>
          추가
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
