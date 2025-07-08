import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    console.log('Starting database seeding...');
    
    // 기존 데이터 확인
    const existingData = {
      notes: await prisma.note.count(),
      papers: await prisma.paper.count(),
      projects: await prisma.project.count(),
      achievements: await prisma.achievement.count()
    };
    
    console.log('Existing data counts:', existingData);
    
    // 데이터가 이미 있으면 스킵
    const totalExisting = Object.values(existingData).reduce((sum, count) => sum + count, 0);
    if (totalExisting > 0) {
      return NextResponse.json({
        message: 'Database already has data, skipping seed',
        existingData
      });
    }
    
    // 프로젝트 생성
    const project1 = await prisma.project.create({
      data: {
        projectName: '언론 환경 변화 연구',
        description: '디지털 미디어 시대의 언론 환경 변화와 대응 방안 연구'
      }
    });
    
    const project2 = await prisma.project.create({
      data: {
        projectName: '미디어 리터러시 교육',
        description: '시민 대상 미디어 리터러시 교육 프로그램 개발'
      }
    });
    
    console.log('Projects created:', project1.id, project2.id);
    
    // 노트 생성
    await prisma.note.create({
      data: {
        title: '환영합니다!',
        content: '언론재단 이박사의 연구관리 시스템에 오신 것을 환영합니다. 이 시스템은 연구 활동을 체계적으로 관리할 수 있도록 도와드립니다.',
        tags: ['환영', '시스템', '연구관리']
      }
    });
    
    await prisma.note.create({
      data: {
        title: '시스템 사용법',
        content: '1. 노트: 아이디어와 메모를 기록하세요\n2. 논문: 중요한 논문들을 관리하세요\n3. 프로젝트: 연구 프로젝트를 체계적으로 관리하세요\n4. 성과: 연구 성과를 기록하고 추적하세요',
        tags: ['사용법', '가이드', '매뉴얼']
      }
    });
    
    console.log('Notes created');
    
    // 논문 생성
    await prisma.paper.create({
      data: {
        title: '디지털 시대의 저널리즘 변화',
        authors: '김언론, 이미디어',
        year: 2024,
        publisher: '언론학연구',
        notes: '디지털 플랫폼이 저널리즘에 미치는 영향에 대한 포괄적 분석',
        projects: {
          connect: { id: project1.id }
        }
      }
    });
    
    await prisma.paper.create({
      data: {
        title: '미디어 리터러시 교육의 효과성 연구',
        authors: '박교육, 최연구',
        year: 2024,
        publisher: '교육학논집',
        notes: '다양한 연령대별 미디어 리터러시 교육 프로그램의 효과성 검증',
        projects: {
          connect: { id: project2.id }
        }
      }
    });
    
    console.log('Papers created');
    
    // 태스크 생성
    await prisma.task.create({
      data: {
        taskName: '문헌 조사 완료',
        description: '관련 선행 연구 문헌 조사 및 정리',
        dueDate: new Date('2025-08-15'),
        status: 'pending',
        projectId: project1.id
      }
    });
    
    await prisma.task.create({
      data: {
        taskName: '설문조사 설계',
        description: '미디어 리터러시 현황 파악을 위한 설문조사 설계',
        dueDate: new Date('2025-07-30'),
        status: 'pending',
        projectId: project2.id
      }
    });
    
    console.log('Tasks created');
    
    // 성과 생성
    await prisma.achievement.create({
      data: {
        title: '연구관리 시스템 구축 완료',
        achievementDate: new Date(),
        description: '체계적인 연구 관리를 위한 디지털 플랫폼 구축',
        type: '시스템 개발'
      }
    });
    
    console.log('Achievement created');
    
    // 최종 데이터 카운트
    const finalCounts = {
      notes: await prisma.note.count(),
      papers: await prisma.paper.count(),
      projects: await prisma.project.count(),
      tasks: await prisma.task.count(),
      achievements: await prisma.achievement.count()
    };
    
    console.log('Database seeding completed:', finalCounts);
    
    return NextResponse.json({
      message: 'Database seeded successfully',
      created: finalCounts
    });
    
  } catch (error) {
    console.error('Database seeding failed:', error);
    return NextResponse.json({ 
      error: "Database seeding failed",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
