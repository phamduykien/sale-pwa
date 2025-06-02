<template>
  <q-page>
    <!-- Header section -->
    <div class="bg-gradient-primary text-white q-pa-md">
      <div class="text-h5 text-weight-bold q-mb-sm">Dashboard</div>
      <div class="text-body2">Tổng quan hoạt động kinh doanh</div>
    </div>

    <!-- Stats Cards -->
    <div class="q-pa-md">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-sm-6 col-md-3">
          <StatCard
            title="Tổng doanh thu"
            value="2.5 tỷ VNĐ"
            :trend="15"
            icon="payments"
            icon-class="text-positive"
          />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <StatCard
            title="Số đơn hàng"
            value="1,234"
            :trend="8"
            icon="shopping_cart"
            icon-class="text-primary"
          />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <StatCard
            title="Sản phẩm đã bán"
            value="5,678"
            :trend="-5"
            icon="inventory_2"
            icon-class="text-secondary"
          />
        </div>
        <div class="col-12 col-sm-6 col-md-3">
          <StatCard
            title="Khách hàng mới"
            value="256"
            :trend="12"
            icon="people"
            icon-class="text-info"
          />
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
    <div v-if="productStore.loading" class="flex flex-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
    </div>

    <!-- Error state -->
    <div v-if="productStore.error" class="flex flex-center q-pa-xl">
      <div class="text-center">
        <q-icon name="error" size="3em" color="negative" class="q-mb-md" />
        <div class="text-h6">Có lỗi xảy ra</div>
        <div class="text-body2 q-mb-md">{{ productStore.error }}</div>
        <q-btn color="primary" @click="loadData" label="Thử lại" />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useProductStore } from 'src/stores/product'
import StatCard from 'src/components/StatCard.vue'
import RevenueChart from 'src/components/charts/RevenueChart.vue'
import CategoryDistributionChart from 'src/components/charts/CategoryDistributionChart.vue'
import TopProductsChart from 'src/components/charts/TopProductsChart.vue'

const productStore = useProductStore()

onMounted(() => {
  loadData()
})

async function loadData() {
  await Promise.all([
    productStore.fetchProducts(),
    productStore.fetchCategories()
  ])
}
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
