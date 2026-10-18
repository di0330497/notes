/* 일본어 본문 폰트 — Noto Sans JP → M PLUS 1p (가나 크고 획이 분명, 400/500/700) */
const fs = require('fs');
const R = 'j/2b10e90aebe237af55/';

/* ── index.html ── 폰트 링크: M PLUS 1p 추가, 쓰이지 않는 Noto Serif JP 제거 */
let h = fs.readFileSync(R + 'index.html', 'utf8');
h = h.replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]*">/,
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=M+PLUS+1p:wght@400;500;700&family=Noto+Sans+JP:wght@400;500;700&display=swap">');
fs.writeFileSync(R + 'index.html', h, 'utf8');

/* ── styles.css ── */
let c = fs.readFileSync(R + 'css/styles.css', 'utf8');

/* 1) 폰트 주석 갱신 */
c = c.replace(/   일본어 본문: Inter 계열 우선, 한자 글리프는 Noto Serif JP 로 넘긴다/,
  '   일본어 본문: M PLUS 1p(가나가 크고 획이 분명해 가장 읽기 쉬움) → Noto Sans JP 폴백');

/* 2) --jp 갱신 — 따옴표로 감싼 정확한 서체명 + Noto Sans JP 폴백 */
c = c.replace(/:root\{--jp:[^\}]*\}/,
  ':root{--jp:"M PLUS 1p","Noto Sans JP","Pretendard Variable","Pretendard","Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo","Malgun Gothic","맑은 고딕",sans-serif}');

/* 3) 후리가나 가독성 — 0.46em → 0.5em, 담백한 회색 → 좀 더 진한 회색 */
c = c.replace(/\.sent ruby rt\{font-size:\.46em;color:var\(--faint\);font-weight:400\}/,
  '.sent ruby rt{font-size:.5em;color:var(--muted);font-weight:400}');
c = c.replace(/\.line \.jp ruby rt\{font-size:\.46em;color:var\(--faint\);font-weight:400\}/,
  '.line .jp ruby rt{font-size:.5em;color:var(--muted);font-weight:400}');
c = c.replace(/\.gsLabel rt\{font-size:\.5em;color:var\(--faint\)\}/,
  '.gsLabel rt{font-size:.5em;color:var(--muted)}');

fs.writeFileSync(R + 'css/styles.css', c, 'utf8');

/* 4) 캐시버스터 */
const n = (h.match(/\?v=20261018-i/g) || []).length;
h = h.split('?v=20261018-i').join('?v=20261018-j');
fs.writeFileSync(R + 'index.html', h, 'utf8');
console.log('폰트 적용 완료 · 캐시버스터 ' + n + '곳 → ?v=20261018-j');
