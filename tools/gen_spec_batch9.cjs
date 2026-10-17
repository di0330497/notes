/* 배치 9 스펙 생성기 — 미등장 활용형(missing_subforms.json, 205카드)을
   d144~d151 8편에 분배해 build/spec-batch9.json 을 만든다.
   각 편에 subforms:[{kind,key,targets,exS,exKo}] 커스텀 블록이 들어간다. */
const fs = require('fs');
const rows = JSON.parse(fs.readFileSync('missing_subforms.json', 'utf8'));
const N = 8;
const per = Math.ceil(rows.length / N);

const scenes = [
  { id: 'd144', title: '자취방 이전 조판 — 짐 분류와 견적', scene: '집·일상', place: '도쿄 · 자취방 거실', lv: '2', chars: ['jihu', 'hana', 'aki'],
    brief: '장면: 유우키가 이사할 집을 고르면서 부모님(홋카이도) 승낙을 받고, 아키·하나와 이삿짐 견적 상담 이야기를 나눈다. 물건을 박스에 소분하며 짐을 정리한다.' },
  { id: 'd145', title: '중소 제조사 납품 부품 회의', scene: '직장·사무실', place: '도쿄 · 정비사 창고 사무실', lv: '1', chars: ['jihu', 'tanaka'],
    brief: '장면: 부품 배정 대분류 관리 장비 6개 부서 배속 조정 회의. 하청 전환과 회의 당일 통계 관점의 관리 방식을 타나카 상사와 논의한다.' },
  { id: 'd146', title: '도서 표지 장식 캠페인 문구 회의', scene: '학교·어학원', place: '도쿄 · 대학 그룹 룸', lv: '1', chars: ['jihu', 'hana', 'ken'],
    brief: '장면: 동아리 신간 도서 표지 장식 캠페인 문구 외부 공모전 출품 — 캠페인 문구는 다가오는 사건(12가지 활용 문형)으로 이루어진 문장 화폐. 하나·켄과 문구를 정리한다.' },
  { id: 'd147', title: '면접 스터디 그룹 — 자기소개 연습', scene: '학교·어학원', place: '도쿄 · 카페 2층', lv: '1', chars: ['jihu', 'hana', 'aki'],
    brief: '장면: 면접 스터디 그룹 — 하루 5분 자기소개 4회 연습. 파트너 아키의 피드백을 받으며 질문 방향을 나눈다.' },
  { id: 'd148', title: '가전 매장 냉장고 견적 방문 회의', scene: '쇼핑·가게', place: '도쿄 · 가전 매장 판매실', lv: '1', chars: ['jihu', 'tanaka'],
    brief: '장면: 기업용 냉장고 견적 청구를 받기 위해 가전 매장을 방문. 담당 상담원과 견적 조율(비용, 납기, 세일)을 논의한다.' },
  { id: 'd149', title: '동아리 방 정리 나눔 — 손자형 격려 세션', scene: '학교·어학원', place: '도쿄 · 대학 동아리방', lv: '1', chars: ['jihu', 'hana'],
    brief: '장면: 동아리 방 정리 나눔 — 하루 10분 방 정리 중 손자형 격려 조율. 3가지 정론 정황에 맞는 문형 폼을 하나와 정리한다.' },
  { id: 'd150', title: '사무실 회의 중 올해 국제 협력 지류 통계 확인', scene: '직장·사무실', place: '도쿄 · 사무실 회의실', lv: '1', chars: ['jihu', 'tanaka'],
    brief: '장면: 연말 사무실 회의 — 지주 회사와 협력 통계 양식 확인을 진행한다. 올해 국제 협력 통계를 6개 부서 담당자(타나카 상사)와 점검한다.' },
  { id: 'd151', title: '북 지역 봉사단 신관팀 식사 회합', scene: '식당·이자카야', place: '도쿄 · 이자카야 좌석', lv: '1', chars: ['jihu', 'hana', 'ken'],
    brief: '장면: 북 지역 봉사단 신관팀 식사 회합 — 전반 신관 문제 시정 메뉴 주문 조율. 켄·하나와 팀 일정을 나눈다.' },
];

const spec = scenes.map((sc, i) => {
  const slice = rows.slice(i * per, (i + 1) * per).map(r => ({
    kind: r.kind, key: r.key, targets: r.targets, exS: r.exS, exKo: r.exKo
  }));
  return Object.assign({}, sc, { subforms: slice });
});

fs.mkdirSync('build', { recursive: true });
fs.writeFileSync('build/spec-batch9.json', JSON.stringify(spec, null, 1), 'utf8');
console.log('spec-batch9.json 작성 — 대화 ' + spec.length + '편 / 커버 카드 ' + spec.map(s => s.subforms.length).join('+') + ' = ' + rows.length);
