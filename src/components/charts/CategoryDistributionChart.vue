<template>
  <div class="chart-container">
    <Pie :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale
} from 'chart.js'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale
)

import { computed } from 'vue'
import { useDashboardStore } from 'src/stores/dashboard'

const dashboardStore = useDashboardStore()

const chartData = computed(() => {
  if (!dashboardStore.dashboardData?.categoryDistribution) {
    return {
      labels: [],
      datasets: []
    }
  }

  return {
    labels: dashboardStore.dashboardData.categoryDistribution.map(item => item.name),
    datasets: [
      {
        backgroundColor: [
          '#667eea',
          '#764ba2',
          '#6B8DD6',
          '#8E72BC',
          '#8B8CC7'
        ],
        data: dashboardStore.dashboardData.categoryDistribution.map(item => item.value)
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
    },
    title: {
      display: true,
      text: 'Phân Bố Sản Phẩm Theo Danh Mục'
    }
  }
}
</script>

<style scoped>
.chart-container {
  height: 300px;
}
</style>
