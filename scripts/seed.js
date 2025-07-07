const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('시드 데이터 생성 시작...');

  // 프로젝트 생성
  const project1 = await prisma.project.create({
    data: {
      projectName: '언론 자유와 민주주의 연구',
      description: '한국 민주주의 발전과 언론 자유의 상관관계에 대한 연구',
    },
  });

  const project2 = await prisma.project.create({
    data: {
      projectName: '미디어 리터러시 교육 효과 연구',
      description: '청소년 대상 미디어 리터러시 교육의 효과성 분석',
    },
  });

  console.log('프로젝트 생성 완료');

  // 노트 생성
  await prisma.note.create({
    data: {
      title: '언론 자유 지수 분석',
      content: '2024년 세계 언론 자유 지수에서 한국의 순위와 개선 방안에 대한 연구 노트',
      tags: ['언론자유', '민주주의', '지수분석'],
    },
  });

  await prisma.note.create({
    data: {
      title: '미디어 리터러시 교육 방법론',
      content: '효과적인 미디어 리터러시 교육을 위한 방법론 정리',
      tags: ['미디어리터러시', '교육', '방법론'],
    },
  });

  console.log('노트 생성 완료');

  // 논문 생성
  await prisma.paper.create({
    data: {
      title: 'Press Freedom and Democratic Governance in South Korea',
      authors: '김민수, 이영희',
      year: 2024,
      publisher: '한국언론학회',
      notes: '언론 자유와 민주주의 거버넌스에 관한 연구',
      projects: {
        connect: { id: project1.id }
      }
    },
  });

  await prisma.paper.create({
    data: {
      title: 'Media Literacy Education for Digital Natives',
      authors: '박지원, 최성호, 정은미',
      year: 2023,
      publisher: '미디어교육연구소',
      notes: '디지털 네이티브를 위한 미디어 리터러시 교육',
      projects: {
        connect: { id: project2.id }
      }
    },
  });

  console.log('논문 생성 완료');

  // 태스크 생성
  await prisma.task.create({
    data: {
      taskName: '문헌 조사 완료',
      description: '언론 자유 관련 최신 문헌 조사',
      dueDate: new Date('2025-08-15'),
      status: 'pending',
      projectId: project1.id,
    },
  });

  await prisma.task.create({
    data: {
      taskName: '설문 조사 설계',
      description: '미디어 리터러시 교육 효과 측정을 위한 설문 조사 설계',
      dueDate: new Date('2025-07-30'),
      status: 'pending',
      projectId: project2.id,
    },
  });

  console.log('태스크 생성 완료');

  // 성과 생성
  await prisma.achievement.create({
    data: {
      title: '한국언론학회 우수논문상 수상',
      achievementDate: new Date('2024-12-01'),
      description: '언론 자유와 민주주의에 관한 연구로 우수논문상 수상',
      type: '수상',
    },
  });

  await prisma.achievement.create({
    data: {
      title: '미디어 리터러시 연구 프로젝트 선정',
      achievementDate: new Date('2024-11