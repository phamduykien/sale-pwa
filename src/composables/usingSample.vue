// src/pages/ProductsPage.vue
<script setup>
import { onMounted, ref } from 'vue'; // Thêm ref nếu chưa có
import { useCrud } from 'src/composables/useCrud';
import { InventoryItemService } from 'src/services/InventoryItemService';
// ... các import khác ...

// Thay thế các ref cũ liên quan đến danh sách sản phẩm và loading
// const inventoryItemList = ref([])
// const isLoadingMore = ref(false)
// const hasMore = ref(true)
// const skip = ref(0)

const { 
  items: inventoryItemList, // Đổi tên items thành inventoryItemList cho phù hợp
  loading: isLoadingProducts, // Đổi tên loading để tránh trùng lặp nếu có loading khác
  error: productError,
  fetchAll: fetchProducts,
  // fetchById, create, update, remove // Nếu cần dùng các hàm này
} = useCrud(InventoryItemService, 'hàng hóa');

// ... (các ref và logic khác của component) ...

const initializeData = async () => {
  // isLoadingMore.value = true; // Sẽ được quản lý bởi useCrud.loading
  // inventoryItemList.value = []; // Sẽ được quản lý bởi useCrud.items
  // skip.value = 0; // Logic phân trang cần tích hợp với fetchAll của useCrud
  // hasMore.value = true;
  
  // Giả sử fetchAll của useCrud xử lý việc reset và tải trang đầu
  // Hoặc bạn cần truyền params cho fetchAll
  await fetchProducts({ skip: 0, take: 20 }); // Ví dụ: tải 20 item đầu
  initialLoadDone.value = true; 
};

const loadMoreItems = async (index, done) => {
  // ... logic loadMoreItems cần được điều chỉnh để sử dụng fetchAll với skip/take mới ...
  // Ví dụ:
  // if (isLoadingProducts.value || !hasMore.value) { // Sử dụng hasMore từ logic phân trang của bạn
  //   done(true); // true nếu không còn gì để tải
  //   return;
  // }
  // const currentSkip = inventoryItemList.value.length;
  // await fetchProducts({ skip: currentSkip, take: take.value });
  // done(!hasMore.value); // Cập nhật hasMore dựa trên kết quả fetch
};

const refreshData = async (done) => {
  initialLoadDone.value = false; 
  await initializeData(); 
  done();
}

// ... (phần còn lại của script setup) ...
</script>
