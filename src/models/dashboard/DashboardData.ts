interface SummaryValue {
  value: number;
  trend?: number; // trend là tùy chọn
}

export interface TopProduct {
  // id?: string; // API thực tế có thể có hoặc không có id, mock hiện tại không có
  name: string;
  soldQuantity: number; // Giữ soldQuantity như trong mock, hoặc đổi thành sales nếu API trả về sales
  // sales?: number; 
}

export interface RevenueByMonth {
  month: string;
  revenue: number;
}

export interface CategoryDistribution {
  name: string;
  value: number; // Phần trăm hoặc số lượng
}

export interface DashboardData {
  summary: {
    totalRevenue: SummaryValue;
    totalOrders: SummaryValue;
    totalProducts?: SummaryValue; // Thêm totalProducts nếu cần
    newCustomers: SummaryValue;
  };
  revenueByMonth: RevenueByMonth[];
  categoryDistribution: CategoryDistribution[];
  topProducts: TopProduct[];
  // Cho phép các thuộc tính khác nếu API có thể trả về thêm
  [key: string]: any; 
}
