// API endpoint for dashboard data
import { db } from '../../lib/database.js';

export async function GET({ request }) {
  try {
    // For now, we'll use a default user ID (1) - in a real app, this would come from authentication
    const userId = 1;
    const data = await db.getDashboardData(userId);
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
