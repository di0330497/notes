/* 배치 10 (재설계) — 품사 낱말 미태깅 768개를 d162~d190 29편에 분배.
   낱말 1개 = 대사 1줄 = item 「품사 · 낱말」. 각 편은 카테고리 묶음 하나. */
const fs = require('fs');
const untagged = JSON.parse(fs.readFileSync('pos_untagged.json', 'utf8'));

/* 카테고리 → 장면 */
const SCENE = {
  counter: { scene: '쇼핑·가게', place: '도쿄 · 상점가와 이자카야', t: '수를 세는 말 — 조수사' },
  time: { scene: '직장·사무실', place: '도쿄 · 회사 회의실', t: '때를 가리키는 말' },
  state: { scene: '집·일상', place: '도쿄 · 자취방', t: '상태를 나타내는 말' },
  manner: { scene: '직장·사무실', place: '도쿄 · 사무실', t: '어떻게 하는지를 나타내는 말' },
  degree: { scene: '카페', place: '도쿄 · 카페', t: '정도를 나타내는 말' },
  mood: { scene: '카페', place: '도쿄 · 카페 창가', t: '기분·양태의 말' },
  quant: { scene: '쇼핑·가게', place: '도쿄 · 마트', t: '양을 나타내는 말' },
  sound: { scene: '전철·교통', place: '도쿄 · 전철과 집', t: '소리를 흉내 내는 말' },
  feel: { scene: '집·일상', place: '도쿄 · 자취방', t: '느낌·감각의 말' },
  rentai: { scene: '학교·어학원', place: '도쿄 · 대학 강의실', t: '명사를 꾸미는 말' },
  vdo: { scene: '집·일상', place: '도쿄 · 자취방', t: '동작을 나타내는 말' },
  vfeel: { scene: '학교·어학원', place: '도쿄 · 대학 세미나실', t: '마음의 움직임을 나타내는 말' },
  keval: { scene: '집·일상', place: '도쿄 · 자취방', t: '평가를 나타내는 말' },
  excl: { scene: '직장·사무실', place: '도쿄 · 사무실', t: '감탄·부름의 말' },
  call: { scene: '쇼핑·가게', place: '도쿄 · 상점가', t: '부르는 말' },
  vsocial: { scene: '직장·사무실', place: '도쿄 · 회사 회의실', t: '사람 사이의 동작' },
  add: { scene: '식당·이자카야', place: '도쿄 · 이자카야', t: '덧붙이는 말' },
  resp: { scene: '카페', place: '도쿄 · 카페 카운터', t: '응대의 말' },
  advs: { scene: '직장·사무실', place: '도쿄 · 사무실', t: '문장을 잇는 부사' },
  cause: { scene: '학교·어학원', place: '도쿄 · 세미나실', t: '이유·원인의 말' },
  rest: { scene: '카페', place: '도쿄 · 카페', t: '나머지 낱말' },
  fill: { scene: '학교·어학원', place: '도쿄 · 강의실', t: '말을 메우는 표현' },
  vlife: { scene: '집·일상', place: '도쿄 · 자취방', t: '생활 동작의 말' },
  numread: { scene: '쇼핑·가게', place: '도쿄 · 가게', t: '숫자 읽기' },
  emotion: { scene: '집·일상', place: '도쿄 · 자취방', t: '감정의 말' },
  turn: { scene: '직장·사무실', place: '도쿄 · 회의실', t: '말을 돌리는 표현' },
  kidiom: { scene: '직장·사무실', place: '도쿄 · 사무실', t: '몸에 관한 관용 표현' },
  taste: { scene: '식당·이자카야', place: '도쿄 · 식당', t: '맛의 말' },
  personality: { scene: '학교·어학원', place: '도쿄 · 동아리방', t: '성격의 말' },
  difficulty: { scene: '학교·어학원', place: '도쿄 · 강의실', t: '어려움의 말' },
  situation: { scene: '직장·사무실', place: '도쿄 · 사무실', t: '상황의 말' },
};

/* 카테고리 → 편 수 */
const PLAN = [
  ['counter', 3], ['time', 2], ['state', 2], ['manner', 2], ['degree', 2], ['mood', 2],
  ['quant', 2], ['sound', 1], ['feel', 1], ['rentai', 1], ['vdo', 1], ['vfeel', 1], ['keval', 1],
  ['excl', 1], ['call', 1], ['vsocial', 1], ['add', 1], ['resp', 1],
  ['advs', 1], ['cause', 1], ['rest', 1], ['fill', 1], ['vlife', 1], ['numread', 1],
  ['emotion', 1], ['turn', 1], ['kidiom', 1], ['taste', 1], ['personality', 1], ['difficulty', 1], ['situation', 1],
];

const byCat = {};
untagged.forEach(x => { (byCat[x.c] = byCat[x.c] || []).push(x); });

let dno = 162;
const spec = [];
PLAN.forEach(([cat, cnt]) => {
  const words = byCat[cat] || [];
  if (!words.length) return;
  const per = Math.ceil(words.length / cnt);
  for (let i = 0; i < cnt; i++) {
    const slice = words.slice(i * per, (i + 1) * per);
    if (!slice.length) continue;
    const sc = SCENE[cat] || { scene: '집·일상', place: '도쿄 · 실내', t: cat };
    spec.push({
      id: 'd' + (dno++),
      cat,
      title: sc.t + (cnt > 1 ? ' ' + (i + 1) : ''),
      scene: sc.scene,
      place: sc.place,
      lv: '3',
      chars: ['jihu', 'hana', 'aki', 'ken', 'tanaka'].slice(0, 2 + (dno % 2)),
      words: slice,
    });
  }
});

fs.writeFileSync('build/spec-batch10.json', JSON.stringify(spec, null, 1), 'utf8');
console.log('대화', spec.length + '편 / 낱말', spec.reduce((n, s) => n + s.words.length, 0) + '개 / id ' + spec[0].id + '~' + spec[spec.length - 1].id);
spec.forEach(s => console.log('  ' + s.id + ' [' + s.cat + '] ' + s.words.length + '개 — ' + s.title));
