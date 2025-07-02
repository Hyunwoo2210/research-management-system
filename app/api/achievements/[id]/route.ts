import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const achievement = await prisma.achievement.findUnique({
      where: { id }
    });
    
    if (!achievement) {
      return NextResponse.json({ error: "Achievement not found" }, { status: 404 });
    }
    
    return NextResponse.json(achievement);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch achievement" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { title, achievementDate, description, type } = body;
    
    const achievement = await prisma.achievement.update({
      where: { id },
      data: {
        title,
        achievementDate: new Date(achievementDate),
        description,
        type
      }
    });
    
    return NextResponse.json(achievement);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update achievement" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    await prisma.achievement.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: "Achievement deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete achievement" }, { status: 500 });
  }
} 