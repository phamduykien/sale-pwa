<template>
  <q-page>
    <!-- Banner section -->
    <div class="bg-gradient-primary text-white q-pa-md">
      <div class="text-h5 text-weight-bold q-mb-sm">Chào mừng đến SalePWA!</div>
      <div class="text-body2">Khám phá những sản phẩm công nghệ tốt nhất</div>
    </div>

    <!-- Categories section -->
    <div class="q-pa-md">
      <div class="text-h6 text-weight-medium q-mb-md">Danh mục sản phẩm</div>
      <q-scroll-area style="height: 120px; width: 100%;" class="q-mb-md">
        <div class="row no-wrap q-gutter-sm">
          <div
            v-for="category in productStore.categories"
            :key="category.id"
            class="col-auto"
          >
            <q-card
              flat
              bordered
              class="category-card cursor-pointer"
              @click="goToCategory(category.id)"
            >
              <q-card-section class="text-center q-pa-md">
                <q-icon
                  :name="category.icon"
                  size="2rem"
                  :color="category.color"
                  class="q-mb-sm"
                />
                <div class="text-caption text-weight-medium">{{ category.name }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-scroll-area>
    </div>

    <!-- Featured products -->
    <div class="q-pa-md">
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6 text-weight-medium">Sản phẩm nổi bật</div>
        <q-btn
          flat
          color="primary"
          label="Xem tất cả"
          size="sm"
          @click="$router.push('/products')"
        />
      </div>

      <q-inner-loading :showing="productStore.loading">
        <q-spinner color="primary" size="3em" />
      </q-inner-loading>

      <div class="row q-gutter-md">
        <div
          v-for="product in productStore.featuredProducts"
          :key="product.id"
          class="col-5 col-sm-3 col-md-2"
        >
          <ProductCard :product="product" />
        </div>
      </div>
    </div>

    <!-- All products -->
    <div class="q-pa-md">
      <div class="text-h6 text-weight-medium q-mb-md">Tất cả sản phẩm</div>
      
      <div class="row q-gutter-md">
        <div
          v-for="product in productStore.products"
          :key="product.id"
          class="col-5 col-sm-3 col-md-2"
        >
          <ProductCard :product="product" />
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="productStore.loading" class="flex flex-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
    </div>

    <!-- Error state -->
    <div v-if="productStore.error" class="flex flex-center q-pa-xl">
      <div class="text-center">
        <q-icon name="error" size="3em" color="negative" class="q-mb-md" />
        <div class="text-h6">Có lỗi xảy ra</div>
        <div class="text-body2 q-mb-md">{{ productStore.error }}</div>
        <q-btn color="primary" @click="loadData" label="Thử lại" />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useProductStore } from 'src/stores/product'
import { useRouter } from 'vue-router'
import ProductCard from 'src/components/ProductCard.vue'

const productStore = useProductStore()
const router = useRouter()

onMounted(() => {
  loadData()
})

async function loadData() {
  await Promise.all([
    productStore.fetchProducts(),
    productStore.fetchCategories()
  ])
}

function goToCategory(categoryId) {
  router.push({
    path: '/categories',
    query: { category: categoryId }
  })
}
</script>

<style scoped>
.bg-gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.category-card {
  min-width: 80px;
  transition: all 0.3s ease;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
