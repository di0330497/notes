/* 배치 11 프롬프트 생성기 — build/spec-batch11.json → build/prompt-dXXX.md */
const fs = require('fs');
const ROOT = __dirname.replace(/\\/g, '/').replace(/\/tools$/, '');
const spec = JSON.parse(fs.readFileSync(ROOT + '/build/spec-batch11.json', 'utf8'));

const README = `# 대화 집필 지시서 (배치 11 — 문형·표현·구어체 마무리)

당신은 일본어 학습 사이트의 **실제 생활 회화**를 쓰는 작가다. 아래 장면 하나로 대화 1편을 만든다.

## 출력
- 파일 하나를 **write 툴로 새로 만든다.** 경로는 OUTPUT.
- JS 한 덩어리:

\`\`\`js
DIALOGS.push(
{
 "id": "dXXX",
 "title": "한국어 제목",
 "scene": "장면분류",
 "place": "도쿄 · 장소",
 "lv": "2",
 "chars": ["jihu", "hana"],
 "lines": [
  { "who": "hana", "item": "문형 · ～ないでください", "s": "ここでは{[写真|しゃしん]を[撮|と]らないでください}。", "ko": "여기서는 사진을 찍지 마세요." }
 ],
 "points": [{ "t": "…", "d": "…" }],
 "tags": [["문형", "～ないでください"]]
}
);
\`\`\`

## 절대 규칙
1. **한 줄에 item 하나.** 배정 항목 1개 = 대사 1줄. 항목 개수만큼 줄을 만든다(이어지는 줄 몇 개는 item 없이 두어도 된다).
2. item 은 「종류 · key」 — 아래 표의 key 를 **한 글자도 바꾸지 말고** 복사한다(～, ／, （ ） 그대로).
3. 그 줄의 s 안에 **그 key 의 핵심 표현**이 실제 문장으로 나와야 한다. ～ 자리에는 실제 말이 들어간다.
   - 예: key \`～ないでください\` → s 에 「…ないでください」가 나온다.
   - 예: key \`～てもいいです\` → s 에 「…てもいいです」가 나온다.
   - 예: 표현 \`お疲れ様でした\` → s 에 「お疲れ様でした」가 그대로 나온다.
   - 예: 구어체 \`～っけ？（기억 확인·혼잣말 되묻기）\` → s 에 「…っけ？」가 나온다.
4. 표기법:
   - 모든 한자에 \`[漢字|よみ]\` 루비. **가나·가타카나·아라비아 숫자에는 루비 금지.**
   - 그 줄의 대상 표현에 \`{...}\` 밑줄(한자 포함이면 \`{[漢字|よみ]}\`).
   - 문장부호 전각만(\`、。「」！？\`). 반각 \`?\` 금지.
5. ko 는 자연스러운 한국어 번역.
6. 대화는 **2026년 현재 20~30대 일본인이 실제로 주고받는 말**. 교과서체·사어·노인어·문법 설명 대사 금지.
   - 주인공(jihu) = **유우키(ユウキ)** — 삿포로 출신 상경 1년 차 일본인. 다른 인물도 **전원 일본인**(한국인·유학생 금지).
   - 말투: 친구 반말 / 상사·점원 정중체. 필러·맞장구·축약을 섞는다.
   - **문법 설명 대사 금지** — 문형은 실제 상황 속 말로만 녹인다.
7. points 2개, tags 는 그 대화 항목 중 대표 10~14개.

## 검증
- 마지막에: \`node ${ROOT}/tools/check_one.cjs ${ROOT}/build/<id>.js\`
  → \`✅ 1편 통과\` 될 때까지 고친다. 출력은 \`tools/.state/check_one_out.txt\`.
`;

spec.forEach(d => {
  const out = [];
  out.push(README);
  out.push('---\n');
  out.push('# 이번 편');
  out.push('');
  out.push('- id: **' + d.id + '**');
  out.push('- OUTPUT: **' + ROOT + '/build/' + d.id + '.js**');
  out.push('- 제목(한국어): ' + d.title);
  out.push('- scene: ' + d.scene + '   ·   place: ' + d.place + '   ·   lv: ' + d.lv);
  out.push('- 등장인물(chars): ' + JSON.stringify(d.chars));
  out.push('');
  out.push('## 장면 지시');
  out.push('');
  out.push(d.brief);
  out.push('');
  out.push('## 배정 항목 (' + d.items.length + '개) — 항목마다 한 줄');
  out.push('');
  out.push('| item (종류 · key) |');
  out.push('|---|');
  d.items.forEach(it => out.push('| ' + it.kind + ' · ' + it.key + ' |'));
  out.push('');
  const p = ROOT + '/build/prompt-' + d.id + '.md';
  fs.writeFileSync(p, out.join('\n'), 'utf8');
  console.log(p + ' (' + d.items.length + ')');
});
