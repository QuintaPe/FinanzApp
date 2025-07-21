import { Budget } from '../../lib/models/Budget.js';

export async function GET({ request, url }) {
  try {
    const userId = 1; // Default user ID
    const budgets = await Budget.findByUser(userId);
    
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
    
    const budgetId = await Budget.create(userId, categoryId, amount, period, startDate, endDate);
    const budget = await Budget.findById(budgetId);
    
    return new Response(JSON.stringify(budget), {
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