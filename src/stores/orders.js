import { defineStore } from 'pinia';
import { OrderService } from 'src/services/OrderService';
import { showNotification } from 'src/boot/notify-service'; // Sử dụng showNotification đã tạo

export const useOrderStore = defineStore('order', {
  state: () => ({
    orders: [],
    totalOrders: 0,
    loading: false,
    error: null,
    // Các tham số filter/phân trang hiện tại
    filterPayload: {
      skip: 0,
      take: 15, // Số lượng item mỗi lần tải
      seller_id: -1,
      from_date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(), // Mặc định 30 ngày trước
      to_date: new Date().toISOString(), // Mặc định ngày hiện tại
      ListOrderStatus: [],
      priority: 20,
      channel: -1,
      key_search: "",
      stock_id: "-1",
      PublishInvoiceStatus: -1, // Sửa lỗi dấu ngoặc kép
      SendTaxStatus: -1
    }
  }),

  getters: {
    getOrderById: (state) => (id) => {
      return state.orders.find(order => order.order_id === id);
    },
    hasMoreOrders: (state) => {
      return state.orders.length < state.totalOrders;
    }
  },

  actions: {
    async fetchOrders(isLoadMore = false) {
      if (this.loading && !isLoadMore) return; // Tránh gọi lại nếu đang tải (trừ khi là load more)
      
      this.loading = true;
      this.error = null;

      if (!isLoadMore) {
        this.orders = []; // Reset danh sách nếu là lần tải đầu hoặc refresh
        this.filterPayload.skip = 0;
        this.totalOrders = 0;
      }

      try {
        const response = await OrderService.getOrderList(this.filterPayload);
        if (response && response.Data) {
          if (isLoadMore) {
            this.orders = [...this.orders, ...response.Data];
          } else {
            this.orders = response.Data;
          }
          this.totalOrders = response.Total || 0;
          this.filterPayload.skip = this.orders.length; // Cập nhật skip cho lần tải tiếp theo
        } else {
          this.orders = isLoadMore ? this.orders : [];
          this.totalOrders = isLoadMore ? this.totalOrders : 0;
        }
      } catch (err) {
        this.error = err.message || 'Lỗi không xác định khi tải đơn hàng.';
        showNotification('error', `Không thể tải danh sách đơn hàng: ${this.error}`);
        // Không reset orders ở đây để giữ lại dữ liệu cũ nếu có khi load more lỗi
      } finally {
        this.loading = false;
      }
    },

    async loadMoreOrders() {
      if (this.loading || !this.hasMoreOrders) return;
      await this.fetchOrders(true);
    },
    
    async refreshOrders() {
      await this.fetchOrders(false);
    },

    updateFilter(newFilters) {
      // Chỉ cập nhật các key có trong newFilters
      for (const key in newFilters) {
        if (Object.prototype.hasOwnProperty.call(this.filterPayload, key)) {
          this.filterPayload[key] = newFilters[key];
        }
      }
      // Sau khi cập nhật filter, cần fetch lại từ đầu
      this.refreshOrders();
    },

    // TODO: Thêm các actions khác như fetchOrderDetail, createOrder, updateOrderStatus...
  }
});
