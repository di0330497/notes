/* 배치 9 프롬프트 생성기 — build/spec-batch9.json 의 subforms 커스텀 블록을
   작가 지시서(build/prompt-<id>.md)로 번역한다. make_batch.cjs 와 같은 스타일 유지. */
const fs = require('fs'), path = require('path');
const ROOT = __dirname.replace(/\\/g, '/').replace(/\/tools$/, '');
const spec = JSON.parse(fs.readFileSync(ROOT + '/build/spec-batch9.json', 'utf8'));

const README = `# 대화 집필 지시서 (배치 9 — 활용형 완성 편)

당신은 일본어 학습 사이트의 **실제 생활 회화**를 쓰는 작가다. 아래 장면 하나로 대화 1편을 만든다.

## 출력
- 파일 하나를 **write 툴로 새로 만든다.** 경로는 아래 OUTPUT.
- 내용은 **JS 한 덩어리**다. 형식:

\`\`\`js
DIALOGS.push(
{
 "id": "dXX",
 "title": "한국어 제목",
 "scene": "장면분류",
 "place": "도쿄 · 장소 설명",
 "lv": "3",
 "chars": ["jihu", "hana"],
 "lines": [
  { "who": "hana", "item": "문형 · ～が上手です／下手です",
    "s": "형은 요리{가 잘}, ...",
    "ko": "형은 요리를 잘해서..." }
 ],
 "points": [...],
 "tags": [[...]]
}
);
\`\`\`

## 절대 규칙
1. **한 줄에 item 은 하나까지.**
2. item 문자열은 「종류 · 키」 형식. 키는 아래 '이번에 잡을 활용형' 의 key 를 **한 글자도 바꾸지 말고 그대로** 복사한다.
3. 아래 표에 **반드시 포함할 활용형** 이 적혀 있다. 그 문자열이 **그 대사의 s 안에 그대로 등장**해야 한다.
   - 예: key 가 「～が上手です／下手です」 이고 targets 이 「が上手で / 下手です」 → 대사 s 에 "ご飯が上手で、…" 또는 "…" 라는 문자열이 그대로 있어야 함(후리가나 […|…] 는 있어도 됨: plain 이 targets 과 매칭되면 OK).
   - targets 이 여러 개면 **모두** s 에 그대로 등장해야 한다.
   - 항목 키(key)의 한자·가나도 그 줄 s 에 들어 있어야 한다(문형·문법·활용표 모두).
4. 대화 줄 수는 **26~34줄**, 각 줄에 배정 활용형 1개씩 매핑(사대 30 황금균형).
5. 표기법:
   - 모든 한자에 \`[漢字|よみ]\` 루비, 가나 단어에는 루비 금지, 아라비아 숫자 루비 금지(\`[三|みっ]つ\` 처럼 한자로).
   - 방금 줄의 target 활용형 부분을 \`{...}\` 밑줄로 강조: \`{それを[留学生|りゅうがくせい]^…}\` 등.
   - 문장부호 전각만, 외래어 가타카나(루비 금지).
6. ko 는 자연스러운 한국어 번역.
7. 대화는 **2026년 현재 20~30대 일본인이 그 상황에서 실제로 주고받는 말**이어야 한다. 교과서 문장·사어·노인어·마담 역할어·문법 설명 대사 금지. 주인공(jihu) = **ユウキ**(격식 자리 성씨 **高橋**). **등장 인물 전원 일본인 — 한국인·유학생 배역 금지.**
   - 필러·맞장구·축약·농담을 섞고, 상대별 말투(친구 반말 / 정중체)를 지킨다.
8. points 는 2개, tags 는 그 대화의 핵심 항목 8~12개.
9. **장면에 맞는 새 상황**이어야 한다. 기존 대화(d01~d143)와 겹치지 않게.

## 검증
- 마지막에: \`node ${ROOT}/tools/check_one.cjs ${ROOT}/build/<id>.js\`
  → \`✅ 1편 통과\` 인지 확인. \`✗\` 가 나오면 고쳐서 다시 돌린다.
  출력이 길면 \`tools/.state/check_one_out.txt\` 참고.
`;

spec.forEach(d => {
  const blocks = [];
  blocks.push(README);
  blocks.push('---\n');
  blocks.push('# 이번 편');
  blocks.push('');
  blocks.push('- id: **' + d.id + '**');
  blocks.push('- OUTPUT: **' + ROOT + '/build/' + d.id + '.js**');
  blocks.push('- 제목(한국어): ' + d.title);
  blocks.push('- scene: ' + d.scene + '   ·   place: ' + d.place + '   ·   lv: ' + d.lv);
  blocks.push('- 등장인물(chars): ' + JSON.stringify(d.chars));
  blocks.push('- 인물 메모: jihu=일본인 대학생·삿포로 출신 상경 1년차(유우키·ユウキ), hana=같은 수업 동기(여), aki=카페 점원·오사카 출신(여), ken=대학 선배 4학년(남, 俺·반말), tanaka=직장 상사 40대(남, 정중), sato=가게 직원(남, 정중)');
  blocks.push('');
  blocks.push('## 장면 지시');
  blocks.push('');
  blocks.push(d.brief);
  blocks.push('');
  blocks.push('## 이번에 잡을 활용형 (' + d.subforms.length + '개 카드) — targets 의 plain 이 s 에 **그대로** 등장해야 함');
  blocks.push('');
  blocks.push('| 종류 | key | 반드시 포함할 활용형 |');
  blocks.push('|---|---|---|');
  d.subforms.forEach(r => blocks.push('| ' + r.kind + ' | ' + r.key + ' | ' + r.targets.join(' / ') + ' |'));
  blocks.push('');
  blocks.push('## 예문 참고 (ex 는 사전 속 예문 — 대화를 이런 활용으로 이어가라)');
  blocks.push('');
  d.subforms.forEach((r, i) => {
    blocks.push((i + 1) + '. **[' + r.kind + '] ' + r.key + '** — ' + r.targets.join(' / '));
    if (r.exS) blocks.push('   - ex: ' + r.exS + '  (' + (r.exKo || '') + ')');
  });
  blocks.push('');
  fs.mkdirSync(ROOT + '/build', { recursive: true });
  const p = ROOT + '/build/prompt-' + d.id + '.md';
  fs.writeFileSync(p, blocks.join('\n'), 'utf8');
  console.log(p + '  (' + d.subforms.length + '카드)');
});
