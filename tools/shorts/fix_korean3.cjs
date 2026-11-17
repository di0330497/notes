const fs = require('fs'), path = require('path');
const DIR = 'C:/Users/user/Downloads/japanese-pages/build/shorts/rewrite';
const KO = {
  sh006: { 4: '내일 아침이요? 오늘 안에 써야 해서, 내일이면 와 봤자 늦어요.' },
  sh024: { 4: '좋네요. 그런데 너무 실용적인 것 같아요.' },
  sh105: { 9: '김 씨는 유학생치고는 일본어가 참 자연스럽네.' },
  g012: { 1: '가고 싶은 마음은 굴뚝같은데, 이직을 앞두고 당분간 놀러 다니는 걸 자제하고 있어.' },
  g014: { 2: '확인하겠습니다. …정말이네요. 선배가 "L로 주문받았다"고 해서 그대로 드렸어요.' },
  g036: { 4: '죄송해요, 큰 도움이 됩니다.' },
  g109: { 0: '오늘은 단어 시험이야. 먼저 「一日」 읽을 수 있어?' },
  g127: { 4: '한 건당 10퍼센트 정도 더 내려야 합니다.' }
};
let n = 0;
for (const f of fs.readdirSync(DIR).filter(f => /^(scene|grammar)-\d+\.json$/.test(f))) {
  const p = path.join(DIR, f);
  const a = JSON.parse(fs.readFileSync(p, 'utf8'));
  let hit = false;
  for (const d of a) if (KO[d.id]) { for (const [i, ko] of Object.entries(KO[d.id])) { if (d.lines[Number(i)]) { d.lines[Number(i)].ko = ko; n++; } } hit = true; }
  if (hit) fs.writeFileSync(p, JSON.stringify(a, null, 1), 'utf8');
}
console.log('third batch', n);
