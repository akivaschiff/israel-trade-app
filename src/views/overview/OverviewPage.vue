<template>
  <div class="overview-page min-h-[calc(100vh-64px)] bg-slate-50">
    <!-- Hero Header -->
    <div class="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIHN0cm9rZT0iIzMzNDQ1NSIgc3Ryb2tlLXdpZHRoPSIuNSIgb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-30"></div>
      <div class="relative max-w-7xl mx-auto px-6 py-12">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-1 h-8 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full"></div>
          <span class="text-amber-400 text-sm font-medium tracking-widest uppercase">Trade Analysis</span>
        </div>
        <h1 class="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
          Trade Balance Overview
        </h1>
        <p class="text-slate-400 mt-3 text-lg max-w-2xl">
          Track Israel's trade surplus and deficit over time across all trading partners.
        </p>
      </div>
    </div>

    <!-- Controls -->
    <div class="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
      <div class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/60 p-8 space-y-6">

        <!-- View Mode Toggle -->
        <div>
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">View Mode</label>
          <div class="flex gap-3">
            <button
              @click="viewMode = 'total'"
              :class="[
                'flex-1 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200',
                viewMode === 'total'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              ]"
            >
              Total (All Countries)
            </button>
            <button
              @click="viewMode = 'country'"
              :class="[
                'flex-1 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200',
                viewMode === 'country'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              ]"
            >
              By Country
            </button>
          </div>
        </div>

        <!-- Country Selector (visible only in country mode) -->
        <div v-if="viewMode === 'country'" class="space-y-3">
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Select Country</label>
          <div class="relative">
            <input
              v-model="countrySearch"
              type="text"
              placeholder="Search for a country..."
              class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
              @focus="showCountryDropdown = true"
            />

            <!-- Dropdown -->
            <div
              v-if="showCountryDropdown"
              class="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto"
            >
              <button
                v-for="country in filteredCountries"
                :key="country.code"
                @click="selectCountry(country)"
                class="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors text-sm border-b border-slate-100 last:border-b-0"
              >
                <div class="font-medium text-slate-900">{{ country.name }}</div>
                <div class="text-xs text-slate-500">{{ country.code }}</div>
              </button>

              <div v-if="filteredCountries.length === 0" class="px-4 py-6 text-center text-sm text-slate-500">
                No countries found
              </div>
            </div>
          </div>

          <!-- Selected Country Display -->
          <div v-if="selectedCountry" class="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
            <div>
              <div class="font-semibold text-indigo-900">{{ selectedCountry.name }}</div>
              <div class="text-xs text-indigo-600">{{ selectedCountry.code }}</div>
            </div>
            <button
              @click="clearCountry"
              class="text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Time Range Selectors -->
        <div v-if="availableMonths.length > 0">
          <div class="flex items-center justify-between mb-3">
            <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Time Range</label>
            <button
              @click="resetToDefaultRange"
              class="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Reset to Last 12 Months
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Start Month -->
            <div>
              <label class="block text-xs text-slate-500 mb-2">From</label>
              <select
                v-model="selectedStartMonth"
                class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
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

            <!-- End Month -->
            <div>
              <label class="block text-xs text-slate-500 mb-2">To</label>
              <select
                v-model="selectedEndMonth"
                class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
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
          </div>
        </div>
      </div>

      <!-- Chart Area -->
      <div v-if="chartData.length > 0" class="mt-8 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
        <!-- Chart Header -->
        <div class="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full bg-indigo-600"></div>
            <h2 class="text-2xl font-serif font-bold text-slate-900">
              Trade Balance
            </h2>
          </div>
          <p class="text-sm text-slate-500 mt-1 ml-6">
            {{ viewMode === 'total' ? 'All countries combined' : selectedCountry?.name || 'Select a country' }}
          </p>
        </div>

        <!-- Chart -->
        <div class="p-6" style="height: 520px;">
          <v-chart :option="chartOption" :autoresize="true" />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!loading" class="mt-8 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/60 p-16 text-center">
        <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
          <svg class="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 class="text-xl font-serif font-semibold text-slate-900">
          {{ viewMode === 'country' && !selectedCountry ? 'Select a country to view data' : 'No data available' }}
        </h3>
        <p class="mt-2 text-slate-500 max-w-sm mx-auto">
          {{ viewMode === 'country' && !selectedCountry ? 'Use the search above to find and select a country' : 'No trade balance data found for the selected time range' }}
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="mt-8 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/60 p-16 text-center">
        <div class="inline-block w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p class="text-sm text-slate-500 mt-4">Loading trade balance data...</p>
      </div>
    </div>

    <!-- Bottom spacing -->
    <div class="h-12"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { useOverview } from './useOverview'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent])

const {
  loading,
  chartData,
  availableMonths,
  countriesList,
  fetchAvailableMonths,
  fetchTotalBalance,
  fetchCountryBalance
} = useOverview()

// View mode: 'total' or 'country'
const viewMode = ref('total')

// Country selection
const selectedCountry = ref(null)
const countrySearch = ref('')
const showCountryDropdown = ref(false)

// Time range as indices into availableMonths array
const selectedStartMonth = ref(0)
const selectedEndMonth = ref(0)

// Click outside to close dropdown
onMounted(async () => {
  await fetchAvailableMonths()

  // Set default range to last 12 months
  if (availableMonths.value.length > 0) {
    resetToDefaultRange()
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Computed: Filtered countries based on search
const filteredCountries = computed(() => {
  if (!countrySearch.value) {
    return countriesList.value
  }
  const search = countrySearch.value.toLowerCase()
  return countriesList.value.filter(country =>
    country.name.toLowerCase().includes(search) ||
    country.code.toLowerCase().includes(search)
  )
})

// Watch for view mode or country changes to fetch data
watch([viewMode, selectedCountry, selectedStartMonth, selectedEndMonth], async () => {
  await loadBalanceData()
})

// Load balance data based on mode
async function loadBalanceData() {
  if (availableMonths.value.length === 0) return

  const startMonth = availableMonths.value[selectedStartMonth.value]
  const endMonth = availableMonths.value[selectedEndMonth.value]

  if (!startMonth || !endMonth) return

  if (viewMode.value === 'total') {
    await fetchTotalBalance(
      startMonth.year,
      startMonth.period,
      endMonth.year,
      endMonth.period
    )
  } else if (viewMode.value === 'country' && selectedCountry.value) {
    await fetchCountryBalance(
      selectedCountry.value.code,
      startMonth.year,
      startMonth.period,
      endMonth.year,
      endMonth.period
    )
  }
}

// Select country from dropdown
function selectCountry(country) {
  selectedCountry.value = country
  showCountryDropdown.value = false
  countrySearch.value = ''
}

// Clear selected country
function clearCountry() {
  selectedCountry.value = null
  chartData.value = []
}

// Handle click outside dropdown
function handleClickOutside(event) {
  const dropdown = event.target.closest('.relative')
  if (!dropdown) {
    showCountryDropdown.value = false
  }
}

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
  selectedEndMonth.value = 0 // Latest month
  selectedStartMonth.value = Math.min(11, availableMonths.value.length - 1) // 12 months back
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

// Format value in billions for Y-axis
function formatBillions(value) {
  const actualValue = value * 1000 // Convert from thousands to actual
  return `$${(actualValue / 1e9).toFixed(1)}B`
}

// Chart configuration
const chartOption = computed(() => {
  if (chartData.value.length === 0) return {}

  const dates = chartData.value.map(d => d.date)
  const imports = chartData.value.map(d => d.import_value)
  const exports = chartData.value.map(d => d.export_value)
  const balances = chartData.value.map(d => Math.abs(d.balance))

  return {
    animation: true,
    animationDuration: 750,
    animationEasing: 'cubicOut',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: (params) => {
        const dataPoint = chartData.value[params[0].dataIndex]
        const balanceType = dataPoint.balance >= 0 ? 'Surplus' : 'Deficit'
        const balanceColor = dataPoint.balance >= 0 ? '#10b981' : '#ef4444'

        let result = `<strong>${params[0].axisValue}</strong><br/>`
        result += `<span style="color: #3b82f6">● Imports: ${formatValue(dataPoint.import_value)}</span><br/>`
        result += `<span style="color: #f97316">● Exports: ${formatValue(dataPoint.export_value)}</span><br/>`
        result += `<span style="color: ${balanceColor}">● ${balanceType}: ${formatValue(Math.abs(dataPoint.balance))}</span>`
        return result
      }
    },
    legend: {
      data: ['Imports', 'Exports', 'Deficit/Surplus'],
      top: 0,
      textStyle: {
        fontSize: 13
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '12%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
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
      name: 'Value (Billions USD)',
      nameTextStyle: {
        fontSize: 12,
        color: '#64748b'
      },
      axisLabel: {
        formatter: (value) => formatBillions(value)
      }
    },
    series: [
      {
        name: 'Imports',
        type: 'line',
        smooth: false,
        symbol: 'circle',
        symbolSize: 5,
        showSymbol: true,
        lineStyle: {
          width: 2,
          color: '#3b82f6',
          type: 'dashed'
        },
        itemStyle: {
          color: '#3b82f6'
        },
        data: imports
      },
      {
        name: 'Exports',
        type: 'line',
        smooth: false,
        symbol: 'circle',
        symbolSize: 5,
        showSymbol: true,
        lineStyle: {
          width: 2,
          color: '#f97316',
          type: 'dashed'
        },
        itemStyle: {
          color: '#f97316'
        },
        data: exports
      },
      {
        name: 'Deficit/Surplus',
        type: 'line',
        smooth: false,
        symbol: 'circle',
        symbolSize: 7,
        showSymbol: true,
        lineStyle: {
          width: 3
        },
        itemStyle: {
          color: (params) => {
            return chartData.value[params.dataIndex].balance >= 0 ? '#10b981' : '#ef4444'
          }
        },
        data: balances
      }
    ]
  }
})
</script>
