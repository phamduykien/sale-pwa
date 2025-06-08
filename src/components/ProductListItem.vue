<template>
  <q-item-swipeable
    class="product-item q-pa-md"
    bordered
    @click="$router.push(`/product/${product.id}`)"
    @left="onEdit"
    left-content
  >
    <template v-slot:left>
      <div class="row items-center">
        <q-icon name="edit" color="info" size="md" class="q-ml-md" />
      </div>
    </template>

    <q-item-section side class="product-image-container">
      <q-img
        :src="product.image"
        :ratio="1"
        class="rounded-borders"
        fit="cover"
        style="width: 120px; height: 120px"
      >
        <template v-if="product.discount" v-slot:default>
          <div class="absolute-top-right bg-red text-white text-caption q-pa-xs">
            -{{ product.discount }}%
          </div>
        </template>
      </q-img>
    </q-item-section>

    <q-item-section>
      <q-item-label class="text-subtitle1 text-weight-medium ellipsis-2-lines">
        {{ product.name }}
      </q-item-label>
      <q-item-label caption lines="1" class="q-mt-sm">
        <div class="row items-center">
          <div class="text-h6 text-primary q-mr-sm">{{ formatPrice(product.price) }}</div>
          <div v-if="product.originalPrice" class="text-grey-6 text-caption text-strike">
            {{ formatPrice(product.originalPrice) }}
          </div>
        </div>
      </q-item-label>
      <q-item-label caption lines="1" class="q-mt-xs">
        <div class="row items-center">
          <q-rating
            :model-value="product.rating"
            size="xs"
            color="amber"
            readonly
          />
          <span class="q-ml-sm text-grey-6">({{ product.reviews || 0 }})</span>
        </div>
      </q-item-label>
    </q-item-section>
  </q-item-swipeable>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

function onEdit() {
  router.push(`/product/${props.product.id}/edit`)
}

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}
</script>

<style scoped>
.product-item {
  transition: all 0.3s ease;
}

.product-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
