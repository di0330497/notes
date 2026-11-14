const fs = require('fs');
const path = require('path');
const OUT = 'C:/Users/user/Downloads/japanese-pages/build/shorts';
const { matches } = require('C:/Users/user/Downloads/japanese-pages/tools/shorts/match.cjs');
const exp = JSON.parse(fs.readFileSync(path.join(OUT, 'grammar-assignments.json'), 'utf8')).scenes;
const files = fs.readdirSync(OUT).filter(f => /^grammar-\d+\.json$/.test(f)).sort();
const all = [];
for (const f of files) all.push(...JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8')));
const by = new Map(all.map(x => [x.id, x]));
const problems = [];
for (const s of exp) {
  const d = by.get(s.id); if (!d) { problems.push({ id: s.id, type: 'MISSING' }); continue; }
  const got = new Map((d.targets || []).map(t => [t.kind + ' · ' + t.key, t]));
  for (const t of s.targets) {
    const k = t.kind + ' · ' + t.key;
    const g = got.get(k);
    if (!g) { problems.push({ id: s.id, type: 'TARGET_MISSING', kind: t.kind, key: t.key }); continue; }
    const line = d.lines[g.line];
    if (!line || !matches(line.s, t.kind, t.key)) problems.push({ id: s.id, type: 'NOT_IN_LINE', kind: t.kind, key: t.key, line: g.line, s: line ? line.s : '' });
  }
}
fs.writeFileSync(path.join(OUT, 'grammar-problems.json'), JSON.stringify(problems, null, 1), 'utf8');
console.log('problems', problems.length);
for (const p of problems) console.log(p.id, p.type, p.kind, p.key);
