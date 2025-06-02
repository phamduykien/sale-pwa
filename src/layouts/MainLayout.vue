<template>
  <q-layout view="hHh lpR fFf">
    <!-- Header -->
    <q-header class="bg-white text-grey-8 shadow-2">
      <q-toolbar class="q-px-md">
        <!-- Logo/Title -->
        <q-toolbar-title class="text-primary text-weight-bold">
          <q-icon name="store" size="sm" class="q-mr-sm" />
          SalePWA
        </q-toolbar-title>

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
          label="Trang chủ"
          @click="navigateTo('/')"
          :class="{ 'text-primary': $route.path === '/' }"
        />
        <q-tab
          name="categories"
          icon="category"
          label="Danh mục"
          @click="navigateTo('/categories')"
          :class="{ 'text-primary': $route.path === '/categories' }"
        />
        <q-tab
          name="cart"
          icon="shopping_cart"
          label="Giỏ hàng"
          @click="navigateTo('/cart')"
          :class="{ 'text-primary': $route.path === '/cart' || cartStore.totalItems > 0 }"
        >
          <q-badge
            v-if="cartStore.totalItems > 0"
            color="red"
            floating
            rounded
            style="top: 8px; right: 12px;"
          >
            {{ cartStore.totalItems }}
          </q-badge>
        </q-tab>
        <q-tab
          name="profile"
          icon="person"
          label="Tài khoản"
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

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()

const showSearch = ref(false)
const searchQuery = ref('')
const activeTab = ref('home')

// Load cart from storage on mount
onMounted(() => {
  cartStore.loadCartFromStorage()
  updateActiveTab()
})

// Watch route changes to update active tab
watch(() => route.path, () => {
  updateActiveTab()
})

function updateActiveTab() {
  const path = route.path
  if (path === '/') {
    activeTab.value = 'home'
  } else if (path === '/categories') {
    activeTab.value = 'categories'
  } else if (path === '/cart') {
    activeTab.value = 'cart'
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
</style>
