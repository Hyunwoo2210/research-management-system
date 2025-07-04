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

interface ExpertDialogProps {
  expert?: any
  onSave: (expertData: any) => void
  onClose: () => void
}

export function ExpertDialog({ expert, onSave, onClose }: ExpertDialogProps) {
  const [name, setName] = useState(expert?.name || "")
  const [affiliation, setAffiliation] = useState(expert?.affiliation || "")
  const [expertise, setExpertise] = useState(expert?.expertise || "")
  const [email, setEmail] = useState(expert?.email || "")
  const [phone, setPhone] = useState(expert?.phone || "")
  const [notes, setNotes] = useState(expert?.notes || "")
  const [filePath, setFilePath] = useState(expert?.filePath || "")
  const [fileName, setFileName] = useState(expert?.fileName || "")
  const [fileSize, setFileSize] = useState(expert?.fileSize || "")
  const [fileKey, setFileKey] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    if (!name.trim()) return

    onSave({
      name: name.trim(),
      affiliation: affiliation.trim(),
      expertise: expertise.trim(),
      email: email.trim(),
      phone: phone.trim(),
      notes: notes.trim(),
      filePath: filePath.trim(),
      fileName: fileName.trim(),
      fileSize: fileSize.trim(),
    })

    // 폼 초기화 (새 전문가 추가 시)
    if (!expert) {
      setName("")
      setAffiliation("")
      setExpertise("")
      setEmail("")
      setPhone("")
      setNotes("")
      setFilePath("")
      setFileName("")
      setFileSize("")
      setFileKey("")
    }
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadError("")

    // 파일 유효성 검사
    const validation = validateFile(file, 10 * 1024 * 1024) // 10MB 제한
    if (!validation.isValid) {
      setUploadError(validation.error || "파일 업로드 중 오류가 발생했습니다.")
      return
    }

    setIsUploading(true)

    try {
      const result = await uploadFile(file, "expertUploader")

      setFileName(result.fileName)
      setFilePath(result.url)
      setFileSize(result.fileSize)
      setFileKey(result.key)
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
    setFileKey("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{expert ? "전문가 정보 수정" : "프로젝트에 전문가 추가"}</DialogTitle>
        <DialogDescription>이 프로젝트와 관련된 전문가 정보를 입력하세요.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">이름 *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="전문가 이름을 입력하세요"
            />
          </div>
          <div>
            <Label htmlFor="affiliation">소속</Label>
            <Input
              id="affiliation"
              value={affiliation}
              onChange={(e) => setAffiliation(e.target.value)}
              placeholder="대학교, 연구소, 회사 등"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="expertise">전문분야</Label>
          <Input
            id="expertise"
            value={expertise}
            onChange={(e) => setExpertise(e.target.value)}
            placeholder="미디어 리터러시, 소셜미디어 분석 등"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="expert@example.com"
            />
          </div>
          <div>
            <Label htmlFor="phone">연락처</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-1234-5678" />
          </div>
        </div>

        <div>
          <Label htmlFor="file">관련 파일 (이력서, 논문 등)</Label>
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
              <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" accept="*/*" />
            </div>

            {uploadError && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{uploadError}</div>}

            {fileName && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
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
            placeholder="전문가에 대한 추가 정보나 메모를 입력하세요"
            rows={3}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          취소
        </Button>
        <Button onClick={handleSave} disabled={!name.trim() || isUploading}>
          {expert ? "수정" : "추가"}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
