/* 배치 11 병합 — d201~d205 을 dialogue-17.js 로 */
const fs = require('fs');
const D = 'j/2b10e90aebe237af55/data/';
const head = '/* dialogue-17.js — 실제 생활 회화 d201~d205 (배치 11: 문형·표현·구어체 미커버 마무리)\n   지시서 tools/make_batch11.cjs + build/spec-batch11.json */\n\n';
const body = [];
for (let i = 201; i <= 205; i++) body.push(fs.readFileSync('build/d' + i + '.js', 'utf8').trim());
fs.writeFileSync(D + 'dialogue-17.js', head + body.join('\n\n') + '\n', 'utf8');
console.log('dialogue-17.js ← d201~d205 (' + fs.statSync(D + 'dialogue-17.js').size + ' bytes)');
