<template>
  <div class="ai-page min-h-[calc(100vh-64px)] bg-slate-50 overflow-hidden">
    <!-- Hero Header -->
    <div class="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIHN0cm9rZT0iIzMzNDQ1NSIgc3Ryb2tlLXdpZHRoPSIuNSIgb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-30"></div>
      <div class="relative max-w-7xl mx-auto px-6 py-12">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-1 h-8 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full"></div>
          <span class="text-amber-400 text-sm font-medium tracking-widest uppercase">AI Analyst</span>
        </div>
        <h1 class="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
          Coming Soon
        </h1>
        <p class="text-slate-400 mt-3 text-lg max-w-2xl">
          Natural language interface for trade data analysis.
        </p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-6 -mt-8 relative z-10 pb-16">
      <!-- Countdown Card -->
      <div class="bg-white rounded-3xl shadow-2xl shadow-slate-200/80 border border-slate-100 p-8 md:p-10 mb-8">
        <p class="text-lg text-slate-600 mb-6 font-medium text-center">
          Launching This Thursday
        </p>
        <div class="flex justify-center gap-3 md:gap-4">
          <div class="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 min-w-[70px] md:min-w-[85px] border border-slate-200">
            <div class="text-3xl md:text-4xl font-bold text-slate-800">{{ days }}</div>
            <div class="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Days</div>
          </div>
          <div class="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 min-w-[70px] md:min-w-[85px] border border-slate-200">
            <div class="text-3xl md:text-4xl font-bold text-slate-800">{{ hours }}</div>
            <div class="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Hours</div>
          </div>
          <div class="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 min-w-[70px] md:min-w-[85px] border border-slate-200">
            <div class="text-3xl md:text-4xl font-bold text-slate-800">{{ minutes }}</div>
            <div class="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Min</div>
          </div>
          <div class="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 min-w-[70px] md:min-w-[85px] border border-slate-200">
            <div class="text-3xl md:text-4xl font-bold text-slate-800">{{ seconds }}</div>
            <div class="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Sec</div>
          </div>
        </div>
      </div>

      <!-- Example Questions Card -->
      <div class="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8 md:p-10 relative overflow-hidden">
        <!-- Decorative corner -->
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-50 to-transparent rounded-tr-3xl"></div>

        <div class="relative">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p class="text-slate-700 font-semibold">Example Questions</p>
          </div>

          <div class="relative h-20 flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-100">
            <transition name="fade" mode="out-in">
              <div :key="currentQuestion" class="flex items-center gap-3 px-6">
                <svg class="w-5 h-5 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z"/>
                </svg>
                <span class="text-lg text-slate-700 font-medium">{{ currentQuestion }}</span>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <!-- Tagline -->
      <div class="text-center mt-8">
        <div class="inline-flex items-center gap-2 bg-gradient-to-r from-slate-800 to-slate-700 text-white px-6 py-3 rounded-full font-medium text-sm shadow-lg">
          <svg class="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span>Powered by Claude AI</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

// Countdown logic
const now = ref(Date.now())
let interval = null

// Set target to next Wednesday at midnight
const getNextWednesday = () => {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const daysUntilWednesday = (4 - dayOfWeek + 7) % 7 || 7 // 3 = Wednesday
  const nextWednesday = new Date(today)
  nextWednesday.setDate(today.getDate() + daysUntilWednesday)
  nextWednesday.setHours(0, 0, 0, 0)
  return nextWednesday.getTime()
}

const targetDate = getNextWednesday()

const days = computed(() => {
  const diff = Math.max(0, targetDate - now.value)
  return Math.floor(diff / (1000 * 60 * 60 * 24))
})

const hours = computed(() => {
  const diff = Math.max(0, targetDate - now.value)
  return Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
})

const minutes = computed(() => {
  const diff = Math.max(0, targetDate - now.value)
  return Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
})

const seconds = computed(() => {
  const diff = Math.max(0, targetDate - now.value)
  return Math.floor((diff % (1000 * 60)) / 1000)
})

// Question rotation logic
const questions = [
  "Where does Israel import most electronics from?",
  "What are the top 5 countries we export to?",
  "Which countries does Israel trade with the most?",
  "Show me import trends for vehicles over the last year",
  "Show me the trend of diamond exports",
  "What products does Israel import from the United States?",
  "Which countries buy Israeli agricultural products?",
  "What's the trade balance with China?",
  "Show me monthly import trends for petroleum",
  "How much does Israel export in medical equipment?"
]

const currentQuestion = ref(questions[0])
let questionIndex = 0
let questionInterval = null

onMounted(() => {
  // Update countdown every second
  interval = setInterval(() => {
    now.value = Date.now()
  }, 1000)

  // Rotate questions every 3 seconds
  questionInterval = setInterval(() => {
    questionIndex = (questionIndex + 1) % questions.length
    currentQuestion.value = questions[questionIndex]
  }, 3000)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
  if (questionInterval) clearInterval(questionInterval)
})
</script>

<style scoped>
.ai-page {
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
