import { defineStore } from 'pinia';
import { OrderService } from 'src/services/OrderService';
// import { showNotification } from 'src/boot/notify-service'; // showNotification sẽ được gọi từ composable
import { useEntityManagement } from 'src/composables/useEntityManagement';
import { computed } from 'vue';

export const useOrderStore = defineStore('order', () => {
  const defaultOrderFilters = {
    seller_id: -1,
    from_date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
    to_date: new Date().toISOString(),
    ListOrderStatus: [],
    priority: 20,
    channel: -1,
    key_search: "",
    stock_id: "-1",
    PublishInvoiceStatus: -1,
    SendTaxStatus: -1
  };

  const entityManagement = useEntityManagement(OrderService, 'Đơn hàng', defaultOrderFilters, 15);

  // Expose state and methods from composable
  // Chúng ta cần expose các refs và computed properties để chúng reactive trong component
  // Các phương thức có thể được expose trực tiếp

  // State (reactive refs and computed)
  const orders = computed(() => entityManagement.items.value);
  const totalOrders = computed(() => entityManagement.totalItems.value);
  const loading = computed(() => entityManagement.loadingList.value); // Hoặc kết hợp loadingList và loadingDetail nếu cần
  const error = computed(() => entityManagement.errorList.value); // Hoặc errorDetail
  const filterPayload = entityManagement.filters; // reactive object
  const pagination = entityManagement.pagination; // reactive object
  const hasMoreOrders = computed(() => entityManagement.hasMore.value);
  
  const currentOrder = computed(() => entityManagement.currentItem.value);
  const loadingDetail = computed(() => entityManagement.loadingDetail.value);
  const formMode = computed(() => entityManagement.formMode.value);
  const isReadonly = computed(() => entityManagement.isReadonly.value);


  // Actions (methods from composable)
  const fetchOrders = entityManagement.fetchList; // fetchList đã xử lý isLoadMore bên trong pagination
  const loadMoreOrders = entityManagement.loadMore;
  const refreshOrders = entityManagement.refreshList;
  const updateFilter = entityManagement.updateFilters; // Đổi tên cho nhất quán với composable

  const fetchOrderById = entityManagement.fetchItemById;
  const setOrderForCreate = entityManagement.setItemForCreate;
  const setOrderForEdit = entityManagement.setItemForEdit;
  const setOrderForDuplicate = entityManagement.setItemForDuplicate;
  const setOrderViewMode = entityManagement.setViewMode;
  const saveOrder = entityManagement.saveItem;
  const deleteOrder = entityManagement.deleteItem;
  
  // Getter (đã có trong composable hoặc có thể tạo thêm nếu cần)
  const getOrderById = (id) => {
    // Composable không có sẵn getter này, nhưng currentItem có thể dùng thay thế sau khi fetch
    // Hoặc chúng ta có thể tìm trong `orders.value`
    return orders.value.find(order => order.order_id === id);
  };


  return {
    // List
    orders,
    totalOrders,
    loading, // loadingList
    error,   // errorList
    filterPayload,
    pagination,
    hasMoreOrders,
    fetchOrders,
    loadMoreOrders,
    refreshOrders,
    updateFilter,

    // Detail/Form
    currentOrder,
    loadingDetail,
    formMode,
    isReadonly,
    fetchOrderById,
    setOrderForCreate,
    setOrderForEdit,
    setOrderForDuplicate,
    setOrderViewMode,
    saveOrder,
    deleteOrder,
    
    // Getters
    getOrderById,
  };
});
