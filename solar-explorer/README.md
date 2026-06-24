# 🪐 3D Solar Explorer — 태양계 3D 시뮬레이터

[![Three.js](https://img.shields.io/badge/Three.js-r128-black?style=flat-square&logo=three.js)](https://threejs.org/)
[![WebGL](https://img.shields.io/badge/WebGL-2.0-red?style=flat-square&logo=khronos)](https://www.khronos.org/webgl/)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio%20API-Synthesized-blue?style=flat-square)](https://developer.mozilla.org/ko/docs/Web/API/Web_Audio_API)

> 외부 에셋 이미지 다운로드(CORS) 및 사운드 리소스 설치 제약 없이,  
> **웹 표준 브라우저 기술만으로 구현한 고정밀 3D 태양계 시뮬레이터**입니다.

---

## 📌 목차

1. [기술 아키텍처 개요](#-기술-아키텍처-개요)
2. [핵심 구현 기법](#-핵심-구현-기법)
   - [천문학적 공전/자전 물리 동기화](#1-천문학적-공전자전-시간-물리-동기화)
   - [절차적 우주 배경 생성](#2-360도-절차적-우주-배경-생성)
   - [Web Audio API 신디사이저](#3-web-audio-api-기반-오디오-신디사이저)
   - [UI 및 그래픽 처리](#4-위성-패널--토성-고리-왜곡-보정)
3. [디렉토리 구조](#-디렉토리-구조)

---

## 🛠 기술 아키텍처 개요

| 레이어 | 기술 |
|---|---|
| 3D 렌더링 | Three.js r128 · WebGL 2.0 |
| 배경 생성 | HTML5 Canvas API (절차적 텍스처) |
| 오디오 | Web Audio API (오실레이터 기반 신디사이저) |
| 물리 엔진 | 케플러 방정식 · J2000.0 에포크 |
| UI | Glassmorphism · 극좌표 UV 매핑 |

---

## 🔬 핵심 구현 기법

### 1. 천문학적 공전/자전 시간 물리 동기화

행성들의 단순 회전 애니메이션이 아닌, **실제 천문 관측 데이터 기반**으로 공전·자전 궤적과 속도 비율을 정합했습니다.

- **기준 에포크(J2000.0) 동기화**  
  `2000년 1월 1일`을 기준으로 모든 천체의 공전 주기와 실시간 시뮬레이션 경과 시간(`simTime`)을 연동합니다.

- **타원 궤도 연산 (케플러 방정식)**  
  타원 궤도 상의 매 순간 위치를 케플러 방정식으로 계산합니다.

$$E = M + e \sin E$$

  | 기호 | 의미 |
  |---|---|
  | $E$ | 편심 이각 (Eccentric Anomaly) |
  | $M$ | 평균 이각 (Mean Anomaly) |
  | $e$ | 궤도 이심률 (Eccentricity) |

- **실시간 날짜 달력 연동**  
  HUD 달력에서 날짜를 선택하면, 해당 날짜의 실제 물리 좌표로 모든 천체가 즉시 자동 정렬됩니다.

---

### 2. 360도 절차적 우주 배경 생성

로컬 파일 프로토콜(`file:///`) 및 CORS 정책 환경에서의 외부 이미지 다운로드 차단 문제를,  
**HTML5 Canvas API로 절차적 텍스처를 직접 생성**하여 원천 해결했습니다.

| 요소 | 구현 방식 |
|---|---|
| 성운(Nebula) 효과 | Indigo · Midnight Blue · Dark Magenta 딥 컬러를 가우시안 래디얼 그라디언트로 드로잉 |
| 은하수 별무리 띠 | 대각선 방향 1,500개 별빛 입자, 360도 루핑 EquirectangularReflection 매핑 |
| 일반 별빛 | 투명도·반경을 달리한 2,000개 미세 별빛 산포 |

---

### 3. Web Audio API 기반 오디오 신디사이저

외부 MP3 파일 없이, **브라우저 오실레이터와 노이즈 필터 합성**만으로 심우주 사운드를 실시간 구현합니다.

- **Space Wind Noise (ASMR)**  
  화이트 노이즈 버퍼에 0.04Hz LFO(Low-Frequency Oscillator) 필터를 연결해 우주 기저 바람 소리 재현

- **Ambient Pad BGM**  
  사인파(Sine Wave) 화음으로 `A Major 9 → C#m7 → Dmaj9` 코드 진행을 부드럽게 전환  
  _(어택 3.5~5초 / 릴리즈 5.5~7초)_

- **Click SFX**  
  행성 클릭 시 주파수가 지수 곡선으로 하강하는 SF 사운드 효과

---

### 4. 위성 패널 & 토성 고리 왜곡 보정

- **사이드 위성 글래스 패널**  
  달, 포보스, 데이모스, 이오 등 대표 위성의 회전 정보 카드를 행성 정보창 상단 경계선에 수평 정렬하여 배치

- **방사형 극좌표(Polar Coordinates) UV 매핑**  
  토성 고리 버텍스의 중심 각도($\theta$)와 반경 비율($r$)을 실시간 재연산하여 NASA 텍스처를 왜곡 없이 이식  
  `RepeatWrapping` 필터로 360도 경계의 부채살 뜯김 방지

---

## 📁 디렉토리 구조

```
solar-explorer/
├── index.html              # HTML 마크업 및 HUD 레이아웃
├── assets/                 # 위성(달, 포보스 등) 카드 이미지 에셋
└── src/
    ├── app.js              # Three.js 렌더링 루프 · 물리/오디오 엔진
    ├── style.css           # 반응형 레이아웃 · Glassmorphism UI 스타일
    ├── textures_data.js    # NASA 공식 이미지 Base64 인코딩 매핑 테이블
    └── textures_generator.js  # 원격 텍스처 로컬 백업용 자동 다운로드 스크립트
```
