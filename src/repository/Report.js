import {BaseRepository } from './BaseRepository.js';

export default class Report extends BaseRepository {
  static async getReport(type, startDate = null, endDate = null) {
    if (!this.API_BASE) return { data: [], summary: {} };
    
    const params = { type };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    return this.get('/reports', params);
  }
} 