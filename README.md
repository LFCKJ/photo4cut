# 인생네컷 포토부스 (Photo Booth)

웹캠 기반 4컷 자동 촬영, 6종 맞춤형 프레임 템플릿(빈티지 필름 및 치이카와·우사기·하치와레 캐릭터 에디션), HTML5 Canvas 고해상도 합성 및 인쇄/QR 공유 파이프라인을 갖춘 풀스택 모노레포 프로젝트입니다.

---

## 1. 프레임 테마 (총 6종)
1. **블랙 빈티지 필름 (UNFOLD 2010TX, 2x2)**: 필름 엣지 텍스처 및 미니멀 블랙 감성
2. **화이트 클린 필름 (KODAK PORTRA 400, 2x2)**: 코닥 감성의 깔끔한 화이트 프레임
3. **하치와레 블루 4컷 (Hachiware 1x4)**: 귀여운 하치와레 캐릭터 스티커 오버레이
4. **우사기 옐로우 4컷 (Usagi 1x4)**: 사랑스러운 우사기 캐릭터 & 별빛 스티커 오버레이
5. **치이카와 & 하치와레 블랙 스트립 (1x4)**: 상하단 캐릭터 일러스트 오버레이
6. **우사기 스타 폴라로이드 4컷 콜라주**: 틸트 폴라로이드 4컷 감성 배치

> 모든 프레임은 프레임 테두리와 캐릭터 일러스트가 사진 위에 자연스럽게 얹혀지는 정밀 투명 레이어링(Photo-under-Frame) 구조로 렌더링됩니다.

---

## 2. 프로젝트 구조

```text
photo4cut/
├── frontend/                     # React (Vite)
│   ├── public/
│   │   └── frames/               # 인생네컷 오버레이 템플릿 PNG/SVG
│   ├── src/
│   │   ├── api/                  # Axios 클라이언트 및 엔드포인트 정의
│   │   ├── assets/
│   │   ├── components/           # UI 컴포넌트 (CameraView, PhotoStrip, StyleSelector)
│   │   ├── hooks/                # 커스텀 훅 (useWebcam)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── backend/                      # Spring Boot 3.2.4 (Java 17)
    ├── src/
    │   └── main/
    │       ├── java/com/booth/ai/
    │       │   ├── controller/   # 이미지 수신 및 변환 요청 엔드포인트
    │       │   ├── service/      # AI API 호출(WebClient) 및 파일 I/O
    │       │   ├── config/       # WebClient, CORS 설정
    │       │   └── dto/          # 요청/응답 페이로드 DTO
    │       └── resources/
    │           ├── application.yml
    │           └── application-secret.yml
    ├── build.gradle
    └── settings.gradle
```

---

## 2. 기술 스택

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS
- **Libraries**: `react-webcam`, `axios`, `lucide-react`, `canvas-confetti`

### Backend
- **Framework**: Spring Boot 3.2.4 (Java 17)
- **Build Tool**: Gradle 8.7
- **Dependencies**: `spring-boot-starter-web`, `spring-boot-starter-webflux` (WebClient), `spring-boot-starter-validation`, `lombok`

---

## 3. 실행 방법

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
