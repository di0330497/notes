const fs = require('fs'), vm = require('vm');
const c = {}; vm.createContext(c);
vm.runInContext(fs.readFileSync('C:/Users/user/Downloads/japanese-pages/j/2b10e90aebe237af55/data/lessons.js', 'utf8') + ';globalThis.L=LESSONS;', c);
const strip = s => String(s).replace(/\[([^\]|]+)\|[^\]]+\]/g, '$1').replace(/[{}]/g, '');
const negJP = /(ない|ません|なかった|なく|ず|まい|なし)/;
const negKO = /(안 |없|못 |않|아니|아녜|말고|빼고|전혀|별로)/;
const qJP = /(？|\?|か。|か？|ですか|ますか|の？|の。)/;
const qKO = /(？|\?|까|나요|죠|가요|인가요|어때|뭐야|왜|어디|언제|누구|몇)/;
const rows = [];
for (const l of c.L) {
  if (l.track === 'kanji') continue;
  l.lines.forEach((x, i) => {
    const jp = strip(x.s), ko = String(x.ko || '');
    const jlen = jp.replace(/[\s。、！？…]/g, '').length;
    const klen = ko.replace(/[\s.?!,…]/g, '').length;
    const f = [];
    if (jlen && klen / jlen < 0.55) f.push(`SHORT ${klen}/${jlen}`);
    if (jlen && klen / jlen > 2.6) f.push(`LONG ${klen}/${jlen}`);
    if (negJP.test(jp) !== negKO.test(ko)) f.push('NEG');
    if (qJP.test(jp) !== qKO.test(ko)) f.push('Q');
    if (/그러네요/.test(ko)) f.push('GEUREO');
    if (/것입니다|것이다/.test(ko) && l.track !== 'n1') f.push('GEOT');
    if (f.length) rows.push({ id: l.id, i, f: f.join(','), jp, ko });
  });
}
const byType = {};
for (const r of rows) for (const t of r.f.split(',')) byType[t.split(' ')[0]] = (byType[t.split(' ')[0]] || 0) + 1;
console.log('rows', rows.length, byType);
for (const r of rows) console.log(`${r.id}:${r.i} [${r.f}] ${r.jp} || ${r.ko}`);
