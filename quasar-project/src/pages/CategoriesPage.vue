<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="text-h5 text-weight-bold q-mb-lg">Danh mục sản phẩm</div>

    <!-- Categories grid -->
    <div class="row q-gutter-md q-mb-xl">
      <div
        v-for="category in productStore.categories"
        :key="category.id"
        class="col-5 col-sm-3 col-md-2"
      >
        <q-card
          flat
          bordered
          class="category-card cursor-pointer text-center"
          @click="selectCategory(category.id)"
          :class="{ 'category-selected': selectedCategory === category.id }"
        >
          <q-card-section class="q-pa-lg">
            <q-icon
              :name="category.icon"
              size="3rem"
              :color="selectedCategory === category.id ? 'white' : category.color"
              class="q-mb-md"
            />
            <div class="text-subtitle2 text-weight-medium">
              {{ category.name }}
            </div>
            <div class="text-caption text-grey-6 q-mt-xs">
              {{ getProductCountByCategory(category.id) }} sản phẩm
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Filter bar -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6 text-weight-medium">
        {{ getCategoryName(selectedCategory) }}
        <span class="text-caption text-grey-6">
          ({{ filteredProducts.length }} sản phẩm)
        </span>
      </div>
      
      <!-- Sort dropdown -->
      <q-select
        v-model="sortBy"
        :options="sortOptions"
        label="Sắp xếp"
        dense
        outlined
        style="min-width: 150px"
        emit-value
        map-options
      />
    </div>

    <!-- Products grid -->
    <div v-if="productStore.loading" class="flex flex-center q-py-xl">
      <q-spinner color="primary" size="3em" />
    </div>

    <div v-else-if="filteredProducts.length === 0" class="text-center q-py-xl">
      <q-icon name="inventory_2" size="4rem" color="grey-4" class="q-mb-md" />
      <div class="text-h6 text-grey-6">Không có sản phẩm nào</div>
      <div class="text-body2 text-grey-5 q-mb-lg">
        Thử chọn danh mục khác hoặc quay lại trang chủ
      </div>
      <q-btn
        color="primary"
        label="Về trang chủ"
        @click="$router.push('/')"
        unelevated
      />
    </div>

    <div v-else class="row q-gutter-md">
      <div
        v-for="product in sortedProducts"
        :key="product.id"
        class="col-5 col-sm-3 col-md-2"
      >
        <ProductCard :product="product" />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from 'src/stores/product'
import ProductCard from 'src/components/ProductCard.vue'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

const selectedCategory = ref(null)
const sortBy = ref('name')

const sortOptions = [
  { label: 'Tên A-Z', value: 'name' },
  { label: 'Giá thấp đến cao', value: 'price_asc' },
  { label: 'Giá cao đến thấp', value: 'price_desc' },
  { label: 'Đánh giá cao nhất', value: 'rating' },
  { label: 'Mới nhất', value: 'newest' }
]

const filteredProducts = computed(() => {
  if (!selectedCategory.value) {
    return productStore.products
  }
  return productStore.getProductsByCategory(selectedCategory.value)
})

const sortedProducts = computed(() => {
  const products = [...filteredProducts.value]
  
  switch (sortBy.value) {
    case 'name':
      return products.sort((a, b) => a.name.localeCompare(b.name))
    case 'price_asc':
      return products.sort((a, b) => a.price - b.price)
    case 'price_desc':
      return products.sort((a, b) => b.price - a.price)
    case 'rating':
      return products.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    case 'newest':
      return products.sort((a, b) => b.id - a.id)
    default:
      return products
  }
})

onMounted(async () => {
  await Promise.all([
    productStore.fetchProducts(),
    productStore.fetchCategories()
  ])
  
  // Check if there's a category in query params
  if (route.query.category) {
    selectedCategory.value = parseInt(route.query.category)
  }
})

// Watch for route query changes
watch(() => route.query.category, (newCategoryId) => {
  if (newCategoryId) {
    selectedCategory.value = parseInt(newCategoryId)
  }
})

function selectCategory(categoryId) {
  selectedCategory.value = selectedCategory.value === categoryId ? null : categoryId
  
  // Update URL query
  if (selectedCategory.value) {
    router.replace({
      path: '/categories',
      query: { category: selectedCategory.value }
    })
  } else {
    router.replace('/categories')
  }
}

function getProductCountByCategory(categoryId) {
  return productStore.getProductsByCategory(categoryId).length
}

function getCategoryName(categoryId) {
  if (!categoryId) return 'Tất cả sản phẩm'
  const category = productStore.categories.find(c => c.id === categoryId)
  return category ? category.name : 'Tất cả sản phẩm'
}
</script>

<style scoped>
.category-card {
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.category-selected {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
}

.category-selected .q-card-section {
  color: white;
}

.category-selected .text-grey-6 {
  color: rgba(255, 255, 255, 0.8) !important;
}

@media (max-width: 599px) {
  .category-card {
    min-height: 140px;
  }
}
</style>
