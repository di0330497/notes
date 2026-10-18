/* 폰트 롤백 — M PLUS 1p 제거, 기존 Noto Sans JP 상태로 복원 (캐시버스터만 새로) */
const fs = require('fs');
const R = 'j/2b10e90aebe237af55/';

/* ── index.html ── 폰트 링크 원복 */
let h = fs.readFileSync(R + 'index.html', 'utf8');
h = h.replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]*">/,
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&family=Noto+Serif+JP:wght@500;600;700&display=swap">');

/* ── styles.css ── */
let c = fs.readFileSync(R + 'css/styles.css', 'utf8');
c = c.replace(/:root\{--jp:[^\}]*\}/,
  ':root{--jp:"Noto Sans JP","Pretendard Variable","Pretendard","Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo","Malgun Gothic","맑은 고딕",sans-serif}');
/* 후리가나 원복 */
c = c.replace(/\.sent ruby rt\{font-size:\.5em;color:var\(--muted\);font-weight:400\}/,
  '.sent ruby rt{font-size:.46em;color:var(--faint);font-weight:400}');
c = c.replace(/\.line \.jp ruby rt\{font-size:\.5em;color:var\(--muted\);font-weight:400\}/,
  '.line .jp ruby rt{font-size:.46em;color:var(--faint);font-weight:400}');
c = c.replace(/\.gsLabel rt\{font-size:\.5em;color:var\(--muted\)\}/,
  '.gsLabel rt{font-size:.5em;color:var(--faint)}');
fs.writeFileSync(R + 'css/styles.css', c, 'utf8');

/* ── 캐시버스터 -j → -k ── */
const n = (h.match(/\?v=20261018-j/g) || []).length;
h = h.split('?v=20261018-j').join('?v=20261018-k');
fs.writeFileSync(R + 'index.html', h, 'utf8');
console.log('롤백 완료 · ' + n + '곳 → ?v=20261018-k');
