import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import io

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

# 2. YOLO 모델 메모리 로드 (서버 구동 시 1번만 실행)
# 드라이브에 저장해둔 'food_3_best.pt' 파일을 서버의 같은 폴더로 옮겨두어야 합니다.
try:
    model = YOLO('./model/food_3_best.pt')
    print("✅ YOLO 모델 로드 성공!")
except Exception as e:
    print(f"❌ 모델 로드 실패: {e}")

# 3. 영양성분 조회 함수 (작성하신 공공데이터/CSV 로직 통합)
def get_nutrition_info(food_name: str):
    # TODO: 올려주신 CSV 데이터프레임 검색 로직이나 공공 API(getFoodNtrCpntDbInq02) 연동 코드를 여기에 넣습니다.
    # 아래는 프론트엔드 개발자들이 당장 화면을 그릴 수 있게 해주는 임시(Mock) 데이터입니다.
    mock_db = {
        "가리비": {"calories": 88, "carbs": 3.2, "protein": 15.0, "fat": 0.8, "sugar": 0.0},
        "갈비탕": {"calories": 300, "carbs": 10.0, "protein": 25.0, "fat": 15.0, "sugar": 2.0},
        "골드키위": {"calories": 55, "carbs": 14.0, "protein": 1.0, "fat": 0.5, "sugar": 10.0}
    }
    return mock_db.get(food_name, {"calories": 0, "carbs": 0, "protein": 0, "fat": 0, "sugar": 0})

# 4. 이미지 분석 엔드포인트 (POST 요청)
@app.post("/api/meals/analyze-image")
async def predict_food(file: UploadFile = File(...)):
    # 확장자 검사
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="이미지 파일만 업로드 가능합니다.")

    try:
        # 서버 하드디스크에 사진을 저장하지 않고 메모리 위에서 바로 읽어 속도를 높입니다.
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # YOLO 추론 (신뢰도 50% 이상만 추출)
        results = model.predict(image, conf=0.5)
        
        detected_items = []
        
        for r in results:
            for box in r.boxes:
                # 클래스 인덱스와 이름 추출
                cls_idx = int(box.cls[0].item())
                food_name = model.names[cls_idx]
                confidence = round(float(box.conf[0].item()) * 100, 2)
                
                # Bounding Box 좌표 (프론트에서 사진 위에 네모를 그릴 때 사용)
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                
                # 영양성분 매핑
                nutrition = get_nutrition_info(food_name)
                
                detected_items.append({
                    "food_name": food_name,
                    "confidence": confidence,
                    "box": {
                        "x_min": round(x1, 2),
                        "y_min": round(y1, 2),
                        "x_max": round(x2, 2),
                        "y_max": round(y2, 2)
                    },
                    "nutrition": nutrition
                })

        return {
            "status": "success",
            "message": f"총 {len(detected_items)}개의 음식을 인식했습니다.",
            "data": detected_items
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"이미지 처리 중 서버 오류 발생: {str(e)}")

# 실행 명령어: 터미널에서 uvicorn main:app --reload 입력
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)