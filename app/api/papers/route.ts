import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const papers = await prisma.paper.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        projects: true
      }
    });
    return NextResponse.json(papers);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch papers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, authors, year, publisher, notes, filePath, fileName, fileSize, projectIds } = body;
    
    // 필수 필드 확인
    if (!title || !authors) {
      return NextResponse.json({ error: "Title and authors are required" }, { status: 400 });
    }
    
    const paper = await prisma.paper.create({
      data: {
        title,
        authors,
        year: year || new Date().getFullYear(),
        publisher: publisher || null,
        notes: notes || null,
        filePath: filePath || null,
        fileName: fileName || null,
        fileSize: fileSize || null,
        projects: {
          connect: projectIds?.map(id => ({ id: Number(id) })) || []
        }
      },
      include: {
        projects: true
      }
    });
    
    return NextResponse.json(paper);
  } catch (error) {
    console.error("Create paper error:", error);
    return NextResponse.json({ 
      error: "Failed to create paper", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
} 