import { boot } from 'quasar/wrappers'
import axios from 'axios'

// Tạo instance axios với cấu hình cơ bản
const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Thay đổi URL này theo backend của bạn
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Thêm token vào header nếu có
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Xử lý lỗi global
    if (error.response?.status === 401) {
      // Logout user nếu unauthorized
      localStorage.removeItem('auth_token')
      // Redirect to login page
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default boot(({ app }) => {
  // Có thể sử dụng $api trong component
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
