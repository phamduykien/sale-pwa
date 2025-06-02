<template>
  <q-page class="q-pa-md">
    <!-- Search header -->
    <div class="q-mb-lg">
      <q-input
        v-model="searchQuery"
        placeholder="Tìm kiếm sản phẩm..."
        outlined
        clearable
        autofocus
        @keyup.enter="performSearch"
        @clear="clearSearch"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
        <template v-slot:append>
          <q-btn
            flat
            round
            icon="tune"
            @click="showFilters = !showFilters"
            :color="hasActiveFilters ? 'primary' : 'grey-6'"
          />
        </template>
      </q-input>
    </div>

    <!-- Filters -->
    <q-slide-transition>
      <q-card v-show="showFilters" flat bordered class="q-mb-lg">
        <q-card-section>
          <div class="text-subtitle1 text-weight-medium q-mb-md">Bộ lọc</div>
          
          <!-- Category filter -->
          <div class="q-mb-md">
            <div class="text-body2 text-weight-medium q-mb-sm">Danh mục</div>
            <q-option-group
              v-model="selectedCategory"
              :options="categoryOptions"
              color="primary"
              type="radio"
            />
          </div>

          <!-- Price range filter -->
          <div class="q-mb-md">
            <div class="text-body2 text-weight-medium q-mb-sm">Khoảng giá</div>
            <q-range
              v-model="priceRange"
              :min="0"
              :max="50000000"
              :step="1000000"
              label
              color="primary"
              :format-value="formatPrice"
            />
            <div class="row justify-between text-caption text-grey-6 q-mt-xs">
              <span>{{ formatPrice(priceRange.min) }}</span>
              <span>{{ formatPrice(priceRange.max) }}</span>
            </div>
          </div>

          <!-- Rating filter -->
          <div class="q-mb-md">
            <div class="text-body2 text-weight-medium q-mb-sm">Đánh giá tối thiểu</div>
            <q-rating
              v-model="minRating"
              size="2em"
              color="amber"
              icon="star_border"
              icon-selected="star"
              icon-half="star_half"
            />
          </div>

          <!-- Action buttons -->
          <div class="row q-gutter-sm">
            <q-btn
              color="primary"
              label="Áp dụng"
              @click="applyFilters"
              unelevated
            />
            <q-btn
              color="grey-6"
              label="Xóa bộ lọc"
              @click="clearFilters"
              outline
            />
          </div>
        </q-card-section>
      </q-card>
    </q-slide-transition>

    <!-- Search results header -->
    <div v-if="hasSearched" class="row items-center justify-between q-mb-md">
      <div class="text-h6 text-weight-medium">
        Kết quả tìm kiếm
        <span v-if="searchQuery" class="text-caption text-grey-6">
          cho "{{ searchQuery }}"
        </span>
        <span class="text-caption text-grey-6">
          ({{ filteredResults.length }} sản phẩm)
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

    <!-- Search results -->
    <div v-if="!hasSearched" class="text-center q-py-xl">
      <q-icon name="search" size="4rem" color="grey-4" class="q-mb-md" />
      <div class="text-h6 text-grey-6">Tìm kiếm sản phẩm</div>
      <div class="text-body2 text-grey-5">
        Nhập từ khóa để tìm kiếm sản phẩm bạn muốn
      </div>
    </div>

    <div v-else-if="filteredResults.length === 0" class="text-center q-py-xl">
      <q-icon name="search_off" size="4rem" color="grey-4" class="q-mb-md" />
      <div class="text-h6 text-grey-6">Không tìm thấy sản phẩm</div>
      <div class="text-body2 text-grey-5 q-mb-lg">
        Thử thay đổi từ khóa hoặc bộ lọc tìm kiếm
      </div>
      <q-btn
        color="primary"
        label="Xóa bộ lọc"
        @click="clearFilters"
        v-if="hasActiveFilters"
        unelevated
      />
    </div>

    <div v-else class="row q-gutter-md">
      <div
        v-for="product in sortedResults"
        :key="product.id"
        class="col-5 col-sm-3 col-md-2"
      >
        <ProductCard :product="product" />
      </div>
    </div>

    <!-- Recent searches -->
    <div v-if="!hasSearched && recentSearches.length > 0" class="q-mt-xl">
      <div class="text-subtitle1 text-weight-medium q-mb-md">Tìm kiếm gần đây</div>
      <div class="row q-gutter-sm">
        <q-chip
          v-for="search in recentSearches"
          :key="search"
          clickable
          color="grey-3"
          text-color="grey-8"
          @click="selectRecentSearch(search)"
          removable
          @remove="removeRecentSearch(search)"
        >
          {{ search }}
        </q-chip>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from 'src/stores/product'
import { LocalStorage } from 'quasar'
import ProductCard from 'src/components/ProductCard.vue'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

const searchQuery = ref('')
const hasSearched = ref(false)
const showFilters = ref(false)
const selectedCategory = ref(null)
const priceRange = ref({ min: 0, max: 50000000 })
const minRating = ref(0)
const sortBy = ref('relevance')
const recentSearches = ref([])

const sortOptions = [
  { label: 'Liên quan nhất', value: 'relevance' },
  { label: 'Tên A-Z', value: 'name' },
  { label: 'Giá thấp đến cao', value: 'price_asc' },
  { label: 'Giá cao đến thấp', value: 'price_desc' },
  { label: 'Đánh giá cao nhất', value: 'rating' }
]

const categoryOptions = computed(() => [
  { label: 'Tất cả danh mục', value: null },
  ...productStore.categories.map(cat => ({
    label: cat.name,
    value: cat.id
  }))
])

const searchResults = computed(() => {
  if (!hasSearched.value || !searchQuery.value) {
    return productStore.products
  }
  
  const query = searchQuery.value.toLowerCase()
  return productStore.products.filter(product =>
    product.name.toLowerCase().includes(query) ||
    product.description.toLowerCase().includes(query)
  )
})

const filteredResults = computed(() => {
  let results = searchResults.value

  // Filter by category
  if (selectedCategory.value) {
    results = results.filter(product => product.categoryId === selectedCategory.value)
  }

  // Filter by price range
  results = results.filter(product => 
    product.price >= priceRange.value.min && product.price <= priceRange.value.max
  )

  // Filter by rating
  if (minRating.value > 0) {
    results = results.filter(product => (product.rating || 0) >= minRating.value)
  }

  return results
})

const sortedResults = computed(() => {
  const results = [...filteredResults.value]
  
  switch (sortBy.value) {
    case 'name':
      return results.sort((a, b) => a.name.localeCompare(b.name))
    case 'price_asc':
      return results.sort((a, b) => a.price - b.price)
    case 'price_desc':
      return results.sort((a, b) => b.price - a.price)
    case 'rating':
      return results.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    case 'relevance':
    default:
      // For relevance, keep original order or sort by featured status
      return results.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
  }
})

const hasActiveFilters = computed(() => {
  return selectedCategory.value !== null ||
         priceRange.value.min > 0 ||
         priceRange.value.max < 50000000 ||
         minRating.value > 0
})

onMounted(async () => {
  await Promise.all([
    productStore.fetchProducts(),
    productStore.fetchCategories()
  ])
  
  // Load recent searches
  recentSearches.value = LocalStorage.getItem('recent_searches') || []
  
  // Check if there's a search query in URL
  if (route.query.q) {
    searchQuery.value = route.query.q
    performSearch()
  }
})

// Watch for route query changes
watch(() => route.query.q, (newQuery) => {
  if (newQuery && newQuery !== searchQuery.value) {
    searchQuery.value = newQuery
    performSearch()
  }
})

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

function performSearch() {
  if (searchQuery.value.trim()) {
    hasSearched.value = true
    addToRecentSearches(searchQuery.value.trim())
    
    // Update URL
    router.replace({
      path: '/search',
      query: { q: searchQuery.value.trim() }
    })
  }
}

function clearSearch() {
  searchQuery.value = ''
  hasSearched.value = false
  router.replace('/search')
}

function addToRecentSearches(query) {
  const searches = [...recentSearches.value]
  const index = searches.indexOf(query)
  
  if (index > -1) {
    searches.splice(index, 1)
  }
  
  searches.unshift(query)
  recentSearches.value = searches.slice(0, 10) // Keep only 10 recent searches
  
  LocalStorage.set('recent_searches', recentSearches.value)
}

function selectRecentSearch(query) {
  searchQuery.value = query
  performSearch()
}

function removeRecentSearch(query) {
  const index = recentSearches.value.indexOf(query)
  if (index > -1) {
    recentSearches.value.splice(index, 1)
    LocalStorage.set('recent_searches', recentSearches.value)
  }
}

function applyFilters() {
  // Filters are applied automatically through computed properties
  showFilters.value = false
}

function clearFilters() {
  selectedCategory.value = null
  priceRange.value = { min: 0, max: 50000000 }
  minRating.value = 0
  showFilters.value = false
}
</script>

<style scoped>
.q-chip {
  margin-bottom: 8px;
}
</style>
