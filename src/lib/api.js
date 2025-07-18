// API utility functions for making requests to the backend

// Determine the appropriate base URL for API calls
const getApiBase = () => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    return '/api';
  }
  
  // Check if we're in Astro's SSR environment
  if (typeof process !== 'undefined' && process.env.ASTRO_MODE === 'build') {
    // During build time, we can't make API calls, so we'll return empty data
    return null;
  }
  
  // For development server-side rendering, use localhost
  return 'http://localhost:4321/api';
};

const API_BASE = getApiBase();

export const api = {
  // Dashboard
  async getDashboardData() {
    if (!API_BASE) return { transactions: [], categories: [], stats: {} };
    
    const response = await fetch(`${API_BASE}/dashboard`);
    if (!response.ok) throw new Error('Failed to fetch dashboard data');
    return response.json();
  },

  // Transactions
  async getTransactions(filters = {}) {
    if (!API_BASE) return [];
    
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value);
      }
    });
    
    const response = await fetch(`${API_BASE}/transactions?${params}`);
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  },

  async createTransaction(transaction) {
    if (!API_BASE) throw new Error('API base not available');
    const response = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction)
    });
    if (!response.ok) throw new Error('Failed to create transaction');
    return response.json();
  },

  async updateTransaction(id, transaction) {
    if (!API_BASE) throw new Error('API base not available');
    const response = await fetch(`${API_BASE}/transactions?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction)
    });
    if (!response.ok) throw new Error('Failed to update transaction');
    return response.json();
  },

  async deleteTransaction(id) {
    if (!API_BASE) throw new Error('API base not available');
    const response = await fetch(`${API_BASE}/transactions?id=${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete transaction');
    return response.json();
  },

  // Categories
  async getCategories(type = null) {
    if (!API_BASE) return [];
    const params = type ? `?type=${type}` : '';
    const response = await fetch(`${API_BASE}/categories${params}`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  async createCategory(category) {
    if (!API_BASE) throw new Error('API base not available');
    const response = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category)
    });
    if (!response.ok) throw new Error('Failed to create category');
    return response.json();
  },

  // Budgets
  async getBudgets() {
    if (!API_BASE) return [];
    const response = await fetch(`${API_BASE}/budgets`);
    if (!response.ok) throw new Error('Failed to fetch budgets');
    return response.json();
  },

  async createBudget(budget) {
    if (!API_BASE) throw new Error('API base not available');
    const response = await fetch(`${API_BASE}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(budget)
    });
    if (!response.ok) throw new Error('Failed to create budget');
    return response.json();
  },

  // Goals
  async getGoals() {
    if (!API_BASE) return [];
    const response = await fetch(`${API_BASE}/goals`);
    if (!response.ok) throw new Error('Failed to fetch goals');
    return response.json();
  },

  async createGoal(goal) {
    if (!API_BASE) throw new Error('API base not available');
    const response = await fetch(`${API_BASE}/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goal)
    });
    if (!response.ok) throw new Error('Failed to create goal');
    return response.json();
  },

  async updateGoalProgress(id, currentAmount) {
    if (!API_BASE) throw new Error('API base not available');
    const response = await fetch(`${API_BASE}/goals?id=${id}&action=progress`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentAmount })
    });
    if (!response.ok) throw new Error('Failed to update goal progress');
    return response.json();
  },

  async updateGoalStatus(id, status) {
    if (!API_BASE) throw new Error('API base not available');
    const response = await fetch(`${API_BASE}/goals?id=${id}&action=status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update goal status');
    return response.json();
  },

  // Reports
  async getReport(type, startDate = null, endDate = null) {
    if (!API_BASE) return { data: [], summary: {} };
    const params = new URLSearchParams({ type });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await fetch(`${API_BASE}/reports?${params}`);
    if (!response.ok) throw new Error('Failed to fetch report');
    return response.json();
  }
};

// Utility functions for data formatting
export const formatters = {
  currency(amount) {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  },

  date(dateString) {
    return new Date(dateString).toLocaleDateString('es-ES');
  },

  percentage(value, total) {
    return ((value / total) * 100).toFixed(1);
  }
};

// Error handling utility
export const handleApiError = (error) => {
  console.error('API Error:', error);
  // You can add toast notifications or other error handling here
  return { error: error.message || 'An error occurred' };
}; 