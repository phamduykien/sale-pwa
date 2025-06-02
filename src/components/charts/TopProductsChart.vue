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

const chartData = {
  labels: ['iPhone 14', 'Samsung S23', 'MacBook Pro', 'iPad Air', 'AirPods Pro'],
  datasets: [
    {
      label: 'Số lượng đã bán',
      backgroundColor: '#667eea',
      data: [150, 120, 100, 80, 60]
    }
  ]
}

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
