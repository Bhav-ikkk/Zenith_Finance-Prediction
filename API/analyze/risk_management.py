import pandas as pd
from models import Transaction
from fastapi import HTTPException
import numpy as np
from typing import List

def assess_risk(transactions: List[Transaction]) -> dict:
    """
    Assess financial risk based on transaction volatility and patterns.
    """
    try:
        df = pd.DataFrame([
            {"date": pd.to_datetime(t.date), "amount": t.amount, "category": t.category}
            for t in transactions
        ])
        
        monthly = df.groupby(pd.Grouper(key='date', freq='MS'))['amount'].sum().reset_index()
        volatility = monthly['amount'].std() / monthly['amount'].mean() if monthly['amount'].mean() != 0 else 0
        
        risk_score = "Low"
        if volatility > 0.5:
            risk_score = "High"
        elif volatility > 0.2:
            risk_score = "Medium"
        
        category_spending = df.groupby('category')['amount'].sum()
        total_spending = category_spending.sum()
        high_risk_categories = category_spending[category_spending / total_spending > 0.3].index.tolist()
        
        recommendations = []
        avg_monthly = monthly['amount'].mean()
        if risk_score in ["Medium", "High"]:
            recommendations.append(f"Build an emergency fund of 6-9 months of expenses (estimated: {round(avg_monthly * 6, 2)}-{round(avg_monthly * 9, 2)}).")
        if high_risk_categories:
            recommendations.append(f"Reduce spending in high-risk categories: {', '.join(high_risk_categories)}.")
        recommendations.append("Set monthly budgets for discretionary categories to stabilize spending.")
        
        return {
            "risk_score": risk_score,
            "volatility": round(volatility, 2),
            "high_risk_categories": high_risk_categories,
            "recommendations": recommendations,
            "average_monthly_expense": round(avg_monthly, 2)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk assessment failed: {str(e)}")