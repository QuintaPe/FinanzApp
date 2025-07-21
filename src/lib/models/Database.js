import { createClient } from '@libsql/client';

// Turso database configuration
const client = createClient({
  url: import.meta.env.TURSO_DATABASE_URL,
  authToken: import.meta.env.TURSO_AUTH_TOKEN,
});

// Base Model class with core functionality
export class BaseModel {
  static tableName = '';
  static primaryKey = 'id';

  // Core CRUD operations
  static async create(data) {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map(() => '?').join(', ');
    
    const result = await client.execute({
      sql: `INSERT INTO ${this.tableName} (${columns.join(', ')}) VALUES (${placeholders})`,
      args: values
    });
    return result.lastInsertRowid;
  }

  static async findById(id) {
    const result = await client.execute({
      sql: `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} = ?`,
      args: [id]
    });
    return result.rows[0];
  }

  static async update(id, data) {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const setClause = columns.map(col => `${col} = ?`).join(', ');
    
    await client.execute({
      sql: `UPDATE ${this.tableName} SET ${setClause} WHERE ${this.primaryKey} = ?`,
      args: [...values, id]
    });
  }

  static async delete(id) {
    await client.execute({
      sql: `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = ?`,
      args: [id]
    });
  }

  static async getAll(orderBy = null) {
    let sql = `SELECT * FROM ${this.tableName}`;
    if (orderBy) {
      sql += ` ORDER BY ${orderBy}`;
    }
    
    const result = await client.execute({ sql });
    return result.rows;
  }

  static async findOne(whereClause, args = []) {
    const result = await client.execute({
      sql: `SELECT * FROM ${this.tableName} WHERE ${whereClause} LIMIT 1`,
      args
    });
    return result.rows[0];
  }

  static async findMany(whereClause = null, args = [], orderBy = null, limit = null) {
    let sql = `SELECT * FROM ${this.tableName}`;
    
    if (whereClause) {
      sql += ` WHERE ${whereClause}`;
    }
    
    if (orderBy) {
      sql += ` ORDER BY ${orderBy}`;
    }
    
    if (limit) {
      sql += ` LIMIT ${limit}`;
    }
    
    const result = await client.execute({ sql, args });
    return result.rows;
  }

  static async count(whereClause = null, args = []) {
    let sql = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    
    if (whereClause) {
      sql += ` WHERE ${whereClause}`;
    }
    
    const result = await client.execute({ sql, args });
    return result.rows[0].count;
  }

  static async exists(whereClause, args = []) {
    const count = await this.count(whereClause, args);
    return count > 0;
  }

  // Raw query execution
  static async executeQuery(sql, args = []) {
    const result = await client.execute({ sql, args });
    return result;
  }

  // Transaction support
  static async transaction(callback) {
    await client.execute({ sql: 'BEGIN TRANSACTION' });
    try {
      const result = await callback();
      await client.execute({ sql: 'COMMIT' });
      return result;
    } catch (error) {
      await client.execute({ sql: 'ROLLBACK' });
      throw error;
    }
  }
}

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

// Export the client for use in models
export { client }; 