/* build_kanji_shorts.cjs — 상용한자 2,136자를 7자씩 묶어 한자 읽기 쇼츠 306편 생성 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..', '..');
const DATA = path.join(ROOT, 'j', '2b10e90aebe237af55', 'data');
const OUT = path.join(ROOT, 'build', 'shorts');
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(
  fs.readFileSync(path.join(DATA, 'kanji-list.js'), 'utf8') + '\n'
  + fs.readFileSync(path.join(DATA, 'kanji-cards.js'), 'utf8')
  + ';globalThis.X={ALL,FOOD,STUDY_FULL};', ctx);
const { ALL, FOOD, STUDY_FULL } = ctx.X;
const study = new Map(STUDY_FULL.map(x => [x.k, x]));

const joyo = ALL.filter(a => a[4] >= 1 && a[4] <= 8);
const THEMES = [
  ['물고기', '魚', /\b(fish|tuna|mackerel|eel|salmon|shellfish|sardine|bonito|bream|carp|octopus|squid|shrimp|crab)\b/],
  ['몸', '体', /\b(body|head|face|eye|ear|nose|mouth|hand|foot|skin|bone|heart|blood|neck|shoulder|arm|leg|stomach|finger|tooth)\b/],
  ['날씨', '天気', /\b(weather|rain|snow|wind|cloud|sky|sun|moon|season|storm|fog|thunder)\b/],
  ['자연', '自然', /\b(mountain|river|sea|ocean|tree|forest|earth|soil|stone|fire|water|flower|grass|island|lake|field|rock)\b/],
  ['음식', '食べ物', /\b(food|rice|meat|vegetable|fruit|sake|tea|taste|soup|bread|salt|sugar|oil|drink|meal)\b/],
  ['일·경제', '仕事', /\b(company|work|job|money|economy|commerce|law|government|market|contract|salary|tax|bank|business|trade)\b/],
  ['학교·언어', '学校', /\b(school|study|letter|word|book|number|science|literature|history|exam|question|answer|name|language)\b/],
  ['가족·사람', '人', /\b(family|person|parent|child|brother|sister|relative|man|woman|friend|guest|adult|people)\b/],
  ['시간', '時間', /\b(time|day|year|morning|evening|night|week|month|today|tomorrow|yesterday|hour|season)\b/],
  ['이동·여행', '旅', /\b(travel|road|car|ship|airplane|station|city|village|bridge|gate|direction|trip|port|airport)\b/],
  ['동물·식물', '動物', /\b(animal|bird|insect|dog|cat|horse|cow|pig|rat|snake|beast|plant|flower)\b/],
  ['마음·생각', '心', /\b(mind|heart|feeling|love|joy|sadness|anger|worry|hope|meaning|thought|emotion)\b/],
  ['동작', '動き', /\b(go|come|see|hear|speak|write|read|eat|drink|sleep|wake|walk|run|think|make|do)\b/],
  ['상태·성질', '様子', /\b(big|small|high|low|long|short|many|few|good|bad|new|old|strong|weak|deep|light|heavy)\b/]
];
function themeOf(a) {
  const text = String(a[5] || '').toLowerCase();
  for (const [key, jp, re] of THEMES) if (re.test(text)) return { key, jp };
  const g = +a[4];
  if (g >= 1 && g <= 8) return { key: '상용 ' + g + '학년', jp: '常用' + g + '年' };
  return { key: '인명·표외', jp: '人名・表外' };
}
function firstReading(s) {
  return String(s || '').split(/[・·]/).map(x => x.trim()).filter(Boolean)[0] || '';
}
function allReadings(s) {
  return String(s || '').split(/[・·]/).map(x => x.trim()).filter(Boolean);
}
function meaningOf(a) {
  const s = study.get(a[0]);
  if (s && s.hun) {
    const parts = String(s.hun).trim().split(/\s+/);
    if (parts.length > 1) return parts.slice(0, -1).join(' ');
    return s.hun;
  }
  return a[3] || '';
}
function wordFor(a) {
  const s = study.get(a[0]);
  if (s && s.ex) {
    for (const e of s.ex) {
      const ms = [...String(e.s || '').matchAll(/\[([^\]|]+)\|([^\]]+)\]/g)];
      for (const m of ms) {
        if (m[1].includes(a[0]) && m[2]) return { word: m[1], reading: m[2] };
      }
    }
  }
  const kun = firstReading(a[2]) || firstReading(a[1]);
  return { word: a[0], reading: kun };
}

/* 테마별 묶음 */
const byTheme = new Map();
for (const a of joyo) {
  const t = themeOf(a);
  if (!byTheme.has(t.key)) byTheme.set(t.key, { jp: t.jp, items: [] });
  byTheme.get(t.key).items.push(a);
}
const chunks = [];
for (const [key, v] of byTheme) {
  for (let i = 0; i < v.items.length; i += 7) {
    chunks.push({ theme: key, themeJp: v.jp, items: v.items.slice(i, i + 7) });
  }
}

const shorts = chunks.map((c, idx) => {
  const id = 'k' + String(idx + 1).padStart(3, '0');
  const words = c.items.map(a => ({ a, ...wordFor(a) }));
  const clean = x => x && x !== '—' && x !== '-' && x !== '－';
  const on = c.items.map(a => firstReading(a[1])).filter(clean);
  const kun = c.items.map(a => firstReading(a[2])).filter(clean);
  const w1 = words.slice(0, 3).map(w => `[${w.word}|${w.reading}]`).join('、');
  const w2 = words.slice(3).map(w => `[${w.word}|${w.reading}]`).join('、');
  const onLine = on.length ? `音読みは「${on.join('」「')}」。` : '';
  const kunLine = kun.length ? `訓読みは「${kun.join('」「')}」。` : '';
  const lines = [
    { who: 'jihu', s: `今日は「${c.themeJp}」の漢字。読める？`, ko: `오늘은 '${c.theme}' 한자. 읽을 수 있어?` }
  ];
  if (w1) lines.push({ who: 'aki', s: `${w1}。`, ko: words.slice(0, 3).map(w => `${w.word}(${w.reading})`).join(' · ') });
  if (w2) lines.push({ who: 'jihu', s: `${w2}。`, ko: words.slice(3).map(w => `${w.word}(${w.reading})`).join(' · ') });
  if (onLine) lines.push({ who: 'aki', s: onLine, ko: `음독은 '${on.join("', '")}'.` });
  if (kunLine) lines.push({ who: 'jihu', s: kunLine, ko: `훈독은 '${kun.join("', '")}'.` });
  lines.push({ who: 'aki', s: `同じ漢字でも、言葉によって読みが変わるんだね。`, ko: `같은 한자도 단어에 따라 읽기가 달라지네.` });
  const targets = words.map((w, i) => ({
    kind: '한자', key: w.a[0], line: i < 3 ? 1 : 2,
    note: [meaningOf(w.a), w.a[1] ? '음 ' + w.a[1] : '', w.a[2] ? '훈 ' + w.a[2] : ''].filter(Boolean).join(' · ')
  }));
  const avg = c.items.reduce((a, x) => a + (x[4] || 8), 0) / Math.max(1, c.items.length);
  const level = avg <= 2 ? 'N5' : avg <= 4 ? 'N4' : avg <= 6 ? 'N3' : 'N2';
  return {
    id, scene: '한자 읽기', title: `한자 읽기 — ${c.themeJp} ${idx + 1}`,
    level, register: 'casual', chars: ['jihu', 'aki'],
    lines, targets
  };
});
fs.writeFileSync(path.join(OUT, 'kanji-shorts.json'), JSON.stringify(shorts, null, 1), 'utf8');
const covered = new Set(shorts.flatMap(s => s.targets.map(t => t.key)));
console.log('joyo', joyo.length, 'shorts', shorts.length, 'covered', covered.size,
  'lines avg', (shorts.reduce((a, s) => a + s.lines.length, 0) / shorts.length).toFixed(1));
console.log('themes', [...byTheme.entries()].map(([k, v]) => k + ':' + v.items.length).join(' '));
