from transformers import pipeline
from fastapi import HTTPException
from cachetools import TTLCache
import logging
import asyncio
from analyze.gemini_ai import ask_gemini

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

cache = TTLCache(maxsize=100, ttl=3600)
_pipelines = {}

def preload_model(model_name: str):
    logger.info(f"Preloading model {model_name}...")
    try:
        _pipelines[model_name] = pipeline("text-generation", model=model_name, device=-1)
        logger.info(f"Model {model_name} loaded successfully")
    except Exception as e:
        logger.error(f"Failed to preload {model_name}: {str(e)}")
        raise Exception(f"Model preloading failed: {str(e)}")

def get_pipeline(model_name: str):
    if model_name not in _pipelines:
        logger.warning(f"Model {model_name} not preloaded, loading now...")
        preload_model(model_name)
    return _pipelines[model_name]

async def get_advice_from_prompt(prompt: str, max_length: int = 300, model_name: str = "distilgpt2") -> str:
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
    
    cache_key = f"{model_name}:{prompt}"
    if cache_key in cache:
        logger.debug("Returning cached advice for prompt")
        return cache[cache_key]
    
    try:
        logger.debug("Attempting Gemini AI for prompt")
        advice = await ask_gemini(prompt, max_tokens=max_length)
        cache[cache_key] = advice
        logger.debug("Gemini advice: %s", advice)
        return advice
    except Exception as e:
        logger.warning("Gemini AI failed: %s", str(e))
    
    try:
        logger.debug("Falling back to Hugging Face model %s", model_name)
        generator = get_pipeline(model_name)
        result = await asyncio.to_thread(
            generator, prompt, max_length=max_length, num_return_sequences=1, do_sample=True, top_p=0.9
        )
        advice = result[0]['generated_text'].replace(prompt, "").strip() if prompt in result[0]['generated_text'] else result[0]['generated_text'].strip()
        cache[cache_key] = advice
        logger.debug("Hugging Face advice: %s", advice)
        return advice
    except Exception as e:
        logger.error("Hugging Face model %s failed: %s", model_name, str(e))
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")