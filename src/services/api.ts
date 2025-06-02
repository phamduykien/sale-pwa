import { DashboardData } from '../types/statistics'
import { mockDashboardData } from '../mocks/dashboard'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

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
