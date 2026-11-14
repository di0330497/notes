/* reconstruct.cjs — 0~3단계: 코어 700 선정, 한자 층 분리, 레슨 계획 생성
   출력: build/reconstruction/*.json, report.md */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'j', '2b10e90aebe237af55', 'data');
const OUT = path.join(ROOT, 'build', 'reconstruction');
fs.mkdirSync(OUT, { recursive: true });

function load(files, tail) {
  const ctx = { console };
  vm.createContext(ctx);
  vm.runInContext(files.map(f => fs.readFileSync(path.join(DATA, f), 'utf8')).join('\n') + '\n' + tail, ctx, { timeout: 60000 });
  return ctx;
}
const dctx = load(
  fs.readdirSync(DATA).filter(f => /^dialogue-[0-9]+\.js$/.test(f)).sort((a, b) => (+a.match(/\d+/)[0]) - (+b.match(/\d+/)[0]))
    .concat(['dialogue-daily.js', 'daily-overrides.js', 'scene-reskin.js', 'context-rewrite.js', 'rewrite-20.js', 'rewrite-40.js', 'rewrite-60.js', 'rewrite-80.js', 'rewrite-final.js', 'rewrite-n1.js', 'tracks.js', 'targets-auto.js', 'coverage-patch.js']),
  'globalThis.D=DIALOGS;globalThis.T=DLG_TRACK;'
);
const D = dctx.D;
const ctx = load(
  ['kanji-list.js', 'kanji-cards.js', 'grammar.js', 'patterns.js', 'expressions.js', 'conjugation.js',
    'pos-josa.js', 'pos-verb.js', 'pos-noun.js', 'pos-fukushi.js', 'pos-other.js', 'pos-words.js', 'pos-keiyou-2.js',
    'colloquial.js', 'colloquial-2.js', 'dialect.js', 'slang.js', 'slang-2026.js'],
  'globalThis.X={STUDY_FULL,ALL,FOOD,GRAMMAR,PATS,EXPR,CONJ,SPOKEN,POS_WORDS};'
);
const { STUDY_FULL, ALL, FOOD, GRAMMAR, PATS, EXPR, CONJ, SPOKEN, POS_WORDS } = ctx.X;
const POS = [].concat(ctx.X.POS_JOSA, ctx.X.POS_ADV, ctx.X.POS_OTHER, ctx.X.POS_VERB, ctx.X.POS_NOUN);

const norm = s => String(s || '').replace(/[〜～]/g, '～').replace(/[\s（）()「」、。,.!?！？·・／/]/g, '').toLowerCase();
const strip = s => String(s || '').replace(/\[([^\]|]+)\|[^\]]+\]/g, '$1').replace(/\{([^{}]+)\}/g, '$1').replace(/\[([^\]]+)\]/g, '');
const text = (d, from = 0, to = 1e9) => strip((d.lines || []).slice(from, to).map(l => l.s).join('\n'));
const allText = D.map(d => text(d)).join('\n');

/* ── 아이템 노출 ── */
const itemMap = new Map();
function touch(kind, key, d, line) {
  const k = kind + ' · ' + key;
  if (!itemMap.has(k)) itemMap.set(k, { kind, key, dialogues: new Set(), lines: [] });
  const o = itemMap.get(k);
  o.dialogues.add(d.id);
  o.lines.push({ id: d.id, line });
}
for (const d of D) {
  for (const t of d.tags || []) if (Array.isArray(t)) touch(t[0], t[1], d, -1);
  (d.lines || []).forEach((l, i) => {
    if (!l.item) return;
    const m = String(l.item).match(/^([^ ·]+)\s*·\s*(.+)$/);
    if (m) touch(m[1], m[2], d, i);
  });
}

/* ── 1) 코어 700 ── */
const QUOTA = { '문법': 200, '문형': 80, '표현': 120, '구어체': 70, '한자': 150, '품사': 60, '활용표': 20 };
const LVW = { '5': 5, '4': 4, '3': 3, '2': 2, '1': 1, '0': 1 };
const grammarKeys = new Set(GRAMMAR.map(g => norm(g.t)));
const core = [];
const canonMap = {};
/* 문법/문형 canonical */
const patternOnly = PATS.filter(p => !grammarKeys.has(norm(p.pat)));
for (const p of PATS) if (grammarKeys.has(norm(p.pat))) canonMap['문형 · ' + p.pat] = '문법 · ' + GRAMMAR.find(g => norm(g.t) === norm(p.pat)).t;
const candidates = { '문법': [], '문형': [], '표현': [], '구어체': [], '품사': [], '활용표': [] };
for (const g of GRAMMAR) candidates['문법'].push({ kind: '문법', key: g.t, lv: g.lv, item: g });
for (const p of patternOnly) candidates['문형'].push({ kind: '문형', key: p.pat, lv: p.lv, item: p });
for (const e of EXPR) candidates['표현'].push({ kind: '표현', key: e.expr, lv: '3', item: e });
for (const s of SPOKEN) candidates['구어체'].push({ kind: '구어체', key: s.t, lv: s.lv || '3', item: s });
for (const w of POS_WORDS) candidates['품사'].push({ kind: '품사', key: w.w, lv: w.lv || '3', item: w });
for (const c of CONJ) candidates['활용표'].push({ kind: '활용표', key: c.t, lv: c.lv || '3', item: c });
for (const [kind, arr] of Object.entries(candidates)) {
  const q = QUOTA[kind] || 0;
  arr.sort((a, b) => {
    const ea = (itemMap.get(a.kind + ' · ' + a.key) || { dialogues: new Set() }).dialogues.size;
    const eb = (itemMap.get(b.kind + ' · ' + b.key) || { dialogues: new Set() }).dialogues.size;
    const la = +a.lv || 3, lb = +b.lv || 3;
    /* 일상 코어는 낮은 레벨 우선, 그다음 노출량 */
    return (LVW[lb] - LVW[la]) || (eb - ea);
  });
  for (const x of arr.slice(0, q)) {
    const o = itemMap.get(x.kind + ' · ' + x.key);
    core.push({ kind: x.kind, key: x.key, level: 'N' + x.lv, exposures: o ? o.dialogues.size : 0, core: true });
  }
}
/* 한자 코어 150: 빈도순 常用 */
const joyo = ALL.filter(a => a[4] >= 1 && a[4] <= 8);
for (const a of joyo.slice(0, 150)) {
  core.push({ kind: '한자', key: a[0], level: '', exposures: 1, core: true, sub: '常用' });
}
/* 700 맞추기 */
core.sort((a, b) => a.kind.localeCompare(b.kind));
const coreSet = new Set(core.map(x => x.kind + ' · ' + x.key));
fs.writeFileSync(path.join(OUT, 'core-items.json'), JSON.stringify(core, null, 1), 'utf8');

/* ── 2) 한자 층 ── */
const names = ALL.filter(a => a[4] === 0);
const outside = ALL.filter(a => a[4] === 9);
const extra = ALL.filter(a => a[4] === 10);
const extension = [...names, ...FOOD, ...outside.slice(0, Math.max(0, 300 - names.length - FOOD.length))];
fs.writeFileSync(path.join(OUT, 'kanji-layers.json'), JSON.stringify({
  joyo: joyo.map(a => a[0]),
  extension: extension.map(a => a[0]),
  outsideRest: outside.slice(extension.length - names.length - FOOD.length).map(a => a[0]),
  counts: { joyo: joyo.length, names: names.length, food: FOOD.length, extension: extension.length, outsideRest: Math.max(0, outside.length - (extension.length - names.length - FOOD.length)) }
}, null, 1), 'utf8');

/* ── 3) 레슨 계획 ── */
const daily = D.filter(d => {
  const tr = dctx.T[d.id];
  return tr !== 'work' && tr !== 'coverage' && tr !== 'n1';
});
const lessons = [];
const MAX = 12, MIN = 4;
for (const d of daily) {
  const n = d.lines.length;
  let parts = [];
  if (n <= 14) parts = [[0, n]];
  else {
    let i = 0;
    while (i < n) {
      let end = Math.min(i + MAX, n);
      if (n - end > 0 && n - end < MIN) end = n;
      parts.push([i, end]);
      i = end;
    }
  }
  parts.forEach(([from, to], pi) => {
    const body = text(d, from, to);
    const local = [];
    for (const [k, o] of itemMap) {
      if (!coreSet.has(k)) continue;
      const hit = o.lines.find(x => x.id === d.id && x.line >= from && x.line < to);
      if (hit || body.includes(String(o.key).replace(/～/g, ''))) local.push({ kind: o.kind, key: o.key, line: hit ? hit.line - from : 0 });
    }
    const uniq = [];
    for (const x of local) if (!uniq.some(y => y.kind === x.kind && y.key === x.key)) uniq.push(x);
    uniq.sort((a, b) => a.kind.localeCompare(b.kind));
    const targets = uniq.slice(0, 5);
    lessons.push({
      id: `${d.id}-${pi + 1}`,
      source: d.id,
      part: pi + 1,
      lines: [from, to],
      level: 'N' + d.lv,
      scene: d.scene,
      goal: d.title + (parts.length > 1 ? ` (${pi + 1}/${parts.length})` : ''),
      targets,
      targetCount: targets.length
    });
  });
}
/* 코어 재등장 계획 — 3회 노출 */
const slots = new Map(core.map(x => [x.kind + ' · ' + x.key, []]));
for (const l of lessons) for (const t of l.targets) {
  const k = t.kind + ' · ' + t.key;
  if (slots.has(k)) slots.get(k).push(l.id);
}
const blob = new Map(lessons.map(l => [l.id, strip(D.find(d => d.id === l.source).lines.slice(l.lines[0], l.lines[1]).map(x => x.s).join('\n'))]));
const lessonById = new Map(lessons.map(l => [l.id, l]));
for (const x of core) {
  const k = x.kind + ' · ' + x.key;
  const Need = 3;
  const cur = slots.get(k) || [];
  if (cur.length >= Need) continue;
  const needle = String(x.key).split(' — ')[0].replace(/[～]/g, '');
  for (const l of lessons) {
    if (cur.length >= Need) break;
    if (l.targets.length >= 5) continue;
    if (cur.includes(l.id)) continue;
    if (x.kind === '한자' ? blob.get(l.id).includes(String(x.key)) : blob.get(l.id).includes(needle)) {
      l.targets.push({ kind: x.kind, key: x.key, line: 0, role: 'review' });
      cur.push(l.id);
    }
  }
  slots.set(k, cur);
}
const coverage = core.map(x => {
  const k = x.kind + ' · ' + x.key;
  return { ...x, lessons: slots.get(k) || [], need: Math.max(0, 3 - (slots.get(k) || []).length) };
});
fs.writeFileSync(path.join(OUT, 'lesson-plan.json'), JSON.stringify(lessons, null, 1), 'utf8');
fs.writeFileSync(path.join(OUT, 'core-coverage-plan.json'), JSON.stringify(coverage, null, 1), 'utf8');

/* ── report ── */
const byKind = {};
for (const x of core) byKind[x.kind] = (byKind[x.kind] || 0) + 1;
const weak = lessons.filter(l => l.targetCount < 3).length;
const avg = (lessons.reduce((a, l) => a + l.targetCount, 0) / lessons.length).toFixed(1);
const md = [
  '# 재구성 0~3단계 리포트', '',
  `- 대화 ${D.length}편 / ${D.reduce((a, d) => a + d.lines.length, 0)}줄`,
  `- 일상 레슨 ${lessons.length}개 (원본 ${daily.length}편 분할)`,
  `- 코어 ${core.length}개`,
  `- 레슨당 목표 평균 ${avg}개 / 3개 미만 ${weak}레슨`,
  '', '## 코어 구성', '', '| 종류 | 개수 |', '|---|---:|'];
for (const [k, v] of Object.entries(byKind)) md.push(`| ${k} | ${v} |`);
md.push('', '## 한자 층', '', `- 常用: ${joyo.length}`, `- 확장(인명·지명·음식): ${extension.length}`, `- 표외 나머지: ${outside.length - (extension.length - names.length - FOOD.length)}`);
md.push('', '## 3회 노출 부족 코어', '');
const lack = coverage.filter(x => x.need > 0).sort((a, b) => b.need - a.need);
for (const x of lack.slice(0, 50)) md.push(`- ${x.kind} · ${x.key} — ${(x.lessons || []).length}회 (need ${x.need})`);
md.push('', `부족 코어: ${lack.length} / ${core.length}`);
fs.writeFileSync(path.join(OUT, 'report.md'), md.join('\n') + '\n', 'utf8');
console.log('core', core.length, 'lessons', lessons.length, 'weak', weak, 'avg', avg, 'lack', lack.length);
console.log('wrote', OUT);
