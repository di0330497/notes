/* validate_rewrite.cjs — 재작성 JSON 검사 (문법·장면) */
const fs = require('fs'), path = require('path');
const { matches } = require('./match.cjs');
const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(ROOT, 'build', 'shorts');
const RW = path.join(OUT, 'rewrite');

const kind = process.argv[2] || 'grammar';
const prefix = kind === 'scene' ? 'scene' : kind;

function loadAll(prefix, dir) {
  const all = [];
  for (const f of fs.readdirSync(dir).filter(f => new RegExp('^' + prefix + '-\\d+\\.json$').test(f)).sort()) {
    try {
      const a = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      if (!Array.isArray(a)) { console.log('NOT ARRAY', f); continue; }
      all.push(...a.map(x => ({ ...x, __file: f })));
    } catch (e) { console.log('BAD JSON', f, e.message); }
  }
  return all;
}
const src = kind === 'scene'
  ? JSON.parse(fs.readFileSync(path.join(OUT, 'shorts-all.json'), 'utf8'))
  : loadAll(prefix, OUT);
const rw = loadAll(prefix, RW);
const srcById = new Map(src.map(x => [x.id, x]));
const byId = new Map();
for (const d of rw) { if (!byId.has(d.id)) byId.set(d.id, d); }

const problems = [], stats = { lessons: 0, lines: 0, targets: 0, dropped: 0, targetFree: 0 };
const minL = kind === 'grammar' ? 4 : kind === 'n1' ? 4 : 9;
const maxL = kind === 'grammar' ? 6 : kind === 'n1' ? 6 : 14;
let multi = 0;

for (const id of srcById.keys()) {
  const d = byId.get(id);
  if (!d) { problems.push('MISSING ' + id); continue; }
  stats.lessons++;
  const base = srcById.get(id);
  if (!Array.isArray(d.lines) || d.lines.length < minL || d.lines.length > maxL) {
    problems.push(`LINES ${id} ${d.lines ? d.lines.length : 'none'}`);
  }
  stats.lines += d.lines.length;
  if (!d.register) problems.push('NO_REGISTER ' + id);
  const allowed = new Map((base.targets || []).map(t => [t.kind + ' · ' + t.key, t]));
  const keep = (d.targets || []).filter(t => {
    const hit = allowed.has(t.kind + ' · ' + t.key);
    if (!hit) problems.push(`INVENTED_TARGET ${id} ${t.kind} · ${t.key}`);
    return hit;
  });
  stats.targets += keep.length;
  stats.dropped += (d.droppedTargets || []).length;
  const lineCount = d.lines.length;
  const used = new Set();
  if (kind === 'grammar' && keep.length < 1) problems.push('NO_TARGET ' + id);
  if (kind === 'grammar' && keep.length > 2) problems.push(`TOO_MANY_TARGETS ${id} ${keep.length}`);
  if (kind === 'n1' && (keep.length < 1 || keep.length > 2)) problems.push(`N1_TARGETS ${id} ${keep.length}`);
  for (const t of keep) {
    if (typeof t.line !== 'number' || t.line < 0 || t.line >= lineCount) { problems.push(`LINE_INDEX ${id} ${t.key} ${t.line}`); continue; }
    used.add(t.line);
    if (!matches(d.lines[t.line].s, t.kind, t.key)) problems.push(`NOT_IN_LINE ${id} ${t.key}`);
  }
  const free = lineCount - used.size;
  if (free < 2) problems.push(`FEW_FREE_LINES ${id} ${free}`);
  stats.targetFree += free;
  const nonKanji = keep.filter(t => t.kind !== '한자').length;
  const braces = d.lines.reduce((a, x) => a + (String(x.s).match(/\{/g) || []).length, 0);
  if (braces < nonKanji) problems.push(`BRACES ${id} ${braces}/${nonKanji}`);
  d.lines.forEach((x, i) => {
    if (!String(x.s || '').trim()) problems.push(`EMPTY_LINE ${id} ${i}`);
    if (/[가-힣]/.test(String(x.s || ''))) problems.push(`JP_HAS_KO ${id} ${i}`);
    if (!String(x.ko || '').trim()) problems.push(`NO_KO ${id} ${i}`);
    if (/[\u3040-\u30FF]/.test(String(x.ko || ''))) problems.push(`KO_HAS_JP ${id} ${i}: ${x.ko}`);
    if ((String(x.s).match(/\[/g) || []).length !== (String(x.s).match(/\]/g) || []).length) problems.push(`BRACKET ${id} ${i}`);
  });
  const speakers = new Set(d.lines.map(x => x.who));
  if (speakers.size > 1) {
    for (let i = 1; i < d.lines.length; i++) {
      if (d.lines[i].who === d.lines[i - 1].who) problems.push(`SAME_SPEAKER ${id} ${i}`);
    }
  }
}

const typeCount = {};
for (const p of problems) { const t = p.split(' ')[0]; typeCount[t] = (typeCount[t] || 0) + 1; }
console.log(kind, 'lessons', stats.lessons, '/', srcById.size, 'lines', stats.lines, 'targets', stats.targets, 'dropped', stats.dropped);
console.log('avg lines', (stats.lines / stats.lessons).toFixed(1), 'free lines avg', (stats.targetFree / stats.lessons).toFixed(1));
console.log('problems', problems.length, typeCount);
for (const p of problems.slice(0, 60)) console.log(' ', p);
fs.writeFileSync(path.join(OUT, `rewrite-${prefix}-check.json`), JSON.stringify({ stats, problems }, null, 1), 'utf8');
