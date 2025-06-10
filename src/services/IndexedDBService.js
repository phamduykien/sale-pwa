/**
 * Service để tương tác với IndexedDB
 */
class IndexedDBService {
  /**
   * Khởi tạo service với tên database và version
   * @param {string} dbName Tên của database
   * @param {number} version Version của database
   */
  constructor(dbName = 'salePwaDB', version = 2) { // Tăng version lên 2
    this.dbName = dbName
    this.version = version
    this.db = null
  }

  /**
   * Khởi tạo kết nối với database
   * @returns {Promise<IDBDatabase>} Instance của database
   */
  async initDB() {
    if (this.db) return this.db

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'))
      }

      request.onsuccess = (event) => {
        this.db = event.target.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        // Products store: Thay đổi keyPath sang 'inventory_item_id'
        // Nếu store 'products' tồn tại từ phiên bản cũ (oldVersion < 2), xóa và tạo lại.
        if (event.oldVersion < 2) {
          if (db.objectStoreNames.contains('products')) {
            db.deleteObjectStore('products');
          }
          db.createObjectStore('products', { keyPath: 'inventory_item_id' });
        } else { // Nếu store chưa tồn tại ở các phiên bản mới hơn (không πιθαν)
          if (!db.objectStoreNames.contains('products')) {
            db.createObjectStore('products', { keyPath: 'inventory_item_id' });
          }
        }


        // Pending actions store for offline operations
        if (!db.objectStoreNames.contains('pendingActions')) {
          const pendingStore = db.createObjectStore('pendingActions', { 
            keyPath: 'id', 
            autoIncrement: true 
          })
          pendingStore.createIndex('type', 'type')
          pendingStore.createIndex('timestamp', 'timestamp')
        }
      }
    })
  }

  /**
   * Lưu danh sách sản phẩm vào IndexedDB
   * @param {Array} products Danh sách sản phẩm cần lưu
   * @returns {Promise<void>}
   */
  async saveProducts(products) {
    const db = await this.initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['products'], 'readwrite')
      const store = transaction.objectStore('products')

      // Xóa tất cả sản phẩm cũ trước khi lưu mới
      store.clear()

      products.forEach(product => {
        // Đảm bảo product là một plain JavaScript object và có thuộc tính 'id'
        // Nếu ID thực tế từ API là 'inventory_item_id' hoặc một tên khác,
        // và keyPath của store là 'id', chúng ta cần ánh xạ nó.
        // Ví dụ: const cleanProduct = { ...JSON.parse(JSON.stringify(product)), id: product.inventory_item_id || product.id };
        // Tuy nhiên, để giải quyết DataCloneError trước, chúng ta chỉ cần làm sạch đối tượng.
        // Nếu keyPath là 'id' và product không có 'id' nhưng có 'inventory_item_id',
        // "Làm sạch" đối tượng sản phẩm
        const cleanProduct = JSON.parse(JSON.stringify(product));

        // Đảm bảo 'inventory_item_id' tồn tại vì nó là keyPath
        if (typeof cleanProduct.inventory_item_id === 'undefined' || cleanProduct.inventory_item_id === null) {
          console.warn('Sản phẩm thiếu inventory_item_id, không thể lưu vào IndexedDB:', cleanProduct);
          return; // Bỏ qua sản phẩm này
        }
        
        store.put(cleanProduct);
      })

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(new Error('Failed to save products'))
    })
  }

  /**
   * Lấy danh sách sản phẩm từ IndexedDB
   * @returns {Promise<Array>} Danh sách sản phẩm
   */
  async getProducts() {
    const db = await this.initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['products'], 'readonly')
      const store = transaction.objectStore('products')
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error('Failed to get products'))
    })
  }

  /**
   * Thêm một action vào queue để sync sau
   * @param {Object} action Action cần thêm vào queue
   * @returns {Promise<number>} ID của action đã thêm
   */
  async addPendingAction(action) {
    const db = await this.initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pendingActions'], 'readwrite')
      const store = transaction.objectStore('pendingActions')
      
      const actionWithTimestamp = {
        ...action,
        timestamp: new Date().toISOString()
      }

      const request = store.add(actionWithTimestamp)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error('Failed to add pending action'))
    })
  }

  /**
   * Lấy danh sách các action đang chờ sync
   * @returns {Promise<Array>} Danh sách actions
   */
  async getPendingActions() {
    const db = await this.initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pendingActions'], 'readonly')
      const store = transaction.objectStore('pendingActions')
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error('Failed to get pending actions'))
    })
  }

  /**
   * Xóa một action khỏi queue sau khi đã sync thành công
   * @param {number} id ID của action cần xóa
   * @returns {Promise<void>}
   */
  async removePendingAction(id) {
    const db = await this.initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pendingActions'], 'readwrite')
      const store = transaction.objectStore('pendingActions')
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('Failed to remove pending action'))
    })
  }
}

export const indexedDBService = new IndexedDBService()
