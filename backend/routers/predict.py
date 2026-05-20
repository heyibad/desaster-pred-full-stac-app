import io
from pathlib import Path
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from PIL import Image
from ultralytics import YOLO
from models import User
from routers.auth import get_current_user

router = APIRouter(prefix="/predict", tags=["predict"])

BASE_DIR = Path(__file__).resolve().parents[1]
MODEL_PATH = BASE_DIR / "best_disaster_classifier.pt"

_model = None


def get_model() -> YOLO:
    global _model
    if _model is None:
        _model = YOLO(str(MODEL_PATH))
    return _model


@router.post("")
def predict_disaster(
    file: UploadFile = File(...),
    _: User = Depends(get_current_user),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Upload an image file")

    image_bytes = file.file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    model = get_model()
    results = model(image)
    result = results[0]

    if not result.probs:
        raise HTTPException(status_code=500, detail="Model did not return probabilities")

    names = result.names
    probs = result.probs.data.tolist()

    predictions = [
        {"class_name": names[i], "confidence": float(prob) * 100}
        for i, prob in enumerate(probs)
    ]
    predictions.sort(key=lambda item: item["confidence"], reverse=True)

    return {
        "top": predictions[0],
        "predictions": predictions,
    }
