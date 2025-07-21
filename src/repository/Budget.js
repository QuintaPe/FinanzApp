import {BaseRepository } from './BaseRepository.js';

export default class Budget extends BaseRepository {
  static async getBudgets() {
    if (!this.API_BASE) return [];
    return this.get('/budgets');
  }

  static async createBudget(budget) {
    return this.post('/budgets', budget);
  }
} 