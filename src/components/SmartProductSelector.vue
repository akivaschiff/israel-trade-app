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

    <!-- Search Results -->
    <div v-if="displayItems.length > 0" class="border border-gray-300 rounded-lg overflow-hidden">
      <div class="bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700 border-b border-gray-300 flex items-center justify-between">
        <span>Search Results ({{ totalProductCount }} {{ totalProductCount === 1 ? 'product' : 'products' }})</span>
        <button
          v-if="displayItems.length > 0"
          @click="selectAllResults"
          class="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
        >
          {{ allResultsSelected ? 'Deselect All' : 'Select All' }}
        </button>
      </div>
      <div class="max-h-96 overflow-y-auto">
        <!-- Render display items recursively -->
        <template v-for="item in displayItems" :key="item.key">
          <HierarchyItem
            :item="item"
            :modelValue="modelValue"
            :expandedItems="expandedItems"
            :searchTerm="searchTerm"
            @toggle-expand="toggleExpand"
            @toggle-selection="toggleSelection"
          />
        </template>
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
        <div class="flex items-center gap-2">
          <button
            v-if="modelValue.size > 5"
            @click="selectedProductsExpanded = !selectedProductsExpanded"
            class="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
          >
            <span>{{ selectedProductsExpanded ? 'Show Less' : 'Show All' }}</span>
            <svg
              class="w-3 h-3 transition-transform"
              :class="{ 'rotate-180': selectedProductsExpanded }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            @click="clearAll"
            class="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Clear All
          </button>
        </div>
      </div>
      <div
        class="space-y-1.5 overflow-y-auto transition-all duration-300"
        :class="{ 'max-h-[220px]': !selectedProductsExpanded && modelValue.size > 5 }"
      >
        <div
          v-for="code in Array.from(modelValue)"
          :key="code"
          class="flex items-center gap-2 bg-white px-3 py-2 rounded-md text-sm border border-indigo-200 hover:border-indigo-300 transition-colors"
        >
          <div class="flex-1 min-w-0 flex items-center gap-2">
            <span class="text-sm text-gray-800 truncate">{{ getProductName(code) }}</span>
            <span class="text-xs text-gray-400 font-mono flex-shrink-0">[{{ code }}]</span>
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
import HierarchyItem from './HierarchyItem.vue'

const props = defineProps({
  modelValue: {
    type: Set,
    default: () => new Set()
  },
  onSearch: {
    type: Function,
    required: true
  },
  categoriesData: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const searchTerm = ref('')
const rawSearchResults = ref([])
const searching = ref(false)
const expandedItems = ref(new Set())
const selectedProductsExpanded = ref(false)

let searchTimeout = null

// Thresholds for smart flattening
const FLAT_THRESHOLD = 12 // If total products <= this, show completely flat
const SECTION_FLAT_THRESHOLD = 4 // If a section has <= this many products, flatten it

// Handle search input with debounce
async function onSearchInput() {
  clearTimeout(searchTimeout)
  
  if (searchTerm.value.length < 2) {
    rawSearchResults.value = []
    return
  }
  
  searching.value = true
  searchTimeout = setTimeout(async () => {
    const results = await props.onSearch(searchTerm.value)
    rawSearchResults.value = results
    searching.value = false
  }, 300)
}

// Build hierarchy from flat results
function buildHierarchy(products) {
  if (!products || products.length === 0) return []
  
  if (!props.categoriesData || props.categoriesData.length === 0) {
    // If no categories data, return flat list
    return products.map(p => {
      const code = p.code || p.hs_code
      const chapter = p.chapter || p.hs_chapter
      return {
        type: 'product',
        code: code,
        description: p.desc || p.description || 'No description',
        chapter: chapter,
        chapter_name: p.chapter_name || (chapter ? `Chapter ${chapter}` : ''),
        key: `product:${code}`
      }
    }).filter(p => p.code) // Only filter out products without a code
  }

  const categoryMap = new Map()
  
  for (const product of products) {
    const productCode = product.code || product.hs_code
    const categoryName = product.cat || product.category || 'Other'
    const chapterCode = product.chapter || product.hs_chapter
    const headingCode = product.heading || product.hs_heading
    
    // Skip products without at least a product code
    if (!productCode) continue
    
    // Initialize category
    if (!categoryMap.has(categoryName)) {
      const categoryInfo = props.categoriesData.find(c => c.name === categoryName)
      categoryMap.set(categoryName, {
        type: 'category',
        name: categoryName,
        display_name: categoryName,
        key: `category:${categoryName}`,
        chapters: new Map()
      })
    }
    
    const category = categoryMap.get(categoryName)
    
    // If no chapter code, add product directly to category (shouldn't happen but handle it)
    if (!chapterCode) {
      if (!category.directProducts) category.directProducts = []
      category.directProducts.push({
        type: 'product',
        code: productCode,
        description: product.desc || product.description || 'No description',
        chapter: '',
        chapter_name: '',
        key: `product:${productCode}`
      })
      continue
    }
    
    // Initialize chapter
    if (!category.chapters.has(chapterCode)) {
      const categoryInfo = props.categoriesData.find(c => c.name === categoryName)
      const chapterInfo = categoryInfo?.chapters.find(ch => ch.code === chapterCode)
      
      category.chapters.set(chapterCode, {
        type: 'chapter',
        code: chapterCode,
        name: chapterInfo?.name || `Chapter ${chapterCode}`,
        display_name: `${chapterInfo?.name || 'Chapter ' + chapterCode} (Ch ${chapterCode})`,
        key: `chapter:${chapterCode}`,
        headings: new Map()
      })
    }
    
    const chapter = category.chapters.get(chapterCode)
    
    // Initialize heading
    if (headingCode) {
      if (!chapter.headings.has(headingCode)) {
        const headingName = (product.desc || product.description).split(';')[0].trim()

        chapter.headings.set(headingCode, {
          type: 'heading',
          code: headingCode,
          name: headingName,
          display_name: `${headingName} (${headingCode})`,
          key: `heading:${headingCode}`,
          products: []
        })
      }

      const heading = chapter.headings.get(headingCode)
      heading.products.push({
        type: 'product',
        code: productCode,
        description: product.desc || product.description,
        chapter: chapterCode,
        chapter_name: product.chapter_name || chapter.name || `Chapter ${chapterCode}`,
        key: `product:${productCode}`
      })
    } else {
      // Product without heading - add directly to chapter
      if (!chapter.products) chapter.products = []
      chapter.products.push({
        type: 'product',
        code: productCode,
        description: product.desc || product.description,
        chapter: chapterCode,
        chapter_name: product.chapter_name || chapter.name || `Chapter ${chapterCode}`,
        key: `product:${productCode}`
      })
    }
  }
  
  // Convert to arrays
  const result = []
  for (const category of categoryMap.values()) {
    const chapters = []
    for (const chapter of category.chapters.values()) {
      const headings = []
      for (const heading of chapter.headings.values()) {
        headings.push(heading)
      }
      chapter.headings = headings
      chapters.push(chapter)
    }
    category.chapters = chapters
    result.push(category)
  }
  
  return result
}

// Count total products in hierarchy
function countProducts(hierarchy) {
  let count = 0
  
  for (const category of hierarchy) {
    if (category.type === 'product') {
      count++
      continue
    }
    
    for (const chapter of category.chapters || []) {
      if (chapter.products) {
        count += chapter.products.length
      }
      for (const heading of chapter.headings || []) {
        count += heading.products?.length || 0
      }
    }
  }
  
  return count
}

// Smart flattening logic
function smartFlatten(hierarchy) {
  const totalProducts = countProducts(hierarchy)
  
  // Case 1: Very few products total - show completely flat
  if (totalProducts <= FLAT_THRESHOLD) {
    const flatList = []
    for (const category of hierarchy) {
      if (category.type === 'product') {
        flatList.push(category)
        continue
      }
      for (const chapter of category.chapters || []) {
        if (chapter.products) {
          flatList.push(...chapter.products)
        }
        for (const heading of chapter.headings || []) {
          flatList.push(...(heading.products || []))
        }
      }
    }
    return flatList
  }
  
  // Case 2: Many products - use smart partial flattening
  const result = []
  
  for (const category of hierarchy) {
    if (category.type === 'product') {
      result.push(category)
      continue
    }
    
    const categoryProductCount = countProducts([category])
    
    // If this entire category has few products, flatten it
    if (categoryProductCount <= SECTION_FLAT_THRESHOLD) {
      for (const chapter of category.chapters || []) {
        if (chapter.products) {
          result.push(...chapter.products)
        }
        for (const heading of chapter.headings || []) {
          result.push(...(heading.products || []))
        }
      }
      continue
    }
    
    // Category stays hierarchical, but check chapters
    const processedCategory = {
      ...category,
      chapters: []
    }
    
    for (const chapter of category.chapters || []) {
      const chapterProductCount = (chapter.products?.length || 0) + 
        (chapter.headings || []).reduce((sum, h) => sum + (h.products?.length || 0), 0)
      
      // If chapter has few products, flatten its contents
      if (chapterProductCount <= SECTION_FLAT_THRESHOLD) {
        const flatProducts = []
        if (chapter.products) {
          flatProducts.push(...chapter.products)
        }
        for (const heading of chapter.headings || []) {
          flatProducts.push(...(heading.products || []))
        }
        
        // Add as a simplified chapter with flat product list
        processedCategory.chapters.push({
          ...chapter,
          headings: [],
          products: flatProducts,
          flattened: true
        })
      } else {
        // Keep chapter hierarchical, but check if headings should be flattened
        const processedChapter = {
          ...chapter,
          headings: []
        }
        
        for (const heading of chapter.headings || []) {
          // Keep headings as-is since chapter needs hierarchy
          processedChapter.headings.push(heading)
        }
        
        processedCategory.chapters.push(processedChapter)
      }
    }
    
    result.push(processedCategory)
  }
  
  return result
}

// Computed property for display items
const displayItems = computed(() => {
  if (rawSearchResults.value.length === 0) return []
  
  const hierarchy = buildHierarchy(rawSearchResults.value)
  return smartFlatten(hierarchy)
})

// Count total products
const totalProductCount = computed(() => {
  return countProducts(displayItems.value)
})

// Check if all results are selected
const allResultsSelected = computed(() => {
  return totalProductCount.value > 0 && getAllProducts(displayItems.value).every(p => props.modelValue.has(p.code))
})

// Get all products from display items
function getAllProducts(items) {
  const products = []
  
  for (const item of items) {
    if (item.type === 'product') {
      products.push(item)
    } else if (item.type === 'category') {
      for (const chapter of item.chapters || []) {
        if (chapter.products) {
          products.push(...chapter.products)
        }
        for (const heading of chapter.headings || []) {
          products.push(...(heading.products || []))
        }
      }
    } else if (item.type === 'chapter') {
      if (item.products) {
        products.push(...item.products)
      }
      for (const heading of item.headings || []) {
        products.push(...(heading.products || []))
      }
    } else if (item.type === 'heading') {
      products.push(...(item.products || []))
    }
  }
  
  return products
}

// Select/deselect all results
function selectAllResults() {
  const newSet = new Set(props.modelValue)
  const allProducts = getAllProducts(displayItems.value)
  const action = allResultsSelected.value ? 'delete' : 'add'
  
  allProducts.forEach(product => newSet[action](product.code))
  emitUpdate(newSet)
}

// Toggle expansion
function toggleExpand(key) {
  if (expandedItems.value.has(key)) {
    expandedItems.value.delete(key)
  } else {
    expandedItems.value.add(key)
  }
}

// Toggle selection
function toggleSelection(item) {
  const newSet = new Set(props.modelValue)
  
  if (item.type === 'product') {
    if (newSet.has(item.code)) {
      newSet.delete(item.code)
    } else {
      newSet.add(item.code)
    }
  } else {
    // Get all products under this item
    const products = getAllProducts([item])
    const allSelected = products.every(p => newSet.has(p.code))
    
    products.forEach(product => {
      if (allSelected) {
        newSet.delete(product.code)
      } else {
        newSet.add(product.code)
      }
    })
  }
  
  emitUpdate(newSet)
}

// Helper to emit new set
function emitUpdate(newSet) {
  emit('update:modelValue', newSet)
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
  const allProducts = getAllProducts(displayItems.value)
  const product = allProducts.find(p => p.code === code)
  return product?.description || code
}
</script>
