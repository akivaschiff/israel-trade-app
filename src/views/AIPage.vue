<template>
  <div class="min-h-[calc(100vh-64px)] bg-gradient-to-b from-blue-50 via-white to-blue-50 flex items-center justify-center">
    <div class="max-w-3xl mx-auto px-6 py-12 text-center">
      <!-- Icon -->
      <div class="mb-8">
        <div class="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full shadow-lg">
          <span class="text-6xl">🤖</span>
        </div>
      </div>

      <!-- Title -->
      <h1 class="text-5xl font-bold text-gray-900 mb-4">
        AI Chat Coming Soon
      </h1>

      <!-- Countdown -->
      <div class="mb-8">
        <p class="text-2xl text-gray-700 mb-4 font-semibold">
          Launching This Thursday
        </p>
        <div class="flex justify-center gap-4 mb-6">
          <div class="bg-white rounded-xl shadow-lg p-4 min-w-[80px]">
            <div class="text-4xl font-bold text-blue-600">{{ days }}</div>
            <div class="text-sm text-gray-600 font-semibold">Days</div>
          </div>
          <div class="bg-white rounded-xl shadow-lg p-4 min-w-[80px]">
            <div class="text-4xl font-bold text-blue-600">{{ hours }}</div>
            <div class="text-sm text-gray-600 font-semibold">Hours</div>
          </div>
          <div class="bg-white rounded-xl shadow-lg p-4 min-w-[80px]">
            <div class="text-4xl font-bold text-blue-600">{{ minutes }}</div>
            <div class="text-sm text-gray-600 font-semibold">Minutes</div>
          </div>
          <div class="bg-white rounded-xl shadow-lg p-4 min-w-[80px]">
            <div class="text-4xl font-bold text-blue-600">{{ seconds }}</div>
            <div class="text-sm text-gray-600 font-semibold">Seconds</div>
          </div>
        </div>
      </div>

      <!-- Description -->
      <p class="text-xl text-gray-700 mb-10 leading-relaxed max-w-2xl mx-auto">
        Ask questions about Israel's trade data in natural language.
      </p>

      <!-- Animated Examples -->
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-8 relative overflow-hidden">
        <div class="mb-4">
          <p class="text-lg text-gray-600 font-semibold">Example questions:</p>
        </div>

        <div class="relative h-24 flex items-center justify-center">
          <transition name="fade" mode="out-in">
            <div :key="currentQuestion" class="flex items-center gap-3 text-left">
              <span class="text-blue-600 text-3xl">💬</span>
              <span class="text-xl text-gray-800 font-medium">{{ currentQuestion }}</span>
            </div>
          </transition>
        </div>
      </div>

      <!-- Coming Soon Badge -->
      <div class="inline-block bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-10 py-4 rounded-full font-bold text-lg shadow-2xl animate-pulse">
        Get Ready! 🚀
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
