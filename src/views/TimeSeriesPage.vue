<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-2">
          Trade Over Time
        </h1>
        <p class="text-gray-600">Monthly trade trends (Jan-Apr 2024)</p>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Filters</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Country Filter -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Countries
            </label>
            <select 
              v-model="selectedCountries" 
              multiple
              @change="onCountryChange"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              style="height: 200px;"
            >
              <option 
                v-for="country in countries" 
                :key="country.code" 
                :value="country.code"
              >
                {{ country.name }}
              </option>
            </select>
            <p class="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
          </div>

          <!-- Product Filter -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Products (by Category)
            </label>
            <ProductSelector 
              v-model="selectedProducts"
              :products="products"
            />
            <p class="text-xs text-gray-500 mt-1">Click category to expand, check to select all</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-4 mt-6">
          <button
            @click="applyFilters"
            class="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md"
          >
            Apply Filters
          </button>
          <button
            @click="clearFilters"
            class="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all"
          >
            Clear All
          </button>
        </div>

        <!-- Selected Filters Display -->
        <div v-if="selectedCountries.length > 0 || selectedProducts.length > 0" class="mt-4">
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="code in selectedCountries" 
              :key="`country-${code}`"
              class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
            >
              {{ getCountryName(code) }}
            </span>
            <span 
              v-for="code in selectedProducts.slice(0, 5)" 
              :key="`product-${code}`"
              class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {{ getProductDescription(code) }}
            </span>
            <span 
              v-if="selectedProducts.length > 5"
              class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              +{{ selectedProducts.length - 5 }} more
            </span>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <p class="mt-4 text-gray-600">Loading trade data...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 class="text-red-800 font-semibold mb-2">Error Loading Data</h3>
        <p class="text-red-600">{{ error }}</p>
      </div>

      <!-- Chart -->
      <div v-else-if="timeSeriesData.length > 0" class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">Monthly Trade Value by Country</h2>
        <div style="height: 500px; width: 100%;">
          <v-chart :option="chartOption" :autoresize="true" />
        </div>
      </div>

      <!-- No Data State -->
      <div v-else class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p class="text-yellow-800">No data available for the selected filters.</p>
        <p class="text-yellow-600 text-sm mt-2">Try selecting different countries or products.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import { useTimeSeries } from '@/composables/useTimeSeries'
import ProductSelector from '@/components/trade/ProductSelector.vue'

// Register ECharts components
use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
])

const { 
  loading, 
  error, 
  timeSeriesData, 
  countries, 
  products,
  fetchTimeSeries,
  fetchCountries,
  fetchProducts,
} = useTimeSeries()

const selectedCountries = ref([])
const selectedProducts = ref([])

onMounted(async () => {
  await fetchCountries()
  await fetchProducts(null) // Load all products initially
  await fetchTimeSeries(null, null) // Load all data initially
})

// When countries change, refetch products for those countries
async function onCountryChange() {
  const countryFilter = selectedCountries.value.length > 0 ? selectedCountries.value : null
  await fetchProducts(countryFilter)
  // Clear product selection when country changes
  selectedProducts.value = []
}

function applyFilters() {
  const countryFilter = selectedCountries.value.length > 0 ? selectedCountries.value : null
  const productFilter = selectedProducts.value.length > 0 ? selectedProducts.value : null
  fetchTimeSeries(countryFilter, productFilter)
}

function clearFilters() {
  selectedCountries.value = []
  selectedProducts.value = []
  fetchProducts(null)
  fetchTimeSeries(null, null)
}

function getCountryName(code) {
  return countries.value.find(c => c.code === code)?.name || code
}

function getProductDescription(code) {
  const product = products.value.find(p => p.code === code)
  return product?.description?.substring(0, 40) + '...' || code
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

// Color palette for different countries
const colorPalette = [
  '#9333ea', '#ec4899', '#8b5cf6', '#f472b6', '#a855f7',
  '#fb7185', '#c026d3', '#f9a8d4', '#d946ef', '#fda4af',
]

// ECharts configuration for multi-line chart
const chartOption = computed(() => {
  // Get all unique months from the first country's data
  const months = timeSeriesData.value[0]?.data.map(d => d.monthName) || []
  
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
      data: timeSeriesData.value.map(d => d.country),
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
    series: timeSeriesData.value.map((countryData, index) => ({
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
</script>
