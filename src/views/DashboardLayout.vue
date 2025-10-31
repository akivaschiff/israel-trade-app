<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Navigation Tabs -->
    <nav class="bg-white shadow-md sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex space-x-1 overflow-x-auto">
          <router-link
            v-for="tab in tabs"
            :key="tab.path"
            :to="tab.path"
            class="px-6 py-4 font-semibold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors whitespace-nowrap border-b-4"
            :class="isActive(tab.path) ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-transparent'"
          >
            <span class="mr-2">{{ tab.icon }}</span>
            {{ tab.name }}
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Page Content -->
    <div>
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const tabs = [
  { name: 'Overview', path: '/overview', icon: '📊' },
  { name: 'Product Origins', path: '/product-origin', icon: '🌍' },
  { name: 'World Map', path: '/world-map', icon: '🗺️' },
  { name: 'Trends', path: '/trends', icon: '📉' },
  { name: 'AI Chat', path: '/chat', icon: '💬' },
]

function isActive(path) {
  if (path === '/chat') {
    return route.path === '/chat' || route.path.startsWith('/chat/')
  }
  if (path === '/world-map') {
    return route.path === '/world-map'
  }
  return route.path === path
}
</script>
