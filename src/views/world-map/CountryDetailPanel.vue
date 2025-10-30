<template>
  <transition name="slide">
    <div
      v-if="details"
      class="fixed right-0 top-16 bottom-0 w-[500px] bg-white shadow-2xl z-40 overflow-hidden flex flex-col"
    >
      <!-- Header -->
      <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-2xl font-bold mb-1">{{ details.country_name }}</h2>
            <p class="text-indigo-100 text-sm">{{ flowLabel }} from {{ monthLabel }}</p>
            <p class="text-2xl font-bold mt-2">{{ formatValue(details.total_value) }}</p>
          </div>
          <button
            @click="$emit('close')"
            class="text-white hover:text-indigo-200 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p class="text-gray-600">Loading product details...</p>
        </div>
      </div>

      <!-- Content -->
      <div v-else class="flex-1 overflow-y-auto p-6">
        <!-- Top 5 Chapters Chart -->
        <div class="mb-6">
          <h3 class="text-lg font-bold text-gray-800 mb-3">Top 5 HS Chapters</h3>
          <div style="height: 200px;">
            <v-chart :option="chartOption" :autoresize="true" />
          </div>
        </div>

        <!-- Product Tree -->
        <div>
          <h3 class="text-lg font-bold text-gray-800 mb-3">All Products (Tree View)</h3>
          <div class="space-y-2">
            <div
              v-for="chapter in details.chapters"
              :key="chapter.hs_chapter"
              class="border border-gray-200 rounded-lg overflow-hidden"
            >
              <!-- Chapter Level -->
              <div
                @click="toggleChapter(chapter.hs_chapter)"
                class="bg-indigo-50 p-3 cursor-pointer hover:bg-indigo-100 transition-colors flex items-center justify-between"
              >
                <div class="flex items-center gap-2">
                  <svg
                    :class="['w-4 h-4 transition-transform', expandedChapters.has(chapter.hs_chapter) ? 'rotate-90' : '']"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                  <span class="font-semibold text-indigo-900">
                    Chapter {{ chapter.hs_chapter }}
                  </span>
                </div>
                <div class="text-right">
                  <span class="font-bold text-indigo-900">{{ formatValue(chapter.value) }}</span>
                  <span class="text-sm text-indigo-600 ml-2">({{ chapter.percentage.toFixed(1) }}%)</span>
                </div>
              </div>

              <!-- Headings Level -->
              <div v-show="expandedChapters.has(chapter.hs_chapter)" class="bg-white">
                <div
                  v-for="heading in chapter.headings"
                  :key="heading.hs_heading"
                  class="border-t border-gray-100"
                >
                  <div
                    @click="toggleHeading(heading.hs_heading)"
                    class="bg-purple-50 p-3 pl-8 cursor-pointer hover:bg-purple-100 transition-colors flex items-center justify-between"
                  >
                    <div class="flex items-center gap-2">
                      <svg
                        :class="['w-3 h-3 transition-transform', expandedHeadings.has(heading.hs_heading) ? 'rotate-90' : '']"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                      <span class="font-semibold text-purple-900 text-sm">
                        Heading {{ heading.hs_heading }}
                      </span>
                    </div>
                    <div class="text-right">
                      <span class="font-bold text-purple-900 text-sm">{{ formatValue(heading.value) }}</span>
                      <span class="text-xs text-purple-600 ml-2">({{ heading.percentage.toFixed(1) }}%)</span>
                    </div>
                  </div>

                  <!-- Products Level -->
                  <div v-show="expandedHeadings.has(heading.hs_heading)" class="bg-gray-50">
                    <div
                      v-for="product in heading.products"
                      :key="product.hs_code"
                      class="p-3 pl-14 border-t border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <div class="flex items-start justify-between gap-4">
                        <div class="flex-1 min-w-0">
                          <p class="font-mono text-xs text-gray-500 mb-1">{{ product.hs_code }}</p>
                          <p class="text-sm text-gray-800">{{ product.description }}</p>
                        </div>
                        <div class="text-right flex-shrink-0">
                          <p class="font-bold text-sm text-gray-900">{{ formatValue(product.value) }}</p>
                          <p class="text-xs text-gray-600">({{ product.percentage.toFixed(1) }}%)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, PieChart, TooltipComponent, LegendComponent])

const props = defineProps({
  details: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  flowLabel: {
    type: String,
    default: 'Trade'
  },
  monthLabel: {
    type: String,
    default: ''
  }
})

defineEmits(['close'])

const expandedChapters = ref(new Set())
const expandedHeadings = ref(new Set())

function toggleChapter(chapterCode) {
  if (expandedChapters.value.has(chapterCode)) {
    expandedChapters.value.delete(chapterCode)
  } else {
    expandedChapters.value.add(chapterCode)
  }
}

function toggleHeading(headingCode) {
  if (expandedHeadings.value.has(headingCode)) {
    expandedHeadings.value.delete(headingCode)
  } else {
    expandedHeadings.value.add(headingCode)
  }
}

function formatValue(value) {
  // Multiply by 1000 since database stores values in thousands of USD
  const actualValue = Math.abs(value) * 1000
  
  if (actualValue >= 1e9) {
    return `${(actualValue / 1e9).toFixed(2)}B`
  } else if (actualValue >= 1e6) {
    return `${(actualValue / 1e6).toFixed(2)}M`
  } else if (actualValue >= 1e3) {
    return `${(actualValue / 1e3).toFixed(2)}K`
  }
  return `${actualValue.toFixed(2)}`
}

// Top 5 Chapters Donut Chart
const chartOption = computed(() => {
  if (!props.details?.top_chapters) return {}

  return {
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        return `Chapter ${params.name}<br/>${params.marker} ${formatValue(params.value)} (${params.percent}%)`
      },
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      formatter: (name) => `Ch ${name}`,
    },
    series: [
      {
        name: 'Chapters',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: (params) => `${params.percent}%`,
        },
        data: props.details.top_chapters.map(c => ({
          value: c.value,
          name: c.hs_chapter,
        })),
      },
    ],
  }
})
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(100%);
}
</style>
