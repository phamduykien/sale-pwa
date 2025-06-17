import { boot } from 'quasar/wrappers'
import axios from 'axios'

// Tạo instance axios với cấu hình cơ bản
// Khai báo router ở phạm vi module để interceptor có thể truy cập
let routerInstance = null;

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
      // Redirect to login page
      // Cân nhắc sử dụng router.push('/login') nếu có thể truy cập router ở đây
      // Hoặc phát một sự kiện để MainLayout hoặc App.vue xử lý redirect
      // window.location.href = '/login' // Thay thế bằng router.push
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
