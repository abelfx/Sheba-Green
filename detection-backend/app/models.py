from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class DetectionBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float
    confidence: float
    class_id: int
    class_name: str

class DetectionResult(BaseModel):
    detected: bool
    boxes: List[DetectionBox]
    count: int
    image_path: Optional[str] = None

class RandomPrompt(BaseModel):
    prompt: str
    trash_type: str
    action_required: str

class PredictionResponse(BaseModel):
    detection_result: DetectionResult
    random_prompt: Optional[RandomPrompt] = None
    processing_time: float
    image_dimensions: Dict[str, int]

class VerificationResponse(BaseModel):  # New
    verified: bool
    reason: str
    detection_result: DetectionResult  # Includes trash re-detection
    processing_time: float
    image_dimensions: Dict[str, int]
