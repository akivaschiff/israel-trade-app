<template>
  <div class="border border-gray-300 rounded-lg overflow-hidden" style="height: 400px;">
    <div class="h-full overflow-y-auto">
      <div v-for="category in categoriesWithProducts" :key="category.name" class="border-b border-gray-200 last:border-b-0">
        <!-- Category Header -->
        <div 
          class="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer"
          @click="toggleCategory(category.name)"
        >
          <div class="flex items-center gap-2">
            <svg 
              class="w-4 h-4 text-gray-500 transition-transform"
              :class="{ 'rotate-90': expandedCategories.has(category.name) }"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
            <input
              type="checkbox"
              :checked="isCategorySelected(category.name)"
              :indeterminate.prop="isCategoryIndeterminate(category.name)"
              @click.stop
              @change="toggleCategorySelection(category.name)"
              class="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <span class="font-medium text-gray-700">{{ category.name }}</span>
            <span class="text-xs text-gray-500">({{ category.products.length }})</span>
          </div>
        </div>

        <!-- Products List (Expandable) -->
        <div 
          v-if="expandedCategories.has(category.name)"
          class="bg-white"
        >
          <div 
            v-for="product in category.products" 
            :key="product.code"
            class="flex items-start gap-2 p-2 pl-10 hover:bg-purple-50 cursor-pointer"
            @click="toggleProduct(product.code)"
          >
            <input
              type="checkbox"
              :checked="selectedProducts.includes(product.code)"
              @click.stop
              @change="toggleProduct(product.code)"
              class="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 mt-0.5 flex-shrink-0"
            />
            <span class="text-sm text-gray-600">{{ product.description }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  products: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue'])

const expandedCategories = ref(new Set())
const selectedProducts = ref([...props.modelValue])

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  selectedProducts.value = [...newValue]
})

// Group products by category
const categoriesWithProducts = computed(() => {
  const categoryMap = new Map()
  
  props.products.forEach(product => {
    const category = product.category || 'Uncategorized'
    if (!categoryMap.has(category)) {
      categoryMap.set(category, [])
    }
    categoryMap.get(category).push(product)
  })
  
  return Array.from(categoryMap.entries()).map(([name, products]) => ({
    name,
    products: products.sort((a, b) => a.description.localeCompare(b.description)),
  }))
})

function toggleCategory(categoryName) {
  if (expandedCategories.value.has(categoryName)) {
    expandedCategories.value.delete(categoryName)
  } else {
    expandedCategories.value.add(categoryName)
  }
}

function isCategorySelected(categoryName) {
  const category = categoriesWithProducts.value.find(c => c.name === categoryName)
  if (!category) return false
  return category.products.every(p => selectedProducts.value.includes(p.code))
}

function isCategoryIndeterminate(categoryName) {
  const category = categoriesWithProducts.value.find(c => c.name === categoryName)
  if (!category) return false
  const selectedCount = category.products.filter(p => selectedProducts.value.includes(p.code)).length
  return selectedCount > 0 && selectedCount < category.products.length
}

function toggleCategorySelection(categoryName) {
  const category = categoriesWithProducts.value.find(c => c.name === categoryName)
  if (!category) return
  
  const allSelected = isCategorySelected(categoryName)
  
  if (allSelected) {
    // Deselect all products in category
    selectedProducts.value = selectedProducts.value.filter(
      code => !category.products.some(p => p.code === code)
    )
  } else {
    // Select all products in category
    const categoryProductCodes = category.products.map(p => p.code)
    selectedProducts.value = [
      ...selectedProducts.value.filter(code => !categoryProductCodes.includes(code)),
      ...categoryProductCodes,
    ]
  }
  
  emit('update:modelValue', selectedProducts.value)
}

function toggleProduct(productCode) {
  if (selectedProducts.value.includes(productCode)) {
    selectedProducts.value = selectedProducts.value.filter(code => code !== productCode)
  } else {
    selectedProducts.value = [...selectedProducts.value, productCode]
  }
  
  emit('update:modelValue', selectedProducts.value)
}
</script>
