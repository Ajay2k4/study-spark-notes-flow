
import openai
import base64
import httpx
from app.config import settings
from typing import Optional

openai.api_key = settings.OPENAI_API_KEY


async def generate_image_for_concept(concept: str, style: str = "educational diagram") -> Optional[str]:
    """Generate an image for a flashcard concept using DALL-E"""
    try:
        prompt = f"{concept} as a {style}, minimalist, clear, educational illustration"
        
        response = await openai.images.generate(
            model="dall-e-3",
            prompt=prompt,
            n=1,
            size="1024x1024",
            quality="standard",
            response_format="url"
        )
        
        # Return the URL of the generated image
        return response.data[0].url
    
    except Exception as e:
        print(f"Error generating image: {str(e)}")
        # Return None if image generation fails
        return None


async def generate_image_with_huggingface(prompt: str) -> Optional[str]:
    """Generate an image using a Hugging Face model as fallback"""
    try:
        API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"
        headers = {"Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}"}
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                API_URL,
                headers=headers,
                json={"inputs": prompt},
                timeout=30.0
            )
            
            if response.status_code != 200:
                print(f"Error from Hugging Face API: {response.text}")
                return None
                
            # The response should be the image bytes
            image_bytes = response.content
            
            # Convert to base64 for storage or return
            base64_image = base64.b64encode(image_bytes).decode('utf-8')
            return f"data:image/jpeg;base64,{base64_image}"
    
    except Exception as e:
        print(f"Error generating image with Hugging Face: {str(e)}")
        return None
