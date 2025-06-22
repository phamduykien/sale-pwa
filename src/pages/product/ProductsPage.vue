<template>
  <BaseListPage
    title="Hàng hóa"
    :items="productStore.products"
    :loading="productStore.loading"
    :error="productStore.error"
    :has-more="productStore.hasMoreProducts"
    :on-refresh="handleRefresh"
    :on-load-more="handleLoadMore"
    item-key="inventory_item_id"
    empty-icon="inventory_2"
    empty-text="Không có sản phẩm nào"
  >
    <template #page-actions>
      <q-btn
        round
        color="primary" 
        icon="add"
        @click="goToAddProductPage"
        aria-label="Thêm hàng hóa"
      />
    </template>

    <template #filter-area>
      <!-- TODO: Thêm filter cho sản phẩm nếu cần -->
      <!-- Ví dụ:
      <div class="filter-container">
        <div class="filter-row">
          <q-select
            v-model="selectedCategoryFilter"
            :options="categoryFilterOptions"
            label="Danh mục"
            dense outlined emit-value map-options clearable
            @update:model-value="applyProductFilters"
            class="filter-item"
          />
        </div>
      </div>
      -->
    </template>

    <template #list-item-content="{ item }">
      <!-- Sử dụng component ProductList đã có để render từng item -->
      <!-- Tuy nhiên, ProductList hiện tại nhận một mảng `items`.
           Chúng ta cần điều chỉnh ProductList để nó có thể render một item đơn lẻ,
           hoặc ở đây chúng ta sẽ không dùng ProductList mà render trực tiếp QSlideItem.
           Để đơn giản, tôi sẽ render QSlideItem trực tiếp ở đây, tương tự như ProductList.
           Hoặc, chúng ta có thể tạo một component mới `ProductListItem.vue` và dùng ở đây.
           
           Tạm thời, tôi sẽ copy cấu trúc QSlideItem từ ProductList.vue vào đây.
           LƯU Ý: Đây là sự lặp lại code, lý tưởng nhất là ProductList có thể nhận
           một item đơn lẻ hoặc chúng ta có một ProductListItem.vue riêng.
      -->
      <q-slide-item
        :key="item.inventory_item_id"
        right-color="grey-2"
        @left="() => handleSlideInteractionForItem(item.inventory_item_id)" 
        @right="() => handleSlideInteractionForItem(item.inventory_item_id)"
        @slide="(details) => handleItemSlide(details, item.inventory_item_id)"
      >
        <template v-slot:right>
          <div class="row items-center no-wrap q-pa-xs full-height">
            <q-btn 
              icon="delete" 
              label="Xóa" 
              color="negative" 
              flat 
              dense 
              no-caps
              class="q-mr-xs"
              @click="() => handleDeleteItem(item, getResetFnForProductItem(item.inventory_item_id))" 
            />
            <q-btn 
              icon="edit" 
              label="Sửa" 
              color="primary" 
              flat 
              dense 
              no-caps
              @click="() => handleEditItem(item, getResetFnForProductItem(item.inventory_item_id))" 
            />
          </div>
        </template>
        
        <q-item clickable v-ripple :ref="el => { if (el) productItemRefs[item.inventory_item_id] = el; }">
          <q-item-section avatar>
            <q-avatar rounded>
              <img
                :src="item.file_name ? `https://ubuntu.cukcuk.store:8443/g4/api/dimob/InventoryItems/image?file_name=${item.file_name}` : 'https://cdn.quasar.dev/img/boy-avatar.png'"
                style="object-fit: cover;"
                @error="onImageError"
              >
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label lines="1">{{ item.inventory_item_name }}</q-item-label>
            <q-item-label caption lines="1">Mã: {{ item.sku_code }}</q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-item-label class="text-weight-medium">{{ formatPrice(item.unit_price) }}</q-item-label>
            <q-item-label caption>{{ item.unit_name }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-slide-item>
    </template>
  </BaseListPage>
</template>

<script setup>
import { onMounted, onActivated, defineOptions, ref } from 'vue'; // Bỏ computed
import { useQuasar } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import { useProductStore } from 'src/stores/product';
import BaseListPage from 'src/layouts/bases/BaseListPage.vue';
// ProductList component không còn được dùng trực tiếp ở đây nữa nếu chúng ta render item trong slot

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const $q = useQuasar();

defineOptions({
  name: 'ProductPage'
});

// Logic cho QSlideItem (tương tự như trong ProductList.vue cũ)
const productItemRefs = ref({});
const openedProductSlideItemId = ref(null);

const formatPrice = (price) => {
  if (price === null || price === undefined) return 'N/A';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const onImageError = (event) => {
  event.target.src = 'https://cdn.quasar.dev/img/boy-avatar.png';
};

const getResetFnForProductItem = (itemId) => {
  const qItemInstance = productItemRefs.value[itemId];
  if (qItemInstance && qItemInstance.$parent && typeof qItemInstance.$parent.reset === 'function') {
    return qItemInstance.$parent.reset;
  }
  console.warn(`Could not find QSlideItem parent or reset function for product item ${itemId}`);
  return () => {};
};

const closeOpenedProductSlideItem = (excludeItemId = null) => {
  if (openedProductSlideItemId.value && openedProductSlideItemId.value !== excludeItemId) {
    const resetFn = getResetFnForProductItem(openedProductSlideItemId.value);
    if (resetFn) resetFn();
    openedProductSlideItemId.value = null;
  }
};

const handleSlideInteractionForItem = (itemId) => {
  closeOpenedProductSlideItem(itemId);
};

const handleItemSlide = (details, itemId) => {
  if (details.ratio > 0 && details.side === 'right') {
    if (openedProductSlideItemId.value !== itemId) {
      closeOpenedProductSlideItem(itemId);
      openedProductSlideItemId.value = itemId;
    }
  } else if (details.ratio === 0 && openedProductSlideItemId.value === itemId) {
    openedProductSlideItemId.value = null;
  }
};
// Kết thúc logic QSlideItem


onMounted(() => {
  if (productStore.products.length === 0 && !productStore.loading) {
    productStore.refreshProducts();
  }
});

onActivated(() => {
  // Logic onActivated có thể giữ nguyên hoặc điều chỉnh nếu cần
  if (!route.query.updatedProductId && productStore.products.length === 0 && !productStore.loading) {
     // Nếu không có updatedProductId và danh sách rỗng, có thể refresh
     // productStore.refreshProducts();
  }
  // Xử lý updatedProductId nên được thực hiện trong store hoặc thông qua watch nếu cần thiết
});

const handleRefresh = async (done) => {
  await productStore.refreshProducts();
  if (done) done();
};

const handleLoadMore = async (index, done) => {
  await productStore.loadMoreProducts();
  if (done) done(!productStore.hasMoreProducts);
};

const goToAddProductPage = () => {
  // Store sẽ gọi setProductForCreate khi trang chi tiết được mounted với mode 'add'
  router.push('/product/add?mode=add'); 
};

const handleEditItem = (item, resetFn) => {
  if (item && item.inventory_item_id) {
    router.push(`/product/${item.inventory_item_id}?mode=edit`);
  } else {
    $q.notify({
      color: 'negative',
      icon: 'error',
      message: 'Không thể mở trang sửa, ID hàng hóa không tồn tại.'
    });
  }
  if (resetFn) resetFn();
  openedProductSlideItemId.value = null;
};

const handleDeleteItem = (item, resetFn) => {
  $q.dialog({
    title: 'Xác nhận xóa',
    message: `Bạn có chắc chắn muốn xóa "${item.inventory_item_name}" không?`,
    persistent: true,
    ok: { label: 'Xóa', color: 'negative', flat: false },
    cancel: { label: 'Hủy', color: 'grey', flat: false }
  }).onOk(async () => {
    await productStore.deleteProduct(item.inventory_item_id);
  });
  if (resetFn) resetFn();
  openedProductSlideItemId.value = null;
};

// TODO: Thêm logic cho applyProductFilters nếu có filter UI
// const selectedCategoryFilter = ref(null);
// const categoryFilterOptions = ref([...]);
// const applyProductFilters = () => {
//   productStore.updateProductFilters({ category_id: selectedCategoryFilter.value });
// };

</script>

<style scoped>
/* Giữ lại style cần thiết hoặc xóa nếu không dùng */
.filter-container {
  width: 100%;
  overflow-x: auto;
  white-space: nowrap;
}
.filter-row {
  display: flex;
  flex-wrap: nowrap;
}
.filter-item {
  min-width: 180px; 
  margin-right: 16px;
  flex-shrink: 0;
}
.filter-item:last-child {
  margin-right: 0;
}
/* CSS cho QSlideItem (tương tự ProductList.vue cũ) */
.q-slide-item__right {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
</style>
