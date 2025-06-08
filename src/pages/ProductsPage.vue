<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h5 text-weight-bold">Hàng hóa</div>
      <q-btn
        round
        color="grey-7"
        text-color="white"
        icon="add"
        @click="$router.push('/product/add')"
        aria-label="Thêm hàng hóa"
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
    <div v-if="isLoadingMore && inventoryItemList.length === 0" class="flex flex-center q-py-xl"> <!-- Hiển thị loading ban đầu -->
      <q-spinner color="primary" size="3em" />
    </div>

    <div v-else-if="!hasMore && inventoryItemList.length === 0" class="text-center q-py-xl"> <!-- Không có sản phẩm nào và không còn để tải -->
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
      <q-infinite-scroll @load="loadMoreItems" :offset="250" :disable="!hasMore || isLoadingMore">
        <ProductList :items="inventoryItemList" @edit-item="handleEditItem" @delete-item="handleDeleteItem" />
        <template v-slot:loading>
          <div class="row justify-center q-my-md">
            <q-spinner-dots color="primary" size="40px" />
          </div>
        </template>
      </q-infinite-scroll>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue' // Removed 'computed'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from 'src/stores/product'
import ProductList from 'src/components/ProductList.vue'
import { InventoryItemService } from 'src/services/InventoryItemService';

const route = useRoute()
const router = useRouter() // Thêm useRouter
const productStore = useProductStore()
const $q = useQuasar()

// const selectedCategory = ref(null) // Bị ESLint báo lỗi no-unused-vars
const inventoryItemList = ref([])
const skip = ref(0)
const take = ref(20) // Số lượng item lấy mỗi lần, có thể điều chỉnh
const isLoadingMore = ref(false)
const hasMore = ref(true)


// const sortOptions = [
//   { label: 'Tên A-Z', value: 'name' },
//   { label: 'Giá thấp đến cao', value: 'price_asc' },
//   { label: 'Giá cao đến thấp', value: 'price_desc' },
//   { label: 'Đánh giá cao nhất', value: 'rating' },
//   { label: 'Mới nhất', value: 'newest' }
// ]

// const filteredProducts = computed(() => { // Không còn dùng filteredProducts theo cách cũ
//   return productStore.products
// })


onMounted(async () => {
  // Gọi loadMoreItems lần đầu để tải dữ liệu ban đầu
  await loadMoreItems(0, () => {}); // Truyền một hàm rỗng cho done

  // productStore có thể vẫn cần fetch dữ liệu khác
  await Promise.all([
    productStore.fetchProducts(), // Giữ lại nếu cần cho các chức năng khác
    productStore.fetchCategories() // Giữ lại nếu cần cho các chức năng khác
  ]);
})

const loadMoreItems = async (index, done) => {
  // Nếu done là null hoặc undefined (khi gọi từ onMounted), tạo một hàm rỗng
  const callback = done || (() => {});

  if (isLoadingMore.value || !hasMore.value) {
    callback(true); // done(true) để báo không còn gì để tải
    return;
  }

  isLoadingMore.value = true;
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('Không tìm thấy token xác thực.');
      hasMore.value = false;
      callback(true);
      return;
    }

    const newItems = await InventoryItemService.getInventoryItems(token, skip.value, take.value);

    if (newItems && newItems.length > 0) {
      inventoryItemList.value.push(...newItems);
      skip.value += newItems.length;
      if (newItems.length < take.value) {
        hasMore.value = false; // Không còn item nào nữa
      }
    } else {
      hasMore.value = false; // Không có item mới hoặc lỗi
    }
    callback(!hasMore.value); // done(true) nếu không còn gì để tải
  } catch (error) {
    console.error('Lỗi khi tải thêm sản phẩm:', error);
    hasMore.value = false; // Giả sử lỗi là không còn gì để tải
    callback(true);
  } finally {
    isLoadingMore.value = false;
  }
}

// Watch for route query changes
watch(() => route.query.category, (newCategoryId) => {
  if (newCategoryId) {
    // Xử lý khi category thay đổi nếu cần
    console.log('Category changed to:', newCategoryId);
  }
})

const handleEditItem = (item) => {
  console.log('Edit item:', item)
  if (item && item.inventory_item_id) {
    router.push(`/product/${item.inventory_item_id}`)
  } else {
    console.error('Không thể chỉnh sửa: ID hàng hóa không hợp lệ.', item)
    $q.notify({
      color: 'negative',
      icon: 'error',
      message: 'Không thể mở trang chỉnh sửa, ID hàng hóa không tồn tại.'
    })
  }
}

const handleDeleteItem = (item) => {
  console.log('Delete item:', item)
  $q.dialog({
    title: 'Xác nhận xóa',
    message: `Bạn có chắc chắn muốn xóa "${item.inventory_item_name}" không?`,
    persistent: true,
    ok: {
      label: 'Xóa',
      color: 'negative',
      flat: false
    },
    cancel: {
      label: 'Hủy',
      color: 'grey', 
      flat: false,
    }
  }).onOk(async () => {
    try {
      // Gọi API xóa ở đây nếu cần
      // await InventoryItemService.deleteInventoryItem(item.inventory_item_id, localStorage.getItem('token'));
      
      // Xóa item khỏi danh sách local
      inventoryItemList.value = inventoryItemList.value.filter(
        (i) => i.inventory_item_id !== item.inventory_item_id
      );
      $q.notify({
        color: 'positive',
        icon: 'delete_forever',
        message: `Đã xóa: ${item.inventory_item_name}`
      })
    } catch (error) {
      console.error('Lỗi khi xóa sản phẩm:', error);
      $q.notify({
        color: 'negative',
        icon: 'error',
        message: 'Xóa sản phẩm thất bại. Vui lòng thử lại.'
      })
    }
  })
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
