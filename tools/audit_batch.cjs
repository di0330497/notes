/* 배치 감사 — node tools/audit_batch.cjs d88 d89 ... 
   검사: 가타카나 루비 / 이름 표기 불일치 / 배치 안 항목 중복 / 줄 수·배지 수 */
const fs = require('fs');
const ids = process.argv.slice(2);
const out = [];
const allItems = {};
ids.forEach(id => {
  const s = fs.readFileSync('build/' + id + '.js', 'utf8');
  let m;
  const reKat = /\[([\u30A0-\u30FF\u30FC]+)\|([^\]]+)\]/g;
  while ((m = reKat.exec(s))) out.push('카타카나 루비 ' + id + ': ' + m[0]);
  ['キム', 'イ・', 'ジフ', 'ジウ'].forEach(n => { if (s.indexOf(n) >= 0) out.push('이름 표기 ' + id + ': ' + n); });
  const ire = /"item": "([^"]+)"/g;
  while ((m = ire.exec(s))) { allItems[m[1]] = (allItems[m[1]] || 0) + 1; }
  const lines = (s.match(/"who":/g) || []).length;
  out.push(id + ': ' + lines + '줄 / 배지 ' + (s.match(/"item":/g) || []).length + ' / tags ' + (s.match(/\[ "/g) || []).length);
});
const dup = Object.entries(allItems).filter(([k, v]) => v > 1);
out.push('── 배치 안 항목 중복 ' + dup.length + '건');
dup.forEach(([k, v]) => out.push('  ×' + v + '  ' + k));
fs.writeFileSync('audit_batch.txt', out.join('\n'), 'utf8');
console.log(out.join('\n'));
