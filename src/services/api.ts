import { DashboardData } from '../types/statistics'
import { mockDashboardData } from '../mocks/dashboard'
// Import a configured axios instance from boot file
import { api } from 'src/boot/axios'

// API_URL, fetchConfig, và instance axios cục bộ sẽ bị loại bỏ
// vì chúng ta sẽ sử dụng instance `api` đã được cấu hình toàn cục
// với baseURL và interceptor từ src/boot/axios.js.

export class ApiService {
  static async getDashboardData(): Promise<DashboardData> {
    try {
      // Trong môi trường production, sẽ gọi API thực tế bằng instance `api`
      if (import.meta.env.PROD) {
        // Sử dụng instance `api` từ boot/axios.js
        // Endpoint '/dashboard' sẽ được nối với baseURL đã cấu hình trong boot/axios.js
        const response = await api.get('/dashboard')
        // axios trả về dữ liệu trong response.data
        return response.data 
      }
      
      // Trong môi trường development, sử dụng mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockDashboardData)
        }, 500) // Giả lập độ trễ network
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Nếu lỗi từ axios, error.response có thể chứa thêm thông tin
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
