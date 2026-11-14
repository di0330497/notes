/* build_n1.cjs — N1 문법 180개를 45개 읽기 쇼츠에 4개씩 */
const fs = require('fs');
const path = require('path');
const OUT = path.resolve(__dirname, '..', '..', 'build', 'shorts');
const all = JSON.parse(fs.readFileSync(path.join(OUT, 'grammar-targets.json'), 'utf8')).targets;
const n1 = all.filter(t => t.level === 'N1');
const topics = [
  '사회', '경제', '노동', '교육', '환경', '기술', '언어', '문화', '역사', '도시',
  '의료', '복지', '미디어', '정치', '국제', '과학', '예술', '문학', '철학', '심리',
  '가족', '세대', '지역', '농업', '에너지', '교통', '주거', '소비', '기업', '법',
  '인권', '이민', '관광', '스포츠', '종교', '전쟁', '평화', '재해', '기후', '자원',
  '인공지능', '정보', '출판', '방송', '건강'
];
const scenes = [];
for (let i = 0; i < 45; i++) {
  const ts = n1.slice(i * 4, i * 4 + 4);
  if (!ts.length) break;
  scenes.push({
    id: 'n' + String(i + 1).padStart(3, '0'),
    scene: 'N1 읽기', title: 'N1 읽기 — ' + topics[i], level: 'N1', register: 'written',
    chars: ['jihu'], function: topics[i], tags: ['news'],
    targets: ts.map(t => ({ kind: t.kind, key: t.key, level: t.level, note: t.note }))
  });
}
fs.writeFileSync(path.join(OUT, 'n1-assignments.json'), JSON.stringify({ total: scenes.length, scenes }, null, 1), 'utf8');
console.log('n1 targets', n1.length, 'scenes', scenes.length, 'assigned', scenes.reduce((a, s) => a + s.targets.length, 0));
