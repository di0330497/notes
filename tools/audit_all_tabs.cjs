/* 탭별 정밀 재검증 — 각 사전 카드가 대화에서 실제로 보이는지 4단계로 분류
   A: 줄 item 태그에 정확 키 등장 (금상첨화)
   B: d.tags 에만 등장 (주장만 있고 줄에는 없음)
   C: 부분 일치(정규화 후 포함)로만 매칭
   D: 전혀 없음
*/
const fs = require('fs'), path = require('path');
const D = 'j/2b10e90aebe237af55/data';
const load = (files, name) => { new Function(files.map(f => fs.readFileSync(path.join(D, f), 'utf8')).join('\n;\n') + ';globalThis.__X=' + name + ';')(); return globalThis.__X; };

const PATS = load(['patterns.js'], 'PATS');
const GRAMMAR = load(['grammar.js'], 'GRAMMAR');
const EXPR = load(['expressions.js'], 'EXPR');
const SPOKEN = load(['colloquial.js', 'colloquial-2.js', 'dialect.js', 'slang.js', 'slang-2026.js'], 'SPOKEN');
const CONJ = load(['conjugation.js'], 'CONJ');
const POS = load(['pos-josa.js', 'pos-fukushi.js', 'pos-other.js', 'pos-verb.js', 'pos-noun.js', 'pos-words.js', 'pos-keiyou-2.js'],
  '[].concat(typeof POS_JOSA!=="undefined"?POS_JOSA:[],typeof POS_ADV!=="undefined"?POS_ADV:[],typeof POS_OTHER!=="undefined"?POS_OTHER:[],typeof POS_VERB!=="undefined"?POS_VERB:[],typeof POS_NOUN!=="undefined"?POS_NOUN:[],typeof POS_WORDS!=="undefined"?POS_WORDS:[])');
const KC = load(['kanji-list.js', 'kanji-cards.js'], '({study:STUDY,full:STUDY_FULL,all:ALL,food:FOOD})');
const dlgFiles = fs.readdirSync(D).filter(f => /^dialogue-\d+\.js$/.test(f) && f !== 'dialogue-0.js')
  .sort((a, b) => parseInt(a.match(/\d+/)) - parseInt(b.match(/\d+/)));
const DIALOGS = load(['dialogue-0.js', 'characters.js'].concat(dlgFiles), 'DIALOGS');

const plain = s => String(s || '')
  .replace(/\{([^{}|\[\]]+)\|([^{}|\[\]]+)\}/g, '$1').replace(/\[([^|\]]+)\|([^\]]+)\]/g, '$1')
  .replace(/[{}]/g, '');
const norm = t => plain(t).replace(/[～〜~]/g, '').replace(/（[^）]*）/g, '').replace(/\([^)]*\)/g, '').replace(/[\s·・]/g, '');

/* 줄 item 태그 집합 */
const lineItems = new Map();   /* "종류 · 키" → 대화 id */
DIALOGS.forEach(d => (d.lines || []).forEach(l => { if (l.item) lineItems.set(String(l.item), d.id); }));
/* d.tags 집합 */
const tagSet = new Map();      /* 종류·키(정규화) → [대화 id] */
DIALOGS.forEach(d => (d.tags || []).forEach(t => { if (t && t[0] && t[1]) { const k = t[0] + '·' + norm(t[1]); if (!tagSet.has(k)) tagSet.set(k, []); tagSet.get(k).push(d.id); } }));

function classify(kind, key) {
  const full = kind + ' · ' + key;
  if (lineItems.has(full)) return 'A';
  const nk = kind + '·' + norm(key);
  if (tagSet.has(nk)) return 'B';
  /* 부분 일치: 줄 item 키가 norm(key) 를 포함하거나, norm(key) 가 줄 item 키를 포함 */
  for (const [ik] of lineItems) {
    if (!ik.startsWith(kind)) continue;
    const ikn = norm(ik.split(' · ')[1] || '');
    const kn = norm(key);
    if (ikn && kn && (ikn.indexOf(kn) >= 0 || kn.indexOf(ikn) >= 0)) return 'C';
  }
  return 'D';
}

const out = [];
const report = (kind, keys, note) => {
  const r = { A: 0, B: 0, C: 0, D: 0 };
  const miss = [];
  keys.forEach(k => { const c = classify(kind, k); r[c]++; if (c === 'D') miss.push(k); });
  out.push('[' + kind + '] ' + keys.length + '개  → 줄item A:' + r.A + ' / 태그만 B:' + r.B + ' / 부분만 C:' + r.C + ' / 없음 D:' + r.D + (note ? '  ' + note : ''));
  if (miss.length) out.push('   D 미커버: ' + miss.join(' / '));
};

report('문형', PATS.map(x => x.pat));
report('문법', GRAMMAR.map(x => x.t));
report('표현', EXPR.map(x => x.expr));
report('구어체', SPOKEN.map(x => x.t));
report('활용표', CONJ.map(x => x.t));
/* 품사: 그룹 카드(t) + 단어 카드(w) */
const posKeys = [];
POS.forEach(x => { if (x.t) posKeys.push(x.t); else if (x.w) posKeys.push(x.w); });
report('품사', posKeys);

/* 학습 카드(한자) — 본문 등장 기준 */
const kanjiAll = [...new Set([].concat((KC.study || []).map(x => x.k), (KC.full || []).map(x => x.k), (KC.all || []).map(x => Array.isArray(x) ? x[0] : x.k), (KC.food || []).map(x => Array.isArray(x) ? x[0] : x.k)))].filter(Boolean);
const outSet = new Set((KC.all || []).filter(x => Array.isArray(x) && ['0', '9', '10'].indexOf(String(x[4])) >= 0).map(x => x[0]));
const allText = DIALOGS.map(d => (d.lines || []).map(l => plain(l.s)).join('\n')).join('\n');
const inK = kanjiAll.filter(k => allText.indexOf(k) >= 0);
const notInK = kanjiAll.filter(k => allText.indexOf(k) < 0);
const notInKOut = notInK.filter(k => !outSet.has(k));
out.push('[학습 카드] ' + kanjiAll.length + '자 → 대사 본문 등장 ' + inK.length + ' / 미등장 ' + notInK.length + ' (그중 표외 ' + (notInK.length - notInKOut.length) + '자, 실 미커버 ' + notInKOut.length + '자)');
if (notInKOut.length) out.push('   미등장: ' + notInKOut.join(' '));
fs.writeFileSync('audit_all_tabs.txt', out.join('\n'), 'utf8');
console.log('audit_all_tabs.txt 작성 (' + out.length + '줄)');
