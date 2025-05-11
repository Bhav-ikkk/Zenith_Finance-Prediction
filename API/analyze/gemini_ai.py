import google.generativeai as genai
from fastapi import HTTPException
import logging
import asyncio

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def configure_gemini():
    api_key = "AIzaSyDiXZ7GlJ2xh316b0zYrNs5XD9TIRZ7uyI"
    if not api_key:
        logger.error("GEMINI_API_KEY not set")
        raise HTTPException(status_code=500, detail="Gemini API key not configured")
    genai.configure(api_key=api_key)

async def ask_gemini(prompt: str, max_tokens: int = 300) -> str:
    try:
        configure_gemini()
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = await asyncio.wait_for(
            asyncio.to_thread(model.generate_content, prompt, generation_config={"max_output_tokens": max_tokens}),
            timeout=30.0
        )
        logger.debug("Gemini response: %s", response.text)
        return response.text.strip()
    except asyncio.TimeoutError:
        logger.error("Gemini API call timed out")
        raise HTTPException(status_code=504, detail="Gemini API call timed out")
    except Exception as e:
        logger.error("Gemini API call failed: %s", str(e))
        raise HTTPException(status_code=500, detail=f"Gemini API call failed: {str(e)}")