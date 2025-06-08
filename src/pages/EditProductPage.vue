<template>
  <q-page padding>
    <div class="q-pa-md">
      <h5 class="q-mt-none q-mb-md">Sửa hàng hóa</h5>

      <q-form @submit="onSubmit" class="q-gutter-md">
        <q-input
          v-model="form.inventory_item_name"
          label="Tên sản phẩm"
          filled
          :rules="[val => !!val || 'Vui lòng nhập tên sản phẩm']"
        />

        <q-input
          v-model.number="form.unit_price"
          label="Đơn giá"
          filled
          type="number"
          :rules="[
            val => !!val || 'Vui lòng nhập đơn giá',
            val => val > 0 || 'Đơn giá phải lớn hơn 0'
          ]"
        />

        <q-input
          v-model.number="form.unit_price_after_tax"
          label="Giá sau thuế"
          filled
          type="number"
           :rules="[
            val => !!val || 'Vui lòng nhập giá sau thuế',
            val => val > 0 || 'Giá sau thuế phải lớn hơn 0'
          ]"
        />

        

        <q-input
          v-model.number="form.instock"
          label="Tồn kho"
          filled
          type="number"
          :rules="[val => val >= 0 || 'Số lượng tồn kho không thể âm']"
        />

        <div class="row q-gutter-md justify-end">
          <q-btn
            label="Hủy"
            color="grey"
            :to="{ name: 'index' }"
            no-caps
          />
          <q-btn
            type="submit"
            label="Cất"
            color="primary"
            :loading="productStore.loading"
            no-caps
          />
        </div>
      </q-form>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue' // Xóa 'computed'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useProductStore } from '../stores/product'
import { InventoryItemService } from 'src/services/InventoryItemService' // Thêm import

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

const form = ref({
  inventory_item_name: '',
  unit_price: null,
  unit_price_after_tax: null,
  instock: null,
  // Thêm các trường khác có thể có trong productData để khởi tạo
})

// const categories = computed(() => productStore.categories) // ESLint: 'categories' is assigned a value but never used

onMounted(async () => {
  const productId = route.params.id // ID từ route có thể là string
  if (!productId) {
    $q.notify({ type: 'negative', message: 'Không tìm thấy ID sản phẩm.' })
    router.push('/') // Hoặc một trang lỗi/danh sách sản phẩm
    return
  }

  await productStore.fetchCategories() // Giữ lại để lấy danh sách danh mục

  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      $q.notify({ type: 'negative', message: 'Vui lòng đăng nhập để chỉnh sửa sản phẩm.' })
      router.push('/login') // Chuyển hướng đến trang đăng nhập nếu không có token
      return
    }

    const productData = await InventoryItemService.getInventoryItem(token, productId)
    // debugger // Xóa dòng này
    if (productData) {
      // Ánh xạ dữ liệu từ API vào form
      // Giả sử API trả về các trường tương ứng hoặc cần ánh xạ lại
      form.value = productData;
    } else {
      $q.notify({ type: 'negative', message: 'Không tìm thấy thông tin sản phẩm.' })
      router.push('/') // Hoặc trang danh sách sản phẩm
    }
  } catch (error) {
    console.error('Lỗi khi tải thông tin sản phẩm:', error)
    $q.notify({ type: 'negative', message: 'Lỗi khi tải thông tin sản phẩm. Vui lòng thử lại.' })
    router.push('/') // Hoặc trang danh sách sản phẩm
  }
})

async function onSubmit() {
  try {
    // Kiểm tra kết nối mạng
    if (!navigator.onLine) {
      // Lưu vào bộ nhớ tạm nếu không có kết nối
      const pendingUpdates = JSON.parse(localStorage.getItem('pendingProductUpdates') || '[]')
      pendingUpdates.push({
        id: route.params.id,
        ...form.value
      })
      localStorage.setItem('pendingProductUpdates', JSON.stringify(pendingUpdates))
      
      $q.notify({
        type: 'info',
        message: 'Đã lưu thay đổi vào bộ nhớ tạm. Sẽ đồng bộ khi có kết nối mạng.'
      })
    } else {
      // Nếu có kết nối, cập nhật trực tiếp
      await productStore.updateProduct({
        id: route.params.id,
        ...form.value
      })
      $q.notify({
        type: 'positive',
        message: 'Cập nhật sản phẩm thành công'
      })
    }
    
    router.push('/')
  } catch (error) { // ESLint: 'error' is defined but never used - Sửa: Thêm console.error
    console.error('Lỗi khi cập nhật sản phẩm:', error)
    $q.notify({
      type: 'negative',
      message: 'Có lỗi xảy ra khi cập nhật sản phẩm'
    })
  }
}

// Thêm event listener để kiểm tra khi có kết nối mạng trở lại
window.addEventListener('online', async () => {
  const pendingUpdates = JSON.parse(localStorage.getItem('pendingProductUpdates') || '[]')
  if (pendingUpdates.length > 0) {
    try {
      for (const update of pendingUpdates) {
        await productStore.updateProduct(update)
      }
      localStorage.removeItem('pendingProductUpdates')
      $q.notify({
        type: 'positive',
        message: 'Đã đồng bộ thành công các thay đổi'
      })
    } catch (error) { // ESLint: 'error' is defined but never used - Sửa: Thêm console.error
      console.error('Lỗi khi đồng bộ dữ liệu:', error)
      $q.notify({
        type: 'negative',
        message: 'Có lỗi xảy ra khi đồng bộ dữ liệu'
      })
    }
  }
})
</script>
