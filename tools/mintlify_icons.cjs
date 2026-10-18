/* Mintlify 표준화: 이모지 아이콘 → 모노크롬 라인 SVG(lucide), 탭별 8색 → 단일 그린 액센트 */
const fs = require('fs');
const R = 'j/2b10e90aebe237af55/';

/* 24x24 viewBox, stroke 기반 lucide 아이콘 */
const P = {
  cover: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  talk: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  study: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  pat: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  gram: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
  conj: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M3 15h18M12 3v18"/>',
  pos: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/>',
  spoken: '<path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><path d="M12 18v4"/>',
  expr: '<path d="M10 11H6a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-5a4 4 0 0 0-4-4"/><path d="M20 11h-4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-5a4 4 0 0 0-4-4"/>',
};
const EMO = /^\s*[\p{Extended_Pictographic}\uFE0F\u2302\u2318]+\s*/u;
const svg = k => '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' + (P[k] || '') + '</svg>';

/* ── index.html ── */
let h = fs.readFileSync(R + 'index.html', 'utf8');

/* 1) 사이드바 nav-item 의 .mi 이모지 */
h = h.replace(/<button class="nav-item tab([^"]*)" data-v="([a-z]+)"><span class="mi">[\s\S]*?<\/span>/g,
  (m, cls, v) => '<button class="nav-item tab' + cls + '" data-v="' + v + '">' + svg(v));
/* 2) 표지 nav 의 nid */
h = h.replace(/<span class="nid">[\s\S]*?<\/span>/, '<span class="nid">' + svg('cover') + '</span>');
/* 3) 표지 st-card 의 제목 이모지 */
h = h.replace(/<a class="st-card" href="#([a-z]+)" data-v="([a-z]+)"><span class="sn">(\d+)<\/span><span class="st-body"><b>([\s\S]*?)<\/b>/g,
  (m, href, v, sn, title) => '<a class="st-card" href="#' + href + '" data-v="' + v + '"><span class="sn">' + sn
    + '</span><span class="st-body"><b>' + svg(v) + title.replace(EMO, '').trim() + '</b>');
/* 4) 페이지 h2 이모지 */
const T2V = { '실전 대화': 'talk', '빈도순 한자': 'study', '문형 사전': 'pat', '문법': 'gram', '활용표': 'conj', '품사 사전': 'pos', '구어체': 'spoken', '표현·관용구': 'expr' };
h = h.replace(/<h2>([\s\S]*?)<\/h2>/g, (m, inner) => {
  const t = inner.replace(EMO, '').trim();
  const k = T2V[t];
  return '<h2>' + (k ? svg(k) : '') + t + '</h2>';
});
fs.writeFileSync(R + 'index.html', h, 'utf8');
console.log('index.html: 아이콘 교체 완료');

/* ── app.js: modebar 아이콘 맵 ── */
let a = fs.readFileSync(R + 'js/app.js', 'utf8');
const ICON_SRC = '  var ICON={\n' + Object.keys(P).map(k => '    ' + k + ':' + JSON.stringify(svg(k))).join(',\n') + '\n  };';
a = a.replace(/[ \t]*var ICON=\{[\s\S]*?\};/, ICON_SRC);
a = a.replace(/var items=\[\{v:"cover",t:"표지",ic:"[\s\S]*?"\}\]/, 'var items=[{v:"cover",t:"표지",ic:ICON.cover}]');
fs.writeFileSync(R + 'js/app.js', a, 'utf8');
console.log('app.js: modebar 아이콘 교체 완료');
