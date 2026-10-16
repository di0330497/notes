/* 가타카나에 붙은 루비를 떼어 낸다 — 외래어는 루비를 달지 않는 규칙.
   node tools/strip_katakana_ruby.cjs <파일...>                                  */
const fs = require('fs');
const log = [];
process.argv.slice(2).forEach(f => {
  let s = fs.readFileSync(f, 'utf8');
  const hits = [];
  s = s.replace(/\[([\u30A0-\u30FF\u30FC]+)\|([^\]]+)\]/g, (m, a, b) => { hits.push(a + '(' + b + ')'); return a; });
  if (hits.length) fs.writeFileSync(f, s, 'utf8');
  log.push(f + ': ' + hits.length + (hits.length ? '  ' + hits.join(' ') : ''));
});
fs.writeFileSync('strip_katakana.txt', log.join('\n'), 'utf8');
console.log(log.join('\n'));
