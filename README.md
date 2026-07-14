<div align="center">

# 🌐 ashes331.github.io

**개인 포트폴리오 대문 홈페이지**

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-4f52c8?style=flat-square&logo=github)](https://ashes331.github.io)
[![GitHub](https://img.shields.io/badge/GitHub-ashes331-181717?style=flat-square&logo=github)](https://github.com/ashes331)

</div>

---

## 소개

인공지능소프트웨어학과 학생 **ashes331**의 개인 홈페이지입니다.  
ML/DL, NLP, 알고리즘을 공부하며 직접 만들고 실험한 프로젝트들을 정리하고 있습니다.

---

## 프로젝트

| 프로젝트 | 설명 | 링크 |
|---|---|---|
| 🎮 Special Playground | 게임, 도구, 알고리즘 시각화 모음집 | [바로가기](https://ashes331.github.io/Special-Playground/) |
| 🪐 Solar Explorer | 태양계 시각화 시뮬레이션 | [바로가기](https://ashes331.github.io/solar-explorer/index.html) |

---

## 기술 스택

`Python` `JavaScript` `HTML / CSS` `PyTorch` `TensorFlow` `NumPy` `Pandas` `Canvas API` `Web Audio API` `Git`

---

## 구조

```
ashes331.github.io/
├── index.html          # 메인 페이지 구조
├── style.css           # 메인 페이지 스타일
├── script.js            # 메인 페이지 스크립트
├── favicon.svg          # 파비콘
└── solar-explorer/       # 서브 프로젝트 (자체 완결)
```

---

## 새 프로젝트 추가할 때 체크리스트

1. `index.html` 하단 `<script src="script.js">`가 참조하는 **`script.js`의 `projects` 배열**에 항목 추가
   ```javascript
   {
     emoji: "🚀",
     title: "프로젝트 이름",
     desc: "설명...",
     tags: ["태그1", "태그2"],
     link: "https://...",
     featured: false
   }
   ```
   → Hero 섹션의 "Projects" 카운터는 배열 길이로 자동 계산되므로 따로 수정할 필요 없음
2. 이 README의 **프로젝트 테이블**에도 동일한 내용 추가 (자동 연동 안 됨, 수동 필수)
3. 새 프로젝트가 서브 폴더 형태라면(예: `/new-project/`), 그 폴더 안에서 자체적으로 완결되게 구성 — 메인 페이지의 `style.css`/`script.js`를 가져다 쓰지 않기

---

## 링크

- GitHub: [github.com/ashes331](https://github.com/ashes331)
