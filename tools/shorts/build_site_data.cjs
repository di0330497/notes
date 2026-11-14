/* build_site_data.cjs — shorts-all.json → data/shorts.js + data/lessons.js */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(ROOT, 'build', 'shorts');
const DATA = path.join(ROOT, 'j', '2b10e90aebe237af55', 'data');
const assign = JSON.parse(fs.readFileSync(path.join(OUT, 'assignments.json'), 'utf8')).scenes;
const byId = new Map(assign.map(s => [s.id, s]));
const all = JSON.parse(fs.readFileSync(path.join(OUT, 'shorts-all.json'), 'utf8'));

const shorts = all.map(d => {
  const a = byId.get(d.id) || {};
  const noteBy = new Map((a.targets || []).map(t => [t.kind + ' · ' + t.key, t]));
  const targets = (d.targets || []).map(t => {
    const src = noteBy.get(t.kind + ' · ' + t.key) || {};
    return {
      kind: t.kind, key: t.key, line: t.line,
      note: src.note || '', examples: src.examples || []
    };
  });
  return {
    id: d.id,
    level: d.level || a.level || 'N3',
    lv: String(d.level || a.level || 'N3').replace('N', ''),
    scene: d.scene || a.scene || '',
    title: d.title || a.title || '',
    place: (d.scene || a.scene || '') + ' · ' + (a.function || ''),
    register: d.register || a.register || 'polite',
    chars: a.chars || ['jihu'],
    lines: (d.lines || []).map(x => ({ who: x.who, s: x.s, ko: x.ko || '' })),
    targets
  };
});

const js = `/* shorts.js — 150 쇼츠 대화. build/shorts/shorts-all.json 기반.
   레슨은 lessons.js 가 직접 들고 있으므로 DIALOGS 를 오염시키지 않는다. */
const SHORTS = ${JSON.stringify(shorts)};
`;
fs.writeFileSync(path.join(DATA, 'shorts.js'), js, 'utf8');

const lessons = shorts.map(s => ({
  id: s.id,
  src: s.id,
  part: 1,
  from: 0,
  to: s.lines.length,
  level: s.level,
  scene: s.scene,
  goal: s.title,
  place: s.place,
  chars: s.chars,
  lines: s.lines,
  targets: s.targets,
  review: []
}));
const ljs = `/* lessons.js — 쇼츠 150편 코스. build/shorts/shorts-all.json 기반.
   1편 = 1레슨. 목표는 본문에 실제로 나오는 항목만. */
const LESSONS = ${JSON.stringify(lessons)};
`;
fs.writeFileSync(path.join(DATA, 'lessons.js'), ljs, 'utf8');
console.log('shorts', shorts.length, 'lessons', lessons.length,
  'targets', lessons.reduce((a, l) => a + l.targets.length, 0),
  'lines', shorts.reduce((a, s) => a + s.lines.length, 0));
