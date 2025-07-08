import { createUploadthing } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  // 논문 업로더 (모든 파일 타입 지원)
  pdfUploader: f({ 
    blob: { maxFileSize: "50MB", maxFileCount: 1 }
  })
    .middleware(async () => {
      return { 
        userId: "research-user",
        folder: "research_management/papers"
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("논문 파일 업로드 완료:", file);
      return { 
        uploadedBy: metadata.userId, 
        url: file.url,
        key: file.key,
        name: file.name,
        size: file.size
      };
    }),
    
  // 자료 업로더 (모든 파일 타입 지원)
  materialUploader: f({
    blob: { maxFileSize: "50MB", maxFileCount: 1 }
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
    blob: { maxFileSize: "20MB", maxFileCount: 1 }
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