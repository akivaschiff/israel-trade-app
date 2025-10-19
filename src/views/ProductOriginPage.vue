<template>
  <div class="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-2">
          From Where Do We Get...?
        </h1>
        <p class="text-gray-600">Explore the geographic origins of imported products</p>
      </div>

      <!-- Product Selector -->
      <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
        <label class="block text-lg font-semibold text-gray-800 mb-3">
          Select a Product
        </label>
        <select 
          v-model="selectedProduct" 
          @change="onProductSelect"
          class="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        >
          <option value="">-- Choose a product --</option>
          <optgroup 
            v-for="category in categorizedProducts" 
            :key="category.name" 
            :label="category.name"
          >
            <option 
              v-for="product in category.products" 
              :key="product.code" 
              :value="product.code"
            >
              {{ product.description }}
            </option>
          </optgroup>
        </select>
      </div>

      <!-- Error State -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 class="text-red-800 font-semibold mb-2">Error Loading Data</h3>
        <p class="text-red-600">{{ error }}</p>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        <p class="mt-4 text-gray-600">Loading origin data...</p>
      </div>

      <!-- Data Visualizations -->
      <div v-else-if="selectedProduct && mapData.length > 0 && mapReady">
        <!-- Debug Info (temporary) -->
        <div class="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-4">
          <p class="text-sm font-mono">
            <strong>Debug:</strong><br/>
            Selected: {{ selectedProduct }}<br/>
            Map Data Length: {{ mapData.length }}<br/>
            Time Series Length: {{ timeSeriesData.length }}
          </p>
        </div>
        <!-- Geographic Map -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-2">
            Import Sources (Latest Month)
          </h2>
          <p class="text-gray-600 mb-4">Countries colored by import value</p>
          <div style="height: 500px; width: 100%;">
            <v-chart :option="mapOption" :autoresize="true" />
          </div>
        </div>

        <!-- Time Series Chart -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-2">
            Imports Over Time by Country
          </h2>
          <p class="text-gray-600 mb-4">Historical trend for each source country</p>
          <div style="height: 450px; width: 100%;">
            <v-chart :option="timeSeriesOption" :autoresize="true" />
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!selectedProduct" class="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
        <svg class="w-16 h-16 mx-auto text-blue-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-xl font-semibold text-blue-800 mb-2">Select a Product</h3>
        <p class="text-blue-600">Choose a product from the dropdown to see where it comes from</p>
      </div>

      <!-- No Data State -->
      <div v-else class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p class="text-yellow-800">No import data available for this product.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { use, registerMap } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { MapChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import { useProductOrigin } from '@/composables/useProductOrigin'

// Register ECharts components
use([
  CanvasRenderer,
  MapChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  GridComponent,
  LegendComponent,
])

const { 
  loading, 
  error, 
  products,
  mapData,
  timeSeriesData,
  fetchProducts,
  fetchProductOrigin,
} = useProductOrigin()

const selectedProduct = ref('')
const mapReady = ref(false)

onMounted(async () => {
  // Load world map GeoJSON from a reliable CDN
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
  
  await fetchProducts()
})

// Group products by category
const categorizedProducts = computed(() => {
  const categoryMap = new Map()
  
  products.value.forEach(product => {
    const category = product.category || 'Uncategorized'
    if (!categoryMap.has(category)) {
      categoryMap.set(category, [])
    }
    categoryMap.get(category).push(product)
  })
  
  return Array.from(categoryMap.entries())
    .map(([name, products]) => ({
      name,
      products: products.sort((a, b) => b.totalImports - a.totalImports),
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
})

async function onProductSelect() {
  if (selectedProduct.value) {
    console.log('Product selected:', selectedProduct.value)
    console.log('Before fetch - mapData length:', mapData.value.length)
    console.log('Map ready:', mapReady.value)
    
    await fetchProductOrigin(selectedProduct.value)
    
    console.log('After fetch - mapData length:', mapData.value.length)
    console.log('After fetch - mapData:', mapData.value)
    console.log('After fetch - timeSeriesData:', timeSeriesData.value)
  }
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
          return `${params.name}<br/>Import Value: ${formatValue(params.value)}`
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
        color: ['#e0f2f1', '#4db6ac', '#00897b', '#00695c', '#004d40']
      },
      textStyle: {
        color: '#333'
      }
    },
    series: [
      {
        name: 'Import Value',
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

// Color palette for different countries
const colorPalette = [
  '#00897b', '#26a69a', '#4db6ac', '#80cbc4', '#b2dfdb',
  '#00695c', '#009688', '#00bfa5', '#1de9b6', '#64ffda',
]

// Time series configuration
const timeSeriesOption = computed(() => {
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
