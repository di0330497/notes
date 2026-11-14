/* build_site_data.cjs — 장면·문법·한자·N1 → data/lessons.js */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(ROOT, 'build', 'shorts');
const DATA = path.join(ROOT, 'j', '2b10e90aebe237af55', 'data');

function read(name, fallback) {
  const p = path.join(OUT, name);
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : fallback;
}
const sources = [
  { track: 'scene', file: 'shorts-all.json', assign: 'assignments.json' },
  { track: 'grammar', file: 'grammar-all.json', assign: 'grammar-assignments.json' },
  { track: 'grammar', file: 'grammar-extra-manual.json', assign: 'grammar-extra-assignments.json' },
  { track: 'kanji', file: 'kanji-shorts.json', assign: null },
  { track: 'n1', file: 'n1-all.json', assign: 'n1-assignments.json' }
];
const lessons = [];
for (const src of sources) {
  const all = read(src.file, []);
  const assign = src.assign ? read(src.assign, { scenes: [] }).scenes : [];
  const byId = new Map(assign.map(s => [s.id, s]));
  for (const d of all) {
    const a = byId.get(d.id) || {};
    const noteBy = new Map((a.targets || []).map(t => [t.kind + ' · ' + t.key, t]));
    const targets = (d.targets || []).map(t => {
      const n = noteBy.get(t.kind + ' · ' + t.key) || t;
      return { kind: t.kind, key: t.key, line: t.line, note: n.note || t.note || '', examples: n.examples || [] };
    });
    const lines = (d.lines || []).map(x => ({ who: x.who, s: x.s, ko: x.ko || '' }));
    lessons.push({
      id: d.id, track: src.track, src: d.id, part: 1, from: 0, to: lines.length,
      level: d.level || a.level || 'N3', scene: d.scene || a.scene || '',
      goal: d.title || a.title || '', place: (d.scene || a.scene || '') + ' · ' + (a.function || ''),
      chars: a.chars || d.chars || ['jihu'], lines, targets, review: []
    });
  }
}
const js = `/* lessons.js — 장면·문법·한자·N1 쇼츠. build/shorts/*-all.json 기반. */
const LESSONS = ${JSON.stringify(lessons)};
`;
fs.writeFileSync(path.join(DATA, 'lessons.js'), js, 'utf8');
const byTrack = {};
for (const l of lessons) byTrack[l.track] = (byTrack[l.track] || 0) + 1;
console.log('lessons', lessons.length, byTrack,
  'targets', lessons.reduce((a, l) => a + l.targets.length, 0),
  'lines', lessons.reduce((a, l) => a + l.lines.length, 0));
