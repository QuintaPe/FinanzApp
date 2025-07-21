import { BaseModel } from './Database.js';

export class Budget extends BaseModel {
  static tableName = 'budgets';
  static primaryKey = 'id';

  static async create(userId, categoryId, amount, period, startDate, endDate = null) {
    return super.create({ user_id: userId, category_id: categoryId, amount, period, start_date: startDate, end_date: endDate });
  }

  static async findById(id) {
    const result = await this.executeQuery(`
      SELECT b.*, c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      WHERE b.id = ?
    `, [id]);
    return result.rows[0];
  }

  static async findByUser(userId) {
    const result = await this.executeQuery(`
      SELECT b.*, c.name as category_name, c.color as category_color, c.icon as category_icon,
             (SELECT SUM(amount) FROM transactions 
              WHERE user_id = b.user_id AND category_id = b.category_id 
              AND date >= b.start_date AND (b.end_date IS NULL OR date <= b.end_date)) as spent
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `, [userId]);
    return result.rows;
  }

  static async update(id, data) {
    const { categoryId, amount, period, startDate, endDate } = data;
    return super.update(id, { 
      category_id: categoryId, 
      amount, 
      period, 
      start_date: startDate, 
      end_date: endDate 
    });
  }

  static async delete(id) {
    await super.delete(id);
  }

  static async getActiveBudgets(userId) {
    const result = await this.executeQuery(`
      SELECT b.*, c.name as category_name, c.color as category_color, c.icon as category_icon,
             (SELECT SUM(amount) FROM transactions 
              WHERE user_id = b.user_id AND category_id = b.category_id 
              AND date >= b.start_date AND (b.end_date IS NULL OR date <= b.end_date)) as spent
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      WHERE b.user_id = ? AND (b.end_date IS NULL OR b.end_date >= date('now'))
      ORDER BY b.created_at DESC
    `, [userId]);
    return result.rows;
  }

  static async getBudgetProgress(userId, budgetId) {
    const budget = await this.findById(budgetId);
    if (!budget) return null;

    const spentResult = await this.executeQuery(`
      SELECT SUM(amount) as total_spent
      FROM transactions 
      WHERE user_id = ? AND category_id = ? 
      AND date >= ? AND (? IS NULL OR date <= ?)
    `, [userId, budget.category_id, budget.start_date, budget.end_date, budget.end_date]);

    const spent = spentResult.rows[0].total_spent || 0;
    const remaining = budget.amount - spent;
    const percentage = (spent / budget.amount) * 100;

    return {
      ...budget,
      spent,
      remaining,
      percentage: Math.min(percentage, 100)
    };
  }

  static async getBudgetsByCategory(userId, categoryId) {
    const result = await this.executeQuery(`
      SELECT b.*, c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      WHERE b.user_id = ? AND b.category_id = ?
      ORDER BY b.created_at DESC
    `, [userId, categoryId]);
    return result.rows;
  }
} 