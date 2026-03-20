from fastapi import APIRouter, File, UploadFile, HTTPException
from ultralytics import YOLO
from PIL import Image
import io

# 1. 라우터(멀티탭) 초기화
# prefix를 설정해두면 이 파일 안의 모든 주소 앞에 자동으로 '/api/meals'가 붙습니다.
router = APIRouter(
    prefix="/api/meals",
    tags=["Meals (음식 인식)"] # Swagger 화면에서 예쁘게 그룹핑 해주는 역할
)

# 2. YOLO 모델 로드
try:
    # 실행은 main.py가 있는 루트 폴더에서 하므로 경로(./model/...)는 그대로 유지합니다.
    model = YOLO('./model/food_3_best.pt')
    print("✅ YOLO 모델 로드 성공 (meals 라우터)!")
except Exception as e:
    print(f"❌ 모델 로드 실패: {e}")

# 3. 영양성분 조회 함수
def get_nutrition_info(food_name: str):
    mock_db = {
        "가리비": {"calories": 88, "carbs": 3.2, "protein": 15.0, "fat": 0.8, "sugar": 0.0},
        "갈비탕": {"calories": 300, "carbs": 10.0, "protein": 25.0, "fat": 15.0, "sugar": 2.0},
        "골드키위": {"calories": 55, "carbs": 14.0, "protein": 1.0, "fat": 0.5, "sugar": 10.0}
    }
    return mock_db.get(food_name, {"calories": 0, "carbs": 0, "protein": 0, "fat": 0, "sugar": 0})

# 4. 이미지 분석 엔드포인트
# prefix가 있으므로 여기는 '/analyze-image'만 적어주면 됩니다.
@router.post("/analyze-image")
async def predict_food(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="이미지 파일만 업로드 가능합니다.")

    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        results = model.predict(image, conf=0.5)
        
        detected_items = []
        for r in results:
            for box in r.boxes:
                cls_idx = int(box.cls[0].item())
                food_name = model.names[cls_idx]
                confidence = round(float(box.conf[0].item()) * 100, 2)
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                
                nutrition = get_nutrition_info(food_name)
                
                detected_items.append({
                    "food_name": food_name,
                    "confidence": confidence,
                    "box": {
                        "x_min": round(x1, 2), "y_min": round(y1, 2),
                        "x_max": round(x2, 2), "y_max": round(y2, 2)
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