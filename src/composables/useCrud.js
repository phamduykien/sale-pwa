import { ref } from 'vue';
// import { useQuasar } from 'quasar'; // Không cần dùng $q.notify nữa
import { showNotification } from 'src/boot/notify-service';

export function useCrud(apiService, entityName = 'mục') {
  // const $q = useQuasar(); // Không cần dùng $q.notify nữa

  const items = ref([]);
  const currentItem = ref(null);
  const loading = ref(false);
  const loadingItem = ref(false); // Loading cho các thao tác trên một item cụ thể
  const error = ref(null);

  const fetchAll = async (params = {}) => {
    loading.value = true;
    error.value = null;
    try {
      // Giả sử apiService có phương thức getItems(token, skip, take, sort)
      // Hoặc một phương thức chung hơn như getAll(params)
      // Hiện tại, InventoryItemService.getInventoryItems có token, skip, take, sort
      // Token sẽ được tự động thêm bởi interceptor trong axios.js
      // if (!token && apiService.requiresToken !== false) { // Giả sử service có thể có cờ requiresToken
      //   throw new Error('Token xác thực không tìm thấy.');
      // }
      // Điều chỉnh cách gọi dựa trên phương thức thực tế của apiService
      // Ví dụ: nếu apiService.getInventoryItems là phương thức
      // Bỏ tham số token khi gọi apiService, vì interceptor sẽ xử lý
      const result = await apiService.getInventoryItems(params.skip || 0, params.take || 50, params.sort);
      items.value = result; 
    } catch (e) {
      error.value = e.message;
      showNotification('error', `Lỗi khi tải danh sách ${entityName}: ${e.message}`);
      items.value = []; // Đảm bảo items là mảng rỗng khi có lỗi
    } finally {
      loading.value = false;
    }
  };

  const fetchById = async (id) => {
    loadingItem.value = true;
    error.value = null;
    currentItem.value = null;
    try {
      // Token sẽ được tự động thêm bởi interceptor trong axios.js
      // if (!token && apiService.requiresToken !== false) {
      //   throw new Error('Token xác thực không tìm thấy.');
      // }
      // Giả sử apiService có phương thức getItemById(token, id) hoặc getInventoryItem(token, id)
      // Bỏ tham số token khi gọi apiService
      const result = await apiService.getInventoryItem(id); // Sử dụng getInventoryItem từ InventoryItemService
      currentItem.value = result;
      return result;
    } catch (e) {
      error.value = e.message;
      showNotification('error', `Lỗi khi tải chi tiết ${entityName} (ID: ${id}): ${e.message}`);
    } finally {
      loadingItem.value = false;
    }
  };

  const create = async (data) => {
    loadingItem.value = true;
    error.value = null;
    try {
      // Token sẽ được tự động thêm bởi interceptor trong axios.js
      // if (!token && apiService.requiresToken !== false) {
      //   throw new Error('Token xác thực không tìm thấy.');
      // }
      // Giả sử apiService có phương thức createItem(token, data) hoặc createInventoryItem(token, data)
      // Bỏ tham số token khi gọi apiService
      const newItem = await apiService.createInventoryItem(data); // Sử dụng createInventoryItem
      showNotification('success', `Thêm ${entityName} thành công!`);
      // Tùy chọn: làm mới danh sách hoặc thêm item mới vào items.value
      // await fetchAll(); // Hoặc items.value.unshift(newItem);
      return newItem;
    } catch (e) {
      error.value = e.message;
      showNotification('error', `Lỗi khi thêm ${entityName}: ${e.message}`);
      throw e; // Ném lỗi để component cha có thể xử lý nếu cần
    } finally {
      loadingItem.value = false;
    }
  };

  const update = async (id, data) => { // id thường là một phần của data hoặc được truyền riêng
    loadingItem.value = true;
    error.value = null;
    try {
      // Token sẽ được tự động thêm bởi interceptor trong axios.js
      // if (!token && apiService.requiresToken !== false) {
      //   throw new Error('Token xác thực không tìm thấy.');
      // }
      // Đảm bảo payload cho updateInventoryItem có chứa ID nếu API yêu cầu
      // Hoặc API endpoint đã chứa ID: /api/items/{id}
      // InventoryItemService.updateInventoryItem(token, payload) - payload nên là object hoàn chỉnh
      const payload = { ...data, id: id }; // Giả sử API cần id trong payload
      // Bỏ tham số token khi gọi apiService
      const updatedItem = await apiService.updateInventoryItem(payload);
      showNotification('success', `Cập nhật ${entityName} thành công!`);
      
      // Cập nhật item trong danh sách items.value
      const index = items.value.findIndex(item => String(item.inventory_item_id) === String(id)); // Giả sử ID là inventory_item_id
      if (index !== -1) {
        items.value[index] = { ...items.value[index], ...updatedItem };
      }
      if (currentItem.value && String(currentItem.value.inventory_item_id) === String(id)) {
        currentItem.value = { ...currentItem.value, ...updatedItem };
      }
      return updatedItem;
    } catch (e) {
      error.value = e.message;
      showNotification('error', `Lỗi khi cập nhật ${entityName}: ${e.message}`);
      throw e;
    } finally {
      loadingItem.value = false;
    }
  };

  const remove = async (id) => {
    loadingItem.value = true;
    error.value = null;
    try {
      // Token sẽ được tự động thêm bởi interceptor trong axios.js
      // if (!token && apiService.requiresToken !== false) {
      //   throw new Error('Token xác thực không tìm thấy.');
      // }
      // Giả sử apiService có phương thức deleteItem(token, id) hoặc deleteInventoryItem(token, id)
      // Bỏ tham số token khi gọi apiService
      await apiService.deleteInventoryItem(id); // Giả sử có hàm này
      showNotification('success', `Xóa ${entityName} thành công!`);
      
      // Xóa item khỏi danh sách items.value
      items.value = items.value.filter(item => String(item.inventory_item_id) !== String(id));
      if (currentItem.value && String(currentItem.value.inventory_item_id) === String(id)) {
        currentItem.value = null;
      }
    } catch (e) {
      error.value = e.message;
      showNotification('error', `Lỗi khi xóa ${entityName}: ${e.message}`);
      throw e;
    } finally {
      loadingItem.value = false;
    }
  };

  return {
    items,
    currentItem,
    loading,
    loadingItem,
    error,
    fetchAll,
    fetchById,
    create,
    update,
    remove,
  };
}
