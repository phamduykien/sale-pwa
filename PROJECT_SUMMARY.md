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

### Cấu trúc Thư mục Model và DTO
- **`src/models`**: Thư mục gốc chứa các định nghĩa kiểu dữ liệu (interfaces) cho các thực thể chính của ứng dụng.
  - **`src/models/{entityName}/{EntityName}.ts`**: Định nghĩa interface cho thực thể chính (ví dụ: `Order.ts`, `InventoryItem.ts`).
  - **`src/models/{entityName}/dto/`**: Thư mục con chứa các Data Transfer Objects (DTOs) liên quan đến entity đó, dùng cho request payload và API response (ví dụ: `OrderListPayload.ts`, `OrderListResponse.ts`).

### Composable `useEntityManagement`
- Một composable chung (`src/composables/useEntityManagement.js`) được tạo ra để quản lý logic CRUD, phân trang, filter, và các chế độ form (view, add, edit, duplicate) cho các nghiệp vụ.
- Composable này nhận một `apiService` và `entityName` làm tham số, giúp tái sử dụng logic cho nhiều loại thực thể khác nhau.
- Hỗ trợ gọi API riêng biệt để lấy tổng số bản ghi khi cần thiết cho phân trang.

### State Management (Pinia)
- Sử dụng Pinia stores, được tái cấu trúc để tận dụng `useEntityManagement`:
  - **`Product store`**: Quản lý Hàng hóa, sử dụng `useEntityManagement` với `InventoryItemService`. Tích hợp logic xử lý offline với `IndexedDBService` và `useNetwork` cho các thao tác thêm, sửa, và đồng bộ.
  - **`Order store`**: Quản lý Đơn hàng, sử dụng `useEntityManagement` với `OrderService`.
  - **`Cart store`**: Quản lý giỏ hàng (không thay đổi nhiều trong đợt refactor này).
  - **`Dashboard store`**: Quản lý thống kê (không thay đổi nhiều trong đợt refactor này).
- Các store giờ đây chủ yếu expose state (dưới dạng `computed` refs từ composable) và các actions đã được trừu tượng hóa bởi `useEntityManagement`.

### Services
- **`OrderService.ts`** và **`InventoryItemService.ts`**:
  - Được cập nhật để sử dụng instance `api` toàn cục từ `src/boot/axios.js`.
  - Không còn xử lý token thủ công (việc này do interceptor trong `axios.js` đảm nhận).
  - Các phương thức lấy danh sách (ví dụ: `getInventoryItems`, `getOrderList`) nhận một object payload.
  - Bổ sung các phương thức để lấy tổng số bản ghi (ví dụ: `getInventoryItemsCount`, `getOrdersCount`) để hỗ trợ phân trang chính xác.
- **`api.ts`**: Service chung, đã được cập nhật để import `DashboardData` từ cấu trúc model mới.

### Xử lý Xác thực và Điều hướng
- **`src/boot/axios.js`**:
  - Interceptor request tự động đính kèm `authToken` (lấy từ `localStorage`) vào header `Authorization`.
  - Interceptor response xử lý lỗi `401 Unauthorized` bằng cách xóa `authToken` và sử dụng Vue Router (`router.push`) để điều hướng về trang đăng nhập, đảm bảo hoạt động đúng với `hash` mode.
- **`src/router/index.js`**:
  - Sử dụng `beforeEach` navigation guard để kiểm tra `authToken` trước khi cho phép truy cập các route yêu cầu xác thực.
  - Tự động chuyển hướng người dùng chưa đăng nhập về `/login` (với query `redirect`).
  - Tự động chuyển hướng người dùng đã đăng nhập nếu họ cố gắng truy cập lại `/login`.
- Logic kiểm tra token và chuyển hướng thủ công trong các component đã được loại bỏ.

### Offline Architecture
- **`IndexedDBService.js`**: Tiếp tục được sử dụng để lưu trữ dữ liệu cục bộ (ví dụ: sản phẩm, các hành động chờ xử lý).
- **`Product store`**: Tích hợp logic offline cho các thao tác thêm, sửa sản phẩm, lưu các hành động này vào IndexedDB khi không có mạng và đồng bộ khi có mạng trở lại.
- **`useNetwork` composable**: Được sử dụng để theo dõi trạng thái kết nối mạng.

### Components Structure
- Layouts: Cấu trúc trang chính.
- Pages: Các trang chức năng (ví dụ: `OrdersPage.vue`, `ProductsPage.vue`, `ProductDetailPage.vue`) đã được refactor để sử dụng các store đã cập nhật.
- Components: UI components tái sử dụng (ví dụ: `ProductList.vue` đã được cập nhật hành vi trượt).
- Composables: Ngoài `useEntityManagement`, còn có `useNetwork`.

## Tính năng trong tương lai
1. Quản lý khách hàng và CRM
2. Tích hợp thanh toán trực tuyến
3. Báo cáo nâng cao và xuất file
4. Quản lý nhiều chi nhánh
5. Tích hợp với các nền tảng bán hàng

## Hướng dẫn phát triển
Xem file SETUP_GUIDE.md cho hướng dẫn cài đặt và phát triển.
