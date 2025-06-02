# Sale PWA - Hướng dẫn cài đặt và chạy ứng dụng

## Tổng quan
Đây là ứng dụng PWA (Progressive Web App) bán hàng được xây dựng với Quasar Framework và Vue 3. Ứng dụng bao gồm các tính năng:

- 🏠 Trang chủ với sản phẩm nổi bật
- 📱 Responsive design cho mobile và desktop
- 🛒 Giỏ hàng với local storage
- 🔍 Tìm kiếm và lọc sản phẩm
- 📂 Danh mục sản phẩm
- 👤 Trang profile người dùng
- 🔄 PWA với offline support

## Cấu trúc dự án

```
quasar-project/
├── src/
│   ├── boot/                 # Boot files
│   │   ├── axios.js         # API configuration
│   │   └── pinia.js         # State management
│   ├── components/          # Vue components
│   │   └── ProductCard.vue  # Product card component
│   ├── layouts/             # App layouts
│   │   └── MainLayout.vue   # Main layout with navigation
│   ├── pages/               # Page components
│   │   ├── IndexPage.vue    # Home page
│   │   ├── CartPage.vue     # Shopping cart
│   │   ├── CategoriesPage.vue # Categories listing
│   │   ├── ProductDetailPage.vue # Product details
│   │   ├── SearchPage.vue   # Search functionality
│   │   └── ProfilePage.vue  # User profile
│   ├── router/              # Vue Router
│   │   └── routes.js        # Route definitions
│   └── stores/              # Pinia stores
│       ├── product.js       # Product management
│       └── cart.js          # Shopping cart
├── public/                  # Static files
└── quasar.config.js        # Quasar configuration
```

## Cài đặt và chạy

### 1. Cài đặt dependencies
```bash
cd quasar-project
npm install
```

### 2. Chạy development server
```bash
npm run dev
# hoặc
npx @quasar/app-vite dev
```

### 3. Build cho production
```bash
npm run build
# hoặc
npx @quasar/app-vite build
```

### 4. Build PWA
```bash
npx @quasar/app-vite build -m pwa
```

## Tính năng chính

### 🏠 Trang chủ (IndexPage.vue)
- Banner chào mừng
- Danh mục sản phẩm với scroll ngang
- Sản phẩm nổi bật
- Danh sách tất cả sản phẩm

### 🛒 Giỏ hàng (CartPage.vue)
- Hiển thị sản phẩm trong giỏ
- Tăng/giảm số lượng
- Tính toán tổng tiền và phí ship
- Lưu trữ local với LocalStorage

### 📂 Danh mục (CategoriesPage.vue)
- Lọc sản phẩm theo danh mục
- Sắp xếp theo nhiều tiêu chí
- Giao diện grid responsive

### 🔍 Tìm kiếm (SearchPage.vue)
- Tìm kiếm theo tên và mô tả
- Bộ lọc nâng cao (giá, đánh giá, danh mục)
- Lưu lịch sử tìm kiếm

### 📱 Navigation
- Bottom navigation cho mobile
- Header với search và cart icon
- Badge hiển thị số lượng sản phẩm trong giỏ

## State Management (Pinia)

### Product Store
- Quản lý danh sách sản phẩm
- Quản lý danh mục
- Mock data cho demo

### Cart Store
- Thêm/xóa sản phẩm
- Cập nhật số lượng
- Tính toán tổng tiền
- Persistent storage

## PWA Configuration

File `quasar.config.js` đã được cấu hình với:
- Service Worker (GenerateSW)
- Manifest file với thông tin app
- Caching strategy cho API calls
- Meta tags cho PWA

## Troubleshooting

### Lỗi "Unknown command dev"
Nếu gặp lỗi này, hãy thử:
```bash
npm install @quasar/app-vite --save-dev
npx @quasar/app-vite dev
```

### Cài đặt Quasar CLI global (tùy chọn)
```bash
npm install -g @quasar/cli
```

### Missing dependencies
Nếu thiếu axios hoặc pinia:
```bash
npm install axios pinia
```

## Phát triển tiếp

### Thêm tính năng mới
1. Tạo page mới trong `src/pages/`
2. Thêm route trong `src/router/routes.js`
3. Cập nhật navigation nếu cần

### Tích hợp API thật
1. Cập nhật `src/boot/axios.js` với URL API
2. Thay thế mock data trong stores
3. Xử lý authentication nếu cần

### Deploy
1. Build production: `npm run build`
2. Deploy folder `dist/spa` lên hosting
3. Cho PWA: `npm run build -m pwa` và deploy `dist/pwa`

## Dependencies chính

- **Quasar Framework**: UI framework
- **Vue 3**: JavaScript framework
- **Pinia**: State management
- **Vue Router**: Routing
- **Axios**: HTTP client

## Liên hệ
Phát triển bởi: phamduykien@gmail.com

---

**Lưu ý**: Đây là phiên bản demo với mock data. Trong production cần tích hợp API thật và thêm các tính năng bảo mật.
