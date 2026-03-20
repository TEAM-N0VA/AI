import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import meals

# 1. FastAPI 앱 초기화
app = FastAPI(title="밀당(Meal-Dang) AI Vision API")

# 프론트/백엔드 통신을 위한 CORS 설정 (접근 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # 실제 배포 시에는 허용할 도메인만 입력하세요
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. 라우터(멀티탭) 연결
# meals.py 안에 있는 router를 가져와서 메인 앱에 꽂아줍니다.
app.include_router(meals.router)

# 4. 서버 실행
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)