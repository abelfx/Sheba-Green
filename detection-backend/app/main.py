from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import os
from pathlib import Path
from PIL import Image
import io

from .detection import TrashDetectionService
from .prompt_generator import PromptGenerator
from .models import PredictionResponse, DetectionResult, RandomPrompt, VerificationResponse
from .config import Config

app = FastAPI(
    title="Trash Detection API",
    description="API for detecting trash in images with random verification prompts",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

detection_service = TrashDetectionService()
prompt_generator = PromptGenerator()
config = Config()

@app.on_event("startup")
async def startup_event():
    print("Starting Trash Detection API...")

@app.get("/")
async def root():
    return {"message": "Trash Detection API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "trash-detection-api"}

def validate_image(file: UploadFile) -> None:
    if file.size > config.MAX_FILE_SIZE:
        raise HTTPException(413, f"File too large. Maximum size: {config.MAX_FILE_SIZE} bytes")
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in config.ALLOWED_EXTENSIONS:
        raise HTTPException(415, f"Unsupported file type. Allowed: {config.ALLOWED_EXTENSIONS}")

@app.post("/predict", response_model=PredictionResponse)
async def predict_trash(
    file: UploadFile = File(...),
    use_dynamic_prompt: bool = False
):
    try:
        validate_image(file)
        print("Image Validated")
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes))
        image_dimensions = {"width": image.width, "height": image.height}
        print("images dimension", image_dimensions)
        detection_result, processing_time = await detection_service.detect_trash(image_bytes)
        print("Detection result", detection_result)

        random_prompt = None
        if detection_result.detected:
            detected_classes = [box.class_name for box in detection_result.boxes]
            if use_dynamic_prompt:
                random_prompt = await prompt_generator.generate_dynamic_prompt(detected_classes)
            else:
                random_prompt = prompt_generator.get_random_prompt(detected_classes)
        
        return PredictionResponse(
            detection_result=detection_result,
            random_prompt=random_prompt,
            processing_time=processing_time,
            image_dimensions=image_dimensions
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Processing error: {str(e)}")

@app.post("/verify", response_model=VerificationResponse)  # New endpoint
async def verify_trash_prompt(
    file: UploadFile = File(...),
    prompt: str = Form(...)  # Prompt from previous /predict
):
    try:
        validate_image(file)
        print("Verification Image Validated")
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes))
        image_dimensions = {"width": image.width, "height": image.height}
        print("Verification image dimensions", image_dimensions)

        verified, reason, detection_result, processing_time = await detection_service.verify_prompt(image_bytes, prompt)
        print("Verification result:", verified, reason)

        return VerificationResponse(
            verified=verified,
            reason=reason,
            detection_result=detection_result,
            processing_time=processing_time,
            image_dimensions=image_dimensions
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Verification error: {str(e)}")

@app.post("/random-prompt")
async def get_random_prompt_only(trash_types: list[str] = None):
    try:
        if trash_types is None:
            trash_types = []
        prompt = prompt_generator.get_random_prompt(trash_types)
        return {"random_prompt": prompt}
    except Exception as e:
        raise HTTPException(500, f"Error generating prompt: {str(e)}")

@app.get("/classes")
async def get_supported_classes():
    return {"classes": config.CLASS_NAMES}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
