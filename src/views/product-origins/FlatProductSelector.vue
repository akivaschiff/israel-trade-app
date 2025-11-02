<template>
  <div class="space-y-4">
    <!-- Search Box -->
    <div>
      <input
        v-model="searchTerm"
        @input="onSearchInput"
        type="text"
        placeholder="Type a product name, category, or HS code..."
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
      />
      <p class="text-xs text-gray-500 mt-2">
        Type at least 2 characters to search
      </p>
    </div>

    <!-- Search Results - Flat List -->
    <div v-if="searchResults.length > 0" class="border border-gray-300 rounded-lg overflow-hidden">
      <div class="bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700 border-b border-gray-300 flex items-center justify-between">
        <span>Search Results ({{ searchResults.length }} products found)</span>
        <button
          @click="selectAllResults"
          class="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
        >
          {{ allResultsSelected ? 'Deselect All' : 'Select All' }}
        </button>
      </div>
      <div class="max-h-96 overflow-y-auto">
        <label
          v-for="product in searchResults"
          :key="product.code"
          class="flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
        >
          <input
            type="checkbox"
            :checked="modelValue.has(product.code)"
            @change="toggleProduct(product)"
            class="rounded mt-0.5 flex-shrink-0"
          />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-mono text-xs text-indigo-600 font-semibold">{{ product.code }}</span>
            </div>
            <div class="text-sm text-gray-800">{{ product.description }}</div>
            <div class="text-xs text-gray-500 mt-0.5">
              Chapter {{ product.chapter }}: {{ product.chapter_name }}
            </div>
          </div>
        </label>
      </div>
    </div>

    <!-- No Results -->
    <div v-else-if="searchTerm.length >= 2 && !searching" class="text-center py-8 text-gray-500 text-sm">
      No products found matching "{{ searchTerm }}"
    </div>

    <!-- Searching Indicator -->
    <div v-if="searching" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <p class="text-sm text-gray-500 mt-2">Searching...</p>
    </div>

    <!-- Selected Items Box -->
    <div v-if="modelValue.size > 0" class="border border-indigo-300 rounded-lg bg-indigo-50 p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-indigo-900">
          Selected: {{ modelValue.size }} {{ modelValue.size === 1 ? 'product' : 'products' }}
        </h3>
        <button
          @click="clearAll"
          class="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Clear All
        </button>
      </div>
      <div class="space-y-2">
        <div
          v-for="code in Array.from(modelValue)"
          :key="code"
          class="flex items-start gap-2 bg-white px-3 py-2 rounded-md text-sm border border-indigo-200 mb-2"
        >
          <div class="flex-1 min-w-0">
            <div class="font-mono text-xs text-indigo-700 font-semibold">{{ code }}</div>
            <div class="text-xs text-gray-700 truncate">{{ getProductName(code) }}</div>
          </div>
          <button
            @click="removeProduct(code)"
            class="text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Set,
    default: () => new Set()
  },
  onSearch: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const searchTerm = ref('')
const searchResults = ref([])
const searching = ref(false)

let searchTimeout = null

// Handle search input with debounce
async function onSearchInput() {
  clearTimeout(searchTimeout)
  
  if (searchTerm.value.length < 2) {
    searchResults.value = []
    return
  }
  
  searching.value = true
  searchTimeout = setTimeout(async () => {
    const results = await props.onSearch(searchTerm.value)
    searchResults.value = results
    searching.value = false
  }, 300)
}

// Check if all results are selected
const allResultsSelected = computed(() => {
  return searchResults.value.length > 0 && 
         searchResults.value.every(product => props.modelValue.has(product.code))
})

// Select/deselect all search results
function selectAllResults() {
  const newSet = new Set(props.modelValue)
  const action = allResultsSelected.value ? 'delete' : 'add'
  searchResults.value.forEach(product => newSet[action](product.code))
  emitUpdate(newSet)
}

// Helper to emit new set
function emitUpdate(newSet) {
  emit('update:modelValue', newSet)
}

// Toggle product selection
function toggleProduct(product) {
  const newSet = new Set(props.modelValue)
  newSet.has(product.code) ? newSet.delete(product.code) : newSet.add(product.code)
  emitUpdate(newSet)
}

// Remove product
function removeProduct(code) {
  const newSet = new Set(props.modelValue)
  newSet.delete(code)
  emitUpdate(newSet)
}

// Clear all selections
function clearAll() {
  emitUpdate(new Set())
}

// Get product name from search results
function getProductName(code) {
  const product = searchResults.value.find(p => p.code === code)
  return product?.description || code
}
</script>
