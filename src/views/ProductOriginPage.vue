<template>
  <div class="min-h-[calc(100vh-64px)] p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-2">
          Where Do We Export To...?
        </h1>
        <p class="text-gray-600">Search for products and explore their export destinations</p>
      </div>

      <!-- Label Search -->
      <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
        <label class="block text-lg font-semibold text-gray-800 mb-3">
          Search Products by Label
        </label>
        <ProductLabelSearch 
          v-model="selectedLabels"
          @labelsChanged="onLabelsChanged"
        />
        <p class="text-sm text-gray-500 mt-3">
          💡 Try searching: "animals", "בעלי חיים", "food", "מזון"
        </p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 class="text-red-800 font-semibold mb-2">Error Loading Data</h3>
        <p class="text-red-600">{{ error }}</p>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        <p class="mt-4 text-gray-600">Loading export data...</p>
      </div>

      <!-- Data Visualizations -->
      <div v-else-if="selectedLabels.length > 0 && mapData.length > 0 && mapReady">
        <!-- Selected Labels Info -->
        <div class="bg-gradient-to-r from-emerald-100 to-teal-100 border border-emerald-300 rounded-lg p-4 mb-6">
          <p class="text-emerald-900 font-medium">
            📦 Showing export data for <strong>{{ matchedProductsCount }}</strong> products matching: 
            <span class="font-bold">{{ selectedLabels.join(', ') }}</span>
          </p>
        </div>

        <!-- Geographic Map -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-2">
            Export Destinations (Latest Month)
          </h2>
          <p class="text-gray-600 mb-4">Countries colored by export value</p>
          <div style="height: 500px; width: 100%;">
            <v-chart :option="mapOption" :autoresize="true" />
          </div>
        </div>

        <!-- Time Series Chart - Top 6 Countries -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-2">
            Exports Over Time - Top 6 Countries
          </h2>
          <p class="text-gray-600 mb-4">Historical trend for top export destinations (Jan-Apr 2024)</p>
          <div style="height: 450px; width: 100%;">
            <v-chart :option="timeSeriesOption" :autoresize="true" />
          </div>
        </div>

        <!-- Average Bar Chart -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-2">
            Last 3 Months Average by Country
          </h2>
          <p class="text-gray-600 mb-4">Average export value (Feb-Apr 2024) sorted by highest</p>
          <div style="height: 500px; width: 100%;">
            <v-chart :option="averageBarOption" :autoresize="true" />
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="selectedLabels.length === 0" class="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
        <svg class="w-16 h-16 mx-auto text-blue-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h3 class="text-xl font-semibold text-blue-800 mb-2">Search for a Product</h3>
        <p class="text-blue-600 mb-4">Start typing to search by product name in English or Hebrew</p>
        <div class="flex flex-wrap justify-center gap-2 mt-4">
          <button 
            @click="quickSearch('animals')"
            class="px-4 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors text-sm"
          >
            🐄 Animals
          </button>
          <button 
            @click="quickSearch('food')"
            class="px-4 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors text-sm"
          >
            🍽️ Food
          </button>
          <button 
            @click="quickSearch('electronics')"
            class="px-4 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors text-sm"
          >
            💻 Electronics
          </button>
          <button 
            @click="quickSearch('machinery')"
            class="px-4 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors text-sm"
          >
            ⚙️ Machinery
          </button>
        </div>
      </div>

      <!-- No Data State -->
      <div v-else class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p class="text-yellow-800">No export data available for the selected labels.</p>
        <p class="text-yellow-600 text-sm mt-2">Try selecting different product labels.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { use, registerMap } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { MapChart, LineChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import { useProductOrigin } from '@/composables/useProductOrigin'
import ProductLabelSearch from '@/components/trade/ProductLabelSearch.vue'
import { TRADE_COLORS } from '@/lib/tradeConstants'

// Register ECharts components
use([
  CanvasRenderer,
  MapChart,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  GridComponent,
  LegendComponent,
])

const { 
  loading, 
  error, 
  mapData,
  timeSeriesData,
  fetchProductOriginByLabels,
} = useProductOrigin()

const selectedLabels = ref([])
const mapReady = ref(false)
const matchedProductsCount = ref(0)

onMounted(async () => {
  // Load world map GeoJSON
  try {
    const response = await fetch('https://raw.githubusercontent.com/apache/echarts/master/test/data/map/json/world.json')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const geoJson = await response.json()
    registerMap('world', geoJson)
    mapReady.value = true
    console.log('World map loaded successfully')
  } catch (error) {
    console.error('Error loading world map:', error)
    // Try alternative source
    try {
      const response2 = await fetch('https://cdn.jsdelivr.net/npm/echarts@5/map/json/world.json')
      const geoJson2 = await response2.json()
      registerMap('world', geoJson2)
      mapReady.value = true
      console.log('World map loaded from alternative source')
    } catch (error2) {
      console.error('Failed to load world map from alternative source:', error2)
      error.value = 'Failed to load world map'
    }
  }
})

async function onLabelsChanged(labels) {
  console.log('Labels changed:', labels)
  
  if (labels.length === 0) {
    mapData.value = []
    timeSeriesData.value = []
    matchedProductsCount.value = 0
    return
  }

  await fetchProductOriginByLabels(labels)
  
  // Update matched products count
  matchedProductsCount.value = mapData.value.length > 0 ? '~' : 0
}

function quickSearch(label) {
  selectedLabels.value = [label]
}

// Format currency values
function formatValue(value) {
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`
  } else if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`
  } else if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(2)}K`
  }
  return `$${value.toFixed(2)}`
}

// Map configuration
const mapOption = computed(() => {
  const mapDataFormatted = mapData.value.map(d => ({
    name: d.countryName,
    value: d.value,
  }))

  const maxValue = Math.max(...mapData.value.map(d => d.value), 1)

  return {
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        if (params.value) {
          return `${params.name}<br/>Export Value: ${formatValue(params.value)}`
        }
        return `${params.name}<br/>No data`
      },
    },
    visualMap: {
      min: 0,
      max: maxValue,
      text: ['High', 'Low'],
      realtime: false,
      calculable: true,
      inRange: {
        color: [TRADE_COLORS.EXPORTS.lightest, TRADE_COLORS.EXPORTS.lighter, TRADE_COLORS.EXPORTS.light, TRADE_COLORS.EXPORTS.primary, TRADE_COLORS.EXPORTS.dark]
      },
      textStyle: {
        color: '#333'
      }
    },
    series: [
      {
        name: 'Export Value',
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
        data: mapDataFormatted,
      },
    ],
  }
})

// Color palette for different countries (using export blue colors)
const colorPalette = [
  TRADE_COLORS.EXPORTS.primary,
  TRADE_COLORS.EXPORTS.light,
  TRADE_COLORS.EXPORTS.lighter,
  TRADE_COLORS.EXPORTS.dark,
  TRADE_COLORS.EXPORTS.darker,
  '#60a5fa', '#93c5fd', '#3b82f6', '#2563eb', '#1d4ed8',
]

// Top 6 countries for time series
const top6TimeSeriesData = computed(() => {
  // Calculate total value for each country
  const countryTotals = timeSeriesData.value.map(countryData => ({
    ...countryData,
    total: countryData.data.reduce((sum, d) => sum + d.value, 0)
  }))
  
  // Sort by total and take top 6
  return countryTotals
    .sort((a, b) => b.total - a.total)
    .slice(0, 6)
})

// Time series configuration - Top 6 only
const timeSeriesOption = computed(() => {
  const months = top6TimeSeriesData.value[0]?.data.map(d => d.monthName) || []
  
  return {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        let result = `<strong>${params[0].axisValue}</strong><br/>`
        params.forEach(param => {
          result += `${param.marker} ${param.seriesName}: ${formatValue(param.value)}<br/>`
        })
        return result
      },
    },
    legend: {
      data: top6TimeSeriesData.value.map(d => d.country),
      top: 10,
      type: 'scroll',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: months,
      axisLabel: {
        fontSize: 12,
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value) => {
          if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
          if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
          if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`
          return `$${value}`
        },
      },
    },
    series: top6TimeSeriesData.value.map((countryData, index) => ({
      name: countryData.country,
      type: 'line',
      data: countryData.data.map(d => d.value),
      smooth: true,
      lineStyle: {
        width: 3,
        color: colorPalette[index % colorPalette.length],
      },
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: {
        color: colorPalette[index % colorPalette.length],
      },
    })),
  }
})

// Calculate last 3 months average for all countries
const last3MonthsAverage = computed(() => {
  return timeSeriesData.value.map(countryData => {
    // Get last 3 months of data
    const last3Months = countryData.data.slice(-3)
    
    // Calculate average
    const average = last3Months.reduce((sum, d) => sum + d.value, 0) / last3Months.length
    
    return {
      country: countryData.country,
      average: average
    }
  }).sort((a, b) => b.average - a.average) // Sort by highest first
})

// Bar chart for last 3 months average
const averageBarOption = computed(() => {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params) => {
        return `${params[0].name}<br/>${params[0].marker} Average: ${formatValue(params[0].value)}`
      }
    },
    grid: {
      left: '15%',
      right: '4%',
      bottom: '3%',
      top: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value) => {
          if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
          if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
          if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`
          return `$${value}`
        },
      },
    },
    yAxis: {
      type: 'category',
      data: last3MonthsAverage.value.map(d => d.country),
      axisLabel: {
        fontSize: 11,
      },
    },
    series: [
      {
        name: 'Average Export Value',
        type: 'bar',
        data: last3MonthsAverage.value.map(d => d.average),
        itemStyle: {
          color: (params) => {
            // Gradient from highest to lowest using export blue colors
            const colors = [
              TRADE_COLORS.EXPORTS.darker,
              TRADE_COLORS.EXPORTS.dark,
              TRADE_COLORS.EXPORTS.primary,
              TRADE_COLORS.EXPORTS.light,
              TRADE_COLORS.EXPORTS.lighter,
              TRADE_COLORS.EXPORTS.lightest
            ]
            return colors[params.dataIndex % colors.length]
          }
        },
        label: {
          show: true,
          position: 'right',
          formatter: (params) => formatValue(params.value),
          fontSize: 10
        }
      }
    ]
  }
})
</script>
