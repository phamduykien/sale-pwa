import { useNotificationStore } from 'src/stores/notifications'
import { showNotification } from 'src/boot/notify-service'

interface NotificationData {
  title: string
  message?: string
  body?: string
  content?: string
  type?: string
  level?: string
  icon?: string
  data?: any
}

interface NotificationStatus {
  supported: boolean
  permission: string
  subscribed: boolean
  error?: string
  subscription?: PushSubscription | null
}

interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number[]
  notificationIcon?: string
}

class NotificationService {
  private vapidPublicKey: string = 'YOUR_PUBLIC_VAPID_KEY_HERE' // Sẽ được cấu hình sau
  private notificationStore: any = null

  // Initialize với notification store
  init(): void {
    this.notificationStore = useNotificationStore()
  }

  // Chuyển đổi VAPID key từ base64 sang Uint8Array
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // Kiểm tra hỗ trợ notification
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator
  }

  // Lấy trạng thái permission hiện tại
  getPermissionStatus(): string {
    if (!this.isSupported()) {
      return 'not-supported'
    }
    return Notification.permission
  }

  // Yêu cầu quyền notification
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      showNotification('error', 'Trình duyệt này không hỗ trợ thông báo hoặc Service Worker.')
      return false
    }

    const permissionResult = await Notification.requestPermission()
    
    if (permissionResult === 'granted') {
      showNotification('success', 'Đã cấp quyền thông báo!')
      await this.subscribeUserToPush()
      return true
    } else if (permissionResult === 'denied') {
      showNotification('warning', 'Quyền thông báo đã bị từ chối.')
      return false
    } else {
      showNotification('info', 'Quyền thông báo chưa được quyết định.')
      return false
    }
  }

  // Đăng ký push subscription
  async subscribeUserToPush(): Promise<boolean> {
    if (!this.isSupported() || !navigator.serviceWorker.ready) {
      showNotification('warning', 'Service Worker chưa sẵn sàng.')
      return false
    }
    
    try {
      const registration = await navigator.serviceWorker.ready
      let subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        console.log('User IS already subscribed.')
        console.log('Existing subscription:', JSON.stringify(subscription))
        showNotification('info', 'Đã đăng ký nhận thông báo từ trước.')
        return true
      }

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      })

      console.log('User is subscribed:', JSON.stringify(subscription))
      showNotification('success', 'Đăng ký nhận thông báo thành công!')

      // TODO: Gửi subscription lên server
      // await this.sendSubscriptionToServer(subscription)
      
      return true
    } catch (error: any) {
      console.error('Failed to subscribe the user: ', error)
      if (Notification.permission === 'denied') {
        showNotification('error', 'Quyền thông báo bị từ chối. Không thể đăng ký.')
      } else {
        showNotification('error', `Đăng ký nhận thông báo thất bại: ${error.message}`)
      }
      return false
    }
  }

  // Gửi subscription lên server (cần implement)
  async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      // TODO: Implement API call to save subscription
      // const response = await fetch('/api/subscribe', {
      //   method: 'POST',
      //   body: JSON.stringify(subscription),
      //   headers: {
      //     'Content-Type': 'application/json'
      //   }
      // })
      console.log('TODO: Send subscription to server:', subscription)
    } catch (error) {
      console.error('Error sending subscription to server:', error)
    }
  }

  // Hiển thị notification local qua service worker
  async showLocalNotification(title: string, options: ExtendedNotificationOptions = {}): Promise<boolean> {
    if (!this.isSupported()) {
      showNotification('error', 'Thông báo hoặc Service Worker không được hỗ trợ.')
      return false
    }

    if (Notification.permission !== 'granted') {
      showNotification('warning', 'Vui lòng cấp quyền thông báo trước.')
      const granted = await this.requestPermission()
      if (!granted) return false
    }

    try {
      const registration = await navigator.serviceWorker.ready
      
      const notificationOptions: NotificationOptions = {
        body: options.body || '',
        icon: options.icon || '/icons/favicon-128x128.png',
        badge: options.badge || '/icons/favicon-96x96.png',
        vibrate: options.vibrate || [200, 100, 200],
        tag: options.tag || 'default-notification',
        data: options.data || { url: window.location.origin },
        ...options
      }

      await registration.showNotification(title, notificationOptions)
      
      // Thêm vào notification store
      if (this.notificationStore) {
        this.notificationStore.addNotification({
          title: title,
          message: options.body || '',
          type: (options as any).type || 'info',
          icon: options.notificationIcon || 'notifications',
          data: options.data
        })
      }

      showNotification('info', 'Đã gửi thông báo local. Kiểm tra thông báo của hệ thống.')
      return true
    } catch (err: any) {
      console.error('Service Worker not ready or error showing notification:', err)
      showNotification('error', 'Không thể hiển thị thông báo local.')
      return false
    }
  }

  // Xử lý notification nhận từ server/websocket
  handleIncomingNotification(notificationData: NotificationData): any {
    if (!this.notificationStore) {
      console.warn('Notification store chưa được khởi tạo')
      return
    }

    // Thêm vào store
    const notification = this.notificationStore.addNotification(notificationData)

    // Hiển thị push notification nếu có quyền
    if (Notification.permission === 'granted') {
      this.showLocalNotification(notification.title, {
        body: notification.message,
        icon: notification.icon,
        data: notification.data
      })
    }

    // Hiển thị toast notification
    showNotification(
      notification.type, 
      `${notification.title}: ${notification.message}`
    )

    return notification
  }

  // Kiểm tra trạng thái subscription
  async getSubscriptionStatus(): Promise<NotificationStatus> {
    if (!this.isSupported()) {
      return { supported: false, subscribed: false, permission: 'not-supported' }
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      
      return {
        supported: true,
        subscribed: !!subscription,
        permission: Notification.permission,
        subscription: subscription
      }
    } catch (error: any) {
      console.error('Error checking subscription status:', error)
      return { supported: true, subscribed: false, permission: Notification.permission, error: error.message }
    }
  }

  // Test notification
  async testNotification(): Promise<boolean> {
    return await this.showLocalNotification('Thông báo thử nghiệm!', {
      body: 'Đây là một thông báo local từ PWA.',
      vibrate: [200, 100, 200],
      tag: 'test-notification'
    })
  }
}

// Export singleton instance
export const notificationService = new NotificationService()
export default notificationService
