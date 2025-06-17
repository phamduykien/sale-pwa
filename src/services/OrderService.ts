import { api } from 'src/boot/axios';

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

// Định nghĩa kiểu dữ liệu cho phản hồi từ API
export interface OrderListResponse {
  Total: number;
  SummaryData?: any; // Kiểu dữ liệu cụ thể nếu cần
  Data: Order[];
  Empty?: boolean;
}

const ORDER_API_PATH = '/g4/api/bizmob/EcomOrderMobs'; // Path API cho đơn hàng

export class OrderService {
  static async getOrderList(payload: OrderListPayload): Promise<OrderListResponse> {
    try {
      // Các header đặc thù cho API này
      const specificHeaders = {
        'x-ms-bid': '87e2d19c-89f7-11ef-88d3-005056b34af7', // Giá trị từ ví dụ curl, có thể cần động
        'Accept': 'application/json',
        'DeviceOS': 'ios', // Có thể cần động dựa trên thiết bị
        'app-version': '6.1.3',
        'app-version-code': '202506041',
        // 'access-token': 'Bearer YOUR_OTHER_ACCESS_TOKEN' // Tạm thời bỏ qua, sẽ hỏi lại
      };

      const response = await api.post( // Bỏ <OrderListResponse>
        `${ORDER_API_PATH}/list`,
        payload,
        {
          headers: specificHeaders,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đơn hàng:', error);
      // Ném lỗi để phía UI hoặc store có thể xử lý
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data?.message || error.message);
      }
      throw error;
    }
  }

  // TODO: Thêm các phương thức khác cho OrderService nếu cần (getOrderDetail, createOrder, updateOrder, etc.)
}

// Helper để import axios nếu cần kiểm tra lỗi axios (đã import ở trên)
import axios from 'axios';
