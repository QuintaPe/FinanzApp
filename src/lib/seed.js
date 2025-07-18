import { db } from './database.js';

export async function seedDatabase() {
  try {
    console.log('Seeding database with sample data...');
    
    // Create a sample user
    const userId = await db.createUser('usuario@ejemplo.com', 'Usuario Ejemplo', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face');
    
    // Get categories
    const categories = await db.getCategories();
    const incomeCategories = categories.filter(c => c.type === 'income');
    const expenseCategories = categories.filter(c => c.type === 'expense');
    
    // Sample income transactions
    const incomeTransactions = [
      { categoryId: incomeCategories[0].id, amount: 3500, description: 'Salario mensual', date: '2024-01-15' },
      { categoryId: incomeCategories[0].id, amount: 3500, description: 'Salario mensual', date: '2024-02-15' },
      { categoryId: incomeCategories[0].id, amount: 3500, description: 'Salario mensual', date: '2024-03-15' },
      { categoryId: incomeCategories[1].id, amount: 800, description: 'Proyecto freelance', date: '2024-03-10' },
      { categoryId: incomeCategories[2].id, amount: 150, description: 'Dividendos inversiones', date: '2024-03-01' },
      { categoryId: incomeCategories[0].id, amount: 3500, description: 'Salario mensual', date: '2024-04-15' },
      { categoryId: incomeCategories[1].id, amount: 1200, description: 'Proyecto web', date: '2024-04-05' },
    ];
    
    // Sample expense transactions
    const expenseTransactions = [
      { categoryId: expenseCategories[0].id, amount: 450, description: 'Supermercado', date: '2024-01-05' },
      { categoryId: expenseCategories[0].id, amount: 380, description: 'Supermercado', date: '2024-01-20' },
      { categoryId: expenseCategories[1].id, amount: 120, description: 'Gasolina', date: '2024-01-10' },
      { categoryId: expenseCategories[2].id, amount: 850, description: 'Alquiler', date: '2024-01-01' },
      { categoryId: expenseCategories[3].id, amount: 60, description: 'Cine y restaurante', date: '2024-01-12' },
      { categoryId: expenseCategories[4].id, amount: 45, description: 'Consulta médica', date: '2024-01-18' },
      { categoryId: expenseCategories[5].id, amount: 200, description: 'Libros y cursos', date: '2024-01-25' },
      
      { categoryId: expenseCategories[0].id, amount: 420, description: 'Supermercado', date: '2024-02-05' },
      { categoryId: expenseCategories[0].id, amount: 390, description: 'Supermercado', date: '2024-02-20' },
      { categoryId: expenseCategories[1].id, amount: 110, description: 'Gasolina', date: '2024-02-10' },
      { categoryId: expenseCategories[2].id, amount: 850, description: 'Alquiler', date: '2024-02-01' },
      { categoryId: expenseCategories[6].id, amount: 180, description: 'Ropa nueva', date: '2024-02-15' },
      { categoryId: expenseCategories[3].id, amount: 80, description: 'Concierto', date: '2024-02-22' },
      
      { categoryId: expenseCategories[0].id, amount: 480, description: 'Supermercado', date: '2024-03-05' },
      { categoryId: expenseCategories[0].id, amount: 410, description: 'Supermercado', date: '2024-03-20' },
      { categoryId: expenseCategories[1].id, amount: 130, description: 'Gasolina', date: '2024-03-10' },
      { categoryId: expenseCategories[2].id, amount: 850, description: 'Alquiler', date: '2024-03-01' },
      { categoryId: expenseCategories[3].id, amount: 120, description: 'Videojuegos', date: '2024-03-08' },
      { categoryId: expenseCategories[4].id, amount: 35, description: 'Farmacia', date: '2024-03-15' },
      { categoryId: expenseCategories[7].id, amount: 75, description: 'Otros gastos', date: '2024-03-25' },
      
      { categoryId: expenseCategories[0].id, amount: 460, description: 'Supermercado', date: '2024-04-05' },
      { categoryId: expenseCategories[1].id, amount: 125, description: 'Gasolina', date: '2024-04-10' },
      { categoryId: expenseCategories[2].id, amount: 850, description: 'Alquiler', date: '2024-04-01' },
      { categoryId: expenseCategories[3].id, amount: 90, description: 'Cena con amigos', date: '2024-04-12' },
    ];
    
    // Insert income transactions
    for (const transaction of incomeTransactions) {
      await db.createTransaction(userId, transaction.categoryId, 'income', transaction.amount, transaction.description, transaction.date);
    }
    
    // Insert expense transactions
    for (const transaction of expenseTransactions) {
      await db.createTransaction(userId, transaction.categoryId, 'expense', transaction.amount, transaction.description, transaction.date);
    }
    
    // Create sample budgets
    const budgets = [
      { categoryId: expenseCategories[0].id, amount: 900, period: 'monthly', startDate: '2024-01-01' },
      { categoryId: expenseCategories[1].id, amount: 150, period: 'monthly', startDate: '2024-01-01' },
      { categoryId: expenseCategories[2].id, amount: 850, period: 'monthly', startDate: '2024-01-01' },
      { categoryId: expenseCategories[3].id, amount: 200, period: 'monthly', startDate: '2024-01-01' },
    ];
    
    for (const budget of budgets) {
      await db.createBudget(userId, budget.categoryId, budget.amount, budget.period, budget.startDate);
    }
    
    // Create sample financial goals
    const goals = [
      { name: 'Fondo de emergencia', targetAmount: 10000, deadline: '2024-12-31' },
      { name: 'Vacaciones de verano', targetAmount: 3000, deadline: '2024-07-31' },
      { name: 'Nuevo ordenador', targetAmount: 1500, deadline: '2024-06-30' },
    ];
    
    for (const goal of goals) {
      const goalId = await db.createGoal(userId, goal.name, goal.targetAmount, goal.deadline);
      
      // Add some progress to goals
      if (goal.name === 'Fondo de emergencia') {
        await db.updateGoalProgress(goalId, 3500);
      } else if (goal.name === 'Vacaciones de verano') {
        await db.updateGoalProgress(goalId, 1200);
      }
    }
    
    console.log('Database seeded successfully!');
    console.log(`Created user with ID: ${userId}`);
    console.log(`Inserted ${incomeTransactions.length} income transactions`);
    console.log(`Inserted ${expenseTransactions.length} expense transactions`);
    console.log(`Created ${budgets.length} budgets`);
    console.log(`Created ${goals.length} financial goals`);
    
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Run seeder if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().catch(console.error);
} 