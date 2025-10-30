<template>
  <div class="min-h-[calc(100vh-64px)] p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-2">
          Israel Trade Overview
        </h1>
        <p class="text-gray-600">
          {{ overviewData?.metadata.last_month_label || 'Loading...' }}
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p class="mt-4 text-gray-600">Loading trade data...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 class="text-red-800 font-semibold mb-2">Error Loading Data</h3>
        <p class="text-red-600">{{ error }}</p>
      </div>

      <!-- Main Content -->
      <div v-else-if="overviewData">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <!-- Trade Balance Card -->
          <div 
            :class="[
              'rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform relative group',
              overviewData.cards.last_month_trade.balance >= 0 
                ? 'bg-gradient-to-br from-green-500 to-green-600' 
                : 'bg-gradient-to-br from-red-500 to-red-600'
            ]"
          >
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-lg font-semibold opacity-90">Trade Balance</h3>
              <svg class="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <p class="text-3xl font-bold">{{ formatValue(overviewData.cards.last_month_trade.balance) }}</p>
            <p class="text-sm opacity-75 mt-1">{{ overviewData.cards.last_month_trade.balance_type }}</p>
            
            <!-- Hover detail -->
            <div 
              :class="[
                'absolute inset-0 rounded-xl p-6 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center',
                overviewData.cards.last_month_trade.balance >= 0 ? 'bg-green-700' : 'bg-red-700'
              ]"
            >
              <p class="text-sm mb-2">Imports: {{ formatValue(overviewData.cards.last_month_trade.imports) }}</p>
              <p class="text-sm mb-2">Exports: {{ formatValue(overviewData.cards.last_month_trade.exports) }}</p>
              <p class="text-xs opacity-75 mt-2">Balance = Exports - Imports</p>
            </div>
          </div>

          <!-- Trading Partners Card -->
          <div 
            class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform cursor-pointer relative group"
            @click="showNonTradingModal = true"
          >
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-lg font-semibold opacity-90">Trading Partners</h3>
              <svg class="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p class="text-3xl font-bold">{{ overviewData.cards.trading_partners.total_count }}</p>
            <p class="text-sm opacity-75 mt-1">Countries</p>
            
            <!-- Hover hint -->
            <div class="absolute inset-0 bg-blue-700 rounded-xl p-6 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center">
              <p class="text-sm mb-2">Countries traded with over the last year</p>
              <p class="text-xs opacity-75">Click to see {{ overviewData.cards.trading_partners.non_trading_countries.length }} countries we DON'T trade with</p>
            </div>
          </div>

          <!-- Items Traded Card -->
          <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform relative group">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-lg font-semibold opacity-90">Items Traded</h3>
              <svg class="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p class="text-3xl font-bold">{{ formatNumber(overviewData.cards.items_traded.unique_products) }}</p>
            <p class="text-sm opacity-75 mt-1">Unique Products</p>
            
            <!-- Hover detail -->
            <div class="absolute inset-0 bg-purple-700 rounded-xl p-6 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center">
              <p class="text-xs opacity-75 mb-2">Last month breakdown:</p>
              <p class="text-sm mb-1">{{ formatNumber(overviewData.cards.items_traded.unique_hs_chapters) }} HS Chapters</p>
              <p class="text-sm mb-1">{{ formatNumber(overviewData.cards.items_traded.unique_hs_headings) }} HS Headings</p>
              <p class="text-sm">{{ formatNumber(overviewData.cards.items_traded.unique_products) }} HS Products</p>
            </div>
          </div>
        </div>

        <!-- Charts Row 1: Top Trading Partners -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-bold text-gray-800">Top 10 Trading Partners</h2>
            <div class="flex gap-2">
              <button
                @click="partnerView = 'imports'"
                :class="[
                  'px-4 py-2 rounded-lg font-medium transition-colors',
                  partnerView === 'imports' 
                    ? 'text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                ]"
                :style="partnerView === 'imports' ? { backgroundColor: TRADE_COLORS.IMPORTS.primary } : {}"
              >
                Imports
              </button>
              <button
                @click="partnerView = 'exports'"
                :class="[
                  'px-4 py-2 rounded-lg font-medium transition-colors',
                  partnerView === 'exports' 
                    ? 'text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                ]"
                :style="partnerView === 'exports' ? { backgroundColor: TRADE_COLORS.EXPORTS.primary } : {}"
              >
                Exports
              </button>
            </div>
          </div>
          <div style="height: 400px; width: 100%;">
            <v-chart :option="partnersChartOption" :autoresize="true" />
          </div>
        </div>

        <!-- Charts Row 2: Trade Trend -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Imports vs Exports - Last 12 Months</h2>
          <div style="height: 400px; width: 100%;">
            <v-chart :option="trendChartOption" :autoresize="true" />
          </div>
        </div>

        <!-- Charts Row 3: Top Product Categories -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Top Product Categories</h2>
          <div style="height: 450px; width: 100%;">
            <v-chart :option="categoriesChartOption" :autoresize="true" />
          </div>
        </div>
      </div>
    </div>

    <!-- Non-Trading Countries Modal -->
    <div 
      v-if="showNonTradingModal && overviewData"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="showNonTradingModal = false"
    >
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div class="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-2xl font-bold text-gray-800">
            Countries Without Trade Activity
          </h3>
          <button 
            @click="showNonTradingModal = false"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          <p class="text-gray-600 mb-4">
            {{ overviewData.cards.trading_partners.non_trading_countries.length }} countries have no recorded trade activity with Israel over the last year.
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div 
              v-for="country in overviewData.cards.trading_partners.non_trading_countries" 
              :key="country"
              class="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700"
            >
              {{ country }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import { useTradeOverview } from '@/composables/useTradeOverview'
import { TRADE_COLORS, FLOW_TYPES } from '@/lib/tradeConstants'

// Register ECharts components
use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
])

const { loading, error, overviewData, fetchOverview } = useTradeOverview()
const showNonTradingModal = ref(false)
const partnerView = ref('exports') // Default to exports view

onMounted(() => {
  fetchOverview()
})

// Format large numbers (currency)
function formatValue(value) {
  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  
  if (absValue >= 1e9) {
    return `${sign}$${(absValue / 1e9).toFixed(2)}B`
  } else if (absValue >= 1e6) {
    return `${sign}$${(absValue / 1e6).toFixed(2)}M`
  } else if (absValue >= 1e3) {
    return `${sign}$${(absValue / 1e3).toFixed(2)}K`
  }
  return `${sign}$${absValue.toFixed(2)}`
}

// Format regular numbers (no currency)
function formatNumber(value) {
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(1)}M`
  } else if (value >= 1e3) {
    return `${(value / 1e3).toFixed(1)}K`
  }
  return value.toLocaleString()
}

// Top Trading Partners Chart (switchable)
const partnersChartOption = computed(() => {
  if (!overviewData.value) return {}
  
  const data = partnerView.value === 'imports' 
    ? overviewData.value.charts.top_partners_imports
    : overviewData.value.charts.top_partners_exports
  
  const color = partnerView.value === 'imports' 
    ? [TRADE_COLORS.IMPORTS.primary, TRADE_COLORS.IMPORTS.dark]  // Orange for imports
    : [TRADE_COLORS.EXPORTS.primary, TRADE_COLORS.EXPORTS.dark]  // Blue for exports

  // Calculate max value across both datasets to keep scale consistent
  const maxImports = Math.max(...overviewData.value.charts.top_partners_imports.map(p => p.value))
  const maxExports = Math.max(...overviewData.value.charts.top_partners_exports.map(p => p.value))
  const maxValue = Math.max(maxImports, maxExports)

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params) => {
        const data = params[0]
        return `${data.name}<br/>${partnerView.value === 'imports' ? 'Imports' : 'Exports'}: ${formatValue(data.value)}`
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      max: maxValue, // Fixed max to keep scale consistent
      axisLabel: {
        formatter: (value) => {
          if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`
          if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
          if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`
          return `${value}`
        },
      },
    },
    yAxis: {
      type: 'category',
      data: data.map(p => p.country_name),
      inverse: true,
    },
    series: [
      {
        name: partnerView.value === 'imports' ? 'Imports' : 'Exports',
        type: 'bar',
        data: data.map(p => p.value),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: color[0] },
              { offset: 1, color: color[1] },
            ],
          },
        },
        barWidth: '60%',
      },
    ],
  }
})

// Trade Trend Chart (Imports vs Exports)
const trendChartOption = computed(() => {
  if (!overviewData.value) return {}
  
  const data = overviewData.value.charts.trade_trend_12m

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
      data: ['Imports', 'Exports'],
      top: 10,
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
      data: data.map(d => d.month_label),
      axisLabel: {
        fontSize: 11,
        rotate: 45,
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
    series: [
      {
        name: 'Imports',
        type: 'line',
        data: data.map(d => d.imports),
        smooth: true,
        lineStyle: {
          width: 3,
          color: TRADE_COLORS.IMPORTS.primary,
        },
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: TRADE_COLORS.IMPORTS.primary,
        },
      },
      {
        name: 'Exports',
        type: 'line',
        data: data.map(d => d.exports),
        smooth: true,
        lineStyle: {
          width: 3,
          color: TRADE_COLORS.EXPORTS.primary,
        },
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: TRADE_COLORS.EXPORTS.primary,
        },
      },
    ],
  }
})

// Top Product Categories Chart (Donut)
const categoriesChartOption = computed(() => {
  if (!overviewData.value) return {}
  
  const data = overviewData.value.charts.top_product_categories

  return {
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        return `${params.name}<br/>${params.marker} ${formatValue(params.value)} (${params.percent}%)`
      },
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      formatter: (name) => {
        const item = data.find(d => d.category_name === name)
        return `${item.hs_chapter} - ${name}`
      },
    },
    series: [
      {
        name: 'Trade Value',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: (params) => {
            return `${params.percent}%`
          },
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
          },
        },
        data: data.map(d => ({
          value: d.value,
          name: d.category_name,
        })),
      },
    ],
  }
})
</script>
