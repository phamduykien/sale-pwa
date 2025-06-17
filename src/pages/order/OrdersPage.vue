<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 text-weight-bold">Danh sách Đơn hàng</div>
      <!-- TODO: Thêm nút tạo đơn hàng mới nếu cần -->
      <!-- <q-btn round color="primary" icon="add" @click="goToCreateOrderPage" /> -->
    </div>

    <!-- Filters -->
    <div class="filter-container q-mb-md">
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
        />
      </div>
    </div>

    <q-pull-to-refresh @refresh="orderStore.refreshOrders">
      <div v-if="orderStore.loading && orderStore.orders.length === 0" class="flex flex-center q-py-xl">
        <q-spinner color="primary" size="3em" />
      </div>
      <div v-else-if="!orderStore.loading && orderStore.orders.length === 0 && !orderStore.error" class="text-center q-py-xl">
        <q-icon name="receipt_long" size="4rem" color="grey-4" class="q-mb-md" />
        <div class="text-h6 text-grey-6">Không có đơn hàng nào</div>
        <q-btn
          v-if="orderStore.error"
          color="primary"
          label="Thử lại"
          @click="orderStore.refreshOrders"
          class="q-mt-md"
          unelevated
        />
      </div>
      <div v-else-if="orderStore.error && orderStore.orders.length === 0" class="text-center q-py-xl text-negative">
         <q-icon name="error_outline" size="4rem" color="negative" class="q-mb-md" />
        <div class="text-h6">Không thể tải đơn hàng</div>
        <div class="text-body2">{{ orderStore.error }}</div>
         <q-btn
          color="primary"
          label="Thử lại"
          @click="orderStore.refreshOrders"
          class="q-mt-md"
          unelevated
        />
      </div>
      
      <q-infinite-scroll @load="onLoadMore" :offset="250" :disable="!orderStore.hasMoreOrders || orderStore.loading">
        <q-list separator>
          <q-item v-for="order in orderStore.orders" :key="order.order_id" clickable v-ripple @click="viewOrderDetail(order)">
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
        </q-list>
        
        <template v-slot:loading>
          <div v-if="orderStore.loading" class="row justify-center q-my-md">
            <q-spinner-dots color="primary" size="40px" />
          </div>
        </template>
      </q-infinite-scroll>
    </q-pull-to-refresh>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'; // Bỏ watch
// import { useRouter } from 'vue-router'; // Bỏ useRouter nếu không dùng
import { useOrderStore } from 'src/stores/orders';
import { date } from 'quasar';

// const router = useRouter(); // Bỏ router nếu không dùng
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

const publishInvoiceStatusOptions = [
  { label: 'Tất cả', value: -1 }, // Giả sử -1 là tất cả
  { label: 'Chưa phát hành HĐ', value: 0 }, // Cần map giá trị này với API
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

const applyFilters = () => {
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

const onLoadMore = async (index, done) => {
  await orderStore.loadMoreOrders();
  done(!orderStore.hasMoreOrders); // done(true) nếu không còn gì để tải
};

onMounted(() => {
  if (orderStore.orders.length === 0) {
    orderStore.refreshOrders();
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
