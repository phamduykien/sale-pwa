import { DashboardData } from '../types/statistics'
import { mockDashboardData } from '../mocks/dashboard'
import axios from 'axios';

let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: '/',
});

async function fetchConfig() {
  try {
    let response;
    if (import.meta.env.PROD) {
      // Fetch from backend in production
      response = await fetch('/api/config'); // Replace with your actual backend endpoint
    } else {
      // Fetch from local file in development
      response = await fetch('/config.json');
    }
    const config = await response.json();
    API_URL = config.apiUrl;
  } catch (error) {
    console.error('Error fetching config:', error);
  }
}

// Call fetchConfig to initialize API_URL
fetchConfig();

// Add a request interceptor to include the token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export class ApiService {
  static async getDashboardData(): Promise<DashboardData> {
    try {
      // Trong môi trường production, sẽ gọi API thực tế
      if (import.meta.env.PROD) {
        const response = await fetch(`${API_URL}/dashboard`)
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }
        return response.json()
      }
      
      // Trong môi trường development, sử dụng mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockDashboardData)
        }, 500) // Giả lập độ trễ network
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      throw error
    }
  }

  static formatCurrency(value: number): string {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)} tỷ VNĐ`
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)} triệu VNĐ`
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value)
  }

  static formatNumber(value: number): string {
    return new Intl.NumberFormat('vi-VN').format(value)
  }
}
