import { BaseRepository } from './BaseRepository.js';

export default class Category extends BaseRepository {
  static async getCategories(type = null) {
    if (!this.API_BASE) return [];
    const params = type ? { type } : {};
    return this.get('/categories', params);
  }

  static async createCategory(category) {
    return this.post('/categories', category);
  }
} 