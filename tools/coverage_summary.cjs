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
const dctx = load(fs.readdirSync(DATA).filter(f => /^dialogue-[0-9]+\.js$/.test(f)).sort((a, b) => (+a.match(/\d+/)[0]) - (+b.match(/\d+/)[0])).concat(['dialogue-daily.js', 'daily-overrides.js', 'targets-auto.js', 'coverage-patch.js']), 'globalThis.D=DIALOGS;');
const D = dctx.D;
const ctx = load(['kanji-list.js', 'kanji-cards.js', 'grammar.js', 'patterns.js', 'expressions.js', 'conjugation.js', 'pos-josa.js', 'pos-verb.js', 'pos-noun.js', 'pos-fukushi.js', 'pos-other.js', 'pos-words.js', 'pos-keiyou-2.js', 'colloquial.js', 'colloquial-2.js', 'dialect.js', 'slang.js', 'slang-2026.js'], 'globalThis.X={STUDY_FULL,ALL,FOOD,GRAMMAR,PATS,EXPR,CONJ,SPOKEN,POS_WORDS,POS_JOSA:typeof POS_JOSA!=="undefined"?POS_JOSA:[],POS_ADV:typeof POS_ADV!=="undefined"?POS_ADV:[],POS_OTHER:typeof POS_OTHER!=="undefined"?POS_OTHER:[],POS_VERB:typeof POS_VERB!=="undefined"?POS_VERB:[],POS_NOUN:typeof POS_NOUN!=="undefined"?POS_NOUN:[]};');
const { STUDY_FULL, ALL, FOOD, GRAMMAR, PATS, EXPR, CONJ, SPOKEN, POS_WORDS } = ctx.X;
const POS = [].concat(ctx.X.POS_JOSA, ctx.X.POS_ADV, ctx.X.POS_OTHER, ctx.X.POS_VERB, ctx.X.POS_NOUN);
const strip = s => String(s || '').replace(/\[([^\]|]+)\|[^\]]+\]/g, '$1').replace(/\{([^{}]+)\}/g, '$1').replace(/\[([^\]]+)\]/g, '$1');
const N = s => String(s || '').replace(/[〜～]/g, '～').replace(/[\s（）()「」、。,.!?！？·・／/]/g, '').toLowerCase();
const C = N(D.map(d => strip((d.lines || []).map(l => l.s).join('\n'))).join('\n'));
const tags = new Set();
for (const d of D) {
  for (const t of d.tags || []) tags.add(t[0] + '\u0000' + N(t[1]));
  for (const l of d.lines || []) if (l.item) {
    const m = String(l.item).match(/^([^ ·]+)\s*·\s*(.+)$/);
    if (m) tags.add(m[1] + '\u0000' + N(m[2]));
  }
}
const tagHas = (kind, key) => {
  const nk = N(key);
  for (const t of tags) {
    const [k, v] = t.split('\u0000');
    if (k !== kind) continue;
    if (v === nk || v.includes(nk) || nk.includes(v)) return true;
  }
  return false;
};
const textHas = key => { const v = N(String(key).split(' — ')[0].split('／')[0].split('/')[0].split('·')[0]).replace(/～/g, ''); return v.length >= 1 && C.includes(v); };
const heuristicPattern = pat => {
  const segs = String(pat).split(/[～〜]/).map(s => N(s).replace(/[（）()]/g, '')).filter(s => s.length >= 1);
  if (!segs.length) return false;
  const longest = segs.slice().sort((a, b) => b.length - a.length)[0];
  if (!C.includes(longest)) return false;
  return segs.every(s => s.length <= 1 || C.includes(s));
};
function pct(hit, total) { return +(hit * 100 / total).toFixed(1); }
const R = {};
/* 常用漢字 */
const joyo = ALL.filter(a => a[4] >= 1 && a[4] <= 8);
const joyoHit = joyo.filter(a => C.includes(a[0])).length;
R['한자 常用 2,136'] = { total: joyo.length, hit: joyoHit, rate: pct(joyoHit, joyo.length) };
R['한자 전체 2,647'] = { total: ALL.length + FOOD.length, hit: (ALL.map(a => a[0]).concat(FOOD.map(a => a[0]))).filter(k => C.includes(k)).length, rate: 0 };
/* patterns: tag / text / heuristic */
R['문형 태그'] = { total: PATS.length, hit: PATS.filter(p => tagHas('문형', p.pat)).length };
R['문형 본문'] = { total: PATS.length, hit: PATS.filter(p => heuristicPattern(p.pat)).length };
R['문법 태그'] = { total: GRAMMAR.length, hit: GRAMMAR.filter(g => tagHas('문법', g.t)).length };
R['문법 본문'] = { total: GRAMMAR.length, hit: GRAMMAR.filter(g => heuristicPattern(g.t)).length };
R['표현 태그'] = { total: EXPR.length, hit: EXPR.filter(e => tagHas('표현', e.expr)).length };
R['표현 본문'] = { total: EXPR.length, hit: EXPR.filter(e => textHas(e.expr)).length };
R['품사 낱말 태그'] = { total: POS_WORDS.length, hit: POS_WORDS.filter(w => tagHas('품사', w.w)).length };
R['품사 낱말 본문'] = { total: POS_WORDS.length, hit: POS_WORDS.filter(w => textHas(w.w)).length };
R['품사 표 태그'] = { total: POS.length, hit: POS.filter(x => tagHas('품사', x.t)).length };
R['구어체 태그'] = { total: SPOKEN.length, hit: SPOKEN.filter(s => tagHas('구어체', s.t)).length };
R['구어체 본문'] = { total: SPOKEN.length, hit: SPOKEN.filter(s => textHas(String(s.t).split(' — ')[0]) || (s.forms || []).some(f => textHas(f[0]) || textHas(f[1]))).length };
R['활용표 태그'] = { total: CONJ.length, hit: CONJ.filter(c => tagHas('활용표', c.t)).length };
let rowHit = 0, rowTotal = 0;
for (const c of CONJ) for (const r of c.rows || []) { rowTotal++; if (textHas(r[0])) rowHit++; }
R['활용표 행(첫 칸) 본문'] = { total: rowTotal, hit: rowHit };
for (const k of Object.keys(R)) R[k].rate = pct(R[k].hit, R[k].total);
console.log(JSON.stringify(R, null, 1));
fs.writeFileSync(path.join(ROOT, 'build', 'coverage-summary.json'), JSON.stringify(R, null, 1), 'utf8');
