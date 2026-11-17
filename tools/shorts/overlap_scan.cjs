const fs = require('fs'), vm = require('vm');
const c = {}; vm.createContext(c);
vm.runInContext(fs.readFileSync('C:/Users/user/Downloads/japanese-pages/j/2b10e90aebe237af55/data/lessons.js', 'utf8') + ';globalThis.L=LESSONS;', c);
const strip = s => String(s).replace(/\[([^\]|]+)\|[^\]]+\]/g, '$1').replace(/[{}]/g, '');
const words = s => {
  const out = new Set();
  for (const m of s.matchAll(/[\u4e00-\u9fff]{2,}/g)) out.add(m[0]);
  for (const m of s.matchAll(/[\u30a0-\u30ff]{3,}/g)) out.add(m[0]);
  return out;
};
const greet = /(こんにちは|こんばんは|おはよう|ありがとう|すみません|いらっしゃいませ|お疲れ|失礼|よろしく|お願いします|はい|いいえ|ええ|うん|そう)/;
const rows = [];
for (const l of c.L) {
  if (l.track === 'kanji') continue;
  for (let i = 1; i < l.lines.length; i++) {
    const a = strip(l.lines[i - 1].s), b = strip(l.lines[i].s);
    if (a.length < 8 && b.length < 8) continue;
    const wa = words(a), wb = words(b);
    let shared = 0;
    for (const w of wa) if (wb.has(w)) shared++;
    if (shared === 0 && !greet.test(a) && !greet.test(b)) rows.push({ id: l.id, i, a, b });
  }
}
console.log('pairs', rows.length);
for (const r of rows.slice(0, 120)) console.log(`${r.id}:${r.i} ${r.a} || ${r.b}`);
