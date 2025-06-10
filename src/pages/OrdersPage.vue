<template>
  <q-page padding>
    <!-- Summary Card -->
    <q-card class="q-mb-md" bordered>
      <q-card-section>
        <div class="row items-center q-col-gutter-md">
          <div class="col-6">
            <div class="text-subtitle2 text-grey-8">Tổng đơn hôm nay</div>
            <div class="text-h6">{{ dailyOrders.length }}</div>
          </div>
          <div class="col-6">
            <div class="text-subtitle2 text-grey-8">Doanh thu</div>
            <div class="text-h6">{{ formatCurrency(dailyRevenue) }}</div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Orders List -->
    <q-card bordered>
      <q-card-section>
        <div class="text-h6 q-mb-md">Danh sách đơn hàng</div>

        <q-list separator>
          <q-item v-for="order in dailyOrders" :key="order.id" class="q-py-md">
            <q-item-section>
              <q-item-label class="text-weight-medium">
                Mã đơn: #{{ order.id }}
              </q-item-label>
              <q-item-label caption>
                <div class="row q-gutter-x-sm q-mt-xs">
                  <q-chip
                    dense
                    :color="order.status.completed ? 'positive' : 'grey'"
                    text-color="white"
                    icon="done"
                    label="Hoàn thành"
                    @click="updateStatus(order.id, 'completed')"
                  />
                  <q-chip
                    dense
                    :color="order.status.invoiced ? 'blue' : 'grey'"
                    text-color="white"
                    icon="receipt"
                    label="Xuất hóa đơn"
                    @click="updateStatus(order.id, 'invoiced')"
                  />
                  <q-chip
                    dense
                    :color="order.status.paid ? 'purple' : 'grey'"
                    text-color="white"
                    icon="payments"
                    label="Thu tiền"
                    @click="updateStatus(order.id, 'paid')"
                  />
                </div>
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="text-weight-medium">
                {{ formatCurrency(order.totalAmount) }}
              </div>
              <div class="text-caption text-grey">
                {{ order.items.length }} sản phẩm
              </div>
            </q-item-section>
          </q-item>
        </q-list>

        <!-- Empty state -->
        <div v-if="dailyOrders.length === 0" class="text-center q-pa-lg text-grey">
          <q-icon name="receipt_long" size="48px" />
          <div class="text-h6 q-mt-md">Chưa có đơn hàng</div>
          <div class="text-caption">Các đơn hàng trong ngày sẽ hiển thị ở đây</div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useOrdersStore } from 'src/stores/orders'

const ordersStore = useOrdersStore()

// Lấy đơn hàng và doanh thu trong ngày
const today = new Date()
const dailyOrders = computed(() => ordersStore.getDailyOrders(today))
const dailyRevenue = computed(() => ordersStore.getDailyRevenue(today))

// Cập nhật trạng thái đơn hàng
function updateStatus(orderId, statusKey) {
  ordersStore.updateOrderStatus(orderId, {
    [statusKey]: !ordersStore.orders.find(o => o.id === orderId).status[statusKey]
  })
}

// Format tiền tệ
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}
</script>
