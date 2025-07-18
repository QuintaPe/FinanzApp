import { db } from '../../lib/database.js';

export async function GET({ request, url }) {
  try {
    const searchParams = url.searchParams;
    const type = searchParams.get('type'); // 'income' or 'expense'
    
    const categories = await db.getCategories(type);
    
    return new Response(JSON.stringify(categories), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST({ request }) {
  try {
    const body = await request.json();
    const { name, type, color, icon } = body;
    
    if (!name || !type || !color) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!['income', 'expense'].includes(type)) {
      return new Response(JSON.stringify({ error: 'Type must be either "income" or "expense"' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const categoryId = await db.createCategory(name, type, color, icon);
    const categories = await db.getCategories();
    const newCategory = categories.find(cat => cat.id === categoryId);
    
    return new Response(JSON.stringify(newCategory), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Create category error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 