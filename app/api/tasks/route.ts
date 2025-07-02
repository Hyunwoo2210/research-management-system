import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        project: true
      }
    });
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { taskName, description, dueDate, status, notifications, notificationTiming, projectId } = body;
    
    const task = await prisma.task.create({
      data: {
        taskName,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: status || "pending",
        notifications: notifications || false,
        notificationTiming,
        projectId: Number(projectId)
      },
      include: {
        project: true
      }
    });
    
    return NextResponse.json(task);
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
} 