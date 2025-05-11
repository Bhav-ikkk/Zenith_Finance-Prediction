# inflation_adjustment.py
from fastapi import HTTPException

def get_inflation_multiplier(years: float) -> float:
    """
    Calculate inflation multiplier for a given number of years.
    """
    if years < 0:
        raise HTTPException(status_code=400, detail="Years cannot be negative")
    # Assuming 5% yearly inflation (consider fetching real-time data)
    rate = 0.05
    return round((1 + rate) ** years, 2)

def adjusted_goal_cost(original_cost: float, years: float) -> float:
    """
    Adjust goal cost for inflation over a given number of years.
    """
    if original_cost < 0:
        raise HTTPException(status_code=400, detail="Original cost cannot be negative")
    return round(original_cost * get_inflation_multiplier(years), 2)