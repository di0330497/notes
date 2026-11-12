/* daily_plan.cjs — 20세 일상 목표: 장면 재분류 + 코어 항목 추출
   사용: node tools/daily_plan.cjs
   출력: build/scene-map.json, build/core-items.json, build/daily-plan.md */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SITE = path.join(ROOT, 'j', '2b10e90aebe237af55');
const DATA = path.join(SITE, 'data');

function load(files, tail) {
  const ctx = { console };
  vm.createContext(ctx);
  const code = files.map(f => fs.readFileSync(path.join(DATA, f), 'utf8')).join('\n');
  vm.runInContext(code + '\n' + tail, ctx, { timeout: 30000 });
  return ctx;
}

const dctx = load(
  fs.readdirSync(DATA).filter(f => /^dialogue-[0-9]+\.js$/.test(f)).sort((a, b) => (+a.match(/\d+/)[0]) - (+b.match(/\d+/)[0]))
    .concat(['dialogue-daily.js', 'daily-overrides.js', 'scene-reskin.js', 'context-rewrite.js']),
  'globalThis.D=DIALOGS;'
);
const D = dctx.D;
const ctx = load(
  ['kanji-list.js', 'kanji-cards.js', 'grammar.js', 'patterns.js', 'expressions.js', 'conjugation.js',
    'pos-josa.js', 'pos-verb.js', 'pos-noun.js', 'pos-fukushi.js', 'pos-other.js', 'pos-words.js', 'pos-keiyou-2.js',
    'colloquial.js', 'colloquial-2.js', 'dialect.js', 'slang.js', 'slang-2026.js'],
  'globalThis.X={STUDY_FULL,ALL,GRAMMAR,PATS,EXPR,CONJ,SPOKEN,POS_WORDS};'
);
const { STUDY_FULL, ALL, GRAMMAR, PATS, EXPR, CONJ, SPOKEN, POS_WORDS } = ctx.X;

const norm = s => String(s || '').replace(/[〜～]/g, '～').replace(/[\s（）()「」]/g, '').replace(/[／/]/g, '/').replace(/[?？!！。、,.]/g, '');
const LVW = { '5': 5, '4': 4, '3': 3, '2': 2, '1': 1, '0': 1 };

/* ── 1. 장면 재분류 ─────────────────────────────── */
const WORK = /(거래|계약|감사|납품|결재|품의|프레젠테이션|사내|본사|영업|임원|결산|예산|매출|협상|조항|발주|거래처|상무|부장|과장|대책 회의|킥오프|스프린트|프로젝트|출장|보고서|품의서)/;
const OFFICE_DAILY = /(첫 출근|연차|OJT|야근|잡담|라운지|탕비실|시프트|아르바이트|알바|면접|환영회|술자리|전화|창고|연휴|아침|로비|휴게실|계단)/;
const COVERAGE = /(때를 가리키는|어떻게 하는지를|이유·원인의|말을 돌리는|몸에 관한|상황의 말|통과된 기획|회의실 뒷이야기|회의실 밖|회의 전 확인|회의 준비|행사 안내|상사와의|새 업무|전근 통보|기획 회의|제출은|道が|シフトの|会議の|오후 미팅|회의 전후|연말 인사|업무 중 벌어진|명사를 꾸미는|마음의 움직임을|말을 메우는|성격의 말|어려움의 말|신입 환영회 안내문)/;

const OVERRIDE = {
  d08: 'life', d18: 'life', d21: 'campus', d23: 'life', d30: 'campus', d37: 'peer',
  d41: 'life', d44: 'peer', d45: 'life', d55: 'peer', d76: 'peer', d77: 'peer', d368: 'peer', d369: 'peer', d370: 'life', d371: 'life',
  d372: 'campus', d373: 'life'
};
function classify(d) {
  if (OVERRIDE[d.id]) return OVERRIDE[d.id];
  const s = d.scene || '';
  const t = d.title || '';
  if (/(친구|연애|데이트|SNS|メッセージ|メ신저|단톡|동아리|스포츠)/.test(s) || /(친구|연애|데이트|SNS|메신저|단톡|동아리)/.test(t)) return 'peer';
  if (s === '문법 보강') return 'coverage';
  if (s === '직장·사무실') {
    if (COVERAGE.test(t)) return 'coverage';
    if (WORK.test(t)) return 'work';
    if (OFFICE_DAILY.test(t)) return 'life';
    return 'work';
  }
  if (s === '학교·어학원' || s === '학교·대학가') return 'campus';
  if (s === '집·일상' || s === '쇼핑·가게' || s === '전철·교통' || s === '병원·약국' || s === '편의점' ||
      s === '우체국·은행' || s === '여행·숙박' || s === '공항·야외' || s === '식당·이자카야' || s === '카페') return 'life';
  return 'life';
}

const sceneMap = D.map(d => ({
  id: d.id, title: d.title, scene: d.scene, place: d.place, lv: d.lv, lines: (d.lines || []).length,
  track: classify(d),
}));
const counts = sceneMap.reduce((a, x) => (a[x.track] = (a[x.track] || 0) + 1, a), {});
fs.mkdirSync(path.join(ROOT, 'build'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'build', 'scene-map.json'), JSON.stringify(sceneMap, null, 1), 'utf8');

/* ── 2. 항목 노출 집계 ──────────────────────────── */
const items = new Map();
function touch(kind, key, d, line) {
  if (!kind || !key) return;
  const k = kind + ' · ' + key;
  if (!items.has(k)) items.set(k, { kind, key, dialogues: new Set(), lines: 0, levels: new Set() });
  const o = items.get(k);
  o.dialogues.add(d.id);
  o.lines++;
  o.levels.add(d.lv);
}
for (const d of D) {
  for (const t of d.tags || []) if (Array.isArray(t)) touch(t[0], t[1], d, -1);
  (d.lines || []).forEach((l, i) => {
    if (!l.item) return;
    const m = String(l.item).match(/^([^ ·]+)\s*·\s*(.+)$/);
    if (m) touch(m[1], m[2], d, i);
  });
}
const CORE_QUOTA = { '문형': 220, '문법': 160, '한자': 120, '구어체': 90, '표현': 70, '품사': 60, '활용표': 10 };
const bestLv = o => {
  const lv = [...o.levels].filter(x => x !== undefined);
  if (!lv.length) return 3;
  return Math.max(...lv.map(x => +x).filter(x => !isNaN(x)));
};
const ranked = [...items.values()].map(o => {
  const lv = bestLv(o);
  const lvW = LVW[lv] ?? 2;
  const score = o.dialogues.size * 12 + Math.min(o.lines, 10) * 2 + lvW * 4;
  return { kind: o.kind, key: o.key, exposures: o.dialogues.size, lines: o.lines, level: 'N' + lv, lv, score };
});
const core = [];
for (const [kind, n] of Object.entries(CORE_QUOTA)) {
  const arr = ranked.filter(x => x.kind === kind).sort((a, b) => b.score - a.score).slice(0, n);
  core.push(...arr);
}
const coreSet = new Set(core.map(x => x.kind + ' · ' + x.key));
for (const x of ranked.sort((a, b) => b.score - a.score)) {
  if (core.length >= 700) break;
  if (coreSet.has(x.kind + ' · ' + x.key)) continue;
  core.push(x); coreSet.add(x.kind + ' · ' + x.key);
}
core.sort((a, b) => b.score - a.score);
fs.writeFileSync(path.join(ROOT, 'build', 'core-items.json'), JSON.stringify(core, null, 1), 'utf8');

/* ── 3. 리포트 ─────────────────────────────────── */
const once = ranked.filter(x => x.exposures === 1).length;
const md = [];
md.push('# 20세 일상 목표 — 0단계 리포트');
md.push('');
md.push('- 대화: ' + D.length + '편 / ' + D.reduce((a, d) => a + (d.lines || []).length, 0) + '줄');
md.push('- 항목 라벨: ' + ranked.length + '개 / 1회 노출: ' + once + '개 (' + (once * 100 / ranked.length).toFixed(1) + '%)');
md.push('- 코어 선정: ' + core.length + '개');
md.push('');
md.push('## 트랙 분포');
md.push('');
md.push('| track | 편수 | 뜻 |');
md.push('|---|---|---|');
const TNAME = { peer: '또래 수다·SNS', life: '생활 행정·알바', campus: '캠퍼스', work: '직장·비즈니스(보강)', coverage: '커버리지 보강' };
for (const [k, v] of Object.entries(counts)) md.push(`| ${k} | ${v} | ${TNAME[k] || ''} |`);
md.push('');
md.push('## 코어 700 구성');
md.push('');
md.push('| 종류 | 개수 |');
md.push('|---|---|');
const ck = core.reduce((a, x) => (a[x.kind] = (a[x.kind] || 0) + 1, a), {});
for (const [k, v] of Object.entries(ck)) md.push(`| ${k} | ${v} |`);
md.push('');
md.push('## 1회 노출 상위 (코어에서 3회로 끌어올릴 후보)');
md.push('');
md.push('| 항목 | 노출 | 레벨 |');
md.push('|---|---|---|');
for (const x of ranked.filter(x => x.exposures === 1).slice(0, 40)) md.push(`| ${x.kind} · ${x.key} | 1 | ${x.level} |`);
fs.writeFileSync(path.join(ROOT, 'build', 'daily-plan.md'), md.join('\n') + '\n', 'utf8');

console.log('tracks', counts);
console.log('items', ranked.length, 'once', once, 'core', core.length);
console.log('core kinds', ck);
console.log('wrote build/scene-map.json, build/core-items.json, build/daily-plan.md');
