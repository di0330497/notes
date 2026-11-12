/* coverage_audit.cjs — 사전 항목이 대화에 실제로 등장하는지 센다.
   텍스트(대화 줄) + item 태그(줄·대화)를 모두 근거로 본다.
   출력: build/coverage-audit.json, build/coverage-audit.md */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'j', '2b10e90aebe237af55', 'data');
function load(files, tail) {
  const ctx = { console };
  vm.createContext(ctx);
  vm.runInContext(files.map(f => fs.readFileSync(path.join(DATA, f), 'utf8')).join('\n') + '\n' + tail, ctx, { timeout: 40000 });
  return ctx;
}
const dctx = load(
  fs.readdirSync(DATA).filter(f => /^dialogue-[0-9]+\.js$/.test(f)).sort((a, b) => (+a.match(/\d+/)[0]) - (+b.match(/\d+/)[0]))
    .concat(['dialogue-daily.js', 'daily-overrides.js', 'targets-auto.js', 'coverage-patch.js']),
  'globalThis.D=DIALOGS;'
);
const D = dctx.D;
const ctx = load(
  ['kanji-list.js', 'kanji-cards.js', 'grammar.js', 'patterns.js', 'expressions.js', 'conjugation.js',
    'pos-josa.js', 'pos-verb.js', 'pos-noun.js', 'pos-fukushi.js', 'pos-other.js', 'pos-words.js', 'pos-keiyou-2.js',
    'colloquial.js', 'colloquial-2.js', 'dialect.js', 'slang.js', 'slang-2026.js'],
  'globalThis.X={STUDY_FULL,ALL,FOOD,GRAMMAR,PATS,EXPR,CONJ,SPOKEN,POS_WORDS,POS_JOSA:typeof POS_JOSA!=="undefined"?POS_JOSA:[],POS_ADV:typeof POS_ADV!=="undefined"?POS_ADV:[],POS_OTHER:typeof POS_OTHER!=="undefined"?POS_OTHER:[],POS_VERB:typeof POS_VERB!=="undefined"?POS_VERB:[],POS_NOUN:typeof POS_NOUN!=="undefined"?POS_NOUN:[]};'
);
const { STUDY_FULL, ALL, FOOD, GRAMMAR, PATS, EXPR, CONJ, SPOKEN, POS_WORDS } = ctx.X;
const POS = [].concat(ctx.X.POS_JOSA, ctx.X.POS_ADV, ctx.X.POS_OTHER, ctx.X.POS_VERB, ctx.X.POS_NOUN);

/* 대화 텍스트·태그 */
const strip = s => String(s || '')
  .replace(/\[([^\]|]+)\|[^\]]+\]/g, '$1')
  .replace(/\{([^{}]+)\}/g, '$1')
  .replace(/\[([^\]]+)\]/g, '$1');
const corpus = D.map(d => strip((d.lines || []).map(l => l.s).join('\n'))).join('\n') + '\n' +
  D.flatMap(d => (d.lines || []).map(l => l.item || '')).join('\n') + '\n' +
  D.flatMap(d => (d.tags || []).map(t => t.join(' '))).join('\n');
const N = s => String(s || '')
  .replace(/[〜～]/g, '～').replace(/[\s（）()「」、。,.!?！？]/g, '').toLowerCase();
const C = N(corpus);

function hasText(key) {
  const base = String(key).split(' — ')[0].split('／')[0].split('/')[0].split('·')[0].trim();
  const v = N(base).replace(/～/g, '');
  if (v.length < 1) return false;
  return C.includes(v);
}

const report = {};
function audit(name, items, keyFn, labelFn) {
  let hit = 0;
  const miss = [];
  for (const it of items) {
    const keys = [].concat(keyFn(it)).filter(Boolean);
    if (keys.some(hasText)) hit++;
    else miss.push(labelFn(it));
  }
  report[name] = { total: items.length, hit, rate: +(hit * 100 / items.length).toFixed(1), miss: miss.slice(0, 80), missCount: miss.length };
}

/* 한자는 글자 단위로 직접 */
const allKanji = [...ALL.map(a => a[0]), ...FOOD.map(a => a[0])];
const kanjiHit = allKanji.filter(k => C.includes(k)).length;
const kanjiMiss = allKanji.filter(k => !C.includes(k));
report['한자'] = { total: allKanji.length, hit: kanjiHit, rate: +(kanjiHit * 100 / allKanji.length).toFixed(1), miss: kanjiMiss.slice(0, 100), missCount: kanjiMiss.length };

audit('문형', PATS, p => [p.pat], p => p.pat);
audit('문법', GRAMMAR, g => [g.t], g => g.t);
audit('표현', EXPR, e => [e.expr], e => e.expr);
audit('품사 낱말', POS_WORDS, w => [w.w], w => w.w);
audit('품사 표', POS, x => [x.t, ...(x.rows || []).map(r => r[0])], x => x.t);
audit('구어체', SPOKEN, s => [s.t, ...(s.forms || []).map(f => f[0]), ...(s.forms || []).map(f => f[1])], s => s.t);
/* 활용표: 표 단위 + 행 단위 */
audit('활용표', CONJ, c => [c.t, ...(c.rows || []).map(r => r[0])], c => c.t);
const conjCells = [];
for (const c of CONJ) for (const r of c.rows || []) for (const cell of r) conjCells.push({ c: c.t, v: cell });
let ch = 0; const cmiss = [];
for (const x of conjCells) { if (hasText(x.v)) ch++; else cmiss.push(x.v); }
report['활용표 활용형'] = { total: conjCells.length, hit: ch, rate: +(ch * 100 / conjCells.length).toFixed(1), miss: cmiss.slice(0, 100), missCount: cmiss.length };

fs.writeFileSync(path.join(ROOT, 'build', 'coverage-audit.json'), JSON.stringify(report, null, 1), 'utf8');
const md = ['# 대화 커버리지 감사', '', `대화 ${D.length}편 · ${D.reduce((a, d) => a + d.lines.length, 0)}줄`, '', '| 영역 | 전체 | 등장 | 커버리지 |', '|---|---:|---:|---:|'];
for (const [k, v] of Object.entries(report)) md.push(`| ${k} | ${v.total} | ${v.hit} | ${v.rate}% |`);
md.push('', '## 미등장 상위', '');
for (const [k, v] of Object.entries(report)) {
  md.push(`### ${k} — ${v.missCount}개 미등장`);
  md.push(v.miss.slice(0, 30).map(x => '- ' + x).join('\n'));
  md.push('');
}
fs.writeFileSync(path.join(ROOT, 'build', 'coverage-audit.md'), md.join('\n') + '\n', 'utf8');
console.log(Object.fromEntries(Object.entries(report).map(([k, v]) => [k, v.rate + '%'])));
