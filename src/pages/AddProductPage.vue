<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-lg">
      <q-btn
        icon="arrow_back"
        flat
        round
        dense
        class="q-mr-sm"
        @click="$router.push('/products')"
      />
      <div class="text-h5 text-weight-bold">Thêm hàng hóa mới</div>
    </div>

    <q-form @submit="onSubmit" class="q-gutter-md" style="max-width: 500px">
      <!-- Tên sản phẩm -->
      <q-input
        v-model="form.name"
        label="Tên sản phẩm *"
        :rules="[val => !!val || 'Vui lòng nhập tên sản phẩm']"
      />

      <!-- Giá -->
      <q-input
        v-model.number="form.price"
        label="Giá (VNĐ) *"
        type="number"
        :rules="[
          val => !!val || 'Vui lòng nhập giá',
          val => val > 0 || 'Giá phải lớn hơn 0'
        ]"
      />

      <!-- Danh mục -->
      <q-select
        v-model="form.categoryId"
        :options="categoryOptions"
        label="Danh mục *"
        :rules="[val => !!val || 'Vui lòng chọn danh mục']"
      />

      <!-- Mô tả -->
      <q-input
        v-model="form.description"
        label="Mô tả"
        type="textarea"
      />

      <!-- Hình ảnh -->
      <q-file
        v-model="form.image"
        label="Hình ảnh sản phẩm"
        accept=".jpg,.jpeg,.png"
        :rules="[val => !val || val.size <= 2097152 || 'Kích thước ảnh tối đa 2MB']"
      >
        <template v-slot:prepend>
          <q-icon name="attach_file" />
        </template>
      </q-file>

      <!-- Preview ảnh -->
      <div v-if="imagePreview" class="q-mt-sm">
        <q-img
          :src="imagePreview"
          style="max-width: 200px"
          class="rounded-borders"
        />
      </div>

      <!-- Buttons -->
      <div class="row justify-end q-gutter-sm q-mt-lg">
        <q-btn
          label="Hủy"
          color="grey"
          @click="$router.push('/products')"
          :disable="loading"
          flat
        />
        <q-btn
          label="Lưu"
          color="primary"
          type="submit"
          :loading="loading"
        />
      </div>
    </q-form>

    <!-- Loading overlay -->
    <q-inner-loading :showing="loading">
      <q-spinner size="50px" color="primary" />
    </q-inner-loading>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from 'src/stores/product'
import { useQuasar } from 'quasar'

const router = useRouter()
const productStore = useProductStore()
const $q = useQuasar()

const loading = ref(false)
const imagePreview = ref(null)

const form = ref({
  name: '',
  price: null,
  categoryId: null,
  description: '',
  image: null
})

const categoryOptions = computed(() => {
  return productStore.categories.map(category => ({
    label: category.name,
    value: category.id
  }))
})

onMounted(async () => {
  if (productStore.categories.length === 0) {
    await productStore.fetchCategories()
  }
})

// Xử lý preview ảnh khi chọn file
watch(() => form.value.image, (newFile) => {
  if (newFile) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
    }
    reader.readAsDataURL(newFile)
  } else {
    imagePreview.value = null
  }
})

async function onSubmit() {
  try {
    loading.value = true
    
    // Chuẩn bị form data để upload file
    const formData = new FormData()
    formData.append('name', form.value.name)
    formData.append('price', form.value.price)
    formData.append('categoryId', form.value.categoryId)
    formData.append('description', form.value.description || '')
    if (form.value.image) {
      formData.append('image', form.value.image)
    }

    await productStore.addProduct(formData)
    
    $q.notify({
      type: 'positive',
      message: 'Thêm sản phẩm thành công!'
    })

    router.push('/products')
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Có lỗi xảy ra khi thêm sản phẩm'
    })
  } finally {
    loading.value = false
  }
}
</script>
