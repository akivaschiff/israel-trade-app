<template>
  <div class="product-selector border border-gray-300 rounded-lg overflow-hidden bg-white">
    <!-- Search Box -->
    <div class="search-container p-4 bg-white border-b border-gray-200">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="placeholder"
          class="w-full px-4 py-3 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          @input="onSearchInput"
        />
        <div class="absolute right-3 top-3 flex items-center gap-2">
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="text-gray-400 hover:text-gray-600"
            title="Clear search"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Action Bar -->
    <div class="action-bar sticky top-0 z-20 flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
      <div class="text-sm text-gray-600">
        <span v-if="searchQuery && filteredProducts.length > 0">
          {{ filteredProducts.length }} products found
        </span>
        <span v-else-if="selectedProductCodes.size > 0">
          {{ selectedProductCodes.size }} of {{ products.length }} products selected
        </span>
        <span v-else>
          {{ products.length }} products available
        </span>
      </div>
      <div class="flex gap-2">
        <button
          v-if="searchQuery && filteredProducts.length > 0"
          @click="selectAllVisible"
          class="text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          Select All Visible
        </button>
        <button
          v-if="selectedProductCodes.size > 0"
          @click="clearSelection"
          class="text-sm text-gray-600 hover:text-gray-700 font-medium"
        >
          Clear Selection
        </button>
      </div>
    </div>

    <!-- Tree View -->
    <div class="tree-view bg-white" :style="{ maxHeight: maxHeight, overflowY: 'auto' }">
      <div v-if="visibleCategoriesArray.length === 0" class="empty-state flex flex-col items-center justify-center p-8 text-center text-gray-500">
        <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p>No products match your search</p>
      </div>

      <div
        v-for="category in visibleCategoriesArray"
        :key="category.id"
        class="category-group border-b border-gray-200 last:border-b-0"
      >
        <!-- Category Header -->
        <div
          class="category-header sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 cursor-pointer"
          @click="toggleCategory(category.id)"
        >
          <div class="flex items-center gap-2">
            <!-- Expand/Collapse Icon -->
            <svg
              class="w-4 h-4 text-gray-500 transition-transform"
              :class="{ 'rotate-90': expandedCategories.has(category.id) }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
            
            <!-- Category Name & Count -->
            <span class="font-medium text-gray-700">{{ category.name }}</span>
            <span class="text-sm text-gray-500">({{ category.productCount }})</span>
          </div>

          <!-- Trade Value (optional) -->
          <div v-if="showTradeValues && category.tradeValue" class="text-sm text-gray-600">
            {{ formatCurrency(category.tradeValue) }}
          </div>
        </div>

        <!-- Products List -->
        <div v-if="expandedCategories.has(category.id)" class="products-list bg-white">
          <div
            v-for="product in category.products"
            :key="product.code"
            class="product-item flex items-start gap-3 px-4 py-2 pl-12 hover:bg-purple-50 cursor-pointer transition-colors"
            :class="{ 'selected': selectedProductCodes.has(product.code) }"
            @click="toggleProduct(product.code)"
          >
            <input
              type="checkbox"
              :checked="selectedProductCodes.has(product.code)"
              @click.stop
              @change="toggleProduct(product.code)"
              class="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 mt-0.5 flex-shrink-0"
            />
            <div class="flex-1 min-w-0">
              <div class="text-sm text-gray-700">{{ product.description }}</div>
              <div class="text-xs text-gray-400 mt-0.5">{{ product.code }}</div>
            </div>
            <div v-if="showTradeValues && product.tradeValue" class="text-sm text-gray-600 flex-shrink-0">
              {{ formatCurrency(product.tradeValue) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props
const props = defineProps({
  selected: {
    type: Array,
    default: () => []
  },
  categories: {
    type: Array,
    required: true
  },
  products: {
    type: Array,
    required: true
  },
  showTradeValues: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: 'Search products...'
  },
  maxHeight: {
    type: String,
    default: '500px'
  },
  multiSelect: {
    type: Boolean,
    default: true
  },
  collapsedByDefault: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['update:selected', 'selection-change'])

// State
const searchQuery = ref('')
const expandedCategories = ref(new Set())
const selectedProductCodes = ref(new Set(props.selected))

// Watch for external changes to selected prop
watch(() => props.selected, (newValue) => {
  selectedProductCodes.value = new Set(newValue)
}, { deep: true })

// Computed: Filter products based on search
const filteredProducts = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.products
  }

  const query = searchQuery.value.toLowerCase().trim()
  return props.products.filter(product => {
    // Match description
    if (product.description.toLowerCase().includes(query)) return true
    
    // Match tags
    if (product.tags && product.tags.some(tag => tag.toLowerCase().includes(query))) return true
    
    // Match category name
    const category = allCategoriesWithOther.value.find(c => c.id === (product.category || 'other'))
    if (category && category.name.toLowerCase().includes(query)) return true
    
    return false
  })
})

// Computed: Categories with "Other" added if needed
const allCategoriesWithOther = computed(() => {
  const cats = [...props.categories]
  
  // Check if any products have no category or null category
  const hasUncategorized = props.products.some(p => !p.category || p.category === '')
  
  if (hasUncategorized) {
    cats.push({
      id: 'other',
      name: 'Other',
      tradeValue: undefined
    })
  }
  
  return cats
})

// Computed: Group filtered products by category
const productsByCategory = computed(() => {
  const grouped = new Map()
  
  filteredProducts.value.forEach(product => {
    const catId = product.category || 'other'
    if (!grouped.has(catId)) {
      grouped.set(catId, [])
    }
    grouped.get(catId).push(product)
  })
  
  return grouped
})

// Computed: Visible categories (have at least one filtered product)
const visibleCategoriesArray = computed(() => {
  const visible = []
  
  allCategoriesWithOther.value.forEach(category => {
    const products = productsByCategory.value.get(category.id) || []
    if (products.length > 0) {
      visible.push({
        ...category,
        products: products,
        productCount: products.length
      })
    }
  })
  
  return visible
})

// Auto-expand categories when searching
watch(searchQuery, (newQuery) => {
  if (newQuery.trim()) {
    // Expand all visible categories
    visibleCategoriesArray.value.forEach(cat => {
      expandedCategories.value.add(cat.id)
    })
  } else if (!props.collapsedByDefault) {
    // If not collapsed by default, keep expanded
    // Otherwise, collapse is handled by user interaction
  }
})

// Methods
function onSearchInput() {
  // Handled by watcher
}

function clearSearch() {
  searchQuery.value = ''
}

function toggleCategory(categoryId) {
  if (expandedCategories.value.has(categoryId)) {
    expandedCategories.value.delete(categoryId)
  } else {
    expandedCategories.value.add(categoryId)
  }
}

function toggleProduct(productCode) {
  const newSelection = new Set(selectedProductCodes.value)
  
  if (newSelection.has(productCode)) {
    newSelection.delete(productCode)
  } else {
    if (!props.multiSelect) {
      newSelection.clear()
    }
    newSelection.add(productCode)
  }
  
  selectedProductCodes.value = newSelection
  emitSelectionChange(newSelection)
}

function selectAllVisible() {
  const newSelection = new Set(selectedProductCodes.value)
  const added = []
  
  filteredProducts.value.forEach(product => {
    if (!newSelection.has(product.code)) {
      newSelection.add(product.code)
      added.push(product.code)
    }
  })
  
  selectedProductCodes.value = newSelection
  emitSelectionChange(newSelection, added, [])
}

function clearSelection() {
  const removed = Array.from(selectedProductCodes.value)
  selectedProductCodes.value = new Set()
  emitSelectionChange(new Set(), [], removed)
}

function emitSelectionChange(newSelection, added = [], removed = []) {
  const selectedArray = Array.from(newSelection)
  emit('update:selected', selectedArray)
  
  // Calculate total value if available
  let totalValue = 0
  if (props.showTradeValues) {
    selectedArray.forEach(code => {
      const product = props.products.find(p => p.code === code)
      if (product && product.tradeValue) {
        totalValue += product.tradeValue
      }
    })
  }
  
  emit('selection-change', {
    selected: selectedArray,
    added: added,
    removed: removed,
    totalCount: selectedArray.length,
    totalValue: totalValue
  })
}

function formatCurrency(value) {
  if (!value) return '$0'
  
  const millions = value / 1000000
  if (millions >= 1) {
    return `$${millions.toFixed(1)}M`
  }
  
  const thousands = value / 1000
  if (thousands >= 1) {
    return `$${thousands.toFixed(0)}K`
  }
  
  return `$${value.toFixed(0)}`
}

// Exposed methods
function getSelectedProducts() {
  return props.products.filter(p => selectedProductCodes.value.has(p.code))
}

function selectAll() {
  const newSelection = new Set(props.products.map(p => p.code))
  selectedProductCodes.value = newSelection
  emitSelectionChange(newSelection)
}

function deselectAll() {
  clearSelection()
}

function expandAll() {
  expandedCategories.value = new Set(allCategoriesWithOther.value.map(c => c.id))
}

function collapseAll() {
  expandedCategories.value = new Set()
}

defineExpose({
  clearSelection,
  selectAll,
  deselectAll,
  expandAll,
  collapseAll,
  getSelectedProducts
})
</script>

<style scoped>
/* Minimal scoped styles - using inline Tailwind classes instead */
.product-item.selected {
  background-color: #faf5ff;
}
</style>
