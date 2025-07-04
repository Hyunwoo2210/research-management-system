import { createUploadthing } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  // 논문 PDF 업로더
  pdfUploader: f({ 
    pdf: { maxFileSize: "20MB", maxFileCount: 1 },
    "application/pdf": { maxFileSize: "20MB", maxFileCount: 1 }
  })
    .middleware(async () => {
      return { 
        userId: "research-user",
        folder: "research_management/papers"
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("PDF 업로드 완료:", file);
      return { 
        uploadedBy: metadata.userId, 
        url: file.url,
        key: file.key,
        name: file.name,
        size: file.size
      };
    }),
    
  // 자료 업로더 (이미지, 문서, 오디오, 비디오)
  materialUploader: f({
    "image/*": { maxFileSize: "10MB", maxFileCount: 1 },
    "application/pdf": { maxFileSize: "20MB", maxFileCount: 1 },
    "application/msword": { maxFileSize: "10MB", maxFileCount: 1 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { maxFileSize: "10MB", maxFileCount: 1 },
    "text/plain": { maxFileSize: "5MB", maxFileCount: 1 },
    "audio/*": { maxFileSize: "50MB", maxFileCount: 1 },
    "video/*": { maxFileSize: "100MB", maxFileCount: 1 },
    "application/zip": { maxFileSize: "50MB", maxFileCount: 1 },
    "application/x-rar-compressed": { maxFileSize: "50MB", maxFileCount: 1 }
  })
    .middleware(async () => {
      return { 
        userId: "research-user",
        folder: "research_management/materials"
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("자료 업로드 완료:", file);
      return { 
        uploadedBy: metadata.userId, 
        url: file.url,
        key: file.key,
        name: file.name,
        size: file.size
      };
    }),

  // 전문가 관련 파일 업로더
  expertUploader: f({
    "image/*": { maxFileSize: "5MB", maxFileCount: 1 },
    "application/pdf": { maxFileSize: "10MB", maxFileCount: 1 },
    "application/msword": { maxFileSize: "10MB", maxFileCount: 1 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { maxFileSize: "10MB", maxFileCount: 1 },
    "text/plain": { maxFileSize: "5MB", maxFileCount: 1 }
  })
    .middleware(async () => {
      return { 
        userId: "research-user",
        folder: "research_management/experts"
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("전문가 파일 업로드 완료:", file);
      return { 
        uploadedBy: metadata.userId, 
        url: file.url,
        key: file.key,
        name: file.name,
        size: file.size
      };
    })
};

export type OurFileRouter = typeof ourFileRouter; 