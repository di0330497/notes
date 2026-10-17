/* 품사 낱말(POS_WORDS) 전부 중 대화 item 태그 「품사 · w」 가 없는 것을 뽑는다 */
const fs = require('fs'), path = require('path');
const D = 'j/2b10e90aebe237af55/data/';
const load = (files, name) => { new Function(files.map(f => fs.readFileSync(path.join(D, f), 'utf8')).join('\n;\n') + ';globalThis.__X=' + name + ';')(); return globalThis.__X; };
const WORDS = load(['pos-words.js', 'pos-keiyou-2.js'], 'POS_WORDS');
const dlgFiles = fs.readdirSync(D).filter(f => /^dialogue-\d+\.js$/.test(f) && f !== 'dialogue-0.js')
  .sort((a, b) => parseInt(a.match(/\d+/)) - parseInt(b.match(/\d+/)));
globalThis.DIALOGS = [];
new Function(dlgFiles.map(f => fs.readFileSync(D + f, 'utf8')).join('\n;\n'))();
const DIALOGS = globalThis.DIALOGS;

const plain = s => String(s || '').replace(/\[([^|\]]+)\|([^\]]+)\]/g, '$1').replace(/\{([^{}|]+)\|([^{}|]+)\}/g, '$1').replace(/[{}]/g, '');
const allText = DIALOGS.map(d => (d.lines || []).map(l => plain(l.s)).join('\n')).join('\n');
const itemSet = new Set();
DIALOGS.forEach(d => (d.lines || []).forEach(l => { if (l.item) itemSet.add(String(l.item)); }));

const noTag = [], noTagNoText = [];
WORDS.forEach(x => {
  const w = x.w, pw = plain(w);
  if (itemSet.has('품사 · ' + w) || itemSet.has('품사 · ' + pw)) return;
  noTag.push(x);
  if (allText.indexOf(pw) < 0) noTagNoText.push(x);
});
console.log('POS_WORDS 총', WORDS.length);
console.log('item 태그 없음:', noTag.length, '(그중 대사 본문에도 없음:', noTagNoText.length + ')');
const cats = {};
noTag.forEach(x => { cats[x.c] = (cats[x.c] || 0) + 1; });
console.log('카테고리:', Object.keys(cats).sort((a, b) => cats[b] - cats[a]).map(k => k + ':' + cats[k]).join(' '));
fs.writeFileSync('pos_untagged.json', JSON.stringify(noTag.map(x => ({ w: x.w, r: x.r || '', m: x.m || '', c: x.c || '', lv: x.lv || '5', ex: x.ex && x.ex[0] ? { s: plain(x.ex[0].s), ko: x.ex[0].ko || '' } : null })), null, 1), 'utf8');
console.log('→ pos_untagged.json');
