import { BaseRepository } from './BaseRepository.js';

export default class Transaction extends BaseRepository {
  static async getTransactions(filters = {}) {
    if (!this.API_BASE) return [];
    return this.get('/transactions', filters);
  }

  static async createTransaction(transaction) {
    return this.post('/transactions', transaction);
  }

  static async updateTransaction(id, transaction) {
    return this.put(`/transactions?id=${id}`, transaction);
  }

  static async deleteTransaction(id) {
    return this.delete(`/transactions?id=${id}`);
  }
} 