import { createClient } from '@libsql/client';

// Turso database configuration
const client = createClient({
  url: "libsql://finanzapp-quintape.aws-eu-west-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJleHAiOjE3ODQzODAwNDksImlhdCI6MTc1Mjg0NDA0OSwiaWQiOiI0OTViOTIwNC0xZWRhLTQyNDYtYTYyZi01MjdiMGI3MThkM2QiLCJyaWQiOiI2ZjljZTA2Ny0zNjkxLTRmYTYtODYwYS02MTI4NzM5YWU0Y2QifQ.2nkMMT2kq4Afs1JNrvDg0OI6UFKQEAsPT6nbaNTPjGTtSJf4JMlbvmF4fjALjknwlpeWBYbMMu588Y1rHro5Bw",
});

// Initialize database with tables
export async function initializeDatabase() {
  try {
    // Users table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        avatar TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Categories table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
        color TEXT NOT NULL,
        icon TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Transactions table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
        amount DECIMAL(10,2) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (category_id) REFERENCES categories (id)
      )
    `);

    // Budgets table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        period TEXT NOT NULL CHECK (period IN ('monthly', 'yearly')),
        start_date DATE NOT NULL,
        end_date DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (category_id) REFERENCES categories (id)
      )
    `);

    // Financial Goals table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS financial_goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        target_amount DECIMAL(10,2) NOT NULL,
        current_amount DECIMAL(10,2) DEFAULT 0,
        deadline DATE,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Insert default categories
    await insertDefaultCategories();
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Insert default categories
async function insertDefaultCategories() {
  const defaultCategories = [
    // Income categories
    { name: 'Salario', type: 'income', color: '#10B981', icon: '💰' },
    { name: 'Freelance', type: 'income', color: '#3B82F6', icon: '💼' },
    { name: 'Inversiones', type: 'income', color: '#8B5CF6', icon: '📈' },
    { name: 'Otros Ingresos', type: 'income', color: '#06B6D4', icon: '🎯' },
    
    // Expense categories
    { name: 'Comida', type: 'expense', color: '#EF4444', icon: '🍽️' },
    { name: 'Transporte', type: 'expense', color: '#F59E0B', icon: '🚗' },
    { name: 'Vivienda', type: 'expense', color: '#8B5CF6', icon: '🏠' },
    { name: 'Entretenimiento', type: 'expense', color: '#EC4899', icon: '🎮' },
    { name: 'Salud', type: 'expense', color: '#10B981', icon: '🏥' },
    { name: 'Educación', type: 'expense', color: '#3B82F6', icon: '📚' },
    { name: 'Ropa', type: 'expense', color: '#F97316', icon: '👕' },
    { name: 'Otros', type: 'expense', color: '#6B7280', icon: '📦' }
  ];

  for (const category of defaultCategories) {
    try {
      await client.execute({
        sql: 'INSERT OR IGNORE INTO categories (name, type, color, icon) VALUES (?, ?, ?, ?)',
        args: [category.name, category.type, category.color, category.icon]
      });
    } catch (error) {
      console.log(`Category ${category.name} already exists or error:`, error);
    }
  }
}

// Database operations
export const db = {
  // User operations
  async createUser(email, name, avatar = null) {
    const result = await client.execute({
      sql: 'INSERT INTO users (email, name, avatar) VALUES (?, ?, ?)',
      args: [email, name, avatar]
    });
    return result.lastInsertRowid;
  },

  async getUserById(id) {
    const result = await client.execute({
      sql: 'SELECT * FROM users WHERE id = ?',
      args: [id]
    });
    return result.rows[0];
  },

  async getUserByEmail(email) {
    const result = await client.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [email]
    });
    return result.rows[0];
  },

  // Category operations
  async getCategories(type = null) {
    let sql = 'SELECT * FROM categories';
    let args = [];
    
    if (type) {
      sql += ' WHERE type = ?';
      args.push(type);
    }
    
    sql += ' ORDER BY name';
    
    const result = await client.execute({ sql, args });
    return result.rows;
  },

  async createCategory(name, type, color, icon) {
    const result = await client.execute({
      sql: 'INSERT INTO categories (name, type, color, icon) VALUES (?, ?, ?, ?)',
      args: [name, type, color, icon]
    });
    return result.lastInsertRowid;
  },

  // Transaction operations
  async createTransaction(userId, categoryId, type, amount, description, date) {
    const result = await client.execute({
      sql: 'INSERT INTO transactions (user_id, category_id, type, amount, description, date) VALUES (?, ?, ?, ?, ?, ?)',
      args: [userId, categoryId, type, amount, description, date]
    });
    return result.lastInsertRowid;
  },

  async getTransactions(userId, filters = {}) {
    let sql = `
      SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ?
    `;
    let args = [userId];

    if (filters.type) {
      sql += ' AND t.type = ?';
      args.push(filters.type);
    }

    if (filters.categoryId) {
      sql += ' AND t.category_id = ?';
      args.push(filters.categoryId);
    }

    if (filters.startDate) {
      sql += ' AND t.date >= ?';
      args.push(filters.startDate);
    }

    if (filters.endDate) {
      sql += ' AND t.date <= ?';
      args.push(filters.endDate);
    }

    sql += ' ORDER BY t.date DESC, t.created_at DESC';

    if (filters.limit) {
      sql += ' LIMIT ?';
      args.push(filters.limit);
    }

    const result = await client.execute({ sql, args });
    return result.rows;
  },

  async getTransactionById(id) {
    const result = await client.execute({
      sql: `
        SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.id = ?
      `,
      args: [id]
    });
    return result.rows[0];
  },

  async updateTransaction(id, categoryId, amount, description, date) {
    await client.execute({
      sql: 'UPDATE transactions SET category_id = ?, amount = ?, description = ?, date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      args: [categoryId, amount, description, date, id]
    });
  },

  async deleteTransaction(id) {
    await client.execute({
      sql: 'DELETE FROM transactions WHERE id = ?',
      args: [id]
    });
  },

  // Dashboard data
  async getDashboardData(userId) {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    
    // Get monthly totals
    const monthlyResult = await client.execute({
      sql: `
        SELECT 
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
        FROM transactions 
        WHERE user_id = ? AND strftime('%Y-%m', date) = ?
      `,
      args: [userId, currentMonth]
    });

    const monthlyData = monthlyResult.rows[0];
    const totalIncome = monthlyData.total_income || 0;
    const totalExpense = monthlyData.total_expense || 0;
    const balance = totalIncome - totalExpense;

    // Get category breakdown for expenses
    const categoryResult = await client.execute({
      sql: `
        SELECT 
          c.name,
          c.color,
          c.icon,
          SUM(t.amount) as total
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = ? AND t.type = 'expense' AND strftime('%Y-%m', t.date) = ?
        GROUP BY c.id, c.name, c.color, c.icon
        ORDER BY total DESC
      `,
      args: [userId, currentMonth]
    });

    // Get last 6 months data
    const monthlyTrendResult = await client.execute({
      sql: `
        SELECT 
          strftime('%Y-%m', date) as month,
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
        FROM transactions 
        WHERE user_id = ? 
        AND date >= date('now', '-6 months')
        GROUP BY strftime('%Y-%m', date)
        ORDER BY month DESC
      `,
      args: [userId]
    });

    // Get recent transactions
    const recentTransactions = await this.getTransactions(userId, { limit: 5 });

    return {
      totalIncome,
      totalExpense,
      balance,
      categoriesData: categoryResult.rows,
      monthlyData: monthlyTrendResult.rows,
      recentTransactions
    };
  },

  // Budget operations
  async createBudget(userId, categoryId, amount, period, startDate, endDate = null) {
    const result = await client.execute({
      sql: 'INSERT INTO budgets (user_id, category_id, amount, period, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)',
      args: [userId, categoryId, amount, period, startDate, endDate]
    });
    return result.lastInsertRowid;
  },

  async getBudgets(userId) {
    const result = await client.execute({
      sql: `
        SELECT b.*, c.name as category_name, c.color as category_color,
               (SELECT SUM(amount) FROM transactions 
                WHERE user_id = b.user_id AND category_id = b.category_id 
                AND date >= b.start_date AND (b.end_date IS NULL OR date <= b.end_date)) as spent
        FROM budgets b
        JOIN categories c ON b.category_id = c.id
        WHERE b.user_id = ?
        ORDER BY b.created_at DESC
      `,
      args: [userId]
    });
    return result.rows;
  },

  // Financial Goals operations
  async createGoal(userId, name, targetAmount, deadline = null) {
    const result = await client.execute({
      sql: 'INSERT INTO financial_goals (user_id, name, target_amount, deadline) VALUES (?, ?, ?, ?)',
      args: [userId, name, targetAmount, deadline]
    });
    return result.lastInsertRowid;
  },

  async getGoals(userId) {
    const result = await client.execute({
      sql: 'SELECT * FROM financial_goals WHERE user_id = ? ORDER BY created_at DESC',
      args: [userId]
    });
    return result.rows;
  },

  async updateGoalProgress(id, currentAmount) {
    await client.execute({
      sql: 'UPDATE financial_goals SET current_amount = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      args: [currentAmount, id]
    });
  },

  async updateGoalStatus(id, status) {
    await client.execute({
      sql: 'UPDATE financial_goals SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      args: [status, id]
    });
  }
};

// Initialize database on module load
initializeDatabase().catch(console.error);
