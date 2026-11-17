# 인생네컷 포토부스 (AI Photo Booth)

웹캠 기반 4컷 자동 촬영, 4컷 각각에 맞춤형 AI 컨셉/스타일(3D 픽사 애니, 수채화, 시네마틱 스포트라이트 등) 개별 적용, 6종 맞춤형 프레임 템플릿(빈티지 필름 및 치이카와·우사기·하치와레 캐릭터 에디션), HTML5 Canvas 고해상도 합성 및 인쇄/QR 공유 파이프라인을 갖춘 풀스택 모노레포 프로젝트입니다.

---

## 1. 4컷 AI 맞춤 컨셉 & 스타일 (총 8종 + 추천 콤보)

각 슬롯(1~4번 컷)마다 원하는 컨셉을 독립적으로 지정할 수 있습니다:
1. **원본 실사 (ORIGINAL)**: 촬영 원본 그대로 선명한 화질과 자연스러운 분위기 유지
2. **3D 애니메이션 (DISNEY_3D)**: 디즈니·픽사 3D 캐릭터 애니메이션 (동글동글한 얼굴과 생동감 넘치는 렌더링)
3. **수채화 회화 (WATERCOLOR)**: 은은한 물감 번짐과 감성적인 붓터치의 인상주의 유채화 화풍
4. **시네마틱 스포트라이트 (SPOTLIGHT)**: 밤하늘 보름달 아래 무대 위에서 쏟아지는 웅장한 핀조명 효과
5. **지브리 애니메이션 (GHIBLI)**: 미야자키 하야오 감성의 따뜻한 파스텔 톤 손그림 셀 작화
6. **레트로 팝아트 코믹 (RETRO_COMIC)**: 굵은 외곽선과 망점 하프톤 패턴의 빈티지 미국 만화책
7. **사이버펑크 네온 (CYBERPUNK)**: 미래 지향적인 사이안 & 마젠타 네온 글로우 비주얼
8. **K-웹툰 작화 (KOREAN_WEBTOON)**: 초롱초롱한 눈망울과 트렌디한 디지털 라인아트 웹툰 화풍

### 🌟 추천 콤보 프리셋 (원클릭 세트)
- **📸 예시 인화물 맞춤 콤보**: [1컷: 원본 실사] + [2컷: 3D 애니메이션] + [3컷: 수채화 회화] + [4컷: 시네마틱 스포트라이트]
- **🧸 3D 픽사 애니 올인원**: 4컷 모두 귀여운 3D 픽사 캐릭터로 일괄 변환
- **🎨 아트 갤러리 에디션**: 원본 + 지브리 + 수채화 + 팝아트의 다채로운 조합
- **🎬 시네마틱 드라마틱 세트**: 원본 + 3D 애니 + 사이버펑크 + 스포트라이트

---

## 2. 프레임 테마 (총 6종)
1. **블랙 빈티지 필름 (UNFOLD 2010TX, 2x2)**: 필름 엣지 텍스처 및 미니멀 블랙 감성
2. **화이트 클린 필름 (KODAK PORTRA 400, 2x2)**: 코닥 감성의 깔끔한 화이트 프레임
3. **하치와레 블루 4컷 (Hachiware 1x4)**: 귀여운 하치와레 캐릭터 스티커 오버레이
4. **우사기 옐로우 4컷 (Usagi 1x4)**: 사랑스러운 우사기 캐릭터 & 별빛 스티커 오버레이
5. **치이카와 & 하치와레 블랙 스트립 (1x4)**: 상하단 캐릭터 일러스트 오버레이
6. **우사기 스타 폴라로이드 4컷 콜라주**: 틸트 폴라로이드 4컷 감성 배치

> 모든 프레임은 프레임 테두리와 캐릭터 일러스트가 사진 위에 자연스럽게 얹혀지는 정밀 투명 레이어링(Photo-under-Frame) 구조로 렌더링됩니다.

---

## 3. 프로젝트 구조

```text
photo4cut/
├── frontend/                     # React (Vite)
│   ├── public/
│   │   └── frames/               # 인생네컷 오버레이 템플릿 PNG/SVG
│   ├── src/
│   │   ├── api/                  # Axios 클라이언트 (4컷 개별 스타일 API)
│   │   ├── components/           # UI 컴포넌트 (CameraView, StyleSelector, PhotoStrip)
│   │   ├── constants/            # frames.js, styles.js (8개 스타일 & 추천 콤보)
│   │   ├── hooks/                # 커스텀 훅 (useWebcam)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── backend/                      # Spring Boot 3.2.4 (Java 17)
    ├── src/
    │   └── main/
    │       ├── java/com/booth/ai/
    │       │   ├── controller/   # PhotoController (개별/일괄 변환, QR/인쇄)
    │       │   ├── service/      # AiTransformService (병렬 비동기 AI 스타일 변환)
    │       │   ├── domain/       # StylePreset (프롬프트 & 네거티브 정의)
    │       │   ├── config/       # WebConfig, CORS
    │       │   └── dto/          # TransformRequest(styles 배열), TransformResponse
    │       └── resources/
    │           ├── application.yml
    └── build.gradle
```

---

## 4. 실행 방법

### 백엔드 기동
```bash
cd backend
./gradlew bootRun
```
- 서버 포트: `http://localhost:8080`

### 프론트엔드 기동
```bash
cd frontend
npm install
npm run dev
```
- 클라이언트 포트: `http://localhost:3000` (백엔드 `/api` 프록시 연동)

---

## 5. 클라우드 프로덕션 배포 (Vercel + Oracle Cloud Free Tier)

자세한 배포 절차 및 스크립트는 **[DEPLOY_GUIDE.md](file:///E:/sazu/photo4cut/DEPLOY_GUIDE.md)**를 참고하세요.

- **프론트엔드 (Vercel)**:
  - Root Directory: `frontend`
  - 환경변수: `VITE_API_BASE_URL=https://<오라클공인IP>.nip.io`
- **백엔드 (Oracle Cloud Free Tier)**:
  - Docker Compose + Nginx 리버스 프록시 + Let's Encrypt SSL(HTTPS)
  - 원클릭 초기화 스크립트: `./setup-oracle.sh`
  - 원클릭 SSL 발급 및 구동: `./setup-ssl.sh <도메인> <이메일>`

