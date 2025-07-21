import { Transaction } from '../../lib/models/Transaction.js';
import { Category } from '../../lib/models/Category.js';

export async function GET({ request, url }) {
  try {
    const userId = 1; // Default user ID
    const searchParams = url.searchParams;
    
    const filters = {};
    if (searchParams.get('type')) filters.type = searchParams.get('type');
    if (searchParams.get('categoryId')) filters.categoryId = parseInt(searchParams.get('categoryId'));
    if (searchParams.get('startDate')) filters.startDate = searchParams.get('startDate');
    if (searchParams.get('endDate')) filters.endDate = searchParams.get('endDate');
    if (searchParams.get('limit')) filters.limit = parseInt(searchParams.get('limit'));
    
    const transactions = await Transaction.findByUser(userId, filters);
    
    return new Response(JSON.stringify(transactions), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
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
    
    const { categoryId, type, amount, description, date } = body;
    
    if (!categoryId || !type || !amount || !date) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const transactionId = await Transaction.create(userId, categoryId, type, amount, description, date);
    const transaction = await Transaction.findById(transactionId);
    
    return new Response(JSON.stringify(transaction), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Create transaction error:', error);
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
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Transaction ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const body = await request.json();
    const { categoryId, amount, description, date } = body;
    
    await Transaction.update(id, { categoryId, amount, description, date });
    const transaction = await Transaction.findById(id);
    
    return new Response(JSON.stringify(transaction), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE({ request, url }) {
  try {
    const searchParams = url.searchParams;
    const id = parseInt(searchParams.get('id'));
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Transaction ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    await Transaction.delete(id);
    
    return new Response(JSON.stringify({ message: 'Transaction deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 