import { createUploadthing } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "20MB" } })
    .middleware(async () => {
      return { userId: "user-id" }; // 인증 필요시 여기서 처리
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),
    
  materialUploader: f(["image", "pdf", "audio", "video", "text"])
    .middleware(async () => {
      return { userId: "user-id" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    })
};

export type OurFileRouter = typeof ourFileRouter; 