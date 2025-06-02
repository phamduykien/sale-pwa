# Sale PWA - Progressive Web App Bán Hàng

## Giới thiệu

Sale PWA là một ứng dụng web tiến bộ (Progressive Web App) được xây dựng bằng Quasar Framework và Vue 3. Ứng dụng cung cấp trải nghiệm mua sắm trực tuyến mượt mà với giao diện thân thiện trên mọi thiết bị.

## ✨ Tính năng chính

- 🏠 **Trang chủ**: Banner chào mừng, danh mục sản phẩm, sản phẩm nổi bật
- 🛒 **Giỏ hàng**: Quản lý sản phẩm, tính toán tổng tiền, phí vận chuyển
- 📂 **Danh mục**: Lọc và sắp xếp sản phẩm theo nhiều tiêu chí
- 🔍 **Tìm kiếm**: Tìm kiếm thông minh với bộ lọc nâng cao
- 📱 **Responsive**: Tối ưu cho mobile, tablet và desktop
- 📦 **PWA**: Hoạt động offline, có thể cài đặt như app native
- 💾 **Local Storage**: Lưu trữ giỏ hàng và lịch sử tìm kiếm

## 🛠 Công nghệ sử dụng

- **Frontend Framework**: Vue 3 với Composition API
- **UI Framework**: Quasar Framework
- **State Management**: Pinia
- **Routing**: Vue Router
- **HTTP Client**: Axios
- **PWA**: Workbox với Quasar PWA
- **Build Tool**: Vite

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js 18+ 
- npm 6.13.4+

### Cài đặt
```bash
# Clone repository
git clone <repository-url>
cd sale-pwa

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

### Build production
```bash
# Build SPA
npm run build

# Build PWA
npx @quasar/app-vite build -m pwa
```

## 📁 Cấu trúc project

```
src/
├── boot/                    # Boot files
│   ├── axios.js            # Cấu hình API
│   └── pinia.js            # State management
├── components/             # Vue components
│   └── ProductCard.vue     # Component card sản phẩm
├── layouts/               # App layouts
│   └── MainLayout.vue     # Layout chính với navigation
├── pages/                 # Page components
│   ├── IndexPage.vue      # Trang chủ
│   ├── CartPage.vue       # Giỏ hàng
│   ├── CategoriesPage.vue # Danh mục
│   ├── ProductDetailPage.vue # Chi tiết sản phẩm
│   ├── SearchPage.vue     # Tìm kiếm
│   └── ProfilePage.vue    # Trang cá nhân
├── router/                # Vue Router
│   └── routes.js          # Định nghĩa routes
└── stores/                # Pinia stores
    ├── product.js         # Quản lý sản phẩm
    └── cart.js            # Quản lý giỏ hàng
```

## 📱 Tính năng PWA

- **Service Worker**: Cache tự động cho performance tốt hơn
- **Offline Support**: Hoạt động khi mất kết nối
- **Install Prompt**: Có thể cài đặt như ứng dụng native
- **Push Notifications**: Sẵn sàng cho thông báo push
- **Responsive**: Tối ưu cho mọi kích thước màn hình

## 🎨 Giao diện

### Mobile-First Design
- Bottom navigation cho mobile
- Touch-friendly interface
- Swipe gestures support
- Responsive grid layout

### Desktop Features
- Hover effects
- Keyboard navigation
- Large screen optimization

## 🔧 Cấu hình

### PWA Configuration
File `quasar.config.js` đã được cấu hình với:
- Workbox GenerateSW
- Manifest file với metadata
- Runtime caching strategies
- Offline fallbacks

### State Management
- **Product Store**: Quản lý sản phẩm và danh mục
- **Cart Store**: Quản lý giỏ hàng với localStorage persistence

## 📊 Data Structure

### Product
```javascript
{
  id: Number,
  name: String,
  description: String,
  price: Number,
  originalPrice: Number,
  image: String,
  images: Array,
  categoryId: Number,
  stock: Number,
  featured: Boolean,
  rating: Number,
  reviews: Number
}
```

### Category
```javascript
{
  id: Number,
  name: String,
  icon: String,
  color: String
}
```

## 🔄 API Integration

Hiện tại sử dụng mock data. Để tích hợp API thật:

1. Cập nhật `src/boot/axios.js` với base URL
2. Thay thế mock data trong stores
3. Implement error handling
4. Add authentication if needed

## 🎯 Roadmap

- [ ] Authentication system
- [ ] Payment integration
- [ ] Order management
- [ ] Admin dashboard
- [ ] Push notifications
- [ ] Social sharing
- [ ] Reviews & ratings
- [ ] Wishlist feature

## 📝 Development

### Adding New Pages
1. Tạo component trong `src/pages/`
2. Thêm route trong `src/router/routes.js`
3. Update navigation if needed

### Adding New Features
1. Create store if needed
2. Add API endpoints
3. Update UI components
4. Add tests

## 🐛 Troubleshooting

### Common Issues

**"Unknown command dev"**
```bash
npm install @quasar/app-vite --save-dev
npx @quasar/app-vite dev
```

**Missing dependencies**
```bash
npm install axios pinia
```

**PWA not working**
- Check service worker registration
- Verify manifest.json
- Test in production build

## 📄 License

MIT License

## 👥 Contributing

1. Fork the project
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📞 Support

Email: phamduykien@gmail.com

---

**Made with ❤️ using Quasar Framework**
