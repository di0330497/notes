/* 커버리지 v3 — "대화 줄이 실제로 보여 주는 항목"으로 센다.
   대상: 줄의 item 태그(l.item, 「문형 · ～ておく」) + 대화 태그(d.tags, ["문형","～ておく"]).
   매칭: 정규화 후 ①정확 일치가 있으면 그것만, ②없으면 부분 일치(포함) 전부.
   출력: coverage_tags.txt / coverage_tags.json (부족 목록 포함)
   사용: node tools/coverage_tags.cjs [옵션]  --only=d81  --storyonly
*/
const fs = require('fs'), path = require('path');
const D = 'j/2b10e90aebe237af55/data';
const args = process.argv.slice(2);
let ONLY = null, STORY_ONLY = false;
args.forEach(a => { let m;
  if ((m = /^--only=(.+)$/.exec(a))) ONLY = m[1];
  if (a === '--storyonly') STORY_ONLY = true; });
let NOPRAC = STORY_ONLY;

const load = (files, name) => { new Function(files.map(f => fs.readFileSync(path.join(D, f), 'utf8')).join('\n;\n') + ';globalThis.__X=' + name + ';')(); return globalThis.__X; };
const PATS = load(['patterns.js'], 'PATS');
const GRAMMAR = load(['grammar.js'], 'GRAMMAR');
const EXPR = load(['expressions.js'], 'EXPR');
const SPOKEN = load(['colloquial.js', 'colloquial-2.js', 'dialect.js', 'slang.js', 'slang-2026.js'], 'SPOKEN');
const CONJ = load(['conjugation.js'], 'CONJ');
const KC = load(['kanji-list.js', 'kanji-cards.js'], '({study:STUDY,full:STUDY_FULL,all:ALL,food:FOOD})');
const POS = load(['pos-josa.js', 'pos-fukushi.js', 'pos-other.js', 'pos-verb.js', 'pos-noun.js', 'pos-words.js', 'pos-keiyou-2.js'],
  '[].concat(typeof POS_JOSA!=="undefined"?POS_JOSA:[],typeof POS_ADV!=="undefined"?POS_ADV:[],typeof POS_OTHER!=="undefined"?POS_OTHER:[],typeof POS_VERB!=="undefined"?POS_VERB:[],typeof POS_NOUN!=="undefined"?POS_NOUN:[])');
const ALLWORDS = load(['pos-fukushi.js', 'pos-other.js', 'pos-words.js', 'pos-keiyou-2.js'], '(typeof POS_WORDS!=="undefined"?POS_WORDS:[])');

const dlgFiles = fs.readdirSync(D).filter(f => /^dialogue-[\w-]*\.js$/.test(f) && f !== 'dialogue-0.js')
  .sort((a, b) => parseInt(a.match(/\d+/)) - parseInt(b.match(/\d+/)));
const DIALOGS_ALL = load(['dialogue-0.js', 'characters.js'].concat(dlgFiles), 'DIALOGS');
const DIALOGS = NOPRAC ? DIALOGS_ALL.filter(d => !/^p\d+$/.test(d.id)) : DIALOGS_ALL;

const norm = t => String(t)
  .replace(/\{([^|{}\[\]]+)\|([^}{\[\]]+)\}/g, '$1').replace(/[{}]/g, '')
  .replace(/\[([^|\]]+)\|([^\]]+)\]/g, '$1').replace(/\[([\u3040-\u30FF\u30FC]+)\]/g, '$1')
  .replace(/[～〜~]/g, '').replace(/（[^）]*）/g, '').replace(/\([^)]*\)/g, '').replace(/[\s·・]/g, '');

/* ── 항목 목록 ── */
const items = [];  /* {kind, key, n} */
const addItems = (kind, arr) => arr.forEach(key => items.push({ kind, key, n: norm(key) }));
addItems('문형', PATS.map(x => x.pat));
addItems('문법', GRAMMAR.map(x => x.t));
addItems('표현', EXPR.map(x => x.expr));
addItems('구어체', SPOKEN.map(x => x.t));
addItems('활용표', CONJ.map(x => x.t));
addItems('품사', [].concat(POS.map(x => x.t), ALLWORDS.map(w => w.w)));
const KANJI = [...new Set([].concat(
  (KC.study || []).map(x => x.k), (KC.full || []).map(x => x.k),
  (KC.all || []).map(x => Array.isArray(x) ? x[0] : x.k),
  (KC.food || []).map(x => Array.isArray(x) ? x[0] : x.k)).filter(Boolean))];
const KANJI_OUT = new Set((KC.all || []).filter(x => Array.isArray(x) && ['0', '9', '10'].indexOf(String(x[4])) >= 0).map(x => x[0]));

const KIND_ALIAS = { '활용표': '활용표', conj: '활용표', '한자': '한자', '문형': '문형', '문법': '문법', '표현': '표현', '구어체': '구어체', '품사': '품사' };

/* ── 태그 수집 ── */
const covered = new Map();        /* "kind\u0000key" → {dlg} */
const ambiguous = [];             /* 부분 일치로 여러 개 걸린 태그 */
const unknown = [];               /* 해석 실패 */
function resolve(kindRaw, valRaw, dlgId, where) {
  if (!valRaw) return;
  const kind = KIND_ALIAS[kindRaw];
  if (!kind) { unknown.push([dlgId, where, kindRaw, valRaw, '알 수 없는 종류']); return; }
  if (kind === '한자') {
    const chars = [...String(valRaw).replace(/[{}|\[\]]/g, '')];
    let ok = false;
    chars.forEach(ch => { if (KANJI.indexOf(ch) >= 0) { ok = true; covered.set('한자\u0000' + ch, { dlg: dlgId }); } });
    if (!ok) unknown.push([dlgId, where, kindRaw, valRaw, '한자 카드 없음']);
    return;
  }
  const n = norm(valRaw); if (!n) return;
  const pool = items.filter(it => it.kind === kind);
  const exacts = pool.filter(it => it.n === n);
  if (exacts.length) { exacts.forEach(it => covered.set(it.kind + '\u0000' + it.key, { dlg: dlgId })); return; }
  const loose = pool.filter(it => it.n.indexOf(n) >= 0 || n.indexOf(it.n) >= 0);
  if (loose.length) {
    loose.forEach(it => covered.set(it.kind + '\u0000' + it.key, { dlg: dlgId }));
    ambiguous.push([dlgId, where, kind, valRaw, loose.map(x => x.key).join(' | ')]);
    return;
  }
  unknown.push([dlgId, where, kindRaw, valRaw, '대응 항목 없음']);
}

DIALOGS.forEach(d => {
  if (ONLY && d.id !== ONLY) return;
  (d.tags || []).forEach(([k, v]) => resolve(k, v, d.id, 'tags'));
  (d.lines || []).forEach(l => {
    if (!l.item) return;
    const m = String(l.item).match(/^([^ ·]+)\s*·\s*(.+)$/);
    if (m) resolve(m[1], m[2], d.id, 'line');
    else resolve(String(l.item).split(' · ')[0], l.item, d.id, 'line');
  });
});

/* ── 한자: 태그가 아니라 실제 대사 본문에 그 글자가 나오는지로 센다 ── */
const seenChars = new Set();
DIALOGS.forEach(d => {
  if (ONLY && d.id !== ONLY) return;
  (d.lines || []).forEach(l => [...String(l.s || '')].forEach(ch => seenChars.add(ch)));
});

/* ── 집계 ── */
const out = [];
const kinds = ['문형', '문법', '표현', '구어체', '활용표', '품사'];
const summary = {};
out.push('=== 커버리지 v3 (대화 태그 기준) ===');
out.push('대화 ' + DIALOGS.length + '편 / 태그 해석 ' + covered.size + '항목');
kinds.forEach(k => {
  const list = items.filter(it => it.kind === k);
  const ok = list.filter(it => covered.has(k + '\u0000' + it.key)).length;
  summary[k] = { ok, tot: list.length };
  out.push('  ' + k + ': ' + ok + '/' + list.length + ' = ' + (ok / list.length * 100).toFixed(1) + '%  (부족 ' + (list.length - ok) + ')');
});
const jk = KANJI.filter(k => !KANJI_OUT.has(k));
const jkOk = jk.filter(k => seenChars.has(k)).length;
summary['한자'] = { ok: jkOk, tot: jk.length };
out.push('  한자(표외 제외): ' + jkOk + '/' + jk.length + ' = ' + (jkOk / jk.length * 100).toFixed(1) + '%  (부족 ' + (jk.length - jkOk) + ')');
out.push('');
out.push('── 해석 실패 ' + unknown.length + '건');
unknown.slice(0, 40).forEach(u => out.push('  ' + u.join('  ')));
out.push('');
out.push('── 부분 일치(정확 키 아님) ' + ambiguous.length + '건');
ambiguous.slice(0, 60).forEach(a => out.push('  ' + a[0] + ' [' + a[2] + '] ' + a[3] + '  →  ' + a[4]));

/* 부족 목록 */
const missing = {};
kinds.forEach(k => {
  missing[k] = items.filter(it => it.kind === k && !covered.has(k + '\u0000' + it.key)).map(it => it.key);
});
missing['한자'] = jk.filter(k => !seenChars.has(k));
fs.writeFileSync('coverage_tags.txt', out.join('\n'), 'utf8');
fs.writeFileSync('coverage_tags.json', JSON.stringify({ summary, missing, unknown, ambiguous }, null, 0), 'utf8');
console.log(out.slice(0, 12).join('\n'));
console.log('해석 실패 ' + unknown.length + ' / 부분 일치 ' + ambiguous.length + ' → coverage_tags.txt');
