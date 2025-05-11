from prophet import Prophet
import pandas as pd
from datetime import datetime
from dateutil.relativedelta import relativedelta
from fastapi import HTTPException
from cachetools import TTLCache
import logging
import numpy as np
from typing import List
from models import Transaction
from analyze.huggingface_ai import get_advice_from_prompt
from analyze.gemini_ai import ask_gemini
from googletrans import Translator

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

cache = TTLCache(maxsize=100, ttl=3600)
translator = Translator()

def convert_currency(amount: float, from_currency: str, to_currency: str) -> float:
    rates = {"INR": 1.0, "USD": 0.012, "EUR": 0.011, "GBP": 0.0095}
    if from_currency not in rates or to_currency not in rates:
        raise HTTPException(status_code=400, detail="Unsupported currency")
    return amount * rates[to_currency] / rates[from_currency]

def aggregate_transactions(transactions: List[Transaction]) -> pd.DataFrame:
    try:
        df = pd.DataFrame([
            {"ds": datetime.strptime(t.date, "%Y-%m-%d"), "y": t.amount, "category": t.category}
            for t in transactions
        ])
        monthly = df.groupby(pd.Grouper(key='ds', freq='MS'))['y'].sum().reset_index()
        logger.debug("Aggregated to %d monthly data points: %s", len(monthly), monthly.to_dict('records'))
        return monthly
    except Exception as e:
        logger.error("Transaction aggregation failed: %s", str(e))
        raise HTTPException(status_code=400, detail=f"Transaction aggregation failed: {str(e)}")

def detect_anomalies(df: pd.DataFrame) -> pd.DataFrame:
    try:
        if len(df) < 6:
            logger.debug("Skipping anomaly detection due to small dataset (%d rows)", len(df))
            return df[['ds', 'y']]
        
        rolling_mean = df['y'].rolling(window=3, center=True).mean()
        rolling_std = df['y'].rolling(window=3, center=True).std()
        df['is_anomaly'] = (df['y'] > rolling_mean + 2 * rolling_std) | (df['y'] < rolling_mean - 2 * rolling_std)
        
        if df['is_anomaly'].any():
            removed = df[df['is_anomaly']][['ds', 'y']]
            logger.debug("Removed %d anomalies: %s", len(removed), removed.to_dict('records'))
            df_clean = df[~df['is_anomaly']][['ds', 'y']]
        else:
            logger.debug("No anomalies detected")
            df_clean = df[['ds', 'y']]
        
        if len(df_clean) < 3:
            logger.warning("Insufficient data after anomaly removal (%d rows), using original data", len(df_clean))
            return df[['ds', 'y']]
        
        return df_clean
    except Exception as e:
        logger.error("Anomaly detection failed: %s", str(e))
        return df[['ds', 'y']]

async def forecast_expenses(transactions: List[Transaction], currency: str = "INR", language: str = "en") -> dict:
    logger.debug("Starting forecast_expenses with %d transactions", len(transactions))
    if len(transactions) > 1000:
        transactions = transactions[-1000:]
        logger.debug("Limited transactions to 1000")

    cache_key = f"forecast:{hash(str([(t.date, t.amount, t.category) for t in transactions]))}:{language}"
    if cache_key in cache:
        logger.debug("Returning cached forecast")
        forecast = cache[cache_key]
        return {k: round(convert_currency(v, "INR", currency), 2) if k != "confidence_intervals" and k != "narrative" else v
                for k, v in forecast.items()}

    if len(transactions) < 6:
        raise HTTPException(status_code=400, detail="At least 6 transactions required")

    try:
        df = aggregate_transactions(transactions)
        df = detect_anomalies(df)
        if len(df) < 3:
            raise HTTPException(status_code=400, detail="Insufficient data for forecasting (less than 3 monthly data points)")
        logger.debug("Processed transaction data: %s", df.to_dict())
    except Exception as e:
        logger.error("Data processing failed: %s", str(e))
        raise HTTPException(status_code=400, detail=f"Data processing failed: {str(e)}")

    try:
        model = Prophet(yearly_seasonality=True, weekly_seasonality=True, daily_seasonality=False,
                        interval_width=0.95)
        model.fit(df)
        future = model.make_future_dataframe(periods=12, freq="MS")
        forecast = model.predict(future)
        logger.debug("Prophet forecast completed")
    except Exception as e:
        logger.error("Prophet model failed: %s", str(e))
        raise HTTPException(status_code=500, detail=f"Prophet model failed: {str(e)}")

    def get_prophet_total(months: int) -> tuple:
        try:
            end_date = df['ds'].max() + relativedelta(months=months)
            forecast_cutoff = forecast[forecast['ds'] <= end_date]
            recent_forecast = forecast_cutoff.tail(months)
            total = float(recent_forecast['yhat'].sum())
            ci_lower = float(recent_forecast['yhat_lower'].sum())
            ci_upper = float(recent_forecast['yhat_upper'].sum())
            return total, (ci_lower, ci_upper)
        except Exception as e:
            logger.error("Prophet total calculation failed: %s", str(e))
            raise HTTPException(status_code=500, detail=f"Prophet calculation failed: {str(e)}")

    prophet_forecasts = {
        1: get_prophet_total(1),
        3: get_prophet_total(3),
        6: get_prophet_total(6),
        9: get_prophet_total(9),
        12: get_prophet_total(12)
    }

    narrative = "Unable to generate narrative forecast."
    try:
        gemini_prompt = (
            f"Based on monthly expenses: {df[['ds', 'y']].to_dict('records')}, "
            f"provide a narrative forecast for expenses over the next 12 months, "
            f"focusing on trends, seasonality, and spending patterns."
        )
        narrative = await ask_gemini(gemini_prompt, max_tokens=500)
        logger.debug("Gemini narrative: %s", narrative)
    except Exception as e:
        logger.warning("Gemini forecast failed: %s", str(e))
        try:
            hf_prompt = gemini_prompt
            narrative = await get_advice_from_prompt(hf_prompt, max_length=500)
            logger.debug("Hugging Face narrative: %s", narrative)
        except Exception as e:
            logger.error("Hugging Face fallback failed: %s", str(e))

    if language != "en":
        try:
            narrative = translator.translate(narrative, dest=language).text
            logger.debug("Translated narrative to %s: %s", language, narrative)
        except Exception as e:
            logger.error("Translation failed: %s", str(e))

    result = {
        "1_month": prophet_forecasts[1][0],
        "3_months": prophet_forecasts[3][0],
        "6_months": prophet_forecasts[6][0],
        "9_months": prophet_forecasts[9][0],
        "1_year": prophet_forecasts[12][0],
        "confidence_intervals": {
            "1_month": prophet_forecasts[1][1],
            "3_months": prophet_forecasts[3][1],
            "6_months": prophet_forecasts[6][1],
            "9_months": prophet_forecasts[9][1],
            "1_year": prophet_forecasts[12][1]
        },
        "narrative": narrative
    }

    result = {k: round(convert_currency(v, "INR", currency), 2) if k != "confidence_intervals" and k != "narrative" else v
              for k, v in result.items()}
    cache[cache_key] = result
    logger.debug("Returning forecast result")
    return result

def get_total(savings: float, months: int, currency: str = "INR") -> float:
    try:
        total = savings * months
        return round(convert_currency(total, "INR", currency), 2)
    except Exception as e:
        logger.error("Total calculation failed: %s", str(e))
        raise HTTPException(status_code=500, detail=f"Total calculation failed: {str(e)}")