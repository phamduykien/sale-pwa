<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h5 text-weight-bold">Giỏ hàng</div>
      <q-btn
        v-if="!cartStore.cartIsEmpty"
        flat
        color="negative"
        icon="delete_sweep"
        label="Xóa tất cả"
        @click="confirmClearCart"
        size="sm"
      />
    </div>

    <!-- Empty cart state -->
    <div v-if="cartStore.cartIsEmpty" class="text-center q-py-xl">
      <q-icon name="shopping_cart" size="6rem" color="grey-4" class="q-mb-md" />
      <div class="text-h6 text-grey-6 q-mb-md">Giỏ hàng trống</div>
      <div class="text-body2 text-grey-5 q-mb-lg">
        Hãy thêm sản phẩm vào giỏ hàng để bắt đầu mua sắm
      </div>
      <q-btn
        color="primary"
        label="Tiếp tục mua sắm"
        icon="shopping_bag"
        @click="$router.push('/')"
        unelevated
      />
    </div>

    <!-- Cart items -->
    <div v-else>
      <q-list separator>
        <q-item
          v-for="item in cartStore.items"
          :key="item.id"
          class="q-pa-md"
        >
          <q-item-section avatar>
            <q-avatar size="80px" square>
              <q-img :src="item.image" :alt="item.name" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-medium">{{ item.name }}</q-item-label>
            <q-item-label caption class="text-primary text-weight-bold q-mt-xs">
              {{ formatPrice(item.price) }}
            </q-item-label>
            <q-item-label 
              v-if="item.originalPrice && item.originalPrice > item.price"
              caption 
              class="text-grey-6 text-strike"
            >
              {{ formatPrice(item.originalPrice) }}
            </q-item-label>

            <!-- Quantity controls -->
            <div class="row items-center q-mt-sm q-gutter-sm">
              <q-btn
                round
                flat
                size="sm"
                icon="remove"
                @click="cartStore.decreaseQuantity(item.id)"
                :disable="item.quantity <= 1"
              />
              <q-badge color="grey-6" class="q-px-sm">
                {{ item.quantity }}
              </q-badge>
              <q-btn
                round
                flat
                size="sm"
                icon="add"
                @click="cartStore.increaseQuantity(item.id)"
                :disable="item.quantity >= item.stock"
              />
              <div class="text-caption text-grey-6 q-ml-sm">
                (Còn {{ item.stock }} sản phẩm)
              </div>
            </div>
          </q-item-section>

          <q-item-section side class="text-right">
            <div class="text-weight-bold text-h6 text-primary">
              {{ formatPrice(item.price * item.quantity) }}
            </div>
            <q-btn
              flat
              round
              size="sm"
              icon="delete"
              color="negative"
              @click="confirmRemoveItem(item)"
              class="q-mt-sm"
            />
          </q-item-section>
        </q-item>
      </q-list>

      <!-- Order summary -->
      <q-card class="q-mt-lg" flat bordered>
        <q-card-section>
          <div class="text-h6 text-weight-medium q-mb-md">Tóm tắt đơn hàng</div>
          
          <div class="row justify-between q-mb-sm">
            <span>Tạm tính ({{ cartStore.totalItems }} sản phẩm):</span>
            <span class="text-weight-medium">{{ formatPrice(cartStore.totalPrice) }}</span>
          </div>
          
          <div class="row justify-between q-mb-sm">
            <span>Phí vận chuyển:</span>
            <span class="text-weight-medium" :class="cartStore.getShippingCost() === 0 ? 'text-positive' : ''">
              {{ cartStore.getShippingCost() === 0 ? 'Miễn phí' : formatPrice(cartStore.getShippingCost()) }}
            </span>
          </div>

          <q-separator class="q-my-md" />
          
          <div class="row justify-between text-h6 text-weight-bold">
            <span>Tổng cộng:</span>
            <span class="text-primary">{{ formatPrice(cartStore.getFinalTotal()) }}</span>
          </div>

          <!-- Shipping note -->
          <div v-if="cartStore.totalPrice < 1000000" class="text-caption text-grey-6 q-mt-sm">
            Mua thêm {{ formatPrice(1000000 - cartStore.totalPrice) }} để được miễn phí vận chuyển
          </div>
        </q-card-section>
      </q-card>

      <!-- Action buttons -->
      <div class="q-mt-lg q-gutter-md">
        <q-btn
          color="grey-6"
          label="Tiếp tục mua sắm"
          icon="arrow_back"
          @click="$router.push('/')"
          outline
          class="full-width"
        />
        <q-btn
          color="primary"
          label="Thanh toán"
          icon="payment"
          @click="proceedToCheckout"
          unelevated
          class="full-width"
          size="lg"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useCartStore } from 'src/stores/cart'
import { Dialog } from 'quasar'

const cartStore = useCartStore()

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

function confirmRemoveItem(item) {
  Dialog.create({
    title: 'Xác nhận xóa',
    message: `Bạn có chắc chắn muốn xóa "${item.name}" khỏi giỏ hàng?`,
    cancel: {
      label: 'Hủy',
      color: 'grey-6',
      flat: true
    },
    ok: {
      label: 'Xóa',
      color: 'negative',
      unelevated: true
    }
  }).onOk(() => {
    cartStore.removeFromCart(item.id)
  })
}

function confirmClearCart() {
  Dialog.create({
    title: 'Xác nhận xóa tất cả',
    message: 'Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng?',
    cancel: {
      label: 'Hủy',
      color: 'grey-6',
      flat: true
    },
    ok: {
      label: 'Xóa tất cả',
      color: 'negative',
      unelevated: true
    }
  }).onOk(() => {
    cartStore.clearCart()
  })
}

function proceedToCheckout() {
  // Trong thực tế sẽ chuyển đến trang checkout
  Dialog.create({
    title: 'Thanh toán',
    message: 'Tính năng thanh toán sẽ được phát triển trong phiên bản tiếp theo.',
    ok: {
      label: 'Đã hiểu',
      color: 'primary',
      unelevated: true
    }
  })
}
</script>

<style scoped>
.q-item {
  min-height: 120px;
}

@media (max-width: 599px) {
  .q-item-section.avatar {
    min-width: 60px;
  }
  
  .q-avatar {
    width: 60px !important;
    height: 60px !important;
  }
}
</style>
