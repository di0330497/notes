/* 미커버 항목 덤프 — 진짜 대화(서사 d*)만 기준으로, 아직 어떤 대화도 보여 주지 않은 항목을
   뜻·예문과 함께 뽑는다. 작가 배치용.
   출력: missing_items.json  +  missing_<종류>.txt (한 줄에 하나, 탭 구분)
   사용: node tools/missing_dump.cjs
*/
const fs = require('fs'), path = require('path');
const D = 'j/2b10e90aebe237af55/data';

const load = (files, name) => { new Function(files.map(f => fs.readFileSync(path.join(D, f), 'utf8')).join('\n;\n') + ';globalThis.__X=' + name + ';')(); return globalThis.__X; };
const PATS = load(['patterns.js'], 'PATS');
const GRAMMAR = load(['grammar.js'], 'GRAMMAR');
const EXPR = load(['expressions.js'], 'EXPR');
const SPOKEN = load(['colloquial.js', 'colloquial-2.js', 'dialect.js', 'slang.js'], 'SPOKEN');
const CONJ = load(['conjugation.js'], 'CONJ');
const KC = load(['kanji-list.js', 'kanji-cards.js'], '({study:STUDY,full:STUDY_FULL,all:ALL,food:FOOD})');
const POS = load(['pos-josa.js', 'pos-fukushi.js', 'pos-other.js', 'pos-verb.js', 'pos-noun.js', 'pos-words.js', 'pos-keiyou-2.js'],
  '[].concat(typeof POS_JOSA!=="undefined"?POS_JOSA:[],typeof POS_ADV!=="undefined"?POS_ADV:[],typeof POS_OTHER!=="undefined"?POS_OTHER:[],typeof POS_VERB!=="undefined"?POS_VERB:[],typeof POS_NOUN!=="undefined"?POS_NOUN:[])');
const JUKU = load(['pos-fukushi.js', 'pos-other.js', 'pos-words.js', 'pos-keiyou-2.js'], '(typeof POS_WORDS!=="undefined"?POS_WORDS:[]).filter(w=>/^jk_/.test(w.c))');

const dlgFiles = fs.readdirSync(D).filter(f => /^dialogue-[\w-]*\.js$/.test(f) && f !== 'dialogue-0.js')
  .sort((a, b) => parseInt(a.match(/\d+/)) - parseInt(b.match(/\d+/)));
const DIALOGS = load(['dialogue-0.js', 'characters.js'].concat(dlgFiles), 'DIALOGS');

const plain = s => String(s == null ? '' : s)
  .replace(/\{([^|}{]+)\|([^}{]+)\}/g, '$1').replace(/[{}]/g, '')
  .replace(/\[([^|\]]+)\|([^\]]+)\]/g, '$1');
const norm = t => String(t)
  .replace(/\{([^|{}\[\]]+)\|([^}{\[\]]+)\}/g, '$1').replace(/[{}]/g, '')
  .replace(/\[([^|\]]+)\|([^\]]+)\]/g, '$1').replace(/\[([\u3040-\u30FF\u30FC]+)\]/g, '$1')
  .replace(/[～〜~]/g, '').replace(/（[^）]*）/g, '').replace(/\([^)]*\)/g, '').replace(/[\s·・]/g, '');

/* ── 항목 목록 ── */
const items = [];
const add = (kind, key, hint, lv) => items.push({ kind, key, hint: hint || '', lv: lv || '', n: norm(key) });
const ex1 = ex => { const e = (ex || [])[0]; return e ? plain(e.s) + '  ||  ' + (e.ko || '') : ''; };
PATS.forEach(x => add('문형', x.pat, (x.mean || '') + '  |  ' + ex1(x.ex), x.lv));
GRAMMAR.forEach(x => add('문법', x.t, (x.cn || '') + '  |  ' + ex1(x.ex), x.lv));
EXPR.forEach(x => add('표현', x.expr, (x.mean || '') + '  |  ' + (x.cat || '') + '  |  ' + ex1(x.ex), ''));
SPOKEN.forEach(x => add('구어체', x.t, (x.sn || '') + '  |  ' + (x.rule || '') + '  |  ' + ex1(x.ex), ''));
CONJ.forEach(x => add('활용표', x.t, (x.desc || '') + '  |  ' + (x.gn || ''), x.lv));
POS.forEach(x => add('품사', x.t, (x.g || '') + '  |  ' + ex1(x.ex), x.lv));
JUKU.forEach(w => add('품사', w.w, '숙자훈·아테지  |  ' + (w.m || '') + '  |  ' + ex1(w.ex), w.lv));

/* ── 커버 집합 (서사 d*만) ── */
const story = DIALOGS.filter(d => !/^p\d+$/.test(d.id));
const covered = new Set();
function resolve(kind, valRaw) {
  const n = norm(valRaw); if (!n) return;
  const pool = items.filter(it => it.kind === kind);
  const ex = pool.filter(it => it.n === n);
  if (ex.length) { ex.forEach(it => covered.add(it.kind + '\u0000' + it.key)); return; }
  pool.filter(it => it.n.indexOf(n) >= 0 || n.indexOf(it.n) >= 0).forEach(it => covered.add(it.kind + '\u0000' + it.key));
}
story.forEach(d => {
  (d.tags || []).forEach(([k, v]) => resolve(k, v));
  (d.lines || []).forEach(l => {
    if (!l.item) return;
    const m = String(l.item).match(/^([^ ·]+)\s*·\s*(.+)$/);
    if (m) resolve(m[1], m[2]);
  });
});

const KINDS = ['문형', '문법', '표현', '구어체', '활용표', '품사'];
const missing = {};
const out = [];
KINDS.forEach(k => {
  missing[k] = items.filter(it => it.kind === k && !covered.has(k + '\u0000' + it.key));
  const lines = missing[k].map(it => it.key + '\t' + (it.lv ? 'lv' + it.lv + '  ' : '') + it.hint);
  fs.writeFileSync('missing_' + k + '.txt', lines.join('\n'), 'utf8');
  out.push('  ' + k + ': 부족 ' + missing[k].length);
});

const jk = [...new Set([].concat(
  (KC.study || []).map(x => x.k), (KC.full || []).map(x => x.k),
  (KC.all || []).map(x => Array.isArray(x) ? x[0] : x.k),
  (KC.food || []).map(x => Array.isArray(x) ? x[0] : x.k)).filter(Boolean))]
  .filter(k => !(new Set((KC.all || []).filter(x => Array.isArray(x) && ['0', '9', '10'].indexOf(String(x[4])) >= 0).map(x => x[0]))).has(k));
const seen = new Set();
story.forEach(d => (d.lines || []).forEach(l => [...String(l.s || '')].forEach(ch => seen.add(ch))));
const kMiss = jk.filter(k => !seen.has(k));
fs.writeFileSync('missing_한자.txt', kMiss.join(''), 'utf8');
out.push('  한자(표외 제외): 부족 ' + kMiss.length);

fs.writeFileSync('missing_items.json', JSON.stringify({ missing, kanjiMissing: kMiss, coveredCount: covered.size, storyCount: story.length }, null, 0), 'utf8');
console.log('서사 대화 ' + story.length + '편 기준 커버 ' + covered.size + '항목');
console.log(out.join('\n'));
console.log('→ missing_items.json / missing_<종류>.txt / missing_한자.txt');
