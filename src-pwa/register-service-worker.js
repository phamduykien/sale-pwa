import { register } from 'register-service-worker'
import { Notify } from 'quasar'

// The server URL starting with http:// or https://
// const VUE_APP_API_URL = process.env.VUE_APP_API_URL || '' // Or your specific API URL if needed for SW updates

register(process.env.SERVICE_WORKER_FILE, {
  // The registrationOptions object will be passed as the second argument
  // to ServiceWorkerContainer.register()
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#Parameter

  // registrationOptions: { scope: './' },

  ready (/* registration */) {
    console.log('Service worker is active.')
    Notify.create({
      message: 'Ứng dụng sẵn sàng hoạt động offline.',
      color: 'positive',
      icon: 'cloud_done',
      position: 'bottom',
      timeout: 3000
    })
  },

  registered (/* registration */) {
    console.log('Service worker has been registered.')
  },

  cached (/* registration */) {
    console.log('Content has been cached for offline use.')
    Notify.create({
      message: 'Nội dung đã được lưu trữ để sử dụng offline.',
      color: 'info',
      icon: 'save_alt',
      position: 'bottom',
      timeout: 3000
    })
  },

  updatefound (/* registration */) {
    console.log('New content is downloading.')
    Notify.create({
      message: 'Đang tải nội dung mới...',
      color: 'info',
      icon: 'update',
      position: 'bottom',
      timeout: 3000,
      spinner: true
    })
  },

  updated (/* registration */) { // registration parameter is not used
    console.log('New content is available; please refresh.')
    Notify.create({
      message: 'Có bản cập nhật mới! Vui lòng làm mới trang.',
      color: 'positive',
      icon: 'new_releases',
      position: 'bottom',
      timeout: 0, // Keep open until user interacts
      actions: [
        {
          label: 'Làm mới',
          color: 'white',
          handler: () => {
            // registration.waiting.postMessage({ type: 'SKIP_WAITING' }) // If using skipWaiting in SW
            window.location.reload()
          }
        },
        {
          label: 'Bỏ qua',
          color: 'white',
          handler: () => {}
        }
      ]
    })
  },

  offline () {
    console.log('No internet connection found. App is running in offline mode.')
    Notify.create({
      message: 'Không có kết nối internet. Ứng dụng đang chạy ở chế độ offline.',
      color: 'warning',
      icon: 'signal_wifi_off',
      position: 'bottom',
      timeout: 5000
    })
  },

  error (error) {
    console.error('Error during service worker registration:', error)
    Notify.create({
      type: 'negative',
      message: 'Lỗi đăng ký Service Worker. Một số tính năng offline có thể không hoạt động.',
      caption: error.message,
      position: 'bottom',
      timeout: 5000
    })
  }
})

// Service worker update logic
// This code listens for the user's confirmation to update the app.
// if (navigator.serviceWorker) {
//   navigator.serviceWorker.addEventListener('controllerchange', () => {
//     if (refreshing) return
//     refreshing = true
//     window.location.reload()
//   })
// }
// let refreshing
// navigator.serviceWorker.addEventListener('controllerchange', () => {
//   if (refreshing) return
//   refreshing = true
//   window.location.reload()
// })
