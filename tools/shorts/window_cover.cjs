/* window_cover.cjs — 기존 대화의 8~14줄 창으로 임베디드 코어를 95% 덮는 후보 찾기
   - 메타 주제(구어체·활용표 설명)는 대화 목표에서 제외
   - 'これ・それ・あれ' 같은 대안 표기를 처리
   - 자연스러움: 8~12줄, 대화당 1창, 장면당 4창
*/
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = 'C:/Users/user/Downloads/japanese-pages';
const DATA = path.join(ROOT, 'j', '2b10e90aebe237af55', 'data');
const OUT = path.join(ROOT, 'build', 'shorts');
fs.mkdirSync(OUT, { recursive: true });

const c = { console }; vm.createContext(c);
const fsx = fs.readdirSync(DATA).filter(f => /^dialogue-[0-9]+\.js$/.test(f)).sort((a,b)=>(+a.match(/\d+/)[0])-(+b.match(/\d+/)[0]));
const files = fsx.concat(['dialogue-daily.js','daily-overrides.js','scene-reskin.js','context-rewrite.js','rewrite-20.js','rewrite-40.js','rewrite-60.js','rewrite-80.js','rewrite-final.js','rewrite-n1.js','tracks.js','targets-auto.js','coverage-patch.js']);
vm.runInContext(files.map(f => fs.readFileSync(path.join(DATA, f), 'utf8')).join('\n') + ';globalThis.D=DIALOGS;globalThis.T=DLG_TRACK;', c);
const D = c.D, T = c.T;
const core = JSON.parse(fs.readFileSync(path.join(ROOT, 'build/reconstruction/core-items.json'), 'utf8'));

const hasKo = s => /[가-힣]/.test(String(s || ''));
const isMeta = x => hasKo(x.key) && !/[～〜]/.test(x.key) && !/[ぁ-んァ-ヶ一-龯々]/.test(x.key.replace(/[가-힣]/g, ''));
const targets = core.filter(x => {
  if (x.kind === '문법') return /[～〜]/.test(x.key);
  if (x.kind === '구어체') return /[～〜]/.test(x.key);
  if (x.kind === '활용표') return false; // 참고용
  return true;
});
const strip = s => String(s || '').replace(/\[([^\]|]+)\|[^\]]+\]/g, '$1').replace(/\{([^{}]+)\}/g, '$1').replace(/\[([^\]]+)\]/g, '$1');
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function pieces(key) {
  let b = String(key).split(/\s+—\s+/)[0].replace(/[（(].*$/, '').trim();
  return b.split(/\s*(?:→|\/|／)\s*/).map(x => x.trim().replace(/\s+/g, '')).filter(Boolean);
}
function makeRe(key) {
  let ps = pieces(key);
  if (ps.length > 1) {
    const long = ps.filter(p => p.replace(/[～〜]/g, '').length >= 3);
    ps = long.length ? long : [ps.sort((a,b)=>b.replace(/[～〜]/g,'').length-a.replace(/[～〜]/g,'').length)[0]];
  }
  const out = [];
  for (const p of ps) {
    // これ・それ・あれ のような並列キーは各要素を alternatives にする
    const alts = p.includes('・') && !/[～〜]/.test(p) ? p.split('・').filter(Boolean) : [p];
    for (const a of alts) {
      const segs = a.split(/[～〜]/).map(x => x.trim());
      if (segs.every(x => !x)) continue;
      let src;
      if (segs.length === 1) src = esc(segs[0]);
      else src = segs.map((x,i) => i === 0 ? (x ? esc(x) : '') : (x ? '.*?' + esc(x) : '.*?')).join('');
      if (src) out.push(new RegExp(src));
    }
  }
  return out;
}
const items = targets.map((x, i) => ({ ...x, idx: i, re: makeRe(x.key) }));
const daily = D.filter(d => !['work','coverage','n1'].includes(T[d.id] || 'life'));
const windows = [];
for (const d of daily) {
  const n = d.lines.length;
  const starts = n <= 14 ? [0] : [...Array(n - 8 + 1).keys()];
  for (const s of starts) {
    const maxLen = Math.min(14, n - s);
    for (let len = 8; len <= maxLen; len++) {
      const end = s + len;
      const raw = d.lines.slice(s, end);
      const text = strip(raw.map(x => x.s).join('\n'));
      const cover = new Set();
      let hits = 0;
      for (const it of items) {
        let hit = false;
        for (const r of it.re) if (r.test(text)) { hit = true; break; }
        if (hit) { cover.add(it.idx); hits++; }
      }
      if (cover.size < 3) continue;
      const density = hits / len;
      windows.push({ d, s, end, len, cover, density });
    }
  }
  if (n < 8) {
    const text = strip(d.lines.map(x => x.s).join('\n'));
    const cover = new Set();
    for (const it of items) if (it.re.some(r => r.test(text))) cover.add(it.idx);
    windows.push({ d, s: 0, end: n, len: n, cover, density: cover.size / n });
  }
}
console.log('targets', items.length, 'daily', daily.length, 'windows', windows.length);

const need = Math.ceil(items.length * 0.95);
const uncovered = new Set(items.map(x => x.idx));
const picked = [];
const usedDialogue = new Set();
const sceneCount = new Map();
while (uncovered.size > items.length - need && picked.length < 200) {
  let best = null, bestScore = -1, bestU = 0;
  for (const w of windows) {
    if (usedDialogue.has(w.d.id)) continue;
    if ((sceneCount.get(w.d.scene) || 0) >= 4) continue;
    let u = 0;
    for (const x of w.cover) if (uncovered.has(x)) u++;
    if (!u) continue;
    // 자연스러움: 짧고, 목표 밀도가 낮은 창을 선호
    const natural = 12 - Math.abs(w.len - 10);
    const score = u * 1000 + natural * 5 - w.density * 40;
    if (score > bestScore) { best = w; bestScore = score; bestU = u; }
  }
  if (!best) break;
  picked.push(best);
  usedDialogue.add(best.d.id);
  sceneCount.set(best.d.scene, (sceneCount.get(best.d.scene) || 0) + 1);
  for (const x of best.cover) uncovered.delete(x);
}
console.log('picked', picked.length, 'covered', items.length - uncovered.size, '/', items.length,
  ((items.length - uncovered.size) / items.length * 100).toFixed(1) + '%',
  'lines', picked.reduce((a,w)=>a+w.len,0));
console.log('uncovered kinds', [...uncovered].reduce((m,i)=>{const k=items[i].kind;m[k]=(m[k]||0)+1;return m},{}));
console.log('uncovered sample', [...uncovered].slice(0,80).map(i=>items[i].kind+' '+items[i].key));
fs.writeFileSync(path.join(OUT, 'window-picks.json'), JSON.stringify(picked.map(w => ({
  id: w.d.id, title: w.d.title, scene: w.d.scene, level: w.d.level,
  start: w.s, end: w.end, len: w.len,
  cover: [...w.cover].map(i => ({ kind: items[i].kind, key: items[i].key }))
})), null, 1), 'utf8');
fs.writeFileSync(path.join(OUT, 'targets-577.json'), JSON.stringify(items.map(x => ({ kind: x.kind, key: x.key, level: x.level })), null, 1), 'utf8');
