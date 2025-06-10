import { defineStore } from 'pinia'
import { api } from '../boot/axios'
import { indexedDBService } from '../services/IndexedDBService'
import { InventoryItemService } from '../services/InventoryItemService' // Thêm import
import { useNetwork } from '../composables/useNetwork'
import { Notify } from 'quasar'

/**
 * Store quản lý sản phẩm với hỗ trợ offline
 */
export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    categories: [],
    loading: false,
    error: null,
    currentProduct: null
  }),

  getters: {
    /**
     * Lấy sản phẩm theo ID
     * @param {Object} state State của store
     * @returns {Function} Function trả về sản phẩm theo ID
     */
    getProductById: (state) => {
      return (id) => state.products.find(product => product.id === id)
    },
    getProductsByCategory: (state) => {
      return (categoryId) => state.products.filter(product => product.categoryId === categoryId)
    },
    /**
     * Lấy danh sách sản phẩm nổi bật
     * @param {Object} state State của store
     * @returns {Array} Danh sách sản phẩm nổi bật
     */
    featuredProducts: (state) => {
      return state.products.filter(product => product.featured === true)
    }
  },

  actions: {
    /**
     * Lấy danh sách sản phẩm từ server hoặc IndexedDB
     * @returns {Promise<void>}
     */
    async fetchProducts() {
      this.loading = true
      this.error = null
      const { isOnline } = useNetwork()

      try {
        // Nếu offline, lấy dữ liệu từ IndexedDB
        if (!isOnline.value) {
          this.products = await indexedDBService.getProducts()
          if (this.products.length === 0) {
            throw new Error('Không có dữ liệu offline')
          }
          return
        }

        // Nếu online, gọi API và lưu vào IndexedDB
        const token = localStorage.getItem('authToken');
        if (!token) {
          // Notify.create({
          //   type: 'negative',
          //   message: 'Không tìm thấy token xác thực. Không thể tải sản phẩm từ API.'
          // });
          // Quyết định xem có nên throw error hay không. Nếu throw, catch bên dưới sẽ xử lý.
          // Nếu không throw, có thể thử tải từ IndexedDB như một fallback, hoặc để products rỗng.
          // Hiện tại, để giống logic offline, sẽ throw error.
          throw new Error('Token xác thực không tìm thấy.');
        }

        // Gọi API thật sự để lấy danh sách sản phẩm
        // Lấy 50 sản phẩm đầu tiên (skip=0, take=50) làm mặc định cho store
        // InventoryItemService.getInventoryItems trả về response.data.Data
        const apiProducts = await InventoryItemService.getInventoryItems(token, 0, 50);

        if (apiProducts && Array.isArray(apiProducts)) {
          this.products = apiProducts;
        } else {
          // Xử lý trường hợp API không trả về dữ liệu mong đợi
          console.warn('API không trả về danh sách sản phẩm hợp lệ. Sử dụng danh sách rỗng.');
          this.products = [];
        }

        // Lưu products mới từ API vào IndexedDB để sử dụng offline
        // saveProducts đã có store.clear() nên sẽ ghi đè dữ liệu cũ.
        await indexedDBService.saveProducts(this.products);
      } catch (error) {
        this.error = error.message;
        console.error('Error fetching products:', error)
        Notify.create({
          type: 'negative',
          message: 'Không thể tải danh sách sản phẩm: ' + error.message
        })
      } finally {
        this.loading = false
      }
    },

    async fetchCategories() {
      try {
        // Mock data để demo
        this.categories = [
          { id: 1, name: 'Điện thoại', icon: 'smartphone', color: '#e91e63' },
          { id: 2, name: 'Laptop', icon: 'laptop', color: '#2196f3' },
          { id: 3, name: 'Tablet', icon: 'tablet', color: '#ff9800' },
          { id: 4, name: 'Phụ kiện', icon: 'headphones', color: '#4caf50' }
        ]
      } catch (error) {
        this.error = error.message
        console.error('Error fetching categories:', error)
      }
    },

    async fetchProductById(id) {
      this.loading = true
      try {
        // Trong thực tế sẽ gọi API
        this.currentProduct = this.getProductById(id)
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    setCurrentProduct(product) {
      this.currentProduct = product
    },

    clearCurrentProduct() {
      this.currentProduct = null
    },

    /**
     * Cập nhật thông tin sản phẩm
     * @param {Object} productData Dữ liệu sản phẩm cần cập nhật
     * @returns {Promise<Object>} Sản phẩm đã được cập nhật
     */
    async updateProduct(productData) {
      this.loading = true
      this.error = null
      const { isOnline } = useNetwork()

      try {
        const index = this.products.findIndex(p => p.id === productData.id)
        if (index !== -1) {
          this.products[index] = {
            ...this.products[index],
            ...productData
          }
        }

        // Nếu offline, lưu action để sync sau
        if (!isOnline.value) {
          await indexedDBService.addPendingAction({
            type: 'UPDATE_PRODUCT',
            data: productData
          })
          Notify.create({
            type: 'info',
            message: 'Sản phẩm sẽ được cập nhật khi có kết nối mạng'
          })
          return this.products[index]
        }

        // Nếu online, gửi lên server
        const token = localStorage.getItem('authToken');
        if (!token) {
          // Quyết định xem có nên throw error hay không.
          // Hiện tại, để giống logic offline, sẽ throw error.
          throw new Error('Token xác thực không tìm thấy.');
        }
        // Gọi service để cập nhật sản phẩm
        // Giả sử InventoryItemService.updateInventoryItem trả về sản phẩm đã cập nhật
        // và cần productData.id cũng như toàn bộ productData
        const updatedProduct = await InventoryItemService.updateInventoryItem(token, productData.id, productData);

        if (index !== -1) {
          this.products[index] = updatedProduct;
        }
        // Cập nhật IndexedDB
        await indexedDBService.saveProducts(this.products);
        return updatedProduct;
      } catch (error) {
        this.error = error.message || 'Có lỗi xảy ra khi cập nhật sản phẩm';
        Notify.create({
          type: 'negative',
          message: 'Không thể cập nhật sản phẩm: ' + (error.response?.data?.message || error.message)
        });
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Thêm sản phẩm mới
     * @param {FormData} productData Form data chứa thông tin sản phẩm
     * @returns {Promise<Object>} Sản phẩm đã được thêm
     */
    async addProduct(productData) {
      this.loading = true
      this.error = null
      const { isOnline } = useNetwork()

      try {
        const newProduct = {
          id: Date.now(), // Tạm thời dùng timestamp làm id
          name: productData.get('name'),
          price: Number(productData.get('price')),
          categoryId: Number(productData.get('categoryId')),
          description: productData.get('description'),
          image: URL.createObjectURL(productData.get('image')),
          images: [],
          stock: 10,
          featured: false,
          rating: 0,
          reviews: 0
        }
        this.products.unshift(newProduct)

        // Nếu offline, lưu action để sync sau
        if (!isOnline.value) {
          await indexedDBService.addPendingAction({
            type: 'ADD_PRODUCT',
            data: newProduct
          })
          Notify.create({
            type: 'info',
            message: 'Sản phẩm sẽ được thêm khi có kết nối mạng'
          })
          return newProduct
        }

        // Nếu online, gửi lên server
        const response = await api.post('/products', productData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        const serverProduct = response.data
        // Cập nhật lại id và data từ server
        const index = this.products.findIndex(p => p.id === newProduct.id)
        if (index !== -1) {
          this.products[index] = serverProduct
        }
        // Cập nhật IndexedDB
        await indexedDBService.saveProducts(this.products)
        return serverProduct
      } catch (error) {
        this.error = error.message || 'Có lỗi xảy ra khi thêm sản phẩm'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Đồng bộ các thay đổi offline khi có mạng
    /**
     * Đồng bộ các thay đổi offline khi có mạng
     * @returns {Promise<void>}
     */
    async syncOfflineChanges() {
      const { isOnline } = useNetwork()
      if (!isOnline.value) return

      const pendingActions = await indexedDBService.getPendingActions()

      for (const action of pendingActions) {
        try {
          switch (action.type) {
            case 'ADD_PRODUCT':
              await api.post('/products', action.data)
              break
            case 'UPDATE_PRODUCT': {
              // Khi đồng bộ, cũng cần gọi service
              const token = localStorage.getItem('authToken');
              if (!token) {
                console.error('Token không tìm thấy khi đồng bộ UPDATE_PRODUCT');
                // Quyết định xem có nên bỏ qua action này hay thử lại sau
                // Hiện tại, sẽ log lỗi và không remove action nếu token không có
                Notify.create({
                  type: 'negative',
                  message: 'Lỗi đồng bộ: Token không tìm thấy cho việc cập nhật sản phẩm.'
                });
                continue; // Bỏ qua action này và tiếp tục với action khác
              }
              await InventoryItemService.updateInventoryItem(token, action.data.id, action.data);
              break;
            }
          }
          await indexedDBService.removePendingAction(action.id)
        } catch (error) {
          console.error('Error syncing action:', action, error);
          // Thêm thông báo lỗi chi tiết hơn nếu có từ server
          const errorMessage = error.response?.data?.message || error.message;
          Notify.create({
            type: 'negative',
            message: `Lỗi đồng bộ: ${errorMessage}`
          });
        }
      }

      // Refresh products sau khi sync
      await this.fetchProducts()
    }
  }
})
