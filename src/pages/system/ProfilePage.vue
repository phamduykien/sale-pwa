<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="text-h5 text-weight-bold q-mb-lg">Tài khoản của tôi</div>

    <!-- User info card -->
    <q-card flat bordered class="q-mb-lg">
      <q-card-section class="text-center q-pa-lg">
        <q-avatar size="80px" color="primary" text-color="white" class="q-mb-md">
          <q-icon name="person" size="40px" />
        </q-avatar>
        <!-- Hiển thị thông tin người dùng và nút dựa trên trạng thái đăng nhập -->
        <div class="text-h6 text-weight-medium">{{ userDisplayName }}</div>
        <div class="text-body2 text-grey-6">{{ userStatus }}</div>

        <div v-if="isLoggedIn" class="q-mt-lg">
          <q-btn
            color="negative"
            label="Đăng xuất"
            icon="logout"
            @click="handleLogout"
            unelevated
            class="full-width"
          />
        </div>
        <div v-else class="q-mt-lg q-gutter-sm">
          <q-btn
            color="primary"
            label="Đăng nhập"
            icon="login"
            @click="goToLogin" 
            unelevated
            class="col-auto"
          />
          <q-btn
            color="secondary"
            label="Đăng ký"
            icon="person_add"
            @click="showRegisterDialog" 
            outline
            class="col-auto"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Menu items -->
    <q-list bordered>
      <q-item clickable @click="showComingSoon('Đơn hàng của tôi')">
        <q-item-section avatar>
          <q-icon name="shopping_bag" color="primary" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Đơn hàng của tôi</q-item-label>
          <q-item-label caption>Xem lịch sử đặt hàng</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" />
        </q-item-section>
      </q-item>

      <q-separator inset="item" />

      <q-item clickable @click="showComingSoon('Địa chỉ giao hàng')">
        <q-item-section avatar>
          <q-icon name="location_on" color="primary" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Địa chỉ giao hàng</q-item-label>
          <q-item-label caption>Quản lý địa chỉ nhận hàng</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" />
        </q-item-section>
      </q-item>

      <q-separator inset="item" />

      <q-item clickable @click="showComingSoon('Phương thức thanh toán')">
        <q-item-section avatar>
          <q-icon name="payment" color="primary" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Phương thức thanh toán</q-item-label>
          <q-item-label caption>Quản lý thẻ và ví điện tử</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" />
        </q-item-section>
      </q-item>

      <q-separator inset="item" />

      <q-item clickable @click="showComingSoon('Thông báo')">
        <q-item-section avatar>
          <q-icon name="notifications" color="primary" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Thông báo</q-item-label>
          <q-item-label caption>Cài đặt thông báo khuyến mãi</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" />
        </q-item-section>
      </q-item>

      <q-separator inset="item" />

      <q-item clickable @click="showComingSoon('Hỗ trợ khách hàng')">
        <q-item-section avatar>
          <q-icon name="help" color="primary" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Hỗ trợ khách hàng</q-item-label>
          <q-item-label caption>Liên hệ với chúng tôi</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" />
        </q-item-section>
      </q-item>

      <q-separator inset="item" />

      <q-item clickable @click="showAppInfo">
        <q-item-section avatar>
          <q-icon name="info" color="primary" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Về ứng dụng</q-item-label>
          <q-item-label caption>Thông tin phiên bản</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" />
        </q-item-section>
      </q-item>
    </q-list>

    <!-- Cart summary -->
    <q-card v-if="!cartStore.cartIsEmpty" flat bordered class="q-mt-lg">
      <q-card-section>
        <div class="text-subtitle1 text-weight-medium q-mb-sm">
          <q-icon name="shopping_cart" class="q-mr-sm" />
          Giỏ hàng hiện tại
        </div>
        <div class="row justify-between">
          <span>{{ cartStore.totalItems }} sản phẩm</span>
          <span class="text-weight-bold text-primary">{{ formatPrice(cartStore.totalPrice) }}</span>
        </div>
        <q-btn
          color="primary"
          label="Xem giỏ hàng"
          @click="$router.push('/cart')"
          class="full-width q-mt-md"
          unelevated
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue' // Thêm ref, onMounted, computed, onUnmounted
import { useRouter } from 'vue-router' // Thêm useRouter
import { useCartStore } from 'src/stores/cart'
import { Dialog } from 'quasar' // Thêm useQuasar, không cần $q nữa
import { showNotification } from 'src/boot/notify-service'


const cartStore = useCartStore()
const router = useRouter() // Khởi tạo router
// const $q = useQuasar() // Không cần dùng $q.notify nữa

// Trạng thái đăng nhập
const authToken = ref(localStorage.getItem('authToken'))

const isLoggedIn = computed(() => !!authToken.value)

// Cập nhật authToken khi component được mounted
onMounted(() => {
  authToken.value = localStorage.getItem('authToken')
  // Lắng nghe sự kiện storage để cập nhật nếu token thay đổi ở tab khác
  window.addEventListener('storage', handleStorageChange);
})

// Xóa event listener khi component unmounted
onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange);
});

const handleStorageChange = (event) => {
  if (event.key === 'authToken') {
    authToken.value = event.newValue;
  }
};

const userDisplayName = computed(() => {
  // TODO: Trong tương lai, có thể giải mã token hoặc gọi API để lấy tên người dùng thực sự
  return isLoggedIn.value ? 'Người dùng đã đăng nhập' : 'Khách hàng';
});

const userStatus = computed(() => {
  return isLoggedIn.value ? 'Đã đăng nhập' : 'Chưa đăng nhập';
});

const handleLogout = () => {
  localStorage.removeItem('authToken')
  // Bỏ dòng authToken.value = null để tránh giao diện cập nhật trước khi chuyển trang.
  // Khi trang được điều hướng đi, component này sẽ unmount,
  // và nếu quay lại, onMounted sẽ đọc lại trạng thái đúng từ localStorage.
  
  // (Tùy chọn) Reset user store nếu có
  // Ví dụ: userStore.clearUser() // Giả sử có userStore

  showNotification('success', 'Đăng xuất thành công!')
  router.push('/login')
}

const goToLogin = () => {
  router.push('/login')
}

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}



function showRegisterDialog() {
  Dialog.create({
    title: 'Đăng ký',
    message: 'Tính năng đăng ký sẽ được phát triển trong phiên bản tiếp theo.',
    ok: {
      label: 'Đã hiểu',
      color: 'primary',
      unelevated: true
    }
  })
}

function showComingSoon(feature) {
  Dialog.create({
    title: feature,
    message: 'Tính năng này sẽ được phát triển trong phiên bản tiếp theo.',
    ok: {
      label: 'Đã hiểu',
      color: 'primary',
      unelevated: true
    }
  })
}

function showAppInfo() {
  Dialog.create({
    title: 'Về ứng dụng SalePWA',
    message: `
      <div>
        <p><strong>Phiên bản:</strong> 1.0.0</p>
        <p><strong>Framework:</strong> Quasar Framework + Vue 3</p>
        <p><strong>Công nghệ:</strong> Progressive Web App (PWA)</p>
        <p><strong>Mô tả:</strong> Ứng dụng bán hàng trực tuyến với trải nghiệm mượt mà trên mọi thiết bị.</p>
      </div>
    `,
    html: true,
    ok: {
      label: 'Đóng',
      color: 'primary',
      unelevated: true
    }
  })
}
</script>

<style scoped>
.q-item {
  padding: 16px;
}

.q-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}
</style>
