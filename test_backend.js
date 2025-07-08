const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');

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
  } finally {
    await prisma.$disconnect();
  }
}

async function testAPIEndpoints() {
  console.log('\n🔍 API 엔드포인트 테스트...');
  
  const baseURL = 'http://localhost:3000';
  const endpoints = [
    '/api/notes',
    '/api/papers', 
    '/api/projects',
    '/api/tasks',
    '/api/achievements',
    '/api/experts',
    '/api/materials'
  ];
  
  const results = {};
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseURL}${endpoint}`);
      const data = await response.json();
      
      if (response.ok) {
        results[endpoint] = {
          status: '✅ 성공',
          count: Array.isArray(data) ? data.length : 'N/A',
          data: data
        };
        console.log(`✅ ${endpoint}: ${Array.isArray(data) ? data.length : 'N/A'}개 데이터`);
      } else {
        results[endpoint] = {
          status: '❌ 실패',
          error: data.error || '알 수 없는 오류'
        };
        console.log(`❌ ${endpoint}: ${data.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      results[endpoint] = {
        status: '❌ 연결 실패',
        error: error.message
      };
      console.log(`❌ ${endpoint}: 연결 실패 - ${error.message}`);
    }
  }
  
  return results;
}

async function testUploadThingConfig() {
  console.log('\n🔍 UploadThing 설정 확인...');
  
  const requiredEnvVars = [
    'UPLOADTHING_TOKEN',
    'UPLOADTHING_SECRET', 
    'UPLOADTHING_APP_ID'
  ];
  
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.log('❌ 누락된 환경변수:', missing.join(', '));
    return false;
  }
  
  console.log('✅ UploadThing 환경변수 모두 설정됨');
  
  // UploadThing 엔드포인트 테스트
  try {
    const response = await fetch('http://localhost:3000/api/uploadthing');
    console.log(`UploadThing 엔드포인트 상태: ${response.status}`);
    
    if (response.status === 404) {
      console.log('⚠️  UploadThing 엔드포인트 미구현 또는 서버 미실행');
    } else if (response.ok) {
      console.log('✅ UploadThing 엔드포인트 정상');
    }
  } catch (error) {
    console.log('❌ UploadThing 엔드포인트 테스트 실패:', error.message);
  }
  
  return true;
}

async function createSampleData() {
  console.log('\n🔍 샘플 데이터 생성 테스트...');
  
  try {
    await prisma.$connect();
    
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
    
    return {
      project: project.id,
      note: note.id, 
      paper: paper.id,
      task: task.id
    };
    
  } catch (error) {
    console.error('❌ 샘플 데이터 생성 실패:', error.message);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  console.log('🚀 연구관리 시스템 백엔드 테스트 시작\n');
  
  // 1. 데이터베이스 연결 테스트
  const dbConnected = await testDatabaseConnection();
  
  if (!dbConnected) {
    console.log('\n❌ 데이터베이스 연결에 실패하여 테스트를 중단합니다.');
    return;
  }
  
  // 2. 샘플 데이터 생성
  const sampleData = await createSampleData();
  
  // 3. UploadThing 설정 확인
  await testUploadThingConfig();
  
  // 4. API 엔드포인트 테스트 (서버가 실행 중일 때만)
  console.log('\n⚠️  API 엔드포인트 테스트를 위해서는 다음 명령어로 서버를 실행하세요:');
  console.log('   npm run dev');
  console.log('\n서버 실행 후 다음 URL들을 테스트할 수 있습니다:');
  console.log('   - http://localhost:3000/api/notes');
  console.log('   - http://localhost:3000/api/papers');
  console.log('   - http://localhost:3000/api/projects');
  console.log('   - http://localhost:3000/api/tasks');
  console.log('   - http://localhost:3000/api/achievements');
  console.log('   - http://localhost:3000/api/experts');
  console.log('   - http://localhost:3000/api/materials');
  
  console.log('\n✅ 백엔드 테스트 완료!');
  
  if (sampleData) {
    console.log('\n📝 생성된 샘플 데이터 ID:');
    console.log(`   프로젝트: ${sampleData.project}`);
    console.log(`   노트: ${sampleData.note}`);
    console.log(`   논문: ${sampleData.paper}`);
    console.log(`   태스크: ${sampleData.task}`);
  }
}

main().catch(console.error);
