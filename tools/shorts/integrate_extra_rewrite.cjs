const fs = require('fs'), path = require('path');
const OUT = 'C:/Users/user/Downloads/japanese-pages/build/shorts';
const rw = JSON.parse(fs.readFileSync(path.join(OUT, 'rewrite', 'grammar-11.json'), 'utf8'));
const p = path.join(OUT, 'grammar-extra-manual.json');
const a = JSON.parse(fs.readFileSync(p, 'utf8'));
const by = new Map(rw.map(d => [d.id, d]));
for (const d of a) {
  const r = by.get(d.id);
  if (!r) continue;
  d.scene = r.scene || d.scene;
  d.title = r.title || d.title;
  d.level = r.level || d.level;
  d.register = r.register || 'polite';
  d.chars = [...new Set(r.lines.map(l => l.who))];
  d.lines = r.lines.map(x => ({ who: x.who, s: x.s, ko: x.ko }));
  d.targets = r.targets.map(t => ({ kind: t.kind, key: t.key, line: t.line }));
}
fs.writeFileSync(p, JSON.stringify(a, null, 1), 'utf8');

const ap = path.join(OUT, 'grammar-extra-assignments.json');
const as = JSON.parse(fs.readFileSync(ap, 'utf8'));
for (const s of as.scenes) {
  const d = a.find(x => x.id === s.id);
  if (!d) continue;
  s.register = d.register;
  s.chars = d.chars;
  const keep = new Map(s.targets.map(t => [t.kind + ' · ' + t.key, t]));
  s.targets = d.targets.map(t => {
    const prev = keep.get(t.kind + ' · ' + t.key) || {};
    return { kind: t.kind, key: t.key, level: prev.level || d.level, note: prev.note || '', examples: prev.examples || [] };
  });
}
fs.writeFileSync(ap, JSON.stringify(as, null, 1), 'utf8');
console.log('extras from grammar-11 integrated');
