# Hệ Thống Environment (ENV) Tự Động

## Tổng Quan

Hệ thống này đã được triển khai để tự động lưu trữ `env` từ `currentTenant.env` ở mức global và tự động ghép env này vào tất cả các lời gọi API.

## Cách Hoạt Động

### 1. Tenant Store (`src/stores/tenant.js`)
- Lưu trữ thông tin tenant bao gồm `env`, `tenantId`, và `tenantName`
- Persist data vào localStorage để duy trì qua các session
- Có các actions: `setTenantInfo()`, `loadFromStorage()`, `clear()`

### 2. Axios Interceptor (`src/boot/axios.js`)
- **Request Interceptor**: Tự động thêm env prefix vào URL
- **Response Interceptor**: Clear tenant info khi nhận lỗi 401

#### Logic Request Interceptor:
```javascript
// Lấy env từ localStorage
const env = localStorage.getItem('tenant_env')

// Các URL được skip (không thêm env):
- '/api/oauth/'
- '/api/authmob/Authens/login'

// Tự động transform URL:
'api/bizmob/EcomOrderMobs' → '/{env}/api/bizmob/EcomOrderMobs'
```

### 3. Login Flow (`src/pages/system/LoginPage.vue`)
- Sau khi user chọn tenant, gọi `tenantStore.setTenantInfo(currentTenant)`
- Lưu env vào store TRƯỚC khi gọi API lấy auth token
- Env được lưu ngay lập tức để các API call tiếp theo có thể sử dụng

### 4. Service Updates
- **OrderService**: Path đã thay đổi từ `/g4/api/bizmob/EcomOrderMobs` → `api/bizmob/EcomOrderMobs`
- **InventoryItemService**: Path đã thay đổi từ `/g4/api/dimob/InventoryItems` → `api/dimob/InventoryItems`
- Interceptor sẽ tự động thêm env prefix

### 5. App Initialization (`src/layouts/MainLayout.vue`)
- Load tenant info từ localStorage khi app khởi động
- Đảm bảo env sẵn sàng cho tất cả API calls

## Ví Dụ Flow

### Login Process:
1. User login → chọn tenant
2. `tenantStore.setTenantInfo({ env: 'g4', tenant_id: '123', tenant_name: 'Shop ABC' })`
3. localStorage được update với tenant info
4. API call lấy auth token sẽ có URL: `/g4/api/authmob/Authens/login/123`

### Subsequent API Calls:
1. Service gọi: `api.post('api/bizmob/EcomOrderMobs/list', payload)`
2. Interceptor detect env = 'g4' từ localStorage
3. URL được transform thành: `/g4/api/bizmob/EcomOrderMobs/list`
4. Request được gửi với env prefix

## Testing

### Console Commands:
Sau khi login, bạn có thể test trong browser console:

```javascript
// Kiểm tra thông tin tenant hiện tại
logCurrentTenant()

// Test hệ thống env
testEnvSystem()
```

### Manual Testing:
1. Login vào app
2. Chọn tenant
3. Navigate đến Products hoặc Orders page
4. Mở DevTools → Network tab
5. Xem các API calls đều có env prefix

## Lợi Ích

### 1. Tự Động
- Không cần manually thêm env vào mỗi API call
- Interceptor xử lý tất cả

### 2. Centralized
- Env được quản lý tập trung trong tenant store
- Chỉ cần set một lần sau login

### 3. Flexible
- Dễ dàng thay đổi logic env nếu cần
- Skip được các endpoints không cần env

### 4. Backward Compatible
- Code hiện tại không bị break
- Chỉ cần update service paths

## Lưu Ý

### URLs Được Skip (Không Thêm ENV):
- `/api/oauth/*` - Login endpoints
- URLs đã có env prefix
- External URLs (bắt đầu bằng http)

### Error Handling:
- Khi nhận 401 response, system sẽ:
  - Clear auth token
  - Clear tenant info
  - Redirect về login page

### Storage:
- Tenant info được lưu trong localStorage:
  - `tenant_env`
  - `tenant_id` 
  - `tenant_name`

## File Structure

```
src/
├── stores/tenant.js          # Tenant store
├── boot/axios.js            # Axios interceptors
├── pages/system/LoginPage.vue # Login flow với tenant selection
├── services/
│   ├── OrderService.ts      # Updated với relative paths
│   └── InventoryItemService.ts # Updated với relative paths
├── layouts/MainLayout.vue   # Load tenant info on app start
└── utils/testEnvSystem.js   # Testing utilities
```

## Troubleshooting

### Nếu API calls không có env prefix:
1. Kiểm tra `localStorage.getItem('tenant_env')`
2. Đảm bảo đã login và chọn tenant
3. Check console logs cho "Auto-added env prefix"

### Nếu logout không hoạt động:
1. Kiểm tra response interceptor trong axios.js
2. Đảm bảo 401 responses được handle đúng

### Nếu tenant info bị mất:
1. Kiểm tra localStorage có đủ tenant keys không
2. Gọi `tenantStore.loadFromStorage()` manually
