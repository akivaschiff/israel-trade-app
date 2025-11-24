<template>
  <div class="min-h-[calc(100vh-64px)]">
    <!-- Hero Section with Full Image - rise-il style -->
    <section class="relative h-[80vh] min-h-[500px] overflow-hidden">
      <!-- Background Image -->
      <img
        src="/trade-image.png"
        alt="Israel Trade"
        class="absolute inset-0 w-full h-full object-cover"
      />

      <!-- Dark Overlay for text readability -->
      <div class="absolute inset-0 bg-black/40"></div>

      <!-- Animated dots/lines like rise-il (decorative) -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full"></div>
        <div class="absolute top-1/3 right-1/3 w-2 h-2 bg-white/30 rounded-full"></div>
        <div class="absolute bottom-1/3 left-1/2 w-2 h-2 bg-white/30 rounded-full"></div>
        <div class="absolute top-1/2 right-1/4 w-2 h-2 bg-white/30 rounded-full"></div>
        <div class="absolute bottom-1/4 right-1/2 w-2 h-2 bg-white/30 rounded-full"></div>
        <div class="absolute top-2/3 left-1/3 w-2 h-2 bg-white/30 rounded-full"></div>
      </div>

      <!-- Hero Content -->
      <div class="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <!-- Main Title -->
        <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-lg leading-tight">
          <span v-if="locale === 'he'" class="font-hebrew" dir="rtl">
            הסחר של ישראל
          </span>
          <span v-else class="font-display">
            Israel's Trade
          </span>
        </h1>

        <!-- Subtitle -->
        <p class="text-lg sm:text-xl md:text-2xl text-white/90 max-w-2xl mb-8 drop-shadow px-4">
          {{ locale === 'he'
            ? 'חקרו את נתוני הסחר של ישראל עם העולם'
            : 'Explore Israel\'s trade data with the world'
          }}
        </p>

        <!-- CTA Button -->
        <router-link
          to="/world-map"
          class="inline-flex items-center gap-2 bg-[#053778] hover:bg-[#042d63] text-white text-base sm:text-lg px-6 sm:px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
        >
          {{ locale === 'he' ? 'מפת העולם' : 'World Map' }}
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" :class="locale === 'he' ? 'rotate-180' : ''">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </router-link>
      </div>

      <!-- Scroll indicator -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg class="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 px-4 bg-white">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-12">
          {{ locale === 'he' ? 'גלו את הנתונים' : 'Discover the Data' }}
        </h2>

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <!-- Feature 1: World Map -->
          <router-link to="/world-map" class="card p-6 hover:shadow-lg transition-shadow group">
            <div class="w-14 h-14 bg-[#053778]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#053778]/20 transition-colors">
              <svg class="w-7 h-7 text-[#053778]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-2">
              {{ locale === 'he' ? 'מפת העולם' : 'World Map' }}
            </h3>
            <p class="text-gray-600">
              {{ locale === 'he'
                ? 'צפו בנתוני הייבוא והייצוא של ישראל על גבי מפת העולם'
                : 'View Israel\'s import and export data on an interactive world map'
              }}
            </p>
          </router-link>

          <!-- Feature 2: Product Lookup -->
          <router-link to="/trade-lookup" class="card p-6 hover:shadow-lg transition-shadow group">
            <div class="w-14 h-14 bg-[#053778]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#053778]/20 transition-colors">
              <svg class="w-7 h-7 text-[#053778]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-2">
              {{ locale === 'he' ? 'חיפוש מוצרים' : 'Product Lookup' }}
            </h3>
            <p class="text-gray-600">
              {{ locale === 'he'
                ? 'חפשו מוצרים ומדינות ספציפיים בנתוני הסחר'
                : 'Search for specific products and countries in trade data'
              }}
            </p>
          </router-link>

          <!-- Feature 3: AI Analyst -->
          <router-link to="/ai-chat" class="card p-6 hover:shadow-lg transition-shadow group sm:col-span-2 lg:col-span-1">
            <div class="w-14 h-14 bg-[#053778]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#053778]/20 transition-colors">
              <svg class="w-7 h-7 text-[#053778]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-2">
              {{ locale === 'he' ? 'אנליסט AI' : 'AI Analyst' }}
            </h3>
            <p class="text-gray-600">
              {{ locale === 'he'
                ? 'נתחו מגמות סחר וקבלו תובנות מיידיות משנים של נתונים'
                : 'Uncover trade patterns and get instant insights from years of data'
              }}
            </p>
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { inject } from 'vue'

const locale = inject('locale', 'en')
</script>
