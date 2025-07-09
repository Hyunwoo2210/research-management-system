import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Ensure database connection
    await prisma.$connect();
    
    const achievements = await prisma.achievement.findMany({
      orderBy: { achievementDate: "desc" }
    });
    
    return NextResponse.json(achievements);
  } catch (error) {
    console.error("Get achievements error:", error);
    return NextResponse.json({ 
      error: "Failed to fetch achievements",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    // Ensure database connection
    await prisma.$connect();
    
    const body = await request.json();
    const { title, achievementDate, description, type } = body;
    
    if (!title || !achievementDate || !type) {
      return NextResponse.json({ 
        error: "Missing required fields" 
      }, { status: 400 });
    }
    
    const achievement = await prisma.achievement.create({
      data: {
        title,
        achievementDate: new Date(achievementDate),
        description: description || '',
        type
      }
    });
    
    return NextResponse.json(achievement);
  } catch (error) {
    console.error("Create achievement error:", error);
    return NextResponse.json({ 
      error: "Failed to create achievement",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 