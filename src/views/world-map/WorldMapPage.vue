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

        <!-- Month Selector -->
        <div class="flex items-center gap-3">
          <label class="text-sm font-semibold text-gray-700">Month:</label>
          <select
            v-model="selectedMonth"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          >
            <option
              v-for="month in availableMonths"
              :key="month.key"
              :value="month.key"
            >
              {{ month.label }}
            </option>
          </select>
        </div>

        <!-- Legend -->
        <div class="flex items-center gap-2 text-sm">
        <span class="text-gray-600">Trade Value:</span>
        <div class="flex items-center gap-1">
        <div class="w-4 h-4 bg-gray-200 border border-gray-300"></div>
        <span class="text-xs text-gray-500">None</span>
        </div>
        <div class="flex items-center gap-1 ml-2">
        <div
        class="w-4 h-4 border border-gray-300"
        :style="{ backgroundColor: selectedFlow === FLOW_TYPES.EXPORTS ? TRADE_COLORS.EXPORTS.lighter : TRADE_COLORS.IMPORTS.lighter }"
        ></div>
        <span class="text-xs text-gray-500">Low</span>
        </div>
        <div class="flex items-center gap-1">
        <div
        class="w-4 h-4 border border-gray-300"
        :style="{ backgroundColor: selectedFlow === FLOW_TYPES.EXPORTS ? TRADE_COLORS.EXPORTS.dark : TRADE_COLORS.IMPORTS.dark }"
        ></div>
        <span class="text-xs text-gray-500">High</span>
        </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-20">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mb-4"></div>
        <p class="text-gray-600 text-lg">Loading map data...</p>
      </div>
    </div>

    <!-- Map Container -->
    <div class="relative">
      <div v-if="mapReady && !loading" style="height: calc(100vh - 180px);" class="w-full">
        <v-chart
          :option="mapOption"
          :autoresize="true"
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

    <!-- Country Detail Panel -->
    <CountryDetailPanel
      :details="selectedCountryDetails"
      :loading="detailLoading"
      :flow-label="selectedFlow === FLOW_TYPES.IMPORTS ? 'Imports' : 'Exports'"
      :month-label="currentMonthLabel"
      @close="clearCountryDetails"
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
import CountryDetailPanel from './CountryDetailPanel.vue'
import { TRADE_COLORS, FLOW_TYPES, getFlowGradient } from '@/lib/tradeConstants'
import { createKMeansColorScale } from '@/lib/kmeansScale'

use([CanvasRenderer, MapChart, TooltipComponent, VisualMapComponent])

const {
  loading,
  detailLoading,
  availableMonths,
  countryTotals,
  selectedCountryDetails,
  loadCountries,
  fetchAvailableMonths,
  fetchCountryTotals,
  fetchCountryDetails,
  clearCountryDetails
} = useWorldMap()

const mapReady = ref(false)
const selectedFlow = ref(FLOW_TYPES.EXPORTS) // Default to Exports
const selectedMonth = ref(null)

onMounted(async () => {
  // Load static countries data
  await loadCountries()
  
  // Load world map
  try {
    const response = await fetch('https://raw.githubusercontent.com/apache/echarts/master/test/data/map/json/world.json')
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const geoJson = await response.json()
    registerMap('world', geoJson)
    mapReady.value = true
    console.log('World map loaded')
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
  const month = availableMonths.value.find(m => m.key === selectedMonth.value)
  return month?.label || ''
})

// Watch for changes in flow or month selection
watch([selectedFlow, selectedMonth], async ([newFlow, newMonth]) => {
  if (newMonth) {
    const [year, period] = newMonth.split('-')
    await fetchCountryTotals(parseInt(year), parseInt(period), newFlow)
    clearCountryDetails() // Close detail panel when switching
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
      const [year, period] = selectedMonth.value.split('-')
      await fetchCountryDetails(
        country.country_code,
        parseInt(year),
        parseInt(period),
        selectedFlow.value
      )
    }
  }
}

// Format value for display (values are in thousands of USD)
function formatValue(value) {
  // Multiply by 1000 since database stores values in thousands
  const actualValue = value * 1000
  
  if (actualValue >= 1e9) {
    return `$${(actualValue / 1e9).toFixed(2)}B`
  } else if (actualValue >= 1e6) {
    return `$${(actualValue / 1e6).toFixed(2)}M`
  } else if (actualValue >= 1e3) {
    return `$${(actualValue / 1e3).toFixed(2)}K`
  }
  return `$${actualValue.toFixed(2)}`
}

// Map configuration
const mapOption = computed(() => {
  if (!mapReady.value || countryTotals.value.length === 0) return {}

  // Prepare data for map
  const mapData = countryTotals.value.map(c => ({
    name: c.map_name || c.country_name,
    value: c.total_value, // in thousands of USD
    originalName: c.country_name
  }))

  // Analyze distribution
  const values = mapData.map(d => d.value).filter(v => v > 0).sort((a, b) => b - a)
  const maxValue = Math.max(...values)
  const minValue = Math.min(...values)
  
  // Special handling: Reserve darkest color for the max country (outlier)
  // Run k-means on remaining countries for better distribution
  const maxCountryValue = values[0]  // USA or top country
  const remainingValues = values.slice(1)  // All others
  
  // Use k-means to find natural color breaks (6 bands for non-max countries)
  const colors = getFlowGradient(selectedFlow.value)
  const numRegularBands = colors.length - 1  // Reserve last color for max country
  const regularColors = colors.slice(0, numRegularBands)  // First 6 colors
  const maxColor = colors[colors.length - 1]  // Darkest color for max
  
  const regularBands = createKMeansColorScale(remainingValues, numRegularBands, regularColors)
  
  // Add the max country as its own band
  const colorBands = [
    ...regularBands,
    {
      min: maxCountryValue,
      max: maxCountryValue,
      centroid: maxCountryValue,
      color: maxColor,
      count: 1
    }
  ]
  
  // Create piecewise visual map from k-means bands
  // Make bands CONTIGUOUS to eliminate gaps (countries falling between bands)
  const sortedBands = [...colorBands].sort((a, b) => a.min - b.min)
  
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
  
  // === DETAILED ANALYSIS LOGGING ===
  console.log('\n'.repeat(2) + '='.repeat(60))
  console.log('📊 VALUE DISTRIBUTION ANALYSIS')
  console.log('='.repeat(60))
  console.log(`Flow: ${selectedFlow.value === FLOW_TYPES.EXPORTS ? '🔵 EXPORTS' : '🟠 IMPORTS'}`)
  console.log(`Total countries: ${values.length}`)
  console.log(`Max: ${formatValue(maxValue)}`)
  console.log(`Min: ${formatValue(minValue)}`)
  console.log(`Range: ${formatValue(maxValue - minValue)}`)
  
  console.log('\n' + '─'.repeat(60))
  console.log('📈 TOP 20 COUNTRIES:')
  console.log('─'.repeat(60))
  values.slice(0, 20).forEach((val, i) => {
    const country = mapData.find(d => d.value === val)
    const pct = ((val / maxValue) * 100).toFixed(1)
    console.log(`${(i + 1).toString().padStart(2)}. ${(country?.originalName || '').padEnd(30)} ${formatValue(val).padStart(12)} (${pct}% of max)`)
  })
  
  console.log('\n' + '─'.repeat(60))
  console.log('📊 PERCENTILE ANALYSIS:')
  console.log('─'.repeat(60))
  const percentiles = [99, 95, 90, 75, 50, 25, 10, 5, 1]
  percentiles.forEach(p => {
    const index = Math.floor((values.length - 1) * (100 - p) / 100)
    const val = values[index]
    const pct = ((val / maxValue) * 100).toFixed(1)
    console.log(`${p.toString().padStart(3)}th: ${formatValue(val).padStart(12)} (${pct}% of max)`)
  })
  
  console.log('\n' + '─'.repeat(60))
  console.log('📉 BOTTOM 10 COUNTRIES:')
  console.log('─'.repeat(60))
  values.slice(-10).reverse().forEach((val, i) => {
    const country = mapData.find(d => d.value === val)
    const pct = ((val / maxValue) * 100).toFixed(3)
    console.log(`${(values.length - 9 + i).toString().padStart(3)}. ${(country?.originalName || '').padEnd(30)} ${formatValue(val).padStart(12)} (${pct}% of max)`)
  })
  
  console.log('\n' + '─'.repeat(60))
  console.log('🎨 K-MEANS COLOR SCALE (' + regularBands.length + ' bands + 1 max):')
  console.log('─'.repeat(60))
  regularBands.forEach((band, i) => {
    console.log(`Band ${i + 1}: ${formatValue(band.min).padStart(12)} - ${formatValue(band.max).padStart(12)} (${band.count} countries)`)
  })
  const maxCountry = mapData.find(d => d.value === maxCountryValue)
  console.log(`Band ${regularBands.length + 1}: ${formatValue(maxCountryValue).padStart(12)} - ${formatValue(maxCountryValue).padStart(12)} (1 country - ${maxCountry?.originalName || 'Max'}) ⭐`)
  console.log(`  🔍 Max band range: gte=${(maxCountryValue * 0.99).toFixed(0)}, lte=${(maxCountryValue * 1.01).toFixed(0)} (actual value: ${maxCountryValue.toFixed(0)})`)
  console.log('\n🔍 Checking country name mappings:')
  
  // Debug: Find countries with values that don't match any band
  const countriesNotInBands = mapData.filter(c => {
    if (c.value <= 0) return false
    const matchingPiece = pieces.find(p => c.value >= p.gte && c.value <= p.lte)
    return !matchingPiece
  })
  
  if (countriesNotInBands.length > 0) {
    console.log('⚠️  Countries with data but NO MATCHING BAND:')
    countriesNotInBands.forEach(c => {
      console.log(`  - ${c.originalName}: ${formatValue(c.value)} (value=${c.value.toFixed(0)})`)
      // Show which bands it's between
      const sortedPieces = [...pieces].sort((a, b) => a.gte - b.gte)
      for (let i = 0; i < sortedPieces.length - 1; i++) {
        if (c.value > sortedPieces[i].lte && c.value < sortedPieces[i + 1].gte) {
          console.log(`    → Falls in GAP between Band ${i + 1} (lte=${sortedPieces[i].lte.toFixed(0)}) and Band ${i + 2} (gte=${sortedPieces[i + 1].gte.toFixed(0)})`)
        }
      }
    })
  } else {
    console.log('✅ All countries with data are in a band!')
  }
  
  // Check specific problem countries
  const problemCountries = ['China', 'Australia', 'Turkey', 'Türkiye', 'United States']
  problemCountries.forEach(name => {
    const country = mapData.find(c => c.originalName?.includes(name) || c.name?.includes(name))
    if (country) {
      const matchingPiece = pieces.find(p => country.value >= p.gte && country.value <= p.lte)
      console.log(`  ✅ Found ${name}: DB="${country.originalName}", Map="${country.name}", Value=${formatValue(country.value)}, InBand=${matchingPiece ? 'YES' : 'NO'}`)
    } else {
      console.log(`  ❌ Missing ${name}`)
    }
  })
  
  console.log('='.repeat(60) + '\n')

  return {
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
        emphasis: {
          label: {
            show: true
          },
          itemStyle: {
            areaColor: '#ffd54f'
          }
        },
        data: mapData.map(d => ({
          name: d.name,
          value: d.value
        })),
      },
    ],
  }
})
</script>
