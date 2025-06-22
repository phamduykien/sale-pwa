<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h5 text-weight-bold">{{ title }}</div>
        <slot name="page-actions">
          <!-- Ví dụ: Nút nhân bản, xóa có thể đặt ở đây -->
        </slot>
      </div>

      <q-form @submit.prevent="onSubmit" class="q-gutter-md">
        <slot name="form-fields" :form-data="formData" :is-readonly="isReadonly"></slot>

        <div class="row q-gutter-sm justify-end q-mt-lg">
          <q-btn
            label="Hủy"
            color="grey"
            @click="onCancel"
            no-caps
          />
          <q-btn
            v-if="!isReadonly"
            type="submit"
            :label="submitButtonLabel"
            color="primary"
            :loading="loading"
            no-caps
          />
          <q-btn
            v-if="isReadonly && canEdit"
            label="Sửa"
            color="secondary"
            @click="onEditClick"
            no-caps
          />
          <slot name="additional-actions" :form-data="formData" :is-readonly="isReadonly"></slot>
        </div>
      </q-form>
    </div>
  </q-page>
</template>

<script setup>
import { defineProps, defineEmits, computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  // currentItem từ store/composable, dùng để khởi tạo formData
  initialData: {
    type: Object,
    default: () => ({}),
  },
  loading: {
    type: Boolean,
    default: false,
  },
  isReadonly: { // Trạng thái readonly của form, thường được quản lý bởi formMode
    type: Boolean,
    default: true,
  },
  formMode: { // 'view', 'add', 'edit'
    type: String,
    default: 'view',
  },
  onSubmitForm: { // Hàm sẽ được gọi khi form được submit
    type: Function,
    required: true,
  },
  onCancelForm: { // Hàm được gọi khi nhấn nút Hủy (thường là điều hướng)
    type: Function,
    default: null,
  },
  onSwitchToEditMode: { // Hàm được gọi khi nhấn nút Sửa (để component cha đổi formMode)
    type: Function,
    default: null
  },
  canEdit: { // Prop để kiểm soát việc hiển thị nút "Sửa"
    type: Boolean,
    default: true, // Mặc định là có thể sửa nếu ở chế độ view
  },
  entityId: { // ID của entity, dùng để kiểm tra xem có phải là view của một item đã tồn tại không
    type: [String, Number, null],
    default: null
  }
});

const emit = defineEmits(['submit', 'cancel', 'edit']);

const router = useRouter();

// formData là bản sao của initialData để component này có thể chỉnh sửa mà không ảnh hưởng trực tiếp đến store
const formData = ref({});

watch(() => props.initialData, (newData) => {
  formData.value = newData ? JSON.parse(JSON.stringify(newData)) : {};
}, { immediate: true, deep: true });


const submitButtonLabel = computed(() => {
  if (props.formMode === 'add' || props.formMode === 'duplicate') return 'Thêm';
  if (props.formMode === 'edit') return 'Cất';
  return 'Lưu'; // Mặc định
});

const onSubmit = () => {
  // Truyền dữ liệu form hiện tại ra ngoài để xử lý lưu trữ
  emit('submit', JSON.parse(JSON.stringify(formData.value)));
};

const onCancel = () => {
  if (props.onCancelForm) {
    props.onCancelForm();
  } else {
    // Mặc định quay lại trang trước hoặc trang danh sách
    // Cần một cách tốt hơn để xác định trang danh sách (ví dụ: props.listRouteName)
    if (window.history.length > 1) {
      router.go(-1);
    } else {
      router.push('/'); // Fallback
    }
  }
  emit('cancel');
};

const onEditClick = () => {
  if (props.onSwitchToEditMode) {
    props.onSwitchToEditMode();
  }
  emit('edit');
};

</script>

<style scoped>
/* Style chung cho BaseDetailPage nếu cần */
</style>
