/* build_grammar_targets.cjs — 문법·문형·구어체·활용 전체 목표 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(ROOT, 'build', 'shorts');
const DATA = path.join(ROOT, 'j', '2b10e90aebe237af55', 'data');
const inv = JSON.parse(fs.readFileSync(path.join(OUT, 'inventory.json'), 'utf8')).items;
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(DATA, 'conjugation.js'), 'utf8') + ';globalThis.C=CONJ;', ctx);
const CONJ = ctx.C;
const norm = s => String(s || '').replace(/[〜～]/g, '～').replace(/[\s（）()「」、。,.!?！？·・／/]/g, '').toLowerCase();
const seen = new Set();
const out = [];
for (const x of inv) {
  if (!['문법', '문형', '구어체'].includes(x.kind)) continue;
  const n = norm(x.key);
  if (!n || seen.has(n)) continue;
  seen.add(n);
  const lv = x.level ? (String(x.level).startsWith('N') ? String(x.level) : 'N' + x.level) : 'N3';
  out.push({ id: x.kind + ' · ' + x.key, kind: x.kind, key: x.key, level: lv, note: x.note || '', scenes: x.scenes || [] });
}
for (const c of CONJ) {
  const n = norm(c.t);
  if (!n || seen.has(n)) continue;
  seen.add(n);
  out.push({ id: '활용표 · ' + c.t, kind: '활용표', key: c.t, level: 'N' + (c.lv || '3'), note: String(c.desc || '').slice(0, 120), scenes: [] });
}
fs.writeFileSync(path.join(OUT, 'grammar-targets.json'), JSON.stringify({ total: out.length, targets: out }, null, 1), 'utf8');
const by = {}; for (const x of out) by[x.kind] = (by[x.kind] || 0) + 1;
console.log('grammar targets', out.length, by);
