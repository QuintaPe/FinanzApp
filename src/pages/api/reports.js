import { db } from '../../lib/database.js';

export async function GET({ request, url }) {
  try {
    const userId = 1; // Default user ID
    const searchParams = url.searchParams;
    const reportType = searchParams.get('type'); // 'monthly', 'category', 'trend'
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    let reportData = {};
    
    switch (reportType) {
      case 'monthly':
        reportData = await getMonthlyReport(userId, startDate, endDate);
        break;
      case 'category':
        reportData = await getCategoryReport(userId, startDate, endDate);
        break;
      case 'trend':
        reportData = await getTrendReport(userId, startDate, endDate);
        break;
      default:
        return new Response(JSON.stringify({ error: 'Invalid report type' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }
    
    return new Response(JSON.stringify(reportData), {
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

async function getMonthlyReport(userId, startDate, endDate) {
  const filters = {};
  if (startDate) filters.startDate = startDate;
  if (endDate) filters.endDate = endDate;
  
  const transactions = await db.getTransactions(userId, filters);
  
  const monthlyData = {};
  transactions.forEach(transaction => {
    const month = transaction.date.slice(0, 7); // YYYY-MM
    if (!monthlyData[month]) {
      monthlyData[month] = { income: 0, expense: 0 };
    }
    
    if (transaction.type === 'income') {
      monthlyData[month].income += transaction.amount;
    } else {
      monthlyData[month].expense += transaction.amount;
    }
  });
  
  return {
    type: 'monthly',
    data: Object.entries(monthlyData).map(([month, data]) => ({
      month,
      income: data.income,
      expense: data.expense,
      balance: data.income - data.expense
    }))
  };
}

async function getCategoryReport(userId, startDate, endDate) {
  const filters = {};
  if (startDate) filters.startDate = startDate;
  if (endDate) filters.endDate = endDate;
  
  const transactions = await db.getTransactions(userId, filters);
  
  const categoryData = {};
  transactions.forEach(transaction => {
    const categoryKey = `${transaction.type}_${transaction.category_id}`;
    if (!categoryData[categoryKey]) {
      categoryData[categoryKey] = {
        category_name: transaction.category_name,
        category_color: transaction.category_color,
        category_icon: transaction.category_icon,
        type: transaction.type,
        total: 0,
        count: 0
      };
    }
    
    categoryData[categoryKey].total += transaction.amount;
    categoryData[categoryKey].count += 1;
  });
  
  return {
    type: 'category',
    data: Object.values(categoryData).sort((a, b) => b.total - a.total)
  };
}

async function getTrendReport(userId, startDate, endDate) {
  const filters = {};
  if (startDate) filters.startDate = startDate;
  if (endDate) filters.endDate = endDate;
  
  const transactions = await db.getTransactions(userId, filters);
  
  // Group by day
  const dailyData = {};
  transactions.forEach(transaction => {
    const date = transaction.date;
    if (!dailyData[date]) {
      dailyData[date] = { income: 0, expense: 0 };
    }
    
    if (transaction.type === 'income') {
      dailyData[date].income += transaction.amount;
    } else {
      dailyData[date].expense += transaction.amount;
    }
  });
  
  // Calculate moving averages
  const dates = Object.keys(dailyData).sort();
  const movingAverages = [];
  
  for (let i = 6; i < dates.length; i++) {
    const weekDates = dates.slice(i - 6, i + 1);
    const weekIncome = weekDates.reduce((sum, date) => sum + dailyData[date].income, 0) / 7;
    const weekExpense = weekDates.reduce((sum, date) => sum + dailyData[date].expense, 0) / 7;
    
    movingAverages.push({
      date: dates[i],
      income_avg: weekIncome,
      expense_avg: weekExpense,
      balance_avg: weekIncome - weekExpense
    });
  }
  
  return {
    type: 'trend',
    daily_data: Object.entries(dailyData).map(([date, data]) => ({
      date,
      income: data.income,
      expense: data.expense,
      balance: data.income - data.expense
    })),
    moving_averages: movingAverages
  };
} 