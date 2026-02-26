<template>
  <div ref="chartRef" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent } from 'echarts/components'
import type { EChartsCoreOption } from 'echarts/core'
import type { TrendData } from '@gitdash/api'

// 在模块顶层注册 ECharts 组件
echarts.use([LineChart, TitleComponent, TooltipComponent, GridComponent])

interface Props {
  data: TrendData[]
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '提交趋势',
})

const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return

  try {
    chart = echarts.init(chartRef.value)
    updateChart()
  } catch (error) {
    console.error('Failed to initialize chart:', error)
  }
}

const updateChart = () => {
  if (!chart || !props.data.length) {
    if (chart) {
      chart.clear()
    }
    return
  }

  const dates = props.data.map((item) => {
    const date = new Date(item.date)
    return `${date.getMonth() + 1}/${date.getDate()}`
  })
  const values = props.data.map((item) => item.value)

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
      formatter: (params: any) => {
        const param = params[0]
        return `${param.name}<br/>提交数: ${param.value}`
      },
    },
    grid: {
      left: '10%',
      right: '5%',
      bottom: '15%',
      top: '20%',
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: {
        lineStyle: {
          color: '#e5e7eb',
        },
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 11,
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
        data: values,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: '#0ea5e9',
        },
        lineStyle: {
          color: '#0ea5e9',
          width: 2,
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(14, 165, 233, 0.3)' },
            { offset: 1, color: 'rgba(14, 165, 233, 0.05)' },
          ]),
        },
      },
    ],
  }

  chart.setOption(option)
}

const handleResize = () => {
  if (chart) {
    chart.resize()
  }
}

watch(
  () => props.data,
  () => {
    updateChart()
  },
  { deep: true }
)

onMounted(() => {
  // 使用 nextTick 确保 DOM 已经渲染
  nextTick(() => {
    initChart()
    window.addEventListener('resize', handleResize)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (chart) {
    chart.dispose()
    chart = null
  }
})
</script>