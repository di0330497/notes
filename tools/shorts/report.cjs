/* report.cjs — 쇼츠 커버리지·품질 리포트 */
const fs = require('fs');
const path = require('path');
const OUT = path.resolve(__dirname, '..', '..', 'build', 'shorts');
const assign = JSON.parse(fs.readFileSync(path.join(OUT, 'assignments.json'), 'utf8')).scenes;
const val = fs.existsSync(path.join(OUT, 'validation.json'))
  ? JSON.parse(fs.readFileSync(path.join(OUT, 'validation.json'), 'utf8')) : null;
const all = fs.existsSync(path.join(OUT, 'shorts-all.json'))
  ? JSON.parse(fs.readFileSync(path.join(OUT, 'shorts-all.json'), 'utf8')) : [];

const expected = new Map();
for (const s of assign) for (const t of s.targets) expected.set(t.kind + ' · ' + t.key, t);
const got = new Set();
for (const d of all) for (const t of (d.targets || [])) got.add(t.kind + ' · ' + t.key);
const byKind = {};
for (const [k] of expected) {
  const kind = k.split(' · ')[0];
  byKind[kind] = byKind[kind] || { total: 0, covered: 0 };
  byKind[kind].total++;
  if (got.has(k)) byKind[kind].covered++;
}
const lens = all.map(d => (d.lines || []).length);
const hist = {}; for (const n of lens) hist[n] = (hist[n] || 0) + 1;
const totalTargets = all.reduce((a, d) => a + (d.targets || []).length, 0);
const md = [
  '# 쇼츠 대화 리포트', '',
  `- 대화: ${all.length} / ${assign.length}`,
  `- 줄 수: ${lens.reduce((a,b)=>a+b,0)} (평균 ${(lens.reduce((a,b)=>a+b,0)/Math.max(1,lens.length)).toFixed(1)})`,
  `- 줄 길이: ${JSON.stringify(hist)}`,
  `- 목표: 고유 ${expected.size}개 / 슬롯 ${totalTargets}개 (${(got.size / expected.size * 100).toFixed(1)}%)`,
  `- 목표 없는 줄: ${((1 - totalTargets / Math.max(1, lens.reduce((a,b)=>a+b,0))) * 100).toFixed(0)}%`,
  `- 최대 줄 수: ${Math.max(...lens)} / 목표 3~4개`,
  '', '| 종류 | 목표 | 커버 | 비율 |', '|---|---:|---:|---:|'
];
for (const [k, v] of Object.entries(byKind)) md.push(`| ${k} | ${v.total} | ${v.covered} | ${(v.covered / v.total * 100).toFixed(1)}% |`);
const missing = [...expected.keys()].filter(k => !got.has(k));
md.push('', `## 미커버 ${missing.length}`, '', ...missing.slice(0, 200).map(x => '- ' + x));
fs.writeFileSync(path.join(OUT, 'report.md'), md.join('\n') + '\n', 'utf8');
console.log(md.slice(0, 16).join('\n'));
