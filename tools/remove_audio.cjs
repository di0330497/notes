/* 음성(Web Speech) 기능 전면 제거 — app.js / styles.css / index.html */
const fs = require('fs');
const D = 'j/2b10e90aebe237af55/';

/* ---------- app.js ---------- */
let a = fs.readFileSync(D + 'js/app.js', 'utf8');
const before = a.length;

/* 1) exBlock 의 발음 버튼 제거 */
a = a.replace(/[ \t]*const spkBtn='<button type="button" class="exSpeakBtn"[\s\S]*?<\/button>';\r?\n/, '');
a = a.replace(/\+dlgBtn\+spkBtn\+'<\/div>'/, "+dlgBtn+'</div>'");

/* 2) 한 줄의 ▶ 버튼 제거 */
a = a.replace(/\r?\n[ \t]*\+'<button class="speak" title="이 줄 읽어주기">▶<\/button><\/div>';/, "\n    +'</div>';");
a = a.replace(/\/\* 한 줄 — 화자 · 일본어 · ▶ \*\//, '/* 한 줄 — 화자 · 일본어 · 한국어 */');

/* 3) 전체 듣기 버튼 제거 */
a = a.replace(/[ \t]*\+'<button type="button" class="dlgPlayAll"[\s\S]*?<\/button>'\r?\n/, '');

/* 4) speak() 함수와 따라읽기 바인딩 제거 */
a = a.replace(/\/\* ── 따라읽기[\s\S]*?function speak\(text\)\{[\s\S]*?\r?\n\}\r?\n/, '');
a = a.replace(/function bindTalk\(\)\{\r?\n[ \t]*\$\$\(#view-talk \.speak"\)[\s\S]*?^\s*\/\* 태그 → 해당 모드로/m,
  'function bindTalk(){\n  /* 태그 → 해당 모드로');

/* 5) 연속 듣기 함수 제거 */
a = a.replace(/\/\* ── 대화 전체 연속 듣기\(쉐도잉\) & 카드↔대화 양방향 점프 ── \*\/\r?\nlet dlgSeqTimer=null;[\s\S]*?function gotoDlgLine\(/,
  '/* ── 카드↔대화 양방향 점프 ── */\nfunction gotoDlgLine(');

/* 6) gotoDlgLine 안의 자동 읽기 제거 */
a = a.replace(/\r?\n[ \t]*const jp=ln\.querySelector\?ln\.querySelector\("\.jp"\):null;\r?\n[ \t]*if\(jp&&jp\.getAttribute\("data-say"\)\)speak\(jp\.getAttribute\("data-say"\)\);/,
  '\n    const jp=ln.querySelector?ln.querySelector(".jp"):null;\n    if(jp)jp.classList.add("on");');

/* 7) 클릭 핸들러에서 발음/연속듣기 분기 제거 */
a = a.replace(/[ \t]*const sb=e\.target\.closest\("\.exSpeakBtn"\);[\s\S]*?return;\r?\n[ \t]*\}\r?\n[ \t]*const pa=e\.target\.closest\("\.dlgPlayAll"\);[\s\S]*?return;\r?\n[ \t]*\}\r?\n/, '');
a = a.replace(/[ \t]*stopDialogPlay\(\);\r?\n/, '');

fs.writeFileSync(D + 'js/app.js', a, 'utf8');
console.log('app.js: ' + before + ' → ' + a.length);
['speak(', 'speechSynthesis', 'exSpeakBtn', 'dlgPlayAll', 'dlgSeqTimer', 'stopDialogPlay', 'playDialogAll'].forEach(k => {
  const n = (a.match(new RegExp(k.replace(/[()]/g, '\\$&'), 'g')) || []).length;
  if (n) console.log('  남음: ' + k + ' ×' + n);
});
