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

const chartData = {
  labels: ['Điện thoại', 'Laptop', 'Tablet', 'Phụ kiện', 'Khác'],
  datasets: [
    {
      backgroundColor: [
        '#667eea',
        '#764ba2',
        '#6B8DD6',
        '#8E72BC',
        '#8B8CC7'
      ],
      data: [30, 25, 15, 20, 10]
    }
  ]
}

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
