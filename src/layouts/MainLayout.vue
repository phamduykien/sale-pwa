<template>
  <q-layout view="hHh lpR fFf">
    <!-- Offline indicator -->
    <div v-if="showOfflineIndicator" class="offline-indicator">
      <q-banner dense class="bg-warning text-white">
        <template v-slot:avatar>
          <q-icon name="wifi_off" />
        </template>
        Đang offline - Các thay đổi sẽ được đồng bộ khi có mạng
      </q-banner>
    </div>
    <!-- Header -->
    <q-header class="bg-white text-grey-8 shadow-2">
      <q-toolbar class="q-px-md">
        <!-- Logo/Title -->
        <q-toolbar-title class="text-primary text-weight-bold">
          <q-icon name="store" size="sm" class="q-mr-sm" />
          GPBL Shop
        </q-toolbar-title>

        <!-- Notification Test Buttons -->
        <q-btn flat round icon="notifications_active" @click="requestNotificationPermission" title="Bật thông báo" class="q-mr-xs" />
        <q-btn flat round icon="send" @click="testLocalNotification" title="Test thông báo local" class="q-mr-xs" />

        <!-- Search button -->
        <q-btn
          flat
          round
          icon="search"
          @click="showSearch = !showSearch"
          class="q-mr-sm"
        />

        <!-- Cart button with badge -->
        <q-btn
          flat
          round
          icon="shopping_cart"
          @click="$router.push('/cart')"
          class="relative-position"
        >
          <q-badge
            v-if="cartStore.totalItems > 0"
            color="red"
            floating
            rounded
          >
            {{ cartStore.totalItems }}
          </q-badge>
        </q-btn>
      </q-toolbar>

      <!-- Search bar -->
      <q-slide-transition>
        <div v-show="showSearch" class="q-pa-md bg-grey-1">
          <q-input
            v-model="searchQuery"
            placeholder="Tìm kiếm sản phẩm..."
            outlined
            dense
            clearable
            @keyup.enter="performSearch"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
      </q-slide-transition>
    </q-header>

    <!-- Main content -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Bottom Navigation -->
    <q-footer class="bg-white text-grey-8 shadow-up-2">
      <q-tabs
        v-model="activeTab"
        class="text-grey-6"
        active-color="primary"
        indicator-color="transparent"
      >
        <q-tab
          name="home"
          icon="home"
          label="Tổng quan"
          @click="navigateTo('/')"
          :class="{ 'text-primary': $route.path === '/' }"
        />
        <q-tab
          name="products"
          icon="inventory_2"
          label="Hàng hóa"
          @click="navigateTo('/products')"
          :class="{ 'text-primary': $route.path === '/products' }"
        />
        <q-tab
          name="orders"
          icon="receipt_long"
          label="Đơn hàng"
          @click="navigateTo('/orders')"
          :class="{ 'text-primary': $route.path === '/orders' }"
        />        
        <q-tab
          name="profile"
          icon="person"
          label="Khác"
          @click="navigateTo('/profile')"
          :class="{ 'text-primary': $route.path === '/profile' }"
        />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCartStore } from 'src/stores/cart'
import { useProductStore } from 'src/stores/product'
import { useQuasar } from 'quasar'
import { useNetwork } from 'src/composables/useNetwork'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()
const productStore = useProductStore()
const { isOnline, showOfflineIndicator } = useNetwork()

// Theo dõi sự thay đổi trạng thái mạng để đồng bộ
watch(isOnline, async (newValue) => {
  if (newValue) { // Khi có mạng trở lại
    await productStore.syncOfflineChanges()
  }
})

const showSearch = ref(false)
const searchQuery = ref('')
const activeTab = ref('home')

// Load cart from storage on mount
onMounted(() => {
  cartStore.loadCartFromStorage();
  updateActiveTab();

  if (route.path !== '/login') {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
    }
  }
  // Hướng dẫn test push từ DevTools
  console.log("Để giả lập Push Event từ server, mở Chrome DevTools > Application > Service Workers, tìm service worker của trang này, và sử dụng ô 'Push'.");
  console.log("Payload ví dụ: {\"title\": \"Test Push\", \"body\": \"Đây là push từ DevTools!\", \"icon\": \"/icons/favicon-128x128.png\"}");
  console.warn("LƯU Ý: Bạn cần thay thế 'YOUR_PUBLIC_VAPID_KEY_HERE' trong MainLayout.vue bằng VAPID key thực tế của bạn để push notification hoạt động đúng cách với server.");
});

// Watch route changes to update active tab
watch(() => route.path, () => {
  updateActiveTab()
})

function updateActiveTab() {
  const path = route.path
  if (path === '/') {
    activeTab.value = 'home'
  } else if (path === '/products') {
    activeTab.value = 'products'
  } else if (path === '/orders') {
    activeTab.value = 'orders'    
  } else if (path === '/profile') {
    activeTab.value = 'profile'
  }
}

function navigateTo(path) {
  if (route.path !== path) {
    router.push(path)
  }
}

function performSearch() {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/search',
      query: { q: searchQuery.value.trim() }
    })
    showSearch.value = false
  }
}

// --- Push Notification Logic ---
// IMPORTANT: Replace with your actual VAPID public key
const VAPID_PUBLIC_KEY = 'YOUR_PUBLIC_VAPID_KEY_HERE'; // <<<<<<< NHỚ THAY THẾ KEY NÀY

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function requestNotificationPermission() {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    $q.notify({ type: 'negative', message: 'Trình duyệt này không hỗ trợ thông báo hoặc Service Worker.' });
    return;
  }

  const permissionResult = await Notification.requestPermission();
  if (permissionResult === 'granted') {
    $q.notify({ type: 'positive', message: 'Đã cấp quyền thông báo!' });
    subscribeUserToPush();
  } else if (permissionResult === 'denied') {
    $q.notify({ type: 'warning', message: 'Quyền thông báo đã bị từ chối.' });
  } else {
    $q.notify({ type: 'info', message: 'Quyền thông báo chưa được quyết định.' });
  }
}

async function subscribeUserToPush() {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.ready) {
     $q.notify({ type: 'warning', message: 'Service Worker chưa sẵn sàng.' });
    return;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      console.log('User IS already subscribed.');
      console.log('Existing subscription:', JSON.stringify(subscription));
      $q.notify({ type: 'info', message: 'Đã đăng ký nhận thông báo từ trước.' });
      return;
    }

    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    console.log('User is subscribed:', JSON.stringify(subscription));
    $q.notify({ type: 'positive', message: 'Đăng ký nhận thông báo thành công!' });

    // TODO: Send the subscription object to your server
    // Ví dụ:
    // await fetch('/api/subscribe', {
    //   method: 'POST',
    //   body: JSON.stringify(subscription),
    //   headers: {
    //     'Content-Type': 'application/json'
    //   }
    // });
  } catch (error) {
    console.error('Failed to subscribe the user: ', error);
    if (Notification.permission === 'denied') {
      $q.notify({ type: 'negative', message: 'Quyền thông báo bị từ chối. Không thể đăng ký.' });
    } else {
      $q.notify({ type: 'negative', message: `Đăng ký nhận thông báo thất bại: ${error.message}` });
    }
  }
}

function testLocalNotification() {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    $q.notify({ type: 'negative', message: 'Thông báo hoặc Service Worker không được hỗ trợ.' });
    return;
  }

  if (Notification.permission !== 'granted') {
    $q.notify({ type: 'warning', message: 'Vui lòng cấp quyền thông báo trước.' });
    requestNotificationPermission(); // Thử yêu cầu lại quyền
    return;
  }

  navigator.serviceWorker.ready.then(registration => {
    registration.showNotification('Thông báo thử nghiệm!', {
      body: 'Đây là một thông báo local từ PWA.',
      icon: '/icons/favicon-128x128.png', // Đảm bảo icon này tồn tại trong public/icons
      badge: '/icons/favicon-96x96.png', // Đảm bảo icon này tồn tại trong public/icons
      vibrate: [200, 100, 200],
      tag: 'test-notification', // Tag giúp gom nhóm thông báo
      data: { url: window.location.origin } // Dữ liệu kèm theo, ví dụ URL để mở khi click
    });
    $q.notify({ type: 'info', message: 'Đã gửi thông báo local. Kiểm tra thông báo của hệ thống.' });
  }).catch(err => {
    console.error('Service Worker not ready or error showing notification:', err);
    $q.notify({ type: 'negative', message: 'Không thể hiển thị thông báo local.' });
  });
}
</script>

<style scoped>
.q-footer {
  border-top: 1px solid #e0e0e0;
}

.q-header {
  border-bottom: 1px solid #e0e0e0;
}

.q-tab {
  min-height: 60px;
}

.shadow-up-2 {
  box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.2), 0 -2px 2px rgba(0, 0, 0, 0.14), 0 -3px 1px -2px rgba(0, 0, 0, 0.12);
}

.offline-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2000;
}
</style>
