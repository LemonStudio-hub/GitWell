<template>
  <div ref="chartRef" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent } from 'echarts/components'
import type { EChartsCoreOption } from 'echarts/core'
import type { Contributor } from '@gitdash/api'

interface Props {
  data: Contributor[]
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '贡献者活跃度',
})

const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return

  chart = echarts.init(chartRef.value)
  updateChart()
}

const updateChart = () => {
  if (!chart || !props.data.length) return

  // 取前 10 个贡献者
  const topContributors = props.data.slice(0, 10)
  const names = topContributors.map((c) => c.login)
  const contributions = topContributors.map((c) => c.contributions)

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
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params: any) => {
        const param = params[0]
        return `${param.name}<br/>贡献数: ${param.value}`
      },
    },
    grid: {
      left: '15%',
      right: '5%',
      bottom: '15%',
      top: '20%',
    },
    xAxis: {
      type: 'category',
      data: names,
      axisLabel: {
        interval: 0,
        rotate: 30,
        color: '#6b7280',
        fontSize: 11,
      },
      axisLine: {
        lineStyle: {
          color: '#e5e7eb',
        },
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#e5e7eb',
        },
      },
      axisLabel: {
        color: '#6b7280',
      },
      splitLine: {
        lineStyle: {
          color: '#f3f4f6',
        },
      },
    },
    series: [
      {
        name: '贡献数',
        type: 'bar',
        data: contributions,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#38bdf8' },
              { offset: 1, color: '#0ea5e9' },
            ],
          },
        },
        barWidth: '60%',
        emphasis: {
          itemStyle: {
            color: '#0284c7',
          },
        },
      },
    ],
  }

  chart.setOption(option)
}

const handleResize = () => {
  chart?.resize()
}

watch(
  () => props.data,
  () => {
    updateChart()
  },
  { deep: true }
)

onMounted(() => {
  echarts.use([BarChart, TitleComponent, TooltipComponent, GridComponent])
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
})
</script>