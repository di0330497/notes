/* context_audit.cjs — 문맥 이상 후보를 찾는다.
   1) 일상 코스에 남은 직장 어휘
   2) 화자(chars)에 없는 who
   3) item 태그가 실제 줄에 없는 줄
   4) 장면과 대사가 어긋나는 신호
   출력: build/context-audit.json / .md */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'j', '2b10e90aebe237af55', 'data');
function load(files, tail) {
  const ctx = { console };
  vm.createContext(ctx);
  vm.runInContext(files.map(f => fs.readFileSync(path.join(DATA, f), 'utf8')).join('\n') + '\n' + tail, ctx, { timeout: 40000 });
  return ctx;
}
const dctx = load(
  fs.readdirSync(DATA).filter(f => /^dialogue-[0-9]+\.js$/.test(f)).sort((a, b) => (+a.match(/\d+/)[0]) - (+b.match(/\d+/)[0]))
    .concat(['dialogue-daily.js', 'daily-overrides.js', 'scene-reskin.js', 'context-rewrite.js', 'rewrite-20.js', 'rewrite-40.js', 'rewrite-60.js', 'targets-auto.js', 'coverage-patch.js']),
  'globalThis.D=DIALOGS;'
);
const D = dctx.D;
const tctx = load(['tracks.js'], 'globalThis.T=DLG_TRACK;');
const TRACK = tctx.T;

const strip = s => String(s || '')
  .replace(/\[([^\]|]+)\|[^\]]+\]/g, '$1')
  .replace(/\{([^{}]+)\}/g, '$1')
  .replace(/\[([^\]]+)\]/g, '$1');
const N = s => String(s || '').replace(/[〜～]/g, '').replace(/[\s（）()「」、。,.!?！？·・／/]/g, '').toLowerCase();

const CORPORATE = /(会社|弊社|本社|支店|社内|社員|上司|部長|課長|常務|役員|取締役|株主|取引先|先方|部署|営業部|企画部|総務|経理|人事|決裁|稟議|監査|納品|工場|生産ライン|名刺|上座|出張|売上|契約書|違約金|見積書|請求書)/;
const CORPORATE_KO = /(회사|본사|지점|사내|사원|상사|부장|과장|상무|임원|주주|거래처|상대 측|부서|영업부|기획부|총무|경리|인사|결재|품의|감사|납품|공장|생산 라인|명함|상석|출장|매출|계약서|위약금|견적서|청구서)/;
const issues = [];
for (const d of D) {
  const track = TRACK[d.id] || 'life';
  const text = (d.lines || []).map(l => strip(l.s)).join('\n');
  const ko = (d.lines || []).map(l => l.ko || '').join('\n');
  if (track !== 'work' && track !== 'coverage' && CORPORATE.test(text)) {
    issues.push({ id: d.id, type: 'corporate-in-daily', track, title: d.title, hit: text.match(CORPORATE)[0] });
  }
  const who = new Set(d.chars || []);
  for (const l of d.lines || []) {
    if (!who.has(l.who)) issues.push({ id: d.id, type: 'unknown-speaker', who: l.who, title: d.title });
  }
  (d.lines || []).forEach((l, i) => {
    if (!l.item) return;
    const m = String(l.item).match(/^([^ ·]+)\s*·\s*(.+)$/);
    if (!m) return;
    const kind = m[1];
    if (kind === '한자') {
      const ch = String(m[2]).trim().charAt(0);
      if (ch && !strip(l.s).includes(ch)) issues.push({ id: d.id, type: 'item-not-in-line', line: i + 1, item: l.item, s: strip(l.s), title: d.title });
      return;
    }
    const jp = String(m[2]).split(' — ')[0].replace(/[가-힣].*$/, '').replace(/[（(][^）)]*[）)]/g, '');
    const segs = jp.split(/[／/·～]/).map(N).filter(x => x.length >= 2);
    const longest = segs.sort((a, b) => b.length - a.length)[0];
    if (longest && !N(l.s).includes(longest)) {
      issues.push({ id: d.id, type: 'item-not-in-line', line: i + 1, item: l.item, s: strip(l.s), title: d.title });
    }
  });
  /* 장면-대사 신호 */
  const sc = d.scene || '';
  if (/카페/.test(sc) && /(会社|会議|取引先|部長)/.test(text)) issues.push({ id: d.id, type: 'scene-mismatch', scene: sc, title: d.title });
  if (/편의점/.test(sc) && /(取引先|部長|会議室|決裁)/.test(text)) issues.push({ id: d.id, type: 'scene-mismatch', scene: sc, title: d.title });
}
const byType = {};
for (const x of issues) byType[x.type] = (byType[x.type] || 0) + 1;
fs.writeFileSync(path.join(ROOT, 'build', 'context-audit.json'), JSON.stringify({ byType, issues }, null, 1), 'utf8');
const md = ['# 문맥 점검 후보', '', '| 유형 | 건수 |', '|---|---:|'];
for (const [k, v] of Object.entries(byType)) md.push(`| ${k} | ${v} |`);
md.push('', '## 상세', '');
for (const x of issues) md.push(`- **${x.type}** ${x.id} ${x.title || ''} ${x.line ? 'L' + x.line : ''} ${x.item || ''} ${x.hit || x.who || x.scene || ''}`);
fs.writeFileSync(path.join(ROOT, 'build', 'context-audit.md'), md.join('\n') + '\n', 'utf8');
console.log(byType);
console.log('total', issues.length);
