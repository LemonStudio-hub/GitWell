<template>
  <div class="min-h-screen">
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
            <router-link
              to="/"
              class="text-primary-600 hover:text-primary-700 px-3 py-2 rounded-md text-sm font-medium"
              active-class="bg-primary-50"
            >
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
          </nav>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-4xl md:text-5xl font-bold mb-4">开源项目健康仪表盘</h2>
        <p class="text-xl md:text-2xl text-primary-100 mb-8">
          实时监控和分析您的 GitHub/GitLab 仓库健康状态
        </p>
      </div>
    </section>

    <!-- Repository Input Section -->
    <section class="py-12">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">输入仓库 URL</h3>
          <div class="flex gap-3">
            <input
              v-model="repoUrl"
              type="text"
              placeholder="https://github.com/owner/repo"
              class="flex-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              :class="errorMessage ? 'border-red-500' : 'border-gray-300'"
              @keyup.enter="analyzeRepo"
              @input="clearError"
            />
            <button
              @click="analyzeRepo"
              class="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              分析
            </button>
          </div>
          <p v-if="errorMessage" class="mt-3 text-sm text-red-600">
            {{ errorMessage }}
          </p>
          <p v-else class="mt-3 text-sm text-gray-600">
            支持 GitHub 和 GitLab 仓库 URL
          </p>
        </div>

        <!-- Recent History -->
        <div v-if="recentHistory.length > 0" class="mt-6 bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">最近访问</h3>
            <router-link
              to="/history"
              class="text-sm text-primary-600 hover:text-primary-700"
            >
              查看全部
            </router-link>
          </div>
          <div class="space-y-2">
            <div
              v-for="record in recentHistory"
              :key="record.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
              @click="selectHistory(record)"
            >
              <div class="flex items-center space-x-3">
                <span
                  class="text-xs px-2 py-1 rounded-full"
                  :class="record.platform === 'github' ? 'bg-gray-800 text-white' : 'bg-orange-500 text-white'"
                >
                  {{ record.platform === 'github' ? 'GitHub' : 'GitLab' }}
                </span>
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ record.owner }} / {{ record.repo }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ formatRelativeTime(record.timestamp) }}
                  </div>
                </div>
              </div>
              <button
                @click.stop="removeHistory(record.id)"
                class="text-gray-400 hover:text-red-600 transition-colors"
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
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-12 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 class="text-3xl font-bold text-center text-gray-900 mb-8">核心功能</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-6 rounded-lg shadow-md">
            <div class="text-primary-600 mb-4">
              <svg class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h4 class="text-xl font-semibold mb-2">健康指标</h4>
            <p class="text-gray-600">
              全面评估项目健康度，包括提交频率、贡献者活跃度、代码质量等关键指标
            </p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md">
            <div class="text-primary-600 mb-4">
              <svg class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                />
              </svg>
            </div>
            <h4 class="text-xl font-semibold mb-2">数据可视化</h4>
            <p class="text-gray-600">
              通过直观的图表展示项目数据，帮助您快速了解项目发展趋势
            </p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md">
            <div class="text-primary-600 mb-4">
              <svg class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            </div>
            <h4 class="text-xl font-semibold mb-2">多平台支持</h4>
            <p class="text-gray-600">
              同时支持 GitHub 和 GitLab，一个平台统一管理所有开源项目
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { isValidRepoUrl, formatRelativeTime, getRecentHistory, addHistory, deleteHistory, type HistoryRecord } from '@gitdash/utils'

const router = useRouter()
const repoUrl = ref('')
const errorMessage = ref('')
const recentHistory = ref<HistoryRecord[]>([])

const validateUrl = (url: string): boolean => {
  if (!url.trim()) {
    errorMessage.value = '请输入仓库 URL'
    return false
  }

  if (!isValidRepoUrl(url)) {
    errorMessage.value = 'URL 格式不正确，请输入有效的 GitHub 或 GitLab 仓库 URL（例如：https://github.com/owner/repo）'
    return false
  }

  errorMessage.value = ''
  return true
}

const parseRepoUrl = (url: string) => {
  const githubMatch = url.match(/^https?:\/\/(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)(?:\/)?$/i)
  if (githubMatch) {
    return {
      platform: 'github' as const,
      owner: githubMatch[1]!,
      repo: githubMatch[2]!.replace(/\.git$/, ''),
    }
  }

  const gitlabMatch = url.match(/^https?:\/\/(?:www\.)?gitlab\.com\/([^\/]+)\/([^\/]+)(?:\/)?$/i)
  if (gitlabMatch) {
    return {
      platform: 'gitlab' as const,
      owner: gitlabMatch[1]!,
      repo: gitlabMatch[2]!.replace(/\.git$/, ''),
    }
  }

  return null
}

const analyzeRepo = () => {
  if (validateUrl(repoUrl.value)) {
    const parsed = parseRepoUrl(repoUrl.value)
    if (parsed) {
      addHistory({
        url: repoUrl.value,
        platform: parsed.platform,
        owner: parsed.owner,
        repo: parsed.repo,
      })
      loadRecentHistory()
    }

    router.push({
      name: 'Dashboard',
      query: { url: repoUrl.value },
    })
  }
}

const selectHistory = (record: HistoryRecord) => {
  addHistory({
    url: record.url,
    platform: record.platform,
    owner: record.owner,
    repo: record.repo,
  })
  loadRecentHistory()
  router.push({
    name: 'Dashboard',
    query: { url: record.url },
  })
}

const removeHistory = (id: string) => {
  deleteHistory(id)
  loadRecentHistory()
}

const loadRecentHistory = () => {
  recentHistory.value = getRecentHistory(5)
}

const clearError = () => {
  if (errorMessage.value) {
    errorMessage.value = ''
  }
}

onMounted(() => {
  loadRecentHistory()
})
</script>