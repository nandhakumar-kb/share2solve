// API Configuration and Service Layer
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.adminPassword = null;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Public endpoints
  async getProblems(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.limit) params.append('limit', filters.limit);

    const query = params.toString();
    return this.request(`/problems${query ? '?' + query : ''}`);
  }

  async submitProblem(problemData) {
    return this.request('/problems', {
      method: 'POST',
      body: JSON.stringify(problemData),
    });
  }

  // Admin endpoints
  setAdminPassword(password) {
    this.adminPassword = password;
  }

  async verifyAdminLogin(password) {
    try {
      const result = await this.request('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
      if (result.success) {
        this.setAdminPassword(password);
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  async updateProblemStatus(id, status) {
    if (!this.adminPassword) {
      throw new Error('Not authenticated');
    }

    return this.request(`/problems/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, adminPassword: this.adminPassword }),
    });
  }

  async deleteProblem(id) {
    if (!this.adminPassword) {
      throw new Error('Not authenticated');
    }

    return this.request(`/problems/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ adminPassword: this.adminPassword }),
    });
  }

  clearAdminPassword() {
    this.adminPassword = null;
  }
}

export const apiService = new ApiService();
export default apiService;
