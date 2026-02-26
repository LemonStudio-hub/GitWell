<template>
  <div ref="chartRef" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent } from 'echarts/components'
import type { EChartsCoreOption } from 'echarts/core'
import type { Issue, PullRequest } from '@gitdash/api'

interface Props {
  issues: Issue[]
  prs: PullRequest[]
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Issue/PR 状态分布',
})

const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return

  chart = echarts.init(chartRef.value)
  updateChart()
}

const updateChart = () => {
  if (!chart) return

  const issueOpen = props.issues.filter((i) => i.state === 'open').length
  const issueClosed = props.issues.filter((i) => i.state === 'closed').length

  const prOpen = props.prs.filter((p) => p.state === 'open').length
  const prClosed = props.prs.filter((p) => p.state === 'closed').length
  const prMerged = props.prs.filter((p) => p.state === 'merged').length

  const option: EChartsCoreOption = {
    title: {
      text: props.title,
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: {
        fontSize: 12,
      },
    },
    series: [
      {
        name: 'Issue',
        type: 'pie',
        selectedMode: 'single',
        radius: [0, '30%'],
        label: {
          position: 'inner',
          fontSize: 14,
        },
        labelLine: {
          show: false,
        },
        data: [
          { value: issueOpen, name: 'Open', itemStyle: { color: '#fbbf24' } },
          { value: issueClosed, name: 'Closed', itemStyle: { color: '#22c55e' } },
        ],
      },
      {
        name: 'Pull Request',
        type: 'pie',
        radius: ['40%', '70%'],
        labelLine: {
          length: 30,
        },
        label: {
          formatter: '{a|{a}}{abg|}\n{hr|}\n{b|{b}：}{c} {per|{d}%}  ',
          backgroundColor: '#F6F8FC',
          borderColor: '#8C8D8E',
          borderWidth: 1,
          borderRadius: 4,
          rich: {
            a: {
              color: '#6E7079',
              lineHeight: 22,
              align: 'center',
            },
            hr: {
              borderColor: '#8C8D8E',
              width: '100%',
              borderWidth: 1,
              height: 0,
            },
            b: {
              color: '#4C5058',
              fontSize: 14,
              fontWeight: 'bold',
              lineHeight: 33,
            },
            per: {
              color: '#fff',
              backgroundColor: '#4C5058',
              padding: [3, 7],
              borderRadius: 4,
            },
          },
        },
        data: [
          { value: prOpen, name: 'Open', itemStyle: { color: '#fbbf24' } },
          { value: prMerged, name: 'Merged', itemStyle: { color: '#22c55e' } },
          { value: prClosed, name: 'Closed', itemStyle: { color: '#ef4444' } },
        ],
      },
    ],
  }

  chart.setOption(option)
}

const handleResize = () => {
  chart?.resize()
}

watch(
  () => [props.issues, props.prs],
  () => {
    updateChart()
  },
  { deep: true }
)

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
})
</script>