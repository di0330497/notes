/* make_prompts.cjs — assignments.json → batch-01.md ... batch-10.md */
const fs = require('fs');
const path = require('path');
const OUT = path.resolve(__dirname, '..', '..', 'build', 'shorts');
const data = JSON.parse(fs.readFileSync(path.join(OUT, 'assignments.json'), 'utf8')).scenes;
const dir = path.join(OUT, 'prompts');
fs.mkdirSync(dir, { recursive: true });

const BATCH = 15;
const header = `# 일본어 쇼츠 대화 집필 — 배치

너는 일본어 학습 사이트의 대화 작가다. 아래 장면마다 **8~12줄**의 자연스러운 짧은 대화를 쓴다.

## 절대 규칙

1. **8~12줄** (11~12줄 권장). 14줄 넘기지 마라.
2. 주어진 \`targets\` **전부**를 대사 안에 자연스럽게 넣는다. 하나도 빠뜨리지 마라.
3. 각 target은 **2~3줄에 하나** 비율로 넣는다. 모든 줄에 target을 넣지 마라. target 없는 줄이 절반 이상이어야 자연스럽다.
4. 한 줄에 새 문법/문형은 **1개만**. 관용구 2개를 한 줄에 넣지 마라.
5. 장면의 \`function\`(기능)과 \`register\`(말투)를 지킨다.
   - polite: です・ます体
   - casual: だ・よ・ね体
   - written: だ・である体
6. 등장인물은 \`chars\`만 쓴다. 화자 id는 jihu, aki, hana, sato, tanaka, ken 중 하나.
7. 한국어 번역은 자연스럽게. 직역투 금지.
8. 대사에 메타 설명을 넣지 마라. (예: "이 문법은...")
9. 각 target의 첫 등장에만 표시를 넣는다.
   - 한자 target: \`[漢字|よみ]\` — 예: \`[注文|ちゅうもん]\`
   - 문법/문형/표현/구어체 target: \`{표현}\` — 예: \`{～てもいいですか}\` 대신 실제 문장 형태 \`{てもいいですか}\`
   - 품사 target: \`{단어}\`
10. target의 \`line\`은 0부터 시작하는 줄 번호다. 실제로 그 target이 들어간 줄을 정확히 적어라.

## 출력 형식

아래 JSON 배열만 출력한다. 코드펜스·설명 없이.

\`\`\`json
[
  {
    "id": "sh001",
    "scene": "카페",
    "title": "카페 — 첫 주문",
    "level": "N5",
    "register": "polite",
    "lines": [
      { "who": "aki", "s": "いらっしゃいませ。", "ko": "어서 오세요." },
      { "who": "jihu", "s": "あの、[窓際|まどぎわ]の[席|せき]に座っても{いいですか}。", "ko": "저기, 창가 자리에 앉아도 될까요?" }
    ],
    "targets": [
      { "kind": "문형", "key": "～てもいいですか", "line": 1 },
      { "kind": "한자", "key": "注", "line": 2 }
    ]
  }
]
\`\`\`

## 장면 목록

`;

let n = 0;
for (let i = 0; i < data.length; i += BATCH) {
  n++;
  const chunk = data.slice(i, i + BATCH);
  const lines = [header, '```json', JSON.stringify(chunk, null, 1), '```', ''];
  fs.writeFileSync(path.join(dir, 'batch-' + String(n).padStart(2, '0') + '.md'), lines.join('\n'), 'utf8');
}
console.log('batches', n, dir);
