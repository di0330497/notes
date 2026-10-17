/* 잔여 미커버 소폭 보정 — 배치 9 이후에도 안 나온 활용형을 대사에 한 줄씩 추가 */
const fs = require('fs');
const D = 'j/2b10e90aebe237af55/data/';
const load = (fl, name) => { new Function(fs.readFileSync(D + fl[0], 'utf8') + ';globalThis.__X=' + name + ';')(); return globalThis.__X; };
const GRAMMAR = load(['grammar.js'], 'GRAMMAR');

/* 문법 ex {활용형} 중 대화에 없는 것 1건 찾기 */
const dlgFiles = fs.readdirSync(D).filter(f => /^dialogue-\d+\.js$/.test(f) && f !== 'dialogue-0.js')
  .sort((a, b) => parseInt(a.match(/\d+/)) - parseInt(b.match(/\d+/)));
const DIALOGS = (() => { globalThis.DIALOGS = []; new Function(dlgFiles.map(f => fs.readFileSync(D + f, 'utf8')).join('\n;\n'))(); return globalThis.DIALOGS; })();
const plain = s => String(s || '').replace(/\[([^|\]]+)\|([^\]]+)\]/g, '$1').replace(/\{([^{}|]+)\|([^{}|]+)\}/g, '$1').replace(/[{}]/g, '');
const allDlg = DIALOGS.map(d => (d.lines || []).map(l => plain(l.s)).join('\n')).join('\n');
GRAMMAR.forEach(g => {
  (g.ex || []).forEach(e => {
    const re = /\{([^{}]+)\}/g; let m;
    while ((m = re.exec(e.s || ''))) {
      const t = plain(m[1]).trim();
      if (t && allDlg.indexOf(t) < 0) {
        console.log('문법 ex 미등장: [' + g.t + '] => ' + t);
        console.log('   ex 원문: ' + e.s + '  (' + (e.ko || '') + ')');
      }
    }
  });
});
