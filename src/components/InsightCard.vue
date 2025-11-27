<template>
  <article
    class="insight-card group bg-white border border-slate-200/60 overflow-hidden cursor-pointer transition-all duration-500 hover:border-slate-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
    @click="$emit('click')"
  >
    <!-- Thumbnail Image -->
    <div class="relative overflow-hidden aspect-[4/3]">
      <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
      <img
        v-if="insight.thumbnailImage"
        :src="insight.thumbnailImage"
        :alt="locale === 'he' ? insight.titleHe : insight.title"
        class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
      />
      <div v-else class="w-full h-full bg-slate-100 flex items-center justify-center">
        <span class="text-slate-400 text-sm">{{ locale === 'he' ? 'תמונה' : 'Image' }}</span>
      </div>
    </div>

    <!-- Content -->
    <div class="p-8">
      <!-- Date -->
      <time class="block text-xs font-medium tracking-[0.15em] uppercase text-slate-500 mb-4 letter-spacing-wide">
        {{ formatDate(insight.date) }}
      </time>

      <!-- Title -->
      <h3
        class="text-2xl font-serif font-bold text-slate-900 mb-4 leading-tight group-hover:text-slate-700 transition-colors duration-300"
        :dir="locale === 'he' ? 'rtl' : 'ltr'"
        style="font-family: 'Playfair Display', 'Noto Serif Hebrew', Georgia, serif;"
      >
        {{ locale === 'he' ? insight.titleHe : insight.title }}
      </h3>

      <!-- Short Description -->
      <p
        class="text-slate-600 leading-relaxed line-clamp-3 text-[15px]"
        :dir="locale === 'he' ? 'rtl' : 'ltr'"
      >
        {{ locale === 'he' ? insight.shortDescriptionHe : insight.shortDescription }}
      </p>

      <!-- Read More Indicator -->
      <div class="mt-6 flex items-center gap-2 text-sm font-medium text-slate-900 group-hover:gap-3 transition-all">
        <span>{{ locale === 'he' ? 'קרא עוד' : 'Read more' }}</span>
        <svg
          class="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
          :class="locale === 'he' ? 'rotate-180 group-hover:-translate-x-1' : ''"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
    </div>
  </article>
</template>

<script setup>
import { inject } from 'vue'

defineProps({
  insight: {
    type: Object,
    required: true
  }
})

defineEmits(['click'])

const locale = inject('locale', 'en')

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString(locale.value === 'he' ? 'he-IL' : 'en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
