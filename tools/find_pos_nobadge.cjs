/* 품사 낱말 중 item 태그가 대사 줄에 없는 것 1건 찾기 */
const fs = require('fs'), path = require('path');
const D = 'j/2b10e90aebe237af55/data/';
const WORDS = (() => { new Function(fs.readFileSync(D + 'pos-words.js', 'utf8') + ';globalThis.__W=POS_WORDS;')(); return globalThis.__W; })();
const dlgs = fs.readdirSync(D).filter(f => /^dialogue-\d+\.js$/.test(f) && f !== 'dialogue-0.js');
globalThis.DIALOGS = [];
new Function(dlgs.map(f => fs.readFileSync(D + f, 'utf8')).join('\n;\n'))();
const norm = s => String(s || '').replace(/[～〜~]/g, '').replace(/（[^）]*）/g, '').replace(/\([^)]*\)/g, '').replace(/[\s·・、。]/g, '');
const itemKeys = new Set();
globalThis.DIALOGS.forEach(d => (d.lines || []).forEach(l => {
  if (!l.item) return;
  const m = String(l.item).match(/^([^ ·]+)\s*·\s*(.+)$/);
  if (m) itemKeys.add(m[1] + '\u0000' + norm(m[2]));
}));
const miss = WORDS.filter(x => !itemKeys.has('품사\u0000' + norm(x.w)));
console.log('대사 item 태그 없는 품사 낱말:', miss.length);
miss.forEach(x => console.log('  [' + x.w + '] c=' + x.c + ' m=' + (x.m || '')));
