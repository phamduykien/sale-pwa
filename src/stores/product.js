import { defineStore } from 'pinia'
// import { api } from '../boot/axios' // 'api' is defined but never used.
import { indexedDBService } from '../services/IndexedDBService'
import { InventoryItemService } from '../services/InventoryItemService' // Thêm import
import { useNetwork } from '../composables/useNetwork'
import { Notify } from 'quasar'

/**
 * Store quản lý sản phẩm với hỗ trợ offline
 */
export const useProductStore = defineStore('product', {
  // Store for product management
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
      // Giả định rằng 'id' truyền vào đây là inventory_item_id
      return (id) => state.products.find(product => String(product.inventory_item_id) === String(id))
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
          throw new Error('Token xác thực không tìm thấy.');
        }

        const apiProducts = await InventoryItemService.getInventoryItems(token, 0, 50);

        if (apiProducts && Array.isArray(apiProducts)) {
          this.products = apiProducts;
        } else {
          console.warn('API không trả về danh sách sản phẩm hợp lệ. Sử dụng danh sách rỗng.');
          this.products = [];
        }
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
    

    async fetchProductById(id) {
      this.loading = true
      try {
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
        // productData.id từ EditProductPage chính là inventory_item_id
        const productDataIdStr = String(productData.id); 
        const index = this.products.findIndex(p => String(p.inventory_item_id) === productDataIdStr);
        
        let productToReturn = null;

        if (index !== -1) {
          this.products[index] = {
            ...this.products[index],
            ...productData
          };
          productToReturn = this.products[index];
        } else {
          console.warn(`Product with ID ${productDataIdStr} not found for update.`);
          // Không throw lỗi ở đây để cho phép offline mode vẫn có thể thử lưu pending action
          // productToReturn sẽ là null
        }

        if (!isOnline.value) {
          if (index !== -1) { // Chỉ lưu pending action nếu sản phẩm tồn tại và đã được cập nhật cục bộ
            await indexedDBService.addPendingAction({
              type: 'UPDATE_PRODUCT',
              data: productData
            });
            Notify.create({
              type: 'info',
              message: 'Sản phẩm sẽ được cập nhật khi có kết nối mạng.'
            });
          }
          return productToReturn;
        }

        // Nếu online và sản phẩm tồn tại trong store
        if (index === -1) {
            console.error(`Skipping API update for non-existent product ID ${productDataIdStr} in local store.`);
            // Có thể throw lỗi ở đây nếu muốn chặt chẽ hơn, 
            // hoặc trả về null/undefined để báo hiệu cập nhật không thành công trên server.
            // throw new Error(`Cannot update product: ID ${productDataIdStr} not found in local store.`);
            return productToReturn; // Trả về null vì không có gì để cập nhật trên server
        }
        
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Token xác thực không tìm thấy.');
        }
        
        const updatedProductFromServer = await InventoryItemService.updateInventoryItem(token, productData);

        // Tìm lại index phòng trường hợp ID từ server có thể khác (mặc dù thường là giống)
        // Giả sử updatedProductFromServer cũng có trường inventory_item_id hoặc một trường ID tương đương
        // Nếu API trả về ID khác, cần ánh xạ lại ở đây. Giả sử API trả về inventory_item_id.
        const serverIndex = this.products.findIndex(p => String(p.inventory_item_id) === String(updatedProductFromServer.inventory_item_id));
        if (serverIndex !== -1) {
          this.products[serverIndex] = updatedProductFromServer;
          productToReturn = updatedProductFromServer;
        } else {
          // Trường hợp này không nên xảy ra nếu ID không đổi và sản phẩm đã tồn tại trước đó.
          // Nếu xảy ra, có thể là ID đã thay đổi trên server, hoặc sản phẩm đã bị xóa khỏi store bởi một tiến trình khác.
          console.warn('Product not found in local store after server update, or ID mismatch. Adding/updating with server data.');
          // Quyết định: Thêm mới nếu không tìm thấy, hoặc cập nhật item có ID ban đầu nếu ID không đổi.
          // Để an toàn, nếu không tìm thấy sau khi server trả về, có thể thêm nó vào store.
          // Tuy nhiên, nếu ID ban đầu (productData.id) vẫn còn trong store nhưng khác với updatedProductFromServer.id,
          // thì cần cẩn thận để không tạo bản sao.
          // Giả định đơn giản: nếu serverIndex không tìm thấy, nhưng index ban đầu tìm thấy, cập nhật tại index ban đầu.
          // Nếu cả hai không tìm thấy (index === -1), thì đây là lỗi logic.
          if (index !== -1 && String(this.products[index].inventory_item_id) === productDataIdStr) { // Đảm bảo vẫn là item đó
             this.products[index] = updatedProductFromServer; // Cập nhật item cũ với data từ server
             productToReturn = updatedProductFromServer;
          } else {
            // Nếu không tìm thấy item ban đầu, hoặc item đó đã thay đổi ID một cách không mong muốn
            // thì thêm item mới từ server vào.
            this.products.push(updatedProductFromServer);
            productToReturn = updatedProductFromServer;
            console.log('Added product from server as it was not found or ID changed:', updatedProductFromServer);
          }
        }
        
        await indexedDBService.saveProducts(this.products);
        return productToReturn;
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
          // id: Date.now(), // Tạm thời dùng timestamp làm id, server sẽ trả về id thật
          name: productData.get('name'),
          price: Number(productData.get('price')),
          categoryId: Number(productData.get('categoryId')),
          description: productData.get('description'),
          // image: URL.createObjectURL(productData.get('image')), // Sẽ được xử lý bởi server
          images: [],
          stock: Number(productData.get('stock') || 0), // Giả sử có trường stock
          featured: false, // Mặc định
          rating: 0,
          reviews: 0,
          // Thêm các trường khác từ productData nếu cần
          // Ví dụ: unit_price, unit_price_after_tax, instock
          unit_price: Number(productData.get('unit_price')),
          unit_price_after_tax: Number(productData.get('unit_price_after_tax')),
          instock: Number(productData.get('instock')),
        };

        if (!isOnline.value) {
          // Offline: tạo ID tạm thời và thêm vào đầu danh sách
          const tempId = `offline_${Date.now()}`;
          const offlineProduct = { ...newProduct, id: tempId, isOffline: true };
          this.products.unshift(offlineProduct);
          await indexedDBService.addPendingAction({
            type: 'ADD_PRODUCT',
            data: newProduct // Lưu dữ liệu gốc không có ID tạm
          });
          Notify.create({
            type: 'info',
            message: 'Sản phẩm sẽ được thêm khi có kết nối mạng.'
          });
          return offlineProduct;
        }

        // Online: gửi lên server
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Token xác thực không tìm thấy.');
        }
        // InventoryItemService.createInventoryItem nên nhận object, không phải FormData nếu API backend mong đợi JSON
        // Nếu API nhận FormData, thì giữ nguyên productData
        // Giả sử InventoryItemService.createInventoryItem nhận object:
        const serverProduct = await InventoryItemService.createInventoryItem(token, newProduct);
        
        this.products.unshift(serverProduct); // Thêm sản phẩm từ server vào đầu danh sách
        await indexedDBService.saveProducts(this.products); // Lưu lại toàn bộ danh sách
        return serverProduct;

      } catch (error) {
        this.error = error.message || 'Có lỗi xảy ra khi thêm sản phẩm';
        Notify.create({
          type: 'negative',
          message: 'Không thể thêm sản phẩm: ' + (error.response?.data?.message || error.message)
        });
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async syncOfflineChanges() {
      const { isOnline } = useNetwork()
      if (!isOnline.value) return

      const pendingActions = await indexedDBService.getPendingActions()
      if (pendingActions.length === 0) return;

      Notify.create({ type: 'info', message: `Đang đồng bộ ${pendingActions.length} thay đổi...` });

      const token = localStorage.getItem('authToken');
      if (!token) {
        Notify.create({ type: 'negative', message: 'Lỗi đồng bộ: Token không tìm thấy.' });
        return;
      }

      for (const action of pendingActions) {
        try {
          switch (action.type) {
            case 'ADD_PRODUCT': { // Bọc case bằng {}
              // Khi đồng bộ ADD_PRODUCT, chúng ta cần gửi dữ liệu gốc (action.data)
              // và sau đó cập nhật item offline trong store với dữ liệu từ server (bao gồm ID thật)
              const addedProduct = await InventoryItemService.createInventoryItem(token, action.data);
              // Xóa item offline tạm thời và thêm item từ server
              this.products = this.products.filter(p => !(p.isOffline && p.name === action.data.name) ); // Cần cơ chế xác định item offline tốt hơn
              this.products.unshift(addedProduct);
              break;
            }
            case 'UPDATE_PRODUCT': { // Bọc case bằng {}
              await InventoryItemService.updateInventoryItem(token, action.data);
              // Sau khi update thành công, item trong this.products đã được cập nhật ở bước trước (khi offline)
              // hoặc sẽ được cập nhật bởi fetchProducts nếu cần.
              // Để đảm bảo, có thể tìm và cập nhật lại item đó từ action.data nếu cần.
              // action.data.id ở đây cũng nên là inventory_item_id
              const idx = this.products.findIndex(p => String(p.inventory_item_id) === String(action.data.id));
              if (idx !== -1) {
                this.products[idx] = { ...this.products[idx], ...action.data };
              }
              break;
            }
          }
          await indexedDBService.removePendingAction(action.id);
        } catch (error) {
          console.error('Error syncing action:', action, error);
          const errorMessage = error.response?.data?.message || error.message;
          Notify.create({
            type: 'negative',
            message: `Lỗi đồng bộ ${action.type} (${action.data.name || action.data.id}): ${errorMessage}`
          });
          // Không dừng lại nếu một action lỗi, tiếp tục với các action khác
        }
      }
      
      Notify.create({ type: 'positive', message: 'Đồng bộ hoàn tất.' });
      // Refresh products sau khi sync để đảm bảo dữ liệu mới nhất từ server
      await this.fetchProducts();
      await indexedDBService.saveProducts(this.products); // Lưu lại sau khi fetch
    }
  }
})
