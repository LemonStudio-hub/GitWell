<template>
  <span :class="badgeClasses">
    {{ displayScore }}%
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  score: number
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const displayScore = computed(() => props.score.toFixed(1))

const badgeClasses = computed(() => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  }

  let colorClasses = ''
  if (props.score >= 80) {
    colorClasses = 'bg-success-100 text-success-800'
  } else if (props.score >= 60) {
    colorClasses = 'bg-warning-100 text-warning-800'
  } else {
    colorClasses = 'bg-danger-100 text-danger-800'
  }

  return `inline-flex items-center rounded-full font-medium ${colorClasses} ${sizeClasses[props.size]}`
})
</script>