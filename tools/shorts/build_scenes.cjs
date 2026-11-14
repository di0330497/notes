/* build_scenes.cjs — 50 장면 × 3 기능 = 150 쇼츠 장면 */
const fs = require('fs');
const path = require('path');
const OUT = path.resolve(__dirname, '..', '..', 'build', 'shorts');
fs.mkdirSync(OUT, { recursive: true });

const S = [
  ['카페', ['cafe', 'food'], 'polite', ['jihu', 'aki'], ['첫 주문', '친구와 수다', '주문 실수'], ['N5', 'N4', 'N3']],
  ['편의점', ['konbini', 'shop'], 'polite', ['jihu', 'sato'], ['계산', '알바 인수인계', '상품 문의'], ['N5', 'N4', 'N3']],
  ['레스토랑', ['food'], 'polite', ['jihu', 'hana'], ['주문', '맛 평가', '계산'], ['N5', 'N4', 'N3']],
  ['이자카야', ['food', 'friend'], 'casual', ['jihu', 'aki', 'sato'], ['권유', '고민 상담', '완곡한 거절'], ['N5', 'N3', 'N2']],
  ['패스트푸드', ['food', 'shop'], 'polite', ['jihu', 'aki'], ['세트 주문', '사이즈 변경', '포장'], ['N5', 'N4', 'N3']],
  ['베이커리', ['food', 'shop'], 'polite', ['jihu', 'hana'], ['빵 고르기', '추천', '계산'], ['N5', 'N4', 'N3']],
  ['슈퍼마켓', ['shop', 'food'], 'polite', ['jihu', 'hana'], ['장보기', '계산', '할인'], ['N5', 'N4', 'N3']],
  ['쇼핑몰', ['shop'], 'polite', ['jihu', 'aki'], ['길 찾기', '교환', '선물'], ['N5', 'N4', 'N3']],
  ['옷가게', ['shop'], 'polite', ['jihu', 'hana'], ['사이즈', '시착', '환불'], ['N5', 'N4', 'N3']],
  ['신발가게', ['shop'], 'polite', ['jihu', 'sato'], ['발 사이즈', '교환', '소재'], ['N5', 'N4', 'N3']],
  ['서점', ['shop', 'study'], 'polite', ['jihu', 'sato'], ['책 찾기', '주문', '선물'], ['N5', 'N4', 'N3']],
  ['미용실', ['salon'], 'polite', ['jihu', 'aki'], ['컷 주문', '염색 상담', '예약 변경'], ['N5', 'N3', 'N2']],
  ['병원', ['hospital', 'body'], 'polite', ['jihu', 'hana'], ['증상 설명', '진료 결과', '생활 지도'], ['N5', 'N4', 'N2']],
  ['약국', ['pharmacy', 'hospital'], 'polite', ['jihu', 'sato'], ['처방전', '약 복용', '부작용'], ['N5', 'N4', 'N2']],
  ['시청', ['cityhall'], 'polite', ['jihu', 'sato'], ['전입신고', '서류 발급', '상담'], ['N5', 'N4', 'N2']],
  ['은행', ['bank'], 'polite', ['jihu', 'sato'], ['계좌 개설', '송금', 'ATM 문제'], ['N5', 'N4', 'N2']],
  ['우체국', ['post'], 'polite', ['jihu', 'sato'], ['소포 발송', '주소 문제', '재배달'], ['N5', 'N4', 'N2']],
  ['전철', ['station'], 'polite', ['jihu', 'hana'], ['길 묻기', '지연 안내', '환승'], ['N5', 'N4', 'N2']],
  ['버스', ['station'], 'polite', ['jihu', 'aki'], ['노선 확인', '요금', '하차'], ['N5', 'N4', 'N3']],
  ['공항', ['airport', 'travel'], 'polite', ['jihu', 'sato'], ['체크인', '보안 검색', '탑승'], ['N5', 'N4', 'N2']],
  ['호텔', ['hotel', 'travel'], 'polite', ['jihu', 'aki'], ['체크인', '짐 보관', '체크아웃'], ['N5', 'N4', 'N2']],
  ['료칸', ['hotel', 'travel'], 'polite', ['jihu', 'hana'], ['예약', '온천 매너', '식사'], ['N5', 'N4', 'N2']],
  ['관광지', ['travel', 'nature'], 'polite', ['jihu', 'aki'], ['길 찾기', '사진', '역사'], ['N5', 'N4', 'N2']],
  ['축제', ['festival', 'food'], 'casual', ['jihu', 'hana'], ['음식', '유카타', '사진'], ['N5', 'N4', 'N3']],
  ['학교', ['school', 'study'], 'casual', ['jihu', 'hana'], ['수업', '과제', '시험'], ['N5', 'N4', 'N2']],
  ['도서관', ['school', 'study'], 'polite', ['jihu', 'sato'], ['책 찾기', '대출', '공부'], ['N5', 'N4', 'N2']],
  ['동아리', ['school', 'friend'], 'casual', ['jihu', 'hana', 'ken'], ['합숙 준비', '역할 분담', '회비'], ['N5', 'N4', 'N3']],
  ['아르바이트', ['work', 'konbini'], 'polite', ['jihu', 'sato'], ['첫날', '인수인계', '시프트'], ['N5', 'N4', 'N3']],
  ['회사', ['work', 'business'], 'polite', ['jihu', 'sato', 'tanaka'], ['보고', '회의', '전화 응대'], ['N5', 'N3', 'N2']],
  ['집', ['home'], 'casual', ['jihu', 'hana'], ['청소', '요리', '수리'], ['N5', 'N4', 'N3']],
  ['이웃', ['home', 'friend'], 'polite', ['jihu', 'sato'], ['인사', '소음', '택배'], ['N5', 'N4', 'N3']],
  ['택배', ['home', 'post'], 'polite', ['jihu', 'sato'], ['재배달', '부재', '설치'], ['N5', 'N4', 'N3']],
  ['전화', ['phone', 'work'], 'polite', ['jihu', 'sato'], ['예약', '문의', '잘못 걸린 전화'], ['N5', 'N4', 'N2']],
  ['친구 약속', ['friend'], 'casual', ['jihu', 'hana'], ['약속', '고민', '취미'], ['N5', 'N4', 'N3']],
  ['가족 저녁', ['family', 'home'], 'casual', ['jihu', 'hana', 'aki'], ['저녁', '가족 소개', '고향'], ['N5', 'N4', 'N3']],
  ['연애', ['love', 'friend'], 'casual', ['jihu', 'hana'], ['고백', '데이트', '이별'], ['N5', 'N4', 'N2']],
  ['시험 공부', ['study', 'school'], 'casual', ['jihu', 'ken'], ['단어', '발음', '시험'], ['N5', 'N4', 'N2']],
  ['발음 연습', ['study'], 'casual', ['jihu', 'hana'], ['장음', '악센트', '연습'], ['N5', 'N4', 'N2']],
  ['언어 학습', ['study', 'friend'], 'casual', ['jihu', 'aki'], ['학습법', '실수', '동기'], ['N5', 'N4', 'N2']],
  ['뉴스', ['news', 'work'], 'written', ['jihu', 'tanaka'], ['기사 읽기', '통계', '사회 문제'], ['N4', 'N3', 'N2']],
  ['비즈니스 미팅', ['business', 'work'], 'polite', ['jihu', 'sato', 'tanaka'], ['계약', '일정', '협상'], ['N3', 'N2', 'N1']],
  ['프레젠테이션', ['business', 'work'], 'polite', ['jihu', 'tanaka'], ['발표', '질의응답', '피드백'], ['N3', 'N2', 'N1']],
  ['협상', ['business', 'work'], 'polite', ['jihu', 'sato'], ['가격', '조건', '양보'], ['N3', 'N2', 'N1']],
  ['자연·등산', ['nature', 'travel'], 'casual', ['jihu', 'aki'], ['준비', '날씨', '경치'], ['N3', 'N2', 'N1']],
  ['바다·수영', ['nature', 'travel'], 'casual', ['jihu', 'hana'], ['준비', '안전', '추억'], ['N3', 'N2', 'N1']],
  ['캠핑', ['nature', 'travel'], 'casual', ['jihu', 'ken'], ['장비', '불', '요리'], ['N3', 'N2', 'N1']],
  ['시장', ['foodrare', 'food'], 'casual', ['jihu', 'aki'], ['생선', '채소', '값'], ['N3', 'N2', 'N1']],
  ['생선가게', ['foodrare', 'food'], 'polite', ['jihu', 'sato'], ['종류', '손질', '조리'], ['N3', 'N2', 'N1']],
  ['채소가게', ['foodrare', 'food'], 'polite', ['jihu', 'hana'], ['종류', '제철', '조리'], ['N3', 'N2', 'N1']],
  ['N1 읽기', ['news', 'study'], 'written', ['jihu'], ['사회', '언어', '문화'], ['N2', 'N1', 'N1']]
];

const scenes = [];
let n = 0;
for (const [name, tags, register, chars, fns, levels] of S) {
  fns.forEach((fn, i) => {
    n++;
    scenes.push({
      id: 'sh' + String(n).padStart(3, '0'),
      scene: name,
      tags,
      register,
      chars,
      level: levels[i] || 'N3',
      title: name + ' — ' + fn,
      function: fn
    });
  });
}
fs.writeFileSync(path.join(OUT, 'scenes.json'), JSON.stringify({ total: scenes.length, scenes }, null, 1), 'utf8');
console.log('scenes', scenes.length);
const byLv = {}; for (const s of scenes) byLv[s.level] = (byLv[s.level] || 0) + 1;
console.log(byLv);
