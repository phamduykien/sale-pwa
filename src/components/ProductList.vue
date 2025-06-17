<template>
  <q-list separator>
    <q-slide-item
      v-for="item in items"
      :key="item.inventory_item_id"
      right-color="grey-2"
      @left="() => handleSlideInteraction(item.inventory_item_id)" 
      @right="() => handleSlideInteraction(item.inventory_item_id)"
      @slide="(details) => handleSlide(details, item.inventory_item_id)"
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
            @click="() => onDelete(item, getResetFnForItem(item.inventory_item_id))" 
          />
          <q-btn 
            icon="edit" 
            label="Sửa" 
            color="primary" 
            flat 
            dense 
            no-caps
            @click="() => onEdit(item, getResetFnForItem(item.inventory_item_id))" 
          />
        </div>
      </template>
      
      <q-item clickable v-ripple :ref="el => itemRefs[item.inventory_item_id] = el">
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
  </q-list>
</template>

<script>
import { defineComponent, ref } from 'vue'; // Thêm ref vào đây

export default defineComponent({
  name: 'ProductList',
  props: {
    items: {
      type: Array,
      required: true
    }
  },
  emits: ['edit-item', 'delete-item'],
  setup(props, { emit }) {
    const itemRefs = ref({}); 
    const openedSlideItemId = ref(null); // ID của item đang mở

    const formatPrice = (price) => {
      if (price === null || price === undefined) return 'N/A';
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    // Hàm để lấy hàm reset của QSlideItem tương ứng
    // QSlideItem không trực tiếp cung cấp hàm reset qua ref,
    // nhưng chúng ta có thể tìm component cha QSlideItem từ QItem.
    const getResetFnForItem = (itemId) => {
      const qItemInstance = itemRefs.value[itemId];
      // QSlideItem là component cha trực tiếp của QItem trong trường hợp này
      if (qItemInstance && qItemInstance.$parent && typeof qItemInstance.$parent.reset === 'function') {
        return qItemInstance.$parent.reset;
      }
      console.warn(`Could not find QSlideItem parent or reset function for item ${itemId}`);
      return () => {};
    };

    const closeOpenedSlideItem = (excludeItemId = null) => {
      if (openedSlideItemId.value && openedSlideItemId.value !== excludeItemId) {
        const resetFn = getResetFnForItem(openedSlideItemId.value);
        if (resetFn) {
          resetFn();
        }
        openedSlideItemId.value = null;
      }
    };

    const handleSlideInteraction = (itemId) => {
      // Khi người dùng bắt đầu tương tác (trượt) một item mới
      closeOpenedSlideItem(itemId); 
      // Không set openedSlideItemId ở đây ngay, đợi sự kiện @slide để biết nó thực sự mở
    };

    const handleSlide = (details, itemId) => {
      // details.side là 'left' hoặc 'right'
      // details.ratio là tỷ lệ trượt (0 đến 1)
      // details.isFinal là true nếu người dùng thả tay và slide item tự hoàn thành animation
      
      if (details.ratio > 0 && details.side === 'right') { // Chỉ quan tâm khi trượt sang phải để lộ nút
        if (openedSlideItemId.value !== itemId) {
          closeOpenedSlideItem(itemId); // Đóng item khác nếu có
          openedSlideItemId.value = itemId; // Đánh dấu item này đang mở
        }
      } else if (details.ratio === 0 && openedSlideItemId.value === itemId) {
        // Item đã đóng lại
        openedSlideItemId.value = null;
      }
    };
    
    const onEdit = (item, resetFn) => {
      emit('edit-item', item);
      if (resetFn) resetFn();
      openedSlideItemId.value = null; // Đảm bảo đóng sau action
    };

    const onDelete = (item, resetFn) => {
      emit('delete-item', item);
      if (resetFn) resetFn();
      openedSlideItemId.value = null; // Đảm bảo đóng sau action
    };

    const onImageError = (event) => {
      event.target.src = 'https://cdn.quasar.dev/img/boy-avatar.png'; // Fallback image
    };

    return {
      formatPrice,
      onEdit,
      onDelete,
      onImageError,
      itemRefs,
      getResetFnForItem,
      handleSlideInteraction,
      handleSlide
    };
  }
});
</script>
<style scoped>
.q-item__section--avatar {
  min-width: 50px; /* Adjust as needed */
}
.text-caption {
  font-size: 0.75rem;
}
/* Đảm bảo các nút trong slot chiếm đủ không gian và căn giữa */
.q-slide-item__right { /* Đổi từ __left sang __right */
  display: flex;
  align-items: center;
  justify-content: flex-start; /* Để các nút bắt đầu từ bên trái của slot */
}
</style>
