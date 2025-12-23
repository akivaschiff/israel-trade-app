<template>
  <div class="min-h-screen bg-white">
    <!-- Main Navigation - rise-il style -->
    <nav class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo & Brand -->
          <router-link to="/" class="flex items-center gap-3 -my-2">
            <img src="/icon.png" alt="Israel Trade" class="h-14 w-14" />
          </router-link>

          <!-- Navigation Tabs - Center -->
          <div class="hidden md:flex items-center gap-1">
            <router-link
              v-for="tab in tabs"
              :key="tab.path"
              :to="tab.path"
              class="px-4 py-5 text-sm font-medium transition-colors border-b-3"
              :class="isActive(tab.path)
                ? 'text-[#053778] border-[#053778]'
                : 'text-gray-600 hover:text-[#053778] border-transparent hover:border-gray-300'"
            >
              <span class="flex items-center gap-2">
                <span v-if="tab.icon" class="text-lg">{{ tab.icon }}</span>
                <span>{{ locale === 'he' ? tab.nameHe : tab.name }}</span>
              </span>
            </router-link>
          </div>

          <!-- Language Toggle - Right side -->
          <div class="flex items-center gap-4">
            <button
              @click="toggleLocale"
              class="text-[#053778] hover:text-[#042d63] text-sm font-semibold transition-colors"
            >
              {{ locale === 'he' ? 'EN' : 'עב' }}
            </button>

            <!-- Mobile menu button -->
            <button
              @click="mobileMenuOpen = !mobileMenuOpen"
              class="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <svg v-if="!mobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <div v-if="mobileMenuOpen" class="md:hidden border-t border-gray-200 bg-white">
        <div class="px-4 py-2 space-y-1">
          <router-link
            v-for="tab in tabs"
            :key="tab.path"
            :to="tab.path"
            @click="mobileMenuOpen = false"
            class="block px-4 py-3 rounded-lg text-sm font-medium transition-colors"
            :class="isActive(tab.path)
              ? 'bg-[#053778]/10 text-[#053778]'
              : 'text-gray-600 hover:bg-gray-100'"
          >
            <span class="flex items-center gap-2">
              <span v-if="tab.icon" class="text-lg">{{ tab.icon }}</span>
              <span>{{ locale === 'he' ? tab.nameHe : tab.name }}</span>
            </span>
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Page Content -->
    <main>
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-50 border-t border-gray-200 py-8 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <img src="/icon.png" alt="Israel Trade" class="h-8 w-8 opacity-60" />
            <span class="text-gray-500 text-sm">
              {{ locale === 'he' ? '© 2025 סחר ישראל. כל הזכויות שמורות.' : '© 2025 Israel Trade. All rights reserved.' }}
            </span>
          </div>
          <div class="flex items-center gap-6 text-sm text-gray-500">
            <router-link to="/about" class="hover:text-[#053778]">
              {{ locale === 'he' ? 'אודות' : 'About' }}
            </router-link>
            <router-link to="/contact" class="hover:text-[#053778]">
              {{ locale === 'he' ? 'צור קשר' : 'Contact' }}
            </router-link>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const mobileMenuOpen = ref(false)

// Locale management
const locale = ref('en')
provide('locale', locale)

function toggleLocale() {
  locale.value = locale.value === 'en' ? 'he' : 'en'
}

const tabs = [
  { name: 'Israel Trade Map', nameHe: 'מפת סחר ישראל', path: '/world-map', icon: '' },
  { name: 'Product Lookup', nameHe: 'חיפוש מוצרים', path: '/trade-lookup', icon: '' },
  { name: 'Trade Balance', nameHe: 'מאזן סחר', path: '/overview', icon: '' },
  { name: 'AI Analyst', nameHe: 'אנליסט AI', path: '/ai-chat', icon: '' },
  { name: 'Insights', nameHe: 'תובנות', path: '/insights', icon: '' },
  { name: 'About', nameHe: 'אודות', path: '/about', icon: '' },
  { name: 'Contact', nameHe: 'צור קשר', path: '/contact', icon: '' },
]

function isActive(path) {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>

<style scoped>
.border-b-3 {
  border-bottom-width: 3px;
}
</style>
