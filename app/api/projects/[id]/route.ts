import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        tasks: true,
        papers: true,
        experts: true,
        materials: true
      }
    });
    
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { projectName, description } = body;
    
    const project = await prisma.project.update({
      where: { id },
      data: {
        projectName,
        description
      },
      include: {
        tasks: true,
        papers: true,
        experts: true,
        materials: true
      }
    });
    
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    // 관련된 태스크 삭제
    await prisma.task.deleteMany({
      where: { projectId: id }
    });
    
    // 관계 제거 (다대다 관계 정리)
    await prisma.project.update({
      where: { id },
      data: {
        papers: { set: [] },
        experts: { set: [] },
        materials: { set: [] }
      }
    });
    
    // 프로젝트 삭제
    await prisma.project.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: "Project deleted" });
  } catch (error) {
    console.error("Delete project error:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
} 