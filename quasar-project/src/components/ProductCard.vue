<template>
  <q-card 
    class="product-card cursor-pointer" 
    flat 
    bordered
    @click="goToProduct"
  >
    <!-- Product Image -->
    <div class="product-image-container">
      <q-img
        :src="product.image"
        :alt="product.name"
        class="product-image"
        ratio="1"
        loading="lazy"
      >
        <!-- Sale badge -->
        <div 
          v-if="product.originalPrice && product.originalPrice > product.price"
          class="absolute-top-right q-ma-sm"
        >
          <q-badge color="red" class="text-weight-bold">
            -{{ Math.round((1 - product.price / product.originalPrice) * 100) }}%
          </q-badge>
        </div>

        <!-- Stock status -->
        <div
          v-if="product.stock <= 5"
          class="absolute-bottom-left q-ma-sm"
        >
          <q-badge 
            :color="product.stock === 0 ? 'negative' : 'warning'" 
            class="text-weight-bold"
          >
            {{ product.stock === 0 ? 'Hết hàng' : `Còn ${product.stock}` }}
          </q-badge>
        </div>
      </q-img>
    </div>

    <q-card-section class="q-pa-sm">
      <!-- Product Name -->
      <div class="text-subtitle2 text-weight-medium line-clamp-2 q-mb-xs">
        {{ product.name }}
      </div>

      <!-- Rating -->
      <div v-if="product.rating" class="row items-center q-mb-xs">
        <q-rating
          v-model="product.rating"
          size="14px"
          color="amber"
          readonly
          dense
        />
        <span class="text-caption text-grey-6 q-ml-xs">
          ({{ product.reviews || 0 }})
        </span>
      </div>

      <!-- Price -->
      <div class="price-section">
        <div class="row items-baseline q-gutter-xs">
          <span class="text-h6 text-weight-bold text-primary">
            {{ formatPrice(product.price) }}
          </span>
          <span 
            v-if="product.originalPrice && product.originalPrice > product.price"
            class="text-caption text-grey-6 text-strike"
          >
            {{ formatPrice(product.originalPrice) }}
          </span>
        </div>
      </div>

      <!-- Add to cart button -->
      <q-btn
        color="primary"
        size="sm"
        label="Thêm vào giỏ"
        icon="add_shopping_cart"
        class="full-width q-mt-sm"
        :disable="product.stock === 0"
        @click.stop="addToCart"
        dense
      />
    </q-card-section>
  </q-card>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useCartStore } from 'src/stores/cart'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const cartStore = useCartStore()

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

function goToProduct() {
  router.push(`/product/${props.product.id}`)
}

function addToCart() {
  if (props.product.stock > 0) {
    cartStore.addToCart(props.product, 1)
  }
}
</script>

<style scoped>
.product-card {
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.product-image-container {
  position: relative;
  overflow: hidden;
}

.product-image {
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: 2.4em;
  line-height: 1.2em;
}

.price-section {
  min-height: 32px;
  display: flex;
  align-items: center;
}

.q-card-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

@media (max-width: 599px) {
  .product-card {
    max-width: 180px;
  }
  
  .text-h6 {
    font-size: 1rem !important;
  }
}
</style>
