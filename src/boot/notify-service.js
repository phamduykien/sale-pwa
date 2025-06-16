import { Notify } from 'quasar'

// Default options for notifications
const defaultOptions = {
  position: 'top',
  timeout: 2500,
  textColor: 'white',
  actions: [{ icon: 'close', color: 'white', round: true, dense: true }]
}

const showNotification = (type, message, options = {}) => {
  let icon, color

  switch (type) {
    case 'success':
      icon = 'check_circle'
      color = 'positive'
      break
    case 'error':
      icon = 'error'
      color = 'negative'
      break
    case 'warning':
      icon = 'warning'
      color = 'warning'
      break
    default:
      icon = 'info'
      color = 'info'
  }

  Notify.create({
    ...defaultOptions,
    message,
    color,
    icon,
    ...options
  })
}

export default ({ app }) => {
  // Making it available globally via app.config.globalProperties
  // For Vue 3 Options API: this.$notify(...)
  // For Vue 3 Composition API: getCurrentInstance().appContext.config.globalProperties.$notify(...)
  // Or, a more common approach for Composition API is to export and import the function directly.

  // We'll export the function directly for easier use in Composition API
  // and also attach it to the app instance for Options API.
  app.config.globalProperties.$showNotification = showNotification
}

// Exporting the function for direct import, especially useful in Composition API
export { showNotification }
