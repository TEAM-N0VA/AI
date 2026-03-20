# 🩸밀당 - AI
임신성 당뇨 산모를 위한 YOLO 활용한 식단 자동 기록 및 RAG 기반 식단 코칭 서비스 **밀당의 AI 서버 리포지토리**입니다.  
음식 이미지 객체 인식, 챗봇 API를 제공합니다.

---
## 📁 폴더 구조
```bash
AI
├── main.py             # FastAPI 메인 실행 파일 및 설정
├── routers/            # AI 기능별 API 라우터
│   ├── meals.py        # YOLO 음식 객체 인식 및 영양성분 반환 API
│   ├── recommend.py    # 사용자 맞춤 식당 추천 API
│   └── chat.py         # 챗봇 대화 생성 API
├── model/              # AI 모델 폴더 (gitignore 처리)
│   └── food_3_best.pt  # YOLO 모델 파일
└── requirements.txt    # 파이썬 패키지 의존성 목록
```

---
## 🚀 실행 방법

### 1️⃣ 실행 환경
* Python: v3.10.x 권장

### 2️⃣ 저장소 클론
```bash
git clone https://github.com/TEAM-N0VA/AI.git
cd AI
```

### 3️⃣ 가상환경 생성 및 활성화
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### 4️⃣ 패키지 설치
```bash
pip install -r requirements.txt
```

### 5️⃣ 환경 변수 및 모델 파일 준비
* `.env` 파일 생성 후 필요한 값 채워넣기 (추후 팀 노션 또는 카톡 참고)
* 모델 실행을 위해 `model/` 폴더 내에 모델 파일 배치 (구글 드라이브 참고)
  
### 6️⃣ 서버 실행
```bash
uvicorn main:app --reload
```

---
## 🌿 브랜치 전략
* main : 배포용
* develop : 개발 통합
* feature/기능명 : 기능 개발
