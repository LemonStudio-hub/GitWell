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
            <h1 class="ml-3 text-2xl font-bold text-gray-900">GitWell</h1>
          </div>
          <nav class="flex space-x-8">
            <router-link to="/" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              首页
            </router-link>
            <router-link
              to="/dashboard"
              class="text-primary-600 hover:text-primary-700 px-3 py-2 rounded-md text-sm font-medium"
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

    <!-- Dashboard Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900">项目仪表盘</h2>
        <p class="text-gray-600 mt-1">查看项目健康指标和数据分析</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-danger-50 border border-danger-200 rounded-lg p-6">
        <p class="text-danger-800">{{ error }}</p>
      </div>

      <!-- Dashboard Content -->
      <div v-else-if="repoData">
        <!-- Repository Info Card -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-xl font-bold text-gray-900">{{ repoData.name }}</h3>
              <p class="text-gray-600 mt-1">{{ repoData.description }}</p>
              <div class="flex items-center gap-4 mt-3">
                <span class="text-sm text-gray-500">⭐ {{ repoData.stars }}</span>
                <span class="text-sm text-gray-500">🍴 {{ repoData.forks }}</span>
                <span class="text-sm text-gray-500">👀 {{ repoData.watchers }}</span>
                <span class="text-sm text-gray-500">💻 {{ repoData.language }}</span>
              </div>
            </div>
            <div class="text-right">
              <a
                :href="repoData.url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-primary-600 hover:text-primary-700"
              >
                查看仓库 →
              </a>
            </div>
          </div>
        </div>

        <!-- Health Metrics -->
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div class="bg-white rounded-lg shadow-md p-4">
            <p class="text-sm text-gray-600 mb-1">总体健康度</p>
            <p class="text-2xl font-bold" :class="getHealthColor(healthScore)">
              {{ healthScore.toFixed(1) }}%
            </p>
          </div>
          <div class="bg-white rounded-lg shadow-md p-4">
            <p class="text-sm text-gray-600 mb-1">提交频率</p>
            <p class="text-2xl font-bold text-primary-600">{{ healthMetrics.commitFrequency.toFixed(1) }}</p>
          </div>
          <div class="bg-white rounded-lg shadow-md p-4">
            <p class="text-sm text-gray-600 mb-1">贡献者</p>
            <p class="text-2xl font-bold text-primary-600">{{ healthMetrics.contributorCount }}</p>
          </div>
          <div class="bg-white rounded-lg shadow-md p-4">
            <p class="text-sm text-gray-600 mb-1">代码质量</p>
            <p class="text-2xl font-bold" :class="getQualityColor(healthMetrics.codeQuality)">
              {{ healthMetrics.codeQuality.toFixed(1) }}%
            </p>
          </div>
          <div class="bg-white rounded-lg shadow-md p-4">
            <p class="text-sm text-gray-600 mb-1">问题解决率</p>
            <p class="text-2xl font-bold" :class="getQualityColor(healthMetrics.issueResolutionRate * 100)">
              {{ (healthMetrics.issueResolutionRate * 100).toFixed(1) }}%
            </p>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold mb-4">提交频率趋势</h3>
            <div class="h-64 flex items-center justify-center text-gray-400">
              图表组件待实现
            </div>
          </div>
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold mb-4">贡献者活跃度</h3>
            <div class="h-64 flex items-center justify-center text-gray-400">
              图表组件待实现
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white rounded-lg shadow-md p-12 text-center">
        <svg class="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">暂无数据</h3>
        <p class="text-gray-600 mb-4">请输入仓库 URL 开始分析</p>
        <router-link to="/" class="text-primary-600 hover:text-primary-700">
          返回首页 →
        </router-link>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

interface RepoData {
  name: string
  description: string
  stars: number
  forks: number
  watchers: number
  language: string
  url: string
}

interface HealthMetrics {
  commitFrequency: number
  contributorCount: number
  codeQuality: number
  issueResolutionRate: number
  prMergeRate: number
}

const loading = ref(true)
const error = ref('')
const repoData = ref<RepoData | null>(null)
const healthMetrics = ref<HealthMetrics>({
  commitFrequency: 0,
  contributorCount: 0,
  codeQuality: 0,
  issueResolutionRate: 0,
  prMergeRate: 0,
})

const healthScore = computed(() => {
  const metrics = healthMetrics.value
  return (
    metrics.commitFrequency * 0.25 +
    metrics.contributorCount * 0.2 +
    metrics.codeQuality * 0.2 +
    metrics.issueResolutionRate * 100 * 0.2 +
    metrics.prMergeRate * 100 * 0.15
  )
})

const getHealthColor = (score: number) => {
  if (score >= 80) return 'text-success-600'
  if (score >= 60) return 'text-warning-600'
  return 'text-danger-600'
}

const getQualityColor = (score: number) => {
  if (score >= 80) return 'text-success-600'
  if (score >= 60) return 'text-warning-600'
  return 'text-danger-600'
}

onMounted(async () => {
  const url = route.query.url as string
  if (!url) {
    loading.value = false
    return
  }

  try {
    // TODO: 实现真实的 API 调用
    // 模拟数据
    await new Promise((resolve) => setTimeout(resolve, 1000))
    repoData.value = {
      name: 'example/repo',
      description: 'Example repository description',
      stars: 1234,
      forks: 567,
      watchers: 89,
      language: 'TypeScript',
      url: url,
    }
    healthMetrics.value = {
      commitFrequency: 75.5,
      contributorCount: 42,
      codeQuality: 85.2,
      issueResolutionRate: 0.78,
      prMergeRate: 0.92,
    }
  } catch (e) {
    error.value = '获取仓库数据失败，请检查 URL 是否正确'
  } finally {
    loading.value = false
  }
})
</script>