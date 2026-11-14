const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'j', '2b10e90aebe237af55', 'data');
const OUT = path.join(ROOT, 'build', 'reconstruction');
const c = { console };
vm.createContext(c);
vm.runInContext(fs.readFileSync(path.join(DATA, 'lessons.js'), 'utf8') + ';globalThis.L=LESSONS;', c);
const core = JSON.parse(fs.readFileSync(path.join(OUT, 'core-items.json'), 'utf8'));
const map = new Map();
for (const l of c.L) {
  for (const t of l.targets) {
    const k = t.kind + ' · ' + t.key;
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(l.id);
  }
  for (const r of l.review) {
    const k = r.kind + ' · ' + r.key;
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(l.id);
  }
}
const rows = core.map(x => {
  const ids = map.get(x.kind + ' · ' + x.key) || [];
  return { ...x, lessons: ids, count: ids.length, need: Math.max(0, 3 - ids.length) };
});
fs.writeFileSync(path.join(OUT, 'core-coverage-final.json'), JSON.stringify(rows, null, 1), 'utf8');
console.log('core', rows.length, '3+', rows.filter(x => x.count >= 3).length, 'lack', rows.filter(x => x.need > 0).length);
