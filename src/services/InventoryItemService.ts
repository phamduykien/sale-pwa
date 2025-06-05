import axios from 'axios';

const API_URL = '/g4/api/dimob/InventoryItems';

export class InventoryItemService {
  static async getInventoryItems(token: string, skip: number = 0, take: number = 50, sort: string = 'modified_date') {
    try {
      const response = await axios.post(API_URL + '/paging_filter',
        {
          skip,
          take,
          sort,
        }, {
        headers: {
          Authorization: token,
        },
      }
      );
      return response.data.Data;
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu sản phẩm:', error);
      throw error;
    }
  }
}
