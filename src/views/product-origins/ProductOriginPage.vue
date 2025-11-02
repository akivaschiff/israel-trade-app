<template>
  <div class="min-h-[calc(100vh-64px)] bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 p-6">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900">Product Origins</h1>
        <p class="text-gray-600 mt-2">Discover where Israel imports products from - explore trading partners and historical trends</p>
      </div>
    </div>

    <!-- Controls -->
    <div class="max-w-7xl mx-auto p-6">
      <div class="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <!-- Question Framing -->
        <div>
          <h2 class="text-xl font-semibold text-gray-900 mb-4">From where do we buy...</h2>
          
          <!-- Product Selection with Search -->
          <FlatProductSelector
            v-model="selectedProducts"
            :on-search="searchProducts"
          />
        </div>

        <!-- Load Button -->
        <div class="flex justify-end">
          <button
            @click="loadTrends"
            :disabled="!canLoadTrends || loading"
            class="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="loading">Loading...</span>
            <span v-else>Show Import Sources</span>
          </button>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="mt-6 bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 class="text-red-800 font-semibold mb-2">Error Loading Data</h3>
        <p class="text-red-600 text-sm">{{ error }}</p>
      </div>
      
      <!-- Chart Area -->
      <div v-else-if="trendsData.length > 0" class="mt-6 bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-xl font-bold text-gray-900">
              Top {{ trendsData.length }} Import Sources
            </h2>
            <p class="text-gray-600 text-sm mt-1">Viewing: {{ currentWindowLabel }}</p>
          </div>
        </div>
        <div style="height: 500px;">
          <v-chart :option="chartOption" :autoresize="true" />
        </div>

        <!-- Time Window Slider -->
        <div v-if="availableMonths.length > windowSize" class="mt-8 pt-6 border-t border-gray-200">
          <div class="flex items-center justify-between mb-4">
            <label class="text-sm font-semibold text-gray-700">Time Window (17 months)</label>
            <button
              @click="resetTimeWindow"
              class="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Reset to Latest
            </button>
          </div>
          
          <div class="space-y-4">
            <!-- Window controls -->
            <div class="flex items-center gap-3">
              <button
                @click="moveTimeWindow('backward')"
                :disabled="!canMoveBackward"
                class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
              >
                ← Earlier
              </button>
              
              <div class="flex-1 text-center">
                <div class="text-sm font-medium text-gray-900">{{ currentWindowLabel }}</div>
                <div class="text-xs text-gray-500 mt-1">
                  Showing {{ windowSize }} months of {{ availableMonths.length }} available
                </div>
              </div>
              
              <button
                @click="moveTimeWindow('forward')"
                :disabled="!canMoveForward"
                class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
              >
                Later →
              </button>
            </div>

            <!-- Visual timeline -->
            <div class="relative h-8 bg-gray-200 rounded-lg overflow-hidden">
              <div
                class="absolute h-full transition-all duration-300"
                :style="{
                  left: `${(timeWindowStart / (availableMonths.length - 1)) * 100}%`,
                  width: `${((timeWindowEnd - timeWindowStart) / (availableMonths.length - 1)) * 100}%`,
                  backgroundColor: TRADE_COLORS.IMPORTS.primary
                }"
              >
                <div class="h-full flex items-center justify-center text-white text-xs font-medium">
                  Viewing
                </div>
              </div>
            </div>

            <!-- Timeline labels -->
            <div class="flex justify-between text-xs text-gray-500">
              <span>{{ formatMonthLabel(0) }}</span>
              <span>{{ formatMonthLabel(availableMonths.length - 1) }}</span>
            </div>
          </div>
        </div>

        <!-- Country Selector -->
        <div v-if="sortedCountriesList.length > 0" class="mt-8 pt-6 border-t border-gray-200">
          <div class="flex items-center justify-between mb-2">
            <label class="text-sm font-semibold text-gray-700">
              Import Sources
              <span class="text-indigo-600 font-normal">
                ({{ selectedCountries.size }} selected)
              </span>
            </label>
            <div class="flex gap-2">
              <button
                @click="selectTopCountries(5)"
                class="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Top 5
              </button>
              <button
                @click="selectTopCountries(10)"
                class="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Top 10
              </button>
              <button
                @click="selectedCountries = new Set()"
                class="text-xs text-gray-600 hover:text-gray-800 font-medium"
              >
                Clear
              </button>
            </div>
          </div>
          
          <div class="max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-1">
            <label
              v-for="country in sortedCountriesList"
              :key="country.code"
              class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
            >
              <input
                type="checkbox"
                :checked="country.isSelected"
                @change="toggleCountry(country.code)"
                class="rounded"
              />
              <span class="text-sm text-gray-800 flex-1">{{ country.name }}</span>
              <span class="text-xs text-gray-500">{{ formatValue(country.total_value) }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!loading" class="mt-6 bg-white rounded-lg shadow-sm p-12 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No data to display</h3>
        <p class="mt-1 text-sm text-gray-500">Search for products above and click "Show Import Sources"</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { useProductOrigins } from './useProductOrigins'
import { TRADE_COLORS, FLOW_TYPES } from '@/lib/tradeConstants'
import FlatProductSelector from './FlatProductSelector.vue'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent])

const {
  loading,
  error,
  trendsData,
  fullTrendsData,
  availableMonths,
  loadCategories,
  loadCountries,
  searchProducts,
  fetchTrendsForProducts,
  filterDataByTimeWindow
} = useProductOrigins()

const selectedProducts = ref(new Set())
const selectedCountries = ref(new Set()) // Countries to display on chart

// Time window controls (17 months wide)
const windowSize = 17
const timeWindowStart = ref(0)
const timeWindowEnd = ref(0)

onMounted(async () => {
  await loadCategories()
  await loadCountries()
})

// Watch for available months changes to reset window and select top 5 countries
watch(availableMonths, (months) => {
  if (months.length > 0) {
    // Default to most recent 17 months
    timeWindowEnd.value = months.length - 1
    timeWindowStart.value = Math.max(0, timeWindowEnd.value - windowSize + 1)
    
    // Auto-select top 5 countries if nothing selected
    if (selectedCountries.value.size === 0 && fullTrendsData.value.length > 0) {
      const top5 = fullTrendsData.value.slice(0, 5).map(c => c.country_code)
      selectedCountries.value = new Set(top5)
    }
    
    updateVisibleData()
  }
})

// Watch for selected countries changes
watch(selectedCountries, () => {
  updateVisibleData()
}, { deep: true })

// Update visible data based on time window and selected countries
function updateVisibleData() {
  if (fullTrendsData.value.length === 0) return
  trendsData.value = filterDataByTimeWindow(
    timeWindowStart.value, 
    timeWindowEnd.value,
    Array.from(selectedCountries.value)
  )
}

// Move time window one month at a time
function moveTimeWindow(direction) {
  if (direction === 'forward') {
    timeWindowEnd.value = Math.min(availableMonths.value.length - 1, timeWindowEnd.value + 1)
    timeWindowStart.value = Math.max(0, timeWindowEnd.value - windowSize + 1)
  } else {
    timeWindowStart.value = Math.max(0, timeWindowStart.value - 1)
    timeWindowEnd.value = Math.min(availableMonths.value.length - 1, timeWindowStart.value + windowSize - 1)
  }
  updateVisibleData()
}

// Reset to most recent window
function resetTimeWindow() {
  if (availableMonths.value.length === 0) return
  timeWindowEnd.value = availableMonths.value.length - 1
  timeWindowStart.value = Math.max(0, timeWindowEnd.value - windowSize + 1)
  updateVisibleData()
}

// Format month label
function formatMonthLabel(index) {
  if (!availableMonths.value[index]) return ''
  const month = availableMonths.value[index]
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[month.month - 1]} ${month.year}`
}

// Computed properties for window controls
const canMoveBackward = computed(() => timeWindowStart.value > 0)
const canMoveForward = computed(() => timeWindowEnd.value < availableMonths.value.length - 1)
const currentWindowLabel = computed(() => {
  if (availableMonths.value.length === 0) return ''
  return `${formatMonthLabel(timeWindowStart.value)} - ${formatMonthLabel(timeWindowEnd.value)}`
})

const canLoadTrends = computed(() => selectedProducts.value.size > 0)

const sortedCountriesList = computed(() => {
  return fullTrendsData.value.map(country => ({
    code: country.country_code,
    name: country.country_name,
    total_value: country.total_value,
    isSelected: selectedCountries.value.has(country.country_code)
  }))
})

// Load trends data (always imports)
async function loadTrends() {
  if (!canLoadTrends.value) return
  await fetchTrendsForProducts(Array.from(selectedProducts.value), FLOW_TYPES.IMPORTS)
}

// Toggle country selection
function toggleCountry(countryCode) {
  const newSet = new Set(selectedCountries.value)
  newSet.has(countryCode) ? newSet.delete(countryCode) : newSet.add(countryCode)
  selectedCountries.value = newSet
}

// Select top N countries
function selectTopCountries(n) {
  selectedCountries.value = new Set(fullTrendsData.value.slice(0, n).map(c => c.country_code))
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

// Chart configuration - reused from TrendsPage
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
      '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
      '#06b6d4', '#f43f5e', '#a855f7', '#eab308', '#22c55e',
      '#8b5cf6', '#f59e0b', '#14b8a6', '#ef4444', '#10b981',
      '#fb7185', '#38bdf8', '#c084fc', '#fbbf24', '#4ade80'
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
      connectNulls: true,
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
        // Filter out null values and sort by value descending
        const validParams = params
          .filter(param => param.value !== null)
          .sort((a, b) => b.value - a.value)
        
        let result = `<strong>${params[0].axisValue}</strong><br/>`
        validParams.forEach(param => {
          result += `${param.marker} ${param.seriesName}: ${formatValue(param.value)}<br/>`
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
      data: sortedDates,
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
