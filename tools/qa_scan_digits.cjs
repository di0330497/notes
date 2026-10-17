/* 신규 대화(d162~d205) 품질 스캔: 아라비아 숫자, 후리가나 없는 한자, 어색한 ko 등 */
const fs = require('fs'), path = require('path');
const D = 'j/2b10e90aebe237af55/data/';
const files = ['dialogue-14.js', 'dialogue-15.js', 'dialogue-16.js', 'dialogue-17.js'];
const out = [];
files.forEach(f => {
  const s = fs.readFileSync(D + f, 'utf8');
  s.split(/\r?\n/).forEach((l, i) => {
    const m = l.match(/"s":\s*"((?:[^"\\]|\\.)*)"/);
    if (!m) return;
    const ja = m[1];
    if (/[0-9０-９]/.test(ja)) out.push('ARABIC  ' + f + ':' + (i + 1) + '  ' + ja);
  });
});
fs.writeFileSync('qa_arabic.txt', out.join('\n'), 'utf8');
console.log('아라비아 숫자 포함 s 줄:', out.length);
out.slice(0, 40).forEach(x => console.log('  ' + x));
