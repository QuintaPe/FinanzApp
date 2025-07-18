import { db } from '../../lib/database.js';

export async function GET({ request, url }) {
  try {
    const userId = 1; // Default user ID
    const goals = await db.getGoals(userId);
    
    return new Response(JSON.stringify(goals), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get goals error:', error);
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
    const { name, targetAmount, deadline } = body;
    
    if (!name || !targetAmount) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const goalId = await db.createGoal(userId, name, targetAmount, deadline);
    const goals = await db.getGoals(userId);
    const newGoal = goals.find(goal => goal.id === goalId);
    
    return new Response(JSON.stringify(newGoal), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Create goal error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function PUT({ request, url }) {
  try {
    const searchParams = url.searchParams;
    const id = parseInt(searchParams.get('id'));
    const action = searchParams.get('action'); // 'progress' or 'status'
    
    if (!id || !action) {
      return new Response(JSON.stringify({ error: 'Goal ID and action are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const body = await request.json();
    
    if (action === 'progress') {
      const { currentAmount } = body;
      await db.updateGoalProgress(id, currentAmount);
    } else if (action === 'status') {
      const { status } = body;
      if (!['active', 'completed', 'paused'].includes(status)) {
        return new Response(JSON.stringify({ error: 'Invalid status' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      await db.updateGoalStatus(id, status);
    }
    
    const goals = await db.getGoals(1);
    const updatedGoal = goals.find(goal => goal.id === id);
    
    return new Response(JSON.stringify(updatedGoal), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Update goal error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 