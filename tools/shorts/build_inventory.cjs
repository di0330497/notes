/* build_inventory.cjs — 쇼츠 대화용 학습 항목 인벤토리
   - 문법·문형·표현·구어체·품사·한자를 정규화해 중복 제거
   - 각 항목에 예문에서 뽑은 장면 태그를 붙인다
   출력: build/shorts/inventory.json
*/
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..');
const DATA = path.join(ROOT, 'j', '2b10e90aebe237af55', 'data');
const OUT = path.join(ROOT, 'build', 'shorts');
fs.mkdirSync(OUT, { recursive: true });

const ctx = { console };
vm.createContext(ctx);
vm.runInContext(
  ['kanji-list.js', 'kanji-cards.js', 'grammar.js', 'patterns.js', 'expressions.js', 'conjugation.js',
    'pos-josa.js', 'pos-verb.js', 'pos-noun.js', 'pos-fukushi.js', 'pos-other.js', 'pos-words.js', 'pos-keiyou-2.js',
    'colloquial.js', 'colloquial-2.js', 'dialect.js', 'slang.js', 'slang-2026.js']
    .map(f => fs.readFileSync(path.join(DATA, f), 'utf8')).join('\n')
  + ';globalThis.X={STUDY_FULL,ALL,FOOD,GRAMMAR,PATS,EXPR,CONJ,SPOKEN,POS_WORDS};',
  ctx);
const { STUDY_FULL, ALL, FOOD, GRAMMAR, PATS, EXPR, CONJ, SPOKEN, POS_WORDS } = ctx.X;
const POS = [].concat(ctx.X.POS_JOSA || [], ctx.X.POS_ADV || [], ctx.X.POS_OTHER || [], ctx.X.POS_VERB || [], ctx.X.POS_NOUN || []);

const strip = s => String(s || '')
  .replace(/\[([^\]|]+)\|[^\]]+\]/g, '$1')
  .replace(/\{([^{}]+)\}/g, '$1')
  .replace(/\[([^\]]+)\]/g, '$1');
const norm = s => String(s || '').replace(/[〜～]/g, '～').replace(/[\s（）()「」、。,.!?！？·・／/]/g, '').toLowerCase();
const hasKo = s => /[가-힣]/.test(String(s || ''));
const hasJp = s => /[ぁ-んァ-ヶ一-龯々]/.test(String(s || ''));

/* 장면 사전 — 예문에 나오는 단어로 항목의 장면 친화도를 추정한다 */
const SCENES = {
  cafe: ['カフェ', 'コーヒー', 'ラテ', 'ケーキ', '店員', '注文', '席', 'メニュー', '喫茶'],
  food: ['レストラン', '料理', '食べ', '飲み', 'お腹', '味', 'ラーメン', '寿司', '居酒屋', '定食', 'メニュー'],
  konbini: ['コンビニ', 'レジ', '店長', 'バイト', 'お弁当', '袋', 'レシート', '棚', '品出し'],
  station: ['駅', '電車', '切符', '改札', 'ホーム', '乗り換え', '特急', '新幹線', '時刻表'],
  airport: ['空港', '飛行機', '搭乗', 'パスポート', '荷物', '保安', '出国', '到着'],
  hotel: ['ホテル', 'チェックイン', '宿泊', '予約', '部屋', 'フロント', '温泉', '旅館'],
  shop: ['買い物', '店', '値段', 'サイズ', '試着', 'レジ', '袋', '返品', 'セール', '色'],
  salon: ['美容院', '髪', 'カット', 'シャンプー', '前髪', '長さ', '予約'],
  hospital: ['病院', '診察', '症状', '薬', '熱', '痛', '保険証', '医者', '看護師', '処方'],
  pharmacy: ['薬局', '薬', '処方箋', '飲み方', '副作用', '朝晩'],
  cityhall: ['市役所', '区役所', '届', '申請', '窓口', '住民票', '印鑑', '書類'],
  bank: ['銀行', '口座', '振込', 'ATM', '通帳', '両替', 'カード'],
  post: ['郵便局', '切手', '荷物', '送る', '住所', '配達', '書留'],
  school: ['学校', '大学', '授業', '先生', '学生', 'レポート', '試験', 'ゼミ', '図書館', '部活'],
  work: ['会社', '会議', '部長', '上司', '仕事', '残業', '資料', '報告', '取引先', '名刺', 'メール'],
  home: ['家', '部屋', '掃除', '洗濯', '料理', '引っ越し', '大家', '隣', '宅配'],
  phone: ['電話', 'メール', 'メッセージ', '連絡', '折り返し', '留守番'],
  travel: ['旅行', '観光', '地図', '案内', '景色', '寺', '神社', '温泉', '写真'],
  festival: ['祭り', '花火', '屋台', '浴衣', '神社', '初詣', 'お正月'],
  weather: ['天気', '雨', '雪', '暑い', '寒い', '台風', '梅雨', '晴れ'],
  body: ['体', '頭', '目', '手', '足', 'お腹', '気分', '具合'],
  emotion: ['気持ち', '嬉しい', '悲しい', '怒', '心配', '驚', '恥ずかしい', '寂しい'],
  study: ['勉強', '日本語', '単語', '文法', '発音', '教科書', '練習', '覚え'],
  friend: ['友達', '一緒', '遊ぶ', '待ち合わせ', '電話', '誘う', '断る'],
  family: ['家族', '母', '父', '兄', '姉', '弟', '妹', '子供', '親'],
  love: ['好き', '付き合う', 'デート', '告白', '恋人', '別れ'],
  news: ['ニュース', '記事', '社会', '問題', '増加', '発表', '調査', '統計'],
  business: ['営業', '売上', '契約', '交渉', '企画', '予算', '会計', '株'],
  nature: ['山', '川', '海', '空', '花', '木', '森', '自然', '景色'],
  foodrare: ['鮪', '鯖', '鰤', '鰻', '蒜', '葱', '蕎麦', '苺', '食材', '市場']
};
const sceneTagsFor = text => {
  const t = strip(text);
  const tags = [];
  for (const [k, words] of Object.entries(SCENES)) {
    if (words.some(w => t.includes(w))) tags.push(k);
  }
  return tags;
};

const items = [];
const seen = new Set();
function add(kind, key, level, note, examples, extra) {
  key = String(key || '').trim();
  if (!key) return;
  const id = kind + ' · ' + norm(key);
  if (seen.has(id)) return;
  seen.add(id);
  const exText = (examples || []).map(e => strip(e.s || e)).join('\n');
  items.push({
    id, kind, key, level: level || '',
    note: note || '',
    scenes: sceneTagsFor(exText + ' ' + key),
    examples: (examples || []).slice(0, 2).map(e => ({ s: e.s || '', ko: e.ko || '' })),
    ...extra
  });
}

/* 문법 — 한글 설명만 있는 메타 항목은 제외, 일본어 패턴/규칙만 */
for (const g of GRAMMAR) {
  if (!hasJp(g.t)) continue;
  if (hasKo(g.t) && !/[～〜]/.test(g.t)) continue;
  add('문법', g.t, g.lv, String(g.desc || '').slice(0, 160), g.ex || []);
}
/* 문형 — 문법과 중복 제거 */
for (const p of PATS) {
  if (!hasJp(p.pat)) continue;
  add('문형', p.pat, p.lv, (p.mean || '') + (p.ex && p.ex[0] ? '. 예: ' + p.ex[0].ko : ''), p.ex || []);
}
/* 표현 */
for (const e of EXPR) {
  if (!hasJp(e.expr)) continue;
  add('표현', e.expr, e.lv || '', e.mean || '', e.ex || []);
}
/* 구어체 — 주제 설명만 있는 항목은 제외 */
for (const s of SPOKEN) {
  if (!hasJp(s.t)) continue;
  if (hasKo(s.t) && !/[～〜]/.test(s.t)) continue;
  add('구어체', s.t, s.lv || '', String(s.rule || '').split(/(?<=[.!?。！？])\s*/)[0], s.ex || []);
}
/* 품사 — 개별 단어 */
for (const w of POS_WORDS) {
  if (!hasJp(w.w)) continue;
  add('품사', w.w, w.lv || '', (w.m || '') + (w.n ? ' — ' + w.n : ''), w.ex || []);
}
/* 활용표 — 참고용 */
for (const c of CONJ) {
  if (!hasJp(c.t)) continue;
  add('활용표', c.t, c.lv || '', String(c.desc || '').slice(0, 140), c.ex || []);
}
/* 한자 — 등장 커버리지용. STUDY_FULL/FOOD 예문으로 장면 태그를 뽑는다 */
const STUDY_BY_K = new Map(STUDY_FULL.map(x => [x.k, x]));
for (const a of ALL) {
  const s = STUDY_BY_K.get(a[0]);
  add('한자', a[0], '', [a[3], a[1], a[2]].filter(Boolean).join(' · '), (s && s.ex) || [], { sub: a[4] });
}
for (const f of FOOD) {
  const s = STUDY_BY_K.get(f[0]);
  add('한자', f[0], '', [f[5], f[1], f[2]].filter(Boolean).join(' · '), (s && s.ex) || [], { sub: 20 });
}

const byKind = {};
for (const x of items) byKind[x.kind] = (byKind[x.kind] || 0) + 1;
const out = { generatedAt: new Date().toISOString(), counts: byKind, total: items.length, items };
fs.writeFileSync(path.join(OUT, 'inventory.json'), JSON.stringify(out, null, 1), 'utf8');
console.log('inventory', items.length, byKind);
console.log('wrote', path.join(OUT, 'inventory.json'));
