/* validate_tracks.cjs — 문법·N1 배치 검증 + all.json 생성 */
const fs = require('fs');
const path = require('path');
const OUT = path.resolve(__dirname, '..', '..', 'build', 'shorts');
const { matches } = require('./match.cjs');

function readBatch(prefix, expect) {
  const files = fs.readdirSync(OUT).filter(f => new RegExp('^' + prefix + '-\\d+\\.json$').test(f)).sort();
  const all = [];
  for (const f of files) {
    try { const a = JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8')); if (Array.isArray(a)) all.push(...a); }
    catch (e) { console.log('BAD JSON', f, e.message); }
  }
  return all;
}
function check(label, expected, all, minLines, maxLines) {
  const byId = new Map(all.map(x => [x.id, x]));
  const problems = [];
  let covered = 0, total = 0;
  for (const s of expected) {
    const d = byId.get(s.id);
    if (!d) { problems.push('MISSING ' + s.id); continue; }
    if (!Array.isArray(d.lines) || d.lines.length < minLines || d.lines.length > maxLines) {
      problems.push('LINES ' + s.id + ' ' + (d.lines ? d.lines.length : 'none'));
    }
    const got = new Set((d.targets || []).map(t => t.kind + ' · ' + t.key));
    for (const t of s.targets) {
      total++;
      const k = t.kind + ' · ' + t.key;
      if (!got.has(k)) { problems.push('TARGET_MISSING ' + s.id + ' ' + k); continue; }
      const g = (d.targets || []).find(x => x.kind === t.kind && x.key === t.key);
      const line = d.lines[g.line];
      if (!line) { problems.push('LINE_INDEX ' + s.id + ' ' + k); continue; }
      if (!matches(line.s, t.kind, t.key)) { problems.push('NOT_IN_LINE ' + s.id + ' ' + k); continue; }
      covered++;
    }
  }
  fs.writeFileSync(path.join(OUT, label + '-all.json'), JSON.stringify(all, null, 1), 'utf8');
  console.log(label, 'dialogues', all.length, '/', expected.length, 'targets', total, 'covered', covered,
    (covered / total * 100).toFixed(1) + '%', 'problems', problems.length);
  for (const p of problems.slice(0, 40)) console.log(' ', p);
  return problems;
}
const gExp = JSON.parse(fs.readFileSync(path.join(OUT, 'grammar-assignments.json'), 'utf8')).scenes;
const nExp = JSON.parse(fs.readFileSync(path.join(OUT, 'n1-assignments.json'), 'utf8')).scenes;
check('grammar', gExp, readBatch('grammar', 150), 4, 6);
check('n1', nExp, readBatch('n1', 45), 4, 6);
