import { defineStore } from 'pinia'

export const useOrdersStore = defineStore('orders', {
  state: () => ({
    orders: []
  }),

  getters: {
    totalOrders: (state) => state.orders.length,
    totalRevenue: (state) => state.orders.reduce((sum, order) => sum + order.totalAmount, 0),
    getDailyOrders: (state) => (date) => {
      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)

      return state.orders.filter(order => {
        const orderDate = new Date(order.createdAt)
        return orderDate >= dayStart && orderDate <= dayEnd
      })
    },
    getDailyRevenue: (state) => (date) => {
      const dayOrders = state.getDailyOrders(date)
      return dayOrders.reduce((sum, order) => sum + order.totalAmount, 0)
    }
  },

  actions: {
    addOrder(order) {
      this.orders.push({
        ...order,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        status: {
          completed: false,
          invoiced: false,
          paid: false
        }
      })
      // Lưu vào localStorage
      this.saveOrdersToStorage()
    },

    updateOrderStatus(orderId, newStatus) {
      const order = this.orders.find(o => o.id === orderId)
      if (order) {
        order.status = { ...order.status, ...newStatus }
        this.saveOrdersToStorage()
      }
    },

    loadOrdersFromStorage() {
      const savedOrders = localStorage.getItem('orders')
      if (savedOrders) {
        this.orders = JSON.parse(savedOrders)
      }
    },

    saveOrdersToStorage() {
      localStorage.setItem('orders', JSON.stringify(this.orders))
    }
  }
})
