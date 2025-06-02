<template>
  <div class="chart-container">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { Line } from 'vue-chartjs'
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

import { computed } from 'vue'
import { useDashboardStore } from 'src/stores/dashboard'

const dashboardStore = useDashboardStore()

const chartData = computed(() => {
  if (!dashboardStore.dashboardData?.revenueByMonth) {
    return {
      labels: [],
      datasets: []
    }
  }

  return {
    labels: dashboardStore.dashboardData.revenueByMonth.map(item => item.month),
    datasets: [
      {
        label: 'Doanh thu (triệu VNĐ)',
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        borderColor: '#667eea',
        data: dashboardStore.dashboardData.revenueByMonth.map(item => item.revenue / 1000000), // Chuyển sang đơn vị triệu
        fill: true,
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
    },
    title: {
      display: true,
      text: 'Doanh Thu Theo Tháng'
    }
  }
}
</script>

<style scoped>
.chart-container {
  height: 300px;
}
</style>
