// Định nghĩa kiểu dữ liệu cho một chi tiết đơn hàng (trong mảng Details)
export interface OrderDetailItem {
  order_id: string;
  quantity: number;
  ecom_quantity: number;
  product_name: string;
  price: number;
  image: string;
  type_stock: number;
  created_date: string;
}

// Định nghĩa kiểu dữ liệu cho một đơn hàng
export interface Order {
  order_id: string;
  seller_id: string;
  order_no: string;
  order_date: string; // ISO 8601 date string
  delivery_code: string;
  channel_id: number;
  partner_object_id: string;
  total_amount: number;
  shipping_partner_name: string;
  stock_id: string;
  order_status: number; // Cần map sang text (ví dụ: 80 -> Đã hoàn thành, 90 -> Đã hủy)
  total_quantity: number;
  total_item_quantity: number;
  number_print: number;
  recipient_tel: string;
  recipient_name: string;
  customer_name: string;
  customer_tel: string;
  priority: number;
  create_time: string; // ISO 8601 date string
  Details: OrderDetailItem[];
  shipping_partner_type: number;
  publish_status: number;
  send_tax_status: number;
}
