import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const expert = await prisma.expert.findUnique({
      where: { id },
      include: {
        projects: true
      }
    });
    
    if (!expert) {
      return NextResponse.json({ error: "Expert not found" }, { status: 404 });
    }
    
    return NextResponse.json(expert);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch expert" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { name, affiliation, expertise, email, phone, notes, filePath, fileName, fileSize, projectIds } = body;
    
    const expert = await prisma.expert.update({
      where: { id },
      data: {
        name,
        affiliation,
        expertise,
        email,
        phone,
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
    
    return NextResponse.json(expert);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update expert" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    await prisma.expert.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: "Expert deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete expert" }, { status: 500 });
  }
}
