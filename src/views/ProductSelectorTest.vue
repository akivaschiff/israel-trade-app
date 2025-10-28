<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <h1 class="text-3xl font-bold mb-6 text-gray-800">Product Selector Test</h1>
    
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      <span class="ml-4 text-gray-600">Loading products and categories...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <p class="text-red-800 font-medium">Error loading data:</p>
      <p class="text-red-600 text-sm mt-1">{{ error }}</p>
    </div>

    <!-- Main Content -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Left: Product Selector -->
      <div>
        <h2 class="text-xl font-semibold mb-4 text-gray-700">Select Products</h2>
        <ProductSelector
          ref="selectorRef"
          v-model:selected="selectedProducts"
          :categories="categories"
          :products="products"
          :show-trade-values="showTradeValues"
          placeholder="Search by product name, category, or tags..."
          @selection-change="handleSelectionChange"
        />

        <!-- Controls -->
        <div class="mt-4 flex flex-wrap gap-2">
          <button
            @click="toggleTradeValues"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {{ showTradeValues ? 'Hide' : 'Show' }} Trade Values
          </button>
          <button
            @click="expandAll"
            class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Expand All
          </button>
          <button
            @click="collapseAll"
            class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      <!-- Right: Selection Info -->
      <div>
        <h2 class="text-xl font-semibold mb-4 text-gray-700">Selection Details</h2>
        
        <!-- Summary Cards -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
            <div class="text-sm text-purple-600 font-medium">Selected Products</div>
            <div class="text-3xl font-bold text-purple-900 mt-1">{{ selectedProducts.length }}</div>
          </div>
          <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
            <div class="text-sm text-blue-600 font-medium">Total Trade Value</div>
            <div class="text-3xl font-bold text-blue-900 mt-1">{{ formatCurrency(totalTradeValue) }}</div>
          </div>
        </div>

        <!-- Recent Change Info -->
        <div v-if="lastChange" class="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
          <h3 class="font-medium text-gray-700 mb-2">Last Change:</h3>
          <div class="text-sm text-gray-600 space-y-1">
            <p v-if="lastChange.added.length > 0">
              ✅ Added: {{ lastChange.added.length }} products
            </p>
            <p v-if="lastChange.removed.length > 0">
              ❌ Removed: {{ lastChange.removed.length }} products
            </p>
            <p>📊 Total: {{ lastChange.totalCount }} products</p>
            <p>💰 Value: {{ formatCurrency(lastChange.totalValue) }}</p>
          </div>
        </div>

        <!-- Selected Products List -->
        <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 class="font-medium text-gray-700">Selected Products ({{ selectedProducts.length }})</h3>
          </div>
          <div class="max-h-96 overflow-y-auto">
            <div v-if="selectedProducts.length === 0" class="px-4 py-8 text-center text-gray-500">
              No products selected
            </div>
            <div
              v-for="product in selectedProductDetails"
              :key="product.code"
              class="px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
            >
              <div class="font-medium text-sm text-gray-800">{{ product.description }}</div>
              <div class="flex items-center justify-between mt-1">
                <span class="text-xs text-gray-500">{{ product.code }}</span>
                <span class="text-xs text-gray-600 font-medium">{{ product.category }}</span>
              </div>
              <div v-if="product.tradeValue" class="text-xs text-purple-600 mt-1">
                {{ formatCurrency(product.tradeValue) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Debug Info (collapsible) -->
    <details class="mt-8 bg-gray-50 rounded-lg p-4 border border-gray-200">
      <summary class="cursor-pointer font-medium text-gray-700">Debug Info</summary>
      <div class="mt-4 space-y-2 text-sm text-gray-600">
        <p><strong>Total Categories:</strong> {{ categories.length }}</p>
        <p><strong>Total Products:</strong> {{ products.length }}</p>
        <p><strong>Products with Trade Values:</strong> {{ productsWithValues }}</p>
        <p><strong>Products with Tags:</strong> {{ productsWithTags }}</p>
        <p><strong>Selected Product Codes:</strong></p>
        <pre class="bg-white p-2 rounded border border-gray-200 overflow-x-auto">{{ JSON.stringify(selectedProducts, null, 2) }}</pre>
      </div>
    </details>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import ProductSelector from '@/components/trade/ProductSelector.vue'

// State
const loading = ref(true)
const error = ref(null)
const categories = ref([])
const products = ref([])
const selectedProducts = ref([])
const showTradeValues = ref(false)
const lastChange = ref(null)
const selectorRef = ref(null)

// Computed
const selectedProductDetails = computed(() => {
  return products.value.filter(p => selectedProducts.value.includes(p.code))
})

const totalTradeValue = computed(() => {
  return selectedProductDetails.value.reduce((sum, p) => sum + (p.tradeValue || 0), 0)
})

const productsWithValues = computed(() => {
  return products.value.filter(p => p.tradeValue && p.tradeValue > 0).length
})

const productsWithTags = computed(() => {
  return products.value.filter(p => p.tags && p.tags.length > 0).length
})

// Methods
function formatCurrency(value) {
  if (!value) return '$0'
  
  const millions = value / 1000000
  if (millions >= 1) {
    return `$${millions.toFixed(2)}M`
  }
  
  const thousands = value / 1000
  if (thousands >= 1) {
    return `$${thousands.toFixed(1)}K`
  }
  
  return `$${value.toFixed(0)}`
}

function handleSelectionChange(changeDetails) {
  lastChange.value = changeDetails
  console.log('Selection changed:', changeDetails)
}

function toggleTradeValues() {
  showTradeValues.value = !showTradeValues.value
}

function expandAll() {
  selectorRef.value?.expandAll()
}

function collapseAll() {
  selectorRef.value?.collapseAll()
}

// Load data from Supabase
async function loadData() {
  try {
    loading.value = true
    error.value = null

    // Load categories - get unique categories from products with trade data
    const { data: categoryData, error: categoryError } = await supabase
      .from('trade_with_products')
      .select('product_category')
      .not('product_category', 'is', null)
      .order('product_category')

    if (categoryError) throw categoryError

    // Get unique categories and calculate trade values
    const categoryMap = new Map()
    
    const { data: tradeData, error: tradeError } = await supabase
      .from('trade_with_products')
      .select('product_category, value')
      .not('product_category', 'is', null)

    if (tradeError) throw tradeError

    tradeData.forEach(row => {
      if (!categoryMap.has(row.product_category)) {
        categoryMap.set(row.product_category, 0)
      }
      categoryMap.set(row.product_category, categoryMap.get(row.product_category) + (row.value || 0))
    })

    categories.value = Array.from(categoryMap.entries()).map(([name, value]) => ({
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: name,
      tradeValue: value
    })).sort((a, b) => b.tradeValue - a.tradeValue)

    console.log('Loaded categories:', categories.value.length)

    // Load products - get all products that appear in trade data with their descriptions and tags
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('hs_code, description, category, search_labels')
      .not('description', 'is', null)
      .limit(1000) // Limit for testing to avoid overwhelming the UI

    if (productError) throw productError

    // Calculate trade values for each product
    const { data: productTradeData, error: productTradeError } = await supabase
      .from('trade_data')
      .select('product_code, value')

    if (productTradeError) throw productTradeError

    const productValueMap = new Map()
    productTradeData.forEach(row => {
      if (!productValueMap.has(row.product_code)) {
        productValueMap.set(row.product_code, 0)
      }
      productValueMap.set(row.product_code, productValueMap.get(row.product_code) + (row.value || 0))
    })

    products.value = productData.map(p => ({
      code: p.hs_code,
      description: p.description,
      category: p.category ? p.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') : null,
      tags: p.search_labels || [],
      tradeValue: productValueMap.get(p.hs_code) || 0
    }))

    console.log('Loaded products:', products.value.length)
    console.log('Products with tags:', productsWithTags.value)
    console.log('Products with trade values:', productsWithValues.value)

  } catch (e) {
    console.error('Error loading data:', e)
    error.value = e.message
  } finally {
    loading.value = false
  }
}

// Load data on mount
onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* Add any custom styles here */
</style>
