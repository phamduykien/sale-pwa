import type { Order } from '../Order'; // Import Order từ vị trí mới

// Định nghĩa kiểu dữ liệu cho phản hồi từ API
export interface OrderListResponse {
  Total: number;
  SummaryData?: any; // Kiểu dữ liệu cụ thể nếu cần
  Data: Order[];
  Empty?: boolean;
}
