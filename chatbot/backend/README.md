# 백엔드 (mealdang-be)

임신성 당뇨(GDM) 환자를 위한 FAQ 챗봇 백엔드입니다.  
FastAPI 기반 REST API + RAG(검색 증강 생성) 파이프라인으로 구성되어 있으며, 규칙 기반 응답과 Gemini LLM 응답을 모두 지원합니다.

---

## 목차

1. [프로젝트 구조](#프로젝트-구조)
2. [기술 스택](#기술-스택)
3. [아키텍처 개요](#아키텍처-개요)
4. [시작하기](#시작하기)
5. [환경 변수](#환경-변수)
6. [API 명세](#api-명세)
7. [RAG 파이프라인](#rag-파이프라인)
8. [FAQ 데이터 수집(Ingest)](#faq-데이터-수집ingest)
9. [의도(Intent) 분류](#의도intent-분류)
10. [응답 생성 방식](#응답-생성-방식)

---

## 프로젝트 구조

```
mealdang-be/
├── main.py                  # FastAPI 앱 진입점, /chat, /health 엔드포인트
├── requirements.txt         # Python 의존성
├── knowledge/
│   ├── faq/
│   │   └── faq.jsonl        # 임신성 당뇨 한국어 FAQ 데이터
│   └── sources.json         # 참고 의료 가이드라인 출처 목록
└── rag/
    ├── __init__.py
    ├── retriever.py         # ChromaDB 벡터 검색
    ├── ingest_faq.py        # FAQ 데이터를 벡터 DB에 인덱싱
    ├── prompt_ko.py         # 텍스트 추출, 의도 분류, 규칙 기반 응답 생성
    ├── gemini_answer.py     # Gemini LLM 응답 생성
    └── utils.py             # 유틸리티 함수
```

---

## 기술 스택

| 구성 요소 | 라이브러리/버전 |
|---|---|
| 웹 프레임워크 | FastAPI 0.128.0 |
| ASGI 서버 | Uvicorn 0.40.0 |
| 데이터 검증 | Pydantic 2.12.5 |
| 벡터 데이터베이스 | ChromaDB 1.5.1 |
| 임베딩 모델 | sentence-transformers 5.2.3 |
| LLM (선택) | google-genai 1.11.0 (Gemini) |
| 수치 연산 | NumPy 2.3.0 |

---

## 아키텍처 개요

```
사용자 메시지
     │
     ▼
[1] smart_extract_ko()      ← 혈당 수치, 시점, 상황 플래그 추출 (regex)
     │
     ▼
[2] detect_intent_ko()      ← 의도 분류 (10가지 카테고리)
     │
     ▼
[3] retrieve_evidence()     ← ChromaDB 벡터 유사도 검색 (Top-K FAQ)
     │
     ▼
[4] 응답 생성
     ├─ USE_GEMINI=true  → render_answer_with_gemini()  (Gemini 2.5 Flash)
     └─ USE_GEMINI=false → build_answer_ko()            (규칙 기반 fallback)
     │
     ▼
ChatResponse (answer, intent, parsed, evidence)
```

---

## 시작하기

### 1. 의존성 설치

```bash
pip install -r requirements.txt
```

### 2. FAQ 데이터 벡터 DB에 인덱싱

서버 실행 전, 한 번만 실행하면 됩니다.

```bash
python -m rag.ingest_faq
```

ChromaDB 데이터는 `.chroma/` 디렉터리에 저장됩니다.

### 3. 서버 실행

```bash
uvicorn main:app --reload --port 8000
```

서버가 `http://localhost:8000`에서 실행됩니다.

### 4. 동작 확인

```bash
curl http://localhost:8000/health
```

---

## 환경 변수

| 변수명 | 기본값 | 설명 |
|---|---|---|
| `USE_GEMINI` | `false` | `true`로 설정 시 Gemini LLM 응답 활성화 |
| `GEMINI_API_KEY` | (없음) | Gemini API 키 (`USE_GEMINI=true` 필수) |
| `GEMINI_MODEL` | `gemini-2.5-flash-lite` | 사용할 Gemini 모델 ID |
| `CHROMA_PATH` | `.chroma/` | ChromaDB 저장 경로 |
| `COLLECTION_NAME` | `faq_ko_gdm` | ChromaDB 컬렉션 이름 |
| `EMBED_MODEL` | `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` | 임베딩 모델 |
| `RAG_K` | `6` | 검색 시 반환할 최대 문서 수 |
| `CORS_ALLOW_ORIGINS` | `*` | 허용할 CORS 오리진 (쉼표로 구분) |
| `INGEST_BATCH` | `64` | 인덱싱 배치 크기 |

`.env` 파일 예시:

```env
USE_GEMINI=true
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash-lite
CORS_ALLOW_ORIGINS=http://localhost:3000
```

---

## API 명세

### GET `/health`

서버 상태 및 설정 확인.

**응답 예시:**
```json
{
  "ok": true,
  "ragEnabled": true,
  "rules": "ko_only",
  "hasSystemTLDR": true
}
```

---

### POST `/chat`

챗봇에 메시지를 전송하고 응답을 받습니다.

**요청 본문:**
```json
{
  "message": "식후 1시간 혈당이 160인데 어떻게 해야 하나요?",
  "history": [
    { "role": "user", "content": "이전 메시지" },
    { "role": "assistant", "content": "이전 응답" }
  ]
}
```

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `message` | string | 필수 | 사용자 입력 메시지 |
| `history` | array | 선택 | 이전 대화 내역 (최근 순) |

**응답 본문:**
```json
{
  "answer": "✅ 요약: 식후1시간 160mg/dL → 다음 끼니는 탄수 조절 + 가벼운 활동이 핵심이에요.\n\n🧭 지금 할 일:\n...",
  "intent": "혈당_해석_다음식사",
  "parsed": {
    "glucose_mgdl": 160,
    "timing": "식후1시간",
    "timing_minutes": 60,
    "flags": []
  },
  "evidence": [
    {
      "source": "curated_faq",
      "snippet": "다음 끼니는 정제 탄수 양을 줄이고...",
      "score": 0.87,
      "meta": {}
    }
  ]
}
```

| 필드 | 설명 |
|---|---|
| `answer` | 최종 한국어 응답 텍스트 |
| `intent` | 감지된 사용자 의도 |
| `parsed` | 메시지에서 추출된 혈당·시점·상황 정보 |
| `evidence` | 검색된 FAQ 근거 (최대 3개) |

---

## RAG 파이프라인

### 벡터 검색 (`rag/retriever.py`)

- 임베딩 모델: `paraphrase-multilingual-MiniLM-L12-v2` (다국어 지원)
- 벡터 DB: ChromaDB (로컬 영구 저장)
- 유사도 점수: `score = 1 / (1 + distance)` (0~1, 높을수록 유사)
- 검색 쿼리에는 사용자 메시지 + 의도 힌트 + 파싱된 혈당/시점 정보를 포함

### FAQ 데이터 형식 (`knowledge/faq/faq.jsonl`)

JSONL 형식으로 한 줄에 하나의 FAQ:

```json
{
  "id": "faq_001",
  "question": "식후 1시간 혈당이 135인데 다음 식사는 어떻게 조절해요?",
  "answer": "식후 1시간 혈당이 135mg/dL로 높게 나왔다면...",
  "tags": ["식후", "식후1시간", "다음끼니", "조절"],
  "source": "curated_faq_ko_v1"
}
```

### 참고 출처 (`knowledge/sources.json`)

의료 가이드라인 출처 목록:
- 대한당뇨병학회(KDA) 임상진료지침 2025
- NICE NG3: 임신 중 당뇨 가이드라인

---

## FAQ 데이터 수집(Ingest)

`rag/ingest_faq.py`는 `faq.jsonl`을 읽어 ChromaDB에 벡터 인덱싱합니다.

```bash
# 기본 실행
python -m rag.ingest_faq

# 환경 변수로 경로 변경 가능
CHROMA_PATH=./my_chroma FAQ_PATH=./data/faq.jsonl python -m rag.ingest_faq
```

- 기존 데이터는 upsert 방식으로 업데이트됩니다 (중복 없이).
- 배치 크기는 `INGEST_BATCH` 환경 변수로 조정 가능 (기본 64).

---

## 의도(Intent) 분류

`detect_intent_ko()`는 사용자 메시지를 다음 10가지 의도 중 하나로 분류합니다:

| 의도 | 설명 |
|---|---|
| `저혈당_대처` | 저혈당 증상, 긴급 대처 필요 |
| `혈당_해석_다음식사` | 식후 혈당 수치 해석 및 다음 식사 조절 |
| `공복_혈당` | 공복/아침 혈당 관련 질문 |
| `외식_주문` | 외식, 배달, 식당 메뉴 선택 |
| `간식_선택` | 간식, 빵, 디저트 선택 관련 |
| `운동_전후_혈당` | 운동 전후 혈당 관리 |
| `측정_기록` | 혈당 측정 방법, 기록, CGM |
| `식후_자세_위장` | 식후 자세, 소화, 위장 불편 |
| `카페_음료` | 커피, 음료, 탄산 선택 |
| `일반_FAQ` | 위 분류에 해당하지 않는 일반 질문 |

분류 우선순위: 저혈당(긴급) → 측정 → 상황(외식/간식/운동/자세/음료) → 혈당 수치 → 키워드 fallback

---

## 응답 생성 방식

### 규칙 기반 (`build_answer_ko`, `USE_GEMINI=false`)

파싱된 데이터(혈당 수치, 시점, 의도)를 기반으로 템플릿 응답을 생성합니다.  
대화 이력을 분석해 이전 응답과 중복되지 않는 팁을 선택합니다.

응답 구조:
```
✅ 요약: [한 줄 핵심 요약]

🧭 지금 할 일:
- [행동 1]
- [행동 2]
- [행동 3]

⚠️ 주의:
- [주의 사항]

💡 더 궁금한다면^^:
- [FAQ 근거 요약]

❓ 추가 질문: [맞춤 후속 질문 1개]
```

### Gemini LLM (`render_answer_with_gemini`, `USE_GEMINI=true`)

Gemini 2.5 Flash 모델을 사용해 자연스러운 응답을 생성합니다.  
JSON 스키마 응답 모드를 사용하며, 실패 시 규칙 기반 응답으로 자동 fallback됩니다.

**시스템 프롬프트 핵심 규칙:**
- 반드시 한국어로만 응답
- 의료진 대체 불가, 위험 신호 시 진료 권고
- 내부 메타데이터(FAQ ID, source, score) 노출 금지
- 관련 없는 혈당 수치/상황 혼동 금지
- 짧고 실용적인 응답

---

## 주의 사항

이 서비스는 임신성 당뇨 관련 일반 정보를 제공하며, **의료 진단이나 치료를 대체하지 않습니다.**  
혈당 수치가 목표를 지속적으로 초과하거나 이상 증상이 있을 경우 반드시 담당 의료진과 상담하세요.
