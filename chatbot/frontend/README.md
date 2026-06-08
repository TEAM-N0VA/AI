# 프론트엔드 (mealdang-fe)

임신성 당뇨(GDM) FAQ 챗봇 **밀당**의 모바일 앱입니다.  
React Native + Expo 기반으로 iOS, Android, 웹을 모두 지원합니다.

---

## 목차

1. [프로젝트 구조](#프로젝트-구조)
2. [기술 스택](#기술-스택)
3. [시작하기](#시작하기)
4. [환경 변수](#환경-변수)
5. [화면 구성](#화면-구성)
6. [주요 컴포넌트](#주요-컴포넌트)
7. [API 연동](#api-연동)

---

## 프로젝트 구조

```
mealdang-fe/
├── app/
│   ├── _layout.tsx          # 루트 레이아웃 (네비게이션 설정)
│   ├── index.tsx            # 홈 화면 (앱 진입점)
│   ├── faq-chat.tsx         # FAQ 챗 화면 (핵심 기능)
│   ├── modal.tsx            # 모달 화면
│   └── (tabs)/              # 탭 네비게이션
│       ├── _layout.tsx
│       ├── index.tsx
│       └── explore.tsx
├── components/
│   ├── ChatBubble.tsx       # 채팅 말풍선 (user / assistant)
│   ├── EvidenceCard.tsx     # FAQ 근거 카드 (접기/펼치기)
│   └── ui/                  # 공통 UI 컴포넌트
├── lib/
│   ├── api.ts               # 백엔드 API 호출 함수
│   └── types.ts             # 공유 타입 정의
├── constants/
│   └── theme.ts             # 색상/디자인 상수
├── hooks/                   # 커스텀 훅
├── assets/                  # 이미지, 폰트 등 정적 파일
├── app.json                 # Expo 앱 설정
├── package.json
└── tsconfig.json
```

---

## 기술 스택

| 구성 요소 | 라이브러리/버전 |
|---|---|
| 프레임워크 | Expo ~54.0 |
| UI | React Native 0.81.5, React 19.1 |
| 라우팅 | expo-router ~6.0 (파일 기반) |
| 네비게이션 | @react-navigation/bottom-tabs ^7.4 |
| 애니메이션 | react-native-reanimated ~4.1 |
| 그라디언트 | expo-linear-gradient ~15.0 |
| 아이콘 | @expo/vector-icons ^15.0 |
| 언어 | TypeScript ~5.9 |

---

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 백엔드 서버 실행 확인

앱을 실행하기 전에 백엔드(`mealdang-be`)가 실행 중인지 확인하세요.  
기본 주소: `http://192.168.1.175:8000`  
변경이 필요하면 [환경 변수](#환경-변수)를 참고하세요.

### 3. 앱 실행

```bash
# 기본 (QR 코드 + 개발 서버)
npm start

# iOS 시뮬레이터
npm run ios

# Android 에뮬레이터
npm run android

# 웹 브라우저
npm run web
```

### 4. 실기기에서 실행

Expo Go 앱을 설치하고 터미널에 표시된 QR 코드를 스캔하세요.  
실기기와 개발 PC가 **같은 Wi-Fi 네트워크**에 있어야 합니다.

---

## 환경 변수

별도 설정 없이 QR 코드 스캔만으로 같은 Wi-Fi의 모든 기기에서 자동으로 동작합니다.

`lib/api.ts`의 `getBaseUrl()`은 다음 순서로 백엔드 주소를 결정합니다:

1. **`EXPO_PUBLIC_API_BASE_URL`** 환경 변수가 있으면 그 값을 사용
2. **`Constants.expoConfig.hostUri`** — Expo가 QR 코드에 담는 LAN IP에서 자동 추출
3. **Fallback** — `http://127.0.0.1:8000` (웹 브라우저용)

IP를 직접 지정하고 싶을 때만 `.env.local`을 생성하세요:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:8000
```

> **Android 에뮬레이터**를 사용하는 경우: `EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8000`

---

## 화면 구성

### 홈 화면 (`app/index.tsx`)

앱 진입 화면입니다.

- 앱 이름 **밀당** 및 소개 문구 표시
- **FAQ 챗 시작하기** 버튼으로 챗 화면 이동
- 사용 팁 안내 (예: "식후 1시간 145", "공복 102")

### FAQ 챗 화면 (`app/faq-chat.tsx`)

핵심 기능 화면입니다.

- **빠른 질문 칩(Quick Chips):** 자주 묻는 질문을 버튼 한 번으로 전송
  - 식후 1시간/2시간 혈당, 공복 혈당, 외식 팁, 간식 추천 등
- **채팅 인터페이스:** 메시지 입력 → 전송 → 봇 응답 순으로 표시
- **자동 스크롤:** 새 메시지 수신 시 목록 하단으로 이동
- **로딩 상태:** 응답 대기 중 버튼에 스피너 표시
- **에러 처리:** 네트워크 오류 시 안내 메시지 출력

---

## 주요 컴포넌트

### `ChatBubble` (`components/ChatBubble.tsx`)

채팅 말풍선 컴포넌트입니다.

| prop | 타입 | 설명 |
|---|---|---|
| `role` | `"user" \| "assistant"` | 메시지 발신자 |
| `text` | `string` | 메시지 내용 |

- `user`: 오른쪽 정렬, 어두운 배경(`#2B2F3A`)
- `assistant`: 왼쪽 정렬, 흰 배경

### `EvidenceCard` (`components/EvidenceCard.tsx`)

챗봇 응답의 FAQ 근거를 접기/펼치기로 보여주는 카드입니다.

| prop | 타입 | 설명 |
|---|---|---|
| `evidence` | `Evidence[]` | 검색된 FAQ 근거 목록 |

- 최대 3개의 근거 표시
- 각 근거에 출처, 발췌문, 유사도 점수(score) 포함
- `evidence`가 없으면 렌더링하지 않음

---

## API 연동

`lib/api.ts`에서 백엔드와 통신합니다.

### `health()`

백엔드 상태 확인.

```ts
const status = await health();
// { ok: true, ragEnabled: true, ... }
```

### `chat(message, history)`

챗봇에 메시지 전송.

```ts
const res = await chat("식후 1시간 145인데 다음 식사는?", historyArray);
// res.answer   — 한국어 응답 텍스트
// res.intent   — 감지된 의도
// res.parsed   — 추출된 혈당/시점 정보
// res.evidence — FAQ 근거 목록
```

타입 정의는 `lib/types.ts` 참고:

```ts
type ChatMsg      = { role: "user" | "assistant"; content: string }
type Evidence     = { source?: string; snippet?: string; score?: number; meta?: Record<string, any> }
type ChatResponse = { answer: string; intent: string; parsed: Record<string, any>; evidence: Evidence[] }
```
