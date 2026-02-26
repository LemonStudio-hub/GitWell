<template>
  <div ref="chartRef" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent } from 'echarts/components'
import type { EChartsCoreOption } from 'echarts/core'

// 在模块顶层注册 ECharts 组件
echarts.use([PieChart, TitleComponent, TooltipComponent])

interface Props {
  data: { name: string; value: number }[]
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '健康度构成',
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
        name: '健康指标',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: props.data,
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