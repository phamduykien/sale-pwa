<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 text-weight-bold">{{ title }}</div>
      <slot name="page-actions">
        <!-- Ví dụ: Nút thêm mới có thể được đặt ở đây từ component cha -->
      </slot>
    </div>

    <div class="q-mb-md">
      <slot name="filter-area"></slot>
    </div>

    <q-pull-to-refresh @refresh="onRefresh">
      <div v-if="loading && items.length === 0" class="flex flex-center q-py-xl">
        <q-spinner color="primary" size="3em" />
      </div>
      <div v-else-if="!loading && items.length === 0 && !error" class="text-center q-py-xl">
        <q-icon :name="emptyIcon" size="4rem" color="grey-4" class="q-mb-md" />
        <div class="text-h6 text-grey-6">{{ emptyText }}</div>
        <q-btn
          v-if="error"
          color="primary"
          label="Thử lại"
          @click="onRefresh"
          class="q-mt-md"
          unelevated
        />
      </div>
      <div v-else-if="error && items.length === 0" class="text-center q-py-xl text-negative">
         <q-icon name="error_outline" size="4rem" color="negative" class="q-mb-md" />
        <div class="text-h6">Không thể tải dữ liệu</div>
        <div class="text-body2">{{ error }}</div>
         <q-btn
          color="primary"
          label="Thử lại"
          @click="onRefresh"
          class="q-mt-md"
          unelevated
        />
      </div>
      
      <q-infinite-scroll @load="onLoadMore" :offset="250" :disable="!hasMore || loading">
        <q-list separator>
          <slot name="list-item-content" v-for="item in items" :key="itemKey ? item[itemKey] : item.id" :item="item">
            <!-- Nội dung mặc định nếu component cha không cung cấp slot -->
            <q-item :key="itemKey ? item[itemKey] : item.id">
              <q-item-section>
                <q-item-label>{{ item }}</q-item-label>
              </q-item-section>
            </q-item>
          </slot>
        </q-list>
        
        <template v-slot:loading>
          <div v-if="loading" class="row justify-center q-my-md">
            <q-spinner-dots color="primary" size="40px" />
          </div>
        </template>
      </q-infinite-scroll>
    </q-pull-to-refresh>
  </q-page>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({ // Bỏ gán vào biến props
  title: {
    type: String,
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  },
  error: {
    type: [String, null],
    default: null,
  },
  hasMore: {
    type: Boolean,
    required: true,
  },
  onRefresh: {
    type: Function,
    required: true,
  },
  onLoadMore: {
    type: Function,
    required: true,
  },
  itemKey: { // Prop để xác định key duy nhất cho mỗi item, ví dụ 'order_id' hoặc 'inventory_item_id'
    type: String,
    default: 'id', 
  },
  emptyText: {
    type: String,
    default: 'Không có dữ liệu nào',
  },
  emptyIcon: {
    type: String,
    default: 'inbox', // Icon mặc định khi danh sách rỗng
  }
});
</script>

<style scoped>
/* Có thể thêm style chung cho BaseListPage nếu cần */
</style>
