def build_financial_prompt(data, rule_insights):
    return (
        f"You are a world-class financial advisor. A client earns ₹{data.income}/month, "
        f"spends ₹{data.expenses}/month, and wants to '{data.goals}' in {data.duration_months} months. "
        f"Their savings grade is {rule_insights['grade']} and current monthly savings are ₹{rule_insights['monthly_savings']}. "
        f"Please give expert, friendly advice including:\n"
        f"1. Risk warning (if any)\n"
        f"2. Investment/savings strategy\n"
        f"3. Weekly or monthly plan\n"
        f"4. Smart tips\n"
        f"Keep it realistic, brief, and motivational. Avoid jargon."
    )
