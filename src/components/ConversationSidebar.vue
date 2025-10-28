<template>
  <div class="h-screen w-80 bg-gray-900 text-white flex flex-col border-r border-gray-700">
    <!-- Header -->
    <div class="p-4 border-b border-gray-700">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold">Trade Chat</h2>
        <button
          @click="$emit('new-conversation')"
          class="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          title="New conversation"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      <button
        @click="$emit('new-conversation')"
        class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New Chat
      </button>
    </div>

    <!-- Conversations List -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="conversations.length === 0" class="p-4 text-center text-gray-400">
        No conversations yet
      </div>
      
      <div
        v-for="conv in conversations"
        :key="conv.id"
        @click="$emit('select-conversation', conv.id)"
        :class="[
          'p-4 cursor-pointer border-b border-gray-800 transition-colors group relative',
          activeConversationId === conv.id 
            ? 'bg-gray-800 border-l-4 border-l-blue-500' 
            : 'hover:bg-gray-800'
        ]"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 min-w-0">
            <h3 class="font-medium truncate text-sm mb-1">
              {{ conv.title }}
            </h3>
            <p class="text-xs text-gray-400">
              {{ formatDate(conv.updatedAt) }}
            </p>
            <p v-if="conv.messages.length > 0" class="text-xs text-gray-500 mt-1">
              {{ conv.messages.length }} messages
            </p>
          </div>
          
          <!-- Delete button (shows on hover) -->
          <button
            @click.stop="$emit('delete-conversation', conv.id)"
            class="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-700 transition-all flex-shrink-0"
            title="Delete conversation"
          >
            <svg class="w-4 h-4 text-gray-400 hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="p-4 border-t border-gray-700 text-xs text-gray-400">
      <p>Israeli Trade Data (2023-2025)</p>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  conversations: {
    type: Array,
    required: true
  },
  activeConversationId: {
    type: String,
    default: null
  }
})

defineEmits(['new-conversation', 'select-conversation', 'delete-conversation'])

function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}
</script>
