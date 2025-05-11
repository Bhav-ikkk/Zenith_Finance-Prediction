faq_data = {
    "what is sip": "A SIP (Systematic Investment Plan) allows investing a fixed amount regularly into mutual funds.",
    "how to save money": "Track your expenses, reduce unnecessary spending, and automate monthly savings.",
    "what is emergency fund": "It’s a reserve of 3-6 months of living expenses to handle unexpected financial emergencies."
}

def get_faq_answer(question: str) -> str:
    question = question.lower()
    for key in faq_data:
        if key in question:
            return faq_data[key]
    return "Sorry, I don't have an answer to that yet."
