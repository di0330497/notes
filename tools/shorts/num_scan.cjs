const fs = require('fs'), vm = require('vm');
const c = {}; vm.createContext(c);
vm.runInContext(fs.readFileSync('C:/Users/user/Downloads/japanese-pages/j/2b10e90aebe237af55/data/lessons.js', 'utf8') + ';globalThis.L=LESSONS;', c);
const strip = s => String(s).replace(/\[([^\]|]+)\|[^\]]+\]/g, '$1').replace(/[{}]/g, '');
const KANJI = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10, 百: 100, 千: 1000, 万: 10000, 零: 0 };
function jpNums(s) {
  const out = new Set();
  for (const m of s.matchAll(/\d+/g)) out.add(Number(m[0]));
  for (const m of s.matchAll(/[一二三四五六七八九十百千万零]+/g)) {
    const t = m[0];
    if (t.length === 1) out.add(KANJI[t]);
    else {
      // simple: 十=10, 二十=20, 三百=300, 千=1000
      let total = 0, cur = 0;
      for (const ch of t) {
        const v = KANJI[ch];
        if (v >= 10) { if (cur === 0) cur = 1; total += cur * v; cur = 0; }
        else cur = cur * 10 + v;
      }
      out.add(total + cur);
    }
  }
  return out;
}
function koNums(s) {
  const out = new Set();
  for (const m of s.matchAll(/\d+/g)) out.add(Number(m[0].replace(/,/g, '')));
  return out;
}
const NAMES = ['田中', '佐藤', 'キム', 'ジフ', 'アキ', 'ハナ', 'ケン', '大阪', '東京', '韓国', '新宿', '山田', '鈴木'];
const NAMEKO = { 田中: '다나카', 佐藤: '사토', キム: '김', ジフ: '지후', アキ: '아키', ハナ: '하나', ケン: '켄', 大阪: '오사카', 東京: '도쿄', 韓国: '한국', 新宿: '신주쿠', 山田: '야마다', 鈴木: '스즈키' };
const rows = [];
for (const l of c.L) {
  if (l.track === 'kanji') continue;
  l.lines.forEach((x, i) => {
    const jp = strip(x.s), ko = String(x.ko || '');
    const jn = jpNums(jp), kn = koNums(ko);
    const missing = [...jn].filter(n => !kn.has(n) && n >= 1);
    const extra = [...kn].filter(n => !jn.has(n) && n >= 1);
    const f = [];
    if (missing.length) f.push('NUM_JP ' + missing.join('/'));
    if (extra.length) f.push('NUM_KO ' + extra.join('/'));
    for (const nm of NAMES) if (jp.includes(nm) && !ko.includes(NAMEKO[nm])) f.push('NAME ' + nm);
    if (f.length) rows.push({ id: l.id, i, f: f.join(','), jp, ko });
  });
}
console.log('rows', rows.length);
for (const r of rows) console.log(`${r.id}:${r.i} [${r.f}] ${r.jp} || ${r.ko}`);
