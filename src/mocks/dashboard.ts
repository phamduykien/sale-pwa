import type { DashboardData } from 'src/models/dashboard/DashboardData'; // Cập nhật đường dẫn import

export const mockDashboardData: DashboardData = {
  summary: {
    totalRevenue: {
      value: 2500000000, // 2.5 tỷ VNĐ
      trend: 15
    },
    totalOrders: {
      value: 1234,
      trend: 8
    },
    totalProducts: {
      value: 5678,
      trend: -5
    },
    newCustomers: {
      value: 256,
      trend: 12
    }
  },
  revenueByMonth: [
    { month: 'T1', revenue: 40000000 },
    { month: 'T2', revenue: 55000000 },
    { month: 'T3', revenue: 45000000 },
    { month: 'T4', revenue: 70000000 },
    { month: 'T5', revenue: 65000000 },
    { month: 'T6', revenue: 85000000 }
  ],
  categoryDistribution: [
    { name: 'Điện thoại', value: 30 },
    { name: 'Laptop', value: 25 },
    { name: 'Tablet', value: 15 },
    { name: 'Phụ kiện', value: 20 },
    { name: 'Khác', value: 10 }
  ],
  topProducts: [
    { name: 'iPhone 14', soldQuantity: 150 },
    { name: 'Samsung S23', soldQuantity: 120 },
    { name: 'MacBook Pro', soldQuantity: 100 },
    { name: 'iPad Air', soldQuantity: 80 },
    { name: 'AirPods Pro', soldQuantity: 60 }
  ]
}
