import { ref, computed, reactive } from 'vue';
import { showNotification } from 'src/boot/notify-service';

/**
 * @typedef {'view' | 'add' | 'edit' | 'duplicate'} FormMode
 */

/**
 * Composable để quản lý các thao tác CRUD, phân trang, filter cho một entity.
 * @param {object} apiService - Service object có các phương thức:
 *   - getItems(payload): Trả về Promise<{ Data: Array<any>, Total: number }> (hoặc cấu trúc tương tự)
 *   - getItemById(id): Trả về Promise<any>
 *   - createItem(data): Trả về Promise<any>
 *   - updateItem(id, data): Trả về Promise<any> (hoặc updateItem(payload) nếu id nằm trong payload)
 *   - deleteItem(id): Trả về Promise<any>
 * @param {string} entityName - Tên của entity (ví dụ: 'Đơn hàng', 'Sản phẩm') để hiển thị thông báo.
 * @param {object} defaultFilters - Các giá trị filter mặc định.
 * @param {number} defaultTake - Số lượng item mặc định mỗi lần tải.
 */
export function useEntityManagement(apiService, entityName = 'mục', defaultFilters = {}, defaultTake = 15) {
  // State cho danh sách
  const items = ref([]);
  const totalItems = ref(0);
  const loadingList = ref(false);
  const errorList = ref(null);
  const pagination = reactive({
    skip: 0,
    take: defaultTake,
    // sort: 'created_date desc', // Có thể thêm sort mặc định nếu cần
  });
  const filters = reactive({ ...defaultFilters });

  // State cho chi tiết/form
  const currentItem = ref(null);
  const loadingDetail = ref(false);
  const errorDetail = ref(null);
  const formMode = ref('view'); // 'view', 'add', 'edit', 'duplicate'

  // Computed properties
  const hasMore = computed(() => items.value.length < totalItems.value);
  const isReadonly = computed(() => formMode.value === 'view');

  // --- Methods cho Danh sách ---
  const fetchList = async (isLoadMore = false) => {
    if (loadingList.value && !isLoadMore) return;

    loadingList.value = true;
    errorList.value = null;

    if (!isLoadMore) {
      items.value = [];
      pagination.skip = 0;
      totalItems.value = 0;
    }

    const payload = {
      ...filters,
      skip: pagination.skip,
      take: pagination.take,
      // sort: pagination.sort, // Nếu có sort
    };

    try {
      // Giả định apiService.getItems trả về cấu trúc { Data: [], Total: number }
      // Hoặc apiService.get[EntityName]s (ví dụ: getOrders, getInventoryItems)
      // Cần đảm bảo apiService có phương thức phù hợp.
      // Ví dụ: OrderService.getOrderList(payload) hoặc InventoryItemService.getInventoryItems(payload.skip, payload.take, payload.sort)
      // Chúng ta cần chuẩn hóa cách gọi service ở đây.
      // Tạm thời giả định service có phương thức `getItems` nhận một object payload.
      // Và một phương thức `getItemsCount` để lấy tổng số.
      
      if (isLoadMore) {
        // Chỉ fetch thêm items
        let fetchedItems = [];
        if (entityName === 'Đơn hàng' && typeof apiService.getOrderList === 'function') {
          const orderResponse = await apiService.getOrderList(payload);
          fetchedItems = orderResponse.Data || [];
          // totalItems đã được set từ lần fetch đầu
        } else if (entityName === 'Hàng hóa' && typeof apiService.getInventoryItems === 'function') {
          fetchedItems = await apiService.getInventoryItems(payload);
          // totalItems đã được set từ lần fetch đầu (hoặc ước lượng)
        } else if (typeof apiService.getItems === 'function') {
           const genericResponse = await apiService.getItems(payload);
           fetchedItems = genericResponse.Data || genericResponse || []; // Xử lý cả hai trường hợp
        } else {
           throw new Error(`Phương thức lấy danh sách không được định nghĩa cho ${entityName}`);
        }
        items.value = [...items.value, ...fetchedItems];

      } else {
        // Fetch lần đầu hoặc refresh: lấy cả items và total count
        let fetchedItems = [];
        let count = 0;

        // const promises = []; // Loại bỏ biến promises không cần thiết ở đây nữa
        
        if (entityName === 'Đơn hàng' && typeof apiService.getOrderList === 'function') {
          // Đơn hàng: API getOrderList đã trả về Total
          const orderResponse = await apiService.getOrderList(payload);
          fetchedItems = orderResponse.Data || [];
          count = orderResponse.Total || 0;
        } else if (entityName === 'Hàng hóa' && typeof apiService.getInventoryItems === 'function' && typeof apiService.getInventoryItemsCount === 'function') {
          // Hàng hóa: Gọi 2 API song song
          const [itemsResult, countResult] = await Promise.all([
            apiService.getInventoryItems(payload),
            apiService.getInventoryItemsCount(payload)
          ]);
          fetchedItems = itemsResult || [];
          count = countResult || 0;
        } else if (typeof apiService.getItems === 'function') {
          // Trường hợp chung: cố gắng lấy Total từ response của getItems, nếu không có thì gọi getItemsCount
          const responseItems = await apiService.getItems(payload);
          fetchedItems = responseItems.Data || responseItems || [];
          if (typeof responseItems.Total === 'number') {
            count = responseItems.Total;
          } else if (typeof apiService.getItemsCount === 'function') {
            count = await apiService.getItemsCount(payload).then(res => res.total || res || 0);
          } else {
            // Ước lượng nếu không có cách lấy total
            count = fetchedItems.length < pagination.take ? fetchedItems.length : fetchedItems.length + 1;
          }
        } else {
          throw new Error(`Phương thức lấy danh sách không được định nghĩa hoặc không đủ cho ${entityName}`);
        }
        
        items.value = fetchedItems;
        totalItems.value = count;
      }
      pagination.skip = items.value.length;
    } catch (err) {
      errorList.value = err.message || `Lỗi không xác định khi tải danh sách ${entityName}.`;
      showNotification('error', `Không thể tải danh sách ${entityName}: ${errorList.value}`);
    } finally {
      loadingList.value = false;
    }
  };

  const loadMore = async () => {
    if (loadingList.value || !hasMore.value) return;
    await fetchList(true);
  };

  const refreshList = async () => {
    await fetchList(false);
  };

  const updateFilters = (newFilters) => {
    Object.assign(filters, newFilters);
    pagination.skip = 0; // Reset skip khi filter thay đổi
    refreshList();
  };

  // --- Methods cho Chi tiết/Form ---
  const fetchItemById = async (id) => {
    loadingDetail.value = true;
    errorDetail.value = null;
    currentItem.value = null;
    try {
      // Giả định service có getItemById hoặc get[EntityName]
      let result;
      if (typeof apiService.getItemById === 'function') {
        result = await apiService.getItemById(id);
      } else if (typeof apiService.getInventoryItem === 'function' && entityName === 'Hàng hóa') {
        result = await apiService.getInventoryItem(id);
      } else if (typeof apiService.getOrder === 'function' && entityName === 'Đơn hàng') { // Giả sử có hàm này
        result = await apiService.getOrder(id);
      }
       else {
        throw new Error(`Phương thức lấy chi tiết không được định nghĩa cho ${entityName} trong apiService`);
      }
      currentItem.value = result;
      formMode.value = 'view';
      return result;
    } catch (err) {
      errorDetail.value = err.message || `Lỗi khi tải chi tiết ${entityName}.`;
      showNotification('error', `Không thể tải chi tiết ${entityName}: ${errorDetail.value}`);
    } finally {
      loadingDetail.value = false;
    }
  };

  const setItemForCreate = (initialData = {}) => {
    currentItem.value = { ...initialData }; // Có thể truyền giá trị mặc định
    formMode.value = 'add';
    errorDetail.value = null;
  };

  const setItemForEdit = (item) => {
    currentItem.value = JSON.parse(JSON.stringify(item)); // Tạo bản sao để tránh sửa trực tiếp
    formMode.value = 'edit';
    errorDetail.value = null;
  };

  const setItemForDuplicate = (item) => {
    const duplicatedItem = JSON.parse(JSON.stringify(item));
    // Xóa ID hoặc các trường không nên được nhân bản
    if (duplicatedItem.id) delete duplicatedItem.id;
    if (duplicatedItem.inventory_item_id) delete duplicatedItem.inventory_item_id;
    if (duplicatedItem.order_id) delete duplicatedItem.order_id;
    // TODO: Xóa thêm các trường khác nếu cần (ví dụ: order_no, created_date)
    currentItem.value = duplicatedItem;
    formMode.value = 'add'; // Hoặc 'duplicate' nếu muốn xử lý riêng
    errorDetail.value = null;
  };
  
  const setViewMode = () => {
    formMode.value = 'view';
  }

  const saveItem = async () => {
    if (!currentItem.value) {
      showNotification('error', 'Không có dữ liệu để lưu.');
      return null;
    }
    loadingDetail.value = true;
    errorDetail.value = null;
    try {
      let savedItem;
      const dataToSave = currentItem.value;

      if (formMode.value === 'add') {
        // Giả định service có createItem hoặc create[EntityName]
        if (typeof apiService.createItem === 'function') {
          savedItem = await apiService.createItem(dataToSave);
        } else if (typeof apiService.createInventoryItem === 'function' && entityName === 'Hàng hóa') {
          savedItem = await apiService.createInventoryItem(dataToSave);
        } else if (typeof apiService.createOrder === 'function' && entityName === 'Đơn hàng') { // Giả sử
          savedItem = await apiService.createOrder(dataToSave);
        }
         else {
          throw new Error(`Phương thức tạo mới không được định nghĩa cho ${entityName}`);
        }
        showNotification('success', `Thêm ${entityName} thành công!`);
      } else if (formMode.value === 'edit') {
        // Giả định service có updateItem(id, data) hoặc update[EntityName](payload)
        const id = dataToSave.id || dataToSave.inventory_item_id || dataToSave.order_id;
        if (!id) throw new Error(`Không tìm thấy ID để cập nhật ${entityName}.`);
        
        if (typeof apiService.updateItem === 'function') {
          savedItem = await apiService.updateItem(id, dataToSave);
        } else if (typeof apiService.updateInventoryItem === 'function' && entityName === 'Hàng hóa') {
          savedItem = await apiService.updateInventoryItem(dataToSave); // updateInventoryItem nhận payload
        } else if (typeof apiService.updateOrder === 'function' && entityName === 'Đơn hàng') { // Giả sử
          savedItem = await apiService.updateOrder(dataToSave);
        }
         else {
          throw new Error(`Phương thức cập nhật không được định nghĩa cho ${entityName}`);
        }
        showNotification('success', `Cập nhật ${entityName} thành công!`);
      } else {
        throw new Error(`Chế độ form không hợp lệ: ${formMode.value}`);
      }
      await refreshList(); // Tải lại danh sách sau khi lưu
      formMode.value = 'view'; // Chuyển về chế độ xem sau khi lưu
      currentItem.value = savedItem; // Cập nhật currentItem với dữ liệu từ server (có thể có ID mới)
      return savedItem;
    } catch (err) {
      errorDetail.value = err.message || `Lỗi khi lưu ${entityName}.`;
      showNotification('error', `Không thể lưu ${entityName}: ${errorDetail.value}`);
      throw err; // Ném lỗi để component cha xử lý nếu cần
    } finally {
      loadingDetail.value = false;
    }
  };

  const deleteItem = async (id) => {
    loadingDetail.value = true; // Hoặc dùng loadingList nếu ảnh hưởng đến cả list
    errorDetail.value = null;
    try {
      // Giả định service có deleteItem hoặc delete[EntityName]
      if (typeof apiService.deleteItem === 'function') {
        await apiService.deleteItem(id);
      } else if (typeof apiService.deleteInventoryItem === 'function' && entityName === 'Hàng hóa') {
        await apiService.deleteInventoryItem(id);
      } else if (typeof apiService.deleteOrder === 'function' && entityName === 'Đơn hàng') { // Giả sử
        await apiService.deleteOrder(id);
      }
       else {
        throw new Error(`Phương thức xóa không được định nghĩa cho ${entityName}`);
      }
      showNotification('success', `Xóa ${entityName} thành công!`);
      await refreshList(); // Tải lại danh sách
      if (currentItem.value && (currentItem.value.id === id || currentItem.value.inventory_item_id === id || currentItem.value.order_id === id)) {
        currentItem.value = null;
        formMode.value = 'view';
      }
    } catch (err) {
      errorDetail.value = err.message || `Lỗi khi xóa ${entityName}.`;
      showNotification('error', `Không thể xóa ${entityName}: ${errorDetail.value}`);
      throw err;
    } finally {
      loadingDetail.value = false;
    }
  };

  return {
    // List state and methods
    items,
    totalItems,
    loadingList,
    errorList,
    pagination,
    filters,
    hasMore,
    fetchList,
    loadMore,
    refreshList,
    updateFilters,

    // Detail/Form state and methods
    currentItem,
    loadingDetail,
    errorDetail,
    formMode,
    isReadonly,
    fetchItemById,
    setItemForCreate,
    setItemForEdit,
    setItemForDuplicate,
    setViewMode,
    saveItem,
    deleteItem,
  };
}
