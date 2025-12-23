<template>
  <div class="min-h-[calc(100vh-64px)] relative bg-slate-50">
    <!-- Full Screen Initial Loading -->
    <div v-if="isInitialLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-slate-700 mb-6"></div>
        <h2 class="text-xl font-semibold text-slate-700 mb-2">Loading World Map</h2>
        <p class="text-sm text-slate-500">Preparing trade data visualization...</p>
      </div>
    </div>

    <!-- Hero Header -->
    <div v-show="!isInitialLoading" class="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIHN0cm9rZT0iIzMzNDQ1NSIgc3Ryb2tlLXdpZHRoPSIuNSIgb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-30"></div>
      <div class="relative max-w-7xl mx-auto px-6 py-12">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <div class="w-1 h-8 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full"></div>
              <span class="text-amber-400 text-sm font-medium tracking-widest uppercase">Interactive Map</span>
            </div>
            <h1 class="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
              Global Trade Overview
            </h1>
            <p class="text-slate-400 mt-3 text-lg max-w-2xl">
              Visualize trade patterns across countries and time periods.
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

    <!-- Controls Bar -->
    <div v-show="!isInitialLoading" class="bg-white border-b border-slate-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-3">
        <div class="flex items-center justify-between gap-6 flex-wrap">
          <!-- Time Range Controls -->
          <div class="flex items-center gap-6 flex-wrap">
            <!-- Month Range Slider -->
            <div class="flex items-center gap-3">
              <label class="text-sm font-medium text-slate-600">Months:</label>
              <div class="flex items-center gap-2">
                <input
                  type="range"
                  v-model.number="monthRange"
                  :disabled="dataLoading"
                  min="1"
                  max="12"
                  step="1"
                  class="w-28 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#053778] disabled:opacity-50 disabled:cursor-wait"
                />
                <span class="text-sm font-semibold text-[#053778] min-w-[2ch] text-center bg-blue-50 px-2 py-0.5 rounded-md">
                  {{ monthRange }}
                </span>
              </div>
            </div>

            <!-- End Month Selector -->
            <div class="flex items-center gap-3">
              <label class="text-sm font-medium text-slate-600">Ending:</label>
              <div class="relative flex items-center gap-2">
                <select
                  v-model="selectedMonth"
                  :disabled="dataLoading"
                  class="px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-wait appearance-none pr-10 cursor-pointer"
                >
                  <option
                    v-for="month in availableMonths"
                    :key="month.key"
                    :value="month.key"
                  >
                    {{ month.label }}
                  </option>
                </select>
                <!-- Custom dropdown arrow -->
                <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
                <!-- Loading Indicator -->
                <div v-if="dataLoading" class="flex items-center">
                  <svg class="animate-spin h-5 w-5 text-[#053778]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Legend -->
          <div class="flex items-center gap-3 text-sm px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
            <span class="text-slate-500 font-medium">Trade Value:</span>
            <div class="flex items-center gap-1">
              <div class="w-4 h-4 rounded bg-white border border-slate-300"></div>
              <span class="text-xs text-slate-500">None</span>
            </div>
            <div class="flex items-center gap-1 ml-2">
              <div
                class="w-4 h-4 rounded"
                :style="{ backgroundColor: selectedFlow === FLOW_TYPES.EXPORTS ? TRADE_COLORS.EXPORTS.lighter : TRADE_COLORS.IMPORTS.gradient[0] }"
              ></div>
              <span class="text-xs text-slate-500">Low</span>
            </div>
            <div class="flex items-center gap-1">
              <div
                class="w-4 h-4 rounded"
                :style="{ backgroundColor: selectedFlow === FLOW_TYPES.EXPORTS ? TRADE_COLORS.EXPORTS.dark : TRADE_COLORS.IMPORTS.gradient[6] }"
              ></div>
              <span class="text-xs text-slate-500">High</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Map Container -->
    <div class="relative">
      <div
        v-if="mapReady"
        class="bg-white"
        style="height: calc(100vh - 170px);"
      >
        <div
          class="w-full h-full transition-opacity duration-300"
          :class="{ 'opacity-60': dataLoading, 'opacity-100': !dataLoading }"
        >
          <v-chart
            ref="chartRef"
            :option="mapOption"
            :autoresize="true"
            :update-options="{ notMerge: false, lazyUpdate: false }"
            @click="handleMapClick"
            @georoam="handleGeoRoam"
            style="height: 100%; width: 100%;"
          />
        </div>
      </div>

      <!-- Zoom Controls -->
      <div v-if="mapReady && !isInitialLoading" class="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
        <div class="bg-white rounded-xl shadow-lg border border-slate-200 p-1.5 flex flex-col gap-1">
          <button
            @click="zoomIn"
            class="p-2.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
            aria-label="Zoom in"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <div class="h-px bg-slate-200 mx-2"></div>
          <button
            @click="zoomOut"
            class="p-2.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
            aria-label="Zoom out"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
            </svg>
          </button>
          <div class="h-px bg-slate-200 mx-2"></div>
          <button
            @click="resetZoom"
            class="p-2.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
            aria-label="Reset zoom"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Country Details (Inline Below Map) -->
    <CountryTrendModal
      :country-code="selectedCountryCode"
      :country-name="selectedCountryName"
      :flow-type="selectedFlow"
      :flow-label="selectedFlow === FLOW_TYPES.IMPORTS ? 'Imports' : 'Exports'"
      :current-month-label="currentMonthLabel"
      @close="clearCountrySelection"
    />

    <!-- Bottom Spacing -->
    <div class="h-12"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { use, registerMap } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { MapChart } from 'echarts/charts'
import { TooltipComponent, VisualMapComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { useWorldMap } from './useWorldMap'
import CountryTrendModal from './CountryTrendModal.vue'
import { TRADE_COLORS, FLOW_TYPES, getFlowGradient } from '@/lib/tradeConstants'
import { createKMeansColorScale } from '@/lib/kmeansScale'

use([CanvasRenderer, MapChart, TooltipComponent, VisualMapComponent])

const {
  loading,
  availableMonths,
  countryTotals,
  loadCountries,
  loadCategories,
  fetchAvailableMonths,
  fetchCountryTotals,
  fetchCountryTotalsRange
} = useWorldMap()

const mapReady = ref(false)
const selectedFlow = ref(FLOW_TYPES.IMPORTS) // Default to Imports
const selectedMonth = ref(null)
const monthRange = ref(1) // Number of months to aggregate (1-12)
const dataLoading = ref(false) // Separate loading state for data updates
const previousCountryTotals = ref([]) // Keep previous data during loading
const selectedCountryCode = ref(null)
const selectedCountryName = ref('')
const chartRef = ref(null) // Reference to the chart component
const hasLoadedOnce = ref(false) // Track if initial load is complete

// K-Means distribution data for visualization
const colorBands = ref([])
const maxTradeValue = ref(0)
const minTradeValue = ref(0)
const totalCountriesWithData = ref(0)
const allTradeValues = ref([]) // Store all values for histogram
const expandedBands = ref({}) // Track which bands are expanded

// Computed property for initial loading state
const isInitialLoading = computed(() => {
  return !hasLoadedOnce.value && (loading.value || !mapReady.value || countryTotals.value.length === 0)
})

onMounted(async () => {
  // Load static countries data
  await loadCountries()

  // Load categories data
  await loadCategories()

  // Load world map
  try {
    const response = await fetch('https://raw.githubusercontent.com/apache/echarts/master/test/data/map/json/world.json')
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const geoJson = await response.json()
    registerMap('world', geoJson)
    mapReady.value = true
  } catch (error) {
    console.error('Error loading world map:', error)
  }

  // Load available months
  const months = await fetchAvailableMonths()
  if (months.length > 0) {
    selectedMonth.value = months[0].key // Default to latest month
  }
})

// Current month label for display
const currentMonthLabel = computed(() => {
  if (monthRange.value === 1) {
    const month = availableMonths.value.find(m => m.key === selectedMonth.value)
    return month?.label || ''
  } else {
    // Get the range of months
    const endIndex = availableMonths.value.findIndex(m => m.key === selectedMonth.value)
    if (endIndex === -1) return ''
    const startIndex = Math.min(endIndex + monthRange.value - 1, availableMonths.value.length - 1)
    const startMonth = availableMonths.value[startIndex]
    const endMonth = availableMonths.value[endIndex]
    return `${startMonth.label} - ${endMonth.label}`
  }
})

// Sorted color bands for display (from low to high values)
const sortedColorBands = computed(() => {
  return [...colorBands.value].sort((a, b) => a.min - b.min)
})

// Toggle band expansion
function toggleBandExpansion(idx) {
  expandedBands.value[idx] = !expandedBands.value[idx]
}

// Get countries in a specific band
function getCountriesInBand(band) {
  return countryTotals.value
    .filter(country => {
      const value = country.total_value
      return value >= band.min && value <= band.max
    })
    .sort((a, b) => b.total_value - a.total_value) // Sort by value descending
}

// Watch for changes in flow, month selection, or range
watch([selectedFlow, selectedMonth, monthRange], async ([newFlow, newMonth, newRange]) => {
  if (newMonth) {
    dataLoading.value = true

    if (newRange === 1) {
      // Single month - use original function
      const [year, period] = newMonth.split('-')
      await fetchCountryTotals(parseInt(year), parseInt(period), newFlow)
    } else {
      // Multiple months - get the range and aggregate
      const endIndex = availableMonths.value.findIndex(m => m.key === newMonth)
      if (endIndex !== -1) {
        // Get months from end backwards by range (e.g., if range=3, get last 3 months)
        const startIndex = Math.min(endIndex + newRange - 1, availableMonths.value.length - 1)
        const monthsInRange = availableMonths.value.slice(endIndex, startIndex + 1)

        console.log('📅 Fetching data for months:', monthsInRange)
        console.log('📊 Month range:', { endIndex, startIndex, count: monthsInRange.length })

        await fetchCountryTotalsRange(monthsInRange, newFlow)

        console.log('✅ Fetched country totals:', countryTotals.value.length, 'countries')
        console.log('🔝 Top 5 countries:', countryTotals.value.slice(0, 5).map(c => ({ name: c.country_name, value: c.total_value })))

        // Don't normalize - keep aggregated values
        // The color bands will naturally adjust to the higher values
        // This shows total trade over the period, not average per month
      }
    }

    // Store current data as previous for next transition
    previousCountryTotals.value = [...countryTotals.value]
    clearCountrySelection() // Close modal when switching

    // Mark initial load as complete
    if (!hasLoadedOnce.value && countryTotals.value.length > 0) {
      hasLoadedOnce.value = true
    }

    // Small delay to let the visual update happen
    setTimeout(() => {
      dataLoading.value = false
    }, 100)
  }
}, { immediate: true })

// Handle map click
async function handleMapClick(params) {
  if (params.componentType === 'series' && params.name) {
    // Find country by map_name (which matches GeoJSON name)
    const country = countryTotals.value.find(c =>
      (c.map_name || c.country_name) === params.name
    )

    if (country) {
      selectedCountryCode.value = country.country_code
      selectedCountryName.value = country.country_name

      // Auto-scroll to country details after a brief delay
      setTimeout(() => {
        const detailsElement = document.getElementById('country-details')
        if (detailsElement) {
          detailsElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }
  }
}

function clearCountrySelection() {
  selectedCountryCode.value = null
  selectedCountryName.value = ''
}

// Handle geo roam events (zoom/pan) - auto-center when zoomed out to min
function handleGeoRoam(params) {
  if (params.zoom && chartRef.value) {
    const echartsInstance = chartRef.value
    const option = echartsInstance.getOption()
    const currentZoom = option.series[0].zoom || 1

    // If zoomed out to minimum (or very close), reset center
    if (currentZoom <= 1.05) {
      echartsInstance.setOption({
        series: [{
          center: null
        }]
      }, { notMerge: false })
    }
  }
}

// Zoom control functions
function zoomIn() {
  if (chartRef.value) {
    const echartsInstance = chartRef.value
    echartsInstance.dispatchAction({
      type: 'geoRoam',
      seriesIndex: 0,
      zoom: 1.2,
      originX: window.innerWidth / 2,
      originY: window.innerHeight / 2
    })
  }
}

function zoomOut() {
  if (chartRef.value) {
    const echartsInstance = chartRef.value
    echartsInstance.dispatchAction({
      type: 'geoRoam',
      seriesIndex: 0,
      zoom: 0.8,
      originX: window.innerWidth / 2,
      originY: window.innerHeight / 2
    })
  }
}

function resetZoom() {
  if (chartRef.value) {
    const echartsInstance = chartRef.value
    // Reset zoom and center by setting option with notMerge
    echartsInstance.setOption({
      series: [{
        zoom: 1,
        center: null
      }]
    }, { notMerge: false })
  }
}

// Format value for display (values are in thousands of USD)
function formatValue(value) {
  // Multiply by 1000 since database stores values in thousands
  const actualValue = value * 1000

  if (actualValue >= 1e9) {
    return `${(actualValue / 1e9).toFixed(2)}B`
  } else if (actualValue >= 1e6) {
    return `${(actualValue / 1e6).toFixed(2)}M`
  } else if (actualValue >= 1e3) {
    return `${Math.round(actualValue / 1e3)}K`  // No decimals for K
  }
  return `${Math.round(actualValue)}`
}

// Get country flag emoji from country code
function getCountryFlag(countryCode) {
  if (!countryCode || countryCode.length !== 2) return ''

  // Convert country code to flag emoji using regional indicator symbols
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))

  return String.fromCodePoint(...codePoints)
}

// Format label with flag and value
function formatLabelWithFlag(countryCode, value) {
  const flag = getCountryFlag(countryCode)
  const formattedValue = formatValue(value)
  return `${flag} ${formattedValue}`
}

// Map configuration
const mapOption = computed(() => {
  // If map not ready, return empty
  if (!mapReady.value) return {}

  // Use current data if available, otherwise use previous data during loading
  const dataToDisplay = countryTotals.value.length > 0 ? countryTotals.value : previousCountryTotals.value

  // If no data at all, return empty config
  if (dataToDisplay.length === 0) return {}

  // Prepare data for map
  const mapData = dataToDisplay.map(c => ({
    name: c.map_name || c.country_name,
    value: c.total_value, // in thousands of USD
    originalName: c.country_name,
    country_code: c.country_code
  }))

  // Get top 3 countries by value for labeling (avoids overlaps)
  const top3Countries = [...mapData]
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map(d => d.name)

  // Analyze distribution
  const values = mapData.map(d => d.value).filter(v => v > 0).sort((a, b) => b - a)
  const maxValue = Math.max(...values)
  const minValue = Math.min(...values)

  // Custom distribution: Force top country in its own band
  const colors = getFlowGradient(selectedFlow.value)

  // Separate the max country (top value)
  const maxCountryValue = values[0]  // Highest value (USA or similar)
  const remainingValues = values.slice(1)  // All other countries

  // Define target distribution for remaining countries (from low to high)
  // Band sizes as percentages of remaining countries
  const targetDistribution = [
    { percentage: 0.36, color: colors[0] },  // Band 1: ~36% of countries (lowest values)
    { percentage: 0.36, color: colors[1] },  // Band 2: ~36% of countries
    { percentage: 0.20, color: colors[2] },  // Band 3: ~20% of countries
    { percentage: 0.07, color: colors[3] },  // Band 4: ~7% of countries
    { percentage: 0.01, color: colors[4] },  // Band 5: ~1% of countries (2-3 if ~200 total)
  ]

  // Sort remaining values in ascending order for quantile calculation
  const sortedValues = [...remainingValues].sort((a, b) => a - b)
  const totalCount = sortedValues.length

  // Create bands based on quantiles for regular countries
  const bands = []
  let currentIndex = 0

  for (let i = 0; i < targetDistribution.length; i++) {
    const dist = targetDistribution[i]
    const bandSize = Math.max(1, Math.round(totalCount * dist.percentage))
    const endIndex = Math.min(currentIndex + bandSize, totalCount)

    const bandValues = sortedValues.slice(currentIndex, endIndex)

    if (bandValues.length > 0) {
      bands.push({
        min: bandValues[0],
        max: bandValues[bandValues.length - 1],
        centroid: bandValues.reduce((sum, v) => sum + v, 0) / bandValues.length,
        color: dist.color,
        count: bandValues.length
      })

      currentIndex = endIndex
    }

    // Stop if we've allocated all countries
    if (currentIndex >= totalCount) break
  }

  // Add the max country as its own band (darkest color)
  bands.push({
    min: maxCountryValue,
    max: maxCountryValue,
    centroid: maxCountryValue,
    color: colors[6], // Darkest color
    count: 1
  })

  // Store color bands data for visualization
  colorBands.value = bands
  maxTradeValue.value = maxValue
  minTradeValue.value = minValue
  totalCountriesWithData.value = values.length
  allTradeValues.value = values // Store all values for histogram

  // Create piecewise visual map from k-means bands
  // Make bands CONTIGUOUS to eliminate gaps (countries falling between bands)
  const sortedBands = [...bands].sort((a, b) => a.min - b.min)

  const pieces = sortedBands.map((band, index) => {
    const isMaxBand = index === sortedBands.length - 1
    const nextBand = sortedBands[index + 1]

    if (isMaxBand) {
      // Max country band: use buffer for safety
      return {
        gte: band.min * 0.99,
        lte: band.max * 1.01,
        color: band.color,
        label: formatValue(band.min)
      }
    }

    // Make bands contiguous: extend lte to just below next band's min
    // This eliminates gaps between bands
    return {
      gte: band.min,
      lte: nextBand ? nextBand.min - 0.01 : band.max,  // Extend to next band
      color: band.color,
      label: `${formatValue(band.min)} - ${formatValue(band.max)}`
    }
  })

  // Map background color - light flow-tinted ocean
  const oceanColor = selectedFlow.value === FLOW_TYPES.IMPORTS ? '#eff6ff' : '#fff7ed'

  return {
    backgroundColor: oceanColor,
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      borderRadius: 12,
      padding: [12, 16],
      textStyle: {
        color: '#374151',
        fontSize: 13,
        fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif'
      },
      formatter: (params) => {
        if (params.value) {
          const country = mapData.find(d => d.name === params.name)
          const displayName = country?.originalName || params.name
          const actualValue = country?.value || 0
          const flowLabel = selectedFlow.value === FLOW_TYPES.EXPORTS ? 'Exports' : 'Imports'
          const flowColor = selectedFlow.value === FLOW_TYPES.EXPORTS ? '#f97316' : '#3b82f6'
          return `<div style="font-weight: 600; margin-bottom: 4px;">${displayName}</div>
                  <div style="color: ${flowColor}; font-size: 15px; font-weight: 700;">${flowLabel}: $${formatValue(actualValue)}</div>
                  <div style="font-size: 11px; color: #9ca3af; margin-top: 4px;">Click for details</div>`
        }
        return `<div style="font-weight: 600;">${params.name}</div><div style="color: #9ca3af;">No trade data</div>`
      },
    },
    visualMap: {
      show: false,  // Hide the legend on the map - we have it in the top bar
      type: 'piecewise',
      pieces: pieces,
      calculable: false,
      text: ['High', 'Low'],
      textStyle: {
        color: '#333'
      },
      formatter: (value) => {
        return formatValue(value)
      }
    },
    series: [
      {
        name: selectedFlow.value === FLOW_TYPES.EXPORTS ? 'Exports' : 'Imports',
        type: 'map',
        map: 'world',
        roam: true,
        scaleLimit: {
          min: 1,  // Can't zoom out beyond default
          max: 10  // Can zoom in up to 10x
        },
        itemStyle: {
          areaColor: '#fafafa',  // White for countries with no data
          borderColor: '#d1d5db',  // Gray-300 soft border
          borderWidth: 0.5,
          borderType: 'solid'
        },
        emphasis: {
          label: {
            show: true,
            color: '#1c1917',
            fontWeight: 'bold',
            fontSize: 13,
            textBorderColor: '#fff',
            textBorderWidth: 2
          },
          itemStyle: {
            areaColor: '#fbbf24', // Amber highlight on hover
            borderColor: '#9ca3af',  // Gray-400 on hover
            borderWidth: 2
          }
        },
        select: {
          disabled: true
        },
        data: mapData.map(d => {
          const isTop3 = top3Countries.includes(d.name)

          return {
            name: d.name,
            value: d.value,
            label: {
              show: isTop3,
              formatter: () => formatLabelWithFlag(d.country_code, d.value),
              position: 'inside',
              fontSize: 13,
              fontWeight: 'bold',
              color: '#1c1917',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderColor: '#d6d3d1',
              borderWidth: 1,
              borderRadius: 8,
              padding: [6, 12],
              shadowColor: 'rgba(0, 0, 0, 0.1)',
              shadowBlur: 10,
              shadowOffsetY: 2
            },
            itemStyle: {
              borderColor: '#d1d5db',  // Gray-300 soft border
              borderWidth: 0.5
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 13,
                formatter: () => formatLabelWithFlag(d.country_code, d.value),
                backgroundColor: 'rgba(255, 255, 255, 1)',
                shadowBlur: 10
              },
              itemStyle: {
                areaColor: '#fde68a', // Amber-200 on hover
                borderColor: '#9ca3af',  // Gray-400 on hover
                borderWidth: 2
              }
            }
          }
        }),
      },
    ],
  }
})
</script>
