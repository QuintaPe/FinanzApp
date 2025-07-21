const API_BASE = import.meta.env.PUBLIC_API_BASE;

export class BaseRepository {
  static get API_BASE() {
    return API_BASE;
  }

  static async makeRequest(endpoint, options = {}) {
    if (!API_BASE) {
      throw new Error('API base not available');
    }

    const url = `${API_BASE}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };
    console.log(url, defaultOptions, options);
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  static async get(endpoint, params = {}) {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        urlParams.append(key, value);
      }
    });

    const queryString = urlParams.toString();
    const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;

    return this.makeRequest(fullEndpoint, { method: 'GET' });
  }

  static async post(endpoint, data) {
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static async put(endpoint, data) {
    return this.makeRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  static async delete(endpoint) {
    return this.makeRequest(endpoint, { method: 'DELETE' });
  }
} 