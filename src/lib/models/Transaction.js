import { BaseModel } from './Database.js';

export class Transaction extends BaseModel {
  static tableName = 'transactions';
  static primaryKey = 'id';

  static async create(userId, categoryId, type, amount, description, date) {
    return super.create({ user_id: userId, category_id: categoryId, type, amount, description, date });
  }

  static async findById(id) {
    const result = await this.executeQuery(`
      SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?
    `, [id]);
    return result.rows[0];
  }

  static async findByUser(userId, filters = {}) {
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

    const result = await this.executeQuery(sql, args);
    return result.rows;
  }

  static async update(id, data) {
    const updateData = { ...data, updated_at: 'CURRENT_TIMESTAMP' };
    return super.update(id, updateData);
  }

  static async getMonthlyTotals(userId, year, month) {
    const result = await this.executeQuery(`
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
      FROM transactions 
      WHERE user_id = ? AND strftime('%Y-%m', date) = ?
    `, [userId, `${year}-${month.toString().padStart(2, '0')}`]);
    return result.rows[0];
  }

  static async getCategoryBreakdown(userId, year, month) {
    const result = await this.executeQuery(`
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
    `, [userId, `${year}-${month.toString().padStart(2, '0')}`]);
    return result.rows;
  }

  static async getMonthlyTrend(userId, months = 6) {
    const result = await this.executeQuery(`
      SELECT 
        strftime('%Y-%m', date) as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM transactions 
      WHERE user_id = ? 
      AND date >= date('now', '-${months} months')
      GROUP BY strftime('%Y-%m', date)
      ORDER BY month DESC
    `, [userId]);
    return result.rows;
  }

  static async getRecentTransactions(userId, limit = 5) {
    return this.findByUser(userId, { limit });
  }

  static async getTransactionsByDateRange(userId, startDate, endDate) {
    return this.findByUser(userId, { startDate, endDate });
  }
} 