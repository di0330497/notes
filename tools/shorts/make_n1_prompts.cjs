/* make_n1_prompts.cjs — n1-assignments.json → n1-prompt-01..03.md */
const fs = require('fs');
const path = require('path');
const OUT = path.resolve(__dirname, '..', '..', 'build', 'shorts');
const data = JSON.parse(fs.readFileSync(path.join(OUT, 'n1-assignments.json'), 'utf8')).scenes;
const dir = path.join(OUT, 'n1-prompts');
fs.mkdirSync(dir, { recursive: true });
const BATCH = 15;
const header = `# N1 읽기 쇼츠 집필 — 배치

너는 N1 문어체 읽기 자료를 쓰는 작가다. 아래 주제마다 **4~6문장**의 짧은 논평·설명문을 쓴다.

## 절대 규칙

1. **4~6줄**. 6줄을 넘기지 마라.
2. 주어진 \`targets\` **4개 전부**를 문장 안에 자연스럽게 넣는다.
3. 문체는 **だ・である体** (문어체). 회화체 금지.
4. 한 줄에 새 문법은 **1개만**.
5. 화자는 \`jihu\` 한 명. 각 줄은 완결된 문장.
6. 한국어 번역은 자연스럽게.
7. target의 첫 등장에만 \`{표현}\` 표시. 실제 문장 형태로.
8. \`line\`은 0부터 시작하는 줄 번호.

## 출력 형식

JSON 배열만 출력한다. 코드펜스·설명 없이.

\`\`\`json
[
  {
    "id": "n001",
    "scene": "N1 읽기",
    "title": "N1 읽기 — 사회",
    "level": "N1",
    "register": "written",
    "lines": [
      { "who": "jihu", "s": "都市の再開発が進む{につれて}、昔ながらの商店街は姿を消しつつある。", "ko": "도시 재개발이 진행됨에 따라, 옛 상점가는 모습을 감추고 있다." }
    ],
    "targets": [
      { "kind": "문법", "key": "～につれて", "line": 0 }
    ]
  }
]
\`\`\`

## 주제 목록

`;
let n = 0;
for (let i = 0; i < data.length; i += BATCH) {
  n++;
  const chunk = data.slice(i, i + BATCH);
  fs.writeFileSync(path.join(dir, 'n1-prompt-' + String(n).padStart(2, '0') + '.md'),
    [header, '```json', JSON.stringify(chunk, null, 1), '```', ''].join('\n'), 'utf8');
}
console.log('n1 batches', n, dir);
