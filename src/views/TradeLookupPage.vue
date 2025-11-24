<template>
  <div class="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50">
    <div class="text-center px-4">
      <div class="w-20 h-20 bg-[#053778]/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg class="w-10 h-10 text-[#053778]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h1 class="text-3xl font-bold text-gray-800 mb-4">
        {{ locale === 'he' ? 'חיפוש סחר' : 'Trade Lookup' }}
      </h1>
      <p class="text-gray-600 max-w-md mx-auto mb-8">
        {{ locale === 'he'
          ? 'תכונה זו בפיתוח. בקרוב תוכלו לחפש מוצרים ומדינות בנתוני הסחר.'
          : 'This feature is under development. Soon you\'ll be able to search for products and countries in trade data.'
        }}
      </p>
      <router-link
        to="/world-map"
        class="btn-primary inline-flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ locale === 'he' ? 'למפת העולם' : 'Go to World Map' }}
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'

const locale = inject('locale', 'en')
</script>
