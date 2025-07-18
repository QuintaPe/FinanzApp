import { db } from '../../lib/database.js';

export async function GET({ request, url }) {
  try {
    const userId = 1; // Default user ID
    const budgets = await db.getBudgets(userId);
    
    return new Response(JSON.stringify(budgets), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get budgets error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST({ request }) {
  try {
    const userId = 1; // Default user ID
    const body = await request.json();
    const { categoryId, amount, period, startDate, endDate } = body;
    
    if (!categoryId || !amount || !period || !startDate) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!['monthly', 'yearly'].includes(period)) {
      return new Response(JSON.stringify({ error: 'Period must be either "monthly" or "yearly"' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const budgetId = await db.createBudget(userId, categoryId, amount, period, startDate, endDate);
    const budgets = await db.getBudgets(userId);
    const newBudget = budgets.find(budget => budget.id === budgetId);
    
    return new Response(JSON.stringify(newBudget), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Create budget error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 