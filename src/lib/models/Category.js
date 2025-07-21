import { BaseModel } from './Database.js';

export class Category extends BaseModel {
  static tableName = 'categories';
  static primaryKey = 'id';

  static async create(name, type, color, icon) {
    return super.create({ name, type, color, icon });
  }

  static async findByType(type) {
    return this.findMany('type = ?', [type], 'name');
  }

  static async update(id, data) {
    return super.update(id, data);
  }

  static async delete(id) {
    // Check if category is being used in transactions
    const transactionCount = await this.executeQuery(
      'SELECT COUNT(*) as count FROM transactions WHERE category_id = ?',
      [id]
    );

    if (transactionCount.rows[0].count > 0) {
      throw new Error('Cannot delete category that has associated transactions');
    }

    // Check if category is being used in budgets
    const budgetCount = await this.executeQuery(
      'SELECT COUNT(*) as count FROM budgets WHERE category_id = ?',
      [id]
    );

    if (budgetCount.rows[0].count > 0) {
      throw new Error('Cannot delete category that has associated budgets');
    }

    return super.delete(id);
  }

  static async getAll() {
    return super.getAll('type, name');
  }

  static async getIncomeCategories() {
    return this.findByType('income');
  }

  static async getExpenseCategories() {
    return this.findByType('expense');
  }
} 