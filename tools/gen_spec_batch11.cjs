/* 배치 11 스펙 — 엄밀 미커버(문형 77 + 표현 18 + 구어체 4 = 99)를 d201~d205 5편에 고르게 분배 */
const fs = require('fs'), path = require('path');
const D = 'j/2b10e90aebe237af55/data/';
const load = (files, name) => { new Function(files.map(f => fs.readFileSync(path.join(D, f), 'utf8')).join('\n;\n') + ';globalThis.__X=' + name + ';')(); return globalThis.__X; };
const PATS = load(['patterns.js'], 'PATS');
const EXPR = load(['expressions.js'], 'EXPR');
const SPOKEN = load(['colloquial.js', 'colloquial-2.js', 'dialect.js', 'slang.js'], 'SPOKEN');
const dlgFiles = fs.readdirSync(D).filter(f => /^dialogue-\d+\.js$/.test(f) && f !== 'dialogue-0.js')
  .sort((a, b) => parseInt(a.match(/\d+/)) - parseInt(b.match(/\d+/)));
globalThis.DIALOGS = [];
new Function(dlgFiles.map(f => fs.readFileSync(D + f, 'utf8')).join('\n;\n'))();
const DIALOGS = globalThis.DIALOGS;

const plain = s => String(s || '').replace(/\[([^|\]]+)\|([^\]]+)\]/g, '$1').replace(/\{([^{}|]+)\|([^{}|]+)\}/g, '$1').replace(/[{}]/g, '');
const norm = t => plain(t).replace(/[～〜~]/g, '').replace(/（[^）]*）/g, '').replace(/\([^)]*\)/g, '').replace(/[\s·・]/g, '');
const lineItem = new Set();
DIALOGS.forEach(d => (d.lines || []).forEach(l => { if (l.item) lineItem.add(String(l.item)); }));

function strictMiss(kind, keys) {
  const out = [];
  keys.forEach(k => {
    if (lineItem.has(kind + ' · ' + k)) return;
    const nk = norm(k);
    let partial = false;
    for (const it of lineItem) {
      if (!it.startsWith(kind)) continue;
      const ik = norm(it.split(' · ')[1] || '');
      if (ik && nk && (ik.indexOf(nk) >= 0 || nk.indexOf(ik) >= 0)) { partial = true; break; }
    }
    if (!partial) out.push({ kind, key: k });
  });
  return out;
}
const miss = [].concat(
  strictMiss('문형', PATS.map(x => x.pat)),
  strictMiss('표현', EXPR.map(x => x.expr)),
  strictMiss('구어체', SPOKEN.map(x => x.t)),
);
console.log('엄밀 미커버 총', miss.length, '(문형', strictMiss('문형', PATS.map(x => x.pat)).length, '/ 표현', strictMiss('표현', EXPR.map(x => x.expr)).length, '/ 구어체', strictMiss('구어체', SPOKEN.map(x => x.t)).length + ')');

const N = 5;
const per = Math.ceil(miss.length / N);
const scenes = [
  { title: '동아리 신입 환영 준비 — 규칙과 희망', scene: '학교·어학원', place: '도쿄 · 대학 동아리방', lv: '2', chars: ['jihu', 'hana', 'ken'], brief: '장면: 신입 환영회 준비를 하며 ~하면 안 된다 / ~해야 한다 / ~하지 않는 편이 좋다 / ~할 수 있다 / ~하고 싶다 / ~해 두다 같은 규칙·희망·금지를 실제 대화로 주고받는다.' },
  { title: '업무 중 벌어진 문제 — 추측과 단정', scene: '직장·사무실', place: '도쿄 · 회사 탕비실', lv: '1', chars: ['jihu', 'tanaka'], brief: '장면: 납품 문제를 두고 ~일 리가 없다 / ~에 틀림없다 / ~하지 않을 수 없다 / ~할 수밖에 없다 / ~에 지나지 않는다처럼 추측·단정·양보를 정중체로 주고받는다.' },
  { title: '이사와 계약 — 조건과 한정', scene: '집·일상', place: '도쿄 · 부동산 사무소', lv: '1', chars: ['jihu', 'sato'], brief: '장면: 새 집 계약 조건을 두고 ~에 한해 / ~에 관해 / ~에 걸쳐 / ~을 둘러싸고 / ~에 달려 있다처럼 한정·범위·조건을 정중체로 확인한다.' },
  { title: '못 하는 일과 참는 마음 — 부정 표현', scene: '집·일상', place: '도쿄 · 자취방', lv: '1', chars: ['jihu', 'hana'], brief: '장면: 하루를 돌아보며 ~할 수 없다 / ~하지 않을 수 없다 / ~하는 수밖에 없다 / 전혀 ~않다 / 결코 ~않다 / 좀처럼 ~않다 같은 부정·양보 표현을 반말로 주고받는다.' },
  { title: '연말 인사와 첫 출근 — 정형 인사말', scene: '직장·사무실', place: '도쿄 · 회사 현관', lv: '2', chars: ['jihu', 'sato', 'tanaka'], brief: '장면: 연말·신년 인사 자리에서 정형 인사말(お疲れ様でした / お世話になっております / 申し訳ございませんでした / 恐れ入ります / 都合が悪くて 등)을 실제로 쓰고, 되묻는 「～っけ？」도 섞는다.' },
];

const spec = [];
for (let i = 0; i < N; i++) {
  const slice = miss.slice(i * per, (i + 1) * per);
  if (!slice.length) continue;
  spec.push(Object.assign({ id: 'd' + (201 + i), items: slice }, scenes[i]));
}
fs.writeFileSync('build/spec-batch11.json', JSON.stringify(spec, null, 1), 'utf8');
spec.forEach(s => console.log(s.id + ': ' + s.items.length + '개 — ' + s.title));
