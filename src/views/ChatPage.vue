<template>
  <div class="flex h-[calc(100vh-64px)] overflow-hidden">
    <!-- Sidebar -->
    <ConversationSidebar
      :conversations="sortedConversations"
      :active-conversation-id="activeConversationId"
      @new-conversation="handleNewConversation"
      @select-conversation="handleSelectConversation"
      @delete-conversation="handleDeleteConversation"
    />

    <!-- Main Chat Area -->
    <div class="flex-1 flex flex-col bg-white overflow-hidden">
      <div class="flex-1 overflow-y-auto p-6">
        <div class="max-w-4xl mx-auto">

          <!-- Page Header -->
          <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900">AI Chat</h1>
            <p class="text-gray-600 mt-2">Ask questions about Israel's trade data in natural language</p>
          </div>

          <!-- Chat Container -->
          <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <!-- Messages -->
            <div 
              ref="messagesContainer"
              class="space-y-4 mb-6 max-h-[500px] overflow-y-auto"
            >
              <!-- Welcome message if no messages -->
              <div v-if="messages.length === 0" class="text-center py-12 text-gray-500">
                <div class="text-5xl mb-4">💬</div>
                <p class="text-lg mb-2">Start a conversation!</p>
                <p class="text-sm">Try asking: "Where do our tomatoes come from?" or "What are our top 5 import partners?"</p>
              </div>

              <!-- Message bubbles -->
              <div
                v-for="(msg, idx) in messages"
                :key="idx"
                :class="[
                  'flex',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                ]"
              >
                <div
                  :class="[
                    'max-w-[80%] rounded-lg p-4 shadow-sm',
                    msg.role === 'user' 
                      ? 'bg-blue-500 text-white ml-12' 
                      : 'bg-gray-100 text-gray-800 mr-12'
                  ]"
                >
                  <div class="font-semibold mb-1 text-sm">
                    {{ msg.role === 'user' ? 'You' : 'Assistant' }}
                  </div>
                  <div class="whitespace-pre-wrap break-words">{{ msg.content }}</div>
                </div>
              </div>
              
              <!-- Loading indicator -->
              <div v-if="isLoading" class="flex justify-start">
                <div class="bg-gray-100 rounded-lg p-4 shadow-sm mr-12">
                  <div class="font-semibold mb-1 text-sm">Assistant</div>
                  <div class="flex items-center space-x-2">
                    <div class="animate-bounce">●</div>
                    <div class="animate-bounce delay-100">●</div>
                    <div class="animate-bounce delay-200">●</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Input area -->
            <form @submit.prevent="handleSubmit" class="flex gap-2">
              <input
                v-model="input"
                type="text"
                placeholder="Ask about Israeli trade data..."
                class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                :disabled="isLoading"
              />
              <button
                type="submit"
                :disabled="isLoading || !input.trim()"
                class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Send
              </button>
            </form>

            <!-- Clear button -->
            <button
              v-if="messages.length > 0"
              @click="clearChat"
              class="mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear conversation
            </button>
          </div>

          <!-- Example questions -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-lg font-semibold mb-3 text-gray-800">Example Questions</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <button
                v-for="example in exampleQuestions"
                :key="example"
                @click="askExample(example)"
                :disabled="isLoading"
                class="text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors disabled:opacity-50"
              >
                {{ example }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useChatQuery } from '@/composables/useChatQuery'
import { useConversations } from '@/composables/useConversations'
import ConversationSidebar from '@/components/ConversationSidebar.vue'

const route = useRoute()
const { 
  sortedConversations,
  activeConversationId,
  createNewConversation,
  switchToConversation,
  deleteConversation,
  initialize
} = useConversations()

// Initialize conversations
onMounted(() => {
  initialize()
  
  // If we have a conversationId in the route, switch to it
  if (route.params.conversationId) {
    switchToConversation(route.params.conversationId)
  } else {
    // Otherwise, create a new conversation
    createNewConversation()
  }
})

// Get the current conversation ID from route or active conversation
const currentConversationId = computed(() => {
  return route.params.conversationId || activeConversationId.value
})

// Chat state
let chatQuery = null
const messages = ref([])
const isLoading = ref(false)

// Watch for conversation changes and reinitialize chat query
watch(currentConversationId, (newId) => {
  if (newId) {
    chatQuery = useChatQuery(newId)
    messages.value = chatQuery.messages.value
    isLoading.value = chatQuery.isLoading.value
    
    // Watch for changes in messages and loading state
    watch(chatQuery.messages, (newMessages) => {
      messages.value = newMessages
    }, { deep: true })
    
    watch(chatQuery.isLoading, (newLoading) => {
      isLoading.value = newLoading
    })
  }
}, { immediate: true })

const input = ref('')
const messagesContainer = ref(null)

const exampleQuestions = [
  "Where do our tomatoes come from?",
  "What are our top 5 import partners in 2024?",
  "How much did we export in 2024?",
  "What electronics do we import from China?",
  "Which European countries do we export the most to?",
  "Compare our exports to the US versus Germany"
]

async function handleSubmit() {
  if (!input.value.trim() || isLoading.value || !chatQuery) return
  
  const message = input.value
  input.value = ''
  
  try {
    await chatQuery.sendMessage(message)
  } catch (error) {
    console.error('Failed to send message:', error)
  }
}

async function askExample(question) {
  input.value = question
  await handleSubmit()
}

function clearChat() {
  if (chatQuery) {
    chatQuery.clearChat()
  }
}

function handleNewConversation() {
  createNewConversation()
}

function handleSelectConversation(conversationId) {
  switchToConversation(conversationId)
}

function handleDeleteConversation(conversationId) {
  if (confirm('Are you sure you want to delete this conversation?')) {
    deleteConversation(conversationId)
  }
}

// Auto-scroll to bottom when new messages arrive
watch(messages, async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}, { deep: true })
</script>

<style scoped>
.delay-100 {
  animation-delay: 100ms;
}

.delay-200 {
  animation-delay: 200ms;
}
</style>
