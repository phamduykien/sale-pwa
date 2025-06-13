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
      <q-pull-to-refresh @refresh="refreshData">
        <q-infinite-scroll @load="loadMoreItems" :offset="250" :disable="!hasMore || isLoadingMore">
          <ProductList :items="inventoryItemList" @edit-item="handleEditItem" @delete-item="handleDeleteItem" />
          <template v-slot:loading>
          <div class="row justify-center q-my-md">
            <q-spinner-dots color="primary" size="40px" />
          </div>
        </template>
      </q-infinite-scroll>
    </q-pull-to-refresh>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onActivated, defineOptions } from 'vue' // Removed 'watch', 'computed'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from 'src/stores/product'
import ProductList from 'src/components/ProductList.vue'
import { InventoryItemService } from 'src/services/InventoryItemService';
import { useNetwork } from 'src/composables/useNetwork'; // Thêm import

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
const initialLoadDone = ref(false) // Thêm cờ theo dõi tải lần đầu


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

const { isOnline } = useNetwork(); // Sử dụng hook useNetwork

defineOptions({
  name: 'ProductPage' // Đổi tên component thành multi-word
})

const initializeData = async () => {
  isLoadingMore.value = true; // Bắt đầu loading tổng thể cho dữ liệu ban đầu
  inventoryItemList.value = [];
  skip.value = 0;
  hasMore.value = true; // Reset hasMore, sẽ được cập nhật bởi logic dưới

  try {
    // Luôn gọi fetchProducts từ store. Store sẽ xử lý online/offline.
    await productStore.fetchProducts();

    // Sau khi fetchProducts, productStore.products sẽ có dữ liệu từ API (nếu online)
    // hoặc từ IndexedDB (nếu offline và có dữ liệu).
    if (productStore.products && productStore.products.length > 0) {
      inventoryItemList.value = [...productStore.products];
      skip.value = productStore.products.length;
      // Nếu số lượng item từ store < take, có thể không còn item nào khác từ nguồn này.
      // Tuy nhiên, nếu online, infinite scroll vẫn có thể cố gắng tải thêm.
      // hasMore sẽ được quản lý chính xác hơn bởi loadMoreItems khi online.
      if (inventoryItemList.value.length < take.value && !isOnline.value) {
          hasMore.value = false; // Nếu offline và dữ liệu ban đầu ít, thì không còn gì để tải thêm
      } else if (inventoryItemList.value.length < take.value && isOnline.value) {
          // Nếu online và dữ liệu ban đầu ít, vẫn có thể còn (API có thể trả về ít hơn take ở lần đầu)
          // loadMoreItems sẽ xác định chính xác hơn
          hasMore.value = true; 
      } else {
          hasMore.value = true; // Mặc định là còn nếu có dữ liệu ban đầu >= take
      }

    } else {
      // Không có sản phẩm nào từ store (có thể do lỗi, hoặc không có data offline)
      inventoryItemList.value = [];
      hasMore.value = false; // Không có dữ liệu ban đầu, không thể tải thêm
    }

    // Nếu đang offline và không có dữ liệu nào được tải từ store,
    // thì hasMore nên là false để q-infinite-scroll không cố gắng gọi loadMoreItems.
    if (!isOnline.value && inventoryItemList.value.length === 0) {
        hasMore.value = false;
    }

  } catch (error) {
    console.error('Lỗi khi khởi tạo dữ liệu trang sản phẩm:', error);
    inventoryItemList.value = []; // Đảm bảo list rỗng khi có lỗi
    hasMore.value = false; // Không thể tải thêm khi có lỗi khởi tạo
  } finally {
    isLoadingMore.value = false; // Kết thúc loading ban đầu
  }    
  initialLoadDone.value = true; // Đánh dấu đã tải lần đầu
};

onMounted(async () => {
  //PDKIEN - Chỉ thực hiện khi Activated
  // if (!initialLoadDone.value) {
  //   await initializeData();
  // }
  
});

// Xử lý cập nhật khi component được kích hoạt lại (do keep-alive)
onActivated(async () => { // Thêm async nếu cần gọi initializeData
  if (route.query.updatedProductId) {
    const updatedId = route.query.updatedProductId;
    // Đảm bảo productStore đã có dữ liệu mới nhất
    // Nếu productStore.updateProduct không tự động cập nhật productStore.products một cách reactive hoàn toàn
    // hoặc nếu có khả năng dữ liệu store bị cũ, có thể cần fetch lại item đó.
    // Tuy nhiên, dựa trên code productStore.updateProduct, nó đã cập nhật this.products.
    const productFromStore = productStore.getProductById(updatedId);

    if (productFromStore) {
      // productFromStore.inventory_item_id là ID chính từ store
      // Các item p trong inventoryItemList cũng nên có p.inventory_item_id
      const index = inventoryItemList.value.findIndex(p => String(p.inventory_item_id) === String(productFromStore.inventory_item_id));
      if (index !== -1) {
        // Cập nhật item trong danh sách local với dữ liệu từ store
        inventoryItemList.value[index] = { ...inventoryItemList.value[index], ...productFromStore };
      } else {
        // Nếu không tìm thấy item (ví dụ: item mới được thêm và chưa có trong danh sách hiện tại từ infinite scroll)
        // Có thể cần thêm logic để thêm item mới vào đầu danh sách hoặc tải lại một phần nếu cần.
        // Hiện tại, giả định item đã có trong danh sách.
        console.warn(`Product with ID ${updatedId} not found in local list after update.`);
        // Cân nhắc: Nếu không tìm thấy, có thể là do danh sách chưa tải hết.
        // Trong trường hợp này, việc chỉ cập nhật item có thể không đủ.
        // Tuy nhiên, nếu người dùng vừa sửa item đó, nó phải có trong danh sách đã tải.
      }
    }
    // Xóa query param sau khi xử lý để tránh xử lý lại khi không cần thiết
    router.replace({ query: { ...route.query, updatedProductId: undefined } });
  } else if (!initialLoadDone.value) {
    // Nếu component được kích hoạt lại và chưa từng tải dữ liệu ban đầu (trường hợp hiếm với keep-alive)
    // thì mới gọi initializeData.
    await initializeData();
  }
  // Nếu initialLoadDone.value là true và không có updatedProductId, không làm gì cả, giữ nguyên trạng thái.
});

const loadMoreItems = async (index, done) => {
  const callback = done || (() => {});

  // 1. Nếu đang offline, không thực hiện gọi API để "load more"
  if (!isOnline.value) {
    console.log('Đang offline, không tải thêm sản phẩm từ API qua infinite scroll.');
    // Không thay đổi hasMore ở đây vì nó đã được set bởi initializeData
    // Hoặc có thể set hasMore = false nếu chắc chắn không thể load thêm khi offline
    // hasMore.value = false; // Cân nhắc: Nếu offline, không thể load thêm từ API
    callback(true); // Báo không còn gì để tải (từ API)
    return;
  }

  // 2. Các điều kiện dừng khác (đang tải, hoặc đã báo hết)
  if (isLoadingMore.value || !hasMore.value) {
    callback(true);
    return;
  }

  isLoadingMore.value = true;
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('Không tìm thấy token xác thực cho loadMoreItems.');
      hasMore.value = false; // Không có token, không thể tải thêm
      callback(true);
      return;
    }

    // skip.value được cập nhật từ initializeData hoặc các lần loadMoreItems trước
    const newItems = await InventoryItemService.getInventoryItems(token, skip.value, take.value);

    if (newItems && newItems.length > 0) {
      inventoryItemList.value.push(...newItems);
      skip.value += newItems.length;
      if (newItems.length < take.value) {
        hasMore.value = false; // API trả về ít hơn số lượng yêu cầu, coi như hết
      } else {
        hasMore.value = true; // Vẫn còn khả năng có thêm
      }
    } else {
      hasMore.value = false; // API không trả về item mới, hoặc trả về mảng rỗng
    }
    callback(!hasMore.value); // done(true) nếu hasMore là false (hết)
  } catch (error) {
    console.error('Lỗi khi tải thêm sản phẩm (loadMoreItems):', error);
    hasMore.value = false; // Lỗi khi tải, coi như hết
    callback(true);
  } finally {
    isLoadingMore.value = false;
  }
}

const refreshData = async (done) => {
  // Reset trạng thái để tải lại từ đầu
  skip.value = 0;
  // inventoryItemList.value = []; // Không reset ở đây để tránh list nháy, initializeData sẽ làm
  hasMore.value = true;
  initialLoadDone.value = false; // Để initializeData chạy lại hoàn toàn
  
  await initializeData(); // Gọi hàm tải dữ liệu ban đầu
  
  // Sau khi tải xong, gọi done() để QPullToRefresh biết là đã hoàn thành
  done();
}

// Watch for route query changes
// watch(() => route.query.category, (newCategoryId) => {
//   if (newCategoryId) {
//     // Xử lý khi category thay đổi nếu cần
//     console.log('Category changed to:', newCategoryId);
//   }
// })

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
