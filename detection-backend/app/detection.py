import asyncio
import time
import io
import base64
import json
from typing import List, Tuple, Optional

from PIL import Image
from groq import AsyncGroq

from .config import Config
from .models import DetectionResult, DetectionBox


class TrashDetectionService:
    def __init__(self):
        self.config = Config()
        if not self.config.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY not set! Check your .env or export.")
        self.client = AsyncGroq(api_key=self.config.GROQ_API_KEY)
        self.model = self.config.VISION_MODEL  # Updated model

    def _get_class_id(self, class_name: str) -> int:
        names = self.config.CLASS_NAMES
        if isinstance(names, list):
            try:
                return names.index(class_name.lower())
            except ValueError:
                return -1
        elif isinstance(names, dict):
            for idx, name in names.items():
                if name.lower() == class_name.lower():
                    return idx
        return -1

    def _scale_boxes(self, boxes: List[dict], orig_w: int, orig_h: int) -> List[DetectionBox]:
        scaled_boxes = []
        for box in boxes:
            x1 = box.get('x1', 0.0) * orig_w
            y1 = box.get('y1', 0.0) * orig_h
            x2 = box.get('x2', 1.0) * orig_w
            y2 = box.get('y2', 1.0) * orig_h
            confidence = box.get('confidence', 0.0)
            class_name = box.get('class_name', 'unknown').lower()
            class_id = box.get('class_id', self._get_class_id(class_name))

            x1 = max(0.0, min(x1, orig_w - 1))
            y1 = max(0.0, min(y1, orig_h - 1))
            x2 = max(0.0, min(x2, orig_w - 1))
            y2 = max(0.0, min(y2, orig_h - 1))

            if confidence >= self.config.CONFIDENCE_THRESHOLD:
                scaled_boxes.append(
                    DetectionBox(
                        x1=x1,
                        y1=y1,
                        x2=x2,
                        y2=y2,
                        confidence=confidence,
                        class_id=class_id,
                        class_name=class_name,
                    )
                )
        return scaled_boxes


    async def detect_trash(self, image_bytes: bytes) -> Tuple[DetectionResult, float]:
        start_time = time.time()
        try:
            image = Image.open(io.BytesIO(image_bytes))
            orig_w, orig_h = image.size

            if image.format != 'JPEG':
                image = image.convert('RGB')
            buffer = io.BytesIO()
            image.save(buffer, format='JPEG', quality=85)
            image_bytes_jpeg = buffer.getvalue()
            base64_image = base64.b64encode(image_bytes_jpeg).decode('utf-8')

            # Enhanced prompt with stricter directive and example
            class_info = ", ".join([f"{i}: {name}" for i, name in enumerate(self.config.CLASS_NAMES)])
            prompt_text = f"""
            You are a precise trash detection AI using Llama 4. Analyze the image ONLY for waste items from this exact list: {class_info}.
            For each detected item, assign the correct class_name and class_id from the list (e.g., 0: plastic, 1: paper). If unsure, use 'unknown' with class_id -1.
            Provide bounding boxes (normalized 0-1: x1=left, y1=top, x2=right, y2=bottom) and confidence (0.0-1.0).
            Output EXACTLY this JSON format, nothing else:
            {{"detected": true/false, "boxes": [{{"x1": 0.1, "y1": 0.2, "x2": 0.3, "y2": 0.4, "confidence": 0.85, "class_id": 0, "class_name": "plastic"}}, ...], "count": int}}
            If no trash: {{"detected": false, "boxes": [], "count": 0}}
            Example for plastic bag: {{"x1": 0.05, "y1": 0.1, "x2": 0.15, "y2": 0.3, "confidence": 0.9, "class_id": 0, "class_name": "plastic"}}
            """

            content = [
                {"type": "text", "text": prompt_text},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
            ]

            response = await self.client.chat.completions.create(
                messages=[{"role": "user", "content": content}],
                model=self.model,
                temperature=0.1,
                max_tokens=1024,
                response_format={"type": "json_object"}
            )

            detect_dict = json.loads(response.choices[0].message.content.strip())

            detected = detect_dict.get('detected', False)
            raw_boxes = detect_dict.get('boxes', [])
            count = len(raw_boxes)
            boxes = []
            for box in raw_boxes:
                # Post-process to enforce class mapping if "unknown"
                class_name = box.get('class_name', 'unknown').lower()
                class_id = box.get('class_id', -1)
                if class_name == 'unknown' and 0 <= class_id < len(self.config.CLASS_NAMES):
                    class_name = self.config.CLASS_NAMES[class_id]  # Map based on class_id
                elif class_name not in self.config.CLASS_NAMES and class_id != -1:
                    class_name = self.config.CLASS_NAMES[class_id]  # Override if mismatch

                # Scale boxes
                x1 = box.get('x1', 0.0) * orig_w
                y1 = box.get('y1', 0.0) * orig_h
                x2 = box.get('x2', 1.0) * orig_w
                y2 = box.get('y2', 1.0) * orig_h
                confidence = box.get('confidence', 0.0)

                x1 = max(0.0, min(x1, orig_w - 1))
                y1 = max(0.0, min(y1, orig_h - 1))
                x2 = max(0.0, min(x2, orig_w - 1))
                y2 = max(0.0, min(y2, orig_h - 1))

                if confidence >= self.config.CONFIDENCE_THRESHOLD:
                    boxes.append(
                        DetectionBox(
                            x1=x1,
                            y1=y1,
                            x2=x2,
                            y2=y2,
                            confidence=confidence,
                            class_id=class_id,
                            class_name=class_name,
                        )
                    )

            processing_time = time.time() - start_time
            print(f"Detection completed in {processing_time:.2f}s with {len(boxes)} boxes")
            return (
                DetectionResult(detected=detected and len(boxes) > 0, boxes=boxes, count=count, image_path=None),
                processing_time,
            )
        except Exception as exc:
            print(f"Detection error: {exc}")
            return DetectionResult(detected=False, boxes=[], count=0, image_path=None), time.time() - start_time

    async def verify_prompt(self, image_bytes: bytes, user_prompt: str) -> Tuple[bool, str, DetectionResult, float]:
        """Verify if image matches the user prompt (action + trash presence)."""
        start_time = time.time()
        try:
            # Step 1: Re-detect trash in the verification image
            detection_result, _ = await self.detect_trash(image_bytes)
            if not detection_result.detected:
                return False, "No trash detected in verification image.", detection_result, time.time() - start_time

            # Step 2: Prepare image for verification
            image = Image.open(io.BytesIO(image_bytes))
            orig_w, orig_h = image.size
            if image.format != 'JPEG':
                image = image.convert('RGB')
            buffer = io.BytesIO()
            image.save(buffer, format='JPEG', quality=85)
            image_bytes_jpeg = buffer.getvalue()
            base64_image = base64.b64encode(image_bytes_jpeg).decode('utf-8')

            # Step 3: Verification prompt (based on VLM best practices: clear query, JSON output)
            verify_text = f"""
            You are a verification AI. Check if this image exactly matches the following description: '{user_prompt}'.
            The image must show trash/waste items AND the specified action (e.g., holding fingers, pointing).
            Be strict: If the action is not clearly visible or trash is missing, fail.
            Output JSON: {{"matches": bool, "confidence": float (0-1), "reason": str (brief explanation)}}
            Example: {{"matches": true, "confidence": 0.9, "reason": "Image shows user holding 3 fingers next to a trash bag."}}
            """

            content = [
                {"type": "text", "text": verify_text},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
            ]

            response = await self.client.chat.completions.create(
                messages=[{"role": "user", "content": content}],
                model=self.model,
                temperature=0.2,  # Slightly higher for reasoning, but low for consistency
                max_tokens=512,
                response_format={"type": "json_object"}
            )

            verify_dict = json.loads(response.choices[0].message.content.strip())
            matches = verify_dict.get('matches', False)
            confidence = verify_dict.get('confidence', 0.0)
            reason = verify_dict.get('reason', "No reason provided.")

            # Pass if matches and confidence above threshold
            verified = matches and confidence >= self.config.VERIFICATION_THRESHOLD
            processing_time = time.time() - start_time
            return verified, reason, detection_result, processing_time

        except Exception as exc:
            print(f"Verification error: {exc}")
            return False, f"Error during verification: {str(exc)}", DetectionResult(detected=False, boxes=[], count=0), time.time() - start_time
