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
          AI Trade Analyst
        </h1>
        <p class="text-slate-400 mt-3 text-lg max-w-2xl">
          Use natural language to get deep insights on trade data.
        </p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-6 -mt-8 relative z-10 pb-16">
      <!-- Premium Notice Card -->
      <div class="bg-gradient-to-br from-amber-50 to-white rounded-3xl shadow-2xl shadow-slate-200/80 border border-amber-200 p-8 md:p-10 mb-8">
        <div class="flex items-start gap-4 mb-6">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30 flex-shrink-0">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="text-xl font-bold text-slate-900 mb-2">Premium Feature</h3>
            <p class="text-slate-700 leading-relaxed">
              The AI Analyst connects Claude—Anthropic's most advanced AI model—directly to Israel's complete trade database, enabling sophisticated analysis of import/export patterns, economic trends, and market dynamics. Available exclusively for premium users.
            </p>
          </div>
        </div>
        <p class="text-center text-slate-600 font-medium">
          Interested? <a href="/contact" class="text-amber-600 hover:text-amber-700 underline font-semibold">Contact me directly</a> to get access.
        </p>
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

          <div class="space-y-4">
            <div class="relative h-20 flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-100">
              <transition name="fade" mode="out-in">
                <div :key="currentQuestion" class="flex items-center gap-3 px-6">
                  <svg class="w-5 h-5 text-amber-500 flex-shrink-0 transform rotate-180" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z"/>
                  </svg>
                  <span class="text-lg text-slate-700 font-medium">{{ currentQuestion }}</span>
                  <svg class="w-5 h-5 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z"/>
                  </svg>
                </div>
              </transition>
            </div>

            <!-- Rotation Dots -->
            <div class="flex items-center justify-center gap-2">
              <button
                v-for="(_, index) in questions"
                :key="index"
                @click="goToQuestion(index)"
                class="transition-all duration-300 cursor-pointer hover:scale-125"
                :class="[
                  index === questionIndex ? 'w-2 h-2 bg-amber-500' : 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400',
                  'rounded-full'
                ]"
                :aria-label="`Go to question ${index + 1}`"
              ></button>
            </div>
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
import { ref, onMounted, onUnmounted } from 'vue'

// Question rotation logic
const questions = [
  "Which imports typically peak in January and why?",
  "How did the war in October 2023 impact Israel's supply chains?",
  "What patterns emerge when comparing pre-war and post-war trade data?",
  "Which countries have become more strategic trading partners since 2023?",
  "Are there seasonal patterns in agricultural imports that could inform policy?",
  "What does the electronics import data suggest about Israel's tech manufacturing gaps?",
  "How has the diamond export market evolved over the past two years?",
  "Which emerging markets show the most growth potential for Israeli exports?",
  "What economic indicators can we derive from petroleum import fluctuations?",
  "How might current trade patterns predict next quarter's economic trends?",
  "Which product categories show the most resilience during economic uncertainty?",
  "What opportunities exist in markets where Israel currently has low export presence?"
]

const currentQuestion = ref(questions[0])
const questionIndex = ref(0)
let questionInterval = null

function startRotation() {
  // Clear existing interval if any
  if (questionInterval) clearInterval(questionInterval)

  // Rotate questions every 4 seconds
  questionInterval = setInterval(() => {
    questionIndex.value = (questionIndex.value + 1) % questions.length
    currentQuestion.value = questions[questionIndex.value]
  }, 4000)
}

function goToQuestion(index) {
  questionIndex.value = index
  currentQuestion.value = questions[index]
  // Restart rotation from this question
  startRotation()
}

onMounted(() => {
  startRotation()
})

onUnmounted(() => {
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
