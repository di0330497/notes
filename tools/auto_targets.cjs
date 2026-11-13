/* auto_targets.cjs — 대화마다 '이 대화에서 배우는 것'을 자동으로 채운다.
   - 이미 손으로 넣은 targets 는 건드리지 않는다.
   - 줄 item 태그 → 대화 tags 순으로 후보를 모으고, 종류·줄 존재·희소성으로 4개를 고른다.
   - 설명은 기존 사전 데이터(mean/desc/rule/m/n)에서 뽑아 쓴다. auto:true 로 표시한다.
   출력: data/targets-auto.js */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'j', '2b10e90aebe237af55', 'data');

function load(files, tail) {
  const ctx = { console };
  vm.createContext(ctx);
  vm.runInContext(files.map(f => fs.readFileSync(path.join(DATA, f), 'utf8')).join('\n') + '\n' + tail, ctx, { timeout: 30000 });
  return ctx;
}
const dctx = load(
  fs.readdirSync(DATA).filter(f => /^dialogue-[0-9]+\.js$/.test(f)).sort((a, b) => (+a.match(/\d+/)[0]) - (+b.match(/\d+/)[0]))
    .concat(['dialogue-daily.js', 'daily-overrides.js', 'scene-reskin.js', 'context-rewrite.js', 'rewrite-20.js']),
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

const norm = s => String(s || '')
  .replace(/\[([^\]|]+)\|[^\]]+\]/g, '$1')
  .replace(/\{([^{}]+)\}/g, '$1')
  .replace(/\[([^\]]+)\]/g, '$1')
  .replace(/[〜～]/g, '～').replace(/[\s（）()「」]/g, '').replace(/[／/]/g, '/').toLowerCase();
const keys = o => Object.keys(o).reduce((m, k) => (m[norm(k)] = o[k], m), {});
const PAT = keys(Object.fromEntries(PATS.map(p => [p.pat, p])));
const GRA = keys(Object.fromEntries(GRAMMAR.map(g => [g.t, g])));
const EXP = keys(Object.fromEntries(EXPR.map(e => [e.expr, e])));
const SPK = keys(Object.fromEntries(SPOKEN.map(s => [s.t, s])));
const POS = keys(Object.fromEntries(POS_WORDS.map(w => [w.w, w])));
const KAN = {};
for (const k of STUDY_FULL) KAN[norm(k.k)] = k;
for (const a of ALL) if (!KAN[norm(a[0])]) KAN[norm(a[0])] = { k: a[0], on: a[1], kun: a[2], kor: a[3], ex: [] };

function clip(s, n) {
  s = String(s || '').replace(/\s+/g, ' ').trim();
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}
function trunc(s, n = 90) {
  s = String(s || '').replace(/\s+/g, ' ').trim();
  const cut = s.split(/(?<=[.!?。！？])\s*/)[0];
  s = cut || s;
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}
function noteFor(kind, key) {
  const nk = norm(key);
  if (kind === '문형') {
    const p = PAT[nk] || PAT[Object.keys(PAT).find(k => k.includes(nk) || nk.includes(k))];
    if (p) return trunc((p.mean || '') + (p.ex && p.ex[0] ? '. 예: ' + p.ex[0].ko : ''), 100);
  }
  if (kind === '문법') {
    const g = GRA[nk] || GRA[Object.keys(GRA).find(k => k.includes(nk) || nk.includes(k))];
    if (g) {
      const d = String(g.desc || '').replace('앞뒤 상황의 관계와 화자의 의도를 예문에서 함께 확인한다.', '').trim();
      return trunc(d, 100);
    }
  }
  if (kind === '표현') {
    const e = EXP[nk] || EXP[Object.keys(EXP).find(k => k.includes(nk) || nk.includes(k))];
    if (e) return trunc((e.mean || '') + (e.ex && e.ex[0] ? '. 예: ' + e.ex[0].ko : ''), 100);
  }
  if (kind === '구어체') {
    const s = SPK[nk] || SPK[Object.keys(SPK).find(k => k.includes(nk) || nk.includes(k))];
    if (s) return trunc(s.rule || '', 100);
  }
  if (kind === '한자') {
    const k = KAN[nk] || KAN[Array.from(nk)[0]];
    if (k) return (k.hun || k.kor || '') + (k.on ? ' · 음 ' + k.on : '') + (k.kun ? ' · 훈 ' + k.kun : '');
  }
  if (kind === '품사') {
    const w = POS[nk] || POS[Object.keys(POS).find(k => k.includes(nk) || nk.includes(k))];
    if (w) return trunc((w.m || '') + (w.n ? ' — ' + w.n : ''), 100);
  }
  if (kind === '활용표') {
    const c = CONJ.find(x => norm(x.t).includes(nk) || nk.includes(norm(x.t)));
    if (c) return trunc(c.desc || c.t || '', 100);
  }
  return '';
}

function findLine(d, key) {
  const base = String(key).split(' — ')[0];
  const variants = base.split(/[／/·]/).map(s => norm(s).replace(/～/g, '')).filter(s => s.length >= 1);
  for (let i = 0; i < (d.lines || []).length; i++) {
    const s = norm(d.lines[i].s);
    if (variants.some(v => s.includes(v))) return i;
  }
  return -1;
}
/* 후보 수집 */
const itemCount = new Map();
for (const d of D) {
  for (const l of d.lines || []) if (l.item) itemCount.set(l.item, (itemCount.get(l.item) || 0) + 1);
}
const KIND_W = { '문형': 5, '문법': 4, '구어체': 4, '표현': 3, '한자': 2, '품사': 1, '활용표': 2 };
const out = {};
let filled = 0;
for (const d of D) {
  if (d.targets && d.targets.length) continue;
  const cand = new Map();
  (d.lines || []).forEach((l, i) => {
    if (!l.item) return;
    const m = String(l.item).match(/^([^ ·]+)\s*·\s*(.+)$/);
    if (!m) return;
    const k = m[1] + ' · ' + m[2];
    if (!cand.has(k)) cand.set(k, { kind: m[1], key: m[2], line: i, fromLine: true });
  });
  for (const t of d.tags || []) {
    const k = t[0] + ' · ' + t[1];
    if (!cand.has(k)) cand.set(k, { kind: t[0], key: t[1], line: -2, fromLine: false });
  }
  const arr = [];
  for (const x of cand.values()) {
    /* 줄 item 태그도 실제 문장에 그 항목이 있는지 다시 확인한다 —
       태그만 믿으면 엉뚱한 줄에 설명이 붙는다. 없으면 line:-1(설명 없음). */
    x.line = findLine(d, x.key);
    /* さ·ね·な 같은 한 글자 종조사는 아무 줄에나 걸린다 — 설명을 붙이지 않는다 */
    if (x.kind === '구어체' && String(x.key).split(' — ')[0].length < 2) x.line = -1;
    if (x.line < 0 && (x.kind === '품사' || x.kind === '활용표')) continue;
    x.score = (KIND_W[x.kind] || 1) * 10 + (x.fromLine ? 6 : 0) + Math.max(0, 12 - Math.min(12, itemCount.get(x.kind + ' · ' + x.key) || 1));
    arr.push(x);
  }
  arr.sort((a, b) => b.score - a.score);
  const picked = [];
  const kindCount = {};
  for (const x of arr) {
    if (picked.length >= 4) break;
    if ((kindCount[x.kind] || 0) >= 4) continue;
    if (picked.some(p => p.kind === x.kind && p.key === x.key)) continue;
    const base = noteFor(x.kind, x.key);
    x.note = base || (x.kind + ' · ' + x.key);
    picked.push(x); kindCount[x.kind] = (kindCount[x.kind] || 0) + 1;
  }
  if (!picked.length) {
    /* 태그가 전부 묶음 이름뿐인 대화 — 대화의 핵심 포인트 2개를 목표로 올린다 */
    if ((d.points || []).length) {
      out[d.id] = d.points.map(p => ({ kind: '포인트', key: p.t, line: -1, note: p.d, auto: true }));
      filled++;
    }
    continue;
  }
  const targets = picked.map(x => {
    const lineKo = ((d.lines || [])[x.line] || {}).ko;
    const note = x.note + (lineKo ? ' — ' + clip(lineKo, 70) : '');
    return { kind: x.kind, key: x.key, line: x.line, note: clip(note, 120), auto: true };
  });
  out[d.id] = targets;
  filled++;
}
const js = `/* targets-auto.js — 자동 생성. 이미 손으로 쓴 targets 가 있는 대화는 건드리지 않는다.
   tools/auto_targets.cjs 로 다시 만들 수 있다. auto:true 는 검수 전 표시. */
const TARGETS_AUTO = ${JSON.stringify(out, null, 0)};
(function(){
  if(typeof DIALOGS==="undefined")return;
  DIALOGS.forEach(function(d){
    if(!d.targets||!d.targets.length)d.targets=TARGETS_AUTO[d.id]||[];
  });
})();
`;
fs.writeFileSync(path.join(DATA, 'targets-auto.js'), js, 'utf8');
console.log('filled dialogues', filled, 'targets', Object.values(out).reduce((a, x) => a + x.length, 0));
console.log('sample', JSON.stringify(out[Object.keys(out)[0]], null, 1));
