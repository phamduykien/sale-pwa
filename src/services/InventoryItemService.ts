import { api } from 'src/boot/axios'; // Import instance api đã cấu hình

const SERVICE_PATH = '/g4/api/dimob/InventoryItems'; // Path cụ thể cho service này

export class InventoryItemService {
  // Bỏ tham số token, interceptor sẽ xử lý
  static async getInventoryItems(skip: number = 0, take: number = 50, sort: string = 'modified_date') {
    try {
      // Sử dụng instance `api`
      const response = await api.post(`${SERVICE_PATH}/paging_filter`, {
        skip,
        take,
        sort,
      });
      // axios trả về dữ liệu trong response.data, và cấu trúc API của bạn có vẻ là response.data.Data
      return response.data.Data;
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu sản phẩm:', error);
      throw error;
    }
  }

  // Bỏ tham số token
  static async getInventoryItem(id: string) {
    try {
      // Sử dụng instance `api`
      const response = await api.get(`${SERVICE_PATH}/edit/${id}`);
      return response.data; // Giả sử API trả về dữ liệu trực tiếp
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu sản phẩm:', error);
      throw error;
    }
  }

  // Bỏ tham số token
  static async updateInventoryItem(payload: object) { // payload nên chứa id nếu cần
    try {
      // Sử dụng instance `api`
      // Endpoint có thể cần id, ví dụ: `${SERVICE_PATH}/inventory-item/${payload.id}`
      // Hoặc id đã có trong payload và API tự xử lý
      const response = await api.put(`${SERVICE_PATH}/inventory-item`, payload);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lưu dữ liệu sản phẩm:', error);
      throw error;
    }
  }

  // Thêm hàm delete nếu có (ví dụ từ useCrud.js)
  static async deleteInventoryItem(id: string) {
    try {
      const response = await api.delete(`${SERVICE_PATH}/inventory-item/${id}`); // Giả sử endpoint là vậy
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi xóa sản phẩm (ID: ${id}):`, error);
      throw error;
    }
  }
}
