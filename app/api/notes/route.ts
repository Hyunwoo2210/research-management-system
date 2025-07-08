import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log('Attempting to fetch notes...');
    const notes = await prisma.note.findMany({
      orderBy: { createdAt: "desc" }
    });
    console.log(`Successfully fetched ${notes.length} notes`);
    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json({ 
      error: "Failed to fetch notes",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log('Attempting to create note...');
    const body = await request.json();
    const { title, content, tags } = body;
    
    const note = await prisma.note.create({
      data: {
        title,
        content,
        tags
      }
    });
    
    console.log('Successfully created note:', note.id);
    return NextResponse.json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json({ 
      error: "Failed to create note",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 