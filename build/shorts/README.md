# 쇼츠 4트랙 파이프라인

## 트랙

| 트랙 | 편수 | 줄 수 | 목표 | 담당 |
|---|---:|---:|---:|---|
| 장면 `scene` | 150 | 1,724 | 506 | 자연 회화, 핵심 문법·표현 |
| 문법 `grammar` | 155 | 930 | 770 | 문법·문형·구어체·활용 |
| 한자 `kanji` | 312 | 1,872 | 2,136 | 상용한자 대표 음/훈 |
| N1 `n1` | 45 | 225 | 180 | N1 문어 문법 |

## 생성 순서

```powershell
node tools/shorts/build_inventory.cjs
node tools/shorts/build_core_targets.cjs
node tools/shorts/build_scenes.cjs
node tools/shorts/assign.cjs
node tools/shorts/build_grammar_targets.cjs
node tools/shorts/assign_grammar.cjs
node tools/shorts/build_n1.cjs
node tools/shorts/build_kanji_shorts.cjs
# 배치 집필: prompts/*.md → batch-*.json
node tools/shorts/validate_shorts.cjs
node tools/shorts/validate_tracks.cjs
node tools/shorts/build_site_data.cjs
node tools/shorts/report_all.cjs
```

## 규격

- 장면: 8~12줄, 목표 3~4개
- 문법: 4~6줄, 목표 5개
- 한자: 6줄, 한자 7개(음/훈 표기)
- N1: 4~6줄, 목표 4개, 문어체
- 1편 = 1레슨. 레슨을 쪼개지 않는다.

## 검증

`validate_tracks.cjs`는 목표가 실제 해당 줄에 있는지 검사한다.  
미검증 항목은 `build/shorts/*-problems.json`에 남는다.

## 사이트

`data/lessons.js` 하나에 4트랙 662편이 들어간다. `renderCourse()`가 `l.track`으로 필터링한다.
