/* 배치 10 병합 — d162~d200 을 dialogue-14/15/16.js 로 나눠 담는다 */
const fs = require('fs');
const D = 'j/2b10e90aebe237af55/data/';
const groups = [
  { file: 'dialogue-14.js', from: 162, to: 175, head: '/* dialogue-14.js — 실제 생활 회화 d162~d175 (배치 10: 품사 낱말 커버리지 1/3)\n   낱말 1개 = 대사 1줄 = item 「품사 · 낱말」. 지시서 tools/make_batch10.cjs + build/spec-batch10.json */\n\n' },
  { file: 'dialogue-15.js', from: 176, to: 188, head: '/* dialogue-15.js — 실제 생활 회화 d176~d188 (배치 10: 품사 낱말 커버리지 2/3) */\n\n' },
  { file: 'dialogue-16.js', from: 189, to: 200, head: '/* dialogue-16.js — 실제 생활 회화 d189~d200 (배치 10: 품사 낱말 커버리지 3/3) */\n\n' },
];
groups.forEach(g => {
  const body = [];
  for (let i = g.from; i <= g.to; i++) {
    const p = 'build/d' + i + '.js';
    if (!fs.existsSync(p)) { console.log('없음', p); continue; }
    body.push(fs.readFileSync(p, 'utf8').trim());
  }
  fs.writeFileSync(D + g.file, g.head + body.join('\n\n') + '\n', 'utf8');
  console.log(g.file + ' ← d' + g.from + '~d' + g.to + ' (' + body.length + '편, ' + fs.statSync(D + g.file).size + ' bytes)');
});
/* placeholders 17~19 는 그대로 둔다 */
