<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Navigation Tabs -->
    <nav class="bg-white shadow-md sticky top-0 z-50">
      <div class="px-6">
        <div class="flex items-center gap-4">
          <!-- Logo -->
          <router-link to="/" class="flex items-center py-2">
            <img src="/icon.png" alt="Israel Trade" class="h-16 w-16" />
          </router-link>

          <!-- Tabs -->
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
  { name: 'World Map', path: '/world-map', icon: '🗺️' },
  { name: 'AI Chat', path: '/ai-chat', icon: '🤖' },
  { name: 'About', path: '/about', icon: 'ℹ️' },
  // Hidden pages (kept in code for later):
  // { name: 'Product Origins', path: '/product-origin', icon: '🌍' },
  // { name: 'Trends', path: '/trends', icon: '📉' },
  // { name: 'HS Code Lookup', path: '/hs-lookup', icon: '🔎' },
]

function isActive(path) {
  if (path === '/world-map') {
    return route.path === '/world-map'
  }
  if (path === '/about') {
    return route.path === '/about'
  }
  return route.path === path
}
</script>
