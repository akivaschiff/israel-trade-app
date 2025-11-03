<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Header Section -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-gray-900 mb-3">
        HS Code Explorer
      </h1>
      <p class="text-lg text-gray-600 max-w-3xl">
        Explore the Harmonized System - the global language of international trade. 
        Products are organized from natural resources through manufactured goods to specialized items.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
      <span class="ml-4 text-slate-600">Loading HS code hierarchy...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
      <p class="text-red-800 font-medium">Error loading HS codes:</p>
      <p class="text-red-600 text-sm mt-1">{{ error }}</p>
    </div>

    <!-- Main Content - Only show when loaded -->
    <template v-else>
      <!-- Info Cards - Highlight based on active hierarchy level -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
      <!-- Categories Card -->
      <div 
        class="bg-white rounded-xl p-4 border-2 shadow-sm transition-all duration-300"
        :class="isLevelActive('category') ? 'border-slate-400 shadow-md scale-105' : 'border-slate-200 opacity-50 grayscale'"
      >
        <div class="text-xs font-semibold uppercase tracking-wide" :class="isLevelActive('category') ? 'text-slate-700' : 'text-slate-400'">
          Categories
        </div>
        <div class="text-3xl font-bold mt-2" :class="isLevelActive('category') ? 'text-slate-900' : 'text-slate-400'">
          {{ stats.categories }}
        </div>
        <div class="text-xs mt-1" :class="isLevelActive('category') ? 'text-slate-600' : 'text-slate-400'">
          Super groups
        </div>
      </div>

      <!-- Sections Card -->
      <div 
        class="bg-white rounded-xl p-4 border-2 shadow-sm transition-all duration-300"
        :class="isLevelActive('section') ? 'border-emerald-400 shadow-md scale-105' : 'border-slate-200 opacity-50 grayscale'"
      >
        <div class="text-xs font-semibold uppercase tracking-wide" :class="isLevelActive('section') ? 'text-emerald-700' : 'text-slate-400'">
          Sections
        </div>
        <div class="text-3xl font-bold mt-2" :class="isLevelActive('section') ? 'text-emerald-900' : 'text-slate-400'">
          {{ stats.sections }}
        </div>
        <div class="text-xs mt-1" :class="isLevelActive('section') ? 'text-emerald-600' : 'text-slate-400'">
          I through XXI
        </div>
      </div>

      <!-- Chapters Card -->
      <div 
        class="bg-white rounded-xl p-4 border-2 shadow-sm transition-all duration-300"
        :class="isLevelActive('chapter') ? 'border-sky-400 shadow-md scale-105' : 'border-slate-200 opacity-50 grayscale'"
      >
        <div class="text-xs font-semibold uppercase tracking-wide" :class="isLevelActive('chapter') ? 'text-sky-700' : 'text-slate-400'">
          Chapters
        </div>
        <div class="text-3xl font-bold mt-2" :class="isLevelActive('chapter') ? 'text-sky-900' : 'text-slate-400'">
          {{ stats.chapters }}
        </div>
        <div class="text-xs mt-1" :class="isLevelActive('chapter') ? 'text-sky-600' : 'text-slate-400'">
          2-digit codes
        </div>
      </div>

      <!-- Headings Card -->
      <div 
        class="bg-white rounded-xl p-4 border-2 shadow-sm transition-all duration-300"
        :class="isLevelActive('heading') ? 'border-indigo-400 shadow-md scale-105' : 'border-slate-200 opacity-50 grayscale'"
      >
        <div class="text-xs font-semibold uppercase tracking-wide" :class="isLevelActive('heading') ? 'text-indigo-700' : 'text-slate-400'">
          Headings
        </div>
        <div class="text-3xl font-bold mt-2" :class="isLevelActive('heading') ? 'text-indigo-900' : 'text-slate-400'">
          {{ stats.headings }}
        </div>
        <div class="text-xs mt-1" :class="isLevelActive('heading') ? 'text-indigo-600' : 'text-slate-400'">
          4-digit codes
        </div>
      </div>

      <!-- Subheadings Card -->
      <div 
        class="bg-white rounded-xl p-4 border-2 shadow-sm transition-all duration-300"
        :class="isLevelActive('subheading') ? 'border-violet-400 shadow-md scale-105' : 'border-slate-200 opacity-50 grayscale'"
      >
        <div class="text-xs font-semibold uppercase tracking-wide" :class="isLevelActive('subheading') ? 'text-violet-700' : 'text-slate-400'">
          Subheadings
        </div>
        <div class="text-3xl font-bold mt-2" :class="isLevelActive('subheading') ? 'text-violet-900' : 'text-slate-400'">
          {{ stats.subheadings }}
        </div>
        <div class="text-xs mt-1" :class="isLevelActive('subheading') ? 'text-violet-600' : 'text-slate-400'">
          6-digit codes
        </div>
      </div>
    </div>

    <!-- Tree Structure with Categories - Grayscale unless expanded -->
    <div class="space-y-4">
      <!-- Small controls at top of tree -->
      <div class="flex justify-end gap-2 mb-2">
        <button
          @click="expandAll"
          class="px-3 py-1.5 bg-slate-100 text-slate-600 rounded text-xs hover:bg-slate-200 transition-colors"
        >
          Expand All
        </button>
        <button
          @click="collapseAll"
          class="px-3 py-1.5 bg-slate-100 text-slate-600 rounded text-xs hover:bg-slate-200 transition-colors"
        >
          Collapse All
        </button>
      </div>

      <div
        v-for="category in displayedCategories"
        :key="category.name"
        class="rounded-xl overflow-hidden shadow-sm border-2 transition-all duration-300 hover:shadow-md"
        :class="[
          category.borderClass,
          isCategoryExpanded(category.name) ? '' : 'grayscale opacity-75'
        ]"
      >
        <!-- Category Header -->
        <div
          class="px-6 py-4 cursor-pointer transition-all duration-300"
          :class="[
            isCategoryExpanded(category.name) ? category.bgClass : 'bg-gradient-to-r from-slate-400 to-slate-500'
          ]"
          @click="toggleCategory(category.name)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div 
                class="w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-all duration-300"
                :class="isCategoryExpanded(category.name) ? 'bg-white/20' : 'bg-white/30 grayscale'"
              >
                {{ category.icon }}
              </div>
              <div>
                <h2 class="text-xl font-bold text-white">{{ category.name }}</h2>
                <p class="text-sm mt-0.5" :class="isCategoryExpanded(category.name) ? 'text-white/90' : 'text-white/70'">
                  {{ category.description }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <span 
                class="text-sm font-semibold text-white px-4 py-1.5 rounded-full transition-all duration-300"
                :class="isCategoryExpanded(category.name) ? 'bg-white/20' : 'bg-white/10'"
              >
                {{ category.sectionRange }}
              </span>
              <span class="text-white text-xl transition-transform duration-200" :class="{ 'rotate-90': isCategoryExpanded(category.name) }">
                ▶
              </span>
            </div>
          </div>
        </div>

        <!-- Category Content (Sections) -->
        <div v-if="isCategoryExpanded(category.name)" class="bg-white p-6">
          <HSCodeTreeNode
            v-for="section in category.sections"
            :key="section.hscode"
            :node="section"
            :children-map="childrenMap"
            :expanded-nodes="expandedNodes"
            :search-query="searchQuery"
            :category-color="category.nodeColor"
            @toggle="toggleNode"
          />
        </div>
      </div>
    </div>

    <!-- Search Section - At Bottom -->
    <div class="mt-8 bg-white rounded-xl shadow-md border-2 border-slate-300 p-8">
      <h3 class="text-2xl font-bold text-slate-900 mb-3">
        🔍 Search HS Codes
      </h3>
      <p class="text-slate-600 mb-6">
        Type a code or description and press <kbd class="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-sm font-mono">Enter</kbd> to find and expand matching items.
      </p>
      
      <div class="flex gap-3">
        <input
          v-model="searchInput"
          type="text"
          placeholder="e.g., 'coffee', '0901', 'live animals', 'machinery'..."
          class="flex-1 px-5 py-4 text-lg border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          @keyup.enter="performSearch"
        />
        <button
          @click="performSearch"
          class="px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold shadow-md text-lg"
        >
          Search
        </button>
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="px-6 py-4 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
        >
          Clear
        </button>
      </div>

      <!-- Search Results Info -->
      <div v-if="searchQuery && filteredData.length > 0" class="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p class="text-green-800 font-medium">
          ✓ Found {{ filteredData.length }} results matching "<span class="font-bold">{{ searchQuery }}</span>"
        </p>
        <p class="text-green-700 text-sm mt-1">
          Expanded all matching paths. Matched text is highlighted in yellow.
        </p>
      </div>
      <div v-else-if="searchQuery && filteredData.length === 0" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-red-800 font-medium">
          ✗ No results found for "<span class="font-bold">{{ searchQuery }}</span>"
        </p>
        <p class="text-red-600 text-sm mt-1">
          Try a different search term or check your spelling.
        </p>
      </div>
    </div>

    <!-- Help Section - Redesigned -->
    <div class="mt-10 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-8 border-2 border-slate-200">
      <h3 class="text-2xl font-bold text-slate-900 mb-6">Understanding the HS Code Hierarchy</h3>
      <div class="grid md:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg p-5 border border-slate-200">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white font-bold text-sm">
              CAT
            </div>
            <div class="font-bold text-slate-900">Categories</div>
          </div>
          <p class="text-sm text-slate-600">Click to expand and see sections. Color activates when open.</p>
        </div>

        <div class="bg-white rounded-lg p-5 border border-slate-200">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              SEC
            </div>
            <div class="font-bold text-slate-900">Sections (I-XXI)</div>
          </div>
          <p class="text-sm text-slate-600">21 broad categories marked with Roman numerals</p>
        </div>

        <div class="bg-white rounded-lg p-5 border border-slate-200">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white font-bold text-sm">
              CH
            </div>
            <div class="font-bold text-slate-900">Chapters (01-99)</div>
          </div>
          <p class="text-sm text-slate-600">2-digit codes for specific product groups</p>
        </div>

        <div class="bg-white rounded-lg p-5 border border-slate-200">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              HD
            </div>
            <div class="font-bold text-slate-900">Headings (4 digits)</div>
          </div>
          <p class="text-sm text-slate-600">4-digit codes for product categories</p>
        </div>

        <div class="bg-white rounded-lg p-5 border border-slate-200">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
              SH
            </div>
            <div class="font-bold text-slate-900">Subheadings (6 digits)</div>
          </div>
          <p class="text-sm text-slate-600">Most detailed classification level</p>
        </div>

        <div class="bg-white rounded-lg p-5 border border-slate-200">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-lg">
              💡
            </div>
            <div class="font-bold text-slate-900">Pro Tip</div>
          </div>
          <p class="text-sm text-slate-600">Watch the top cards light up as you expand different levels!</p>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import HSCodeTreeNode from '@/components/trade/HSCodeTreeNode.vue'

// Category definitions with cohesive color scheme
const CATEGORY_DEFINITIONS = [
  {
    name: 'Animals & Plants',
    description: 'Live animals, animal products, and vegetable products',
    sections: ['I', 'II'],
    sectionRange: 'Sections I-II',
    bgClass: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
    borderClass: 'border-emerald-300',
    nodeColor: 'emerald',
    icon: '🌿'
  },
  {
    name: 'Food & Tobacco',
    description: 'Fats, oils, prepared foodstuffs, beverages, and tobacco',
    sections: ['III', 'IV'],
    sectionRange: 'Sections III-IV',
    bgClass: 'bg-gradient-to-r from-lime-500 to-lime-600',
    borderClass: 'border-lime-300',
    nodeColor: 'lime',
    icon: '🍽️'
  },
  {
    name: 'Mineral Products',
    description: 'Salt, sulfur, earth, stone, ores, and mineral fuels',
    sections: ['V'],
    sectionRange: 'Section V',
    bgClass: 'bg-gradient-to-r from-stone-500 to-stone-600',
    borderClass: 'border-stone-300',
    nodeColor: 'stone',
    icon: '⛰️'
  },
  {
    name: 'Chemicals & Pharmaceuticals',
    description: 'Chemical products, pharmaceuticals, and fertilizers',
    sections: ['VI'],
    sectionRange: 'Section VI',
    bgClass: 'bg-gradient-to-r from-teal-500 to-teal-600',
    borderClass: 'border-teal-300',
    nodeColor: 'teal',
    icon: '⚗️'
  },
  {
    name: 'Plastics & Rubber',
    description: 'Plastic materials and rubber products',
    sections: ['VII'],
    sectionRange: 'Section VII',
    bgClass: 'bg-gradient-to-r from-cyan-500 to-cyan-600',
    borderClass: 'border-cyan-300',
    nodeColor: 'cyan',
    icon: '♻️'
  },
  {
    name: 'Leather, Furs & Wood',
    description: 'Raw hides, leather goods, wood, and cork products',
    sections: ['VIII', 'IX'],
    sectionRange: 'Sections VIII-IX',
    bgClass: 'bg-gradient-to-r from-amber-600 to-amber-700',
    borderClass: 'border-amber-300',
    nodeColor: 'amber',
    icon: '🪵'
  },
  {
    name: 'Paper & Pulp',
    description: 'Wood pulp, paper, and paperboard articles',
    sections: ['X'],
    sectionRange: 'Section X',
    bgClass: 'bg-gradient-to-r from-orange-500 to-orange-600',
    borderClass: 'border-orange-300',
    nodeColor: 'orange',
    icon: '📄'
  },
  {
    name: 'Textiles & Apparel',
    description: 'Textiles, clothing, footwear, and fashion accessories',
    sections: ['XI', 'XII'],
    sectionRange: 'Sections XI-XII',
    bgClass: 'bg-gradient-to-r from-pink-500 to-rose-500',
    borderClass: 'border-pink-300',
    nodeColor: 'pink',
    icon: '👔'
  },
  {
    name: 'Stone & Ceramics',
    description: 'Stone, plaster, cement, ceramics, and glass',
    sections: ['XIII'],
    sectionRange: 'Section XIII',
    bgClass: 'bg-gradient-to-r from-slate-500 to-slate-600',
    borderClass: 'border-slate-300',
    nodeColor: 'slate',
    icon: '🏺'
  },
  {
    name: 'Precious Materials & Metals',
    description: 'Gemstones, precious metals, and base metals',
    sections: ['XIV', 'XV'],
    sectionRange: 'Sections XIV-XV',
    bgClass: 'bg-gradient-to-r from-yellow-500 to-amber-500',
    borderClass: 'border-yellow-300',
    nodeColor: 'yellow',
    icon: '💎'
  },
  {
    name: 'Machinery & Electronics',
    description: 'Mechanical appliances and electrical equipment',
    sections: ['XVI'],
    sectionRange: 'Section XVI',
    bgClass: 'bg-gradient-to-r from-blue-500 to-blue-600',
    borderClass: 'border-blue-300',
    nodeColor: 'blue',
    icon: '⚙️'
  },
  {
    name: 'Transportation Equipment',
    description: 'Vehicles, aircraft, vessels, and transport equipment',
    sections: ['XVII'],
    sectionRange: 'Section XVII',
    bgClass: 'bg-gradient-to-r from-sky-500 to-sky-600',
    borderClass: 'border-sky-300',
    nodeColor: 'sky',
    icon: '🚗'
  },
  {
    name: 'Precision Instruments',
    description: 'Optical, medical, and measuring instruments',
    sections: ['XVIII'],
    sectionRange: 'Section XVIII',
    bgClass: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
    borderClass: 'border-indigo-300',
    nodeColor: 'indigo',
    icon: '🔬'
  },
  {
    name: 'Arms & Ammunition',
    description: 'Weapons, ammunition, and related accessories',
    sections: ['XIX'],
    sectionRange: 'Section XIX',
    bgClass: 'bg-gradient-to-r from-red-600 to-red-700',
    borderClass: 'border-red-300',
    nodeColor: 'red',
    icon: '🎯'
  },
  {
    name: 'Miscellaneous Manufactured',
    description: 'Furniture, toys, sports equipment, and other goods',
    sections: ['XX'],
    sectionRange: 'Section XX',
    bgClass: 'bg-gradient-to-r from-violet-500 to-violet-600',
    borderClass: 'border-violet-300',
    nodeColor: 'violet',
    icon: '🎨'
  },
  {
    name: 'Art & Antiques',
    description: 'Works of art, collectors\' pieces, and antiques',
    sections: ['XXI'],
    sectionRange: 'Section XXI',
    bgClass: 'bg-gradient-to-r from-purple-500 to-fuchsia-500',
    borderClass: 'border-purple-300',
    nodeColor: 'purple',
    icon: '🖼️'
  }
]

// State
const loading = ref(true)
const error = ref(null)
const hsData = ref([])
const searchInput = ref('') // What user is typing
const searchQuery = ref('') // Active search after pressing Enter
const expandedNodes = ref(new Set())
const expandedCategories = ref(new Set())

// Build hierarchical structure
const childrenMap = computed(() => {
  const map = new Map()
  
  hsData.value.forEach(item => {
    if (!map.has(item.parent)) {
      map.set(item.parent, [])
    }
    map.get(item.parent).push(item)
  })
  
  return map
})

// Get root sections
const sections = computed(() => {
  return hsData.value.filter(item => item.parent === 'TOTAL')
})

// Group sections by category
const categories = computed(() => {
  return CATEGORY_DEFINITIONS.map(cat => ({
    ...cat,
    sections: sections.value.filter(s => cat.sections.includes(s.section))
  })).filter(cat => cat.sections.length > 0)
})

// Statistics
const stats = computed(() => {
  // Get unique section values (I, II, III, etc.)
  const uniqueSections = new Set(hsData.value.map(item => item.section).filter(Boolean))
  
  return {
    categories: categories.value.length,
    sections: uniqueSections.size,
    chapters: hsData.value.filter(item => item.level === 2).length,
    headings: hsData.value.filter(item => item.level === 4).length,
    subheadings: hsData.value.filter(item => item.level === 6).length
  }
})

// Determine which hierarchy levels are currently active/visible
const activeLevels = computed(() => {
  const levels = {
    category: expandedCategories.value.size > 0,
    section: false,
    chapter: false,
    heading: false,
    subheading: false
  }
  
  // Check what's expanded
  for (const nodeCode of expandedNodes.value) {
    const node = hsData.value.find(n => n.hscode === nodeCode)
    if (node) {
      if (node.level === 1) levels.section = true
      if (node.level === 2) levels.chapter = true
      if (node.level === 4) levels.heading = true
      if (node.level === 6) levels.subheading = true
    }
  }
  
  // If any category is expanded, sections are visible
  if (expandedCategories.value.size > 0) {
    levels.section = true
  }
  
  return levels
})

function isLevelActive(level) {
  // Category is always active (we're always at that level)
  if (level === 'category') return true
  
  return activeLevels.value[level]
}

// Search functionality
const filteredData = computed(() => {
  if (!searchQuery.value) return hsData.value
  
  const query = searchQuery.value.toLowerCase()
  return hsData.value.filter(item => {
    return item.hscode.toLowerCase().includes(query) ||
           item.description.toLowerCase().includes(query)
  })
})

// Display categories based on search
const displayedCategories = computed(() => {
  if (!searchQuery.value) return categories.value
  
  // When searching, show categories that have matching descendants
  const matchingCodes = new Set(filteredData.value.map(item => item.hscode))
  
  // Find all ancestors of matching items
  const relevantCodes = new Set()
  filteredData.value.forEach(item => {
    relevantCodes.add(item.hscode)
    // Add all ancestors
    let current = item
    while (current.parent && current.parent !== 'TOTAL') {
      const parent = hsData.value.find(p => p.hscode === current.parent)
      if (parent) {
        relevantCodes.add(parent.hscode)
        current = parent
      } else {
        break
      }
    }
  })
  
  return categories.value.map(cat => ({
    ...cat,
    sections: cat.sections.filter(section => 
      relevantCodes.has(section.hscode) || hasMatchingDescendant(section, matchingCodes)
    )
  })).filter(cat => cat.sections.length > 0)
})

function hasMatchingDescendant(node, matchingCodes) {
  const children = childrenMap.value.get(node.hscode) || []
  return children.some(child => 
    matchingCodes.has(child.hscode) || hasMatchingDescendant(child, matchingCodes)
  )
}

// Methods
function toggleNode(hscode) {
  if (expandedNodes.value.has(hscode)) {
    expandedNodes.value.delete(hscode)
  } else {
    expandedNodes.value.add(hscode)
  }
}

function toggleCategory(categoryName) {
  if (expandedCategories.value.has(categoryName)) {
    expandedCategories.value.delete(categoryName)
  } else {
    expandedCategories.value.add(categoryName)
  }
}

function isCategoryExpanded(categoryName) {
  return expandedCategories.value.has(categoryName)
}

function expandAll() {
  // Expand all categories
  expandedCategories.value = new Set(categories.value.map(c => c.name))
  
  // Expand all nodes
  const allCodes = new Set()
  hsData.value.forEach(item => {
    if (item.level < 6) {
      allCodes.add(item.hscode)
    }
  })
  expandedNodes.value = allCodes
}

function collapseAll() {
  expandedNodes.value = new Set()
  expandedCategories.value = new Set()
}

function performSearch() {
  // Set the active search query
  searchQuery.value = searchInput.value.trim()
  
  if (!searchQuery.value) {
    return
  }
  
  // Safety check - make sure data is loaded
  if (!hsData.value || hsData.value.length === 0) {
    console.error('HS code data not loaded yet')
    return
  }
  
  // Auto-expand relevant categories and nodes when searching
  const displayed = displayedCategories.value
  if (!displayed || displayed.length === 0) {
    console.error('No categories to display')
    return
  }
  
  const relevantCategories = new Set(displayed.map(c => c.name))
  expandedCategories.value = relevantCategories
  
  const matchingCodes = new Set(filteredData.value.map(item => item.hscode))
  const toExpand = new Set()
  
  filteredData.value.forEach(item => {
    // Expand all ancestors of matching items
    let current = item
    while (current.parent && current.parent !== 'TOTAL') {
      toExpand.add(current.parent)
      const parent = hsData.value.find(p => p.hscode === current.parent)
      if (parent) {
        current = parent
      } else {
        break
      }
    }
  })
  
  expandedNodes.value = toExpand
}

function clearSearch() {
  searchInput.value = ''
  searchQuery.value = ''
  collapseAll()
}

// Load HS codes data
async function loadHSCodes() {
  try {
    loading.value = true
    error.value = null
    
    const response = await fetch('/data/hs_codes.json')
    if (!response.ok) {
      throw new Error('Failed to load HS codes data')
    }
    
    const data = await response.json()
    hsData.value = data
    
    console.log('Loaded HS codes:', data.length)
    console.log('Categories:', categories.value.length)
  } catch (e) {
    console.error('Error loading HS codes:', e)
    error.value = e.message
  } finally {
    loading.value = false
  }
}

// Load data on mount
onMounted(() => {
  loadHSCodes()
})
</script>

<style scoped>
.rotate-90 {
  transform: rotate(90deg);
  transition: transform 0.2s ease;
}
</style>
