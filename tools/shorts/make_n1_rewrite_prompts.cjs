const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = 'C:/Users/user/Downloads/japanese-pages';
const c = {}; vm.createContext(c);
vm.runInContext(fs.readFileSync(`${ROOT}/j/2b10e90aebe237af55/data/lessons.js`, 'utf8') + ';globalThis.L=LESSONS;', c);
const n1 = c.L.filter(l => l.track === 'n1');
const as = JSON.parse(fs.readFileSync(`${ROOT}/build/shorts/n1-assignments.json`, 'utf8')).scenes;
const aById = new Map(as.map(s => [s.id, s]));
const dir = `${ROOT}/build/shorts/rewrite-prompts`;

const header = `# N1 읽기 45편 — 문장 다듬기

N1 읽기 지문을 **한 편의 자연스러운 짧은 글**로 다듬는다. 대화가 아니라 한 사람이 쓰는 글이다.

## 규칙

1. **5~6줄**, 한 사람(\\\`jihu\\\`)이 쓴 하나의 글. 문단이 이어지게.
2. 주어진 목표 중 **2개만** 고른다. 3개를 억지로 넣지 마라.
3. 목표가 없는 줄이 **2줄 이상**. 모든 줄에 문형을 넣지 마라.
4. 한 줄에 목표 1개. 목표 첫 등장만 \\\`{…}\\\`로 감싼다. \\\`line\\\`은 0부터.
5. **신문 칼럼·에세이 문체**(だ・である). 딱딱한 번역투 금지.
6. 문장이 서로 이어져 하나의 논지가 되어야 한다. 예문 나열 금지.
7. 한국어 번역은 자연스러운 글말. 일본어를 남기지 마라.
8. 원문의 소재(사회·경제·문화·언어 등)는 유지한다.

## 출력

JSON 배열만. 코드펜스·설명 없이.

\\\`\\\`\\\`json
[
  {
    "id": "n001",
    "scene": "N1 읽기",
    "title": "N1 읽기 — 사회",
    "level": "N1",
    "register": "written",
    "lines": [ { "who": "jihu", "s": "…", "ko": "…" } ],
    "targets": [ { "kind": "문법", "key": "～や否や／～や", "line": 1 } ]
  }
]
\\\`\\\`\\\`

## 지문
`;

const BATCH = 15;
let n = 0;
for (let i = 0; i < n1.length; i += BATCH) {
  n++;
  const chunk = n1.slice(i, i + BATCH).map(l => {
    const a = aById.get(l.id) || {};
    return {
      id: l.id, scene: l.scene, title: l.goal, level: l.level,
      register: 'written',
      targets: (l.targets || []).map(t => ({ kind: t.kind, key: t.key })),
      lines: l.lines.map(x => ({ s: x.s, ko: x.ko }))
    };
  });
  fs.writeFileSync(path.join(dir, `n1-${String(n).padStart(2, '0')}.md`),
    [header, '```json', JSON.stringify(chunk, null, 1), '```', ''].join('\n'), 'utf8');
}
console.log('n1 prompt batches', n);
