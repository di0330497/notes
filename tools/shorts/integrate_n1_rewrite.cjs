/* integrate_n1_rewrite.cjs — N1 읽기 45편 재작성 반영 */
const fs = require('fs'), path = require('path');
const OUT = 'C:/Users/user/Downloads/japanese-pages/build/shorts';
const RW = path.join(OUT, 'rewrite');
const rw = [];
for (const f of fs.readdirSync(RW).filter(f => /^n1-\d+\.json$/.test(f)).sort()) {
  rw.push(...JSON.parse(fs.readFileSync(path.join(RW, f), 'utf8')));
}
if (rw.length !== 45) throw new Error('n1 rewrite count ' + rw.length);
const old = JSON.parse(fs.readFileSync(path.join(OUT, 'n1-all.json'), 'utf8'));
const oldById = new Map(old.map(d => [d.id, d]));
const as = JSON.parse(fs.readFileSync(path.join(OUT, 'n1-assignments.json'), 'utf8'));
const aById = new Map(as.scenes.map(s => [s.id, s]));

for (let b = 0; b < 3; b++) {
  const chunk = rw.slice(b * 15, b * 15 + 15).map(d => {
    const o = oldById.get(d.id) || {};
    return {
      id: d.id,
      scene: d.scene || o.scene,
      title: d.title || o.title,
      level: d.level || o.level,
      register: 'written',
      lines: d.lines.map(x => ({ who: x.who || 'jihu', s: x.s, ko: x.ko })),
      targets: d.targets.map(t => ({ kind: t.kind, key: t.key, line: t.line }))
    };
  });
  fs.writeFileSync(path.join(OUT, `n1-${String(b + 1).padStart(2, '0')}.json`), JSON.stringify(chunk, null, 1), 'utf8');
  for (const d of chunk) {
    const a = aById.get(d.id);
    if (!a) continue;
    a.register = 'written';
    const prev = new Map(a.targets.map(t => [t.kind + ' · ' + t.key, t]));
    a.targets = d.targets.map(t => {
      const p = prev.get(t.kind + ' · ' + t.key) || {};
      return { kind: t.kind, key: t.key, level: p.level || d.level, note: p.note || '', examples: p.examples || [] };
    });
  }
}
fs.writeFileSync(path.join(OUT, 'n1-assignments.json'), JSON.stringify(as, null, 1), 'utf8');
console.log('n1 integrated 45');
