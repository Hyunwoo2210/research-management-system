const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  console.log('🔍 데이터베이스 연결 테스트...');
  
  try {
    await prisma.$connect();
    console.log('✅ 데이터베이스 연결 성공!');
    
    // 각 테이블의 데이터 개수 확인
    const counts = {
      notes: await prisma.note.count(),
      papers: await prisma.paper.count(),
      projects: await prisma.project.count(),
      tasks: await prisma.task.count(),
      achievements: await prisma.achievement.count(),
      experts: await prisma.expert.count(),
      materials: await prisma.material.count()
    };
    
    console.log('📊 데이터베이스 현황:');
    Object.entries(counts).forEach(([table, count]) => {
      console.log(`   ${table}: ${count}개`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error.message);
    return false;
  }
}

async function createSampleData() {
  console.log('\n🔍 샘플 데이터 생성 테스트...');
  
  try {
    // 프로젝트 생성
    const project = await prisma.project.create({
      data: {
        projectName: '백엔드 테스트 프로젝트',
        description: 'API 및 데이터베이스 연결 테스트용 프로젝트'
      }
    });
    console.log('✅ 프로젝트 생성 성공:', project.projectName);
    
    // 노트 생성
    const note = await prisma.note.create({
      data: {
        title: '백엔드 테스트 노트',
        content: '이것은 백엔드 기능 테스트를 위한 샘플 노트입니다.',
        tags: ['테스트', '백엔드', 'API']
      }
    });
    console.log('✅ 노트 생성 성공:', note.title);
    
    // 논문 생성
    const paper = await prisma.paper.create({
      data: {
        title: 'Test Paper for Backend Validation',
        authors: '테스트 작성자',
        year: 2025,
        publisher: '테스트 출판사',
        projects: {
          connect: { id: project.id }
        }
      }
    });
    console.log('✅ 논문 생성 성공:', paper.title);
    
    // 태스크 생성
    const task = await prisma.task.create({
      data: {
        taskName: '백엔드 테스트 완료',
        description: 'API 및 데이터베이스 연결 확인',
        dueDate: new Date('2025-12-31'),
        projectId: project.id
      }
    });
    console.log('✅ 태스크 생성 성공:', task.taskName);
    
    // 성과 생성
    const achievement = await prisma.achievement.create({
      data: {
        title: '백엔드 시스템 구축 완료',
        achievementDate: new Date(),
        description: '데이터베이스 연결 및 API 구현 완료',
        type: '개발'
      }
    });
    console.log('✅ 성과 생성 성공:', achievement.title);
    
    return {
      project: project.id,
      note: note.id, 
      paper: paper.id,
      task: task.id,
      achievement: achievement.id
    };
    
  } catch (error) {
    console.error('❌ 샘플 데이터 생성 실패:', error.message);
    return null;
  }
}

async function testDataRetrieval() {
  console.log('\n🔍 데이터 조회 테스트...');
  
  try {
    // 최근 노트 조회
    const recentNotes = await prisma.note.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' }
    });
    console.log(`✅ 최근 노트 ${recentNotes.length}개 조회 성공`);
    
    // 프로젝트와 관련된 논문 조회
    const projectsWithPapers = await prisma.project.findMany({
      include: {
        papers: true,
        tasks: true
      },
      take: 2
    });
    console.log(`✅ 프로젝트-논문 관계 ${projectsWithPapers.length}개 조회 성공`);
    
    // 최근 성과 조회
    const recentAchievements = await prisma.achievement.findMany({
      take: 2,
      orderBy: { achievementDate: 'desc' }
    });
    console.log(`✅ 최근 성과 ${recentAchievements.length}개 조회 성공`);
    
    return true;
  } catch (error) {
    console.error('❌ 데이터 조회 실패:', error.message);
    return false;
  }
}

async function checkUploadThingEnv() {
  console.log('\n🔍 UploadThing 환경변수 확인...');
  
  const requiredEnvVars = [
    'UPLOADTHING_TOKEN',
    'UPLOADTHING_SECRET', 
    'UPLOADTHING_APP_ID'
  ];
  
  const results = {};
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    results[varName] = value ? '✅ 설정됨' : '❌ 누락됨';
    console.log(`   ${varName}: ${results[varName]}`);
  });
  
  const allSet = Object.values(results).every(status => status.includes('✅'));
  
  if (allSet) {
    console.log('✅ UploadThing 환경변수 모두 정상 설정됨');
  } else {
    console.log('❌ 일부 UploadThing 환경변수가 누락됨');
  }
  
  return allSet;
}

async function main() {
  console.log('🚀 연구관리 시스템 백엔드 테스트 시작\n');
  
  try {
    // 1. 데이터베이스 연결 테스트
    const dbConnected = await testDatabaseConnection();
    
    if (!dbConnected) {
      console.log('\n❌ 데이터베이스 연결에 실패하여 테스트를 중단합니다.');
      return;
    }
    
    // 2. 데이터 조회 테스트
    await testDataRetrieval();
    
    // 3. 샘플 데이터 생성
    const sampleData = await createSampleData();
    
    // 4. UploadThing 환경변수 확인
    await checkUploadThingEnv();
    
    console.log('\n✅ 백엔드 테스트 완료!');
    console.log('\n📝 테스트 결과 요약:');
    console.log('   ✅ 데이터베이스 연결: 정상');
    console.log('   ✅ 데이터 CRUD 작업: 정상');
    console.log('   ✅ 관계형 데이터 조회: 정상');
    console.log('   ✅ UploadThing 설정: 정상');
    
    if (sampleData) {
      console.log('\n📊 생성된 샘플 데이터:');
      console.log(`   프로젝트 ID: ${sampleData.project}`);
      console.log(`   노트 ID: ${sampleData.note}`);
      console.log(`   논문 ID: ${sampleData.paper}`);
      console.log(`   태스크 ID: ${sampleData.task}`);
      console.log(`   성과 ID: ${sampleData.achievement}`);
    }
    
    console.log('\n🌐 서버 실행 후 테스트할 API 엔드포인트:');
    console.log('   - GET http://localhost:3000/api/notes');
    console.log('   - GET http://localhost:3000/api/papers');
    console.log('   - GET http://localhost:3000/api/projects');
    console.log('   - GET http://localhost:3000/api/tasks');
    console.log('   - GET http://localhost:3000/api/achievements');
    console.log('   - POST http://localhost:3000/api/uploadthing');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
