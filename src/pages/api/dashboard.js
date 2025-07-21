// API endpoint for dashboard data
import { Transaction } from '../../lib/models/Transaction.js';
import { Category } from '../../lib/models/Category.js';

export async function GET({ request, url }) {
  try {
    const userId = 1; // Default user ID
    
    // Get current month data
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    // Get monthly totals
    const monthlyTotals = await Transaction.getMonthlyTotals(userId, currentYear, currentMonth);
    const totalIncome = monthlyTotals.total_income || 0;
    const totalExpense = monthlyTotals.total_expense || 0;
    const balance = totalIncome - totalExpense;
    
    // Get category breakdown for expenses
    const categoriesData = await Transaction.getCategoryBreakdown(userId, currentYear, currentMonth);
    
    // Get last 6 months data
    const monthlyData = await Transaction.getMonthlyTrend(userId, 6);
    
    // Get recent transactions
    const recentTransactions = await Transaction.getRecentTransactions(userId, 5);
    
    const dashboardData = {
      totalIncome,
      totalExpense,
      balance,
      categoriesData,
      monthlyData,
      recentTransactions
    };
    
    return new Response(JSON.stringify(dashboardData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get dashboard data error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
