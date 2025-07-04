import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const experts = await prisma.expert.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        projects: true
      }
    });
    return NextResponse.json(experts);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch experts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, affiliation, expertise, email, phone, notes, filePath, fileName, fileSize, projectIds } = body;
    
    // 필수 필드 확인
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    
    const expert = await prisma.expert.create({
      data: {
        name,
        affiliation: affiliation || null,
        expertise: expertise || null,
        email: email || null,
        phone: phone || null,
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
    
    return NextResponse.json(expert);
  } catch (error) {
    console.error("Create expert error:", error);
    return NextResponse.json({ 
      error: "Failed to create expert", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
