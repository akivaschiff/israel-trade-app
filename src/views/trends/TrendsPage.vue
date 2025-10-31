<template>
  <div class="min-h-[calc(100vh-64px)] bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 p-6">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900">Product Trends Over Time</h1>
        <p class="text-gray-600 mt-2">Compare trade flows for specific products across countries</p>
      </div>
    </div>

    <!-- Controls -->
    <div class="max-w-7xl mx-auto p-6">
      <div class="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <!-- Flow Selection -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Trade Flow</label>
          <div class="flex gap-2">
            <button
              @click="selectedFlow = FLOW_TYPES.EXPORTS"
              :class="[
                'px-6 py-2 rounded-lg font-medium transition-colors',
                selectedFlow === FLOW_TYPES.EXPORTS
                  ? 'text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              ]"
              :style="selectedFlow === FLOW_TYPES.EXPORTS ? { backgroundColor: TRADE_COLORS.EXPORTS.primary } : {}"
            >
              Exports
            </button>
            <button
              @click="selectedFlow = FLOW_TYPES.IMPORTS"
              :class="[
                'px-6 py-2 rounded-lg font-medium transition-colors',
                selectedFlow === FLOW_TYPES.IMPORTS
                  ? 'text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              ]"
              :style="selectedFlow === FLOW_TYPES.IMPORTS ? { backgroundColor: TRADE_COLORS.IMPORTS.primary } : {}"
            >
              Imports
            </button>
          </div>
        </div>

        <!-- Product Selection with Search -->
        <ProductSelector
          v-model="selectedProducts"
          :on-search="searchProducts"
        />

        <!-- Country Selection -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Select Countries to Compare
            <span v-if="selectedCountries.length > 0" class="text-indigo-600 font-normal">
              ({{ selectedCountries.length }} selected)
            </span>
          </label>
          
          <!-- No products selected message -->
          <div v-if="!hasProducts" class="text-sm text-gray-500 italic py-8 text-center border border-gray-300 rounded-lg">
            Select products first to see available countries
          </div>
          
          <!-- Loading countries -->
          <div v-else-if="fetchingCountries" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            <p class="text-sm text-gray-500 mt-2">Loading countries...</p>
          </div>
          
          <!-- Countries list -->
          <div v-else-if="sortedCountries.length > 0">
            <div class="text-xs text-gray-500 mb-2">
              {{ sortedCountries.length }} countries traded these products in the last year (sorted by value)
            </div>
            <div class="max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-1">
              <label
                v-for="[code, country] in sortedCountries"
                :key="code"
                class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  :value="code"
                  v-model="selectedCountries"
                  class="rounded"
                />
                <span class="text-sm text-gray-800 flex-1">{{ country.name }}</span>
                <span class="text-xs text-gray-500">{{ formatValue(country.total_value) }}</span>
              </label>
            </div>
          </div>
          
          <!-- No countries found -->
          <div v-else class="text-sm text-gray-500 italic py-8 text-center border border-gray-300 rounded-lg">
            No countries found trading these products in the last year
          </div>
        </div>

        <!-- Load Button -->
        <div class="flex justify-end">
          <button
            @click="loadTrends"
            :disabled="!canLoadTrends || loading"
            class="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="loading">Loading...</span>
            <span v-else>Show Trends</span>
          </button>
        </div>
      </div>

      <!-- Chart Area -->
      <div v-if="trendsData.length > 0" class="mt-6 bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">
          {{ selectedFlow === FLOW_TYPES.EXPORTS ? 'Export' : 'Import' }} Trends
        </h2>
        <div style="height: 500px;">
          <v-chart :option="chartOption" :autoresize="true" />
        </div>

        <!-- Time Range Slider - Below Chart -->
        <div v-if="availableMonths.length > 0" class="mt-8 pt-6 border-t border-gray-200">
          <div class="flex items-center justify-between mb-3">
            <label class="text-sm font-semibold text-gray-700">Time Range</label>
            <button
              @click="resetToDefaultRange"
              class="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Reset to Last Year
            </button>
          </div>
          
          <div class="space-y-4">
            <!-- Range Display -->
            <div class="flex items-center justify-between text-sm text-gray-700">
              <span class="font-medium">{{ formatMonthLabel(timeRange[0]) }}</span>
              <span class="text-gray-500">to</span>
              <span class="font-medium">{{ formatMonthLabel(timeRange[1]) }}</span>
            </div>

            <!-- Slider -->
            <div class="relative px-2">
              <input
                type="range"
                v-model.number="timeRange[0]"
                :min="0"
                :max="availableMonths.length - 1"
                class="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb-lower"
                style="pointer-events: none;"
              />
              <input
                type="range"
                v-model.number="timeRange[1]"
                :min="0"
                :max="availableMonths.length - 1"
                class="absolute w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer slider-thumb-upper"
                style="pointer-events: none;"
              />
              <div class="relative h-2 bg-gray-200 rounded-lg">
                <div
                  class="absolute h-2 rounded-lg"
                  :style="{
                    left: `${(timeRange[0] / (availableMonths.length - 1)) * 100}%`,
                    width: `${((timeRange[1] - timeRange[0]) / (availableMonths.length - 1)) * 100}%`,
                    backgroundColor: selectedFlow === FLOW_TYPES.EXPORTS ? TRADE_COLORS.EXPORTS.primary : TRADE_COLORS.IMPORTS.primary
                  }"
                ></div>
              </div>
              <!-- Clickable overlay for both thumbs -->
              <div class="absolute inset-0" style="pointer-events: auto;">
                <input
                  type="range"
                  v-model.number="timeRange[0]"
                  :min="0"
                  :max="timeRange[1]"
                  class="absolute w-full h-2 bg-transparent appearance-none cursor-pointer"
                  @input="constrainRange"
                />
                <input
                  type="range"
                  v-model.number="timeRange[1]"
                  :min="timeRange[0]"
                  :max="availableMonths.length - 1"
                  class="absolute w-full h-2 bg-transparent appearance-none cursor-pointer"
                  @input="constrainRange"
                />
              </div>
            </div>

            <!-- Month markers -->
            <div class="flex justify-between text-xs text-gray-500 px-2">
              <span>{{ formatMonthLabel(0) }}</span>
              <span>{{ formatMonthLabel(availableMonths.length - 1) }}</span>
            </div>
          </div>

          <!-- Apply Button -->
          <div class="flex justify-end mt-4">
            <button
              @click="applyTimeRange"
              :disabled="loading"
              class="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="loading">Updating...</span>
              <span v-else>Apply Time Range</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!loading" class="mt-6 bg-white rounded-lg shadow-sm p-12 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No trends to display</h3>
        <p class="mt-1 text-sm text-gray-500">Search for products and select countries, then click "Show Trends"</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { useTrends } from './useTrends'
import { TRADE_COLORS, FLOW_TYPES } from '@/lib/tradeConstants'
import ProductSelector from './ProductSelector.vue'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent])

const {
  loading,
  trendsData,
  countriesMap,
  relevantCountries,
  availableMonths,
  loadCategories,
  loadCountries,
  searchProducts,
  fetchRelevantCountries,
  fetchAvailableMonths,
  fetchTrends
} = useTrends()

const selectedFlow = ref(FLOW_TYPES.EXPORTS)
const selectedProducts = ref(new Set())
const selectedCountries = ref([])
const fetchingCountries = ref(false)

// Time range as indices into availableMonths array
const timeRange = ref([0, 0])

let fetchCountriesTimeout = null

onMounted(async () => {
  await loadCategories()
  await loadCountries()
  await fetchAvailableMonths()
  
  // Set default range to last 12 months
  if (availableMonths.value.length > 0) {
    resetToDefaultRange()
  }
})

// Helper computed
const hasProducts = computed(() => selectedProducts.value.size > 0)

// Sorted countries for display
const sortedCountries = computed(() => {
  return relevantCountries.value
    .map(c => [c.code, { name: c.name, total_value: c.total_value }])
    .sort((a, b) => b[1].total_value - a[1].total_value)
})

// Can load trends if we have products and countries
const canLoadTrends = computed(() => {
  return hasProducts.value && selectedCountries.value.length > 0
})

// Watch for product/flow changes to fetch relevant countries (debounced)
watch([selectedProducts, selectedFlow], ([products, flow]) => {
  clearTimeout(fetchCountriesTimeout)
  
  if (products.size === 0) {
    relevantCountries.value = []
    selectedCountries.value = []
    fetchingCountries.value = false
    return
  }
  
  fetchingCountries.value = true
  
  fetchCountriesTimeout = setTimeout(async () => {
    await fetchRelevantCountries(Array.from(products), flow)
    
    // Remove any selected countries that are no longer relevant
    const relevantCodes = new Set(relevantCountries.value.map(c => c.code))
    selectedCountries.value = selectedCountries.value.filter(code => relevantCodes.has(code))
    
    fetchingCountries.value = false
  }, 500)
}, { deep: true })

// Format month label from index
function formatMonthLabel(index) {
  if (!availableMonths.value[index]) return ''
  const month = availableMonths.value[index]
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[month.period - 1]} ${month.year}`
}

// Reset to default range (last 12 months)
function resetToDefaultRange() {
  if (availableMonths.value.length === 0) return
  
  const latestIndex = 0 // Months are sorted newest first
  const startIndex = Math.min(11, availableMonths.value.length - 1) // 12 months back
  
  timeRange.value = [startIndex, latestIndex]
}

// Constrain range so start <= end
function constrainRange() {
  if (timeRange.value[0] > timeRange.value[1]) {
    timeRange.value = [timeRange.value[1], timeRange.value[0]]
  }
}

// Apply time range and reload trends
async function applyTimeRange() {
  if (!canLoadTrends.value) return
  
  const startMonth = availableMonths.value[timeRange.value[0]]
  const endMonth = availableMonths.value[timeRange.value[1]]
  
  await fetchTrends(
    Array.from(selectedProducts.value),
    selectedCountries.value,
    selectedFlow.value,
    startMonth.year,
    startMonth.period,
    endMonth.year,
    endMonth.period
  )
}

// Load trends data with default time range
async function loadTrends() {
  if (!canLoadTrends.value) return
  
  // Use current time range
  const startMonth = availableMonths.value[timeRange.value[0]]
  const endMonth = availableMonths.value[timeRange.value[1]]
  
  await fetchTrends(
    Array.from(selectedProducts.value),
    selectedCountries.value,
    selectedFlow.value,
    startMonth.year,
    startMonth.period,
    endMonth.year,
    endMonth.period
  )
}

// Format value for display
function formatValue(value) {
  const actualValue = value * 1000
  if (actualValue >= 1e9) {
    return `$${(actualValue / 1e9).toFixed(2)}B`
  } else if (actualValue >= 1e6) {
    return `$${(actualValue / 1e6).toFixed(2)}M`
  } else if (actualValue >= 1e3) {
    return `$${Math.round(actualValue / 1e3)}K`
  }
  return `$${Math.round(actualValue)}`
}

// Chart configuration
const chartOption = computed(() => {
  if (trendsData.value.length === 0) return {}

  // Collect all unique dates from all countries and sort them
  const allDatesSet = new Set()
  trendsData.value.forEach(country => {
    country.data_points.forEach(point => {
      allDatesSet.add(point.date)
    })
  })
  
  const sortedDates = Array.from(allDatesSet).sort((a, b) => {
    const [yearA, monthA] = a.split('-').map(Number)
    const [yearB, monthB] = b.split('-').map(Number)
    if (yearA !== yearB) return yearA - yearB
    return monthA - monthB
  })

  // Generate series for each country
  const series = trendsData.value.map((country, index) => {
    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
      '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
    ]
    
    // Create a map of date to value for this country
    const dataMap = new Map()
    country.data_points.forEach(point => {
      dataMap.set(point.date, point.value)
    })
    
    // Map sorted dates to values (null if country has no data for that date)
    const data = sortedDates.map(date => dataMap.get(date) ?? null)
    
    return {
      name: country.country_name,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      connectNulls: true, // Connect across missing data points
      lineStyle: {
        width: 3
      },
      itemStyle: {
        color: colors[index % colors.length]
      },
      data: data
    }
  })

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: (params) => {
        let result = `<strong>${params[0].axisValue}</strong><br/>`
        params.forEach(param => {
          if (param.value !== null) {
            result += `${param.marker} ${param.seriesName}: ${formatValue(param.value)}<br/>`
          }
        })
        return result
      }
    },
    legend: {
      data: trendsData.value.map(c => c.country_name),
      top: 0,
      type: 'scroll'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: sortedDates, // Explicitly provide sorted dates
      boundaryGap: false,
      axisLabel: {
        rotate: 45,
        formatter: (value) => {
          const [year, month] = value.split('-')
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          return `${months[parseInt(month) - 1]} ${year}`
        }
      }
    },
    yAxis: {
      type: 'value',
      name: 'Trade Value (thousands USD)',
      axisLabel: {
        formatter: (value) => formatValue(value)
      }
    },
    series: series
  }
})
</script>

<style scoped>
/* Custom slider styling */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #4f46e5;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  pointer-events: auto;
}

input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #4f46e5;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  pointer-events: auto;
}

input[type="range"]::-webkit-slider-thumb:hover {
  background: #4338ca;
}

input[type="range"]::-moz-range-thumb:hover {
  background: #4338ca;
}
</style>
