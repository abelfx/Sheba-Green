import random
import asyncio
from typing import List, Optional
from groq import AsyncGroq
from .config import Config
from .models import RandomPrompt

class PromptGenerator:
    def __init__(self):
        self.client = AsyncGroq(api_key=Config.GROQ_API_KEY)
        self.config = Config()
    
    def get_random_prompt(self, detected_classes: List[str]) -> RandomPrompt:
        """Get a random prompt based on detected trash types"""
        if not detected_classes:
            trash_type = "general"
            prompts = self.config.RANDOM_PROMPTS["default"]
        else:
            # Use the most confident detection
            trash_type = detected_classes[0]
            prompts = self.config.RANDOM_PROMPTS.get(
                trash_type, 
                self.config.RANDOM_PROMPTS["default"]
            )
        
        selected_prompt = random.choice(prompts)
        
        return RandomPrompt(
            prompt=selected_prompt,
            trash_type=trash_type,
            action_required="photo_verification"
        )
    
    async def generate_dynamic_prompt(self, detected_classes: List[str], context: str = "") -> RandomPrompt:
        """Generate a dynamic prompt using Groq API"""
        try:
            trash_items = ", ".join(detected_classes) if detected_classes else "general waste"
            
            system_prompt = f"""
                You are a waste management verification assistant. Generate a short, clear action prompt 
                for users to verify they are at the location with the detected trash: {trash_items}.
                
                The prompt should:
                1. Be max 10 words
                2. Include a simple physical action (pointing, holding fingers, gesturing)
                3. Be safe and appropriate
                4. Help verify the user is actually there
                
                Examples:
                - "Point to the bottle with your left hand"
                - "Hold up 2 fingers next to the trash"
                - "Wave at the plastic bag"
                
                Respond with just the prompt text, nothing else.
            """
            
            response = await self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Generate verification prompt for: {trash_items}"}
                ],
                model=Config.GROQ_MODEL,
                temperature=0.8,
                max_tokens=50
            )
            
            generated_prompt = response.choices[0].message.content.strip()
            
            return RandomPrompt(
                prompt=generated_prompt,
                trash_type=trash_items,
                action_required="photo_verification"
            )
            
        except Exception as e:
            print(f"Error generating dynamic prompt: {e}")
            # Fallback to random prompt
            return self.get_random_prompt(detected_classes)
