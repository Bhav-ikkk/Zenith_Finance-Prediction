from transformers import pipeline

sentiment_analyzer = pipeline(
  "sentiment-analysis",
  model="distilbert/distilbert-base-uncased-finetuned-sst-2-english",
  revision="714eb0f"
)

def analyze_behavior(spending_notes: str) -> str:
    result = sentiment_analyzer(spending_notes)[0]
    return f"Spending tone: {result['label']} (confidence: {result['score']:.2f})"
