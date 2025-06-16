import { ref, onMounted, onUnmounted } from 'vue'
// import { useQuasar } from 'quasar' // Không cần dùng $q.notify nữa
import { showNotification } from 'src/boot/notify-service'

/**
 * Composable để quản lý trạng thái kết nối mạng
 * @returns {{isOnline: Ref<boolean>, showOfflineIndicator: Ref<boolean>}}
 */
export function useNetwork() {
  // const $q = useQuasar() // Không cần dùng $q.notify nữa
  const isOnline = ref(navigator.onLine)
  const showOfflineIndicator = ref(false)

  function updateOnlineStatus() {
    const prevStatus = isOnline.value
    isOnline.value = navigator.onLine

    // Chỉ hiển thị thông báo khi có sự thay đổi trạng thái
    if (prevStatus !== isOnline.value) {
      showNotification(
        isOnline.value ? 'success' : 'warning',
        isOnline.value ? 'Đã kết nối lại mạng' : 'Mất kết nối mạng',
        { position: 'top', timeout: 2000 }
      )
    }

    // Hiển thị indicator khi offline
    showOfflineIndicator.value = !isOnline.value
  }

  onMounted(() => {
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    updateOnlineStatus() // Check initial status
  })

  onUnmounted(() => {
    window.removeEventListener('online', updateOnlineStatus)
    window.removeEventListener('offline', updateOnlineStatus)
  })

  return {
    isOnline,
    showOfflineIndicator
  }
}

/**
 * Debounce một function
 * @param {Function} func Function cần debounce
 * @param {number} wait Thời gian đợi (ms)
 * @returns {Function} Function đã được debounce
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Thực hiện lại một operation với số lần thử xác định
 * @param {Function} operation Operation cần thực hiện
 * @param {number} maxAttempts Số lần thử tối đa
 * @param {number} delay Thời gian chờ giữa các lần thử (ms)
 * @returns {Promise<*>} Kết quả của operation
 */
export function retryOperation(operation, maxAttempts = 3, delay = 1000) {
  return new Promise((resolve, reject) => {
    let attempts = 0

    const attempt = async () => {
      try {
        const result = await operation()
        resolve(result)
      } catch (error) {
        attempts++
        if (attempts === maxAttempts) {
          reject(error)
        } else {
          setTimeout(attempt, delay * attempts) // Tăng delay theo số lần thử
        }
      }
    }

    attempt()
  })
}
