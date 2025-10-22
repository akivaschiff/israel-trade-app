<template>
  <div class="relative">
    <!-- Search Input -->
    <div class="relative">
      <input
        v-model="searchQuery"
        @focus="showDropdown = true"
        @input="onSearchInput"
        type="text"
        placeholder="Search products (e.g., tomatoes, עגבניות, wheat)..."
        class="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
        :class="{ 'rounded-b-none': showDropdown && filteredLabels.length > 0 }"
      />
      <svg
        class="absolute right-3 top-3.5 h-5 w-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>

    <!-- Dropdown Results -->
    <div
      v-if="showDropdown && filteredLabels.length > 0"
      class="absolute z-10 w-full bg-white border border-t-0 border-gray-300 rounded-b-lg shadow-lg max-h-64 overflow-y-auto"
    >
      <button
        v-for="label in filteredLabels.slice(0, 20)"
        :key="label"
        @click="selectLabel(label)"
        class="w-full px-4 py-2 text-left hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0"
        :class="{ 'bg-purple-50': selectedLabels.includes(label) }"
      >
        <span class="text-gray-800">{{ label }}</span>
        <span v-if="selectedLabels.includes(label)" class="float-right text-purple-600">✓</span>
      </button>
    </div>

    <!-- Selected Labels Display -->
    <div v-if="selectedLabels.length > 0" class="mt-3 flex flex-wrap gap-2">
      <span
        v-for="label in selectedLabels"
        :key="label"
        class="inline-flex items-center px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 rounded-full text-sm font-medium"
      >
        {{ label }}
        <button
          @click="removeLabel(label)"
          class="ml-2 hover:text-purple-900 focus:outline-none"
        >
          ×
        </button>
      </span>
    </div>

    <!-- Info Text -->
    <p class="text-xs text-gray-500 mt-2">
      Search in English or Hebrew • {{ filteredLabels.length }} matches
    </p>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import allLabels from '@/lib/all_unique_labels.json'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'labelsChanged'])

const searchQuery = ref('')
const showDropdown = ref(false)
const selectedLabels = ref([...props.modelValue])

// Combine all labels (English + Hebrew)
const allSearchLabels = computed(() => {
  return [...allLabels.english, ...allLabels.hebrew]
})

// Filter labels based on search query
const filteredLabels = computed(() => {
  if (!searchQuery.value.trim()) {
    return allSearchLabels.value
  }
  
  const query = searchQuery.value.toLowerCase().trim()
  return allSearchLabels.value.filter(label => 
    label.toLowerCase().includes(query)
  ).sort((a, b) => {
    // Prioritize labels that start with the query
    const aStarts = a.toLowerCase().startsWith(query)
    const bStarts = b.toLowerCase().startsWith(query)
    if (aStarts && !bStarts) return -1
    if (!aStarts && bStarts) return 1
    return a.localeCompare(b)
  })
})

function onSearchInput() {
  showDropdown.value = true
}

function selectLabel(label) {
  if (selectedLabels.value.includes(label)) {
    // If already selected, remove it
    removeLabel(label)
  } else {
    // Add to selection
    selectedLabels.value.push(label)
    emit('update:modelValue', selectedLabels.value)
    emit('labelsChanged', selectedLabels.value)
    searchQuery.value = ''
    showDropdown.value = false
  }
}

function removeLabel(label) {
  selectedLabels.value = selectedLabels.value.filter(l => l !== label)
  emit('update:modelValue', selectedLabels.value)
  emit('labelsChanged', selectedLabels.value)
}

// Close dropdown when clicking outside
function handleClickOutside(event) {
  if (!event.target.closest('.relative')) {
    showDropdown.value = false
  }
}

// Watch for changes from parent
watch(() => props.modelValue, (newValue) => {
  selectedLabels.value = [...newValue]
})

// Add click outside listener
if (typeof window !== 'undefined') {
  document.addEventListener('click', handleClickOutside)
}
</script>
