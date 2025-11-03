<template>
  <div class="tree-node">
    <!-- Node Content -->
    <div
      class="flex items-start py-2.5 px-4 rounded-lg hover:bg-slate-50 cursor-pointer transition-all group"
      :class="[
        getNodeBgClass(),
        { 'ring-2 ring-amber-400 bg-amber-50': isHighlighted }
      ]"
      @click="handleToggle"
    >
      <!-- Expand/Collapse Icon -->
      <div class="flex-shrink-0 w-6 h-6 flex items-center justify-center mr-3">
        <span v-if="hasChildren" class="text-slate-500 transition-transform duration-200 text-sm" :class="{ 'rotate-90': isExpanded }">
          ▶
        </span>
        <span v-else class="text-slate-300 text-xs">
          •
        </span>
      </div>

      <!-- Level Badge -->
      <div class="flex-shrink-0 mr-3">
        <span :class="getLevelBadgeClass()">
          {{ getLevelLabel() }}
        </span>
      </div>

      <!-- Code and Description with highlighting -->
      <div class="flex-1 min-w-0">
        <div class="flex items-baseline gap-2 flex-wrap">
          <span class="font-mono font-bold text-sm" :class="getCodeColorClass()">
            <span v-html="highlightText(node.hscode)"></span>
          </span>
          <span class="text-slate-700 text-sm" :class="{ 'font-semibold': node.level === 2 }">
            <span v-html="highlightText(node.description)"></span>
          </span>
        </div>
        
        <!-- Section identifier for chapters -->
        <div v-if="node.level === 2" class="text-xs text-slate-500 mt-1">
          Section {{ node.section }}
        </div>
      </div>

      <!-- Item count indicator -->
      <div v-if="hasChildren" class="flex-shrink-0 ml-3">
        <span class="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-medium group-hover:bg-slate-200 transition-colors">
          {{ childCount }}
        </span>
      </div>
    </div>

    <!-- Children (recursive) -->
    <div
      v-if="hasChildren && isExpanded"
      class="ml-8 border-l-2 pl-3 mt-1"
      :class="getBorderClass()"
    >
      <HSCodeTreeNode
        v-for="child in children"
        :key="child.hscode"
        :node="child"
        :children-map="childrenMap"
        :expanded-nodes="expandedNodes"
        :search-query="searchQuery"
        :category-color="categoryColor"
        @toggle="$emit('toggle', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  childrenMap: {
    type: Map,
    required: true
  },
  expandedNodes: {
    type: Set,
    required: true
  },
  searchQuery: {
    type: String,
    default: ''
  },
  categoryColor: {
    type: String,
    default: 'slate'
  }
})

const emit = defineEmits(['toggle'])

// Computed
const children = computed(() => {
  return props.childrenMap.get(props.node.hscode) || []
})

const hasChildren = computed(() => {
  return children.value.length > 0
})

const childCount = computed(() => {
  return children.value.length
})

const isExpanded = computed(() => {
  return props.expandedNodes.has(props.node.hscode)
})

const isHighlighted = computed(() => {
  if (!props.searchQuery) return false
  const query = props.searchQuery.toLowerCase()
  return props.node.hscode.toLowerCase().includes(query) ||
         props.node.description.toLowerCase().includes(query)
})

// Methods
function handleToggle() {
  if (hasChildren.value) {
    emit('toggle', props.node.hscode)
  }
}

function highlightText(text) {
  if (!props.searchQuery || !text) return text
  
  const query = props.searchQuery.trim()
  if (!query) return text
  
  // Escape special regex characters
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  
  // Create regex for case-insensitive matching
  const regex = new RegExp(`(${escapedQuery})`, 'gi')
  
  // Replace matches with highlighted version
  return text.replace(regex, '<mark class="bg-yellow-300 font-semibold px-0.5 rounded">$1</mark>')
}

function getLevelLabel() {
  switch (props.node.level) {
    case 1:
      return 'SEC'
    case 2:
      return 'CH'
    case 4:
      return 'HD'
    case 6:
      return 'SH'
    default:
      return '?'
  }
}

function getLevelBadgeClass() {
  const baseClasses = 'text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wide'
  
  // Use category color with different intensities for each level
  const colorMap = {
    1: `${baseClasses} bg-${props.categoryColor}-100 text-${props.categoryColor}-700 border border-${props.categoryColor}-300`,
    2: `${baseClasses} bg-sky-100 text-sky-700 border border-sky-300`,
    4: `${baseClasses} bg-indigo-100 text-indigo-700 border border-indigo-300`,
    6: `${baseClasses} bg-violet-100 text-violet-700 border border-violet-300`
  }
  
  return colorMap[props.node.level] || `${baseClasses} bg-slate-100 text-slate-700`
}

function getNodeBgClass() {
  switch (props.node.level) {
    case 1:
      return 'border-l-4 border-' + props.categoryColor + '-400'
    case 2:
      return ''
    case 4:
      return ''
    case 6:
      return ''
    default:
      return ''
  }
}

function getCodeColorClass() {
  switch (props.node.level) {
    case 1:
      return 'text-' + props.categoryColor + '-700'
    case 2:
      return 'text-sky-700'
    case 4:
      return 'text-indigo-700'
    case 6:
      return 'text-violet-700'
    default:
      return 'text-slate-700'
  }
}

function getBorderClass() {
  switch (props.node.level) {
    case 1:
      return 'border-' + props.categoryColor + '-200'
    case 2:
      return 'border-sky-200'
    case 4:
      return 'border-indigo-200'
    default:
      return 'border-slate-200'
  }
}
</script>

<style scoped>
.tree-node {
  animation: fadeIn 0.15s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.rotate-90 {
  transform: rotate(90deg);
}

/* Ensure mark elements don't break layout */
:deep(mark) {
  display: inline;
  line-height: inherit;
}
</style>
