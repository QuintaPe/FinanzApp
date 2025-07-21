import {BaseRepository } from './BaseRepository.js';

export default class Goal extends BaseRepository {
  static async getGoals() {
    if (!this.API_BASE) return [];
    return this.get('/goals');
  }

  static async createGoal(goal) {
    return this.post('/goals', goal);
  }

  static async updateGoalProgress(id, currentAmount) {
    return this.put(`/goals?id=${id}&action=progress`, { currentAmount });
  }

  static async updateGoalStatus(id, status) {
    return this.put(`/goals?id=${id}&action=status`, { status });
  }
} 