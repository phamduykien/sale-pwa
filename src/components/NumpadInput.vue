<template>
  <div class="numpad-input column items-center q-pa-sm">
    <q-input
      v-model="displayValue"
      filled
      readonly
      dense
      class="q-mb-sm full-width numpad-display"
      input-class="text-right"
    />
    <div class="row q-gutter-sm full-width">
      <q-btn label="7" @click="appendNumber('7')" class="col numpad-btn" />
      <q-btn label="8" @click="appendNumber('8')" class="col numpad-btn" />
      <q-btn label="9" @click="appendNumber('9')" class="col numpad-btn" />
      <q-btn icon="backspace" @click="backspace" color="grey-7" class="col numpad-btn" aria-label="Xóa lùi" />
    </div>
    <div class="row q-gutter-sm full-width">
      <q-btn label="4" @click="appendNumber('4')" class="col numpad-btn" />
      <q-btn label="5" @click="appendNumber('5')" class="col numpad-btn" />
      <q-btn label="6" @click="appendNumber('6')" class="col numpad-btn" />
      <q-btn label="C" @click="clearInput" color="amber-7" class="col numpad-btn" aria-label="Xóa hết" />
    </div>
    <div class="row q-gutter-sm full-width">
      <q-btn label="1" @click="appendNumber('1')" class="col numpad-btn" />
      <q-btn label="2" @click="appendNumber('2')" class="col numpad-btn" />
      <q-btn label="3" @click="appendNumber('3')" class="col numpad-btn" />
      <q-btn label="000" @click="appendZeros('000')" class="col numpad-btn" />
    </div>
    <div class="row q-gutter-sm full-width">
      <q-btn icon="close" @click="cancel" color="grey-7" class="col numpad-btn" aria-label="Hủy" />
      <q-btn label="0" @click="appendNumber('0')" class="col numpad-btn" /> 
      <q-btn label="." @click="appendDecimal" class="col numpad-btn" :disable="!allowDecimal || hasDecimal" />
      <q-btn icon="check" @click="confirm" color="primary" class="col numpad-btn" aria-label="Xác nhận" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits } from 'vue'

const props = defineProps({
  modelValue: {
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

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const internalValue = ref('')

watch(() => props.modelValue, (newValue) => {
  internalValue.value = String(newValue || '')
}, { immediate: true })

const displayValue = computed(() => {
  return internalValue.value
})

const hasDecimal = computed(() => internalValue.value.includes('.'))

const appendNumber = (numStr) => {
  if (props.maxLength && internalValue.value.length >= props.maxLength) {
    return
  }
  internalValue.value += numStr
  emit('update:modelValue', internalValue.value)
}

const appendZeros = (zerosStr) => {
  if (props.maxLength && (internalValue.value.length + zerosStr.length) > props.maxLength) {
    return; 
  }
  if (internalValue.value === '' && zerosStr === '000') return;
  if (internalValue.value === '0' && zerosStr === '000') return;

  internalValue.value += zerosStr
  emit('update:modelValue', internalValue.value)
}

const appendDecimal = () => {
  if (props.allowDecimal && !hasDecimal.value) {
    if (props.maxLength && internalValue.value.length >= props.maxLength) {
      return
    }
    if (internalValue.value === '') {
      internalValue.value = '0.'
    } else {
      internalValue.value += '.'
    }
    emit('update:modelValue', internalValue.value)
  }
}

const backspace = () => {
  if (internalValue.value.length > 0) {
    internalValue.value = internalValue.value.slice(0, -1)
    emit('update:modelValue', internalValue.value)
  }
}

const clearInput = () => {
  internalValue.value = ''
  emit('update:modelValue', internalValue.value)
}

const confirm = () => {
  emit('confirm', internalValue.value)
}

const cancel = () => {
  emit('cancel')
}

</script>

<style scoped>
.numpad-input {
  max-width: 300px; 
  margin: auto;
}
.numpad-display {
  font-size: 1.5em;
  height: 50px;
}
.numpad-btn {
  flex-grow: 1;
  height: 50px; 
  font-size: 1.1em;
  padding: 0; /* Loại bỏ padding mặc định của q-btn nếu cần */
  min-width: 0; /* Cho phép nút co lại */
}
.row.full-width .col.numpad-btn {
  /* Đảm bảo các nút trong hàng chiếm không gian bằng nhau */
  /* Không cần flex-basis cụ thể nếu đã có col và flex-grow: 1 */
}

/* Bỏ các style cũ cho hàng cuối cùng nếu không cần thiết nữa */
/*
.row:last-child .numpad-btn:nth-child(1) { 
  flex-basis: 23%; 
  flex-grow: 1;
}
.row:last-child .numpad-btn:nth-child(2) { 
  flex-basis: 23%;
  flex-grow: 1;
}
.row:last-child .numpad-btn:nth-child(3) { 
  flex-basis: 23%;
  flex-grow: 1;
}
.row:last-child .numpad-btn:nth-child(4) { 
  flex-basis: 23%;
  flex-grow: 1;
}
*/
</style>
