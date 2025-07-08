<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row items-center q-mb-lg">
      <q-btn
        flat
        round
        dense
        icon="arrow_back"
        @click="$router.back()"
        class="q-mr-sm"
      />
      <div class="text-h5 text-weight-bold">Thông báo</div>
      <q-space />
      <q-badge v-if="notificationStore.unreadCount > 0" color="red" :label="notificationStore.unreadCount" rounded />
    </div>

    <!-- Action Bar -->
    <div v-if="notificationStore.notifications.length > 0" class="q-mb-md">
      <q-card flat bordered class="q-pa-sm">
        <div class="row justify-between items-center">
          <span class="text-body2 text-grey-7">
            {{ notificationStore.notifications.length }} thông báo
          </span>
          <q-btn
            flat
            dense
            size="sm"
            label="Đánh dấu tất cả đã đọc"
            @click="markAllAsRead"
            :disable="notificationStore.unreadCount === 0"
            color="primary"
          />
        </div>
      </q-card>
    </div>

    <!-- Notifications List -->
    <div v-if="notificationStore.notifications.length === 0" class="q-pa-xl text-center text-grey-6">
      <q-icon name="notifications_none" size="4rem" class="q-mb-md" />
      <div class="text-h6 q-mb-sm">Chưa có thông báo nào</div>
      <div class="text-body2">Thông báo mới sẽ xuất hiện tại đây</div>
    </div>

    <q-list v-else bordered separator class="rounded-borders">
      <q-item
        v-for="notification in notificationStore.sortedNotifications"
        :key="notification.id"
        clickable
        v-ripple
        @click="handleNotificationClick(notification)"
        :class="{ 'bg-blue-1': !notification.isRead }"
        class="q-py-md"
      >
        <q-item-section avatar>
          <q-avatar :color="getNotificationColor(notification.type)" text-color="white" size="lg">
            <q-icon :name="notification.icon" />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label class="text-weight-medium q-mb-xs">
            {{ notification.title }}
          </q-item-label>
          <q-item-label caption lines="3" class="text-body2 q-mb-xs">
            {{ notification.message }}
          </q-item-label>
          <q-item-label caption class="text-grey-5">
            <q-icon name="schedule" size="xs" class="q-mr-xs" />
            {{ formatNotificationTime(notification.timestamp) }}
          </q-item-label>
        </q-item-section>

        <q-item-section side top>
          <div class="column items-end q-gutter-xs">
            <q-badge v-if="!notification.isRead" color="red" rounded />
            <q-btn
              flat
              round
              dense
              size="sm"
              icon="close"
              @click.stop="removeNotification(notification.id)"
              class="text-grey-5"
            />
          </div>
        </q-item-section>
      </q-item>
    </q-list>

    <!-- Footer Actions -->
    <div v-if="notificationStore.notifications.length > 0" class="q-mt-lg">
      <q-card flat bordered class="q-pa-md text-center">
        <q-btn
          flat
          dense
          label="Xóa tất cả thông báo"
          color="negative"
          @click="confirmClearAll"
          icon="delete_sweep"
        />
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { useNotificationStore } from 'src/stores/notifications'
import { Dialog } from 'quasar'

const notificationStore = useNotificationStore()

// Notification actions
function markAllAsRead() {
  notificationStore.markAllAsRead()
}

function handleNotificationClick(notification) {
  // Đánh dấu notification là đã đọc
  if (!notification.isRead) {
    notificationStore.markAsRead(notification.id)
  }
  
  // Xử lý click notification (ví dụ: navigate đến trang liên quan)
  if (notification.data && notification.data.url) {
    window.open(notification.data.url, '_blank')
  }
}

function removeNotification(notificationId) {
  notificationStore.removeNotification(notificationId)
}

function confirmClearAll() {
  Dialog.create({
    title: 'Xóa tất cả thông báo',
    message: 'Bạn có chắc chắn muốn xóa tất cả thông báo? Hành động này không thể hoàn tác.',
    cancel: {
      label: 'Hủy',
      color: 'grey',
      flat: true
    },
    ok: {
      label: 'Xóa tất cả',
      color: 'negative',
      unelevated: true
    }
  }).onOk(() => {
    notificationStore.clearAllNotifications()
  })
}

function getNotificationColor(type) {
  const colorMap = {
    'success': 'positive',
    'error': 'negative', 
    'warning': 'warning',
    'info': 'info'
  }
  return colorMap[type] || 'primary'
}

function formatNotificationTime(timestamp) {
  try {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 1) {
      return 'Vừa xong'
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`
    } else if (diffInMinutes < 1440) { // 24 hours
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours} giờ trước`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `${days} ngày trước`
    }
  } catch {
    return 'Không xác định'
  }
}
</script>

<style scoped>
.q-item {
  min-height: 80px;
}

.q-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.rounded-borders {
  border-radius: 8px;
}
</style>
