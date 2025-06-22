import { defineStore } from 'pinia';
import { InventoryItemService } from 'src/services/InventoryItemService';
import { useEntityManagement } from 'src/composables/useEntityManagement';
import { computed } from 'vue';
import { indexedDBService } from '../services/IndexedDBService'; // Cần cho offline
import { useNetwork } from '../composables/useNetwork';       // Cần cho offline
import { Notify } from 'quasar'; // Notify vẫn có thể cần cho các thông báo đặc thù của store

export const useProductStore = defineStore('product', () => {
  // TODO: Xác định defaultFilters cho Product nếu có
  const defaultProductFilters = {
    // Ví dụ: category_id: null, stock_status: 'in_stock'
  };

  // Lưu ý: InventoryItemService.getInventoryItems không trả về Total,
  // nên hasMore trong useEntityManagement sẽ được ước lượng.
  const entityManagement = useEntityManagement(InventoryItemService, 'Hàng hóa', defaultProductFilters, 20); // Tăng take lên 20 cho product

  // State (reactive refs and computed)
  const products = computed(() => entityManagement.items.value);
  const totalProducts = computed(() => entityManagement.totalItems.value); // Sẽ được ước lượng
  const loading = computed(() => entityManagement.loadingList.value);
  const error = computed(() => entityManagement.errorList.value);
  const filterPayload = entityManagement.filters;
  const pagination = entityManagement.pagination;
  const hasMoreProducts = computed(() => entityManagement.hasMore.value);
  
  const currentProduct = computed(() => entityManagement.currentItem.value);
  const loadingDetail = computed(() => entityManagement.loadingDetail.value);
  const formMode = computed(() => entityManagement.formMode.value);
  const isReadonly = computed(() => entityManagement.isReadonly.value);

  // Actions (methods from composable)
  // Cần điều chỉnh fetchProducts để xử lý logic offline/online và IndexedDB
  const originalFetchList = entityManagement.fetchList;
  const fetchProducts = async (isLoadMore = false) => {
    const { isOnline } = useNetwork();
    if (!isOnline.value && !isLoadMore) { // Chỉ lấy từ DB khi tải lần đầu và offline
      entityManagement.loadingList.value = true;
      try {
        const dbProducts = await indexedDBService.getProducts();
        if (dbProducts && dbProducts.length > 0) {
          entityManagement.items.value = dbProducts;
          // Ước lượng totalItems và hasMore cho offline
          entityManagement.totalItems.value = dbProducts.length; 
        } else {
          entityManagement.items.value = [];
          entityManagement.totalItems.value = 0;
          // Không throw error ở đây, để UI hiển thị "không có dữ liệu"
        }
      } catch (dbError) {
        console.error("Lỗi khi lấy sản phẩm từ IndexedDB:", dbError);
        entityManagement.errorList.value = "Lỗi khi tải dữ liệu offline.";
      } finally {
        entityManagement.loadingList.value = false;
      }
      return;
    }
    // Nếu online, hoặc loadMore (kể cả offline, nhưng loadMore sẽ không gọi API nếu offline trong useEntityManagement)
    await originalFetchList(isLoadMore);
    // Sau khi fetch từ API (nếu online), lưu vào IndexedDB
    if (isOnline.value && entityManagement.items.value.length > 0) {
      await indexedDBService.saveProducts(entityManagement.items.value);
    }
  };

  const loadMoreProducts = async () => {
    // useEntityManagement.loadMore đã kiểm tra hasMore và loading
    await entityManagement.loadMore();
     // Không cần lưu vào DB ở đây vì fetchList (nếu online) đã làm
  };
  const refreshProducts = async () => {
    await fetchProducts(false); // Gọi fetchProducts đã tùy chỉnh
  };
  const updateProductFilters = entityManagement.updateFilters;

  const fetchProductById = entityManagement.fetchItemById; // Có thể cần logic offline
  const setProductForCreate = entityManagement.setItemForCreate;
  const setProductForEdit = entityManagement.setItemForEdit;
  const setProductForDuplicate = entityManagement.setItemForDuplicate;
  const setProductViewMode = entityManagement.setViewMode;
  
  // Cần tùy chỉnh saveProduct và deleteProduct để xử lý offline
  const originalSaveItem = entityManagement.saveItem;
  const saveProduct = async () => {
    const { isOnline } = useNetwork();
    const productData = JSON.parse(JSON.stringify(entityManagement.currentItem.value)); // Lấy bản sao
    const mode = entityManagement.formMode.value;

    if (!isOnline.value) {
      Notify.create({ type: 'info', message: 'Đang offline, lưu thay đổi tạm thời.' });
      const actionType = mode === 'add' ? 'ADD_PRODUCT' : 'UPDATE_PRODUCT';
      // Nếu là add, productData có thể chưa có ID. Nếu là edit, nó nên có ID.
      // IndexedDB cho pendingActions tự tăng ID cho action, không phải cho product.
      await indexedDBService.addPendingAction({ type: actionType, data: productData });
      
      // Cập nhật local state (optimistic update)
      if (mode === 'add') {
         // Cần ID tạm thời cho hiển thị, hoặc làm mới danh sách từ DB sau
        const tempId = `offline_${Date.now()}`;
        entityManagement.items.value.unshift({ ...productData, inventory_item_id: tempId, isOffline: true });
      } else if (mode === 'edit') {
        const index = entityManagement.items.value.findIndex(p => p.inventory_item_id === productData.inventory_item_id);
        if (index !== -1) {
          entityManagement.items.value[index] = { ...entityManagement.items.value[index], ...productData };
        }
      }
      await indexedDBService.saveProducts(entityManagement.items.value); // Lưu lại state mới vào DB
      entityManagement.formMode.value = 'view';
      return productData; // Trả về dữ liệu đã lưu tạm
    }
    // Nếu online
    const savedItem = await originalSaveItem();
    if (savedItem) { // originalSaveItem đã gọi refreshList và saveProducts
      await indexedDBService.saveProducts(entityManagement.items.value);
    }
    return savedItem;
  };

  const originalDeleteItem = entityManagement.deleteItem;
  const deleteProduct = async (id) => {
     // TODO: Xử lý offline cho delete
    await originalDeleteItem(id);
    await indexedDBService.saveProducts(entityManagement.items.value); // Cập nhật DB sau khi xóa
  };

  // Getters
  const getProductById = (id) => {
    return products.value.find(product => String(product.inventory_item_id) === String(id));
  };
  const featuredProducts = computed(() => {
    return products.value.filter(product => product.featured === true);
  });
  


  // Logic đồng bộ offline
  async function syncOfflineChanges() {
    const { isOnline } = useNetwork();
    if (!isOnline.value) return;

    const pendingActions = await indexedDBService.getPendingActions();
    if (pendingActions.length === 0) return;

    Notify.create({ type: 'info', message: `Đang đồng bộ ${pendingActions.length} thay đổi cho Hàng hóa...` });

    for (const action of pendingActions) {
      try {
        if (action.type === 'ADD_PRODUCT') {
          await InventoryItemService.createInventoryItem(action.data);
        } else if (action.type === 'UPDATE_PRODUCT') {
          await InventoryItemService.updateInventoryItem(action.data);
        }
        // TODO: Xử lý DELETE_PRODUCT nếu có
        await indexedDBService.removePendingAction(action.id);
      } catch (error) {
        console.error('Lỗi khi đồng bộ action cho Hàng hóa:', action, error);
        Notify.create({
          type: 'negative',
          message: `Lỗi đồng bộ ${action.type} cho Hàng hóa: ${error.message}`
        });
      }
    }
    Notify.create({ type: 'positive', message: 'Đồng bộ Hàng hóa hoàn tất.' });
    await refreshProducts(); // Tải lại danh sách sau khi sync
  }


  return {
    products,
    totalProducts,
    loading,
    error,
    filterPayload,
    pagination,
    hasMoreProducts,
    fetchProducts,
    loadMoreProducts,
    refreshProducts,
    updateProductFilters,

    currentProduct,
    loadingDetail,
    formMode,
    isReadonly,
    fetchProductById, // Vẫn dùng từ entityManagement, nhưng cần xem xét logic offline
    setProductForCreate,
    setProductForEdit,
    setProductForDuplicate,
    setProductViewMode,
    saveProduct, // Hàm đã tùy chỉnh
    deleteProduct, // Hàm đã tùy chỉnh
    getProductById,
    featuredProducts,   
    syncOfflineChanges // Expose hàm đồng bộ
  };
});
