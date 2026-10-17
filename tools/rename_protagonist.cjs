/* 대화 전체에서 한국인 배역을 일본인으로: ジホ→ユウ키, 지호→유우키, パク→高橋 */
const fs = require('fs');
const D = 'j/2b10e90aebe237af55/data/';
const files = fs.readdirSync(D).filter(f => f.endsWith('.js'));
const rep = [
  ['ジホくん', 'ユウキくん'], ['ジホさん', 'ユウキさん'], ['ジホ', 'ユウキ'],
  ['지호 군', '유우키 군'], ['지호 씨', '유우키 씨'], ['지호', '유우키'],
  ['パク・ジホ', '高橋・ユウキ'], ['パク', '高橋'],
];
files.forEach(f => {
  let s = fs.readFileSync(D + f, 'utf8');
  const before = s;
  rep.forEach(([a, b]) => { s = s.split(a).join(b); });
  if (s !== before) { fs.writeFileSync(D + f, s, 'utf8'); console.log('renamed', f); }
});
