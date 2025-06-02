<template>
  <q-page>
    <div v-if="productStore.loading" class="flex flex-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
    </div>

    <div v-else-if="!product" class="text-center q-pa-xl">
      <q-icon name="error" size="4rem" color="grey-4" class="q-mb-md" />
      <div class="text-h6 text-grey-6">Không tìm thấy sản phẩm</div>
      <div class="text-body2 text-grey-5 q-mb-lg">
        Sản phẩm này có thể đã bị xóa hoặc không tồn tại
      </div>
      <q-btn
        color="primary"
        label="Về trang chủ"
        @click="$router.push('/')"
        unelevated
      />
    </div>

    <div v-else>
      <!-- Back button -->
      <q-btn
        flat
        icon="arrow_back"
        label="Quay lại"
        @click="$router.go(-1)"
        class="q-ma-md"
      />

      <!-- Product images -->
      <div class="product-images q-pa-md">
        <q-carousel
          v-model="selectedImage"
          thumbnails
          infinite
          :autoplay="false"
          arrows
          height="300px"
          class="rounded-borders"
        >
          <q-carousel-slide
            v-for="(image, index) in product.images || [product.image]"
            :key="index"
            :name="index"
            :img-src="image"
          />
        </q-carousel>
      </div>

      <!-- Product info -->
      <div class="q-pa-md">
        <!-- Title and rating -->
        <div class="q-mb-md">
          <h1 class="text-h5 text-weight-bold q-mb-sm">{{ product.name }}</h1>
          
          <div v-if="product.rating" class="row items-center q-mb-sm">
            <q-rating
              v-model="product.rating"
              size="18px"
              color="amber"
              readonly
              dense
            />
            <span class="text-caption text-grey-6 q-ml-sm">
              {{ product.rating }}/5 ({{ product.reviews || 0 }} đánh giá)
            </span>
          </div>

          <!-- Stock status -->
          <q-badge
            v-if="product.stock <= 5"
            :color="product.stock === 0 ? 'negative' : 'warning'"
            class="text-weight-bold"
          >
            {{ product.stock === 0 ? 'Hết hàng' : `Còn ${product.stock} sản phẩm` }}
          </q-badge>
        </div>

        <!-- Price -->
        <div class="price-section q-mb-lg">
          <div class="row items-baseline q-gutter-md">
            <span class="text-h4 text-weight-bold text-primary">
              {{ formatPrice(product.price) }}
            </span>
            <span 
              v-if="product.originalPrice && product.originalPrice > product.price"
              class="text-h6 text-grey-6 text-strike"
            >
              {{ formatPrice(product.originalPrice) }}
            </span>
            <q-badge 
              v-if="product.originalPrice && product.originalPrice > product.price"
              color="red" 
              class="text-weight-bold"
            >
              -{{ Math.round((1 - product.price / product.originalPrice) * 100) }}%
            </q-badge>
          </div>
        </div>

        <!-- Description -->
        <div class="q-mb-lg">
          <div class="text-h6 text-weight-medium q-mb-md">Mô tả sản phẩm</div>
          <p class="text-body1 text-grey-8">{{ product.description }}</p>
        </div>

        <!-- Features (mock) -->
        <div class="q-mb-lg">
          <div class="text-h6 text-weight-medium q-mb-md">Tính năng nổi bật</div>
          <q-list dense>
            <q-item>
              <q-item-section avatar>
                <q-icon name="check_circle" color="positive" />
              </q-item-section>
              <q-item-section>Chất lượng cao cấp</q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar>
                <q-icon name="check_circle" color="positive" />
              </q-item-section>
              <q-item-section>Bảo hành chính hãng</q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar>
                <q-icon name="check_circle" color="positive" />
              </q-item-section>
              <q-item-section>Giao hàng miễn phí</q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar>
                <q-icon name="check_circle" color="positive" />
              </q-item-section>
              <q-item-section>Đổi trả trong 30 ngày</q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- Quantity selector -->
        <div class="q-mb-lg">
          <div class="text-subtitle1 text-weight-medium q-mb-md">Số lượng</div>
          <div class="row items-center q-gutter-md">
            <q-btn
              round
              flat
              icon="remove"
              @click="decreaseQuantity"
              :disable="quantity <= 1"
            />
            <q-badge color="grey-6" class="q-px-md text-h6">
              {{ quantity }}
            </q-badge>
            <q-btn
              round
              flat
              icon="add"
              @click="increaseQuantity"
              :disable="quantity >= product.stock"
            />
            <div class="text-caption text-grey-6">
              (Tối đa {{ product.stock }} sản phẩm)
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="q-gutter-md q-pb-lg">
          <q-btn
            color="primary"
            size="lg"
            icon="add_shopping_cart"
            label="Thêm vào giỏ hàng"
            @click="addToCart"
            :disable="product.stock === 0"
            class="full-width"
            unelevated
          />
          <q-btn
            color="secondary"
            size="lg"
            icon="flash_on"
            label="Mua ngay"
            @click="buyNow"
            :disable="product.stock === 0"
            class="full-width"
            unelevated
          />
        </div>

        <!-- Share -->
        <div class="text-center q-pb-lg">
          <q-btn
            flat
            icon="share"
            label="Chia sẻ sản phẩm"
            @click="shareProduct"
            color="grey-6"
          />
        </div>
      </div>

      <!-- Related products -->
      <div class="q-pa-md" v-if="relatedProducts.length > 0">
        <div class="text-h6 text-weight-medium q-mb-md">Sản phẩm liên quan</div>
        <q-scroll-area style="height: 280px; width: 100%;">
          <div class="row no-wrap q-gutter-md">
            <div
              v-for="relatedProduct in relatedProducts"
              :key="relatedProduct.id"
              style="min-width: 160px;"
            >
              <ProductCard :product="relatedProduct" />
            </div>
          </div>
        </q-scroll-area>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from 'src/stores/product'
import { useCartStore } from 'src/stores/cart'
import { Notify, Dialog } from 'quasar'
import ProductCard from 'src/components/ProductCard.vue'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const cartStore = useCartStore()

const selectedImage = ref(0)
const quantity = ref(1)

const product = computed(() => {
  const id = parseInt(route.params.id)
  return productStore.getProductById(id)
})

const relatedProducts = computed(() => {
  if (!product.value) return []
  
  return productStore.getProductsByCategory(product.value.categoryId)
    .filter(p => p.id !== product.value.id)
    .slice(0, 5)
})

onMounted(async () => {
  await Promise.all([
    productStore.fetchProducts(),
    productStore.fetchCategories()
  ])
})

// Watch for route parameter changes
watch(() => route.params.id, () => {
  selectedImage.value = 0
  quantity.value = 1
})

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

function increaseQuantity() {
  if (quantity.value < product.value.stock) {
    quantity.value++
  }
}

function decreaseQuantity() {
  if (quantity.value > 1) {
    quantity.value--
  }
}

function addToCart() {
  if (product.value && product.value.stock > 0) {
    cartStore.addToCart(product.value, quantity.value)
    quantity.value = 1
  }
}

function buyNow() {
  if (product.value && product.value.stock > 0) {
    cartStore.addToCart(product.value, quantity.value)
    router.push('/cart')
  }
}

function shareProduct() {
  if (navigator.share) {
    navigator.share({
      title: product.value.name,
      text: product.value.description,
      url: window.location.href
    }).catch(console.error)
  } else {
    // Fallback for browsers that don't support Web Share API
    navigator.clipboard.writeText(window.location.href).then(() => {
      Notify.create({
        type: 'positive',
        message: 'Đã sao chép link sản phẩm',
        position: 'top'
      })
    }).catch(() => {
      Dialog.create({
        title: 'Chia sẻ sản phẩm',
        message: `Link sản phẩm: ${window.location.href}`,
        ok: {
          label: 'Đóng',
          color: 'primary'
        }
      })
    })
  }
}
</script>

<style scoped>
.product-images {
  background: linear-gradient(to bottom, #f5f5f5, #ffffff);
}

.price-section {
  padding: 16px;
  background: rgba(25, 118, 210, 0.05);
  border-radius: 8px;
  border-left: 4px solid var(--q-primary);
}

@media (max-width: 599px) {
  .text-h4 {
    font-size: 1.5rem !important;
  }
  
  .text-h6 {
    font-size: 1rem !important;
  }
}
</style>
