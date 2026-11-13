const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'j', '2b10e90aebe237af55', 'data');
function load(files, tail) { const ctx = { console }; vm.createContext(ctx); vm.runInContext(files.map(f => fs.readFileSync(path.join(DATA, f), 'utf8')).join('\n') + '\n' + tail, ctx, { timeout: 40000 }); return ctx; }
const dctx = load(fs.readdirSync(DATA).filter(f => /^dialogue-[0-9]+\.js$/.test(f)).sort((a, b) => (+a.match(/\d+/)[0]) - (+b.match(/\d+/)[0])).concat(['dialogue-daily.js', 'daily-overrides.js', 'scene-reskin.js', 'context-rewrite.js', 'rewrite-20.js', 'targets-auto.js', 'coverage-patch.js']), 'globalThis.D=DIALOGS;');
const D = dctx.D;
const ctx = load(['grammar.js', 'patterns.js', 'expressions.js'], 'globalThis.X={GRAMMAR,PATS,EXPR};');
const { GRAMMAR, PATS, EXPR } = ctx.X;
const N = s => String(s || '').replace(/[〜～]/g, '').replace(/[\s（）()「」、。,.!?！？·・／/]/g, '').toLowerCase();
const tags = new Set();
for (const d of D) {
  for (const t of d.tags || []) tags.add(t[0] + '\u0000' + N(t[1]));
  for (const l of d.lines || []) if (l.item) { const m = String(l.item).match(/^([^ ·]+)\s*·\s*(.+)$/); if (m) tags.add(m[1] + '\u0000' + N(m[2])); }
}
const tagHas = (kind, key) => { const nk = N(key); for (const t of tags) { const [k, v] = t.split('\u0000'); if (k === kind && (v === nk || v.includes(nk) || nk.includes(v))) return true; } return false; };
function segments(key) {
  let s = String(key).split(' — ')[0];
  const paren = [...s.matchAll(/[（(]([^）)]+)[）)]/g)].map(m => m[1])
    .filter(x => /[\u3040-\u30FF\u4E00-\u9FFF]/.test(x));
  s = s.replace(/[（(][^）)]*[）)]/g, '').replace(/[가-힣].*$/, '').trim();
  if (!s) s = paren.join('／');
  return s.split(/[／/·]/).flatMap(x => x.split(/[～]/)).map(x => N(x)).filter(x => x.length >= 1);
}
function find(key, kind) {
  const segs = segments(key);
  const longest = segs.slice().sort((a, b) => b.length - a.length)[0] || N(key).replace(/～/g, '');
  const hits = [];
  for (const d of D) {
    (d.lines || []).forEach((l, i) => {
      const s = N(l.s);
      if (!s.includes(longest)) return;
      const score = segs.filter(x => s.includes(x)).length;
      if (score >= Math.min(2, segs.length)) hits.push({ id: d.id, i, score, s: l.s, item: l.item || '', title: d.title });
    });
  }
  hits.sort((a, b) => b.score - a.score || String(a.id).localeCompare(String(b.id)));
  return { key, kind, longest, hits: hits.slice(0, 4) };
}
const out = [];
for (const [name, arr, kind, keyFn] of [['문형', PATS, '문형', p => p.pat], ['문법', GRAMMAR, '문법', g => g.t], ['표현', EXPR, '표현', e => e.expr]]) {
  for (const x of arr) {
    const k = keyFn(x);
    if (tagHas(kind, k)) continue;
    out.push(find(k, kind));
  }
}
fs.writeFileSync(path.join(ROOT, 'build', 'coverage-slots.json'), JSON.stringify(out, null, 1), 'utf8');
for (const x of out) {
  console.log('##', x.kind, x.key, '| seg', x.longest);
  console.log(x.hits.map(h => `  ${h.id}:${h.i + 1} [${h.score}] ${h.item} | ${h.s}`).join('\n') || '  NO HIT');
}
