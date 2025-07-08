import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: true
      }
    });
    
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    
    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { taskName, description, dueDate, status, notifications, notificationTiming, projectId } = body;
    
    const task = await prisma.task.update({
      where: { id },
      data: {
        taskName,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        status,
        notifications,
        notificationTiming,
        projectId: Number(projectId)
      },
      include: {
        project: true
      }
    });
    
    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    await prisma.task.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: "Task deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
} 