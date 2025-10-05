
import os
from dotenv import load_dotenv

load_dotenv()
class Config:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    GROQ_MODEL = "llama-3.1-8b-instant"  # Text model for prompts (e.g., llama-3.1-8b-instant or similar)
    VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"  # Vision model for detection
    CLASS_NAMES = ["plastic", "paper", "metal", "organic", "glass", "general"]  # Example; adjust to your classes
    RANDOM_PROMPTS = {
        "default": ["Hold up 3 fingers next to the trash.", "Point to the trash with your foot."],
        "plastic": ["Wave at the plastic bottle.", "Hold the plastic bag upside down."],
        # Add more per class
    }
    VERIFICATION_THRESHOLD = 0.7  # New: Confidence threshold for prompt match
    CONFIDENCE_THRESHOLD = 0.5  # For filtering in postprocessing (if needed)
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png",  '.webp', '.bmp', '.tiff']
