/* 대화 한 편 검사 — node tools/check_one.cjs build/d82.js
   검사: JS 파싱 / 스키마 / item 키가 실제 항목인가 / 후리가나·밑줄 짝 / 전각 문장부호 / 기존 id 충돌
   출력 없으면 통과. */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const D = path.join(ROOT, 'j/2b10e90aebe237af55/data') + path.sep;
const load = (files, name) => { new Function(files.map(f => fs.readFileSync(D + f, 'utf8')).join('\n;\n') + ';globalThis.__X=' + name + ';')(); return globalThis.__X; };
const PATS = load(['patterns.js'], 'PATS');
const GRAMMAR = load(['grammar.js'], 'GRAMMAR');
const EXPR = load(['expressions.js'], 'EXPR');
const SPOKEN = load(['colloquial.js', 'colloquial-2.js', 'dialect.js', 'slang.js'], 'SPOKEN');
const CONJ = load(['conjugation.js'], 'CONJ');
const KC = load(['kanji-list.js', 'kanji-cards.js'], '({study:STUDY,full:STUDY_FULL})');
const POS = load(['pos-josa.js', 'pos-fukushi.js', 'pos-other.js', 'pos-verb.js', 'pos-noun.js', 'pos-words.js', 'pos-keiyou-2.js'],
  '[].concat(typeof POS_JOSA!=="undefined"?POS_JOSA:[],typeof POS_ADV!=="undefined"?POS_ADV:[],typeof POS_OTHER!=="undefined"?POS_OTHER:[],typeof POS_VERB!=="undefined"?POS_VERB:[],typeof POS_NOUN!=="undefined"?POS_NOUN:[])');
const JUKU = load(['pos-fukushi.js', 'pos-other.js', 'pos-words.js', 'pos-keiyou-2.js'], '(typeof POS_WORDS!=="undefined"?POS_WORDS:[]).filter(w=>/^jk_/.test(w.c))');

const norm = t => String(t)
  .replace(/\{([^|{}\[\]]+)\|([^}{\[\]]+)\}/g, '$1').replace(/[{}]/g, '')
  .replace(/\[([^|\]]+)\|([^\]]+)\]/g, '$1').replace(/\[([\u3040-\u30FF\u30FC]+)\]/g, '$1')
  .replace(/[～〜~]/g, '').replace(/（[^）]*）/g, '').replace(/\([^)]*\)/g, '').replace(/[\s·・]/g, '');

const POOL = {
  '문형': PATS.map(x => x.pat), '문법': GRAMMAR.map(x => x.t), '표현': EXPR.map(x => x.expr),
  '구어체': SPOKEN.map(x => x.t), '활용표': CONJ.map(x => x.t),
  '품사': [].concat(POS.map(x => x.t), JUKU.map(w => w.w)),
};
const NORMSET = {};
Object.entries(POOL).forEach(([k, arr]) => { NORMSET[k] = new Set(arr.map(norm)); });

/* 기존 id */
const file = process.argv[2];
const selfBase = String(file || '').split(/[\\/]/).pop();
const dlgFiles = fs.readdirSync(D).filter(f => /^dialogue-[\w-]*\.js$/.test(f) && f !== 'dialogue-0.js' && f !== selfBase);
const EXIST = new Set();
try {
  const all = load(['dialogue-0.js'].concat(dlgFiles), 'DIALOGS');
  all.forEach(d => EXIST.add(d.id));
} catch (e) { /* placeholder 파일이 비어 있을 수 있다 */ }

if (!file) { console.log('파일 경로를 주세요'); process.exit(1); }
const errors = [], warns = [];
const E = m => errors.push(m), W = m => warns.push(m);

let arr;
try {
  arr = new Function('DIALOGS', fs.readFileSync(file, 'utf8') + '\n;return DIALOGS;')([]);
} catch (e) { console.log('✗ JS 파싱 실패: ' + e.message); process.exit(1); }
if (!Array.isArray(arr) || !arr.length) { console.log('✗ DIALOGS.push 로 대화를 만들지 않았다'); process.exit(1); }

arr.forEach(d => {
  const id = d.id || '(id없음)';
  ['id', 'title', 'scene', 'place', 'lv', 'chars', 'lines', 'points', 'tags'].forEach(k => { if (d[k] === undefined) E(id + ': 필드 없음 ' + k); });
  if (EXIST.has(d.id)) E(id + ': 기존 대화와 id 충돌');
  if (!Array.isArray(d.chars) || !d.chars.length) E(id + ': chars 비었음');
  if (!Array.isArray(d.lines) || d.lines.length < 20 || d.lines.length > 40) E(id + ': 줄 수 ' + ((d.lines || []).length) + ' (20~40 요구)');
  const used = {};
  (d.lines || []).forEach((l, i) => {
    const n = id + ' ' + (i + 1) + '줄';
    if (!l.who) E(n + ': who 없음');
    if (l.who && (d.chars || []).indexOf(l.who) < 0) E(n + ': who(' + l.who + ') 가 chars 에 없음');
    if (!l.s) E(n + ': s 없음'); if (!l.ko) W(n + ': ko 없음');
    const s = String(l.s || '');
    /* 짝 검사 */
    let b = 0, k = 0, bar = 0;
    for (let c = 0; c < s.length; c++) { const ch = s[c]; if (ch === '{') b++; else if (ch === '}') b--; else if (ch === '[') k++; else if (ch === ']') k--; else if (ch === '|' && k > 0) bar++; if (b < 0 || k < 0) break; }
    if (b !== 0) E(n + ': {} 짝 안 맞음');
    if (k !== 0) E(n + ': [] 짝 안 맞음');
    /* 반각 문장부호 */
    if (/[,."']/.test(s.replace(/[a-zA-Z0-9]/g, ''))) E(n + ': 반각 문장부호 있음 → ' + s);
    /* 후리가나 짝 및 비정상 루비 검사 */
    const bad = s.match(/\[[^\]|]*\|[^\]]*\]/g) || [];
    bad.forEach(t => {
      const m = /^\[([^|]*)\|([^\]]*)\]$/.exec(t);
      if (!m || !m[1] || !m[2]) { E(n + ': 빈 후리가나 → ' + t); return; }
      if (!/^[\u3040-\u30FF\u30FC]+$/.test(m[2])) E(n + ': 후리가나 읽기가 가나가 아님 → ' + t);
      if (!/[\u4E00-\u9FFF\u3400-\u4DBF々〆ヶ]/.test(m[1])) E(n + ': 한자 없는 단어에 루비 금지 → ' + t);
      if (/[0-9０-９]/.test(m[1])) E(n + ': 아라비아 숫자 루비 금지(한자 수사로 쓸 것) → ' + t);
    });
    if (/\{[^|{}\[\]]+\|[^|{}\[\]]+\}/.test(s)) E(n + ': {漢字|よみ} 대신 {[漢字|よみ]} 형식으로 쓸 것 → ' + s);
    if (/ジホ|ジフ|ジウ|パク|지호|지후|지우|かわゆす|パネェ|猫の舌|あるじさん/.test(s)) E(n + ': 금지/오류 표현(한국인 배역명·사어·오류어) 포함 → ' + s);
    if (/\[[^\]]*\]/.test(s.replace(/\[[^\]|]+:[^\]]+\]/g, ''))) { /* 아래에서 처리 */ }
    /* 한자 후리가나 누락: 루비 블록을 지운 뒤 남은 한자 */
    const stripped = s
      .replace(/\[([^|\[\]]+)\|([^\[\]]+)\]/g, '')
      .replace(/\{([^|{}\[\]]+)\|([^}{\[\]]+)\}/g, '')
      .replace(/\[[\u3040-\u30FF\u30FC]+\]/g, '');
    const miss = [...stripped].filter(ch => /[\u4E00-\u9FFF\u3400-\u4DBF]/.test(ch));
    if (miss.length) E(n + ': 후리가나 없는 한자 ' + [...new Set(miss)].join('') + ' → ' + s);
    /* item */
    if (l.item) {
      const m = String(l.item).match(/^([^ ·]+)\s*·\s*(.+)$/);
      if (!m) E(n + ': item 형식 아님 → ' + l.item);
      else {
        const [_, kind, key] = m;
        if (!POOL[kind]) E(n + ': 알 수 없는 종류 → ' + kind);
        else if (!NORMSET[kind].has(norm(key))) E(n + ': 사전에 없는 키 → ' + key);
        if (used[kind + '\u0000' + key]) W(n + ': 이 대화에서 같은 항목 중복 → ' + key);
        used[kind + '\u0000' + key] = 1;
        /* item 키에 한자가 있으면 그 한자가 그 줄에 실제로 나와야 한다.
           품사(숙자훈·아테지 단어)와 표현(정형 문구)에만 적용한다 —
           문법·문형·구어체 키는 「引用」「逆接」처럼 갈래 이름이라 그 한자가 대사에 나올 필요가 없다. */
        if (kind === '품사' || kind === '표현') {
          const bare = key
            .replace(/\[([^|\]]+)\|([^\]]+)\]/g, '$1').replace(/[{}]/g, '')
            .replace(/[～〜~]/g, '').replace(/（[^）]*）/g, '').replace(/\([^)]*\)/g, '')
            .replace(/[가-힣]/g, '');
          const lack = [...new Set([...bare].filter(ch => /[\u4E00-\u9FFF]/.test(ch)))].filter(ch => s.indexOf(ch) < 0);
          if (lack.length) E(n + ': item 키의 한자가 줄에 없음 → ' + lack.join('') + '  (' + key + ')');
        }
      }
    }
  });
  (d.tags || []).forEach(t => {
    const [kind, key] = t;
    if (!POOL[kind]) { W(id + ': tags 종류 이상 → ' + kind); return; }
    if (!NORMSET[kind].has(norm(key))) W(id + ': tags 키가 사전에 없음 → ' + key);
  });
});

const out = [];
out.push(errors.length ? 'ERRORS ' + errors.length : '');
errors.forEach(e => out.push('  ✗ ' + e));
if (warns.length) { out.push('WARNS ' + warns.length); warns.slice(0, 20).forEach(w => out.push('  · ' + w)); }
if (!errors.length) out.push('✅ ' + arr.length + '편 통과');
fs.writeFileSync(path.join(ROOT, 'check_one_out.txt'), out.join('\n'), 'utf8');
console.log(out.join('\n'));
