/* integrate_scene_rewrite.cjs — 장면 150편 재작성 반영 */
const fs = require('fs'), path = require('path');
const OUT = 'C:/Users/user/Downloads/japanese-pages/build/shorts';
const RW = path.join(OUT, 'rewrite');

const rw = [];
for (const f of fs.readdirSync(RW).filter(f => /^scene-\d+\.json$/.test(f)).sort()) {
  rw.push(...JSON.parse(fs.readFileSync(path.join(RW, f), 'utf8')));
}
const byId = new Map(rw.map(d => [d.id, d]));
if (byId.size !== 150) throw new Error('scene rewrite count ' + byId.size);

const as = JSON.parse(fs.readFileSync(path.join(OUT, 'assignments.json'), 'utf8'));
const aById = new Map(as.scenes.map(s => [s.id, s]));
let changed = 0;
for (let b = 1; b <= 10; b++) {
  const p = path.join(OUT, `batch-${String(b).padStart(2, '0')}.json`);
  const arr = JSON.parse(fs.readFileSync(p, 'utf8'));
  const next = arr.map(o => {
    const d = byId.get(o.id);
    if (!d) return o;
    changed++;
    const a = aById.get(o.id);
    if (a) {
      a.register = d.register || a.register;
      const prev = new Map(a.targets.map(t => [t.kind + ' · ' + t.key, t]));
      a.targets = (d.targets || []).map(t => {
        const q = prev.get(t.kind + ' · ' + t.key) || {};
        return { kind: t.kind, key: t.key, level: q.level || o.level, note: q.note || '', examples: q.examples || [] };
      });
    }
    return {
      id: o.id,
      scene: d.scene || o.scene,
      title: d.title || o.title,
      level: d.level || o.level,
      register: d.register || o.register,
      lines: d.lines.map(x => ({ who: x.who, s: x.s, ko: x.ko })),
      targets: d.targets.map(t => ({ kind: t.kind, key: t.key, line: t.line }))
    };
  });
  fs.writeFileSync(p, JSON.stringify(next, null, 1), 'utf8');
}
fs.writeFileSync(path.join(OUT, 'assignments.json'), JSON.stringify(as, null, 1), 'utf8');
console.log('scene integrated', changed);
