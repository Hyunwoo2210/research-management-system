// 파일 업로드 유틸리티 함수들
export const uploadFile = async (file: File): Promise<{ url: string; fileName: string; fileSize: string }> => {
  // 실제 구현에서는 서버로 파일을 업로드하고 URL을 받아옵니다
  // 여기서는 모의 구현으로 처리합니다

  return new Promise((resolve) => {
    setTimeout(() => {
      const mockUrl = `/uploads/${Date.now()}_${file.name}`
      const fileSize = formatFileSize(file.size)

      resolve({
        url: mockUrl,
        fileName: file.name,
        fileSize: fileSize,
      })
    }, 1000) // 업로드 시뮬레이션을 위한 지연
  })
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export const getFileType = (fileName: string): string => {
  const extension = fileName.split(".").pop()?.toLowerCase()

  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"]
  const videoExtensions = ["mp4", "avi", "mov", "wmv", "flv", "webm", "mkv"]
  const audioExtensions = ["mp3", "wav", "flac", "aac", "ogg", "wma"]
  const archiveExtensions = ["zip", "rar", "7z", "tar", "gz", "bz2"]
  const documentExtensions = ["pdf", "doc", "docx", "txt", "rtf", "odt"]

  if (imageExtensions.includes(extension || "")) return "image"
  if (videoExtensions.includes(extension || "")) return "video"
  if (audioExtensions.includes(extension || "")) return "audio"
  if (archiveExtensions.includes(extension || "")) return "archive"
  if (documentExtensions.includes(extension || "")) return "document"

  return "other"
}

export const validateFile = (file: File, maxSize: number = 50 * 1024 * 1024): { isValid: boolean; error?: string } => {
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `파일 크기가 너무 큽니다. 최대 ${formatFileSize(maxSize)}까지 업로드 가능합니다.`,
    }
  }

  return { isValid: true }
}
