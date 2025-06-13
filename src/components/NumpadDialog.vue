<template>
  <q-dialog
    v-model="showDialog"
    position="bottom"
    :no-esc-dismiss="false" 
    @hide="onDialogHide"
  >
    <q-card style="width: 100%; max-width: 400px;" class="numpad-dialog-card">
      <q-card-section class="q-pa-none">
        <NumpadInput
          v-model="currentValue"
          :allow-decimal="allowDecimal"
          :max-length="maxLength"
          @confirm="handleConfirm"
          @cancel="handleCancel"
        />
      </q-card-section>
      <!-- Có thể thêm q-card-actions ở đây nếu muốn có nút Hủy riêng biệt ngoài NumpadInput -->
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'
import NumpadInput from './NumpadInput.vue'

const props = defineProps({
  modelValue: { // Dùng để điều khiển việc hiển thị dialog
    type: Boolean,
    default: false
  },
  initialValue: {
    type: [String, Number],
    default: ''
  },
  allowDecimal: {
    type: Boolean,
    default: true
  },
  maxLength: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'confirmed', 'cancelled', 'closed']) // Thêm 'cancelled'

const showDialog = ref(props.modelValue)
const currentValue = ref('')

watch(() => props.modelValue, (newValue) => {
  showDialog.value = newValue
  if (newValue) {
    currentValue.value = String(props.initialValue || '')
  }
})

watch(showDialog, (newValue) => {
  // Nếu dialog bị đóng từ bên ngoài (ví dụ, không phải do nút confirm)
  // thì cũng emit update:modelValue để đồng bộ
  if (props.modelValue && !newValue) {
    emit('update:modelValue', false)
    // emit('closed'); // Có thể emit sự kiện closed riêng nếu cần
  }
})

const handleConfirm = (value) => {
  emit('confirmed', value)
  showDialog.value = false // Tự động đóng dialog
  emit('update:modelValue', false) // Cập nhật lại prop để đóng dialog từ component cha
}

const handleCancel = () => {
  emit('cancelled') // Emit sự kiện riêng cho việc hủy
  showDialog.value = false
  emit('update:modelValue', false)
}

const onDialogHide = () => {
  // Khi dialog ẩn hoàn toàn, đảm bảo emit 'update:modelValue' nếu nó chưa được emit
  // và có thể emit sự kiện 'closed'
  if (props.modelValue) { // Nếu dialog được điều khiển là true nhưng đã ẩn
    emit('update:modelValue', false)
  }
  emit('closed', currentValue.value); // Gửi giá trị cuối cùng khi đóng, hoặc giá trị đã confirm
}

</script>

<style scoped>
.numpad-dialog-card {
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}
</style>
