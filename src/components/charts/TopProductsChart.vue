<template>
  <div class="chart-container">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
)

import { computed } from 'vue'
import { useDashboardStore } from 'src/stores/dashboard'

const dashboardStore = useDashboardStore()

const chartData = computed(() => {
  if (!dashboardStore.dashboardData?.topProducts) {
    return {
      labels: [],
      datasets: []
    }
  }

  return {
    labels: dashboardStore.dashboardData.topProducts.map(item => item.name),
    datasets: [
      {
        label: 'Số lượng đã bán',
        backgroundColor: '#667eea',
        data: dashboardStore.dashboardData.topProducts.map(item => item.soldQuantity)
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    title: {
      display: true,
      text: 'Top 5 Sản Phẩm Bán Chạy'
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
}
</script>

<style scoped>
.chart-container {
  height: 300px;
}
</style>
