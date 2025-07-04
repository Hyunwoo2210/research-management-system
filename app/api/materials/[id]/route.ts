import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        projects: true
      }
    });
    
    if (!material) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 });
    }
    
    return NextResponse.json(material);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch material" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { title, description, fileType, filePath, fileName, fileSize, tags, projectIds } = body;
    
    const material = await prisma.material.update({
      where: { id },
      data: {
        title,
        description,
        fileType,
        filePath,
        fileName,
        fileSize,
        tags,
        projects: {
          set: projectIds?.map(id => ({ id: Number(id) })) || []
        }
      },
      include: {
        projects: true
      }
    });
    
    return NextResponse.json(material);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update material" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    await prisma.material.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: "Material deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete material" }, { status: 500 });
  }
}
