<template>
  <BaseListPage
    title="Danh sách Đơn hàng"
    :items="orderStore.orders"
    :loading="orderStore.loading"
    :error="orderStore.error"
    :has-more="orderStore.hasMoreOrders"
    :on-refresh="handleRefresh"
    :on-load-more="handleLoadMore"
    item-key="order_id"
    empty-icon="receipt_long"
    empty-text="Không có đơn hàng nào"
  >
    <template #page-actions>
      <!-- <q-btn round color="primary" icon="add" @click="goToCreateOrderPage" /> -->
    </template>

    <template #filter-area>
      <div class="filter-container">
        <div class="filter-row">
          <q-select
            v-model="selectedDateRange"
            :options="dateRangeOptions"
            label="Thời gian"
            dense
            outlined
            emit-value
            map-options
            @update:model-value="applyFilters"
            class="filter-item"
            style="min-width: 180px;"
          />
          <q-select
            v-model="selectedPublishStatus"
            :options="publishInvoiceStatusOptions"
            label="Tình trạng phát hành HĐ"
            dense
            outlined
            emit-value
            map-options
            clearable
            @update:model-value="applyFilters"
            @clear="() => { selectedPublishStatus = null; applyFilters(); }"
            class="filter-item"
            style="min-width: 220px;"
          />
          <q-select
            v-model="selectedTaxStatus"
            :options="invoiceTransmissionStatusOptions"
            label="Tình trạng gửi CQT"
            dense
            outlined
            emit-value
            map-options
            clearable
            @update:model-value="applyFilters"
            @clear="() => { selectedTaxStatus = null; applyFilters(); }"
            class="filter-item"
            style="min-width: 200px;"
          />
        </div>
      </div>
    </template>

    <template #list-item-content="{ item: order }">
      <q-item clickable v-ripple @click="viewOrderDetail(order)">
        <q-item-section avatar>
          <q-avatar rounded color="secondary" text-color="white">
            <q-icon :name="getOrderStatusIcon(order.order_status)" />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label class="text-weight-medium">{{ order.order_no }}</q-item-label>
          <q-item-label caption lines="1">
            Khách hàng: {{ order.customer_name || 'N/A' }} - SĐT: {{ order.customer_tel || 'N/A' }}
          </q-item-label>
          <q-item-label caption lines="1">
            Ngày: {{ formatDate(order.order_date) }}
          </q-item-label>
        </q-item-section>

        <q-item-section side top>
          <q-item-label class="text-weight-bold text-primary">{{ formatCurrency(order.total_amount) }}</q-item-label>
          <q-badge :color="getOrderStatusColor(order.order_status)" :label="getOrderStatusText(order.order_status)" class="q-mt-xs" />
        </q-item-section>
      </q-item>
    </template>
  </BaseListPage>
</template>

<script setup>
import { onMounted, ref } from 'vue'; // Bỏ computed
// import { useRouter } from 'vue-router'; // Bỏ useRouter nếu viewOrderDetail chưa dùng
import { useOrderStore } from 'src/stores/orders';
import { date } from 'quasar';
import BaseListPage from 'src/layouts/bases/BaseListPage.vue'; // Import BaseListPage

// const router = useRouter(); // Bỏ router nếu viewOrderDetail chưa dùng
const orderStore = useOrderStore();

// Filter States
const selectedDateRange = ref('thisMonth'); // Giá trị mặc định, ví dụ: 'today', 'thisWeek', 'thisMonth'
const selectedPublishStatus = ref(null); // Giá trị mặc định là tất cả
const selectedTaxStatus = ref(null);     // Giá trị mặc định là tất cả

const dateRangeOptions = [
  { label: 'Hôm nay', value: 'today' },
  { label: 'Tuần này', value: 'thisWeek' },
  { label: 'Tháng này', value: 'thisMonth' },
  { label: '30 ngày qua', value: 'last30days' },
  // { label: 'Tùy chọn...', value: 'custom' } // Có thể thêm tùy chọn ngày
];

// Đổi tên biến cho nhất quán với những gì đã dùng trong template
const publishInvoiceStatusOptions = [ 
  { label: 'Tất cả', value: -1 },
  { label: 'Chưa phát hành HĐ', value: 0 },
  { label: 'Đang phát hành HĐ', value: 1 },
  { label: 'Phát hành lỗi HĐ', value: 2 },
  { label: 'Đã phát hành HĐ', value: 3 },
];

const invoiceTransmissionStatusOptions = [
  { label: 'Tất cả', value: -1 }, // Giả sử -1 là tất cả
  { label: 'Chưa gửi CQT', value: 0 }, // Cần map giá trị này với API
  { label: 'Đã gửi CQT', value: 1 },
  { label: 'CQT tiếp nhận', value: 2 },
  { label: 'CQT không tiếp nhận', value: 3 },
  { label: 'Gửi CQT lỗi', value: 4 },
];

const applyFilters = () => { // Hàm này vẫn giữ nguyên để tính toán và gọi store
  let fromDateStr = orderStore.filterPayload.from_date;
  let toDateStr = orderStore.filterPayload.to_date;

  const now = new Date();
  switch (selectedDateRange.value) {
    case 'today':
      fromDateStr = date.formatDate(date.startOfDate(now, 'day'), 'YYYY-MM-DDTHH:mm:ss.SSSZ');
      toDateStr = date.formatDate(date.endOfDate(now, 'day'), 'YYYY-MM-DDTHH:mm:ss.SSSZ');
      break;
    case 'thisWeek':
      fromDateStr = date.formatDate(date.startOfDate(now, 'week'), 'YYYY-MM-DDTHH:mm:ss.SSSZ');
      toDateStr = date.formatDate(date.endOfDate(now, 'week'), 'YYYY-MM-DDTHH:mm:ss.SSSZ');
      break;
    case 'thisMonth':
      fromDateStr = date.formatDate(date.startOfDate(now, 'month'), 'YYYY-MM-DDTHH:mm:ss.SSSZ');
      toDateStr = date.formatDate(date.endOfDate(now, 'month'), 'YYYY-MM-DDTHH:mm:ss.SSSZ');
      break;
    case 'last30days':
      fromDateStr = date.formatDate(date.subtractFromDate(now, { days: 30 }), 'YYYY-MM-DDTHH:mm:ss.SSSZ');
      toDateStr = date.formatDate(now, 'YYYY-MM-DDTHH:mm:ss.SSSZ');
      break;
  }

  const filtersToUpdate = {
    from_date: fromDateStr,
    to_date: toDateStr,
    // API của bạn có thể nhận trực tiếp các giá trị này hoặc cần mapping
    // Giả sử API nhận giá trị từ publishStatusOptions và taxStatusOptions
    // Nếu API yêu cầu một key khác, bạn cần đổi tên key ở đây
    PublishInvoiceStatus: selectedPublishStatus.value === null ? -1 : selectedPublishStatus.value,
    SendTaxStatus: selectedTaxStatus.value === null ? -1 : selectedTaxStatus.value,
    skip: 0 // Luôn reset skip khi filter thay đổi
  };
  orderStore.updateFilter(filtersToUpdate);
};


const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return date.formatDate(dateString, 'DD/MM/YYYY HH:mm');
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '0 đ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const getOrderStatusText = (status) => {
  // TODO: Cần có mapping đầy đủ cho các order_status
  switch (status) {
    case 80: return 'Hoàn thành';
    case 90: return 'Đã hủy';
    // Thêm các case khác
    default: return `Trạng thái ${status}`;
  }
};

const getOrderStatusColor = (status) => {
  switch (status) {
    case 80: return 'positive';
    case 90: return 'negative';
    // Thêm các case khác
    default: return 'grey';
  }
};

const getOrderStatusIcon = (status) => {
  switch (status) {
    case 80: return 'check_circle';
    case 90: return 'cancel';
    // Thêm các case khác
    default: return 'help_outline';
  }
};

const viewOrderDetail = (order) => {
  // TODO: Điều hướng đến trang chi tiết đơn hàng
  console.log('View order detail:', order.order_id);
  // router.push(`/order/${order.order_id}`);
};

// Các hàm này sẽ được truyền vào BaseListPage props
const handleRefresh = async (done) => {
  await orderStore.refreshOrders();
  if (done) done();
};

const handleLoadMore = async (index, done) => {
  await orderStore.loadMoreOrders();
  if (done) done(!orderStore.hasMoreOrders);
};

onMounted(() => {
  // Logic fetch ban đầu đã được xử lý trong store hoặc BaseListPage có thể gọi onRefresh
  if (orderStore.orders.length === 0 && !orderStore.loading) {
    handleRefresh(); // Gọi refresh nếu danh sách rỗng và không đang tải
  }
});
</script>

<style scoped>
.q-item__section--avatar .q-avatar {
  font-size: 20px; /* Điều chỉnh kích thước icon trong avatar nếu cần */
}

.filter-container {
  width: 100%;
  overflow-x: auto;
  white-space: nowrap; /* Ngăn các item xuống dòng */
}

.filter-row {
  display: flex; /* Sắp xếp các item trên một hàng */
  flex-wrap: nowrap; /* Đảm bảo không xuống dòng */
}

.filter-item {
  min-width: 200px; /* Độ rộng tối thiểu cho mỗi filter */
  margin-right: 16px; /* Khoảng cách giữa các filter */
  flex-shrink: 0; /* Ngăn item co lại khi không đủ chỗ */
}

/* Loại bỏ margin phải cho item cuối cùng */
.filter-item:last-child {
  margin-right: 0;
}
</style>
