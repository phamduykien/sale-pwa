import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNotificationStore = defineStore('notifications', () => {
  // State
  const notifications = ref([])
  
  // Getters
  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.isRead).length
  })
  
  const sortedNotifications = computed(() => {
    return notifications.value.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  })
  
  // Actions
  function addNotification(notification) {
    const newNotification = {
      id: Date.now() + Math.random(), // Simple ID generation
      title: notification.title || 'Thông báo',
      message: notification.message || notification.body || '',
      timestamp: new Date().toISOString(),
      isRead: false,
      type: notification.type || 'info', // info, success, warning, error
      icon: notification.icon || 'notifications',
      data: notification.data || null
    }
    
    notifications.value.unshift(newNotification)
    
    // Giới hạn số lượng notifications (giữ lại 100 cái mới nhất)
    if (notifications.value.length > 100) {
      notifications.value = notifications.value.slice(0, 100)
    }
    
    // Lưu vào localStorage để persist
    saveToLocalStorage()
    
    return newNotification
  }
  
  function markAsRead(notificationId) {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.isRead = true
      saveToLocalStorage()
    }
  }
  
  function markAllAsRead() {
    notifications.value.forEach(notification => {
      notification.isRead = true
    })
    saveToLocalStorage()
  }
  
  function removeNotification(notificationId) {
    const index = notifications.value.findIndex(n => n.id === notificationId)
    if (index > -1) {
      notifications.value.splice(index, 1)
      saveToLocalStorage()
    }
  }
  
  function clearAllNotifications() {
    notifications.value = []
    saveToLocalStorage()
  }
  
  function saveToLocalStorage() {
    try {
      localStorage.setItem('notifications', JSON.stringify(notifications.value))
    } catch (error) {
      console.error('Lỗi khi lưu notifications vào localStorage:', error)
    }
  }
  
  function loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('notifications')
      if (stored) {
        notifications.value = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Lỗi khi tải notifications từ localStorage:', error)
      notifications.value = []
    }
  }
  
  // Initialize store
  loadFromLocalStorage()
  
  return {
    // State
    notifications,
    
    // Getters
    unreadCount,
    sortedNotifications,
    
    // Actions
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    loadFromLocalStorage
  }
})
