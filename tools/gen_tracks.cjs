/* gen_tracks.cjs — 대화 트랙(일상/보강) 정적 맵 생성
   출력: j/2b10e90aebe237af55/data/tracks.js
   track: peer(또래·SNS) / life(생활·알바) / campus / work(직장 보강) / coverage(문법 보강) */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'j', '2b10e90aebe237af55', 'data');
const ctx = { console };
vm.createContext(ctx);
const files = fs.readdirSync(DATA).filter(f => /^dialogue-[0-9]+\.js$/.test(f))
  .sort((a, b) => (+a.match(/\d+/)[0]) - (+b.match(/\d+/)[0]));
const code = files.map(f => fs.readFileSync(path.join(DATA, f), 'utf8')).join('\n')
  + '\n' + fs.readFileSync(path.join(DATA, 'dialogue-daily.js'), 'utf8')
  + '\n' + fs.readFileSync(path.join(DATA, 'daily-overrides.js'), 'utf8')
  + '\n' + fs.readFileSync(path.join(DATA, 'scene-reskin.js'), 'utf8')
  + '\n' + fs.readFileSync(path.join(DATA, 'context-rewrite.js'), 'utf8')
  + '\n;globalThis.D=DIALOGS;';
vm.runInContext(code, ctx, { timeout: 30000 });
const D = ctx.D;

const OVERRIDE = {
  d08: 'life', d18: 'life', d21: 'campus', d23: 'life', d30: 'campus', d37: 'peer',
  d41: 'life', d44: 'peer', d45: 'life', d55: 'peer', d76: 'peer', d77: 'peer', d368: 'peer', d369: 'peer', d370: 'life', d371: 'life',
  d372: 'campus', d373: 'life'
};
const COVERAGE = /(때를 가리키는|어떻게 하는지를|이유·원인의|말을 돌리는|몸에 관한|상황의 말|통과된 기획|회의실 뒷이야기|회의실 밖|회의 전 확인|회의 준비|행사 안내|상사와의|새 업무|전근 통보|기획 회의|제출은|道が|シフトの|会議の|오후 미팅|회의 전후|연말 인사|업무 중 벌어진|명사를 꾸미는|마음의 움직임을|말을 메우는|성격의 말|어려움의 말|신입 환영회 안내문)/;
const WORK = /(거래|계약|감사|납품|결재|품의|프레젠테이션|사내|본사|영업|임원|결산|예산|매출|협상|조항|발주|거래처|상무|부장|과장|대책 회의|킥오프|스프린트|프로젝트|출장|보고서|품의서)/;
const OFFICE_DAILY = /(첫 출근|연차|OJT|야근|잡담|라운지|탕비실|시프트|아르바이트|알바|면접|환영회|술자리|전화|창고|연휴|아침|로비|휴게실|계단)/;

function classify(d) {
  if (OVERRIDE[d.id]) return OVERRIDE[d.id];
  const s = d.scene || '', t = d.title || '';
  if (/(친구|연애|데이트|SNS|メッセージ|メ신저|단톡|동아리|스포츠)/.test(s) || /(친구|연애|데이트|SNS|메신저|단톡|동아리)/.test(t)) return 'peer';
  if (s === '문법 보강') return 'coverage';
  if (s === '직장·사무실') {
    if (COVERAGE.test(t)) return 'coverage';
    if (WORK.test(t)) return 'work';
    if (OFFICE_DAILY.test(t)) return 'life';
    return 'work';
  }
  if (s === '학교·어학원' || s === '학교·대학가') return 'campus';
  return 'life';
}

const map = {};
const counts = {};
for (const d of D) {
  const t = classify(d);
  map[d.id] = t;
  counts[t] = (counts[t] || 0) + 1;
}
const out = `/* tracks.js — 대화 트랙. 일상 코스(peer/life/campus)와 보강(work/coverage)을 가른다.
   gen_tracks.cjs 가 생성한다. 직접 고치지 말고 tools/daily_plan.cjs · gen_tracks.cjs 를 고친다. */
const DLG_TRACK = ${JSON.stringify(map, null, 0)};
const TRACK_NAME = {peer:"또래·SNS", life:"생활·알바", campus:"캠퍼스", work:"직장 보강", coverage:"문법 보강"};
`;
fs.writeFileSync(path.join(DATA, 'tracks.js'), out, 'utf8');
console.log('tracks', counts, 'total', D.length);
