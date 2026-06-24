# 🪐 3D Solar Explorer (태양계 3D 시뮬레이터)
[![Three.js](https://img.shields.io/badge/Three.js-r128-black?style=flat-square&logo=three.js)](https://threejs.org/)
[![WebGL](https://img.shields.io/badge/WebGL-2.0-red?style=flat-square&logo=khronos)](https://www.khronos.org/webgl/)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio%20API-Synthesized-blue?style=flat-square)](https://developer.mozilla.org/ko/docs/Web/API/Web_Audio_API)
외부 에셋 이미지 다운로드 차단(CORS)이나 소리 리소스 설치의 제약 없이, 웹 표준 브라우저 기술만을 사용하여 구현한 **고정밀 3D 태양계 시뮬레이터**입니다.
---
## 🚀 기술적 핵심 아키텍처 및 구현 기법
### 1. 천문학적 공전/자전 시간 물리 동기화 (Astronomical Engine)
행성들의 단순 회전 애니메이션이 아닌, 실제 천문 관측 데이터를 반영하여 공전과 자전의 궤적 및 속도 비율을 정확하게 정합했습니다.
* **기준 에포크(J2000.0) 동기화**: `2000년 1월 1일`을 기준으로 모든 천체의 공전 주기와 실시간 시뮬레이션 경과 시간(`simTime`)을 연동했습니다.
* **타원 궤도 연산**: 케플러 방정식을 통해 타원 궤도 상의 매 순간 위치를 계산합니다.
  \[ E = M + e \sin E \]
  *(여기서 \(E\)는 편심 이각, \(M\)은 평균 이각, \(e\)는 궤도 이심률입니다.)*
* **실시간 날짜 달력 연동**: 사용자가 달력 HUD에서 특정 날짜를 선택하면 천체들의 위치가 해당 날짜의 실제 물리 좌표로 즉시 자동 정렬됩니다.
### 2. 360도 절차적 우주 배경 (Procedural Background)
로컬 파일 프로토콜(`file:///`) 및 CORS 정책 하에서 외부 우주 배경 이미지가 다운로드 차단되는 문제를 원천 해결하기 위해, HTML5 Canvas API를 사용해 절차적으로 텍스처를 빚어냅니다.
* **성운(Nebula) 효과**: Indigo, Midnight Blue, Dark Magenta 등의 오묘한 딥 컬러 그라데이션 브러시를 가우시안 래디얼 그라디언트로 드로잉했습니다.
* **은하수 별무리 띠(Milky Way)**: 대각선 방향으로 입자 밀도가 모여 흐르는 은하수 띠(1,500개 별빛)를 360도 루핑 패턴으로 생성하여 EquirectangularReflection 맵으로 보정 매핑했습니다.
* **일반 촘촘한 별빛**: 2,000개의 미세 별빛을 투명도와 반경을 달리하여 흩뿌렸습니다.
### 3. Web Audio API 기반 오디오 신디사이저 (Synthesizer Engine)
외부 MP3 음악 파일 설치 없이 순수 브라우저 오디오 오실레이터와 노이즈 필터를 합성하여 웅장하고 깊은 심우주 사운드를 실시간으로 연출합니다.
* **Space Wind Noise (ASMR)**: 화이트 노이즈 생성 버퍼에 느린 0.04Hz 주기의 LFO(Low-Frequency Oscillator) 필터를 물려 우주의 잔잔한 기저 바람 소리를 구현했습니다.
* **Ambient Pad BGM**: 따뜻한 사인파(Sine Wave) 화음 패드로 `A Major 9`, `C#m7`, `Dmaj9` 코드를 부드럽게 전환(어택 3.5~5초, 릴리즈 5.5~7초)하여 몽환적이고 우아한 힐링 음악을 연주합니다.
* **Click SFX**: 행성 클릭 감지 시 주파수가 지수 곡선으로 떨어지는 미래지향적 공상과학(SF) 사운드 효과를 구현했습니다.
### 4. 수평 정렬 위성 상세 패널 & 토성 고리 왜곡 보정 (UI & Graphics)
* **사이드 위성 글래스 패널**: 대표 위성(달, 포보스, 데이모스, 이오 등)의 카드 형태 회전 시각 정보 및 서브 위성 텍스트 목록을 행성 정보창의 상단 경계선과 완벽하게 수평 정렬하여 배치했습니다.
* **방사형 극좌표(Polar Coordinates) UV 매핑**: 토성 고리 모델의 버텍스 중심 각도(\(\theta\))와 반경 비율(\(r\))을 기준으로 극좌표를 실시간 재연산하여 왜곡 없는 NASA 텍스처를 이식하였으며, `RepeatWrapping` 필터를 통해 360도 경계 지점의 부채살 뜯김을 방지했습니다.
---
## 📁 디렉토리 구조
solar-explorer/ 
├── index.html # HTML 마크업 및 HUD 레이아웃 
├── assets/ # 위성(달, 포보스 등) 카드 이미지 자산 
└── src/ 
  ├── app.js # Three.js 3D 렌더링 루프 및 물리/오디오 엔진 
  ├── style.css # 반응형 레이아웃 및 Glassmorphism UI 스타일 
  ├── textures_data.js # NASA 공식 이미지 Base64 인코딩 매핑 테이블 
    └── textures_generator.js # 원격 텍스처 로컬 백업용 자동 다운로드 스크립트
