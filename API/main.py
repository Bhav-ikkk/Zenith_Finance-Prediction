from fastapi import FastAPI, HTTPException, File, UploadFile, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from models import FinancialData, ExpenseForecastInput, Transaction, Goal
import matplotlib.pyplot as plt
import io
import base64
from typing import List, Dict, Optional
import asyncio
import pandas as pd
from analyze.transaction_parser import parse_transactions
from analyze.rule_based import analyze_savings
from analyze.huggingface_ai import get_advice_from_prompt, preload_model
from analyze.planner import goal_feasibility, build_action_plan
from analyze.prompt_engine import build_financial_prompt
from analyze.investment_forecast import forecast_expenses, get_total
from analyze.inflation_adjustment import adjusted_goal_cost
from analyze.spending_behavior import analyze_behavior
from analyze.term_explainer import explain_term
from analyze.knowledge_base import get_faq_answer
from analyze.risk_management import assess_risk
import logging
import google.generativeai as genai
from pydantic import ValidationError
import json
import yfinance as yf
from langchain_huggingface import HuggingFacePipeline
from langchain.prompts import PromptTemplate
from transformers import pipeline

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
logging.getLogger('matplotlib.font_manager').setLevel(logging.WARNING)

# Configure Gemini API
GEMINI_API_KEY = "YOUR-API-KEY"
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    logger.error("GEMINI_API_KEY not found in environment variables")

app = FastAPI()
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8501"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Preload Hugging Face models
try:
    preload_model("distilgpt2")
    logger.info("Simulating preload for bert-base-uncased")
except Exception as e:
    logger.error("Failed to preload models: %s", str(e))

# Initialize chatbot
chatbot = pipeline("text-generation", model="distilgpt2")
llm = HuggingFacePipeline(pipeline=chatbot)
prompt_template = PromptTemplate(
    input_variables=["question", "context"],
    template="Question: {question}\nContext: {context}\nAnswer: "
)

def generate_forecast_chart(forecasts: Dict[str, float], currency: str) -> str:
    try:
        plt.figure(figsize=(8, 4))
        periods = [1, 3, 6, 9, 12]
        amounts = [forecasts[f"{p}_month{'s' if p > 1 else ''}"] for p in periods]
        plt.plot(periods, amounts, 'b-', label='Forecasted Expenses')
        plt.title('Expense Forecast')
        plt.xlabel('Months')
        plt.ylabel(f'Expenses ({currency})')
        plt.grid(True)
        plt.legend()
        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        plt.close()
        buf.seek(0)
        return base64.b64encode(buf.read()).decode('utf-8')
    except Exception as e:
        logger.error("Chart generation failed: %s", str(e))
        return ""

async def get_gemini_advice(prompt: str, max_length: int = 300) -> str:
    if not GEMINI_API_KEY:
        return "Gemini API key not configured."
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = await asyncio.to_thread(
            model.generate_content,
            f"Provide concise financial advice (max {max_length} characters) based on this data: {prompt}"
        )
        advice = response.text.strip()
        return advice[:max_length]
    except Exception as e:
        logger.error("Gemini advice failed: %s", str(e))
        return f"Error generating Gemini advice: {str(e)}"
    
# 👇 Place this below get_gemini_advice()

def build_forecast_ai_prompt(forecast_data: dict, currency: str) -> str:
    forecast_summary = ", ".join([f"{k}: {v:.2f} {currency}" for k, v in forecast_data.items() if '_' in k])
    return f"""
Analyze this financial forecast and provide insights.

Forecast data:
{forecast_summary}

Highlight trends, risks, and potential advice in plain English.
"""

async def get_forecast_commentary(forecast_data: dict, currency: str) -> str:
    try:
        prompt = build_forecast_ai_prompt(forecast_data, currency)
        return await get_gemini_advice(prompt, max_length=400)
    except Exception as e:
        logger.error("Failed to generate AI forecast commentary: %s", str(e))
        return f"AI commentary error: {str(e)}"

def build_investment_ai_prompt(risk_profile: dict, suggestions: dict) -> str:
    tickers = ", ".join(suggestions.keys())
    return f"""
The user's financial risk profile is as follows:
{json.dumps(risk_profile, indent=2)}

They have been recommended the following stocks or ETFs: {tickers}

Provide investment rationale and advice in human-friendly language.
"""

async def get_investment_ai_commentary(risk_profile: dict, suggestions: dict) -> str:
    try:
        prompt = build_investment_ai_prompt(risk_profile, suggestions)
        return await get_gemini_advice(prompt, max_length=400)
    except Exception as e:
        logger.error("Failed to generate AI investment commentary: %s", str(e))
        return f"AI commentary error: {str(e)}"


@app.post("/analyze/")
@limiter.limit("5/minute")
async def advanced_financial_advisor(request: Request, data: FinancialData, low_income_mode: bool = False):
    logger.debug("Received /analyze/ request with data: %s", data)
    try:
        try:
            if not data.income or not data.expenses or not data.currency:
                raise HTTPException(status_code=400, detail="Income, expenses, and currency are required")
            if len(data.goals) > 100:
                raise HTTPException(status_code=400, detail="Too many goals (max 100)")
            if len(data.spending_categories) > 1000:
                raise HTTPException(status_code=400, detail="Too many spending categories (max 1000)")
        except ValidationError as e:
            logger.error("Validation error in FinancialData: %s", str(e))
            raise HTTPException(status_code=400, detail=f"Invalid input: {str(e)}")

        rule = await asyncio.to_thread(analyze_savings, data.income, data.expenses, data.spending_categories)
        logger.debug("Savings analysis: %s", rule)
        prompt = build_financial_prompt(data, rule)

        advisor_summary = {}
        try:
            distilgpt2_advice = await get_advice_from_prompt(prompt, max_length=300)
            advisor_summary["distilgpt2"] = distilgpt2_advice
            logger.debug("DistilGPT2 advice: %s", distilgpt2_advice)
        except Exception as e:
            advisor_summary["distilgpt2"] = f"Error generating advice: {str(e)}"
            logger.error("DistilGPT2 advice failed: %s", str(e))

        try:
            bert_advice = f"Based on your financial data, your savings rate is {'healthy' if rule['monthly_savings'] > 0.2 * data.income else 'concerning'}. Consider {'reducing discretionary spending' if rule['monthly_savings'] < 0.2 * data.income else 'maintaining your savings plan'}."
            advisor_summary["bert"] = bert_advice
            logger.debug("BERT advice: %s", bert_advice)
        except Exception as e:
            advisor_summary["bert"] = f"Error generating advice: {str(e)}"
            logger.error("BERT advice failed: %s", str(e))

        try:
            rule_based_advice = f"To achieve your goals, maintain monthly savings of at least {rule['monthly_savings']:.2f} {data.currency}. Prioritize high-priority goals and review spending in categories like {list(data.spending_categories.keys())[0] if data.spending_categories else 'General'}."
            advisor_summary["rule_based"] = rule_based_advice
            logger.debug("Rule-based advice: %s", rule_based_advice)
        except Exception as e:
            advisor_summary["rule_based"] = f"Error generating advice: {str(e)}"
            logger.error("Rule-based advice failed: %s", str(e))

        try:
            gemini_advice = await get_gemini_advice(prompt, max_length=300)
            advisor_summary["gemini"] = gemini_advice
            logger.debug("Gemini advice: %s", gemini_advice)
        except Exception as e:
            advisor_summary["gemini"] = f"Error generating advice: {str(e)}"
            logger.error("Gemini advice failed: %s", str(e))

        feasibility_results = []
        for goal in data.goals:
            feasibility = await asyncio.to_thread(
                goal_feasibility, data.income, data.expenses, data.duration_months, goal.cost
            )
            feasibility_results.append({
                "goal": goal.description,
                "feasibility": feasibility
            })
        
        steps = await asyncio.to_thread(build_action_plan, data.income, data.expenses, rule["monthly_savings"], data.spending_categories, low_income_mode)
        projected_savings = [rule["monthly_savings"] * i for i in range(1, min(data.duration_months + 1, 121))]
        savings_chart = generate_forecast_chart({"1_month": projected_savings[0], "3_months": projected_savings[2], 
                                                "6_months": projected_savings[5], "9_months": projected_savings[8], 
                                                "12_months": projected_savings[-1]}, data.currency)
        
        primary_goal = min(data.goals, key=lambda g: g.priority)
        inflation_adjusted = await asyncio.to_thread(
            adjusted_goal_cost, primary_goal.cost, data.duration_months / 12
        )
        
        behavior = await asyncio.to_thread(
            analyze_behavior, ", ".join(data.spending_categories.keys()) if data.spending_categories else "General spending"
        )
        term_info = await explain_term("Systematic Investment Plan")
        faq = await asyncio.to_thread(get_faq_answer, "What is SIP?")

        logger.debug("Returning /analyze/ response")
        return {
            "overview": {
                "monthly_income": data.income,
                "monthly_expenses": data.expenses,
                "goals": [{"description": g.description, "cost": g.cost, "priority": g.priority} for g in data.goals],
                "target_months": data.duration_months,
                "currency": data.currency
            },
            "analysis": rule,
            "goal_feasibility": feasibility_results,
            "advisor_summary": advisor_summary,
            "step_by_step_plan": steps,
            "enhancements": {
                "projected_savings": projected_savings[-1],
                "savings_chart": f"data:image/png;base64,{savings_chart}" if savings_chart else "",
                "inflation_adjusted_goal_cost": inflation_adjusted,
                "behavioral_insight": behavior,
                "term_explanation": term_info,
                "faq": faq
            }
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error("Error in /analyze/: %s", str(e), exc_info=True)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/forecast_expenses/")
@limiter.limit("5/minute")
async def predict_expense_forecast(request: Request, data: ExpenseForecastInput = None, file: UploadFile = File(None), language: str = "en"):
    logger.debug("Received /forecast_expenses/ request with data: %s, file: %s", data, file)
    try:
        transactions = []
        try:
            if "multipart/form-data" in request.headers.get("content-type", ""):
                form = await request.form()
                logger.debug("Form-data received: %s", {key: f"File: {value.filename}, Size: {value.size}" if isinstance(value, UploadFile) else str(value) for key, value in form.items()})
            
            if file and file.filename:
                file_type = file.filename.split(".")[-1].lower()
                if file_type not in ["xlsx", "csv", "pdf"]:
                    raise HTTPException(status_code=400, detail="File must be Excel (.xlsx), CSV (.csv), or PDF (.pdf)")
                if file.size == 0:
                    raise HTTPException(status_code=400, detail="Uploaded file is empty")
                content = await file.read()
                logger.debug("Processing uploaded %s file: %s, size: %d bytes", file_type, file.filename, len(content))
                try:
                    transactions = await asyncio.to_thread(parse_transactions, content, is_file=True, file_type=file_type)
                    logger.debug("Parsed %d transactions from %s file", len(transactions), file_type)
                except ValueError as ve:
                    logger.error("Failed to parse %s file: %s", file_type, str(ve))
                    raise HTTPException(status_code=400, detail=f"Invalid {file_type} file: {str(ve)}")
            elif data and data.file_content:
                logger.debug("Processing base64-encoded file content")
                content = base64.b64decode(data.file_content)
                transactions = await asyncio.to_thread(parse_transactions, content, is_file=True, file_type="xlsx")
            elif data and data.transactions:
                logger.debug("Processing transactions list")
                transactions = data.transactions
            elif data and data.expense_history:
                logger.debug("Processing expense history")
                transactions = [
                    Transaction(date=f"{date}-01", amount=amount, category="General")
                    for date, amount in list(data.expense_history.items())[:1000]
                ]
            else:
                try:
                    raw_body = await request.body()
                    logger.debug("Raw request body: %s", raw_body.decode('utf-8', errors='ignore'))
                    if raw_body:
                        json_data = json.loads(raw_body)
                        try:
                            data = ExpenseForecastInput(**json_data)
                            if data.transactions:
                                logger.debug("Manually parsed transactions list")
                                transactions = data.transactions
                            elif data.expense_history:
                                logger.debug("Manually parsed expense history")
                                transactions = [
                                    Transaction(date=f"{date}-01", amount=amount, category="General")
                                    for date, amount in list(data.expense_history.items())[:1000]
                                ]
                            elif data.file_content:
                                logger.debug("Manually parsed file content")
                                content = base64.b64decode(data.file_content)
                                transactions = await asyncio.to_thread(parse_transactions, content, is_file=True, file_type="xlsx")
                            else:
                                logger.error("No valid data in manually parsed JSON: %s", json_data)
                                raise HTTPException(status_code=400, detail="No valid input in JSON")
                        except ValidationError as ve:
                            logger.error("Validation error in manual ExpenseForecastInput parsing: %s", str(ve))
                            raise HTTPException(status_code=400, detail=f"Invalid JSON input: {str(ve)}")
                    else:
                        logger.error("Empty request body")
                        raise HTTPException(status_code=400, detail="No input provided")
                except json.JSONDecodeError as e:
                    logger.error("Failed to decode raw JSON body: %s", str(e))
                    raise HTTPException(status_code=400, detail=f"Invalid JSON format: {str(e)}")

        except ValidationError as e:
            logger.error("Validation error in ExpenseForecastInput: %s", str(e))
            raise HTTPException(status_code=400, detail=f"Invalid JSON input: {str(e)}")
        except HTTPException:
            raise
        except Exception as e:
            logger.error("Input validation failed: %s", str(e), exc_info=True)
            raise HTTPException(status_code=400, detail=f"Input processing failed: {str(e)}")

        if len(transactions) < 6:
            raise HTTPException(status_code=400, detail="At least 6 transactions required")
        if len(transactions) > 1000:
            transactions = transactions[-1000:]
            logger.debug("Limited transactions to 1000")

        forecast = await forecast_expenses(transactions, data.forecast_currency if data else "INR", language)
        logger.debug("Forecast results: %s", forecast)
        risk_profile = await asyncio.to_thread(assess_risk, transactions)
        forecast_chart = generate_forecast_chart(forecast, data.forecast_currency if data else "INR")

        logger.debug("Returning /forecast_expenses/ response")
        ai_commentary = await get_forecast_commentary(forecast, data.forecast_currency if data else "INR")

        return {
    "forecast_summary": {
        "1_month": forecast["1_month"],
        "3_months": forecast["3_months"],
        "6_months": forecast["6_months"],
        "9_months": forecast["9_months"],
        "1_year": forecast["1_year"]
    },
    "confidence_intervals": forecast["confidence_intervals"],
    "forecast_chart": f"data:image/png;base64,{forecast_chart}" if forecast_chart else "",
    "currency": data.forecast_currency if data else "INR",
    "risk_profile": risk_profile,
    "ai_commentary": ai_commentary,
    "note": forecast["narrative"]
}

    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error("Error in /forecast_expenses/: %s", str(e), exc_info=True)
        raise HTTPException(status_code=500, detail=f"Forecast failed: {str(e)}")

@app.post("/invest/")
@limiter.limit("5/minute")
async def suggest_investments(request: Request, data: FinancialData):
    try:
        risk = await asyncio.to_thread(assess_risk, data.transactions if data.transactions else [])
        variability = risk.get("spending_variability", "moderate")
        tickers = {
            "low": ["VTI", "BND"],
            "moderate": ["SPY", "QQQ"],
            "high": ["AAPL", "TSLA"]
        }.get(variability, ["SPY", "QQQ"])
        
        suggestions = {}
        for ticker in tickers:
            try:
                stock = yf.Ticker(ticker)
                suggestions[ticker] = {
                    "name": stock.info.get("longName", ticker),
                    "price": stock.info.get("regularMarketPrice", 0),
                    "sector": stock.info.get("sector", "Unknown")
                }
            except Exception as e:
                logger.warning("Failed to fetch stock info for %s: %s", ticker, e)
                suggestions[ticker] = {"name": ticker, "price": 0, "sector": "Unknown"}

        ai_commentary = await get_investment_ai_commentary(risk, suggestions)

        return {
            "risk_profile": risk,
            "investment_suggestions": suggestions,
            "ai_commentary": ai_commentary,
            "note": "Prices are indicative and subject to market changes."
        }
    except Exception as e:
        logger.error("Investment suggestions failed: %s", str(e), exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/chat/")
@limiter.limit("5/minute")
async def chat_with_bot(request: Request, query: dict):
    try:
        question = query.get("question", "")
        user_data = FinancialData(**query.get("user_data", {})) if query.get("user_data") else None
        context = ""
        if user_data:
            response = await advanced_financial_advisor(request, user_data)
            context = (
                f"User's financial summary: {response['advisor_summary']}. "
                f"Savings plan: {response['step_by_step_plan']}. "
                f"Goal feasibility: {response['goal_feasibility']}."
            )
            if "forecast" in question.lower():
                forecast = await forecast_expenses(user_data.transactions or [], user_data.currency or "INR", "en")
                context += f" Forecast: {forecast['1_month']} for 1 month, {forecast['1_year']} for 1 year."

        # ✅ Build and invoke prompt
        prompt = prompt_template.format(question=question, context=context)
        answer = chatbot(prompt, max_new_tokens=100)[0]['generated_text']

        # ✅ Gemini AI commentary
        chat_gemini_summary = await get_gemini_advice(
            f"User question: {question}\nContext: {context}\nGive a smart financial assistant reply.",
            max_length=300
        )

        return {
            "huggingface_answer": answer.strip(),
            "gemini_commentary": chat_gemini_summary.strip(),
            "used_context": context
        }

    except Exception as e:
        logger.error("Chat failed: %s", str(e), exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/test/")
async def test_endpoint():
    logger.debug("Received /test/ request")
    return {"message": "Server is running"}

@app.post("/debug_request/")
async def debug_request(request: Request):
    logger.debug("Received /debug_request/ request")
    try:
        headers = dict(request.headers)
        content_type = headers.get("content-type", "")
        body = {}
        if "multipart/form-data" in content_type:
            form = await request.form()
            body = {key: f"File: {value.filename}, Size: {value.size}" if isinstance(value, UploadFile) else str(value) for key, value in form.items()}
        elif "application/json" in content_type:
            body = await request.json()
        logger.debug("Debug request - Headers: %s, Body: %s", headers, body)
        return {
            "headers": headers,
            "body": body,
            "message": "Request data logged"
        }
    except Exception as e:
        logger.error("Error in /debug_request/: %s", str(e), exc_info=True)
        raise HTTPException(status_code=400, detail=f"Debug failed: {str(e)}")
