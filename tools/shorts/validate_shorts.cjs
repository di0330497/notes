/* validate_shorts.cjs — batch-*.json 검증 + shorts.json 정규화 */
const fs = require('fs');
const path = require('path');
const OUT = path.resolve(__dirname, '..', '..', 'build', 'shorts');
const assign = JSON.parse(fs.readFileSync(path.join(OUT, 'assignments.json'), 'utf8')).scenes;
const expected = new Map(assign.map(s => [s.id, s]));

const { matches } = require('./match.cjs');

const files = fs.readdirSync(OUT).filter(f => /^batch-\d+\.json$/.test(f)).sort();
const all = [];
for (const f of files) {
  try {
    const arr = JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8'));
    if (Array.isArray(arr)) all.push(...arr.map(x => ({ ...x, _file: f })));
  } catch (e) {
    console.log('BAD JSON', f, e.message);
  }
}
const byId = new Map(all.map(x => [x.id, x]));
const problems = [];
const covered = new Set();
for (const s of assign) {
  const d = byId.get(s.id);
  if (!d) { problems.push('MISSING ' + s.id); continue; }
  if (!Array.isArray(d.lines) || d.lines.length < 7 || d.lines.length > 14) {
    problems.push('LINES ' + s.id + ' ' + (d.lines ? d.lines.length : 'none'));
  }
  if (!Array.isArray(d.targets)) d.targets = [];
  const got = new Map(d.targets.map(t => [t.kind + ' · ' + t.key, t]));
  for (const t of s.targets) {
    const k = t.kind + ' · ' + t.key;
    const g = got.get(k);
    if (!g) { problems.push('TARGET_MISSING ' + s.id + ' ' + k); continue; }
    const line = d.lines[g.line];
    if (!line) { problems.push('LINE_INDEX ' + s.id + ' ' + k + ' -> ' + g.line); continue; }
    if (!matches(line.s, t.kind, t.key)) { problems.push('NOT_IN_LINE ' + s.id + ' ' + k + ' line ' + g.line); continue; }
    covered.add(k);
  }
}
const total = assign.reduce((a, s) => a + s.targets.length, 0);
console.log('batches', files.length, 'dialogues', all.length, 'expected', assign.length);
console.log('targets', total, 'covered', covered.size, (covered.size / total * 100).toFixed(1) + '%');
console.log('problems', problems.length);
for (const p of problems.slice(0, 80)) console.log(p);
fs.writeFileSync(path.join(OUT, 'validation.json'), JSON.stringify({ total, covered: covered.size, problems }, null, 1), 'utf8');
if (all.length) fs.writeFileSync(path.join(OUT, 'shorts-all.json'), JSON.stringify(all, null, 1), 'utf8');
