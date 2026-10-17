/* 전체 데이터에서 한국인 설정(ジホ·パク·지호·지우·韓国·留学生·ソウル·ウォン·ソジュ·キムチ·在留·ビザ·帰国·母国) 전수 검색 */
const fs = require('fs');
const D = 'j/2b10e90aebe237af55/data/';
const files = fs.readdirSync(D).filter(f => f.endsWith('.js'));

const re = /ジホ|パク|지호|지우|지후|韓国|留学生|留学|ソウル|ウォン|ソジュ|キムチ|在留|ビザ|母国|韓国人|韓国語|한국|유학|귀국|재류/g;
const out = [];
files.forEach(f => {
  const s = fs.readFileSync(D + f, 'utf8');
  const lines = s.split(/\r?\n/);
  const hits = [];
  lines.forEach((l, i) => {
    const m = l.match(re);
    if (m) hits.push('  L' + (i + 1) + ' [' + [...new Set(m)].join(',') + ']: ' + l.trim().slice(0, 140));
  });
  if (hits.length) {
    out.push('=== ' + f + ' (' + hits.length + '줄) ===');
    hits.forEach(h => out.push(h));
  }
});
fs.writeFileSync('audit_korean_refs.txt', out.join('\n'), 'utf8');
console.log('총 ' + out.length + '줄 -> audit_korean_refs.txt');
