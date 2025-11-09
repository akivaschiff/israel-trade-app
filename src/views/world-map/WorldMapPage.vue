<template>
  <div class="min-h-[calc(100vh-64px)] relative">
    <!-- Controls Bar -->
    <div class="bg-white border-b border-gray-200 p-4 sticky top-16 z-30">
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <!-- Flow Toggle -->
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

        <!-- Time Range Controls -->
        <div class="flex items-center gap-6">
          <!-- Month Range Slider -->
          <div class="flex items-center gap-3">
            <label class="text-sm font-semibold text-gray-700">Months:</label>
            <div class="flex items-center gap-2">
              <input
                type="range"
                v-model.number="monthRange"
                :disabled="dataLoading"
                min="1"
                max="12"
                step="1"
                class="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-75 disabled:cursor-wait"
              />
              <span class="text-sm font-medium text-gray-700 min-w-[3ch] text-center">{{ monthRange }}</span>
            </div>
          </div>

          <!-- End Month Selector -->
          <div class="flex items-center gap-3">
            <label class="text-sm font-semibold text-gray-700">Ending:</label>
            <div class="relative flex items-center gap-2">
              <select
                v-model="selectedMonth"
                :disabled="dataLoading"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white disabled:opacity-75 disabled:cursor-wait"
              >
                <option
                  v-for="month in availableMonths"
                  :key="month.key"
                  :value="month.key"
                >
                  {{ month.label }}
                </option>
              </select>
              <!-- Small Loading Indicator -->
              <div v-if="dataLoading" class="flex items-center">
                <svg class="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Legend -->
        <div class="flex items-center gap-2 text-sm">
        <span class="text-gray-600">Trade Value:</span>
        <div class="flex items-center gap-1">
        <div class="w-4 h-4 bg-white border border-gray-300"></div>
        <span class="text-xs text-gray-500">None</span>
        </div>
        <div class="flex items-center gap-1 ml-2">
        <div
        class="w-4 h-4 border border-gray-300"
        :style="{ backgroundColor: selectedFlow === FLOW_TYPES.EXPORTS ? TRADE_COLORS.EXPORTS.lighter : TRADE_COLORS.IMPORTS.gradient[0] }"
        ></div>
        <span class="text-xs text-gray-500">Low</span>
        </div>
        <div class="flex items-center gap-1">
        <div
        class="w-4 h-4 border border-gray-300"
        :style="{ backgroundColor: selectedFlow === FLOW_TYPES.EXPORTS ? TRADE_COLORS.EXPORTS.dark : TRADE_COLORS.IMPORTS.gradient[6] }"
        ></div>
        <span class="text-xs text-gray-500">High</span>
        </div>
        </div>
      </div>
    </div>

    <!-- Initial Loading State (only show on first load) -->
    <div v-if="loading && !mapReady" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-20">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mb-4"></div>
        <p class="text-gray-600 text-lg">Loading map data...</p>
      </div>
    </div>

    <!-- Map Container -->
    <div class="relative">
      <div 
        v-if="mapReady" 
        style="height: calc(100vh - 180px);" 
        class="w-full transition-opacity duration-300"
        :class="{ 'opacity-60': dataLoading, 'opacity-100': !dataLoading }"
      >
        <v-chart
          :option="mapOption"
          :autoresize="true"
          :update-options="{ notMerge: false, lazyUpdate: false }"
          @click="handleMapClick"
          style="height: 100%; width: 100%;"
        />
      </div>

      <!-- Map Loading -->
      <div v-else-if="!mapReady" class="h-[calc(100vh-180px)] flex items-center justify-center">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p class="text-gray-600">Loading world map...</p>
        </div>
      </div>
    </div>

    <!-- K-Means Distribution Visualization -->
    <div v-if="colorBands.length > 0" class="bg-white border-t border-gray-200 p-6">
      <div class="max-w-7xl mx-auto">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">K-Means Color Bands</h3>

        <!-- K-Means Bands -->
        <div class="space-y-3">
          <div
            v-for="(band, idx) in sortedColorBands"
            :key="idx"
            class="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            <!-- Band header - clickable -->
            <div
              @click="toggleBandExpansion(idx)"
              class="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50"
            >
              <!-- Color indicator -->
              <div
                class="w-8 h-8 rounded border border-gray-300 flex-shrink-0"
                :style="{ backgroundColor: band.color }"
              ></div>

              <!-- Band info -->
              <div class="flex-1">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium text-gray-700">
                    {{ formatValue(band.min) }} - {{ formatValue(band.max) }}
                  </span>
                  <span class="text-xs text-gray-500">
                    {{ band.count }} {{ band.count === 1 ? 'country' : 'countries' }}
                  </span>
                </div>

                <!-- Bar chart -->
                <div class="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :style="{
                      width: `${(band.count / totalCountriesWithData) * 100}%`,
                      backgroundColor: band.color
                    }"
                  ></div>
                </div>
              </div>

              <!-- Centroid value and expand icon -->
              <div class="flex items-center gap-3">
                <div class="text-xs text-gray-500 text-right">
                  Avg: {{ formatValue(band.centroid) }}
                </div>
                <svg
                  class="w-5 h-5 text-gray-400 transition-transform"
                  :class="{ 'rotate-180': expandedBands[idx] }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <!-- Expanded country list -->
            <div
              v-if="expandedBands[idx]"
              class="bg-gray-50 border-t border-gray-200 p-4"
            >
              <div class="max-h-96 overflow-y-auto">
                <div class="space-y-2">
                  <div
                    v-for="country in getCountriesInBand(band)"
                    :key="country.country_code"
                    class="flex items-center justify-between py-2 px-3 bg-white rounded hover:bg-gray-100 transition-colors"
                  >
                    <span class="text-sm font-medium text-gray-700">{{ country.country_name }}</span>
                    <span class="text-sm text-gray-600">{{ formatValue(country.total_value) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary stats -->
        <div class="mt-6 flex items-center gap-6 text-sm text-gray-600 border-t border-gray-200 pt-4">
          <div>
            <span class="font-semibold">Total countries with data:</span> {{ totalCountriesWithData }}
          </div>
          <div>
            <span class="font-semibold">Color bands:</span> {{ colorBands.length }}
          </div>
          <div>
            <span class="font-semibold">Max value:</span> {{ formatValue(maxTradeValue) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Country Trend Modal -->
    <CountryTrendModal
      :country-code="selectedCountryCode"
      :country-name="selectedCountryName"
      :flow-type="selectedFlow"
      :flow-label="selectedFlow === FLOW_TYPES.IMPORTS ? 'Imports' : 'Exports'"
      :current-month-label="currentMonthLabel"
      @close="clearCountrySelection"
    />
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

// K-Means distribution data for visualization
const colorBands = ref([])
const maxTradeValue = ref(0)
const minTradeValue = ref(0)
const totalCountriesWithData = ref(0)
const allTradeValues = ref([]) // Store all values for histogram
const expandedBands = ref({}) // Track which bands are expanded

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
        await fetchCountryTotalsRange(monthsInRange, newFlow)

        // Normalize values by number of months to maintain consistent color scale
        // This gives us an "average per month" value
        const actualMonthCount = monthsInRange.length
        countryTotals.value = countryTotals.value.map(country => ({
          ...country,
          total_value: country.total_value / actualMonthCount
        }))
      }
    }

    // Store current data as previous for next transition
    previousCountryTotals.value = [...countryTotals.value]
    clearCountrySelection() // Close modal when switching
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
    }
  }
}

function clearCountrySelection() {
  selectedCountryCode.value = null
  selectedCountryName.value = ''
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
    originalName: c.country_name
  }))

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
  
  return {
    backgroundColor: '#ffffff', // White background
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        if (params.value) {
          const country = mapData.find(d => d.name === params.name)
          const displayName = country?.originalName || params.name
          const actualValue = country?.value || 0
          return `${displayName}<br/>${selectedFlow.value === FLOW_TYPES.EXPORTS ? 'Exports' : 'Imports'}: ${formatValue(actualValue)}<br/><span style="font-size: 11px; color: #666;">Click for details</span>`
        }
        return `${params.name}<br/>No trade data`
      },
    },
    visualMap: {
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
        itemStyle: {
          areaColor: '#ffffff',  // White for countries with no data
          borderColor: '#d1d5db',  // Soft gray border
          borderWidth: 0.8
        },
        emphasis: {
          label: {
            show: true
          },
          itemStyle: {
            areaColor: '#ffd54f', // Yellow highlight on hover
            borderColor: '#9ca3af',
            borderWidth: 1.2
          }
        },
        data: mapData.map(d => ({
          name: d.name,
          value: d.value,
          itemStyle: {
            borderColor: '#d1d5db',  // Soft gray border
            borderWidth: 0.8
          }
        })),
      },
    ],
  }
})
</script>
