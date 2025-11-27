<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="close"
      >
        <div
          class="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          @click.stop
        >
          <!-- Header -->
          <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between">
            <div class="flex-1 pr-4">
              <h2 class="text-2xl font-bold text-gray-800" :dir="locale === 'he' ? 'rtl' : 'ltr'">
                {{ locale === 'he' ? insight.titleHe : insight.title }}
              </h2>
              <p class="text-sm text-gray-500 mt-1">
                {{ insight.date }}
              </p>
            </div>
            <button
              @click="close"
              class="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              :aria-label="locale === 'he' ? 'סגור' : 'Close'"
            >
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="p-6">
            <!-- Chart or Image -->
            <div class="rounded-lg overflow-hidden mb-6 bg-white p-6 border border-gray-200">
              <InsightChart
                v-if="insight.chartData"
                :chart-data="insight.chartData"
              />
              <img
                v-else-if="insight.chartImage"
                :src="insight.chartImage"
                :alt="locale === 'he' ? insight.titleHe : insight.title"
                class="w-full max-h-96 object-contain"
              />
              <div v-else class="h-96 flex items-center justify-center bg-gray-50">
                <span class="text-gray-400">{{ locale === 'he' ? 'גרף' : 'Chart' }}</span>
              </div>
            </div>

            <!-- Full Description -->
            <div
              class="prose max-w-none text-gray-700 mb-6"
              :dir="locale === 'he' ? 'rtl' : 'ltr'"
            >
              <p class="whitespace-pre-line">
                {{ locale === 'he' ? insight.descriptionHe : insight.description }}
              </p>
            </div>

            <!-- Read More Link -->
            <div v-if="insight.readMoreUrl" class="pt-4 border-t border-gray-200">
              <a
                :href="insight.readMoreUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 text-[#053778] hover:text-[#042d63] font-medium"
              >
                <span>{{ locale === 'he' ? 'קרא עוד' : 'Read more' }}</span>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" :class="locale === 'he' ? 'rotate-180' : ''">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { inject, watch } from 'vue'
import InsightChart from './InsightChart.vue'

const props = defineProps({
  insight: {
    type: Object,
    required: true
  },
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const locale = inject('locale', 'en')

function close() {
  emit('close')
}

// Close on Escape key
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        close()
      }
    }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.3s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.95);
}
</style>
