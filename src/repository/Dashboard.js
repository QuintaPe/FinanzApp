import {BaseRepository } from './BaseRepository.js';

export default class Dashboard extends BaseRepository {
  static async getDashboardData() {
    if (!this.API_BASE) return { transactions: [], categories: [], stats: {} };
    return this.get('/dashboard');
  }
} 