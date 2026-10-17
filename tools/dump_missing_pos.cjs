/* 품사 1,003 중 대화에 전혀 없는 714개를 d152~d160 9편에 분배하는 배치 10 스펙 생성 */
const fs = require('fs'), path = require('path');
const D = 'j/2b10e90aebe237af55/data/';
const load = (files, name) => { new Function(files.map(f => fs.readFileSync(path.join(D, f), 'utf8')).join('\n;\n') + ';globalThis.__X=' + name + ';')(); return globalThis.__X; };

const POS = load(['pos-josa.js', 'pos-fukushi.js', 'pos-other.js', 'pos-verb.js', 'pos-noun.js', 'pos-words.js', 'pos-keiyou-2.js'],
  '[].concat(typeof POS_JOSA!=="undefined"?POS_JOSA:[],typeof POS_ADV!=="undefined"?POS_ADV:[],typeof POS_OTHER!=="undefined"?POS_OTHER:[],typeof POS_VERB!=="undefined"?POS_VERB:[],typeof POS_NOUN!=="undefined"?POS_NOUN:[],typeof POS_WORDS!=="undefined"?POS_WORDS:[])');
const dlgFiles = fs.readdirSync(D).filter(f => /^dialogue-\d+\.js$/.test(f) && f !== 'dialogue-0.js')
  .sort((a, b) => parseInt(a.match(/\d+/)) - parseInt(b.match(/\d+/)));
globalThis.DIALOGS = [];
new Function(dlgFiles.map(f => fs.readFileSync(D + f, 'utf8')).join('\n;\n'))();
const DIALOGS = globalThis.DIALOGS;

const plain = s => String(s || '').replace(/\[([^|\]]+)\|([^\]]+)\]/g, '$1').replace(/\{([^{}|]+)\|([^{}|]+)\}/g, '$1').replace(/[{}]/g, '');
const allText = DIALOGS.map(d => (d.lines || []).map(l => plain(l.s)).join('\n')).join('\n');
const lineItemKeys = new Set();
DIALOGS.forEach(d => (d.lines || []).forEach(l => { if (l.item) lineItemKeys.add(String(l.item)); }));

/* 미커버 품사 낱말 — 본문 등장도 안 하고 item 도 없는 것 */
const miss = [];
POS.forEach(x => {
  if (x.t) return;                      /* 묶음 표는 제외 */
  const w = x.w; if (!w) return;
  const pw = plain(w);
  if (allText.indexOf(pw) >= 0) return;
  if (lineItemKeys.has('품사 · ' + w) || lineItemKeys.has('품사 · ' + pw)) return;
  miss.push({ w, r: x.r || '', m: x.m || '', c: x.c || '', lv: x.lv || '5', ex: (x.ex && x.ex[0] ? { s: plain(x.ex[0].s), ko: x.ex[0].ko || '' } : null) });
});

/* 카테고리별 묶기 */
const byCat = {};
miss.forEach(x => { (byCat[x.c] = byCat[x.c] || []).push(x); });
console.log('미커버 품사 낱말 총', miss.length, '개 /', Object.keys(byCat).length, '카테고리');
Object.keys(byCat).sort((a, b) => byCat[b].length - byCat[a].length).forEach(k => console.log('  ' + k + ': ' + byCat[k].length));
fs.writeFileSync('missing_pos_words.json', JSON.stringify(miss, null, 1), 'utf8');
