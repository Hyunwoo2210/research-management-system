import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>();

// 파일 업로드 유틸리티 함수들
export const uploadFile = async (
  file: File, 
  endpoint: "pdfUploader" | "materialUploader" | "expertUploader"
): Promise<{ url: string; fileName: string; fileSize: string; key: string }> => {
  try {
    console.log("Starting upload with endpoint:", endpoint);
    console.log("File info:", { name: file.name, size: file.size, type: file.type });
    
    const response = await uploadFiles(endpoint, {
      files: [file]
    });

    console.log("Upload response:", response);

    if (!response || response.length === 0) {
      throw new Error("파일 업로드에 실패했습니다.");
    }

    const uploadedFile = response[0];
    
    const result = {
      url: uploadedFile.url,
      fileName: uploadedFile.name,
      fileSize: formatFileSize(uploadedFile.size),
      key: uploadedFile.key
    };
    
    console.log("Upload result:", result);
    
    return result;
  } catch (error) {
    console.error("파일 업로드 상세 오류:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw new Error(`파일 업로드에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export const getFileType = (fileName: string): string => {
  const extension = fileName.split(".").pop()?.toLowerCase()

  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", "ico", "tiff"]
  const videoExtensions = ["mp4", "avi", "mov", "wmv", "flv", "webm", "mkv", "m4v", "3gp"]
  const audioExtensions = ["mp3", "wav", "flac", "aac", "ogg", "wma", "m4a"]
  const archiveExtensions = ["zip", "rar", "7z", "tar", "gz", "bz2", "xz"]
  const documentExtensions = ["pdf", "doc", "docx", "txt", "rtf", "odt", "xls", "xlsx", "ppt", "pptx", "csv", "hwp", "hwpx"]

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
