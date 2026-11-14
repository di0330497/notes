const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'j', '2b10e90aebe237af55', 'data');
const ctx = { console };
vm.createContext(ctx);
const files = fs.readdirSync(DATA).filter(f => /^dialogue-[0-9]+\.js$/.test(f)).sort((a, b) => (+a.match(/\d+/)[0]) - (+b.match(/\d+/)[0]));
vm.runInContext(files.map(f => fs.readFileSync(path.join(DATA, f), 'utf8')).join('\n')
  + '\n' + fs.readFileSync(path.join(DATA, 'dialogue-daily.js'), 'utf8')
  + '\n' + fs.readFileSync(path.join(DATA, 'daily-overrides.js'), 'utf8')
  + '\n' + fs.readFileSync(path.join(DATA, 'scene-reskin.js'), 'utf8')
  + '\n' + fs.readFileSync(path.join(DATA, 'context-rewrite.js'), 'utf8')
  + '\n' + fs.readFileSync(path.join(DATA, 'rewrite-20.js'), 'utf8')
  + '\n' + fs.readFileSync(path.join(DATA, 'rewrite-40.js'), 'utf8')
  + '\n' + fs.readFileSync(path.join(DATA, 'rewrite-60.js'), 'utf8')
  + '\n' + fs.readFileSync(path.join(DATA, 'rewrite-80.js'), 'utf8')
  + '\n' + fs.readFileSync(path.join(DATA, 'rewrite-final.js'), 'utf8')
  + '\n' + fs.readFileSync(path.join(DATA, 'targets-auto.js'), 'utf8')
  + '\n' + fs.readFileSync(path.join(DATA, 'coverage-patch.js'), 'utf8')
  + ';globalThis.D=DIALOGS;', ctx);
const D = ctx.D;
const map = {
  d130: { scene: '동아리방', place: '도쿄 · 대학 동아리방', title: '동아리 회계 감사 — 규정 점검' },
  d132: { scene: '집·일상', place: '도쿄 · 부동산 중개소', title: '원룸 계약서 — 조항과 조건 협상' },
  d133: { scene: '학교·대학가', place: '도쿄 · 대학 세미나실', title: '학원제 기획 발표 리허설' },
  d135: { scene: '동아리방', place: '도쿄 · 대학 동아리방', title: '축제 굿즈 납기 지연 — 사과와 대책' },
  d145: { scene: '동아리방', place: '도쿄 · 대학 동아리방', title: '협찬 굿즈 수량 회의' },
  d150: { scene: '학교·대학가', place: '도쿄 · 학생회관', title: '학생회 국제 교류 통계 확인' },
  d202: { scene: '편의점', place: '도쿄 · 편의점 「サンライズ」 バックルーム', title: '아르바이트 출고 문제 — 추측과 단정' },
  d374: { scene: '동아리방', place: '도쿄 · 대학 동아리방', title: '축제 준비 막판 — 예산과 일정' },
  d375: { scene: '동아리방', place: '도쿄 · 대학 동아리방', title: '축제 마감 후 — 감정과 평가' }
};
const items = Object.keys(map).map(id => {
  const d = D.find(x => x.id === id);
  return Object.assign({}, d, { newScene: map[id].scene, newPlace: map[id].place, newTitle: map[id].title });
});
for (let i = 0; i < items.length; i += 5) {
  const n = String(i / 5 + 1).padStart(2, '0');
  const file = path.join(ROOT, 'build', `n1-fix-${n}.json`);
  fs.writeFileSync(file, JSON.stringify(items.slice(i, i + 5), null, 1), 'utf8');
  console.log(file, items.slice(i, i + 5).map(x => x.id).join(','));
}
