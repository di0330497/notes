const { execSync } = require('child_process');
const fs = require('fs'), vm = require('vm');
const ROOT = 'C:/Users/user/Downloads/japanese-pages';
const oldSrc = execSync('git show HEAD:j/2b10e90aebe237af55/data/lessons.js', { cwd: ROOT, encoding: 'utf8' });
const c1 = {}; vm.createContext(c1); vm.runInContext(oldSrc + ';globalThis.L=LESSONS;', c1);
const c2 = {}; vm.createContext(c2);
vm.runInContext(fs.readFileSync(ROOT + '/j/2b10e90aebe237af55/data/lessons.js', 'utf8') + ';globalThis.L=LESSONS;', c2);
const oldBy = new Map(c1.L.map(l => [l.id, l]));
const changed = [], same = [];
for (const l of c2.L) {
  const o = oldBy.get(l.id);
  if (!o) { changed.push(l.id); continue; }
  const sameLines = l.lines.length === o.lines.length && l.lines.every((x, i) => x.s === o.lines[i].s && x.who === o.lines[i].who);
  const sameT = JSON.stringify(l.targets.map(t => [t.key, t.line])) === JSON.stringify(o.targets.map(t => [t.key, t.line]));
  if (sameLines && sameT) same.push(l.id); else changed.push(l.id);
}
console.log('changed', changed.length, 'same', same.length);
console.log('changed scene', changed.filter(x => x.startsWith('sh')).length, 'grammar', changed.filter(x => x.startsWith('g') || x.startsWith('x')).length, 'n1', changed.filter(x => x.startsWith('n')).length);
const md = fs.readFileSync(ROOT + '/build/native-read-all.md', 'utf8').split('\n');
const F = [];
for (const line of md) {
  const m = line.match(/^\| ((?:sh|g|x|n)\d+) \| [^|]+ \| [^|]* \| (심각|보통|경미) \|/);
  if (m) F.push(m[1]);
}
const fixed = F.filter(id => changed.includes(id));
const remain = F.filter(id => !changed.includes(id));
console.log('findings', F.length, 'fixed', fixed.length, 'remain', remain.length);
console.log('remain:', remain.join(' '));
fs.writeFileSync(ROOT + '/build/native-fix-status.json', JSON.stringify({ fixed, remain }, null, 1), 'utf8');
