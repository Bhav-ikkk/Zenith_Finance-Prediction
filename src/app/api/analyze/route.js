import { read, utils } from 'xlsx';
import { Buffer } from 'buffer';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const income = Number(formData.get('income'));
    const expenses = Number(formData.get('expenses'));
    const goals = JSON.parse(formData.get('goals'));
    const duration_months = Number(formData.get('duration_months'));
    const currency = formData.get('currency') || 'INR';
    const spending_categories = JSON.parse(formData.get('spending_categories') || '{}');
    const transaction_file = formData.get('transaction_file');

    // Input validation
    if (!income || !expenses || !goals || !duration_months) {
      return new Response(
        JSON.stringify({ error: "Missing required fields", detail: "All fields (income, expenses, goals, duration_months) are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (
      typeof income !== 'number' ||
      typeof expenses !== 'number' ||
      typeof duration_months !== 'number'
    ) {
      return new Response(
        JSON.stringify({ error: "Invalid input types", detail: "Income, expenses, and duration_months must be numbers" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!Array.isArray(goals) || goals.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid goals", detail: "Goals must be a non-empty array" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    for (const goal of goals) {
      if (
        !goal.description ||
        typeof goal.cost !== 'number' ||
        typeof goal.priority !== 'number'
      ) {
        return new Response(
          JSON.stringify({
            error: "Invalid goal format",
            detail: "Each goal must have a description (string), cost (number), and priority (number)",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Process transaction file if provided
    let dynamic_income = income;
    let dynamic_expenses = expenses;
    let dynamic_spending_categories = { ...spending_categories };
    let transaction_insights = {};

    if (transaction_file) {
      const buffer = Buffer.from(await transaction_file.arrayBuffer());
      const workbook = read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const transactions = utils.sheet_to_json(worksheet);

      // Expected columns: Date, Description, Amount, Category, Type (Income/Expense)
      let total_income = 0;
      let total_expenses = 0;
      const category_totals = {};

      transactions.forEach((tx) => {
        const amount = Number(tx.Amount);
        const category = tx.Category || 'Other';
        if (tx.Type === 'Income') {
          total_income += amount;
        } else if (tx.Type === 'Expense') {
          total_expenses += amount;
          category_totals[category] = (category_totals[category] || 0) + amount;
        }
      });

      // Update dynamic values
      dynamic_income = total_income / 12; // Average monthly income
      dynamic_expenses = total_expenses / 12; // Average monthly expenses
      dynamic_spending_categories = category_totals;

      // Generate transaction insights
      transaction_insights = Object.entries(category_totals).reduce((acc, [category, amount]) => {
        const percentage = ((amount / total_expenses) * 100).toFixed(2);
        let tip = 'Maintain current spending.';
        if (percentage > 30) {
          tip = `Consider reducing spending in ${category} to improve savings.`;
        }
        acc[category] = { amount, percentage, tip };
        return acc;
      }, {});
    }

    // Prepare data for external API
    const apiPayload = {
      income: dynamic_income,
      expenses: dynamic_expenses,
      goals,
      duration_months,
      currency,
      spending_categories: dynamic_spending_categories,
    };

    // Call external API
    let apiResponse = {};
    try {
      const response = await fetch("http://127.0.0.1:8000/analyze/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        throw new Error(`Backend API responded with status ${response.status}`);
      }

      apiResponse = await response.json();
    } catch (error) {
      console.error("External API Error:", error);
      // Fallback to local analysis if external API fails
      apiResponse = {
        overview: {
          monthly_income: dynamic_income,
          monthly_expenses: dynamic_expenses,
          goals,
          target_months: duration_months,
        },
        analysis: {
          monthly_savings: dynamic_income - dynamic_expenses,
          saving_ratio: ((dynamic_income - dynamic_expenses) / dynamic_income * 100).toFixed(2),
          grade: dynamic_income - dynamic_expenses > 0 ? 'Good' : 'Needs Improvement',
          tip: 'Ensure monthly savings are positive to achieve your goals.',
          category_insights: transaction_insights,
        },
        goal_feasibility: goals.map((goal) => ({
          goal: goal.description,
          feasibility: {
            estimated_savings: (dynamic_income - dynamic_expenses) * duration_months,
            goal_cost: goal.cost,
            feasibility: (dynamic_income - dynamic_expenses) * duration_months >= goal.cost ? 'Feasible' : 'Not Feasible',
            risk_level: 'Moderate',
            message: (dynamic_income - dynamic_expenses) * duration_months >= goal.cost
              ? `Your goal of ${goal.description} is achievable within ${duration_months} months.`
              : `You may need to increase savings or extend the timeline for ${goal.description}.`,
          },
        })),
        enhancements: {
          projected_savings: (dynamic_income - dynamic_expenses) * duration_months,
          inflation_adjusted_goal_cost: goals[0].cost * 1.05, // Assume 5% inflation
          behavioral_insight: 'Regularly review your spending to identify savings opportunities.',
          term_explanation: 'Savings Ratio: The percentage of your income that you save each month.',
          faq: 'How can I improve my savings? Reduce discretionary spending and automate savings.',
          savings_chart: null, // Placeholder for chart generation
        },
        advisor_summary: {
          rule_based: `
            **Financial Health**: Your savings ratio is ${((dynamic_income - dynamic_expenses) / dynamic_income * 100).toFixed(2)}%.
            * Aim to save at least 20% of your income.
            * Prioritize high-priority goals like ${goals[0].description}.
            **Action Plan**: Review your ${Object.keys(dynamic_spending_categories)[0] || 'spending'} category to cut costs.
          `,
        },
        step_by_step_plan: [
          `Set up a monthly budget to track ${Object.keys(dynamic_spending_categories)[0] || 'spending'}.`,
          `Save ₹${(dynamic_income - dynamic_expenses).toFixed(2)} monthly towards ${goals[0].description}.`,
          'Review progress every 3 months.',
        ],
      };
    }

    // Merge transaction insights with API response
    if (transaction_insights && Object.keys(transaction_insights).length > 0) {
      apiResponse.analysis.category_insights = transaction_insights;
    }

    return new Response(JSON.stringify(apiResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process financial analysis",
        detail: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}