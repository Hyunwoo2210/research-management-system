import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const paper = await prisma.paper.findUnique({
      where: { id },
      include: {
        projects: true
      }
    });
    
    if (!paper) {
      return NextResponse.json({ error: "Paper not found" }, { status: 404 });
    }
    
    return NextResponse.json(paper);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch paper" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { title, authors, year, publisher, notes, filePath, fileName, fileSize, projectIds } = body;
    
    // 기존 관계를 모두 제거하고 새로 설정
    await prisma.paper.update({
      where: { id },
      data: {
        projects: {
          set: [] // 기존 관계 제거
        }
      }
    });
    
    // 업데이트 진행
    const paper = await prisma.paper.update({
      where: { id },
      data: {
        title,
        authors,
        year,
        publisher,
        notes,
        filePath,
        fileName,
        fileSize,
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
    console.error("Update paper error:", error);
    return NextResponse.json({ error: "Failed to update paper" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    // 관계 제거 후 삭제
    await prisma.paper.update({
      where: { id },
      data: {
        projects: {
          set: []
        }
      }
    });
    
    await prisma.paper.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: "Paper deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete paper" }, { status: 500 });
  }
} 