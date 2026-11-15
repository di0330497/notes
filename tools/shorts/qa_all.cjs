const fs = require('fs'), vm = require('vm');
const c = {}; vm.createContext(c);
vm.runInContext(fs.readFileSync('C:/Users/user/Downloads/japanese-pages/j/2b10e90aebe237af55/data/lessons.js', 'utf8') + ';globalThis.L=LESSONS;', c);
const L = c.L;
const problems = [];
const byTrack = {};
for (const l of L) {
  byTrack[l.track] = byTrack[l.track] || { n: 0, lines: 0, targets: 0 };
  const b = byTrack[l.track];
  b.n++; b.lines += l.lines.length; b.targets += l.targets.length;
  const seen = new Set();
  for (const t of l.targets) {
    const k = t.kind + '·' + t.key;
    if (seen.has(k)) problems.push(`DUP_TARGET ${l.id} ${k}`);
    seen.add(k);
    if (!t.note) problems.push(`NO_NOTE ${l.id} ${k}`);
  }
  l.lines.forEach((x, i) => {
    if (!String(x.s || '').trim()) problems.push(`EMPTY ${l.id} ${i}`);
    if (!String(x.ko || '').trim()) problems.push(`NO_KO ${l.id} ${i}`);
    if (/[가-힣]/.test(x.s)) problems.push(`KO_IN_JP ${l.id} ${i}`);
    if (l.track !== 'kanji' && /[\u3040-\u30FF]/.test(x.ko)) problems.push(`JP_IN_KO ${l.id} ${i}`);
    const o = (x.s.match(/\[/g) || []).length, cl = (x.s.match(/\]/g) || []).length;
    if (o !== cl) problems.push(`BRACKET ${l.id} ${i}`);
    const ob = (x.s.match(/\{/g) || []).length, cb = (x.s.match(/\}/g) || []).length;
    if (ob !== cb) problems.push(`BRACE ${l.id} ${i}`);
  });
  if (l.track === 'scene' && (l.lines.length < 7 || l.lines.length > 14)) problems.push(`SCENE_LINES ${l.id} ${l.lines.length}`);
  if (l.track === 'grammar' && (l.lines.length < 4 || l.lines.length > 6)) problems.push(`GRAM_LINES ${l.id} ${l.lines.length}`);
  if (l.track === 'n1' && (l.lines.length < 4 || l.lines.length > 6)) problems.push(`N1_LINES ${l.id} ${l.lines.length}`);
  if (l.track === 'kanji' && (l.lines.length < 4 || l.lines.length > 7)) problems.push(`KANJI_LINES ${l.id} ${l.lines.length}`);
}
console.log(byTrack);
const types = {};
for (const p of problems) { const t = p.split(' ')[0]; types[t] = (types[t] || 0) + 1; }
console.log('problems', problems.length, types);
for (const p of problems.slice(0, 30)) console.log(' ', p);
