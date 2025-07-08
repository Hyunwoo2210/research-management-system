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
      ".hwp": "application/vnd.hancom.hwp",
      ".hwpx": "application/vnd.hancom.hwpx",
      ".txt": "text/plain; charset=utf-8",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "application/javascript; charset=utf-8",
      ".json": "application/json; charset=utf-8",
    };
    
    if (mimeTypes[ext]) {
      contentType = mimeTypes[ext];
    }

    // 응답 헤더 설정 (인라인으로 표시)
    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Content-Disposition", `inline; filename="${encodeURIComponent(fileName)}"`);
    headers.set("Content-Length", fileBuffer.length.toString());
    
    // 캐시 설정
    headers.set("Cache-Control", "public, max-age=3600");

    return new NextResponse(fileBuffer, { headers });
  } catch (error) {
    console.error("파일 미리보기 오류:", error);
    return NextResponse.json({ error: "파일 미리보기에 실패했습니다" }, { status: 500 });
  }
}
