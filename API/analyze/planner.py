from typing import Dict, List
from fastapi import HTTPException
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def goal_feasibility(income: float, expenses: float, duration_months: int, goal_cost: float) -> Dict:
    try:
        monthly_savings = income - expenses
        estimated_savings = monthly_savings * duration_months
        feasibility = "Feasible" if estimated_savings >= goal_cost else "Not Feasible"
        risk_level = "Low" if estimated_savings >= goal_cost * 1.2 else "Medium" if estimated_savings >= goal_cost * 0.8 else "High"
        message = ("Goal is achievable with current savings." if feasibility == "Feasible" else
                   "Increase savings or extend timeframe.")
        
        logger.debug("Goal feasibility: estimated_savings=%f, goal_cost=%f, feasibility=%s", estimated_savings, goal_cost, feasibility)
        return {
            "estimated_savings": estimated_savings,
            "goal_cost": goal_cost,
            "feasibility": feasibility,
            "risk_level": risk_level,
            "message": message
        }
    except Exception as e:
        logger.error("Goal feasibility failed: %s", str(e))
        raise HTTPException(status_code=500, detail=f"Goal feasibility failed: {str(e)}")

def build_action_plan(income: float, expenses: float, monthly_savings: float, spending_categories: Dict[str, float], low_income_mode: bool = False) -> List[str]:
    try:
        steps = [
            "Track expenses weekly using a budgeting app like YNAB or Mint.",
            "Review financial goals monthly to stay on track."
        ]
        if low_income_mode:
            steps.append("Prioritize essential spending (e.g., Food, Rent). Consider micro-saving $10/month for emergencies.")
        else:
            if monthly_savings < income * 0.2:
                steps.append("Allocate at least 20% of income to savings or investments.")
            if spending_categories:
                total_spending = sum(spending_categories.values())
                for category, amount in list(spending_categories.items())[:100]:
                    if amount > total_spending * 0.3:
                        steps.append(f"Reduce spending in {category} category.")
        
        logger.debug("Action plan: %s", steps)
        return steps
    except Exception as e:
        logger.error("Action plan generation failed: %s", str(e))
        raise HTTPException(status_code=500, detail=f"Action plan generation failed: {str(e)}")