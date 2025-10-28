import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const CONVERSATIONS_KEY = 'trade-conversations'
const ACTIVE_CONVERSATION_KEY = 'trade-active-conversation'

// Generate a unique ID for conversations
function generateId() {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Create a new conversation object
function createConversation() {
  return {
    id: generateId(),
    title: 'New conversation',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

// Load all conversations from localStorage
function loadConversations() {
  try {
    const stored = localStorage.getItem(CONVERSATIONS_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        console.log(`✅ Loaded ${parsed.length} conversations from storage`)
        return parsed
      }
    }
  } catch (error) {
    console.error('Failed to load conversations:', error)
  }
  return []
}

// Save conversations to localStorage
function saveConversations(conversations) {
  try {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations))
  } catch (error) {
    console.error('Failed to save conversations:', error)
  }
}

// Load active conversation ID
function loadActiveConversationId() {
  return localStorage.getItem(ACTIVE_CONVERSATION_KEY) || null
}

// Save active conversation ID
function saveActiveConversationId(id) {
  if (id) {
    localStorage.setItem(ACTIVE_CONVERSATION_KEY, id)
  } else {
    localStorage.removeItem(ACTIVE_CONVERSATION_KEY)
  }
}

export function useConversations() {
  const router = useRouter()
  const conversations = ref(loadConversations())
  const activeConversationId = ref(loadActiveConversationId())
  
  // Get the currently active conversation
  const activeConversation = computed(() => {
    return conversations.value.find(c => c.id === activeConversationId.value) || null
  })
  
  // Get conversations sorted by most recent first
  const sortedConversations = computed(() => {
    return [...conversations.value].sort((a, b) => 
      new Date(b.updatedAt) - new Date(a.updatedAt)
    )
  })
  
  // Create a new conversation and navigate to it
  function createNewConversation() {
    const newConv = createConversation()
    conversations.value.push(newConv)
    saveConversations(conversations.value)
    
    activeConversationId.value = newConv.id
    saveActiveConversationId(newConv.id)
    
    console.log('✨ Created new conversation:', newConv.id)
    
    // Navigate to the new conversation
    router.push({ name: 'chat', params: { conversationId: newConv.id } })
    
    return newConv
  }
  
  // Switch to an existing conversation
  function switchToConversation(conversationId) {
    const conv = conversations.value.find(c => c.id === conversationId)
    if (conv) {
      activeConversationId.value = conversationId
      saveActiveConversationId(conversationId)
      router.push({ name: 'chat', params: { conversationId } })
      console.log('🔄 Switched to conversation:', conversationId)
    }
  }
  
  // Get a specific conversation by ID
  function getConversation(conversationId) {
    return conversations.value.find(c => c.id === conversationId) || null
  }
  
  // Update a conversation's messages
  function updateConversation(conversationId, updates) {
    const conv = conversations.value.find(c => c.id === conversationId)
    if (conv) {
      Object.assign(conv, updates)
      conv.updatedAt = new Date().toISOString()
      
      // Auto-generate title from first user message if still "New conversation"
      if (conv.title === 'New conversation' && conv.messages.length > 0) {
        const firstUserMessage = conv.messages.find(m => m.role === 'user')
        if (firstUserMessage) {
          conv.title = firstUserMessage.content.slice(0, 50) + 
            (firstUserMessage.content.length > 50 ? '...' : '')
        }
      }
      
      saveConversations(conversations.value)
    }
  }
  
  // Delete a conversation
  function deleteConversation(conversationId) {
    const index = conversations.value.findIndex(c => c.id === conversationId)
    if (index !== -1) {
      conversations.value.splice(index, 1)
      saveConversations(conversations.value)
      
      // If deleting active conversation, create a new one
      if (activeConversationId.value === conversationId) {
        if (conversations.value.length > 0) {
          // Switch to most recent conversation
          const mostRecent = sortedConversations.value[0]
          switchToConversation(mostRecent.id)
        } else {
          // Create new conversation if none left
          createNewConversation()
        }
      }
      
      console.log('🗑️  Deleted conversation:', conversationId)
    }
  }
  
  // Initialize: if no conversations exist, create one
  function initialize() {
    if (conversations.value.length === 0) {
      createNewConversation()
    }
  }
  
  return {
    conversations,
    sortedConversations,
    activeConversation,
    activeConversationId,
    createNewConversation,
    switchToConversation,
    getConversation,
    updateConversation,
    deleteConversation,
    initialize
  }
}
