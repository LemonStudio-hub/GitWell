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
              class="text-primary-600 hover:text-primary-700 px-3 py-2 rounded-md text-sm font-medium"
              active-class="bg-primary-50"
            >
              对比
            </router-link>
          </nav>
        </div>
      </div>
    </header>

    <!-- Compare Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900">仓库对比</h2>
        <p class="text-gray-600 mt-1">对比多个仓库的健康指标</p>
      </div>

      <!-- Repository Inputs -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold mb-4">添加仓库</h3>
        <div class="space-y-3">
          <div v-for="(repo, index) in repos" :key="index" class="flex gap-3">
            <input
              v-model="repo.url"
              type="text"
              :placeholder="`仓库 ${index + 1} URL`"
              class="flex-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              :class="getErrorClass(index)"
              @input="clearError(index)"
            />
            <button
              v-if="repos.length > 2"
              @click="removeRepo(index)"
              class="px-4 py-2 bg-danger-600 text-white rounded-md hover:bg-danger-700 transition-colors"
            >
              删除
            </button>
          </div>
          <p v-for="(error, index) in errors" :key="index" class="text-sm text-red-600">
            {{ error }}
          </p>
        </div>
        <button
          v-if="repos.length < 4"
          @click="addRepo"
          class="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          + 添加仓库
        </button>
        <div class="mt-4">
          <button
            @click="compareRepos"
            class="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            开始对比
          </button>
        </div>
      </div>

      <!-- Comparison Results -->
      <div v-if="comparisonResults.length > 0" class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold mb-4">对比结果</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  指标
                </th>
                <th
                  v-for="result in comparisonResults"
                  :key="result.name"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {{ result.name }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">总体健康度</td>
                <td
                  v-for="result in comparisonResults"
                  :key="result.name"
                  class="px-6 py-4 whitespace-nowrap text-sm"
                >
                  <span :class="getHealthColor(result.healthScore)">
                    {{ result.healthScore.toFixed(1) }}%
                  </span>
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">提交频率</td>
                <td
                  v-for="result in comparisonResults"
                  :key="result.name"
                  class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                >
                  {{ result.commitFrequency.toFixed(1) }}
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">贡献者数量</td>
                <td
                  v-for="result in comparisonResults"
                  :key="result.name"
                  class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                >
                  {{ result.contributorCount }}
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">代码质量</td>
                <td
                  v-for="result in comparisonResults"
                  :key="result.name"
                  class="px-6 py-4 whitespace-nowrap text-sm"
                >
                  <span :class="getQualityColor(result.codeQuality)">
                    {{ result.codeQuality.toFixed(1) }}%
                  </span>
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">问题解决率</td>
                <td
                  v-for="result in comparisonResults"
                  :key="result.name"
                  class="px-6 py-4 whitespace-nowrap text-sm"
                >
                  <span :class="getQualityColor(result.issueResolutionRate * 100)">
                    {{ (result.issueResolutionRate * 100).toFixed(1) }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { isValidRepoUrl } from '@gitdash/utils'

interface Repo {
  url: string
}

interface ComparisonResult {
  name: string
  healthScore: number
  commitFrequency: number
  contributorCount: number
  codeQuality: number
  issueResolutionRate: number
}

const repos = ref<Repo[]>([
  { url: '' },
  { url: '' },
])

const comparisonResults = ref<ComparisonResult[]>([])
const errors = ref<string[]>([])

const addRepo = () => {
  if (repos.value.length < 4) {
    repos.value.push({ url: '' })
  }
}

const removeRepo = (index: number) => {
  repos.value.splice(index, 1)
  errors.value.splice(index, 1)
}

const validateUrls = (): boolean => {
  errors.value = []
  let hasError = false

  repos.value.forEach((repo, index) => {
    if (!repo.url.trim()) {
      errors.value[index] = `仓库 ${index + 1} URL 不能为空`
      hasError = true
    } else if (!isValidRepoUrl(repo.url)) {
      errors.value[index] = `仓库 ${index + 1} URL 格式不正确，请输入有效的 GitHub 或 GitLab 仓库 URL`
      hasError = true
    } else {
      errors.value[index] = ''
    }
  })

  return !hasError
}

const compareRepos = async () => {
  if (!validateUrls()) {
    return
  }

  // TODO: 实现真实的对比逻辑
  // 模拟数据
  comparisonResults.value = [
    {
      name: 'repo1',
      healthScore: 85.5,
      commitFrequency: 75.5,
      contributorCount: 42,
      codeQuality: 85.2,
      issueResolutionRate: 0.78,
    },
    {
      name: 'repo2',
      healthScore: 72.3,
      commitFrequency: 65.2,
      contributorCount: 35,
      codeQuality: 78.5,
      issueResolutionRate: 0.85,
    },
  ]
}

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

const getErrorClass = (index: number) => {
  return errors.value[index] ? 'border-red-500' : 'border-gray-300'
}

const clearError = (index: number) => {
  if (errors.value[index]) {
    errors.value[index] = ''
  }
}
</script>