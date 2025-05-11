from typing import Dict
from fastapi import HTTPException
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def analyze_savings(income: float, expenses: float, spending_categories: Dict[str, float] = None) -> Dict:
    try:
        if spending_categories is None:
            spending_categories = {}

        monthly_savings = income - expenses
        saving_ratio = (monthly_savings / income * 100) if income > 0 else 0
        
        grade = "A" if saving_ratio > 30 else "B" if saving_ratio > 15 else "C"
        tip = ("Excellent savings rate! Consider investing surplus." if saving_ratio > 30 else
               "Good savings, but aim to increase." if saving_ratio > 15 else
               "Low savings rate. Reduce expenses or increase income.")
        
        category_insights = {}
        total_spending = sum(spending_categories.values()) if spending_categories else expenses
        for category, amount in spending_categories.items():
            percentage = (amount / total_spending * 100) if total_spending > 0 else 0
            category_insights[category] = {
                "amount": amount,
                "percentage": round(percentage, 2),
                "tip": "Reduce spending if >30% of total expenses" if percentage > 30 else "Spending is reasonable"
            }
        
        logger.debug("Savings analysis: savings=%f, ratio=%f, grade=%s", monthly_savings, saving_ratio, grade)
        return {
            "monthly_savings": monthly_savings,
            "saving_ratio": round(saving_ratio, 2),
            "grade": grade,
            "tip": tip,
            "category_insights": category_insights
        }
    except Exception as e:
        logger.error("Savings analysis failed: %s", str(e))
        raise HTTPException(status_code=500, detail=f"Savings analysis failed: {str(e)}")