<template>
  <div class="space-y-4">
    <!-- Search Box -->
    <div>
      <label class="block text-sm font-semibold text-gray-700 mb-2">
        Search Products
      </label>
      <input
        v-model="searchTerm"
        @input="onSearchInput"
        type="text"
        placeholder="Search by product name, category, or HS code..."
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />
      <p class="text-xs text-gray-500 mt-1">
        Type at least 2 characters to search
      </p>
    </div>

    <!-- Search Results - Hierarchical -->
    <div v-if="searchResults.length > 0" class="border border-gray-300 rounded-lg overflow-hidden">
      <div class="bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700 border-b border-gray-300">
        Search Results
      </div>
      <div class="max-h-96 overflow-y-auto">
        <!-- Category Level -->
        <div
          v-for="category in searchResults"
          :key="category.name"
          class="border-b border-gray-100 last:border-b-0"
        >
          <div
            class="flex items-center gap-2 p-3 hover:bg-gray-50 cursor-pointer"
            @click="toggleExpand('category', category.name)"
          >
            <svg
              :class="['w-4 h-4 transition-transform flex-shrink-0', isExpanded('category', category.name) ? 'rotate-90' : '']"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
            <input
              type="checkbox"
              :checked="isCategorySelected(category)"
              @click.stop
              @change="toggleCategory(category)"
              class="rounded"
            />
            <span class="font-semibold text-indigo-900 flex-1">{{ category.display_name }}</span>
            <span class="text-xs text-gray-500">{{ category.chapters.length }} chapters</span>
          </div>

          <!-- Chapter Level -->
          <div v-show="isExpanded('category', category.name)" class="bg-white">
            <div
              v-for="chapter in category.chapters"
              :key="chapter.code"
              class="border-t border-gray-100"
            >
              <div
                class="flex items-center gap-2 p-3 pl-10 hover:bg-gray-50 cursor-pointer"
                @click="toggleExpand('chapter', chapter.code)"
              >
                <svg
                  :class="['w-3 h-3 transition-transform flex-shrink-0', isExpanded('chapter', chapter.code) ? 'rotate-90' : '']"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
                <input
                  type="checkbox"
                  :checked="isChapterSelected(chapter)"
                  @click.stop
                  @change="toggleChapter(chapter)"
                  class="rounded"
                />
                <span class="font-medium text-purple-900 text-sm flex-1">{{ chapter.display_name }}</span>
                <span class="text-xs text-gray-500">{{ chapter.headings.length }} headings</span>
              </div>

              <!-- Heading Level -->
              <div v-show="isExpanded('chapter', chapter.code)" class="bg-gray-50">
                <div
                  v-for="heading in chapter.headings"
                  :key="heading.code"
                  class="border-t border-gray-200"
                >
                  <div
                    class="flex items-center gap-2 p-3 pl-16 hover:bg-gray-100 cursor-pointer"
                    @click="toggleExpand('heading', heading.code)"
                  >
                    <svg
                      :class="['w-3 h-3 transition-transform flex-shrink-0', isExpanded('heading', heading.code) ? 'rotate-90' : '']"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                    <input
                      type="checkbox"
                      :checked="isHeadingSelected(heading)"
                      @click.stop
                      @change="toggleHeading(heading)"
                      class="rounded"
                    />
                    <span class="text-gray-800 text-sm flex-1 truncate">{{ heading.display_name }}</span>
                    <span class="text-xs text-gray-500">{{ heading.products.length }} products</span>
                  </div>

                  <!-- Product Level -->
                  <div v-show="isExpanded('heading', heading.code)" class="bg-white">
                    <label
                      v-for="product in heading.products"
                      :key="product.code"
                      class="flex items-center gap-2 p-2 pl-24 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        :checked="modelValue.has(product.code)"
                        @change="toggleProduct(product)"
                        class="rounded"
                      />
                      <div class="flex-1 min-w-0">
                        <div class="font-mono text-xs text-gray-500">{{ product.code }}</div>
                        <div class="text-xs text-gray-700 truncate">{{ product.description }}</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
          Selected Products ({{ modelValue.size }})
        </h3>
        <button
          @click="clearAll"
          class="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Clear All
        </button>
      </div>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="code in Array.from(modelValue)"
          :key="code"
          class="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-md text-sm border border-indigo-200"
        >
          <span class="font-mono text-xs text-gray-700">{{ code }}</span>
          <button
            @click="removeProduct(code)"
            class="text-gray-400 hover:text-gray-600"
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
import { ref } from 'vue'

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
const expandedItems = ref(new Set())

let searchTimeout = null

// Handle search input with debounce
function onSearchInput() {
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

// Toggle expansion
function toggleExpand(type, id) {
  const key = `${type}:${id}`
  if (expandedItems.value.has(key)) {
    expandedItems.value.delete(key)
  } else {
    expandedItems.value.add(key)
  }
}

function isExpanded(type, id) {
  return expandedItems.value.has(`${type}:${id}`)
}

// Selection helpers - work directly with modelValue
function isCategorySelected(category) {
  return category.chapters.every(chapter => 
    chapter.headings.every(heading =>
      heading.products.every(product => props.modelValue.has(product.code))
    )
  )
}

function isChapterSelected(chapter) {
  return chapter.headings.every(heading =>
    heading.products.every(product => props.modelValue.has(product.code))
  )
}

function isHeadingSelected(heading) {
  return heading.products.every(product => props.modelValue.has(product.code))
}

// Helper to emit new set
function emitUpdate(newSet) {
  emit('update:modelValue', newSet)
}

// Toggle selections
function toggleCategory(category) {
  const newSet = new Set(props.modelValue)
  const allSelected = isCategorySelected(category)
  
  category.chapters.forEach(chapter => {
    chapter.headings.forEach(heading => {
      heading.products.forEach(product => {
        if (allSelected) {
          newSet.delete(product.code)
        } else {
          newSet.add(product.code)
        }
      })
    })
  })
  
  emitUpdate(newSet)
}

function toggleChapter(chapter) {
  const newSet = new Set(props.modelValue)
  const allSelected = isChapterSelected(chapter)
  
  chapter.headings.forEach(heading => {
    heading.products.forEach(product => {
      if (allSelected) {
        newSet.delete(product.code)
      } else {
        newSet.add(product.code)
      }
    })
  })
  
  emitUpdate(newSet)
}

function toggleHeading(heading) {
  const newSet = new Set(props.modelValue)
  const allSelected = isHeadingSelected(heading)
  
  heading.products.forEach(product => {
    if (allSelected) {
      newSet.delete(product.code)
    } else {
      newSet.add(product.code)
    }
  })
  
  emitUpdate(newSet)
}

function toggleProduct(product) {
  const newSet = new Set(props.modelValue)
  if (newSet.has(product.code)) {
    newSet.delete(product.code)
  } else {
    newSet.add(product.code)
  }
  emitUpdate(newSet)
}

function removeProduct(code) {
  const newSet = new Set(props.modelValue)
  newSet.delete(code)
  emitUpdate(newSet)
}

function clearAll() {
  emitUpdate(new Set())
}
</script>
