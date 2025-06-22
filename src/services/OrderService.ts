import { api } from 'src/boot/axios';
import type { OrderListPayload } from 'src/models/order/dto/OrderListPayload';
import type { OrderListResponse } from 'src/models/order/dto/OrderListResponse';
// Order và OrderDetailItem được sử dụng trong OrderListResponse, nên không cần import trực tiếp ở đây
// nếu OrderListResponse đã import chúng đúng cách.

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

  static async getOrdersCount(payload: OrderListPayload): Promise<number> {
    // Bỏ qua skip, take cho count, chỉ giữ lại các filter. OrderListPayload không có sort.
    const { skip, take, ...filterPayload } = payload;
    try {
      const specificHeaders = {
        'x-ms-bid': '87e2d19c-89f7-11ef-88d3-005056b34af7',
        'Accept': 'application/json',
        'DeviceOS': 'ios',
        'app-version': '6.1.3',
        'app-version-code': '202506041',
      };
      // Giả sử endpoint count là /list/count và nhận cùng payload filter
      const response = await api.post(
        `${ORDER_API_PATH}/list/count`, // Endpoint mới cho count
        filterPayload, // Chỉ gửi các filter
        {
          headers: specificHeaders,
        }
      );
      // Giả sử API trả về một object có trường 'total' hoặc trực tiếp là một số
      return response.data.total || response.data || 0;
    } catch (error) {
      console.error('Lỗi khi lấy tổng số lượng đơn hàng:', error);
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
