import { defineStore } from 'pinia'
import { LocalStorage, Notify } from 'quasar'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    loading: false
  }),

  getters: {
    totalItems: (state) => {
      return state.items.reduce((total, item) => total + item.quantity, 0)
    },
    totalPrice: (state) => {
      return state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
    },
    cartIsEmpty: (state) => {
      return state.items.length === 0
    },
    getItemById: (state) => {
      return (id) => state.items.find(item => item.id === id)
    }
  },

  actions: {
    loadCartFromStorage() {
      const savedCart = LocalStorage.getItem('cart')
      if (savedCart) {
        this.items = savedCart
      }
    },

    saveCartToStorage() {
      LocalStorage.set('cart', this.items)
    },

    addToCart(product, quantity = 1) {
      const existingItem = this.getItemById(product.id)
      
      if (existingItem) {
        existingItem.quantity += quantity
        Notify.create({
          type: 'positive',
          message: `Đã cập nhật số lượng ${product.name}`,
          position: 'top'
        })
      } else {
        this.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          quantity: quantity,
          stock: product.stock
        })
        Notify.create({
          type: 'positive',
          message: `Đã thêm ${product.name} vào giỏ hàng`,
          position: 'top'
        })
      }
      
      this.saveCartToStorage()
    },

    removeFromCart(productId) {
      const index = this.items.findIndex(item => item.id === productId)
      if (index > -1) {
        const removedItem = this.items[index]
        this.items.splice(index, 1)
        this.saveCartToStorage()
        
        Notify.create({
          type: 'warning',
          message: `Đã xóa ${removedItem.name} khỏi giỏ hàng`,
          position: 'top'
        })
      }
    },

    updateQuantity(productId, quantity) {
      const item = this.getItemById(productId)
      if (item) {
        if (quantity <= 0) {
          this.removeFromCart(productId)
        } else if (quantity <= item.stock) {
          item.quantity = quantity
          this.saveCartToStorage()
        } else {
          Notify.create({
            type: 'negative',
            message: `Số lượng không được vượt quá ${item.stock}`,
            position: 'top'
          })
        }
      }
    },

    increaseQuantity(productId) {
      const item = this.getItemById(productId)
      if (item && item.quantity < item.stock) {
        item.quantity++
        this.saveCartToStorage()
      } else {
        Notify.create({
          type: 'negative',
          message: 'Đã đạt số lượng tối đa trong kho',
          position: 'top'
        })
      }
    },

    decreaseQuantity(productId) {
      const item = this.getItemById(productId)
      if (item) {
        if (item.quantity > 1) {
          item.quantity--
          this.saveCartToStorage()
        } else {
          this.removeFromCart(productId)
        }
      }
    },

    clearCart() {
      this.items = []
      this.saveCartToStorage()
      Notify.create({
        type: 'info',
        message: 'Đã xóa tất cả sản phẩm khỏi giỏ hàng',
        position: 'top'
      })
    },

    // Tính toán chi phí giao hàng (mock)
    getShippingCost() {
      const total = this.totalPrice
      if (total >= 1000000) { // Miễn phí ship cho đơn hàng trên 1 triệu
        return 0
      } else if (total >= 500000) { // Giảm phí ship cho đơn hàng trên 500k
        return 15000
      } else {
        return 30000 // Phí ship tiêu chuẩn
      }
    },

    // Tính tổng thanh toán bao gồm phí ship
    getFinalTotal() {
      return this.totalPrice + this.getShippingCost()
    }
  }
})
