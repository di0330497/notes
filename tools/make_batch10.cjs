/* 배치 10 프롬프트 생성기 (재설계) — 낱말 1개 = 1줄 = item 「품사 · 낱말」 */
const fs = require('fs');
const ROOT = __dirname.replace(/\\/g, '/').replace(/\/tools$/, '');
const spec = JSON.parse(fs.readFileSync(ROOT + '/build/spec-batch10.json', 'utf8'));

const README = `# 대화 집필 지시서 (배치 10 — 품사 낱말 커버리지)

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
 "lv": "3",
 "chars": ["jihu", "hana"],
 "lines": [
  { "who": "hana", "item": "품사 · とても", "s": "そのケーキ、{とても}おいしかったね。", "ko": "그 케이크, 정말 맛있었어." }
 ],
 "points": [{ "t": "…", "d": "…" }],
 "tags": [["품사", "とても"]]
}
);
\`\`\`

## 절대 규칙
1. **한 줄에 item 하나.** 배정 낱말 1개 = 대사 1줄. 낱말 개수만큼 줄을 만든다(그 사이에 item 없는 이어지는 줄을 몇 개 섞어도 되지만, 배정 낱말은 **전부** 각자 한 줄씩 가져야 한다).
2. item 은 「품사 · <낱말>」 — 아래 표의 낱말을 **한 글자도 바꾸지 말고** 복사한다(후리가나 포함 형태 그대로).
3. 그 줄의 s 안에 **그 낱말이 반드시 나와야 한다**(후리가나 제외 plain 일치). 낱말에 후리가나가 있으면(예: \`[急|いそ]\`) s 에서도 \`{[急|いそ]}\` 처럼 밑줄+후리가나로 쓴다.
4. 표기법:
   - 모든 한자에 \`[漢字|よみ]\` 루비. **가나 단어·가타카나·아라비아 숫자에는 루비 금지.**
   - 그 줄의 대상 낱말에 \`{...}\` 밑줄(한자 포함이면 \`{[漢字|よみ]}\`).
   - 문장부호 전각만(\`、。「」！？\`). 반각 \`?\` 금지.
5. ko 는 자연스러운 한국어 번역.
6. 대화는 **2026년 현재 20~30대 일본인이 실제로 주고받는 말**. 교과서체·사어·노인어·문법 설명 대사 금지.
   - 주인공(jihu) = **유우키(ユウキ)** — 삿포로 출신 상경 1년 차 일본인 대학생. 다른 인물도 **전원 일본인**(한국인·유학생 금지).
   - 친구 반말 / 상사·점원 정중체 구분, 필러·맞장구·축약을 섞는다.
7. 의성어·동물 울음소리 카드는 실제 소리 묘사나 상황 재현으로 쓴다.
8. points 2개, tags 는 그 대화 낱말 중 대표 10~14개.

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
  out.push('## 배정 낱말 (' + d.words.length + '개) — 낱말마다 한 줄씩');
  out.push('');
  out.push('| item (품사 · 낱말) | 읽기 | 뜻 | 예문 |');
  out.push('|---|---|---|---|');
  d.words.forEach(x => out.push('| 품사 · ' + x.w + ' | ' + (x.r || '') + ' | ' + (x.m || '') + ' | ' + (x.ex ? x.ex.s : '') + ' |'));
  out.push('');
  const p = ROOT + '/build/prompt-' + d.id + '.md';
  fs.writeFileSync(p, out.join('\n'), 'utf8');
});
console.log('프롬프트 ' + spec.length + '개 생성 (' + spec[0].id + '~' + spec[spec.length - 1].id + ')');
