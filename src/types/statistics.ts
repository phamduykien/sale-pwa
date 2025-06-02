export interface StatisticSummary {
  totalRevenue: {
    value: number;
    trend: number;
  };
  totalOrders: {
    value: number;
    trend: number;
  };
  totalProducts: {
    value: number;
    trend: number;
  };
  newCustomers: {
    value: number;
    trend: number;
  };
}

export interface RevenueData {
  month: string;
  revenue: number;
}

export interface CategoryDistribution {
  name: string;
  value: number;
}

export interface TopProduct {
  name: string;
  soldQuantity: number;
}

export interface DashboardData {
  summary: StatisticSummary;
  revenueByMonth: RevenueData[];
  categoryDistribution: CategoryDistribution[];
  topProducts: TopProduct[];
}
