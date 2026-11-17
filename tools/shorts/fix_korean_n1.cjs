const fs = require('fs'), path = require('path');
const DIR = 'C:/Users/user/Downloads/japanese-pages/build/shorts/rewrite';
const KO = {
  n002: { 0: '엔화 약세가 장기화하면서 수입품 가격이 가계를 직접 압박하기 시작했다.' },
  n008: { 3: '행정 당국 역시 예산 제약에서 자유롭지 않다.' },
  n015: { 0: '전쟁의 포화 아래에서 사는 사람들을 생각할 때마다 세계의 평화를 빌어 마지않는다.' },
  n018: { 0: '뛰어난 소설은 읽는 이의 마음을 흔들지 않고는 못 배긴다.' },
  n024: { 3: '일대의 농지는 천 헥타르에 이르고, 눈에 보이는 끝까지 논이 이어진다.' },
  n027: { 2: '한 번 빈집이 되면 지역이 쇠퇴할지도 모른다.' },
  n031: { 3: '최근의 보고서는 피해의 실태가 온갖 고난을 겪은 것임을 숫자로 보여 주고 있다.' },
  n034: { 2: '지도자라면 승리를 위해 선수의 존엄을 상처 입히는 일을 해서는 안 된다.' },
  n037: { 0: '평화라는 말은 흔히 희망만 앞세워 이야기된다.' },
  n041: { 4: '2020년대를 기점으로 교육 현장에서도 AI 사용법을 가르치는 움직임이 퍼졌다.' }
};
let n = 0;
for (const f of fs.readdirSync(DIR).filter(f => /^n1-\d+\.json$/.test(f))) {
  const p = path.join(DIR, f);
  const a = JSON.parse(fs.readFileSync(p, 'utf8'));
  let hit = false;
  for (const d of a) if (KO[d.id]) { for (const [i, ko] of Object.entries(KO[d.id])) { d.lines[Number(i)].ko = ko; n++; } hit = true; }
  if (hit) fs.writeFileSync(p, JSON.stringify(a, null, 1), 'utf8');
}
console.log('n1 ko edits', n);
