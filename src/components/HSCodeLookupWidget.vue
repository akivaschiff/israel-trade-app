<template>
  <div class="max-w-3xl mx-auto">
    <!-- Search Input - Always visible -->
    <div class="mb-4">
      <form @submit.prevent="handleSubmit" class="flex gap-2">
        <input
          v-model="input"
          type="text"
          :placeholder="placeholder"
          class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
          :disabled="isLoading"
          ref="inputRef"
        />
        <button
          type="submit"
          :disabled="isLoading || !input.trim()"
          class="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium min-w-[100px]"
        >
          <span v-if="!isLoading" class="flex items-center justify-center">Search</span>
          <span v-else class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Search</span>
          </span>
        </button>
      </form>
    </div>

    <!-- Current question from assistant (only the latest one) -->
    <div v-if="currentQuestion && !foundCodes" class="mb-4">
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
        <div class="text-sm font-medium text-gray-700 mb-2">Please clarify:</div>
        <div class="text-gray-800 whitespace-pre-wrap">{{ currentQuestion }}</div>
      </div>
    </div>

    <!-- HS Codes Result Card -->
    <div v-if="foundCodes && foundCodes.length > 0" class="mb-4">
      <div class="bg-white rounded-lg shadow-lg border border-green-200 overflow-hidden">
        <div class="bg-green-50 px-4 py-3 border-b border-green-200 flex items-center justify-between">
          <h3 class="font-semibold text-green-800">
            HS Codes Found ({{ foundCodes.length }})
          </h3>
          <button
            @click="handleNewSearch"
            class="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            New Search
          </button>
        </div>
        <div class="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          <div
            v-for="(hsCode, idx) in foundCodes"
            :key="idx"
            class="px-4 py-3 hover:bg-gray-50 transition-colors group"
          >
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0">
                <span class="inline-block bg-indigo-100 text-indigo-800 font-mono font-bold text-sm px-3 py-1.5 rounded">
                  {{ hsCode.code }}
                </span>
              </div>
              <div class="flex-1 min-w-0 cursor-pointer" @click="selectCode(hsCode)">
                <p class="text-sm text-gray-900 font-medium">{{ hsCode.description }}</p>
                <p v-if="hsCode.category" class="text-xs text-gray-500 mt-1">{{ hsCode.category }}</p>
              </div>
              <button
                @click="removeCode(idx)"
                class="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                title="Remove this code"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error message -->
    <div v-if="error" class="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
      {{ error }}
    </div>

  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

const props = defineProps({
  autoFocus: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select'])

// API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// State
const input = ref('')
const inputRef = ref(null)
const isLoading = ref(false)
const error = ref(null)
const conversationHistory = ref([])
const foundCodes = ref(null)

// Computed
const currentQuestion = computed(() => {
  if (conversationHistory.value.length === 0) return null
  const lastMessage = conversationHistory.value[conversationHistory.value.length - 1]
  return lastMessage.role === 'assistant' && !lastMessage.hsCodes ? lastMessage.content : null
})

const placeholder = computed(() => {
  if (currentQuestion.value) {
    return 'Type your answer...'
  }
  return 'Enter product name (e.g., coffee, tomatoes, smartphones)...'
})

const exampleQueries = [
  'coffee',
  'fresh tomatoes',
  'smartphones',
  'cotton fabric',
  'dairy products'
]

// Methods
async function handleSubmit() {
  if (!input.value.trim() || isLoading.value) return

  const userMessage = input.value.trim()
  input.value = ''
  isLoading.value = true
  error.value = null

  // Add user message to history
  conversationHistory.value.push({
    role: 'user',
    content: userMessage
  })

  try {
    // Clean history for API (only role and content)
    const cleanHistory = conversationHistory.value.map(msg => ({
      role: msg.role,
      content: msg.content
    }))

    const response = await fetch(`${API_URL}/api/hs-code-lookup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: userMessage,
        conversationHistory: cleanHistory.slice(0, -1) // Don't include the message we just added
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Add assistant response to history
    conversationHistory.value.push({
      role: 'assistant',
      content: data.answer,
      hsCodes: data.hsCodes || null
    })

    // If we got HS codes, show them
    if (data.hsCodes && data.hsCodes.length > 0) {
      foundCodes.value = data.hsCodes
    }

  } catch (err) {
    console.error('HS Code lookup error:', err)
    error.value = 'Failed to search HS codes. Please try again.'
  } finally {
    isLoading.value = false
    await nextTick()
    inputRef.value?.focus()
  }
}

function quickSearch(query) {
  input.value = query
  handleSubmit()
}

function handleNewSearch() {
  conversationHistory.value = []
  foundCodes.value = null
  input.value = ''
  error.value = null
  nextTick(() => {
    inputRef.value?.focus()
  })
}

function selectCode(hsCode) {
  emit('select', hsCode)
}

function removeCode(index) {
  foundCodes.value.splice(index, 1)

  // If no codes left after removal, reset to allow new search
  if (foundCodes.value.length === 0) {
    handleNewSearch()
  }
}

// Auto-focus on mount if prop is set
if (props.autoFocus) {
  nextTick(() => {
    inputRef.value?.focus()
  })
}
</script>

<style scoped>
/* Smooth transitions */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-duration: 200ms;
  transition-timing-function: ease-in-out;
}
</style>
