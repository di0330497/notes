/* 신규 대화 품질 점검 — d162~d205 의 s 줄만 뽑아 파일로 */
const fs = require('fs');
const D = 'j/2b10e90aebe237af55/data/';
const out = [];
['dialogue-14.js', 'dialogue-15.js', 'dialogue-16.js', 'dialogue-17.js'].forEach(f => {
  const s = fs.readFileSync(D + f, 'utf8');
  out.push('########## ' + f + ' ##########');
  /* "id": "dXXX" 단위로 잘라 s, ko, item 추출 */
  const dlg = s.split(/"id":\s*"/).slice(1);
  dlg.forEach(blk => {
    const id = blk.slice(0, blk.indexOf('"'));
    out.push('===== ' + id + ' =====');
    const re = /"s":\s*"((?:[^"\\]|\\.)*)"/g;
    let m;
    while ((m = re.exec(blk))) out.push(m[1]);
  });
});
fs.writeFileSync('qa_new_dialogs.txt', out.join('\n'), 'utf8');
console.log('qa_new_dialogs.txt', fs.statSync('qa_new_dialogs.txt').size, 'bytes');
