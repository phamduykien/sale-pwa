import { boot } from 'quasar/wrappers'
import axios from 'axios'

// Tạo instance axios với cấu hình cơ bản
// Khai báo router ở phạm vi module để interceptor có thể truy cập
let routerInstance = null;
let tenantStore = null;

const api = axios.create({
  baseURL: '/', // Thay đổi URL này theo backend của bạn
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Thêm token vào header nếu có
    const token = localStorage.getItem('authToken') // Đổi key thành authToken
    if (token) {
      config.headers.Authorization = `${token}`
    }
    
    // Tự động thêm env vào path nếu có
    const env = localStorage.getItem('tenant_env')
    if (env && config.url) {
      // Các URL không cần env prefix (login endpoints) 
      const skipEnvPaths = [
        '/api/oauth/',
        '/api/authmob/Authens/login'
      ]
      
      // Kiểm tra xem URL đã có env prefix chưa
      const hasEnvPrefix = config.url.startsWith(`/${env}/`)
      const shouldSkip = skipEnvPaths.some(path => config.url.includes(path))
      
      // Nếu chưa có env prefix và không phải URL cần skip
      if (!hasEnvPrefix && !shouldSkip && !config.url.startsWith('http')) {
        // Loại bỏ dấu / đầu nếu có
        const cleanUrl = config.url.startsWith('/') ? config.url.substring(1) : config.url
        config.url = `/${env}/${cleanUrl}`
        console.log('Auto-added env prefix:', config.url)
      }
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
      localStorage.removeItem('authToken') // Đổi key thành authToken
      
      // Clear tenant info
      if (tenantStore) {
        tenantStore.clear()
      } else {
        // Fallback: clear trực tiếp từ localStorage
        localStorage.removeItem('tenant_env')
        localStorage.removeItem('tenant_id')
        localStorage.removeItem('tenant_name')
      }
      
      // Redirect to login page
      if (routerInstance) {
        // Nếu đang ở hash mode, path phải là '/login', router tự thêm #
        // Nếu đang ở history mode, path cũng là '/login'
        routerInstance.push('/login');
      } else {
        // Fallback nếu routerInstance chưa được khởi tạo kịp thời (ít khả năng xảy ra)
        window.location.href = '/#/login'; // Đảm bảo hash mode nếu router chưa sẵn sàng
      }
    }
    return Promise.reject(error)
  }
)

export default boot(({ app, router }) => { // Nhận router từ boot function
  routerInstance = router; // Gán router instance
  // Có thể sử dụng $api trong component
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
