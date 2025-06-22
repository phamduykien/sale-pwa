// Dựa trên cách sử dụng trong InventoryItemService và IndexedDBService
// Đây là một định nghĩa cơ bản, bạn có thể cần bổ sung các trường khác từ API thực tế

export interface InventoryItem {
  inventory_item_id: string; // KeyPath trong IndexedDB
  inventory_item_name?: string;
  sku_code?: string;
  unit_price?: number;
  unit_price_after_tax?: number; // Giả sử có trường này
  unit_name?: string;
  file_name?: string; // Cho hình ảnh
  instock?: number; // Tồn kho
  // Thêm các thuộc tính khác mà API trả về cho một sản phẩm/hàng hóa
  // Ví dụ:
  // description?: string;
  // category_id?: string;
  // brand_id?: string;
  // featured?: boolean;
  // rating?: number;
  // ... các trường khác từ API của bạn
  [key: string]: any; // Cho phép các thuộc tính khác không được định nghĩa rõ ràng
}
