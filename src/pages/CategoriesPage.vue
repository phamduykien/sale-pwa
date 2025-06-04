<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h5 text-weight-bold">Hàng hóa</div>
      <q-btn
        color="primary"
        icon="add"
        label="Thêm hàng hóa"
        @click="$router.push('/product/add')"
      />
    </div>

  
    

    <!-- Filter bar -->
    <!-- <div class="row items-center justify-between q-mb-md">
      <div class="text-h6 text-weight-medium">
        {{ getCategoryName(selectedCategory) }}
        <span class="text-caption text-grey-6">
          ({{ filteredProducts.length }} sản phẩm)
        </span>
      </div>
      
      
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
    </div> -->

    <!-- Products list -->
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

    <div v-else>
      <q-list separator>
        <template v-for="product in sortedProducts" :key="product.id">
          <router-link
            :to="{ path: `/product/${product.id}` }"
            class="text-black text-decoration-none"
          >
            <ProductListItem :product="product" />
          </router-link>
        </template>
      </q-list>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProductStore } from 'src/stores/product'
import ProductListItem from 'src/components/ProductListItem.vue'

const route = useRoute()
const productStore = useProductStore()

const selectedCategory = ref(null)
const sortBy = ref('name')

// const sortOptions = [
//   { label: 'Tên A-Z', value: 'name' },
//   { label: 'Giá thấp đến cao', value: 'price_asc' },
//   { label: 'Giá cao đến thấp', value: 'price_desc' },
//   { label: 'Đánh giá cao nhất', value: 'rating' },
//   { label: 'Mới nhất', value: 'newest' }
// ]

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

// function selectCategory(categoryId) {
//   selectedCategory.value = selectedCategory.value === categoryId ? null : categoryId
  
//   // Update URL query
//   if (selectedCategory.value) {
//     router.replace({
//       path: '/categories',
//       query: { category: selectedCategory.value }
//     })
//   } else {
//     router.replace('/categories')
//   }
// }

// function getProductCountByCategory(categoryId) {
//   return productStore.getProductsByCategory(categoryId).length
// }

// function getCategoryName(categoryId) {
//   if (!categoryId) return 'Tất cả sản phẩm'
//   const category = productStore.categories.find(c => c.id === categoryId)
//   return category ? category.name : 'Tất cả sản phẩm'
// }
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
