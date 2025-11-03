<template>
  <transition name="modal-fade">
    <div
      v-if="countryCode && countryCode !== null"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4"
      @click.self="$emit('close')"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div class="flex items-start justify-between">
            <div>
              <h2 class="text-3xl font-bold mb-2">{{ countryName }}</h2>
              <div class="flex items-center gap-6 text-sm">
                <span class="text-indigo-100">{{ flowLabel }}</span>
                <span class="text-white font-semibold">{{ currentMonthLabel }}: {{ formatValue(currentValue) }}</span>
                <span class="text-indigo-100">12-mo avg: {{ formatValue(averageValue) }}</span>
                <span :class="growth >= 0 ? 'text-green-300' : 'text-red-300'" class="font-semibold">
                  {{ growth >= 0 ? '📈' : '📉' }} {{ growth >= 0 ? '+' : '' }}{{ growth.toFixed(1) }}%
                </span>
              </div>
            </div>
            <button
              @click="$emit('close')"
              class="text-white hover:text-indigo-200 transition-colors p-2"
            >
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex-1 flex items-center justify-center p-12">
          <div class="text-center">
            <div class="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
            <p class="text-gray-600 text-lg">Loading trend data...</p>
          </div>
        </div>

        <!-- Content -->
        <div v-else class="flex-1 overflow-y-auto p-8">
          <!-- Total Trend Chart -->
          <div class="mb-8">
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Total Trade Over Time</h3>
            <div class="bg-white border-2 border-gray-200 rounded-xl p-6">
              <!-- Not enough data warning -->
              <div v-if="timeSeriesData.length < 2" class="h-[350px] flex items-center justify-center">
                <div class="text-center max-w-lg">
                  <svg class="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <h4 class="text-xl font-semibold text-gray-700 mb-2">Insufficient Historical Data</h4>
                  <p class="text-gray-600 mb-4">
                    Only {{ timeSeriesData.length }} month of data available. <br>
                    Trend analysis requires at least 2 months to display meaningful patterns.
                  </p>
                  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                    <p class="text-sm text-blue-900 font-medium mb-2">💡 Current Data:</p>
                    <div v-if="timeSeriesData.length > 0" class="text-sm text-blue-800">
                      <div><strong>Month:</strong> {{ formatMonth(timeSeriesData[0].month) }}</div>
                      <div><strong>Value:</strong> {{ formatValue(timeSeriesData[0].value) }}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Chart when we have enough data -->
              <div v-else style="height: 350px;">
                <v-chart :option="totalTrendOption" :autoresize="true" />
              </div>
            </div>
          </div>

          <!-- Breakdown Section -->
          <div class="grid grid-cols-12 gap-6">
            <!-- Left: Chapter Selector -->
            <div class="col-span-4">
              <h3 class="text-xl font-bold text-gray-900 mb-4">Select Chapters to Compare</h3>
              <div class="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                <div class="max-h-[500px] overflow-y-auto">
                  <div
                    v-for="chapter in sortedChapters"
                    :key="chapter.chapter_code"
                    class="border-b border-gray-100 last:border-b-0"
                  >
                    <label
                      class="flex items-start gap-3 p-4 cursor-pointer hover:bg-indigo-50 transition-colors"
                      :class="{ 'bg-indigo-50': selectedChapters.has(chapter.chapter_code) }"
                    >
                      <input
                        type="checkbox"
                        :checked="selectedChapters.has(chapter.chapter_code)"
                        @change="toggleChapter(chapter.chapter_code)"
                        class="mt-1 w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <div class="flex-1 min-w-0">
                        <div class="font-semibold text-gray-900 text-sm mb-1">
                          Ch {{ chapter.chapter_code }}: {{ chapter.chapter_name }}
                        </div>
                        <div class="flex items-center justify-between gap-2 mb-2">
                          <span class="font-bold text-indigo-600">{{ formatValue(chapter.latest_value) }}</span>
                          <span :class="chapter.growth >= 0 ? 'text-green-600' : 'text-red-600'" class="text-sm font-semibold">
                            {{ chapter.growth >= 0 ? '+' : '' }}{{ chapter.growth.toFixed(1) }}%
                          </span>
                        </div>
                        <!-- Mini sparkline -->
                        <div class="h-8">
                          <v-chart :option="getSparklineOption(chapter)" :autoresize="true" />
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Comparison Chart -->
            <div class="col-span-8">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold text-gray-900">Chapter Comparison</h3>
                <div class="flex gap-2">
                  <button
                    v-for="mode in viewModes"
                    :key="mode.value"
                    @click="viewMode = mode.value"
                    class="px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                    :class="viewMode === mode.value 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                  >
                    {{ mode.label }}
                  </button>
                </div>
              </div>

              <div class="bg-white border-2 border-gray-200 rounded-xl p-6">
                <div v-if="selectedChapters.size === 0" class="h-[500px] flex items-center justify-center text-gray-400">
                  <div class="text-center">
                    <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    <p class="text-lg">Select chapters to compare trends</p>
                  </div>
                </div>
                <div v-else style="height: 500px;">
                  <v-chart :option="comparisonChartOption" :autoresize="true" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { 
  GridComponent, 
  TooltipComponent, 
  LegendComponent,
  DataZoomComponent 
} from 'echarts/components'
import VChart from 'vue-echarts'
import { useWorldMap } from './useWorldMap'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent])

const { fetchCountryTimeSeries, fetchChapterTimeSeries, loadCategories } = useWorldMap()

const props = defineProps({
  countryCode: {
    type: String,
    default: null
  },
  countryName: {
    type: String,
    default: ''
  },
  flowType: {
    type: Number,
    required: true
  },
  flowLabel: {
    type: String,
    default: 'Trade'
  },
  currentMonthLabel: {
    type: String,
    default: ''
  }
})

defineEmits(['close'])

// State
const loading = ref(true)
const timeSeriesData = ref([])
const chapterData = ref([])
const selectedChapters = ref(new Set())
const viewMode = ref('lines') // 'lines', 'stacked', 'percent'

const viewModes = [
  { value: 'lines', label: 'Lines' },
  { value: 'stacked', label: 'Stacked' },
  { value: 'percent', label: '% Share' }
]

// Load categories on mount
onMounted(async () => {
  await loadCategories()
})

// Load data when country changes
watch(() => props.countryCode, async (newCode) => {
  if (newCode) {
    await loadTrendData()
  }
}, { immediate: true })

async function loadTrendData() {
  if (!props.countryCode) {
    console.log('No country code provided')
    return
  }
  
  loading.value = true
  
  try {
    console.log('Loading trend data for:', props.countryCode, 'Flow:', props.flowType)
    
    // Fetch total time series from real database
    const totalData = await fetchCountryTimeSeries(
      props.countryCode, 
      props.flowType
    )
    
    console.log('Total data received:', totalData.length, 'months')
    
    if (totalData.length === 0) {
      console.warn('No time series data found for country:', props.countryCode)
    }
    
    timeSeriesData.value = totalData.map(d => ({
      month: d.month,
      value: d.value
    }))
    
    console.log('Formatted time series:', timeSeriesData.value.length, 'records')
    
    // Fetch chapter breakdown from real database
    const chapterRaw = await fetchChapterTimeSeries(
      props.countryCode,
      props.flowType
    )
    
    console.log('Chapter data received:', chapterRaw.length, 'chapters')
    
    // Calculate latest value and growth for each chapter
    chapterData.value = chapterRaw.map(chapter => {
      const sorted = [...chapter.monthly_data].sort((a, b) => 
        a.month.localeCompare(b.month)
      )
      
      if (sorted.length === 0) return null
      
      const latest = sorted[sorted.length - 1]
      const yearAgo = sorted.length >= 13 ? sorted[sorted.length - 13] : null
      
      return {
        chapter_code: chapter.chapter_code,
        chapter_name: chapter.chapter_name,
        latest_value: latest.value,
        growth: yearAgo 
          ? ((latest.value - yearAgo.value) / yearAgo.value) * 100
          : 0,
        monthly_data: chapter.monthly_data
      }
    }).filter(c => c !== null)
    
    console.log('Processed chapters:', chapterData.value.length)
    
  } catch (error) {
    console.error('Error loading trend data:', error)
  } finally {
    loading.value = false
  }
}

// Computed values
const sortedChapters = computed(() => {
  return [...chapterData.value].sort((a, b) => b.latest_value - a.latest_value)
})

const currentValue = computed(() => {
  if (timeSeriesData.value.length === 0) return 0
  return timeSeriesData.value[timeSeriesData.value.length - 1].value
})

const averageValue = computed(() => {
  if (timeSeriesData.value.length === 0) return 0
  const last12 = timeSeriesData.value.slice(-12)
  return last12.reduce((sum, d) => sum + d.value, 0) / last12.length
})

const growth = computed(() => {
  if (timeSeriesData.value.length < 13) return 0
  const current = currentValue.value
  const yearAgo = timeSeriesData.value[timeSeriesData.value.length - 13].value
  if (!yearAgo || yearAgo === 0) return 0
  return ((current - yearAgo) / yearAgo) * 100
})

// Methods
function toggleChapter(code) {
  const newSet = new Set(selectedChapters.value)
  if (newSet.has(code)) {
    newSet.delete(code)
  } else {
    newSet.add(code)
  }
  selectedChapters.value = newSet
}

function formatValue(value) {
  const actualValue = Math.abs(value) * 1000
  
  if (actualValue >= 1e9) {
    return `$${(actualValue / 1e9).toFixed(2)}B`
  } else if (actualValue >= 1e6) {
    return `$${(actualValue / 1e6).toFixed(2)}M`
  } else if (actualValue >= 1e3) {
    return `$${Math.round(actualValue / 1e3)}K`
  }
  return `$${Math.round(actualValue)}`
}

function formatMonth(monthStr) {
  const [year, month] = monthStr.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

// Chart options
const totalTrendOption = computed(() => {
  if (timeSeriesData.value.length === 0) return {}
  
  return {
    grid: {
      left: '3%',
      right: '3%',
      bottom: '10%',
      top: '10%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const point = params[0]
        return `${formatMonth(point.name)}<br/>${point.marker} ${formatValue(point.value)}`
      }
    },
    xAxis: {
      type: 'category',
      data: timeSeriesData.value.map(d => d.month),
      axisLabel: {
        formatter: (value) => formatMonth(value),
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value) => formatValue(value)
      }
    },
    series: [{
      name: 'Total',
      type: 'line',
      data: timeSeriesData.value.map(d => d.value),
      smooth: true,
      lineStyle: {
        width: 3,
        color: '#4f46e5'
      },
      itemStyle: {
        color: '#4f46e5'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(79, 70, 229, 0.3)' },
            { offset: 1, color: 'rgba(79, 70, 229, 0.05)' }
          ]
        }
      }
    }]
  }
})

function getSparklineOption(chapter) {
  return {
    grid: {
      left: 0,
      right: 0,
      top: 2,
      bottom: 2
    },
    xAxis: {
      type: 'category',
      show: false,
      data: chapter.monthly_data.map(d => d.month)
    },
    yAxis: {
      type: 'value',
      show: false
    },
    series: [{
      type: 'line',
      data: chapter.monthly_data.map(d => d.value),
      smooth: true,
      symbol: 'none',
      lineStyle: {
        width: 1.5,
        color: chapter.growth >= 0 ? '#10b981' : '#ef4444'
      }
    }]
  }
}

const comparisonChartOption = computed(() => {
  if (selectedChapters.value.size === 0) return {}
  
  const selectedData = chapterData.value.filter(c => selectedChapters.value.has(c.chapter_code))
  const colors = ['#4f46e5', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']
  
  const months = timeSeriesData.value.map(d => d.month)
  
  if (viewMode.value === 'lines') {
    // Line chart - compare absolute values
    return {
      grid: {
        left: '3%',
        right: '3%',
        bottom: '12%',
        top: '15%',
        containLabel: true
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          let result = `${formatMonth(params[0].name)}<br/>`
          params.forEach(p => {
            result += `${p.marker} ${p.seriesName}: ${formatValue(p.value)}<br/>`
          })
          return result
        }
      },
      legend: {
        top: 10,
        type: 'scroll'
      },
      xAxis: {
        type: 'category',
        data: months,
        axisLabel: {
          formatter: (value) => formatMonth(value),
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value) => formatValue(value)
        }
      },
      series: selectedData.map((chapter, idx) => ({
        name: `Ch ${chapter.chapter_code}`,
        type: 'line',
        data: chapter.monthly_data.map(d => d.value),
        smooth: true,
        lineStyle: {
          width: 2.5,
          color: colors[idx % colors.length]
        },
        itemStyle: {
          color: colors[idx % colors.length]
        }
      }))
    }
  } else if (viewMode.value === 'stacked') {
    // Stacked area chart
    return {
      grid: {
        left: '3%',
        right: '3%',
        bottom: '12%',
        top: '15%',
        containLabel: true
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          let result = `${formatMonth(params[0].name)}<br/>`
          params.forEach(p => {
            result += `${p.marker} ${p.seriesName}: ${formatValue(p.value)}<br/>`
          })
          return result
        }
      },
      legend: {
        top: 10,
        type: 'scroll'
      },
      xAxis: {
        type: 'category',
        data: months,
        axisLabel: {
          formatter: (value) => formatMonth(value),
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value) => formatValue(value)
        }
      },
      series: selectedData.map((chapter, idx) => ({
        name: `Ch ${chapter.chapter_code}`,
        type: 'line',
        stack: 'total',
        data: chapter.monthly_data.map(d => d.value),
        areaStyle: {},
        lineStyle: {
          width: 0
        },
        itemStyle: {
          color: colors[idx % colors.length]
        }
      }))
    }
  } else {
    // Percent share
    return {
      grid: {
        left: '3%',
        right: '3%',
        bottom: '12%',
        top: '15%',
        containLabel: true
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          let result = `${formatMonth(params[0].name)}<br/>`
          params.forEach(p => {
            result += `${p.marker} ${p.seriesName}: ${p.value.toFixed(1)}%<br/>`
          })
          return result
        }
      },
      legend: {
        top: 10,
        type: 'scroll'
      },
      xAxis: {
        type: 'category',
        data: months,
        axisLabel: {
          formatter: (value) => formatMonth(value),
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: {
          formatter: '{value}%'
        }
      },
      series: selectedData.map((chapter, idx) => {
        // Calculate percentages
        const percentData = chapter.monthly_data.map((d, i) => {
          const total = selectedData.reduce((sum, c) => sum + c.monthly_data[i].value, 0)
          return (d.value / total) * 100
        })
        
        return {
          name: `Ch ${chapter.chapter_code}`,
          type: 'line',
          stack: 'percent',
          data: percentData,
          areaStyle: {},
          lineStyle: {
            width: 0
          },
          itemStyle: {
            color: colors[idx % colors.length]
          }
        }
      })
    }
  }
})
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .bg-white,
.modal-fade-leave-active .bg-white {
  transition: transform 0.3s ease;
}

.modal-fade-enter-from .bg-white {
  transform: scale(0.95);
}

.modal-fade-leave-to .bg-white {
  transform: scale(0.95);
}
</style>
