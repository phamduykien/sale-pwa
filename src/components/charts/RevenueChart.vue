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

const chartData = {
  labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
  datasets: [
    {
      label: 'Doanh thu (triệu VNĐ)',
      backgroundColor: 'rgba(102, 126, 234, 0.2)',
      borderColor: '#667eea',
      data: [40, 55, 45, 70, 65, 85],
      fill: true,
    }
  ]
}

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
