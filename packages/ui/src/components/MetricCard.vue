<template>
  <div class="bg-white rounded-lg shadow-md p-4">
    <p class="text-sm text-gray-600 mb-1">{{ title }}</p>
    <p :class="['text-2xl font-bold', colorClass]">
      {{ displayValue }}
    </p>
    <p v-if="trend" class="text-sm mt-1" :class="trendClass">
      {{ trend }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  value: number | string
  type?: 'default' | 'success' | 'warning' | 'danger'
  trend?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  trend: '',
})

const displayValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toFixed(1)
  }
  return props.value
})

const colorClass = computed(() => {
  const colors = {
    default: 'text-gray-900',
    success: 'text-success-600',
    warning: 'text-warning-600',
    danger: 'text-danger-600',
  }
  return colors[props.type]
})

const trendClass = computed(() => {
  if (props.trend.includes('+')) {
    return 'text-success-600'
  } else if (props.trend.includes('-')) {
    return 'text-danger-600'
  }
  return 'text-gray-500'
})
</script>