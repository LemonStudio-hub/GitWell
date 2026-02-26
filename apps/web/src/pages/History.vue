<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-primary-600" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
                />
              </svg>
            </div>
            <h1 class="ml-3 text-2xl font-bold text-gray-900">GitDash</h1>
          </div>
          <nav class="flex space-x-8">
            <router-link to="/" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              首页
            </router-link>
            <router-link
              to="/dashboard"
              class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              active-class="bg-primary-50"
            >
              仪表盘
            </router-link>
            <router-link
              to="/compare"
              class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              active-class="bg-primary-50"
            >
              对比
            </router-link>
            <router-link
              to="/history"
              class="text-primary-600 hover:text-primary-700 px-3 py-2 rounded-md text-sm font-medium"
              active-class="bg-primary-50"
            >
              历史记录
            </router-link>
          </nav>
        </div>
      </div>
    </header>

    <!-- History Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900">历史记录</h2>
        <p class="text-gray-600 mt-1">查看您访问过的仓库记录</p>
      </div>

      <!-- Search Bar -->
      <div class="mb-6">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索历史记录..."
            class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <svg
            class="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="mb-6 flex gap-3">
        <button
          v-if="filteredHistory.length > 0"
          @click="clearAllHistory"
          class="px-4 py-2 bg-danger-600 text-white rounded-md hover:bg-danger-700 transition-colors"
        >
          清空历史
        </button>
      </div>

      <!-- History List -->
      <div v-if="filteredHistory.length > 0" class="bg-white rounded-lg shadow-md">
        <div class="divide-y divide-gray-200">
          <div
            v-for="record in filteredHistory"
            :key="record.id"
            class="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center space-x-4 flex-1 cursor-pointer" @click="selectHistory(record)">
              <span
                class="text-sm px-3 py-1 rounded-full"
                :class="record.platform === 'github' ? 'bg-gray-800 text-white' : 'bg-orange-500 text-white'"
              >
                {{ record.platform === 'github' ? 'GitHub' : 'GitLab' }}
              </span>
              <div class="flex-1">
                <div class="text-sm font-medium text-gray-900">
                  {{ record.owner }} / {{ record.repo }}
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  {{ record.url }}
                </div>
                <div class="text-xs text-gray-400 mt-1">
                  {{ formatRelativeTime(record.timestamp) }} · 访问 {{ record.visited }} 次
                </div>
              </div>
            </div>
            <button
              @click="removeHistory(record.id)"
              class="ml-4 p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="删除"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="history.length === 0" class="bg-white rounded-lg shadow-md p-12 text-center">
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">暂无历史记录</h3>
        <p class="mt-1 text-sm text-gray-500">开始分析仓库后，历史记录将显示在这里</p>
        <router-link
          to="/"
          class="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          前往首页
        </router-link>
      </div>

      <!-- No Search Results -->
      <div v-else class="bg-white rounded-lg shadow-md p-12 text-center">
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">未找到匹配的记录</h3>
        <p class="mt-1 text-sm text-gray-500">尝试其他搜索关键词</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getHistory, deleteHistory, clearHistory, addHistory, formatRelativeTime, type HistoryRecord } from '@gitdash/utils'

const router = useRouter()
const history = ref<HistoryRecord[]>([])
const searchQuery = ref('')

const filteredHistory = computed(() => {
  if (!searchQuery.value.trim()) {
    return history.value
  }

  const query = searchQuery.value.toLowerCase()
  return history.value.filter(
    (record) =>
      record.url.toLowerCase().includes(query) ||
      record.owner.toLowerCase().includes(query) ||
      record.repo.toLowerCase().includes(query)
  )
})

const loadHistory = () => {
  history.value = getHistory()
}

const selectHistory = (record: HistoryRecord) => {
  addHistory({
    url: record.url,
    platform: record.platform,
    owner: record.owner,
    repo: record.repo,
  })
  loadHistory()
  router.push({
    name: 'Dashboard',
    query: { url: record.url },
  })
}

const removeHistory = (id: string) => {
  deleteHistory(id)
  loadHistory()
}

const clearAllHistory = () => {
  if (confirm('确定要清空所有历史记录吗？此操作不可撤销。')) {
    clearHistory()
    loadHistory()
  }
}

onMounted(() => {
  loadHistory()
})
</script>