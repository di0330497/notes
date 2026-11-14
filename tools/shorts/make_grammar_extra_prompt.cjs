/* make_grammar_extra_prompt.cjs */
const fs = require('fs');
const path = require('path');
const OUT = path.resolve(__dirname, '..', '..', 'build', 'shorts');
const data = JSON.parse(fs.readFileSync(path.join(OUT, 'grammar-extra-assignments.json'), 'utf8')).scenes;
const header = `# 문법 확장 읽기 5편

아래 5개 주제마다 **6줄**의 짧은 문어체 글을 쓴다.

## 규칙
1. 6줄. 화자는 jihu 한 명. だ・である体.
2. 주어진 targets 4개를 전부 넣는다. 한 줄에 1개.
3. 각 target 첫 등장에 \`{표현}\`.
4. line은 0부터.
5. 한국어 번역 포함.

## 출력
JSON 배열만.

\`\`\`json
[{ "id":"x001", "scene":"문법 확장", "title":"문법 확장 — 조건·필연", "level":"N2", "register":"written",
  "lines":[{"who":"jihu","s":"...","ko":"..."}],
  "targets":[{"kind":"문법","key":"...","line":0}] }]
\`\`\`

## 주제
`;
fs.writeFileSync(path.join(OUT, 'grammar-extra-prompt.md'), [header, '```json', JSON.stringify(data, null, 1), '```', ''].join('\n'), 'utf8');
console.log('wrote prompt');
