// Định nghĩa kiểu dữ liệu cho payload của API lấy danh sách đơn hàng
export interface OrderListPayload {
  skip?: number;
  take?: number;
  seller_id?: number;
  from_date?: string;
  to_date?: string;
  ListOrderStatus?: number[];
  priority?: number;
  channel?: number;
  key_search?: string;
  stock_id?: string;
  PublishInvoiceStatus?: number;
  SendTaxStatus?: number;
}
