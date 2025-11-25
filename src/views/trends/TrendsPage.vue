<template>
  <div class="trends-page min-h-[calc(100vh-64px)] bg-slate-50">
    <!-- Hero Header -->
    <div class="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIHN0cm9rZT0iIzMzNDQ1NSIgc3Ryb2tlLXdpZHRoPSIuNSIgb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-30"></div>
      <div class="relative max-w-7xl mx-auto px-6 py-12">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <div class="w-1 h-8 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full"></div>
              <span class="text-amber-400 text-sm font-medium tracking-widest uppercase">Trade Analysis</span>
            </div>
            <h1 class="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
              Product Trends
            </h1>
            <p class="text-slate-400 mt-3 text-lg max-w-2xl">
              Track trade patterns and compare products across countries.
            </p>
          </div>

          <!-- Flow Toggle in Header -->
          <div class="flex items-center gap-3">
            <div class="flex p-1 bg-slate-800/50 rounded-xl border border-slate-700">
              <button
                @click="selectedFlow = FLOW_TYPES.IMPORTS"
                :class="[
                  'flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200',
                  selectedFlow === FLOW_TYPES.IMPORTS
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-400 hover:text-white'
                ]"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                Imports
              </button>
              <button
                @click="selectedFlow = FLOW_TYPES.EXPORTS"
                :class="[
                  'flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200',
                  selectedFlow === FLOW_TYPES.EXPORTS
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                    : 'text-slate-400 hover:text-white'
                ]"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                Exports
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="max-w-7xl mx-auto px-6 -mt-6 relative z-10">
      <div class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/60 p-8 space-y-8">

        <!-- Product Selection with Search -->
        <SmartProductSelector
          v-model="selectedProducts"
          :on-search="searchProducts"
          :categoriesData="categoriesData"
        />

        <!-- Country Selection -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Select Countries to Compare
              <span v-if="selectedCountries.length > 0" class="text-blue-600 normal-case tracking-normal ml-2">
                ({{ selectedCountries.length }} selected)
              </span>
            </label>
            <button
              v-if="sortedCountries.length > 0"
              @click="toggleSelectAll"
              class="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              {{ allCountriesSelected ? 'Deselect All' : 'Select All' }}
            </button>
          </div>

          <!-- No products selected message -->
          <div v-if="!hasProducts" class="text-sm text-slate-400 py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <svg class="w-8 h-8 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search for products above to see available countries
          </div>

          <!-- Loading countries -->
          <div v-else-if="fetchingCountries" class="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            <p class="text-sm text-slate-500 mt-3">Finding trading partners...</p>
          </div>

          <!-- Countries list -->
          <div v-else-if="sortedCountries.length > 0">
            <div class="text-xs text-slate-500 mb-3">
              {{ sortedCountries.length }} countries traded these products (sorted by trade value)
            </div>
            <div class="max-h-64 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50/30 divide-y divide-slate-100">
              <label
                v-for="[code, country] in sortedCountries"
                :key="code"
                class="flex items-center gap-3 px-4 py-3 hover:bg-white cursor-pointer transition-colors group"
              >
                <input
                  type="checkbox"
                  :value="code"
                  v-model="selectedCountries"
                  class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                />
                <span class="text-sm text-slate-700 flex-1 group-hover:text-slate-900 transition-colors">{{ country.name }}</span>
                <span class="text-xs font-medium text-slate-400 tabular-nums">{{ formatValue(country.total_value) }}</span>
              </label>
            </div>
          </div>

          <!-- No countries found -->
          <div v-else class="text-sm text-slate-400 py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <svg class="w-8 h-8 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            No trading partners found for these products
          </div>
        </div>

        <!-- Load Button -->
        <div class="flex justify-end pt-4 border-t border-slate-100">
          <button
            @click="loadTrends"
            :disabled="!canLoadTrends || loading"
            class="group relative px-10 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white font-semibold rounded-xl hover:from-slate-800 hover:to-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 disabled:shadow-none"
          >
            <span v-if="loading" class="flex items-center gap-2">
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading Trends...
            </span>
            <span v-else class="flex items-center gap-2">
              Show Trends
              <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </div>
      </div>

      <!-- Chart Area -->
      <div v-if="trendsData.length > 0" class="mt-8 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
        <!-- Chart Header -->
        <div class="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div class="flex items-center gap-3">
            <div :class="[
              'w-3 h-3 rounded-full',
              selectedFlow === FLOW_TYPES.EXPORTS ? 'bg-amber-500' : 'bg-blue-600'
            ]"></div>
            <h2 class="text-2xl font-serif font-bold text-slate-900">
              {{ selectedFlow === FLOW_TYPES.EXPORTS ? 'Export' : 'Import' }} Trends
            </h2>
          </div>
          <p class="text-sm text-slate-500 mt-1 ml-6">Trade values over time by country</p>
        </div>

        <!-- Chart -->
        <div class="p-6" style="height: 520px;">
          <v-chart :option="chartOption" :autoresize="true" />
        </div>

        <!-- Time Range Selector -->
        <div v-if="availableMonths.length > 0" class="px-8 py-6 bg-slate-50 border-t border-slate-100">
          <div class="flex items-center justify-between mb-4">
            <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Adjust Time Range</label>
            <button
              @click="resetToDefaultRange"
              class="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              Reset to Last 12 Months
            </button>
          </div>

          <div class="flex flex-wrap items-end gap-4">
            <!-- Start Month -->
            <div class="flex-1 min-w-[140px]">
              <label class="block text-xs text-slate-500 mb-2">From</label>
              <select
                v-model="selectedStartMonth"
                class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              >
                <option
                  v-for="(month, index) in availableMonths"
                  :key="month.key"
                  :value="index"
                  :disabled="index < selectedEndMonth"
                >
                  {{ formatMonthLabel(index) }}
                </option>
              </select>
            </div>

            <div class="hidden md:flex items-center pb-2.5">
              <svg class="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>

            <!-- End Month -->
            <div class="flex-1 min-w-[140px]">
              <label class="block text-xs text-slate-500 mb-2">To</label>
              <select
                v-model="selectedEndMonth"
                class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              >
                <option
                  v-for="(month, index) in availableMonths"
                  :key="month.key"
                  :value="index"
                  :disabled="index > selectedStartMonth"
                >
                  {{ formatMonthLabel(index) }}
                </option>
              </select>
            </div>

            <!-- Apply Button -->
            <button
              @click="applyTimeRange"
              :disabled="loading"
              class="px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="loading">Updating...</span>
              <span v-else>Apply Range</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!loading" class="mt-8 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/60 p-16 text-center">
        <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
          <svg class="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 class="text-xl font-serif font-semibold text-slate-900">No trends to display</h3>
        <p class="mt-2 text-slate-500 max-w-sm mx-auto">Search for products and select countries above, then click "Show Trends" to visualize trade patterns.</p>
      </div>
    </div>

    <!-- Bottom spacing -->
    <div class="h-12"></div>
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
import SmartProductSelector from '@/components/SmartProductSelector.vue'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent])

const {
  loading,
  trendsData,
  categoriesData,
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

const selectedFlow = ref(FLOW_TYPES.IMPORTS) // Default to IMPORTS
const selectedProducts = ref(new Set())
const selectedCountries = ref([])
const fetchingCountries = ref(false)

// Time range as indices into availableMonths array
const selectedStartMonth = ref(0)
const selectedEndMonth = ref(0)

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

// Check if all countries are selected
const allCountriesSelected = computed(() => {
  return sortedCountries.value.length > 0 && 
         selectedCountries.value.length === sortedCountries.value.length
})

// Toggle select all countries
function toggleSelectAll() {
  if (allCountriesSelected.value) {
    selectedCountries.value = []
  } else {
    selectedCountries.value = sortedCountries.value.map(([code]) => code)
  }
}

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
  
  selectedEndMonth.value = 0 // Latest month (months are sorted newest first)
  selectedStartMonth.value = Math.min(11, availableMonths.value.length - 1) // 12 months back
}

// Apply time range and reload trends
async function applyTimeRange() {
  if (!canLoadTrends.value) return
  
  const startMonth = availableMonths.value[selectedStartMonth.value]
  const endMonth = availableMonths.value[selectedEndMonth.value]
  
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
  const startMonth = availableMonths.value[selectedStartMonth.value]
  const endMonth = availableMonths.value[selectedEndMonth.value]
  
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
        // Filter out null/undefined/NaN values and sort by value descending (highest first)
        const validParams = params
          .filter(param => param.value != null && !isNaN(param.value) && param.value !== '')
          .sort((a, b) => b.value - a.value) // b - a = descending order
        
        if (validParams.length === 0) {
          return `<strong>${params[0]?.axisValue || ''}</strong><br/>No data`
        }
        
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
