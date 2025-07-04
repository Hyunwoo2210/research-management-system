import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const materials = await prisma.material.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        projects: true
      }
    });
    return NextResponse.json(materials);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch materials" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, fileType, filePath, fileName, fileSize, tags, projectIds } = body;
    
    // 필수 필드 확인
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    
    const material = await prisma.material.create({
      data: {
        title,
        description: description || null,
        fileType: fileType || "other",
        filePath: filePath || "",
        fileName: fileName || "",
        fileSize: fileSize || null,
        tags: tags || [],
        projects: {
          connect: projectIds?.map(id => ({ id: Number(id) })) || []
        }
      },
      include: {
        projects: true
      }
    });
    
    return NextResponse.json(material);
  } catch (error) {
    console.error("Create material error:", error);
    return NextResponse.json({ 
      error: "Failed to create material", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
