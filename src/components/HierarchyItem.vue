<template>
  <!-- Product Item (leaf node) -->
  <label
    v-if="item.type === 'product'"
    class="flex items-center gap-3 p-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 group"
    :class="depth > 0 ? `pl-${Math.min(depth * 4 + 3, 24)}` : ''"
  >
    <input
      type="checkbox"
      :checked="modelValue.has(item.code)"
      @change="$emit('toggle-selection', item)"
      class="rounded flex-shrink-0"
    />
    <div class="flex-1 min-w-0 flex items-center gap-2">
      <span class="text-sm text-gray-800 truncate" v-html="highlightedDescription"></span>
      <span class="text-xs text-gray-400 font-mono flex-shrink-0">[{{ item.code }}]</span>
    </div>
  </label>

  <!-- Category Item (expandable) -->
  <div
    v-else-if="item.type === 'category'"
    class="border-b border-gray-100 last:border-b-0"
  >
    <div
      class="flex items-center gap-2 p-3 hover:bg-gray-50 cursor-pointer"
      @click="$emit('toggle-expand', item.key)"
    >
      <svg
        :class="['w-4 h-4 transition-transform flex-shrink-0', isExpanded ? 'rotate-90' : '']"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <input
        type="checkbox"
        :checked="isSelected"
        @click.stop
        @change="$emit('toggle-selection', item)"
        class="rounded"
      />
      <span class="font-semibold text-indigo-900 flex-1">{{ item.display_name }}</span>
      <span class="text-xs text-gray-500">{{ item.chapters.length }} chapters</span>
    </div>

    <!-- Child chapters -->
    <div v-show="isExpanded" class="bg-white">
      <HierarchyItem
        v-for="chapter in item.chapters"
        :key="chapter.key"
        :item="chapter"
        :modelValue="modelValue"
        :expandedItems="expandedItems"
        :depth="depth + 1"
        :searchTerm="searchTerm"
        @toggle-expand="$emit('toggle-expand', $event)"
        @toggle-selection="$emit('toggle-selection', $event)"
      />
    </div>
  </div>

  <!-- Chapter Item (expandable or flat) -->
  <div
    v-else-if="item.type === 'chapter'"
    class="border-t border-gray-100"
    :class="depth > 0 ? 'ml-7' : ''"
  >
    <div
      class="flex items-center gap-2 p-3 hover:bg-gray-50 cursor-pointer"
      :class="depth > 0 ? 'pl-3' : 'pl-10'"
      @click="hasExpandableContent ? $emit('toggle-expand', item.key) : null"
    >
      <svg
        v-if="hasExpandableContent"
        :class="['w-3 h-3 transition-transform flex-shrink-0', isExpanded ? 'rotate-90' : '']"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <div v-else class="w-3 h-3 flex-shrink-0"></div>
      <input
        type="checkbox"
        :checked="isSelected"
        @click.stop
        @change="$emit('toggle-selection', item)"
        class="rounded"
      />
      <span class="font-medium text-purple-900 text-sm flex-1">{{ item.display_name }}</span>
      <span class="text-xs text-gray-500">{{ productCount }} products</span>
    </div>

    <!-- If chapter is flattened, show products directly -->
    <div v-if="item.flattened && isExpanded" class="bg-gray-50">
      <HierarchyItem
        v-for="product in item.products"
        :key="product.key"
        :item="product"
        :modelValue="modelValue"
        :expandedItems="expandedItems"
        :depth="depth + 1"
        :searchTerm="searchTerm"
        @toggle-expand="$emit('toggle-expand', $event)"
        @toggle-selection="$emit('toggle-selection', $event)"
      />
    </div>

    <!-- Otherwise show headings if they exist -->
    <div v-else-if="!item.flattened && hasExpandableContent && isExpanded" class="bg-gray-50">
      <HierarchyItem
        v-for="heading in item.headings"
        :key="heading.key"
        :item="heading"
        :modelValue="modelValue"
        :expandedItems="expandedItems"
        :depth="depth + 1"
        :searchTerm="searchTerm"
        @toggle-expand="$emit('toggle-expand', $event)"
        @toggle-selection="$emit('toggle-selection', $event)"
      />
    </div>
  </div>

  <!-- Heading Item (expandable) -->
  <div
    v-else-if="item.type === 'heading'"
    class="border-t border-gray-200"
  >
    <div
      class="flex items-center gap-2 p-3 hover:bg-gray-100 cursor-pointer"
      :class="depth > 0 ? `pl-${Math.min(depth * 4 + 3, 24)}` : 'pl-16'"
      @click="$emit('toggle-expand', item.key)"
    >
      <svg
        :class="['w-3 h-3 transition-transform flex-shrink-0', isExpanded ? 'rotate-90' : '']"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <input
        type="checkbox"
        :checked="isSelected"
        @click.stop
        @change="$emit('toggle-selection', item)"
        class="rounded"
      />
      <span class="text-gray-800 text-sm flex-1 truncate">{{ item.display_name }}</span>
      <span class="text-xs text-gray-500">{{ item.products.length }} products</span>
    </div>

    <!-- Child products -->
    <div v-show="isExpanded" class="bg-white">
      <HierarchyItem
        v-for="product in item.products"
        :key="product.key"
        :item="product"
        :modelValue="modelValue"
        :expandedItems="expandedItems"
        :depth="depth + 1"
        :searchTerm="searchTerm"
        @toggle-expand="$emit('toggle-expand', $event)"
        @toggle-selection="$emit('toggle-selection', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  modelValue: {
    type: Set,
    required: true
  },
  expandedItems: {
    type: Set,
    required: true
  },
  depth: {
    type: Number,
    default: 0
  },
  searchTerm: {
    type: String,
    default: ''
  }
})

defineEmits(['toggle-expand', 'toggle-selection'])

// Highlight search term in description
const highlightedDescription = computed(() => {
  if (!props.searchTerm || props.item.type !== 'product') {
    return props.item.description || ''
  }
  
  const description = props.item.description || ''
  const searchTerm = props.searchTerm.trim()
  
  if (!searchTerm) return description
  
  // Escape special regex characters
  const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // Create a case-insensitive regex
  const regex = new RegExp(`(${escaped})`, 'gi')
  
  // Replace matches with highlighted version
  return description.replace(regex, '<mark class="bg-yellow-200 text-gray-900 font-medium rounded">$1</mark>')
})

// Check if this item is expanded
const isExpanded = computed(() => {
  return props.expandedItems.has(props.item.key)
})

// Check if has expandable content
const hasExpandableContent = computed(() => {
  if (props.item.type === 'chapter') {
    return (props.item.headings && props.item.headings.length > 0) || 
           (props.item.products && props.item.products.length > 0)
  }
  return props.item.type !== 'product'
})

// Count products under this item
const productCount = computed(() => {
  if (props.item.type === 'product') return 1
  if (props.item.type === 'heading') return props.item.products?.length || 0
  if (props.item.type === 'chapter') {
    let count = props.item.products?.length || 0
    for (const heading of props.item.headings || []) {
      count += heading.products?.length || 0
    }
    return count
  }
  if (props.item.type === 'category') {
    let count = 0
    for (const chapter of props.item.chapters || []) {
      count += chapter.products?.length || 0
      for (const heading of chapter.headings || []) {
        count += heading.products?.length || 0
      }
    }
    return count
  }
  return 0
})

// Check if this item (and all descendants) are selected
const isSelected = computed(() => {
  if (props.item.type === 'product') {
    return props.modelValue.has(props.item.code)
  }
  
  // For hierarchical items, check if all products are selected
  const allProducts = getAllProducts(props.item)
  return allProducts.length > 0 && allProducts.every(p => props.modelValue.has(p.code))
})

// Get all products under this item
function getAllProducts(item) {
  const products = []
  
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
  
  return products
}
</script>
