import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("path");

    if (!filePath) {
      return NextResponse.json({ error: "파일 경로가 필요합니다" }, { status: 400 });
    }

    // 보안: 경로 검증 (디렉토리 탐색 공격 방지)
    const safePath = path.resolve(filePath);
    if (!safePath.startsWith(process.cwd())) {
      return NextResponse.json({ error: "잘못된 파일 경로입니다" }, { status: 403 });
    }

    // 파일 존재 확인
    if (!existsSync(safePath)) {
      return NextResponse.json({ error: "파일을 찾을 수 없습니다" }, { status: 404 });
    }

    // 파일 읽기
    const fileBuffer = await readFile(safePath);
    const fileName = path.basename(safePath);
    
    // MIME 타입 결정
    const ext = path.extname(fileName).toLowerCase();
    let contentType = "application/octet-stream";
    
    const mimeTypes: Record<string, string> = {
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".txt": "text/plain",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".mp4": "video/mp4",
      ".mp3": "audio/mpeg",
      ".zip": "application/zip",
      ".rar": "application/x-rar-compressed",
    };
    
    if (mimeTypes[ext]) {
      contentType = mimeTypes[ext];
    }

    // 응답 헤더 설정
    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Content-Disposition", `attachment; filename="${encodeURIComponent(fileName)}"`);
    headers.set("Content-Length", fileBuffer.length.toString());

    return new NextResponse(fileBuffer, { headers });
  } catch (error) {
    console.error("파일 다운로드 오류:", error);
    return NextResponse.json({ error: "파일 다운로드에 실패했습니다" }, { status: 500 });
  }
}
