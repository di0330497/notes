/* index.html 에 dialogue-13.js <script> 추가 (없을 때만) */
const fs = require('fs');
const p = 'j/2b10e90aebe237af55/index.html';
let s = fs.readFileSync(p, 'utf8');
const ver = (s.match(/\?v=(\d{8}-[a-z])/) || [])[1] || '20261017-j';
if (s.indexOf('dialogue-13.js') >= 0) { console.log('이미 dialogue-13.js 있음'); process.exit(0); }
const t12 = '<script src="data/dialogue-12.js?v=' + ver + '"></script>';
if (s.indexOf(t12) < 0) { console.log('ERROR: dialogue-12 태그 없음'); process.exit(1); }
s = s.replace(t12, t12 + '\n<script src="data/dialogue-13.js?v=' + ver + '"></script>');
fs.writeFileSync(p, s, 'utf8');
console.log('dialogue-13.js 추가 (v=' + ver + ')');
