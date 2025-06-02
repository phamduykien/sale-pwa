<template>
  <q-card class="stat-card q-pa-md">
    <div class="row items-center no-wrap">
      <div class="col">
        <div class="text-caption text-grey">{{ title }}</div>
        <div class="text-h6 q-mt-sm text-weight-bold">{{ value }}</div>
        <div 
          class="text-caption q-mt-sm"
          :class="trend > 0 ? 'text-positive' : 'text-negative'"
        >
          <q-icon
            :name="trend > 0 ? 'trending_up' : 'trending_down'"
            size="16px"
          />
          {{ Math.abs(trend) }}% so với tháng trước
        </div>
      </div>
      <q-icon
        :name="icon"
        size="48px"
        :class="iconClass"
        class="q-ml-sm"
      />
    </div>
  </q-card>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  trend: {
    type: Number,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  iconClass: {
    type: String,
    default: 'text-primary'
  }
})
</script>

<style scoped>
.stat-card {
  transition: all 0.3s ease;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
