<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-2">
          <h3 class="text-xl font-bold text-gray-900">{{ name }}</h3>
          <span
            :class="getHealthBadgeColor(healthScore)"
            class="px-2 py-1 text-xs font-medium rounded-full"
          >
            健康度: {{ healthScore.toFixed(1) }}%
          </span>
        </div>
        <p v-if="description" class="text-gray-600 mb-3">{{ description }}</p>
        <div class="flex items-center gap-4 flex-wrap">
          <span class="text-sm text-gray-500 flex items-center gap-1">
            ⭐ {{ formatNumber(stars) }}
          </span>
          <span class="text-sm text-gray-500 flex items-center gap-1">
            🍴 {{ formatNumber(forks) }}
          </span>
          <span class="text-sm text-gray-500 flex items-center gap-1">
            👀 {{ formatNumber(watchers) }}
          </span>
          <span v-if="language" class="text-sm text-gray-500 flex items-center gap-1">
            💻 {{ language }}
          </span>
        </div>
      </div>
      <a
        v-if="url"
        :href="url"
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary-600 hover:text-primary-700 ml-4"
      >
        查看仓库 →
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatNumber } from '@gitwell/utils'

interface Props {
  name: string
  description?: string
  stars: number
  forks: number
  watchers: number
  language?: string
  healthScore: number
  url?: string
}

withDefaults(defineProps<Props>(), {
  description: '',
  language: '',
  url: '',
})

const getHealthBadgeColor = (score: number) => {
  if (score >= 80) return 'bg-success-100 text-success-800'
  if (score >= 60) return 'bg-warning-100 text-warning-800'
  return 'bg-danger-100 text-danger-800'
}
</script>