/* make_grammar_prompts.cjs — grammar-assignments.json → grammar-prompt-01..10.md */
const fs = require('fs');
const path = require('path');
const OUT = path.resolve(__dirname, '..', '..', 'build', 'shorts');
const data = JSON.parse(fs.readFileSync(path.join(OUT, 'grammar-assignments.json'), 'utf8')).scenes;
const dir = path.join(OUT, 'grammar-prompts');
fs.mkdirSync(dir, { recursive: true });
const BATCH = 15;

const header = `# 문법 마이크로 대화 집필 — 배치

너는 일본어 학습 사이트의 문법 드릴 작가다. 아래 장면마다 **4~6줄**의 아주 짧은 대화를 쓴다.

## 절대 규칙

1. **4~6줄**. 6줄을 넘기지 마라.
2. 주어진 \`targets\` **5개 전부**를 대사에 자연스럽게 넣는다.
3. 한 줄에 새 문법/문형은 **1개만**. 한 줄에 2개를 넣지 마라.
4. 장면의 \`function\`과 \`register\`를 지킨다.
   - polite: です・ます体
   - casual: だ・よ・ね体
   - written: だ・である体
5. 등장인물은 \`chars\`만 쓴다. 화자 id는 jihu, aki, hana, sato, tanaka, ken.
6. 한국어 번역은 자연스럽게. 직역투 금지.
7. target의 첫 등장에만 표시한다.
   - 문법/문형/구어체: \`{표현}\` — 실제 문장 형태로. 예: \`{ないといけない}\`
   - 활용표: 목표의 활용형이 드러나는 부분에 \`{...}\`
8. \`line\`은 0부터 시작하는 줄 번호다. 실제 target이 들어간 줄을 정확히 적어라.
9. 대화는 **하나의 상황**으로 끝난다. 문법 예문을 나열하지 말고, 두 사람이 실제로 주고받게 쓴다.

## 출력 형식

JSON 배열만 출력한다. 코드펜스·설명 없이.

\`\`\`json
[
  {
    "id": "g001",
    "scene": "카페",
    "title": "카페 — 첫 주문 문법",
    "level": "N5",
    "register": "polite",
    "lines": [
      { "who": "aki", "s": "いらっしゃいませ。ご注文はお決まりですか。", "ko": "어서 오세요. 주문하시겠어요?" },
      { "who": "jihu", "s": "はい、コーヒーは{じゃありません}。紅茶でお願いします。", "ko": "네, 커피는 아니고요. 홍차로 부탁합니다." }
    ],
    "targets": [
      { "kind": "문형", "key": "～じゃありません／ではありません", "line": 1 }
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
  fs.writeFileSync(path.join(dir, 'grammar-prompt-' + String(n).padStart(2, '0') + '.md'), lines.join('\n'), 'utf8');
}
console.log('grammar batches', n, dir);
