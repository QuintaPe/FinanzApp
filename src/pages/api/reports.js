import { Transaction } from '../../lib/models/Transaction.js';

export async function GET({ request, url }) {
  try {
    const userId = 1; // Default user ID
    const searchParams = url.searchParams;
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    if (!type) {
      return new Response(JSON.stringify({ error: 'Report type is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    let data = [];
    let summary = {};
    
    if (type === 'monthly') {
      // Get monthly breakdown
      const monthlyData = await Transaction.getMonthlyTrend(userId, 12);
      data = monthlyData;
      summary = {
        totalMonths: monthlyData.length,
        averageIncome: monthlyData.reduce((sum, month) => sum + (month.income || 0), 0) / monthlyData.length,
        averageExpense: monthlyData.reduce((sum, month) => sum + (month.expense || 0), 0) / monthlyData.length
      };
    } else if (type === 'category') {
      // Get category breakdown for the specified period
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      
      const categoryData = await Transaction.getCategoryBreakdown(userId, currentYear, currentMonth);
      data = categoryData;
      summary = {
        totalCategories: categoryData.length,
        totalAmount: categoryData.reduce((sum, cat) => sum + (cat.total || 0), 0)
      };
    } else if (type === 'transactions') {
      // Get transactions for the specified period
      const filters = {};
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      
      data = await Transaction.findByUser(userId, filters);
      summary = {
        totalTransactions: data.length,
        totalIncome: data.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0),
        totalExpense: data.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0)
      };
    }
    
    return new Response(JSON.stringify({ data, summary }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get report error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 