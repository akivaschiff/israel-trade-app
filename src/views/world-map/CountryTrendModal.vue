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
                <span class="text-white font-semibold">Showing {{ visibleMonths }} months</span>
                <span class="text-indigo-100">Avg: {{ formatValue(averageValue) }}</span>
                <span :class="trendPercentage >= 0 ? 'text-green-300' : 'text-red-300'" class="font-semibold">
                  {{ trendPercentage >= 0 ? '📈' : '📉' }} {{ trendPercentage >= 0 ? '+' : '' }}{{ trendPercentage.toFixed(1) }}% trend
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
          <!-- Month Range Slider -->
          <div class="mb-6 bg-white border-2 border-indigo-200 rounded-xl p-4">
            <div class="flex items-center gap-4">
              <label class="text-sm font-semibold text-gray-700 whitespace-nowrap">Show last:</label>
              <input
                type="range"
                v-model.number="visibleMonths"
                :min="Math.min(6, timeSeriesData.length)"
                :max="timeSeriesData.length"
                step="1"
                class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <span class="text-sm font-semibold text-indigo-600 min-w-[4ch]">{{ visibleMonths }}</span>
              <span class="text-sm text-gray-500">months</span>
            </div>
          </div>

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
            <!-- Left: Chapter/Heading Selector -->
            <div class="col-span-4">
              <h3 class="text-xl font-bold text-gray-900 mb-4">Select Items to Compare</h3>
              <div class="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                <div class="max-h-[500px] overflow-y-auto">
                  <div
                    v-for="chapter in sortedChapters"
                    :key="chapter.chapter_code"
                  >
                    <!-- Chapter Row -->
                    <div class="border-b border-gray-100">
                      <div class="flex items-start gap-2 p-4 hover:bg-indigo-50 transition-colors">
                        <!-- Expand/Collapse Button -->
                        <button
                          @click="toggleChapterExpansion(chapter.chapter_code)"
                          class="mt-1 p-1 hover:bg-indigo-100 rounded transition-colors flex-shrink-0"
                        >
                          <svg
                            class="w-4 h-4 transition-transform text-gray-500"
                            :class="{ 'rotate-90': expandedChapters.has(chapter.chapter_code) }"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>

                        <!-- Checkbox -->
                        <input
                          type="checkbox"
                          :checked="selectedItems.has(`ch-${chapter.chapter_code}`)"
                          @change="toggleItemSelection(`ch-${chapter.chapter_code}`)"
                          class="mt-1 w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 flex-shrink-0"
                        />

                        <!-- Chapter Info -->
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
                      </div>

                      <!-- Headings (shown when expanded) -->
                      <div v-if="expandedChapters.has(chapter.chapter_code)" class="bg-gray-50">
                        <div
                          v-for="heading in getHeadingsForChapter(chapter.chapter_code)"
                          :key="heading.heading_code"
                          class="flex items-start gap-2 p-4 pl-12 border-t border-gray-200 hover:bg-indigo-50 transition-colors"
                        >
                          <!-- Checkbox -->
                          <input
                            type="checkbox"
                            :checked="selectedItems.has(`hd-${heading.heading_code}`)"
                            @change="toggleItemSelection(`hd-${heading.heading_code}`)"
                            class="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 flex-shrink-0"
                          />

                          <!-- Heading Info -->
                          <div class="flex-1 min-w-0">
                            <div class="font-medium text-gray-800 text-sm mb-1">
                              {{ heading.heading_code }}: {{ heading.heading_name }}
                            </div>
                            <div class="flex items-center justify-between gap-2 mb-2">
                              <span class="font-bold text-purple-600 text-sm">{{ formatValue(heading.latest_value) }}</span>
                              <span :class="heading.growth >= 0 ? 'text-green-600' : 'text-red-600'" class="text-xs font-semibold">
                                {{ heading.growth >= 0 ? '+' : '' }}{{ heading.growth.toFixed(1) }}%
                              </span>
                            </div>
                            <!-- Mini sparkline -->
                            <div class="h-6">
                              <v-chart :option="getSparklineOption(heading)" :autoresize="true" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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
                <div v-if="selectedItems.size === 0" class="h-[500px] flex items-center justify-center text-gray-400">
                  <div class="text-center">
                    <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    <p class="text-lg">Select chapters or headings to compare trends</p>
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

const { fetchCountryTimeSeries, fetchChapterTimeSeries, fetchHeadingTimeSeries, loadCategories } = useWorldMap()

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
const headingData = ref([])
const expandedChapters = ref(new Set()) // Track which chapters are expanded to show headings
const selectedItems = ref(new Set()) // Selected chapters or headings for comparison
const viewMode = ref('lines') // 'lines', 'stacked', 'percent'
const visibleMonths = ref(12) // Default to 12 months

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
    return
  }

  loading.value = true

  // Reset state when loading data for a new country
  selectedItems.value = new Set()
  expandedChapters.value = new Set()
  headingData.value = []

  try {
    // Fetch total time series from real database
    const totalData = await fetchCountryTimeSeries(
      props.countryCode,
      props.flowType
    )

    timeSeriesData.value = totalData.map(d => ({
      month: d.month,
      value: d.value
    }))

    // Set visibleMonths to show all available data by default (instead of hardcoded 12)
    visibleMonths.value = Math.min(timeSeriesData.value.length, 24) // Cap at 24 months for performance

    // Fetch chapter breakdown from real database
    const chapterRaw = await fetchChapterTimeSeries(
      props.countryCode,
      props.flowType
    )

    // Store raw chapter data (will be filtered by visibleMonths in computed)
    chapterData.value = chapterRaw.map(chapter => {
      const sorted = [...chapter.monthly_data].sort((a, b) =>
        a.month.localeCompare(b.month)
      )

      return {
        chapter_code: chapter.chapter_code,
        chapter_name: chapter.chapter_name,
        monthly_data: sorted
      }
    }).filter(c => c.monthly_data.length > 0)

  } catch (error) {
    console.error('Error loading trend data:', error)
  } finally {
    loading.value = false
  }
}

// Linear regression helper function
function calculateLinearRegression(data) {
  const n = data.length
  if (n < 2) return { slope: 0, intercept: 0 }

  // Calculate means
  const meanX = (n - 1) / 2  // x values are 0, 1, 2, ..., n-1
  const meanY = data.reduce((sum, val) => sum + val, 0) / n

  // Calculate slope
  let numerator = 0
  let denominator = 0

  for (let i = 0; i < n; i++) {
    numerator += (i - meanX) * (data[i] - meanY)
    denominator += (i - meanX) * (i - meanX)
  }

  const slope = denominator !== 0 ? numerator / denominator : 0
  const intercept = meanY - slope * meanX

  return { slope, intercept }
}

// Helper: Filter monthly data by visible window
function getVisibleMonthlyData(monthlyData) {
  if (!monthlyData || monthlyData.length === 0) return []
  return monthlyData.slice(-visibleMonths.value)
}

// Helper: Calculate stats for a data series
function calculateSeriesStats(monthlyData) {
  const visibleData = getVisibleMonthlyData(monthlyData)
  if (visibleData.length === 0) {
    return { latest_value: 0, growth: 0, visibleData: [] }
  }

  const values = visibleData.map(d => d.value)
  const { slope, intercept } = calculateLinearRegression(values)

  const startValue = intercept
  const endValue = slope * (values.length - 1) + intercept
  const growth = startValue !== 0 ? ((endValue - startValue) / startValue) * 100 : 0

  return {
    latest_value: visibleData[visibleData.length - 1].value,
    growth,
    visibleData
  }
}

// Computed: Chapters with stats based on visible window
const chaptersWithStats = computed(() => {
  return chapterData.value.map(chapter => {
    const stats = calculateSeriesStats(chapter.monthly_data)
    return {
      ...chapter,
      latest_value: stats.latest_value,
      growth: stats.growth,
      visibleData: stats.visibleData
    }
  })
})

// Helper: Get headings for a chapter with stats
function getHeadingsForChapter(chapterCode) {
  const headings = headingData.value.filter(h => h.chapter_code === chapterCode)
  return headings.map(heading => {
    const stats = calculateSeriesStats(heading.monthly_data)
    return {
      ...heading,
      latest_value: stats.latest_value,
      growth: stats.growth,
      visibleData: stats.visibleData
    }
  }).sort((a, b) => b.latest_value - a.latest_value)
}

// Computed values
const sortedChapters = computed(() => {
  return [...chaptersWithStats.value].sort((a, b) => b.latest_value - a.latest_value)
})

// Visible data window (last N months)
const visibleData = computed(() => {
  if (timeSeriesData.value.length === 0) return []
  return timeSeriesData.value.slice(-visibleMonths.value)
})

const currentValue = computed(() => {
  if (visibleData.value.length === 0) return 0
  return visibleData.value[visibleData.value.length - 1].value
})

const averageValue = computed(() => {
  if (visibleData.value.length === 0) return 0
  return visibleData.value.reduce((sum, d) => sum + d.value, 0) / visibleData.value.length
})

// Calculate trend percentage using linear regression
const trendPercentage = computed(() => {
  if (visibleData.value.length < 2) return 0

  const values = visibleData.value.map(d => d.value)
  const { slope, intercept } = calculateLinearRegression(values)

  // Calculate start and end values from regression line
  const startValue = intercept
  const endValue = slope * (values.length - 1) + intercept

  // Avoid division by zero
  if (startValue === 0) return 0

  // Calculate percentage change over the period
  return ((endValue - startValue) / startValue) * 100
})

// Methods
async function toggleChapterExpansion(chapterCode) {
  const newSet = new Set(expandedChapters.value)
  if (newSet.has(chapterCode)) {
    newSet.delete(chapterCode)
  } else {
    newSet.add(chapterCode)
    // Load headings for this chapter if not already loaded
    if (!headingData.value.some(h => h.chapter_code === chapterCode)) {
      await loadHeadingsForChapter(chapterCode)
    }
  }
  expandedChapters.value = newSet
}

async function loadHeadingsForChapter(chapterCode) {
  try {
    const headings = await fetchHeadingTimeSeries(
      props.countryCode,
      props.flowType,
      chapterCode
    )
    // Add to headingData
    headingData.value = [...headingData.value, ...headings]
  } catch (error) {
    console.error('Error loading headings:', error)
  }
}

function toggleItemSelection(id) {
  const newSet = new Set(selectedItems.value)
  if (newSet.has(id)) {
    newSet.delete(id)
  } else {
    newSet.add(id)
  }
  selectedItems.value = newSet
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
  if (visibleData.value.length === 0) return {}

  // Calculate regression line for overlay
  const values = visibleData.value.map(d => d.value)
  const { slope, intercept } = calculateLinearRegression(values)
  const regressionLine = values.map((_, i) => slope * i + intercept)

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
        let result = `${formatMonth(point.name)}<br/>${point.marker} ${formatValue(point.value)}`
        if (params.length > 1 && params[1]) {
          result += `<br/>${params[1].marker} Trend: ${formatValue(params[1].value)}`
        }
        return result
      }
    },
    xAxis: {
      type: 'category',
      data: visibleData.value.map(d => d.month),
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
    series: [
      {
        name: 'Actual',
        type: 'line',
        data: values,
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
      },
      {
        name: 'Trend',
        type: 'line',
        data: regressionLine,
        lineStyle: {
          width: 2,
          color: trendPercentage.value >= 0 ? '#10b981' : '#ef4444',
          type: 'dashed'
        },
        itemStyle: {
          color: trendPercentage.value >= 0 ? '#10b981' : '#ef4444'
        },
        symbolSize: 0
      }
    ]
  }
})

function getSparklineOption(item) {
  // Use visibleData if available, otherwise fall back to all data
  const data = item.visibleData || getVisibleMonthlyData(item.monthly_data)

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
      data: data.map(d => d.month)
    },
    yAxis: {
      type: 'value',
      show: false
    },
    series: [{
      type: 'line',
      data: data.map(d => d.value),
      smooth: true,
      symbol: 'none',
      lineStyle: {
        width: 1.5,
        color: item.growth >= 0 ? '#10b981' : '#ef4444'
      }
    }]
  }
}

const comparisonChartOption = computed(() => {
  if (selectedItems.value.size === 0) return {}

  // Collect selected chapters and headings
  const selectedData = []

  selectedItems.value.forEach(id => {
    if (id.startsWith('ch-')) {
      // It's a chapter
      const chapterCode = id.substring(3)
      const chapter = chaptersWithStats.value.find(c => c.chapter_code === chapterCode)
      if (chapter) {
        selectedData.push({
          ...chapter,
          id,
          displayName: chapter.chapter_name || `Ch ${chapter.chapter_code}`,
          color: '#4f46e5'
        })
      }
    } else if (id.startsWith('hd-')) {
      // It's a heading
      const headingCode = id.substring(3)
      const heading = headingData.value.find(h => h.heading_code === headingCode)
      if (heading) {
        const stats = calculateSeriesStats(heading.monthly_data)
        selectedData.push({
          ...heading,
          ...stats,
          id,
          displayName: heading.heading_name || heading.heading_code,
          color: '#8b5cf6'
        })
      }
    }
  })

  const colors = ['#4f46e5', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

  const months = visibleData.value.map(d => d.month)
  
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
      series: selectedData.map((item, idx) => ({
        name: item.displayName,
        type: 'line',
        data: item.visibleData.map(d => d.value),
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
      series: selectedData.map((item, idx) => ({
        name: item.displayName,
        type: 'line',
        stack: 'total',
        data: item.visibleData.map(d => d.value),
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
      series: selectedData.map((item, idx) => {
        // Calculate percentages
        const percentData = item.visibleData.map((d, i) => {
          const total = selectedData.reduce((sum, c) => sum + c.visibleData[i].value, 0)
          return (d.value / total) * 100
        })

        return {
          name: item.displayName,
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
