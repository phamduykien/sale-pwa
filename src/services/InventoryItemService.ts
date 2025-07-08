import { api } from 'src/boot/axios'; // Import instance api đã cấu hình
import type { InventoryItem } from 'src/models/product/InventoryItem'; // Import interface

const SERVICE_PATH = 'api/dimob/InventoryItems'; // Path cụ thể cho service này (bỏ /g4 để interceptor tự thêm env)

export interface InventoryItemsPayload {
  skip?: number;
  take?: number;
  sort?: string;
  // Thêm các trường filter khác nếu API hỗ trợ
  [key: string]: any;
}

export class InventoryItemService {
  // Bỏ tham số token, interceptor sẽ xử lý
  // Thay đổi để nhận một object payload
  static async getInventoryItems(payload: InventoryItemsPayload): Promise<InventoryItem[]> {
    const { skip = 0, take = 50, sort = 'modified_date', ...otherFilters } = payload;
    try {
      // Sử dụng instance `api`
      const requestData = {
        skip,
        take,
        sort,
        ...otherFilters // Truyền các filter khác nếu có
      };
      const response = await api.post(`${SERVICE_PATH}/paging_filter`, requestData);
      // axios trả về dữ liệu trong response.data, và cấu trúc API của bạn có vẻ là response.data.Data
      // Nếu API này không trả về Total, useEntityManagement sẽ cần xử lý hasMore một cách khác
      // Giả sử API trả về một object có trường Data chứa mảng các items
      // Nếu API trả về trực tiếp mảng items, thì chỉ cần return response.data;
      return response.data.Data || response.data; // Ưu tiên response.data.Data, nếu không có thì lấy response.data
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu sản phẩm:', error);
      throw error;
    }
  }

  // Phương thức mới để lấy tổng số lượng items dựa trên filter
  static async getInventoryItemsCount(payload: InventoryItemsPayload): Promise<number> {
    const { skip, take, sort, ...otherFilters } = payload; // Bỏ qua skip, take, sort nếu API count không cần
    try {
      const requestData = {
        ...otherFilters // Chỉ gửi các filter liên quan đến việc đếm
      };
      // Giả sử endpoint là /count và trả về một object dạng { total: number } hoặc chỉ một số
      const response = await api.post(`${SERVICE_PATH}/paging_filter_summary`, requestData); 
      debugger
      return response.data.Total || 0; // Ưu tiên response.data.total
    } catch (error) {
      console.error('Lỗi khi lấy tổng số lượng sản phẩm:', error);
      throw error;
    }
  }

  // Bỏ tham số token
  static async getInventoryItem(id: string): Promise<InventoryItem | undefined> {
    try {
      // Sử dụng instance `api`
      const response = await api.get(`${SERVICE_PATH}/edit/${id}`);
      return response.data as InventoryItem; // Giả sử API trả về dữ liệu trực tiếp, ép kiểu nếu cần
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu sản phẩm:', error);
      throw error;
    }
  }

  // Bỏ tham số token
  static async updateInventoryItem(payload: Partial<InventoryItem> & { id?: string }): Promise<InventoryItem> { // payload nên chứa id nếu cần
    try {
      // Sử dụng instance `api`
      // Endpoint có thể cần id, ví dụ: `${SERVICE_PATH}/inventory-item/${payload.id}`
      // Hoặc id đã có trong payload và API tự xử lý
      const response = await api.put(`${SERVICE_PATH}/inventory-item`, payload);
      return response.data as InventoryItem;
    } catch (error) {
      console.error('Lỗi khi lưu dữ liệu sản phẩm:', error);
      throw error;
    }
  }

  // Thêm hàm delete nếu có (ví dụ từ useCrud.js)
  static async deleteInventoryItem(id: string): Promise<any> { // Kiểu trả về có thể là void hoặc một object xác nhận
    try {
      const response = await api.delete(`${SERVICE_PATH}/inventory-item/${id}`); // Giả sử endpoint là vậy
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi xóa sản phẩm (ID: ${id}):`, error);
      throw error;
    }
  }
}
