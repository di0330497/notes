/* 문법·문형·활용표의 세부 활용형(슬래시/가운뎃점 병기 형태 및 활용표 각 행)이
   실제 대화(d01~d143) 본문에 전부 등장하는지 정밀 점검 */
const fs = require('fs');
const D = 'j/2b10e90aebe237af55/data/';
const load = (fl, name) => { new Function(fl.map(x => fs.readFileSync(D + x, 'utf8')).join('\n;\n') + ';globalThis.__X=' + name + ';')(); return globalThis.__X; };

const PATS = load(['patterns.js'], 'PATS');
const GRAMMAR = load(['grammar.js'], 'GRAMMAR');
const CONJ = load(['conjugation.js'], 'CONJ');
const dlgFiles = fs.readdirSync(D).filter(f => /^dialogue-\d+\.js$/.test(f) && f !== 'dialogue-0.js')
  .sort((a, b) => parseInt(a.match(/\d+/)) - parseInt(b.match(/\d+/)));
const DIALOGS = load(['dialogue-0.js', 'characters.js'].concat(dlgFiles), 'DIALOGS');

const plain = s => String(s || '').replace(/\[([^|\]]+)\|([^\]]+)\]/g, '$1').replace(/[{}]/g, '');
const allDlgText = DIALOGS.map(d => (d.lines || []).map(l => plain(l.s)).join('\n')).join('\n');

/* 1. 문형(PATS)과 문법(GRAMMAR)의 각 카드에 딸린 예문(ex)의 핵심 활용({…} 밑줄 부분)이 대화에 등장하는지 확인 */
function checkTargetForms(list, kind, keyField) {
  let totalForms = 0, hitForms = 0;
  const missingForms = [];
  list.forEach(item => {
    const key = item[keyField];
    /* 각 카드의 ex 안에 들어 있는 {…} 타겟 활용 표현들 추출 */
    const targets = [];
    (item.ex || []).forEach(e => {
      const re = /\{([^{}]+)\}/g;
      let m;
      while ((m = re.exec(e.s || ''))) {
        const t = plain(m[1]).trim();
        if (t && !targets.includes(t)) targets.push(t);
      }
    });
    targets.forEach(t => {
      totalForms++;
      if (allDlgText.includes(t)) hitForms++;
      else missingForms.push({ kind, key, target: t });
    });
  });
  return { totalForms, hitForms, missingForms };
}

const patRes = checkTargetForms(PATS, '문형', 'pat');
const gramRes = checkTargetForms(GRAMMAR, '문법', 't');

console.log('문형 ex 내 {활용예시} 총 ' + patRes.totalForms + '개 중 대화 등장: ' + patRes.hitForms + ' (' + (patRes.hitForms / patRes.totalForms * 100).toFixed(1) + '%), 미등장: ' + patRes.missingForms.length);
console.log('문법 ex 내 {활용예시} 총 ' + gramRes.totalForms + '개 중 대화 등장: ' + gramRes.hitForms + ' (' + (gramRes.hitForms / gramRes.totalForms * 100).toFixed(1) + '%), 미등장: ' + gramRes.missingForms.length);

/* 2. 슬래시(／) 병기 문형·문법에서 한쪽만 쓰인 카드 확인
   단, ～가 낱말 중간에 오는 템플릿(お～する 등)과 （よ） 선택 표기는
   문자 그대로의 변이형이 아니므로 검사에서 제외한다. */
function checkSlashVariants(list, kind, keyField) {
  /* 각 카드가 태그된 대사 줄 모으기 */
  const missingVariants = [];
  list.forEach(item => {
    const key = item[keyField];
    if (!/[／/]/.test(key)) return;
    /* 템플릿(～가 낱말 중간) · （よ） 선택 표기 · お～する류는 문자 그대로의 변이형이 아니다 */
    const rawParts = key.split(/[／/]/);
    const parts = [];
    rawParts.forEach(raw => {
      const r = raw.trim();
      if (/（/.test(r)) return;                       /* （よ）うと～まいと 같은 선택 표기 제외 */
      const t = r.replace(/[～〜~]/g, '');
      /* ～가 앞/뒤가 아니라 중간에 오면(예: お～する) 템플릿 → 제외 */
      const tildeAt = r.search(/[～〜~]/);
      const isInnerTemplate = tildeAt > 0 && /[^\s·・]/.test(r.slice(0, tildeAt));
      if (isInnerTemplate) return;
      if (t.trim()) parts.push(t.trim());
    });
    if (parts.length < 2) return;
    parts.forEach(p => {
      /* p에서 핵심 가나/한자 추출 */
      const core = plain(p).replace(/[\s·・]/g, '');
      if (core && /^[ぁ-んァ-ン一-龯]+$/.test(core) && !allDlgText.includes(core)) {
        missingVariants.push(kind + ' [' + key + '] 중 미등장 변이형: ' + core);
      }
    });
  });
  return missingVariants;
}

const slashPat = checkSlashVariants(PATS, '문형', 'pat');
const slashGram = checkSlashVariants(GRAMMAR, '문법', 't');
console.log('문형 슬래시 병기 중 미등장 변이형: ' + slashPat.length + '건');
slashPat.slice(0, 30).forEach(s => console.log('  ' + s));
console.log('문법 슬래시 병기 중 미등장 변이형: ' + slashGram.length + '건');
slashGram.slice(0, 30).forEach(s => console.log('  ' + s));
