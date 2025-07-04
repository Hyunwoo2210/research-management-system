"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Upload, FileText, ImageIcon, Video, Music, Archive, X, Loader2 } from "lucide-react"
import { uploadFile, getFileType, validateFile } from "@/lib/file-upload"

interface MaterialDialogProps {
  material?: any
  onSave: (materialData: any) => void
  onClose: () => void
}

export function MaterialDialog({ material, onSave, onClose }: MaterialDialogProps) {
  const [title, setTitle] = useState(material?.title || "")
  const [description, setDescription] = useState(material?.description || "")
  const [fileType, setFileType] = useState(material?.fileType || "document")
  const [filePath, setFilePath] = useState(material?.filePath || "")
  const [fileName, setFileName] = useState(material?.fileName || "")
  const [fileSize, setFileSize] = useState(material?.fileSize || "")
  const [tags, setTags] = useState(material?.tags?.join(", ") || "")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fileTypes = [
    { value: "document", label: "문서", icon: FileText },
    { value: "image", label: "이미지", icon: ImageIcon },
    { value: "video", label: "비디오", icon: Video },
    { value: "audio", label: "오디오", icon: Music },
    { value: "archive", label: "압축파일", icon: Archive },
    { value: "other", label: "기타", icon: FileText },
  ]

  const getFileTypeInfo = (type: string) => {
    return fileTypes.find((t) => t.value === type) || fileTypes[0]
  }

  const handleSave = () => {
    if (!title.trim()) return

    onSave({
      title: title.trim(),
      description: description.trim(),
      fileType: fileType,
      filePath: filePath.trim(),
      fileName: fileName.trim(),
      fileSize: fileSize.trim(),
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
    })

    // 폼 초기화 (새 자료 추가 시)
    if (!material) {
      setTitle("")
      setDescription("")
      setFileType("document")
      setFilePath("")
      setFileName("")
      setFileSize("")
      setTags("")
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
    const validation = validateFile(file)
    if (!validation.isValid) {
      setUploadError(validation.error || "파일 업로드 중 오류가 발생했습니다.")
      return
    }

    setIsUploading(true)

    try {
      const result = await uploadFile(file, "materialUploader")

      // 파일 정보 자동 설정
      setFileName(result.fileName)
      setFilePath(result.url)
      setFileSize(result.fileSize)

      // 제목이 비어있으면 파일명으로 설정
      if (!title.trim()) {
        setTitle(file.name.split(".")[0])
      }

      // 파일 타입 자동 감지
      const detectedType = getFileType(file.name)
      setFileType(detectedType)
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
        <DialogTitle>{material ? "관련 자료 수정" : "프로젝트에 관련 자료 추가"}</DialogTitle>
        <DialogDescription>이 프로젝트와 관련된 자료를 추가하세요.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">자료 제목 *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="자료 제목을 입력하세요"
          />
        </div>

        <div>
          <Label htmlFor="fileType">파일 유형</Label>
          <select
            id="fileType"
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {fileTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
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
                    파일 선택
                  </>
                )}
              </Button>
              <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" accept="*/*" />
            </div>

            {uploadError && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{uploadError}</div>}

            {fileName && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = getFileTypeInfo(fileType).icon
                    return <Icon className="w-4 h-4 text-gray-500" />
                  })()}
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
          <Label htmlFor="description">설명</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="자료에 대한 설명을 입력하세요"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="tags">태그</Label>
          <Input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="태그를 쉼표로 구분하여 입력하세요 (예: 데이터, 분석, 보고서)"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          취소
        </Button>
        <Button onClick={handleSave} disabled={!title.trim() || isUploading}>
          {material ? "수정" : "추가"}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
