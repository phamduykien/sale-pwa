<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="text-h5 text-weight-bold q-mb-lg">Tài khoản của tôi</div>

    <!-- User info card -->
    <q-card flat bordered class="q-mb-lg">
      <q-card-section class="text-center q-pa-lg">
        <q-avatar size="80px" color="primary" text-color="white" class="q-mb-md">
          <q-icon name="person" size="40px" />
        </q-avatar>
        <!-- Hiển thị thông tin người dùng và nút dựa trên trạng thái đăng nhập -->
        <div class="text-h6 text-weight-medium">{{ userDisplayName }}</div>
        <div class="text-body2 text-grey-6">{{ userStatus }}</div>

        <div v-if="isLoggedIn" class="q-mt-lg">
          <q-btn
            color="negative"
            label="Đăng xuất"
            icon="logout"
            @click="handleLogout"
            unelevated
            class="full-width"
          />
        </div>
        <div v-else class="q-mt-lg q-gutter-sm">
          <q-btn
            color="primary"
            label="Đăng nhập"
            icon="login"
            @click="goToLogin" 
            unelevated
            class="col-auto"
          />
          <q-btn
            color="secondary"
            label="Đăng ký"
            icon="person_add"
            @click="showRegisterDialog" 
            outline
            class="col-auto"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Menu items -->
    <q-list bordered>
      <q-item clickable @click="showComingSoon('Đơn hàng của tôi')">
        <q-item-section avatar>
          <q-icon name="shopping_bag" color="primary" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Đơn hàng của tôi</q-item-label>
          <q-item-label caption>Xem lịch sử đặt hàng</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" />
        </q-item-section>
      </q-item>

      <q-separator inset="item" />

      <q-item clickable @click="showComingSoon('Địa chỉ giao hàng')">
        <q-item-section avatar>
          <q-icon name="location_on" color="primary" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Địa chỉ giao hàng</q-item-label>
          <q-item-label caption>Quản lý địa chỉ nhận hàng</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" />
        </q-item-section>
      </q-item>

      <q-separator inset="item" />

      <q-item clickable @click="showComingSoon('Phương thức thanh toán')">
        <q-item-section avatar>
          <q-icon name="payment" color="primary" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Phương thức thanh toán</q-item-label>
          <q-item-label caption>Quản lý thẻ và ví điện tử</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" />
        </q-item-section>
      </q-item>

      <q-separator inset="item" />

      <q-item clickable @click="showComingSoon('Thông báo')">
        <q-item-section avatar>
          <q-icon name="notifications" color="primary" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Thông báo</q-item-label>
          <q-item-label caption>Cài đặt thông báo khuyến mãi</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" />
        </q-item-section>
      </q-item>

      <q-separator inset="item" />

      <q-item clickable @click="showComingSoon('Hỗ trợ khách hàng')">
        <q-item-section avatar>
          <q-icon name="help" color="primary" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Hỗ trợ khách hàng</q-item-label>
          <q-item-label caption>Liên hệ với chúng tôi</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" />
        </q-item-section>
      </q-item>

      <q-separator inset="item" />

      <q-item clickable @click="showAppInfo">
        <q-item-section avatar>
          <q-icon name="info" color="primary" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Về ứng dụng</q-item-label>
          <q-item-label caption>Thông tin phiên bản</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" />
        </q-item-section>
      </q-item>

      <q-separator inset="item" />

      <q-item clickable @click="testCamera">
        <q-item-section avatar>
          <q-icon name="photo_camera" color="primary" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Test Camera</q-item-label>
          <q-item-label caption>Kiểm tra truy cập camera</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" />
        </q-item-section>
      </q-item>

      <q-separator inset="item" />

      <q-item clickable @click="testMicrophone">
        <q-item-section avatar>
          <q-icon name="mic" color="primary" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Test Mic & Ghi Âm</q-item-label>
          <q-item-label caption>Kiểm tra micro và ghi âm giọng nói</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" />
        </q-item-section>
      </q-item>
      
      <q-separator inset="item" />

      <q-item clickable @click="forceReloadApp">
        <q-item-section avatar>
          <q-icon name="refresh" color="primary" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Làm mới ứng dụng</q-item-label>
          <q-item-label caption>Tải lại toàn bộ ứng dụng và dữ liệu mới nhất</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" />
        </q-item-section>
      </q-item>
    </q-list>

    <!-- Dialog hiển thị camera -->
    <q-dialog v-model="showCameraDialog" persistent>
      <q-card style="width: 500px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Camera Test</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup @click="stopCameraStream" />
        </q-card-section>
        <q-card-section>
          <video ref="videoElement" autoplay playsinline style="width: 100%; border: 1px solid #ccc;"></video>
          <div v-if="cameraError" class="text-negative q-mt-sm">{{ cameraError }}</div>
        </q-card-section>
        <q-card-actions align="right" v-if="videoDevices.length > 1">
          <q-btn flat label="Chuyển Camera" @click="switchCamera" icon="cameraswitch" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog Test Mic & Ghi Âm -->
    <q-dialog v-model="showMicDialog" persistent>
      <q-card style="width: 500px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Mic & Ghi Âm Test</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup @click="stopRecordingAndStream" />
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <div v-if="micError" class="text-negative">{{ micError }}</div>
          <div v-if="isRecording" class="text-red">
            <q-spinner-puff color="red" size="1em" class="q-mr-sm" />
            Đang ghi âm... ({{ recordingTime }}s)
          </div>
          <div v-else-if="recordedAudioUrl">
            Đã ghi âm.
          </div>
          <div v-else>
            Nhấn nút để bắt đầu ghi âm.
          </div>

          <audio v-if="recordedAudioUrl" :src="recordedAudioUrl" controls style="width: 100%;"></audio>
          
          <div class="row justify-around q-mt-md">
            <q-btn 
              :label="isRecording ? 'Dừng Ghi' : 'Bắt đầu Ghi'" 
              :color="isRecording ? 'negative' : 'primary'"
              @click="toggleRecording" 
              :disable="!!micError || (isRecording && recordingTime < 1)"
            />
            <q-btn 
              label="Gửi Âm Thanh (WAV)" 
              color="secondary" 
              @click="sendAudio" 
              :disable="!recordedAudioBlob || isSendingAudio"
              :loading="isSendingAudio"
            />
          </div>
           <div v-if="transcribedText" class="q-mt-md">
            <strong>Văn bản được trích xuất:</strong>
            <p>{{ transcribedText }}</p>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>


    <!-- Cart summary -->
    <q-card v-if="!cartStore.cartIsEmpty" flat bordered class="q-mt-lg">
      <q-card-section>
        <div class="text-subtitle1 text-weight-medium q-mb-sm">
          <q-icon name="shopping_cart" class="q-mr-sm" />
          Giỏ hàng hiện tại
        </div>
        <div class="row justify-between">
          <span>{{ cartStore.totalItems }} sản phẩm</span>
          <span class="text-weight-bold text-primary">{{ formatPrice(cartStore.totalPrice) }}</span>
        </div>
        <q-btn
          color="primary"
          label="Xem giỏ hàng"
          @click="$router.push('/cart')"
          class="full-width q-mt-md"
          unelevated
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue' // Thêm ref, onMounted, computed, onUnmounted
import { useRouter } from 'vue-router' // Thêm useRouter
import { useCartStore } from 'src/stores/cart'
import { Dialog } from 'quasar' // Thêm useQuasar, không cần $q nữa
import { showNotification } from 'src/boot/notify-service'


const cartStore = useCartStore()
const router = useRouter() // Khởi tạo router
// const $q = useQuasar() // Không cần dùng $q.notify nữa

// Camera refs and state
const showCameraDialog = ref(false)
const videoElement = ref(null)
let cameraStream = null
const cameraError = ref('')
const videoDevices = ref([])
const currentVideoDeviceIndex = ref(0)

// Microphone and Recording refs and state
const showMicDialog = ref(false)
let micStream = null
let mediaRecorder = null
const audioChunks = ref([])
const recordedAudioUrl = ref('')
const recordedAudioBlob = ref(null)
const isRecording = ref(false)
const micError = ref('')
const recordingTime = ref(0)
let recordingInterval = null
const isSendingAudio = ref(false)
const transcribedText = ref('')


// Trạng thái đăng nhập
const authToken = ref(localStorage.getItem('authToken')) // Key này đã đúng theo yêu cầu mới

const isLoggedIn = computed(() => !!authToken.value)

// Cập nhật authToken khi component được mounted
onMounted(() => {
  authToken.value = localStorage.getItem('authToken') // Key này đã đúng
  // Lắng nghe sự kiện storage để cập nhật nếu token thay đổi ở tab khác
  window.addEventListener('storage', handleStorageChange);
})

// Xóa event listener khi component unmounted
onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange);
});

const handleStorageChange = (event) => {
  if (event.key === 'authToken') { // Key này đã đúng
    authToken.value = event.newValue;
  }
};

const userDisplayName = computed(() => {
  // TODO: Trong tương lai, có thể giải mã token hoặc gọi API để lấy tên người dùng thực sự
  return isLoggedIn.value ? 'Người dùng đã đăng nhập' : 'Khách hàng';
});

const userStatus = computed(() => {
  return isLoggedIn.value ? 'Đã đăng nhập' : 'Chưa đăng nhập';
});

const handleLogout = () => {
  localStorage.removeItem('authToken') // Key này đã đúng
  // Bỏ dòng authToken.value = null để tránh giao diện cập nhật trước khi chuyển trang.
  // Khi trang được điều hướng đi, component này sẽ unmount,
  // và nếu quay lại, onMounted sẽ đọc lại trạng thái đúng từ localStorage.
  
  // (Tùy chọn) Reset user store nếu có
  // Ví dụ: userStore.clearUser() // Giả sử có userStore

  showNotification('success', 'Đăng xuất thành công!')
  router.push('/login')
}

const goToLogin = () => {
  router.push('/login')
}

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}



function showRegisterDialog() {
  Dialog.create({
    title: 'Đăng ký',
    message: 'Tính năng đăng ký sẽ được phát triển trong phiên bản tiếp theo.',
    ok: {
      label: 'Đã hiểu',
      color: 'primary',
      unelevated: true
    }
  })
}

function showComingSoon(feature) {
  Dialog.create({
    title: feature,
    message: 'Tính năng này sẽ được phát triển trong phiên bản tiếp theo.',
    ok: {
      label: 'Đã hiểu',
      color: 'primary',
      unelevated: true
    }
  })
}

function showAppInfo() {
  Dialog.create({
    title: 'Về ứng dụng SalePWA',
    message: `
      <div>
        <p><strong>Phiên bản:</strong> 1.0.0</p>
        <p><strong>Framework:</strong> Quasar Framework + Vue 3</p>
        <p><strong>Công nghệ:</strong> Progressive Web App (PWA)</p>
        <p><strong>Mô tả:</strong> Ứng dụng bán hàng trực tuyến với trải nghiệm mượt mà trên mọi thiết bị.</p>
      </div>
    `,
    html: true,
    ok: {
      label: 'Đóng',
      color: 'primary',
      unelevated: true
    }
  })
}

// --- Camera Logic ---
async function getCameraDevices() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    videoDevices.value = devices.filter(device => device.kind === 'videoinput');
  } catch (err) {
    console.error("Lỗi khi liệt kê thiết bị media:", err);
    videoDevices.value = [];
  }
}

async function startCameraStream(deviceId = null) {
  if (cameraStream) {
    stopCameraStream(); // Dừng stream cũ trước khi bắt đầu stream mới
  }
  cameraError.value = '';
  const constraints = {
    video: deviceId ? { deviceId: { exact: deviceId } } : true
  };

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
    if (videoElement.value) {
      videoElement.value.srcObject = cameraStream;
      // Sau khi stream bắt đầu, cập nhật lại danh sách thiết bị nếu chưa có
      if (videoDevices.value.length === 0) {
        await getCameraDevices();
      }
      // Tìm index của deviceId hiện tại nếu có
      if (deviceId) {
        const currentIndex = videoDevices.value.findIndex(d => d.deviceId === deviceId);
        if (currentIndex !== -1) {
          currentVideoDeviceIndex.value = currentIndex;
        }
      } else if (cameraStream && videoDevices.value.length > 0) {
        // Nếu không có deviceId cụ thể, cố gắng tìm deviceId từ stream hiện tại
        const currentTrack = cameraStream.getVideoTracks()[0];
        if (currentTrack) {
          const currentSettings = currentTrack.getSettings();
          const currentIndex = videoDevices.value.findIndex(d => d.deviceId === currentSettings.deviceId);
          if (currentIndex !== -1) {
            currentVideoDeviceIndex.value = currentIndex;
          } else {
             // Nếu không tìm thấy, có thể là camera mặc định không nằm trong list ban đầu (hiếm)
             // Hoặc list chưa được cập nhật đúng. Tạm thời set về 0.
            currentVideoDeviceIndex.value = 0;
          }
        }
      }
    }
  } catch (err) {
    console.error('Lỗi truy cập camera:', err);
    cameraError.value = `Không thể truy cập camera: ${err.name} - ${err.message}. Hãy kiểm tra quyền truy cập.`;
    showNotification('error', cameraError.value);
    // Không đóng dialog ngay
  }
}

async function testCamera() {
  videoDevices.value = []; // Reset danh sách thiết bị
  currentVideoDeviceIndex.value = 0;
  cameraError.value = ''; // Reset lỗi

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && navigator.mediaDevices.enumerateDevices) {
    await getCameraDevices(); // Đảm bảo lấy danh sách thiết bị XONG TRƯỚC KHI MỞ DIALOG
    
    showCameraDialog.value = true; // Mở dialog SAU KHI đã có danh sách thiết bị

    if (videoDevices.value.length > 0) {
      await startCameraStream(videoDevices.value[currentVideoDeviceIndex.value].deviceId);
    } else {
      // Nếu không có camera nào, thử yêu cầu camera mặc định
      await startCameraStream();
      if (!cameraStream) { // Nếu vẫn không có stream (ví dụ không có camera nào cả)
         cameraError.value = 'Không tìm thấy thiết bị camera nào.';
         showNotification('warning', cameraError.value);
      }
    }
  } else {
    cameraError.value = 'Trình duyệt không hỗ trợ API truy cập camera hoặc liệt kê thiết bị.';
    showNotification('error', cameraError.value);
    showCameraDialog.value = false;
  }
}

function stopCameraStream() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop())
    cameraStream = null
  }
  if (videoElement.value) {
    videoElement.value.srcObject = null
  }
  // Không đóng dialog ở đây, để người dùng tự đóng qua nút close
  // showCameraDialog.value = false; // Chỉ đóng nếu người dùng nhấn nút close
  // Reset danh sách thiết bị khi đóng hẳn dialog (nếu cần, hoặc để lại cho lần mở sau)
  // videoDevices.value = []; 
}

async function switchCamera() {
  if (videoDevices.value.length > 1) {
    currentVideoDeviceIndex.value = (currentVideoDeviceIndex.value + 1) % videoDevices.value.length;
    const nextDeviceId = videoDevices.value[currentVideoDeviceIndex.value].deviceId;
    await startCameraStream(nextDeviceId);
  }
}

// --- Microphone and Recording Logic ---
async function testMicrophone() {
  micError.value = ''
  isRecording.value = false
  recordedAudioUrl.value = ''
  recordedAudioBlob.value = null
  audioChunks.value = []
  recordingTime.value = 0
  transcribedText.value = ''
  showMicDialog.value = true

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Không cần làm gì với stream ở đây ngay, sẽ dùng khi bắt đầu ghi âm
      showNotification('info', 'Đã cấp quyền truy cập micro. Nhấn "Bắt đầu Ghi" để ghi âm.')
    } catch (err) {
      console.error('Lỗi truy cập micro:', err)
      micError.value = `Không thể truy cập micro: ${err.name} - ${err.message}. Hãy kiểm tra quyền truy cập.`
      showNotification('error', micError.value)
      // Không đóng dialog ngay để người dùng đọc lỗi
    }
  } else {
    micError.value = 'Trình duyệt không hỗ trợ API truy cập micro.'
    showNotification('error', micError.value)
    showMicDialog.value = false // Đóng dialog nếu API không được hỗ trợ
  }
}

function startRecording() {
  if (!micStream) {
    micError.value = 'Không có luồng micro để ghi âm. Vui lòng cấp quyền lại.'
    showNotification('error', micError.value)
    return
  }
  if (mediaRecorder && mediaRecorder.state === 'recording') return;

  audioChunks.value = [] // Reset chunks
  recordedAudioUrl.value = ''
  recordedAudioBlob.value = null
  transcribedText.value = ''

  const options = { mimeType: 'audio/webm' }; // Ưu tiên webm
  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    console.warn(`${options.mimeType} is not Supported! Falling back to default or audio/wav`);
    options.mimeType = 'audio/wav'; // Fallback nếu webm không được hỗ trợ
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.warn(`${options.mimeType} is not Supported! Falling back to default`);
      delete options.mimeType; // Để trình duyệt tự chọn
    }
  }

  try {
    mediaRecorder = new MediaRecorder(micStream, options)
    mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) { // Đảm bảo chunk có dữ liệu
        audioChunks.value.push(event.data)
      }
    }
    mediaRecorder.onstop = () => {
      if (audioChunks.value.length === 0) {
        console.warn("Không có audio chunks nào được ghi lại.");
        micError.value = "Không ghi được âm thanh. Vui lòng thử lại.";
        showNotification('error', micError.value);
        isRecording.value = false;
        clearInterval(recordingInterval);
        recordingTime.value = 0;
        return;
      }
      // Sử dụng mimeType đã được xác định ở trên, hoặc để trình duyệt tự quyết định nếu options.mimeType bị xóa
      const blobMimeType = mediaRecorder.mimeType || (options.mimeType || 'audio/webm');
      const audioBlob = new Blob(audioChunks.value, { type: blobMimeType })
      recordedAudioBlob.value = audioBlob
      recordedAudioUrl.value = URL.createObjectURL(audioBlob)
      isRecording.value = false
      clearInterval(recordingInterval)
      recordingTime.value = 0
    }
    mediaRecorder.start()
    isRecording.value = true
    recordingTime.value = 0
    recordingInterval = setInterval(() => {
      recordingTime.value++
    }, 1000)
    showNotification('info', 'Bắt đầu ghi âm...')
  } catch (e) {
    console.error('Lỗi khi bắt đầu MediaRecorder:', e)
    micError.value = 'Không thể bắt đầu ghi âm: ' + e.message
    showNotification('error', micError.value)
    isRecording.value = false
    if(recordingInterval) clearInterval(recordingInterval)
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop()
    // Stream sẽ được dừng trong stopRecordingAndStream khi đóng dialog
    showNotification('info', 'Đã dừng ghi âm.')
  }
  if(recordingInterval) clearInterval(recordingInterval)
  // isRecording sẽ được set thành false trong mediaRecorder.onstop
}

function toggleRecording() {
  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

function stopRecordingAndStream() {
  if (isRecording.value) {
    stopRecording()
  }
  if (micStream) {
    micStream.getTracks().forEach(track => track.stop())
    micStream = null
  }
  if (recordingInterval) clearInterval(recordingInterval)
  // showMicDialog.value = false; // Để người dùng tự đóng
}

async function sendAudio() {
  if (!recordedAudioBlob.value) {
    showNotification('warning', 'Không có file ghi âm để gửi.');
    return;
  }

  isSendingAudio.value = true;
  transcribedText.value = ''; // Xóa kết quả cũ
  showNotification('info', 'Đang gửi âm thanh và xử lý...');

  const formData = new FormData();
  // Đặt tên file dựa trên mimeType của blob
  const fileName = `recording.${recordedAudioBlob.value.type.split('/')[1] || 'webm'}`;
  formData.append('audio_file', recordedAudioBlob.value, fileName);

  try {
    // Đây là ví dụ, bạn cần thay thế bằng URL API thực tế của mình
    // const response = await fetch('YOUR_AI_SPEECH_TO_TEXT_API_ENDPOINT', {
    //   method: 'POST',
    //   body: formData,
    //   // Thêm headers nếu API yêu cầu, ví dụ API key
    //   // headers: { 'Authorization': 'Bearer YOUR_API_KEY' } 
    // });

    // GIẢ LẬP API RESPONSE
    await new Promise(resolve => setTimeout(resolve, 2000)); // Giả lập độ trễ mạng
    const response = { 
      ok: true, 
      json: async () => ({ transcript: "Đây là văn bản được trích xuất từ giọng nói của bạn." }) 
    };
    // KẾT THÚC GIẢ LẬP

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Lỗi không xác định từ server' }));
      throw new Error(`Lỗi server: ${response.status} - ${errorData.message || 'Không có thông tin lỗi'}`);
    }

    const result = await response.json();
    transcribedText.value = result.transcript || "Không trích xuất được văn bản.";
    showNotification('success', 'Đã nhận được văn bản trích xuất!');

  } catch (error) {
    console.error('Lỗi khi gửi âm thanh hoặc xử lý:', error);
    showNotification('error', `Lỗi: ${error.message}`);
    transcribedText.value = "Lỗi khi xử lý âm thanh.";
  } finally {
    isSendingAudio.value = false;
  }
}

async function forceReloadApp() {
  showNotification('info', 'Đang làm mới ứng dụng...');
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('Service Worker đã được hủy đăng ký:', registration);
      }
    }
    // Xóa cache (cách này có thể không xóa hết mọi thứ, tùy trình duyệt)
    if (window.caches) {
      const cacheNames = await window.caches.keys();
      await Promise.all(cacheNames.map(cacheName => window.caches.delete(cacheName)));
      console.log('Tất cả cache đã được xóa.');
    }
  } catch (error) {
    console.error('Lỗi khi cố gắng dọn dẹp Service Worker hoặc cache:', error);
    showNotification('warning', 'Không thể dọn dẹp Service Worker hoặc cache hoàn toàn, nhưng vẫn sẽ thử tải lại.');
  } finally {
    // Đợi một chút để các thao tác trên hoàn tất rồi mới reload
    setTimeout(() => {
      window.location.reload(true); // true để cố gắng bỏ qua cache của trình duyệt
    }, 500);
  }
}
</script>

<style scoped>
.q-item {
  padding: 16px;
}

.q-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}
</style>
