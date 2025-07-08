import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
          set: projectIds?.map(id => ({ id: Number(id) })) || []
        }
      },
      include: {
        projects: true
      }
    });
    
    return NextResponse.json(paper);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update paper" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    await prisma.paper.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: "Paper deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete paper" }, { status: 500 });
  }
}
