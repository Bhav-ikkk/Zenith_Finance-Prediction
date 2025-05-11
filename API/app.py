import streamlit as st
import requests
import pandas as pd
import base64
import io

st.set_page_config(page_title="Smart Financial Planner", layout="wide")
st.title("Smart Financial Planning App")
st.markdown("Plan your finances with AI-powered forecasts and advice!")

tab1, tab2, tab3, tab4 = st.tabs(["📈 Forecast Expenses", "💡 Analyze Finances", "📊 Invest", "💬 Chat"])

with tab1:
    st.subheader("Upload Transaction Data")
    uploaded_file = st.file_uploader("Choose an Excel file (.xlsx)", type=["xlsx"])
    currency = st.selectbox("Currency", ["INR", "USD", "EUR", "GBP"], index=0)
    language = st.selectbox("Language", ["en", "es", "hi", "fr"], index=0)
    if uploaded_file and st.button("Forecast"):
        with st.spinner("Generating forecast..."):
            response = requests.post(
                "http://127.0.0.1:8000/forecast_expenses/",
                files={"file": uploaded_file},
                data={"forecast_currency": currency}
            )
            if response.status_code == 200:
                result = response.json()
                st.success("Forecast Generated!")
                st.write(f"**1 Month**: {result['forecast_summary']['1_month']} {currency}")
                st.write(f"**3 Months**: {result['forecast_summary']['3_months']} {currency}")
                st.write(f"**6 Months**: {result['forecast_summary']['6_months']} {currency}")
                st.write(f"**12 Months**: {result['forecast_summary']['1_year']} {currency}")
                st.write("**Narrative**:")
                st.markdown(result['note'])
                if result['forecast_chart']:
                    img_data = result['forecast_chart'].split(",")[1]
                    st.image(base64.b64decode(img_data), caption="Expense Forecast")
            else:
                st.error(f"Error: {response.json().get('detail', 'Failed to generate forecast')}")

with tab2:
    st.subheader("Analyze Your Finances")
    income = st.number_input("Monthly Income", min_value=0.0, value=5000.0)
    expenses = st.number_input("Monthly Expenses", min_value=0.0, value=3000.0)
    goal_desc = st.text_input("Financial Goal", value="Buy a car")
    goal_cost = st.number_input("Goal Cost", min_value=0.0, value=20000.0)
    duration = st.slider("Duration (Months)", 1, 36, 12)
    low_income_mode = st.checkbox("Low-Income Mode", value=False)
    if st.button("Analyze"):
        with st.spinner("Analyzing..."):
            data = {
                "income": income,
                "expenses": expenses,
                "goals": [{"description": goal_desc, "cost": goal_cost, "priority": 1}],
                "duration_months": duration,
                "currency": "INR",
                "spending_categories": {"Food": expenses * 0.4, "Rent": expenses * 0.5}
            }
            response = requests.post(
                "http://127.0.0.1:8000/analyze/",
                json=data,
                params={"low_income_mode": low_income_mode}
            )
            if response.status_code == 200:
                result = response.json()
                st.success("Analysis Complete!")
                st.write("**Advisor Summary**:")
                for model, advice in result["advisor_summary"].items():
                    st.write(f"**{model}**: {advice}")
                st.write("**Goal Feasibility**:")
                for goal in result["goal_feasibility"]:
                    st.write(f"**{goal['goal']}**: {goal['feasibility']['feasibility']} ({goal['feasibility']['message']})")
                st.write("**Action Plan**:")
                for step in result["step_by_step_plan"]:
                    st.write(f"- {step}")
                if result["enhancements"]["savings_chart"]:
                    img_data = result["enhancements"]["savings_chart"].split(",")[1]
                    st.image(base64.b64decode(img_data), caption="Savings Progress")
            else:
                st.error(f"Error: {response.json().get('detail', 'Failed to analyze')}")

with tab3:
    st.subheader("Investment Suggestions")
    if st.button("Get Suggestions"):
        with st.spinner("Fetching suggestions..."):
            data = {
                "income": income,
                "expenses": expenses,
                "goals": [{"description": goal_desc, "cost": goal_cost, "priority": 1}],
                "duration_months": duration,
                "currency": "INR",
                "spending_categories": {"Food": expenses * 0.4, "Rent": expenses * 0.5},
                "transactions": [
                    {"date": "2025-01-01", "amount": 500, "category": "Food"},
                    {"date": "2025-02-01", "amount": 600, "category": "Food"},
                    {"date": "2025-03-01", "amount": 550, "category": "Food"},
                    {"date": "2025-04-01", "amount": 700, "category": "Transport"},
                    {"date": "2025-05-01", "amount": 650, "category": "Transport"},
                    {"date": "2025-06-01", "amount": 600, "category": "Food"}
                ]
            }
            response = requests.post("http://127.0.0.1:8000/invest/", json=data)
            if response.status_code == 200:
                result = response.json()
                st.success("Suggestions Generated!")
                st.write("**Risk Profile**:")
                st.json(result["risk_profile"])
                st.write("**Investment Suggestions**:")
                for ticker, details in result["investment_suggestions"].items():
                    st.write(f"**{ticker}**: {details['name']} (Price: {details['price']}, Sector: {details['sector']})")
            else:
                st.error(f"Error: {response.json().get('detail', 'Failed to get suggestions')}")

with tab4:
    st.subheader("Chat with Financial Assistant")
    question = st.text_input("Ask a question", value="What's my expense forecast?")
    if st.button("Chat"):
        with st.spinner("Processing..."):
            user_data = {
                "income": income,
                "expenses": expenses,
                "goals": [{"description": goal_desc, "cost": goal_cost, "priority": 1}],
                "duration_months": duration,
                "currency": "INR",
                "spending_categories": {"Food": expenses * 0.4, "Rent": expenses * 0.5},
                "transactions": [
                    {"date": "2025-01-01", "amount": 500, "category": "Food"},
                    {"date": "2025-02-01", "amount": 600, "category": "Food"},
                    {"date": "2025-03-01", "amount": 550, "category": "Food"},
                    {"date": "2025-04-01", "amount": 700, "category": "Transport"},
                    {"date": "2025-05-01", "amount": 650, "category": "Transport"},
                    {"date": "2025-06-01", "amount": 600, "category": "Food"}
                ]
            }
            response = requests.post(
                "http://127.0.0.1:8000/chat/",
                json={"question": question, "user_data": user_data}
            )
            if response.status_code == 200:
                st.write("**Assistant**: ", response.json()["answer"])
            else:
                st.error(f"Error: {response.json().get('detail', 'Chat failed')}")

st.sidebar.markdown("### About")
st.sidebar.write("Built for smart financial planning with AI forecasting, multi-model advice, investment suggestions, and a chatbot.")