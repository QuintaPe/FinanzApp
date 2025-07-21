import { Goal } from '../../lib/models/Goal.js';

export async function GET({ request, url }) {
  try {
    const userId = 1; // Default user ID
    const goals = await Goal.findByUser(userId);
    
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
    
    const goalId = await Goal.create(userId, name, targetAmount, deadline);
    const goal = await Goal.findById(goalId);
    
    return new Response(JSON.stringify(goal), {
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
    const action = searchParams.get('action');
    
    if (!id || !action) {
      return new Response(JSON.stringify({ error: 'ID and action are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const body = await request.json();
    
    if (action === 'progress') {
      const { currentAmount } = body;
      await Goal.updateProgress(id, currentAmount);
    } else if (action === 'status') {
      const { status } = body;
      await Goal.updateStatus(id, status);
    } else {
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const goal = await Goal.findById(id);
    
    return new Response(JSON.stringify(goal), {
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