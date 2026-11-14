/* match.cjs — 목표가 대사에 실제로 들어갔는지 검사하는 매처 */
const surfaceOf = s => String(s || '')
  .replace(/\[([^\]|]+)\|[^\]]+\]/g, '$1')
  .replace(/\{([^{}]+)\}/g, '$1')
  .replace(/\[([^\]]+)\]/g, '$1');
const readingOf = s => String(s || '')
  .replace(/\[([^\]|]+)\|([^\]]+)\]/g, '$1 $2')
  .replace(/\{([^{}]+)\}/g, '$1')
  .replace(/\[([^\]]+)\]/g, '$1');
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function baseKey(key) {
  return String(key || '')
    .replace(/\[([^\]|]+)\|[^\]]+\]/g, '$1')
    .split(/\s+—\s+/)[0].trim();
}
function keyVariants(key) {
  let b = baseKey(key).replace(/＋/g, '');
  const paren = [...b.matchAll(/[（(]([^）)]*)[）)]/g)].map(m => m[1]).join('/');
  b = b.replace(/[（(][^）)]*[）)]/g, '');
  let parts = b.split(/\s*(?:→|\/|／|·)\s*/).map(x => x.trim().replace(/\s+/g, '')).filter(Boolean);
  if (paren) parts.push(...paren.split(/[\/／·・]/).map(x => x.trim().replace(/\s+/g, '')).filter(Boolean));
  return parts;
}
function stemRes(run) {
  if (run.endsWith('する') && run.length > 2) {
    return [new RegExp(esc(run.slice(0, -2)) + 'し(ます|ました|た|て|ない|ません)?')];
  }
  const last = run.slice(-1);
  const stem = run.slice(0, -1);
  if (!stem) return [];
  if ('る'.includes(last)) return [new RegExp(esc(stem) + '(る|り|ら|れ|ろ|っ|て)')];
  if ('う'.includes(last)) return [new RegExp(esc(stem) + '(う|わ|い|え|お|っ|った|って)')];
  if ('す'.includes(last)) return [new RegExp(esc(stem) + '(す|し|さ|せ|そ)')];
  if ('く'.includes(last)) return [new RegExp(esc(stem) + '(く|き|か|こ|け|っ|いた|いて)')];
  if ('む'.includes(last)) return [new RegExp(esc(stem) + '(む|み|ま|め|も|ん|んだ|んで)')];
  if ('ぶ'.includes(last)) return [new RegExp(esc(stem) + '(ぶ|び|ば|べ|ぼ|ん|んだ|んで)')];
  if ('ぬ'.includes(last)) return [new RegExp(esc(stem) + '(ぬ|に|な|ね|の|ん|んだ|んで)')];
  if ('ぐ'.includes(last)) return [new RegExp(esc(stem) + '(ぐ|ぎ|が|げ|ご|い|いだ|いで)')];
  if ('つ'.includes(last)) return [new RegExp(esc(stem) + '(つ|ち|た|て|と|っ|った|って)')];
  return [];
}
function partToRe(part) {
  const alts = part.includes('・') && !/[～〜]/.test(part) ? part.split('・').filter(Boolean) : [part];
  const out = [];
  for (const a of alts) {
    const segs = a.split(/[～〜]/).map(x => x.trim());
    if (segs.every(x => !x)) continue;
    let src;
    if (segs.length === 1) src = esc(segs[0]);
    else src = segs.map((x, i) => i === 0 ? (x ? esc(x) : '') : (x ? '.*?' + esc(x) : '.*?')).join('');
    if (src) out.push(new RegExp(src));
  }
  return out;
}
const META = [
  [/い형용사＋です/, ['です']],
  [/い형용사～くないです/, ['くないです']],
  [/い형용사～かったです/, ['かったです']],
  [/い형용사～くなかったです/, ['くなかったです']],
  [/い형용사＋명사/, ['い']],
  [/な형용사＋です/, ['です']],
  [/な형용사～じゃありません/, ['じゃありません', 'ではありません']],
  [/な형용사～でした/, ['でした']],
  [/な형용사＋な＋명사/, ['な']],
  [/보통형/, ['だ', 'た', 'ない', 'る']],
  [/위치명사/, ['上', '下', '中', '前', '後ろ', '隣', '間']],
  [/どんな＋명사/, ['どんな']],
  [/～ね／～よ/, ['ね', 'よ']],
  [/～く／～に なります/, ['になります', 'くなります', 'になりました', 'くなりました']],
  [/～く／～に します/, ['にします', 'くします', 'にしました', 'くしました']],
  [/～が好きです／嫌いです/, ['好き', '嫌い']],
  [/～とみえる／～と見られる/, ['とみえる', 'と見られる']],
  [/～（か）と思うと／～（か）と思ったら/, ['と思うと', 'と思ったら']],
  [/～という＋/, ['という']],
  [/～んとする/, ['んと', 'ようと']],
  [/～めく/, ['めい', 'めく']]
];
const EXTRA = [
  [/とく$/, ['ときます', 'といた', 'とく', 'とき']],
  [/ちゃう/, ['ちゃ', 'ちゃっ', 'ちゃい', 'ちゃえ']],
  [/じゃう/, ['じゃ', 'じゃっ', 'じゃい', 'じゃえ']],
  [/ておく$/, ['ておき', 'ておい', 'ておく', 'ておけ']],
  [/てしまう$/, ['てしま', 'ちゃ', 'じゃ']],
  [/んだけど/, ['んだけど', 'んですが', 'んだけれど']],
  [/ない$/, ['ない', 'ありません', 'ません', 'なかっ']],
  [/ありません$/, ['ありません', 'ない']],
  [/ありがとうございます$/, ['ありがとうございます', 'ありがとう']],
  [/お疲れ様でした$/, ['お疲れ様でした', 'お疲れ様です']],
  [/お疲れ様です$/, ['お疲れ様です', 'お疲れ様でした']]
];
const EXTRA_RE = [
  [/しか～ない/, /しか.*?(ない|ありません|ません)/],
  [/～たり～たり/, /(た|だ)り.*?(た|だ)り/],
  [/～とのことだ/, /とのこと(だ|です)/],
  [/～とみえる/, /とみえ/],
  [/～なおす/, /なおし/],
  [/～が上手です/, /が上手/],
  [/～が下手です/, /が下手/],
  [/～があります/, /あります/],
  [/～がわかります/, /わかります/],
  [/～がほしい/, /ほしい/],
  [/～がする/, /がし/],
  [/～ことができます/, /(こと)?ができ/],
  [/～てもらう/, /(て)?もら/],
  [/～得る/, /得/],
  [/～得ない/, /得ません|得ない/],
  [/～てくる/, /てき/],
  [/お～する/, /お.*?し/],
  [/～ようにする/, /ようにし/],
  [/～れる／～られる/, /われ/],
  [/～させてください/, /せてください/],
  [/～ではあるまいし/, /じゃあるまいし|ではあるまいし/],
  [/～かよ/, /かよ/],
  [/～ないわけにはいかない/, /わけにはいき/],
  [/～ずにはいられない/, /ずにはいられ/],
  [/～に越したことはない/, /に越したことは/],
  [/～思いをする/, /思いをし/],
  [/～んとする/, /ようと|んと/],
  [/～びる／～ぶる/, /ぶっ/],
  [/～ものと思われる/, /と思われ/],
  [/～ものとする/, /ものとし/],
  [/～こととする/, /こととし/],
  [/～と相まって/, /相まっ/]
];
function makeMatchers(kind, key) {
  const out = [];
  for (const part of keyVariants(key)) {
    for (const r of partToRe(part)) out.push(r);
    /* 활용형 흡수: ～と思う → と思(った/います), ～すぎる → すぎ(た/て) */
    for (const seg of part.split(/[～〜]/).map(x => x.trim()).filter(Boolean)) {
      if (seg.length >= 3) out.push(new RegExp(esc(seg.slice(0, -1))));
      for (const r of stemRes(seg)) out.push(r);
      /* 조사 が·を·に·は 생략형: ～があります → あります */
      if (/[がをには]/.test(seg)) {
        out.push(new RegExp(seg.replace(/[がをには]/g, c => c + '?')));
      }
    }
  }
  for (const [re, words] of META) if (re.test(key)) for (const w of words) out.push(new RegExp(esc(w)));
  for (const [re, words] of EXTRA) if (re.test(key)) for (const w of words) out.push(new RegExp(esc(w)));
  for (const [re, rx] of EXTRA_RE) if (re.test(key)) out.push(rx);
  const bare = keyVariants(key).join('');
  if ((kind === '품사' || kind === '표현') && /^[ぁ-ん]{3,4}$/.test(bare)) out.push(new RegExp(esc(bare.slice(0, 2))));
  if (/る$/.test(bare) && bare.length >= 3) out.push(new RegExp(esc(bare.slice(0, -1)) + '[るりられろっ]'));
  return out;
}
function matches(text, kind, key) {
  const surfaces = [surfaceOf(text), readingOf(text)];
  return makeMatchers(kind, key).some(r => surfaces.some(t => r.test(t)));
}
module.exports = { surfaceOf, readingOf, matches, makeMatchers, keyVariants };
