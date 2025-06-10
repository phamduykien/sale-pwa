# GPBL Shop - Progressive Web App

## Giới thiệu
GPBL Shop là một Progressive Web App (PWA) được phát triển với Quasar Framework, Vue 3 và Pinia, cung cấp giải pháp quản lý bán hàng hiện đại và linh hoạt, có thể hoạt động cả online và offline.

## Tính năng chính

### 1. Quản lý hàng hóa
- Hiển thị danh sách sản phẩm với tìm kiếm và lọc
- Thêm, sửa, xóa sản phẩm
- Upload hình ảnh sản phẩm
- Phân loại sản phẩm theo danh mục
- Theo dõi tồn kho

### 2. Đơn hàng và bán hàng
- Giỏ hàng thông minh để tạo đơn hàng
- Quản lý danh sách đơn hàng đã bán
- Theo dõi trạng thái đơn hàng (hoàn thành, xuất hóa đơn, thu tiền)
- Tự động tính toán giá trị và số lượng

### 3. Thống kê và báo cáo
- Dashboard với các chỉ số quan trọng
- Biểu đồ doanh thu theo thời gian
- Phân tích sản phẩm bán chạy
- Phân bố doanh thu theo danh mục

### 4. PWA và Offline Support
- Cài đặt như ứng dụng native trên thiết bị
- Hoạt động offline với IndexedDB
- Đồng bộ dữ liệu tự động khi có mạng
- Cache thông minh cho static assets và API
- Trang offline thân thiện người dùng

### 5. Push Notifications
- Thông báo realtime cho các sự kiện quan trọng
- Tùy chỉnh nội dung và hành động thông báo
- Hỗ trợ service worker cho background sync

### 6. Giao diện người dùng
- Thiết kế responsive trên mọi thiết bị
- Bottom navigation cho mobile UX tốt
- Dark mode (dự kiến)
- Animations và transitions mượt mà
- Loading states và error handling

### 7. Bảo mật
- Xác thực người dùng
- Phân quyền chức năng
- Bảo vệ API endpoints
- Xử lý token và phiên làm việc

## Công nghệ sử dụng

### Frontend
- Vue 3 Composition API
- Quasar Framework
- Pinia State Management
- Vue Router
- Axios HTTP Client

### PWA
- Service Workers
- Workbox
- IndexedDB
- Background Sync
- Push API

### Build & Development
- Vite
- ESLint
- Prettier
- Git version control

## Kiến trúc và Thiết kế

### State Management
- Sử dụng Pinia stores cho:
  - Product store: Quản lý sản phẩm
  - Cart store: Quản lý giỏ hàng
  - Order store: Quản lý đơn hàng
  - Dashboard store: Quản lý thống kê

### Offline Architecture
- IndexedDB cho local storage
- Background sync queue
- Optimistic UI updates
- Cache strategies:
  - Network First cho API calls
  - Cache First cho static assets
  - Stale While Revalidate cho images

### Components Structure
- Layouts: Cấu trúc trang chính
- Pages: Các trang chức năng
- Components: UI components tái sử dụng
- Composables: Logic tái sử dụng

## Tính năng trong tương lai
1. Quản lý khách hàng và CRM
2. Tích hợp thanh toán trực tuyến
3. Báo cáo nâng cao và xuất file
4. Quản lý nhiều chi nhánh
5. Tích hợp với các nền tảng bán hàng

## Hướng dẫn phát triển
Xem file SETUP_GUIDE.md cho hướng dẫn cài đặt và phát triển.
