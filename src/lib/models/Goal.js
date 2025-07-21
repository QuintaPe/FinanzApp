import { BaseModel } from './Database.js';

export class Goal extends BaseModel {
  static tableName = 'financial_goals';
  static primaryKey = 'id';

  static async create(userId, name, targetAmount, currentAmount, deadline, categoryId = null) {
    return super.create({ 
      user_id: userId, 
      name, 
      target_amount: targetAmount, 
      current_amount: currentAmount, 
      deadline, 
      category_id: categoryId 
    });
  }

  static async findById(id) {
    const result = await this.executeQuery(`
      SELECT g.*, c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM financial_goals g
      LEFT JOIN categories c ON g.category_id = c.id
      WHERE g.id = ?
    `, [id]);
    return result.rows[0];
  }

  static async findByUser(userId) {
    const result = await this.executeQuery(`
      SELECT g.*, c.name as category_name, c.color as category_color, c.icon as category_icon,
             ROUND((g.current_amount * 100.0 / g.target_amount), 1) as progress
      FROM financial_goals g
      LEFT JOIN categories c ON g.category_id = c.id
      WHERE g.user_id = ?
      ORDER BY g.deadline ASC, g.created_at DESC
    `, [userId]);
    return result.rows;
  }

  static async update(id, data) {
    const { name, targetAmount, currentAmount, deadline, categoryId } = data;
    const updateData = { 
      name, 
      target_amount: targetAmount, 
      current_amount: currentAmount, 
      deadline, 
      category_id: categoryId,
      updated_at: 'CURRENT_TIMESTAMP'
    };
    return super.update(id, updateData);
  }

  static async delete(id) {
    return super.delete(id);
  }

  static async getActiveGoals(userId) {
    const result = await this.executeQuery(`
      SELECT g.*, c.name as category_name, c.color as category_color, c.icon as category_icon,
             ROUND((g.current_amount * 100.0 / g.target_amount), 1) as progress
      FROM financial_goals g
      LEFT JOIN categories c ON g.category_id = c.id
      WHERE g.user_id = ? 
      AND g.deadline >= date('now')
      AND g.current_amount < g.target_amount
      ORDER BY g.deadline ASC
    `, [userId]);
    return result.rows;
  }
}
