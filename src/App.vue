<script setup lang="ts">
import { ref } from 'vue'
import OverviewPage from './views/OverviewPage.vue'
import TimeSeriesPage from './views/TimeSeriesPage.vue'
import ProductOriginPage from './views/ProductOriginPage.vue'

const currentTab = ref('overview')

const tabs = [
  { id: 'overview', name: 'Overview', icon: '📊' },
  { id: 'timeseries', name: 'Time Series', icon: '📈' },
  { id: 'origin', name: 'Product Origins', icon: '🌍' },
]
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Tab Navigation -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-8">
        <nav class="flex space-x-8">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="currentTab = tab.id"
            :class="[
              'px-4 py-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2',
              currentTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            <span class="text-lg">{{ tab.icon }}</span>
            {{ tab.name }}
          </button>
        </nav>
      </div>
    </div>

    <!-- Tab Content -->
    <div>
      <OverviewPage v-if="currentTab === 'overview'" />
      <TimeSeriesPage v-if="currentTab === 'timeseries'" />
      <ProductOriginPage v-if="currentTab === 'origin'" />
    </div>
  </div>
</template>

<style scoped></style>
