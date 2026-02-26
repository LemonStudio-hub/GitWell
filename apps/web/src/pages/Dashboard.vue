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
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">项目仪表盘</h2>
          <p class="text-gray-600 mt-1">查看项目健康指标和数据分析</p>
        </div>
        <div v-if="repoData" class="flex gap-2">
          <button
            @click="exportData('json')"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l4-4m-4 4h4"
              />
            </svg>
            导出 JSON
          </button>
          <button
            @click="exportData('markdown')"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            导出报告
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-danger-50 border border-danger-200 rounded-lg p-6">
        <div class="flex items-center">
          <svg class="h-6 w-6 text-danger-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p class="text-danger-800">{{ error }}</p>
        </div>
        <button
          @click="retry"
          class="mt-4 px-4 py-2 bg-danger-600 text-white rounded-md hover:bg-danger-700 transition-colors"
        >
          重试
        </button>
      </div>

      <!-- Dashboard Content -->
      <div v-else-if="repoData">
        <!-- Repository Info Card -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <h3 class="text-xl font-bold text-gray-900">{{ repoData.name }}</h3>
                <HealthBadge :score="healthScore" size="md" />
              </div>
              <p v-if="repoData.description" class="text-gray-600 mt-1">{{ repoData.description }}</p>
              <div class="flex items-center gap-4 mt-3 flex-wrap">
                <span class="text-sm text-gray-500 flex items-center gap-1">
                  ⭐ {{ formatNumber(repoData.stars) }}
                </span>
                <span class="text-sm text-gray-500 flex items-center gap-1">
                  🍴 {{ formatNumber(repoData.forks) }}
                </span>
                <span class="text-sm text-gray-500 flex items-center gap-1">
                  👀 {{ formatNumber(repoData.watchers) }}
                </span>
                <span v-if="repoData.language" class="text-sm text-gray-500 flex items-center gap-1">
                  💻 {{ repoData.language }}
                </span>
                <span class="text-sm text-gray-500 flex items-center gap-1">
                  📅 创建于 {{ formatDate(repoData.createdAt, 'short') }}
                </span>
              </div>
            </div>
            <div class="text-right">
              <a
                :href="repoData.url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-primary-600 hover:text-primary-700 font-medium"
              >
                查看仓库 →
              </a>
            </div>
          </div>
        </div>

        <!-- Health Metrics -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <MetricCard
            title="总体健康度"
            :value="healthScore"
            type="success"
            :trend="healthScore >= 80 ? '优秀' : healthScore >= 60 ? '良好' : '需改进'"
          />
          <MetricCard
            title="每周提交数"
            :value="metrics.commitFrequency"
            type="default"
            :trend="metrics.commitFrequency > 10 ? '活跃' : '一般'"
          />
          <MetricCard
            title="贡献者活跃度"
            :value="metrics.contributorCount"
            type="default"
          />
          <MetricCard
            title="代码质量"
            :value="metrics.codeQuality"
            type="success"
            :trend="metrics.codeQuality >= 80 ? '高质量' : '中等'"
          />
          <MetricCard
            title="问题解决率"
            :value="metrics.issueResolutionRate * 100"
            type="warning"
          />
        </div>

        <!-- Detailed Metrics -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold mb-4">Issue 指标</h3>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">开放 Issues</span>
                <span class="font-semibold">{{ repoData.openIssues }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">解决率</span>
                <span class="font-semibold" :class="getQualityColor(metrics.issueResolutionRate * 100)">
                  {{ formatPercentage(metrics.issueResolutionRate) }}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">平均响应时间</span>
                <span class="font-semibold">{{ formatNumber(metrics.responseTime) }} 小时</span>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold mb-4">Pull Request 指标</h3>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">开放 PRs</span>
                <span class="font-semibold">{{ repoData.openPRs }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">合并率</span>
                <span class="font-semibold" :class="getQualityColor(metrics.prMergeRate * 100)">
                  {{ formatPercentage(metrics.prMergeRate) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold mb-4">最近30天提交趋势</h3>
            <div class="h-64">
              <LineChart v-if="trendData.length > 0" :data="trendData" title="提交趋势" />
              <div v-else class="h-full flex items-center justify-center text-gray-400">
                暂无数据
              </div>
            </div>
          </div>
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold mb-4">健康度构成</h3>
            <div class="h-64">
              <PieChart
                v-if="healthScore > 0"
                :data="[
                  { name: '提交频率', value: metrics.commitFrequency * 0.25 },
                  { name: '贡献者', value: metrics.contributorCount * 0.2 },
                  { name: '代码质量', value: metrics.codeQuality * 0.2 },
                  { name: 'Issue 解决率', value: metrics.issueResolutionRate * 100 * 0.2 },
                  { name: 'PR 合并率', value: metrics.prMergeRate * 100 * 0.15 },
                ]"
                title="健康度构成"
              />
              <div v-else class="h-full flex items-center justify-center text-gray-400">
                暂无数据
              </div>
            </div>
          </div>
        </div>

        <!-- More Charts -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold mb-4">Top 10 贡献者</h3>
            <div class="h-64">
              <ContributorChart v-if="contributors.length > 0" :data="contributors" />
              <div v-else class="h-full flex items-center justify-center text-gray-400">
                暂无数据
              </div>
            </div>
          </div>
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold mb-4">Issue/PR 状态分布</h3>
            <div class="h-64">
              <IssuePRChart v-if="issues.length > 0 || prs.length > 0" :issues="issues" :prs="prs" />
              <div v-else class="h-full flex items-center justify-center text-gray-400">
                暂无数据
              </div>
            </div>
          </div>
        </div>

        <!-- Language Chart -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6" v-if="repoData?.language">
          <h3 class="text-lg font-semibold mb-4">代码语言分布</h3>
          <div class="h-64 flex items-center justify-center">
            <div class="flex items-center gap-8">
              <div class="text-6xl font-bold text-primary-600">
                {{ repoData.language }}
              </div>
              <div class="text-gray-600">
                <p>主要开发语言</p>
                <p class="text-sm mt-2">语言分析功能即将推出</p>
              </div>
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
import { repoService } from '../services/repo'
import { formatNumber, formatPercentage, formatDate } from '@gitwell/utils'
import { exportAsJSON, exportAsMarkdown } from '@gitwell/utils'
import MetricCard from '@gitwell/ui/MetricCard.vue'
import HealthBadge from '@gitwell/ui/HealthBadge.vue'
import LineChart from '../components/LineChart.vue'
import PieChart from '../components/PieChart.vue'
import ContributorChart from '../components/ContributorChart.vue'
import IssuePRChart from '../components/IssuePRChart.vue'
import LanguageChart from '../components/LanguageChart.vue'
import type { RepoData, HealthMetrics, TrendData, Contributor, Issue, PullRequest } from '@gitwell/api'

const route = useRoute()

const loading = ref(true)
const error = ref('')
const repoData = ref<RepoData | null>(null)
const metrics = ref<HealthMetrics>({
  commitFrequency: 0,
  contributorCount: 0,
  codeQuality: 0,
  issueResolutionRate: 0,
  prMergeRate: 0,
  responseTime: 0,
})
const trendData = ref<TrendData[]>([])
const contributors = ref<Contributor[]>([])
const issues = ref<Issue[]>([])
const prs = ref<PullRequest[]>([])

const healthScore = computed(() => {
  const m = metrics.value
  return (
    m.commitFrequency * 0.25 +
    m.contributorCount * 0.2 +
    m.codeQuality * 0.2 +
    m.issueResolutionRate * 100 * 0.2 +
    m.prMergeRate * 100 * 0.15
  )
})

const getQualityColor = (score: number) => {
  if (score >= 80) return 'text-success-600'
  if (score >= 60) return 'text-warning-600'
  return 'text-danger-600'
}

const fetchData = async () => {
  const url = route.query.url as string
  if (!url) {
    loading.value = false
    return
  }

  try {
    loading.value = true
    error.value = ''

    const data = await repoService.getRepoData(url)
    repoData.value = data.repoData
    metrics.value = data.metrics
    trendData.value = data.trendData

    // TODO: 从 repoService 获取完整数据
    // 暂时使用模拟数据
    contributors.value = [
      { id: '1', login: 'contributor1', avatarUrl: '', contributions: 42 },
      { id: '2', login: 'contributor2', avatarUrl: '', contributions: 35 },
      { id: '3', login: 'contributor3', avatarUrl: '', contributions: 28 },
      { id: '4', login: 'contributor4', avatarUrl: '', contributions: 21 },
      { id: '5', login: 'contributor5', avatarUrl: '', contributions: 15 },
      { id: '6', login: 'contributor6', avatarUrl: '', contributions: 12 },
      { id: '7', login: 'contributor7', avatarUrl: '', contributions: 10 },
      { id: '8', login: 'contributor8', avatarUrl: '', contributions: 8 },
      { id: '9', login: 'contributor9', avatarUrl: '', contributions: 5 },
      { id: '10', login: 'contributor10', avatarUrl: '', contributions: 3 },
    ]

    issues.value = [
      { id: '1', title: 'Issue 1', number: 1, state: 'open', createdAt: new Date(), author: 'user1' },
      { id: '2', title: 'Issue 2', number: 2, state: 'closed', createdAt: new Date(), closedAt: new Date(), author: 'user2' },
      { id: '3', title: 'Issue 3', number: 3, state: 'open', createdAt: new Date(), author: 'user3' },
      { id: '4', title: 'Issue 4', number: 4, state: 'closed', createdAt: new Date(), closedAt: new Date(), author: 'user4' },
    ]

    prs.value = [
      { id: '1', title: 'PR 1', number: 1, state: 'merged', createdAt: new Date(), mergedAt: new Date(), author: 'user1', additions: 100, deletions: 50 },
      { id: '2', title: 'PR 2', number: 2, state: 'open', createdAt: new Date(), author: 'user2', additions: 200, deletions: 30 },
      { id: '3', title: 'PR 3', number: 3, state: 'closed', createdAt: new Date(), author: 'user3', additions: 50, deletions: 10 },
      { id: '4', title: 'PR 4', number: 4, state: 'merged', createdAt: new Date(), mergedAt: new Date(), author: 'user4', additions: 150, deletions: 40 },
    ]
  } catch (e) {
    error.value = e instanceof Error ? e.message : '获取仓库数据失败'
  } finally {
    loading.value = false
  }
}

const retry = () => {
  fetchData()
}

const exportData = (format: 'json' | 'markdown') => {
  if (!repoData.value) return

  const data = {
    repoData: repoData.value,
    metrics: metrics.value,
    healthScore: healthScore.value,
  }

  const filename = repoData.value.name.replace(/\//g, '-')

  if (format === 'json') {
    exportAsJSON(data, filename)
  } else {
    exportAsMarkdown(data, filename)
  }
}

onMounted(() => {
  fetchData()
})
</script>