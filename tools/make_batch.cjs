/* 배치 프롬프트 생성기
   spec JSON(대화 여러 편) → build/prompt-<id>.md  (작가용 지시서)
   사용: node tools/make_batch.cjs build/spec-batch1.json
   spec 항목: { id, title, scene, place, lv, chars:[], brief, items:[{kind,from,to}] }
     kind: 문형|문법|표현|구어체|활용표|품사   from/to: missing_<kind>.txt 의 1-based 줄 번호
*/
const fs = require('fs'), path = require('path');
const ROOT = __dirname.replace(/\\/g, '/').replace(/\/tools$/, '');
const specFile = process.argv[2];
if (!specFile) { console.error('spec 파일을 주세요'); process.exit(1); }
const spec = JSON.parse(fs.readFileSync(specFile, 'utf8'));

const README = `# 대화 집필 지시서

당신은 일본어 학습 사이트의 **실제 생활 회화**를 쓰는 작가다. 아래 장면 하나로 대화 1편을 만든다.

## 출력
- 파일 하나를 **write 툴로 새로 만든다.** 경로는 아래 OUTPUT.
- 내용은 **JS 한 덩어리**다. 형식은 정확히 이 모양:

\`\`\`js
DIALOGS.push(
{
 "id": "dXX",
 "title": "한국어 제목",
 "scene": "장면분류",
 "place": "도쿄 · 장소 설명",
 "lv": "3",
 "chars": [
  "jihu",
  "hana"
 ],
 "lines": [
  {
   "who": "hana",
   "item": "표현 · うん",
   "s": "うん、その[映画|えいが]なら[先週|せんしゅう]{見|み}たよ。",
   "ko": "응, 그 영화라면 지난주에 봤어."
  },
  {
   "who": "jihu",
   "s": "へえ、いいなあ。",
   "ko": "오호, 좋겠다."
  }
 ],
 "points": [
  { "t": "제목", "d": "설명" }
 ],
 "tags": [
  [ "표현", "うん" ]
 ]
}
);
\`\`\`

## 절대 규칙
1. **한 줄에 item 은 하나까지.** item 이 없는 줄도 있어도 된다(자연스럽게 이어지는 줄).
2. item 문자열은 **「종류 · 키」** 형식. 키는 아래 배정 목록의 문자열을 **한 글자도 바꾸지 말고 그대로** 복사한다(～, （ ）, 물음표까지 그대로).
3. 배정 목록의 항목을 **되도록 많이** 그 줄들이 실제로 보여 주게 쓴다. 다 못 써도 되지만, 억지로 넣어 문장이 이상해지면 차라리 뺀다. 목표: 배정 항목의 70% 이상.
4. 대사 줄 수는 **26~34줄**.
5. 표기법:
   - 모든 한자에 후리가나: \`[漢字|よみ]\` (읽기는 히라가나와 ー만). **한자가 없는 히라가나·가타카나 단어에는 절대 \`[かな|かな]\` 루비를 달지 마라!**
   - 아라비아 숫자에 루비를 달지 말고 한자 수사로 써라: \`[三|みっ]つ\`, \`[二時間|にじかん]\` (× \`[3|みっ]つ\`).
   - 그 줄이 보여 주는 항목 표현에 밑줄: \`{...}\` , 한자가 들어 있으면 반드시 \`{[漢字|よみ]}\` 형식으로 써라 (× \`{漢字|よみ}\` 단독 중괄호 파이프 금지).
   - 문장부호는 전각 \`、。「」！？\` 만. 반각 쉼표·마침표·따옴표 금지.
   - 외래어는 그냥 가타카나로(후리가나 금지).
6. ko 는 자연스러운 한국어 번역. 일본어와 뜻이 맞아야 한다.
7. 대화는 **2026년 현재 20~30대 일본인이 그 상황에서 실제로 주고받는 말**이어야 한다. 교과서 문장·사어(かわゆす·パネェ·KY·ケータイ 등)·노인어·마담 역할어(わよ·かしら·のよ)·문법 설명 대사 금지. 주인공(jihu) 이름은 **ユウキ**(격식 자리 성씨는 **高橋**)로만 쓴다. **등장하는 인물은 전부 일본인이다 — 한국인·유학생 배역을 만들지 마라.**
   - 필러(あー、えっと、なんか、あの)、맞장구(へえ、そっか、たしかに)、말끝 흐림(〜けど、〜かな、〜みたい)、축약(〜てる、〜とく、〜ちゃう、〜じゃん)을 섞는다.
   - 정보를 다 설명하지 않는다. 생략·되묻기·농담·불평을 섞는다.
   - 상대에 따라 말투를 바꾼다: 친구=보통체+종조사, 손님↔점원=정중체(점원은 짧고 관용적), 상사=정중체+완곡.
   - 한국어 직역투(「〜することができます」「〜という意味です」「〜が必要です」) 금지.
   - 완벽한 Q→A 교환 금지. 한쪽이 두 줄 연속 말해도 된다.
8. points 는 2개, tags 는 그 대화에서 가장 중요한 항목 8~12개(같은 항목을 tags 에 또 쓰면 중복 집계되므로 줄에 이미 쓴 항목 중 대표만).
9. **장면에 맞는 새 상황**이어야 한다. 이미 있는 대화와 겹치지 않게 아래 '참고: 기존 대화'를 피한다.

## 검증
- 다 쓴 뒤 스스로 한 번 읽고 어색한 줄을 고친다.
- 마지막에 이 명령을 돌려 통과를 확인한다(작업 폴더와 무관하게 동작한다):
  \`node ${ROOT}/tools/check_one.cjs ${ROOT}/build/<id>.js\`
  출력이 \`✅ 1편 통과\` 면 끝. \`✗\` 가 있으면 고쳐서 다시 돌린다.
`;

const existing = fs.existsSync('dlg_titles.txt') ? fs.readFileSync('dlg_titles.txt', 'utf8').split(/\r?\n/).filter(Boolean) : [];
const kMissAll = fs.existsSync('missing_한자.txt') ? [...fs.readFileSync('missing_한자.txt', 'utf8').trim()] : [];
const kWordMap = new Map();
if (kMissAll.length) {
  const D = path.join(ROOT, 'j/2b10e90aebe237af55/data/');
  new Function(fs.readFileSync(D + 'kanji-list.js', 'utf8') + '\n;\n' + fs.readFileSync(D + 'kanji-cards.js', 'utf8') + ';globalThis.__KF=STUDY_FULL;')();
  (globalThis.__KF || []).forEach(c => {
    const ws = [];
    (c.ex || []).forEach(e => {
      const m = /\{\[([^|\]]+)\|([^\]]+)\]\}/.exec(e.s || '');
      if (m) ws.push('[' + m[1] + '|' + m[2] + '](' + (e.ko || '').slice(0, 18) + ')');
    });
    kWordMap.set(c.k, [...new Set(ws)]);
  });
}

const made = [];
spec.forEach(d => {
  const blocks = [];
  (d.items || []).forEach(it => {
    const f = 'missing_' + it.kind + '.txt';
    const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/).filter(Boolean);
    const from = it.from || 1, to = it.to || lines.length;
    blocks.push({ kind: it.kind, lines: lines.slice(from - 1, to).map((l, i) => ({ no: from + i, l })) });
  });
  const totalItems = blocks.reduce((n, b) => n + b.lines.length, 0);

  const out = [];
  out.push(README);
  out.push('---');
  out.push('');
  out.push('# 이번 편');
  out.push('');
  out.push('- id: **' + d.id + '**');
  out.push('- OUTPUT: **' + ROOT + '/' + (d.file || ('build/' + d.id + '.js')) + '**');
  out.push('- 제목(한국어): ' + d.title);
  out.push('- scene: ' + d.scene + '   ·   place: ' + d.place + '   ·   lv: ' + d.lv);
  out.push('- 등장인물(chars): ' + JSON.stringify(d.chars));
  out.push('- 인물 메모: jihu=일본인 대학생·삿포로 출신 상경 1년 차(유우키·ユウキ), hana=같은 수업 동기(여), aki=카페 점원·오사카 출신(여, 밝고 츤데레), ken=대학 선배 4학년(남, 俺·반말), tanaka=직장 상사 40대(남, 정중), sato=가게 직원(남, 정중)');
  out.push('');
  out.push('## 장면 지시');
  out.push('');
  out.push(d.brief);
  out.push('');
  out.push('## 쓸 항목 (총 ' + totalItems + '개) — 키를 그대로 복사할 것');
  out.push('');
  blocks.forEach(b => {
    out.push('### ' + b.kind + '  (' + b.lines.length + '개)');
    out.push('```');
    b.lines.forEach(x => out.push(x.l.replace(/\t/g, '   // ')));
    out.push('```');
    out.push('');
  });
  if (d.kanji && kMissAll.length) {
    const kSlice = kMissAll.slice((d.kanji.from || 1) - 1, d.kanji.to || kMissAll.length);
    out.push('## 함께 대사 본문(s)에 녹여 쓸 한자 (' + kSlice.length + '자)');
    out.push('- 아래 한자들은 item 배지로 붙일 필요 없이 **대사 본문(s) 안의 단어·역 이름·동네/지명·성씨·메뉴**에 `[漢字|よみ]` 후리가나를 달아 자연스럽게 등장시키기만 하면 한자 커버리지로 자동 집계된다.');
    out.push('- 억지 한자숙어를 만들지 말고, 옆에 적힌 **실제 일상어 예시**를 쓰거나 그 한자가 들어간 **실제 일본 역 이름·지명·성씨**로 자연스럽게 녹여라 (목표: 70% 이상 포함).');
    out.push('```');
    kSlice.forEach(k => out.push(k + '  →  ' + ((kWordMap.get(k) || []).join('  /  ') || k)));
    out.push('```');
    out.push('');
  }
  out.push('## 참고: 기존 대화 80편 (겹치지 않게)');
  out.push('```');
  existing.forEach(x => out.push(x));
  out.push('```');
  out.push('');
  fs.mkdirSync(path.join(ROOT, 'build'), { recursive: true });
  const p = path.join(ROOT, 'build/prompt-' + d.id + '.md');
  fs.writeFileSync(p, out.join('\n'), 'utf8');
  made.push(p + '  (' + totalItems + '항목)');
});
console.log(made.join('\n'));
