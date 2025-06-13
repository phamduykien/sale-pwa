import { createApp, h } from 'vue'
import NumpadDialog from 'src/components/NumpadDialog.vue'
import { Quasar } from 'quasar' // Cần để truy cập $q.platform

// Biến toàn cục để giữ instance của app Vue cho dialog
let numpadApp = null
let numpadDialogWrapper = null

function mountDialog(el, binding) {
  if (numpadApp) {
    numpadApp.unmount()
    document.body.removeChild(numpadDialogWrapper)
    numpadApp = null
    numpadDialogWrapper = null
  }

  numpadDialogWrapper = document.createElement('div')
  document.body.appendChild(numpadDialogWrapper)

  // Dòng này không cần thiết và có thể không an toàn, $q cho platform check đã lấy ở mounted.
  // const { quasar } = el.__vueParentComponent.appContext.provides; 

  numpadApp = createApp({
    render() {
      return h(NumpadDialog, {
        modelValue: true, // Luôn hiển thị khi mount
        initialValue: (el.querySelector('input') || el).value || binding.value?.initialValue || '', // Lấy giá trị từ input thực sự
        allowDecimal: binding.value?.allowDecimal !== undefined ? binding.value.allowDecimal : true,
        maxLength: binding.value?.maxLength || null,
        onConfirmed: (newValue) => {
          const targetInput = el.querySelector('input') || el; // Tìm input thực sự
          targetInput.value = newValue
          // Dispatch input event để v-model của q-input cập nhật
          targetInput.dispatchEvent(new Event('input', { bubbles: true }))
          targetInput.dispatchEvent(new Event('change', { bubbles: true })) // Cho một số trường hợp
          
          // Tạm bỏ xử lý readonly
          // if (el._numpad_was_readonly_before === false || typeof el._numpad_was_readonly_before === 'undefined') {
          //   el.removeAttribute('readonly')
          // }
          numpadApp.unmount()
          document.body.removeChild(numpadDialogWrapper)
          numpadApp = null
        },
        onClosed: () => { // Xử lý khi dialog đóng mà không confirm (ví dụ: vuốt)
          // Tạm bỏ xử lý readonly
          // if (el._numpad_was_readonly_before === false || typeof el._numpad_was_readonly_before === 'undefined') {
          //   el.removeAttribute('readonly')
          // }
          if (numpadApp) { // Kiểm tra nếu app vẫn tồn tại
            numpadApp.unmount()
            document.body.removeChild(numpadDialogWrapper)
            numpadApp = null
          }
        },
        'onUpdate:modelValue': (val) => {
            // Xử lý khi modelValue của dialog thay đổi (ví dụ khi nó tự đóng)
            if (!val && numpadApp) { // Nếu dialog đóng
                // Tạm bỏ xử lý readonly
                //  if (el._numpad_was_readonly_before === false || typeof el._numpad_was_readonly_before === 'undefined') {
                //     el.removeAttribute('readonly')
                // }
                numpadApp.unmount()
                document.body.removeChild(numpadDialogWrapper)
                numpadApp = null
            }
        }
      })
    }
  })
  // Cung cấp Quasar instance cho NumpadDialog nếu nó sử dụng các component Quasar bên trong
  // Hoặc nếu NumpadInput sử dụng $q (mặc dù hiện tại không)
  numpadApp.use(Quasar, {}) 
  numpadApp.mount(numpadDialogWrapper)
}

const numpadDirectiveObject = { // Gán object directive cho một biến để có thể tham chiếu nội bộ 
  mounted(el, binding) {    
    const $q_instance = numpadDirectiveObject.$q; // Truy cập $q thông qua biến object
    
    if (!$q_instance || !$q_instance.platform) {
      console.error('Numpad Directive: Quasar $q instance or $q.platform not found. Numpad will not activate.');
      return;
    }
    
    const openNumpad = () => {
      if ($q_instance.platform.is.mobile) {
        // Tạm bỏ xử lý readonly
        // el._numpad_was_readonly_before = el.hasAttribute('readonly');
        // el.setAttribute('readonly', true)
        mountDialog(el, binding)
      }
    }

    // Gắn sự kiện click hoặc focus tùy theo loại input
    // Với q-input, sự kiện click vào vùng input thường kích hoạt focus
    // Nếu q-input có input con bên trong, cần đảm bảo sự kiện được gắn đúng
    const inputElement = el.querySelector('input') || el; // Tìm input thực sự hoặc dùng el
    
    inputElement.addEventListener('focus', openNumpad)
    // Lưu trữ hàm xử lý để có thể gỡ bỏ sau này
    el._numpad_open_handler = openNumpad 
  },
  beforeUnmount(el) {
    const inputElement = el.querySelector('input') || el;
    if (el._numpad_open_handler) {
      inputElement.removeEventListener('focus', el._numpad_open_handler)
      delete el._numpad_open_handler
    }
    // Dọn dẹp dialog nếu nó vẫn còn mount (trường hợp hiếm)
    if (numpadApp) {
      numpadApp.unmount()
      if (numpadDialogWrapper && numpadDialogWrapper.parentNode) {
        document.body.removeChild(numpadDialogWrapper)
      }
      numpadApp = null
      numpadDialogWrapper = null
    }
  }
};

export default numpadDirectiveObject; // Export object đã được định nghĩa
