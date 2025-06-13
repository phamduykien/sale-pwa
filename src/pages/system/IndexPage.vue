<template>
  <q-page>
    <!-- Header section -->
    <div class="bg-gradient-primary text-white q-pa-md">
      <div class="text-h5 text-weight-bold q-mb-sm">Dashboard</div>
      <div class="text-body2">Tổng quan hoạt động kinh doanh</div>
    </div>

    <!-- Stats Cards -->
    <div class="q-pa-md">
      <div v-if="statCards" class="row q-col-gutter-md">
        <div class="col-12 col-sm-6 col-md-3">
          <StatCard v-bind="statCards.revenue" />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <StatCard v-bind="statCards.orders" />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <StatCard v-bind="statCards.products" />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <StatCard v-bind="statCards.customers" />
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="q-pa-md">
      <div class="row q-col-gutter-md">
        <!-- Revenue Chart -->
        <div class="col-12 col-md-8">
          <q-card>
            <q-card-section>
              <RevenueChart />
            </q-card-section>
          </q-card>
        </div>

        <!-- Category Distribution -->
        <div class="col-12 col-md-4">
          <q-card>
            <q-card-section>
              <CategoryDistributionChart />
            </q-card-section>
          </q-card>
        </div>

        <!-- Top Products -->
        <div class="col-12">
          <q-card>
            <q-card-section>
              <TopProductsChart />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="dashboardStore.loading" class="flex flex-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
    </div>

    <!-- Error state -->
    <div v-if="dashboardStore.error" class="flex flex-center q-pa-xl">
      <div class="text-center">
        <q-icon name="error" size="3em" color="negative" class="q-mb-md" />
        <div class="text-h6">Có lỗi xảy ra</div>
        <div class="text-body2 q-mb-md">{{ dashboardStore.error }}</div>
        <q-btn color="primary" @click="loadData" label="Thử lại" />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useDashboardStore } from 'src/stores/dashboard'
import StatCard from 'src/components/StatCard.vue'
import RevenueChart from 'src/components/charts/RevenueChart.vue'
import CategoryDistributionChart from 'src/components/charts/CategoryDistributionChart.vue'
import TopProductsChart from 'src/components/charts/TopProductsChart.vue'

const dashboardStore = useDashboardStore()

onMounted(() => {
  loadData()
})

async function loadData() {
  await dashboardStore.fetchDashboardData()
}

// Computed properties cho các StatCard
const statCards = computed(() => {
  if (!dashboardStore.dashboardData) return null

  const { summary } = dashboardStore.dashboardData
  return {
    revenue: {
      title: 'Tổng doanh thu',
      value: dashboardStore.formatCurrency(summary.totalRevenue.value),
      trend: summary.totalRevenue.trend,
      icon: 'payments',
      iconClass: 'text-positive'
    },
    orders: {
      title: 'Số đơn hàng',
      value: dashboardStore.formatNumber(summary.totalOrders.value),
      trend: summary.totalOrders.trend,
      icon: 'shopping_cart',
      iconClass: 'text-primary'
    },
    products: {
      title: 'Sản phẩm đã bán',
      value: dashboardStore.formatNumber(summary.totalProducts.value),
      trend: summary.totalProducts.trend,
      icon: 'inventory_2',
      iconClass: 'text-secondary'
    },
    customers: {
      title: 'Khách hàng mới',
      value: dashboardStore.formatNumber(summary.newCustomers.value),
      trend: summary.newCustomers.trend,
      icon: 'people',
      iconClass: 'text-info'
    }
  }
})
</script>

<style scoped>
.bg-gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.category-card {
  min-width: 80px;
  transition: all 0.3s ease;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
