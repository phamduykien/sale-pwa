<template>
  <q-list separator>
    <q-slide-item
      v-for="item in items"
      :key="item.inventory_item_id"
      right-color="primary"
      @right="({ reset }) => onEdit(item, reset)"
      left-color="negative"
      @left="({ reset }) => onDelete(item, reset)"
    >
      <template v-slot:right>
        <q-item-section avatar class="q-pa-sm cursor-pointer" @click.stop>
          <q-icon name="edit" color="white" />
          <div class="text-caption text-white">Sửa</div>
        </q-item-section>
      </template>
      <template v-slot:left>
        <q-item-section avatar class="q-pa-sm cursor-pointer" @click.stop>
          <q-icon name="delete" color="white" />
           <div class="text-caption text-white">Xóa</div>
        </q-item-section>
      </template>

      <q-item clickable v-ripple>
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
import { defineComponent } from 'vue';

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
    const formatPrice = (price) => {
      if (price === null || price === undefined) return 'N/A';
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const onEdit = (item, reset) => {
      emit('edit-item', item);
      reset(); // Reset the slide item state
    };

    const onDelete = (item, reset) => {
      emit('delete-item', item);
      reset(); // Reset the slide item state
    };

    const onImageError = (event) => {
      event.target.src = 'https://cdn.quasar.dev/img/boy-avatar.png'; // Fallback image
    };

    return {
      formatPrice,
      onEdit,
      onDelete,
      onImageError
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
</style>
