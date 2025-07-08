import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const achievements = await prisma.achievement.findMany({
      orderBy: { achievementDate: "desc" }
    });
    return NextResponse.json(achievements);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, achievementDate, description, type } = body;
    
    const achievement = await prisma.achievement.create({
      data: {
        title,
        achievementDate: new Date(achievementDate),
        description,
        type
      }
    });
    
    return NextResponse.json(achievement);
  } catch (error) {
    console.error("Create achievement error:", error);
    return NextResponse.json({ error: "Failed to create achievement" }, { status: 500 });
  }
} 