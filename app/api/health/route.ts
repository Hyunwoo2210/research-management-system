import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log('Health check started...');
    
    // 데이터베이스 연결 테스트
    await prisma.$connect();
    console.log('Database connection successful');
    
    // 간단한 쿼리 테스트
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Database query test successful:', result);
    
    // 각 테이블 카운트
    const counts = {
      notes: await prisma.note.count(),
      papers: await prisma.paper.count(),
      projects: await prisma.project.count(),
      tasks: await prisma.task.count(),
      achievements: await prisma.achievement.count(),
      experts: await prisma.expert.count(),
      materials: await prisma.material.count()
    };
    
    console.log('Table counts:', counts);
    
    return NextResponse.json({ 
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      counts
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
