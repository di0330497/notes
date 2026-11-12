const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'j', '2b10e90aebe237af55', 'data');
function load(files, tail) { const ctx = { console }; vm.createContext(ctx); vm.runInContext(files.map(f => fs.readFileSync(path.join(DATA, f), 'utf8')).join('\n') + '\n' + tail, ctx, { timeout: 40000 }); return ctx; }
const dctx = load(fs.readdirSync(DATA).filter(f => /^dialogue-[0-9]+\.js$/.test(f)).concat(['dialogue-daily.js', 'daily-overrides.js', 'targets-auto.js']), 'globalThis.D=DIALOGS;');
const D = dctx.D;
const ctx = load(['grammar.js', 'patterns.js', 'expressions.js', 'pos-words.js'], 'globalThis.X={GRAMMAR,PATS,EXPR,POS_WORDS};');
const { GRAMMAR, PATS, EXPR, POS_WORDS } = ctx.X;
const N = s => String(s || '').replace(/[〜～]/g, '～').replace(/[\s（）()「」、。,.!?！？·・／/]/g, '').toLowerCase();
const tags = new Set();
for (const d of D) {
  for (const t of d.tags || []) tags.add(t[0] + '\u0000' + N(t[1]));
  for (const l of d.lines || []) if (l.item) { const m = String(l.item).match(/^([^ ·]+)\s*·\s*(.+)$/); if (m) tags.add(m[1] + '\u0000' + N(m[2])); }
}
const has = (kind, key) => { const nk = N(key); for (const t of tags) { const [k, v] = t.split('\u0000'); if (k === kind && (v === nk || v.includes(nk) || nk.includes(v))) return true; } return false; };
for (const [name, arr, kind, key] of [
  ['문형', PATS, '문형', p => p.pat],
  ['문법', GRAMMAR, '문법', g => g.t],
  ['표현', EXPR, '표현', e => e.expr]
]) {
  const miss = arr.filter(x => !has(kind, key(x))).map(key);
  console.log('## ' + name + ' miss ' + miss.length);
  console.log(miss.join('\n'));
  console.log();
}
