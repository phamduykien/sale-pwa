import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DashboardData } from '../types/statistics'
import { ApiService } from '../services/api'

export const useDashboardStore = defineStore('dashboard', () => {
  const loading = ref(false)
  const error = ref('')
  const dashboardData = ref<DashboardData | null>(null)

  async function fetchDashboardData() {
    loading.value = true
    error.value = ''
    
    try {
      dashboardData.value = await ApiService.getDashboardData()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu'
      console.error('Error fetching dashboard data:', err)
    } finally {
      loading.value = false
    }
  }

  function formatCurrency(value: number): string {
    return ApiService.formatCurrency(value)
  }

  function formatNumber(value: number): string {
    return ApiService.formatNumber(value)
  }

  return {
    loading,
    error,
    dashboardData,
    fetchDashboardData,
    formatCurrency,
    formatNumber
  }
})
