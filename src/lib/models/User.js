import { BaseModel } from './Database.js';

export class User extends BaseModel {
  static tableName = 'users';
  static primaryKey = 'id';

  static async create(email, name, avatar = null) {
    return super.create({ email, name, avatar });
  }

  static async findByEmail(email) {
    return this.findOne('email = ?', [email]);
  }

  static async update(id, data) {
    const updateData = { ...data, updated_at: 'CURRENT_TIMESTAMP' };
    return super.update(id, updateData);
  }

  static async getAll() {
    return super.getAll('created_at DESC');
  }
} 