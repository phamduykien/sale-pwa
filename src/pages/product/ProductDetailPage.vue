<template>
  <BaseDetailPage
    :title="pageTitle"
    :initial-data="productStore.currentProduct"
    :loading="isLoading"
    :is-readonly="isReadonlyForm"
    :form-mode="productStore.formMode"
    :on-submit-form="handleSubmit"
    :on-cancel-form="handleCancel"
    :on-switch-to-edit-mode="switchToEditMode"
    :can-edit="!!(productStore.currentProduct && productStore.currentProduct.inventory_item_id)"
    :entity-id="route.params.id"
  >
    <template #form-fields="{ formData, isReadonly }">
      <q-input
        v-model="formData.inventory_item_name"
        label="Tên sản phẩm"
        filled
        :readonly="isReadonly"
        :rules="[val => !!val || 'Vui lòng nhập tên sản phẩm']"
        class="col-12"
      />
      <q-input
        v-model.number="formData.unit_price"
        label="Đơn giá"
        filled
        type="number"
        v-numpad
        :readonly="isReadonly"
        :rules="[
          val => val !== null && val !== undefined || 'Vui lòng nhập đơn giá',
          val => val >= 0 || 'Đơn giá không thể âm'
        ]"
        class="col-12 col-sm-6"
      />
      <q-input
        v-model.number="formData.unit_price_after_tax"
        label="Giá sau thuế"
        filled
        type="number"
        v-numpad
        :readonly="isReadonly"
        :rules="[
          val => val !== null && val !== undefined || 'Vui lòng nhập giá sau thuế',
          val => val >= 0 || 'Giá sau thuế không thể âm'
        ]"
        class="col-12 col-sm-6"
      />
      <q-input
        v-model.number="formData.instock"
        label="Tồn kho"
        filled
        type="number"
        v-numpad="{ allowDecimal: false }"
        :readonly="isReadonly"
        :rules="[
          val => val !== null && val !== undefined || 'Vui lòng nhập tồn kho',
          val => val >= 0 || 'Số lượng tồn kho không thể âm'
        ]"
        class="col-12 col-sm-6"
      />
      <!-- TODO: Thêm các trường khác của sản phẩm ở đây -->
      <!-- Ví dụ:
      <q-input
        v-model="formData.sku_code"
        label="Mã SKU"
        filled
        :readonly="isReadonly"
        class="col-12 col-sm-6"
      />
      <q-select
        v-model="formData.unit_name"
        :options="['Cái', 'Hộp', 'Kg']"
        label="Đơn vị tính"
        filled
        :readonly="isReadonly"
        class="col-12 col-sm-6"
      />
      -->
    </template>
    
    <template #page-actions>
        <q-btn 
            v-if="productStore.formMode === 'view' && productStore.currentProduct && productStore.currentProduct.inventory_item_id"
            flat 
            round 
            icon="content_copy" 
            @click="duplicateProduct"
            title="Nhân bản"
        />
        <q-btn 
            v-if="productStore.formMode !== 'add' && productStore.currentProduct && productStore.currentProduct.inventory_item_id"
            flat 
            round 
            color="negative"
            icon="delete" 
            @click="confirmDeleteProduct"
            title="Xóa"
        />
    </template>
  </BaseDetailPage>
</template>

<script setup>
import { onMounted, computed } from 'vue'; // Bỏ ref và watch
import { useRoute, useRouter } from 'vue-router';
import { useProductStore } from '../../stores/product';
import { EDIT_MODE } from 'src/constants';
import BaseDetailPage from 'src/layouts/bases/BaseDetailPage.vue';
import { useQuasar } from 'quasar';

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const $q = useQuasar();

// Các computed properties để truyền vào BaseDetailPage
const pageTitle = computed(() => {
  if (productStore.formMode === 'add') return 'Thêm hàng hóa';
  if (productStore.formMode === 'edit') return 'Sửa hàng hóa';
  if (productStore.formMode === 'duplicate') return 'Nhân bản hàng hóa'; // Thực ra duplicate sẽ set mode là 'add'
  return productStore.currentProduct?.inventory_item_name || 'Chi tiết hàng hóa';
});

const isLoading = computed(() => productStore.loadingDetail);
const isReadonlyForm = computed(() => productStore.isReadonly);

// Logic onMounted để fetch hoặc set up item
onMounted(async () => {
  const productId = route.params.id;
  const modeParam = route.query.mode || (productId && productId !== 'add' ? 'view' : 'add');

  if (modeParam === 'add' || productId === 'add') {
    productStore.setProductForCreate({
      inventory_item_name: '',
      unit_price: null,
      unit_price_after_tax: null,
      instock: 0,
      // Các giá trị mặc định khác
    });
  } else if (productId) {
    await productStore.fetchProductById(productId); // Luôn fetch để có dữ liệu mới nhất
    if (productStore.currentProduct) {
      if (modeParam === 'edit') {
        productStore.setProductForEdit(productStore.currentProduct);
      } else if (modeParam === 'duplicate') {
        productStore.setProductForDuplicate(productStore.currentProduct);
      } else {
        productStore.setViewMode();
      }
    } else {
      // Không tìm thấy sản phẩm, có thể điều hướng về trang danh sách hoặc trang lỗi
      router.push({ name: 'products' });
    }
  }
});

// Hàm xử lý submit, được truyền vào BaseDetailPage
const handleSubmit = async (formDataFromBase) => {
  // Gán State nếu cần
  if (productStore.formMode === 'edit' && formDataFromBase.inventory_item_id) {
     formDataFromBase.State = EDIT_MODE.Edit;
  } else if (productStore.formMode === 'add') { // Bao gồm cả duplicate
     formDataFromBase.State = EDIT_MODE.New;
     // Xóa id nếu là duplicate và id đó không phải là id thật
     if (formDataFromBase.inventory_item_id && productStore.formMode === 'duplicate') {
        // Nếu ID của item gốc được giữ lại cho duplicate, cần xóa nó ở đây
        // Hoặc logic setItemForDuplicate trong store đã xử lý việc này
     }
  }
  
  // Cập nhật currentItem trong store trước khi gọi save
  productStore.currentItem = { ...formDataFromBase };

  const savedProduct = await productStore.saveProduct();
  if (savedProduct) {
    if (savedProduct.inventory_item_id) {
      // Chuyển sang view mode của sản phẩm vừa lưu
      router.push(`/product/${savedProduct.inventory_item_id}?mode=view`);
    } else {
      router.push({ name: 'products' }); // Fallback nếu không có ID
    }
  }
  // Xử lý lỗi đã được thực hiện trong store/composable
};

const handleCancel = () => {
  // Quyết định điều hướng khi hủy
  // Nếu đang view, có thể không làm gì hoặc quay lại
  // Nếu đang add/edit, quay lại trang danh sách hoặc trang view trước đó
  if (productStore.formMode === 'edit' && productStore.currentProduct?.inventory_item_id) {
    router.push(`/product/${productStore.currentProduct.inventory_item_id}?mode=view`);
  } else {
    router.push({ name: 'products' });
  }
};

const switchToEditMode = () => {
  if (productStore.currentProduct) {
    productStore.setProductForEdit(productStore.currentProduct);
  }
};

const duplicateProduct = () => {
    if (productStore.currentProduct) {
        // Chuyển sang trang add với query param để biết là duplicate
        // Hoặc set mode trong store và điều hướng
        productStore.setProductForDuplicate(productStore.currentProduct);
        // BaseDetailPage sẽ nhận formMode mới và initialData mới (đã xóa ID)
        // Có thể cần điều hướng đến một URL mới dạng /product/add?fromDuplicate=true
        // hoặc chỉ thay đổi mode và để BaseDetailPage tự cập nhật
        // Hiện tại, setProductForDuplicate đã set formMode = 'add'
        // và currentItem đã được cập nhật.
        // Chúng ta có thể muốn điều hướng đến /product/add để URL rõ ràng hơn
        router.push('/product/add?mode=duplicate_init'); // Một mode tạm để onMounted của trang add biết là duplicate
                                                    // Hoặc onMounted sẽ đọc formMode từ store
    }
};

const confirmDeleteProduct = () => {
    if (!productStore.currentProduct || !productStore.currentProduct.inventory_item_id) return;
    $q.dialog({
        title: 'Xác nhận xóa',
        message: `Bạn có chắc chắn muốn xóa "${productStore.currentProduct.inventory_item_name}" không?`,
        persistent: true,
        ok: { label: 'Xóa', color: 'negative', flat: false },
        cancel: { label: 'Hủy', color: 'grey', flat: false }
    }).onOk(async () => {
        await productStore.deleteProduct(productStore.currentProduct.inventory_item_id);
        router.push({ name: 'products' }); // Quay về danh sách sau khi xóa
    });
};

</script>
