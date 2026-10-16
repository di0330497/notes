/* 대화 검토용 압축 덤프 — node tools/dump_lines.cjs <id...>
   id | who | item | s | ko  를 한 줄씩 review_<batch>.txt 로 */
const fs = require('fs');
const ids = process.argv.slice(2);
const out = [];
ids.forEach(id => {
  const s = fs.readFileSync('build/' + id + '.js', 'utf8');
  const arr = new Function('DIALOGS', s + '\n;return DIALOGS;')([]);
  arr.forEach(d => {
    out.push('════ ' + d.id + ' ' + d.title + '  (' + d.chars.join(',') + ')');
    d.lines.forEach((l, i) => out.push((i + 1) + '|' + l.who + '|' + (l.item ? l.item.replace(/^(\S+) · /, '$1:') : '') + '|' + l.s + '|' + (l.ko || '')));
  });
});
fs.writeFileSync('review_dump.txt', out.join('\n'), 'utf8');
console.log(out.length + ' lines');
