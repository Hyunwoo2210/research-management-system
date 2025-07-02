import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
    
    const paper = await prisma.paper.create({
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
    console.error("Create paper error:", error);
    return NextResponse.json({ error: "Failed to create paper" }, { status: 500 });
  }
} 