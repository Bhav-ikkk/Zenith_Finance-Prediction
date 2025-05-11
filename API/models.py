from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import date

class Goal(BaseModel):
    description: str
    cost: float
    priority: int

class Transaction(BaseModel):
    date: str
    amount: float
    category: str

class FinancialData(BaseModel):
    income: float
    expenses: float
    goals: List[Goal]
    duration_months: int
    currency: str
    spending_categories: Dict[str, float]
    transactions: Optional[List[Transaction]] = None

class ExpenseForecastInput(BaseModel):
    transactions: Optional[List[Transaction]] = None
    expense_history: Optional[Dict[str, float]] = None
    file_content: Optional[str] = None
    forecast_currency: Optional[str] = "INR"