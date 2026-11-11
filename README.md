# AI 인생네컷 부스 (AI Photo Booth)

웹캠 기반 다회차 자동 캡처, 외부 생성형 AI 스타일 변환, HTML5 Canvas 4컷 템플릿 렌더링 파이프라인을 구축하는 모노레포 프로젝트입니다.

---

## 1. 프로젝트 구조

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
