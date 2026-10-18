/* 남은 이모지 정리 + Mintlify 아이콘 스타일/단일 그린 액센트 */
const fs = require('fs');
const R = 'j/2b10e90aebe237af55/';

/* ── app.js ── */
let a = fs.readFileSync(R + 'js/app.js', 'utf8');
a = a.replace(/\+'[^']*<span class="dlId">'/, "+'<span class=\"dlId\">'");
a = a.replace(/'<span class="jumpBadge" data-cj="'\+cid\+'">[^<]*'/, "'<span class=\"jumpBadge\" data-cj=\"'+cid+'\">'");
a = a.replace(/'<span class="jumpBadge jbPos" data-ps="'\+pid\+'">[^<]*'/, "'<span class=\"jumpBadge jbPos\" data-ps=\"'+pid+'\">'");
a = a.replace(/r\[4\]===20\?'[^']*식재료':'#'\+rank/, "r[4]===20?'식재료':'#'+rank");
/* 테마 토글 — 해/달 아이콘 SVG */
a = a.replace(/btn\.textContent=dark\?[\s\S]*?:\s*"[^"]*";/,
  'btn.innerHTML=dark?\'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/></svg>\':\'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>\';');
fs.writeFileSync(R + 'js/app.js', a, 'utf8');
const emo = /\p{Extended_Pictographic}/u;
console.log('app.js 남은 이모지 줄:', a.split(/\r?\n/).filter(l => emo.test(l)).length);

/* ── index.html ── */
let h = fs.readFileSync(R + 'index.html', 'utf8');
h = h.replace(/<button class="chip" data-j="juku">[^<]*<\/button>/, '<button class="chip" data-j="juku">숙자훈·아테지 150</button>');
h = h.replace(/<b>빈도순 2,600자 \+ [^<]*<\/b>/, '<b>빈도순 2,600자 + 식재료 47자</b>');
h = h.replace(/<button class="pgBtn" data-a="prev">[^<]*<\/button>/g, '<button class="pgBtn" data-a="prev">‹ 이전</button>');
h = h.replace(/<button class="pgBtn" data-a="next">[^<]*<\/button>/g, '<button class="pgBtn" data-a="next">다음 ›</button>');
h = h.replace(/<button type="button" class="theme" id="themeToggle"[^>]*>[^<]*<\/button>/,
  '<button type="button" class="theme" id="themeToggle" title="테마 전환 (다크/라이트)"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg></button>');
fs.writeFileSync(R + 'index.html', h, 'utf8');
console.log('index.html 남은 이모지 줄:', h.split(/\r?\n/).filter(l => emo.test(l)).length);

/* ── styles.css ── */
let c = fs.readFileSync(R + 'css/styles.css', 'utf8');
/* 1) 단일 그린 액센트 — 탭별 8색을 민트리파이 그린으로 통일 */
c = c.replace(/--c-talk:[^;]+; --c-study:[^;]+; --c-pat:[^;]+; --c-gram:[^;]+;/,
  '--c-talk:#16a34a; --c-study:#16a34a; --c-pat:#16a34a; --c-gram:#16a34a;');
c = c.replace(/--c-conj:[^;]+; --c-pos:[^;]+; --c-spoken:[^;]+; --c-expr:[^;]+;/,
  '--c-conj:#16a34a; --c-pos:#16a34a; --c-spoken:#16a34a; --c-expr:#16a34a;');
/* 2) 아이콘 공통 스타일 */
if (c.indexOf('.ic{') < 0) {
  c += `
/* ── Mintlify 아이콘(라인 SVG) ── */
.ic{width:15px;height:15px;flex:0 0 auto;fill:none;stroke:currentColor;stroke-width:1.9;
  stroke-linecap:round;stroke-linejoin:round;vertical-align:-2.5px}
.nav-item .mi{flex:0 0 auto;display:inline-grid;place-items:center;width:17px;height:17px;color:var(--faint)}
.nav-item.on .mi,.nav-item:hover .mi{color:currentColor}
.modebar button .mi{display:inline-grid;place-items:center;width:16px;height:16px;color:currentColor;opacity:.8}
h2 .ic{width:19px;height:19px;margin-right:9px;color:var(--primary)}
.st-body b .ic{width:15px;height:15px;margin-right:6px;color:var(--primary)}
.theme .ic,.search-btn .ic{width:14px;height:14px;vertical-align:-2px}
`;
}
fs.writeFileSync(R + 'css/styles.css', c, 'utf8');
console.log('styles.css: 단일 그린 액센트 + 아이콘 스타일 적용');
