import { db, initializeDatabase } from './database.js';

async function testDatabase() {
  try {
    console.log('🧪 Testing database connection...');
    
    // Initialize database
    await initializeDatabase();
    console.log('✅ Database initialized successfully');
    
    // Test user operations
    console.log('\n👤 Testing user operations...');
    const userId = await db.createUser('test@example.com', 'Test User', 'https://example.com/avatar.jpg');
    console.log(`✅ Created user with ID: ${userId}`);
    
    const user = await db.getUserById(userId);
    console.log(`✅ Retrieved user: ${user.name} (${user.email})`);
    
    // Test category operations
    console.log('\n📂 Testing category operations...');
    const categories = await db.getCategories();
    console.log(`✅ Found ${categories.length} categories`);
    
    const incomeCategories = await db.getCategories('income');
    const expenseCategories = await db.getCategories('expense');
    console.log(`✅ Income categories: ${incomeCategories.length}, Expense categories: ${expenseCategories.length}`);
    
    // Test transaction operations
    console.log('\n💰 Testing transaction operations...');
    if (incomeCategories.length > 0 && expenseCategories.length > 0) {
      const incomeId = await db.createTransaction(
        userId, 
        incomeCategories[0].id, 
        'income', 
        1000, 
        'Test income', 
        '2024-01-01'
      );
      console.log(`✅ Created income transaction with ID: ${incomeId}`);
      
      const expenseId = await db.createTransaction(
        userId, 
        expenseCategories[0].id, 
        'expense', 
        500, 
        'Test expense', 
        '2024-01-01'
      );
      console.log(`✅ Created expense transaction with ID: ${expenseId}`);
      
      const transactions = await db.getTransactions(userId);
      console.log(`✅ Found ${transactions.length} transactions`);
    }
    
    // Test dashboard data
    console.log('\n📊 Testing dashboard data...');
    const dashboardData = await db.getDashboardData(userId);
    console.log(`✅ Dashboard data: Income: ${dashboardData.totalIncome}, Expense: ${dashboardData.totalExpense}, Balance: ${dashboardData.balance}`);
    
    // Test budget operations
    console.log('\n📈 Testing budget operations...');
    if (expenseCategories.length > 0) {
      const budgetId = await db.createBudget(
        userId, 
        expenseCategories[0].id, 
        1000, 
        'monthly', 
        '2024-01-01'
      );
      console.log(`✅ Created budget with ID: ${budgetId}`);
      
      const budgets = await db.getBudgets(userId);
      console.log(`✅ Found ${budgets.length} budgets`);
    }
    
    // Test goal operations
    console.log('\n🎯 Testing goal operations...');
    const goalId = await db.createGoal(userId, 'Test Goal', 5000, '2024-12-31');
    console.log(`✅ Created goal with ID: ${goalId}`);
    
    await db.updateGoalProgress(goalId, 1000);
    console.log('✅ Updated goal progress');
    
    const goals = await db.getGoals(userId);
    console.log(`✅ Found ${goals.length} goals`);
    
    console.log('\n🎉 All database tests passed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Users: 1`);
    console.log(`- Categories: ${categories.length}`);
    console.log(`- Transactions: ${incomeCategories.length > 0 ? '2' : '0'}`);
    console.log(`- Budgets: ${expenseCategories.length > 0 ? '1' : '0'}`);
    console.log(`- Goals: 1`);
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testDatabase().catch(console.error);
} 