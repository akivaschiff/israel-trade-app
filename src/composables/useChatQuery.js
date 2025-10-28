import { ref, watch, computed } from 'vue'
import { useConversations } from './useConversations'

export function useChatQuery(conversationId) {
  const { getConversation, updateConversation } = useConversations()
  const isLoading = ref(false)
  const error = ref(null)
  
  // Get messages from the conversation
  const messages = computed(() => {
    const conv = getConversation(conversationId)
    return conv ? conv.messages : []
  })
  
  // Use environment variable for API URL (falls back to localhost for development)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
  
  async function sendMessage(userMessage) {
    if (!userMessage.trim()) return
    
    isLoading.value = true
    error.value = null
    
    const conv = getConversation(conversationId)
    if (!conv) {
      console.error('Conversation not found:', conversationId)
      return
    }
    
    // Add user message to conversation
    const newMessages = [...conv.messages, {
      role: 'user',
      content: userMessage
    }]
    
    updateConversation(conversationId, { messages: newMessages })
    
    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: conv.messages // Don't include the message we just added
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Add assistant response
      const updatedMessages = [...newMessages, {
        role: 'assistant',
        content: data.answer
      }]
      
      updateConversation(conversationId, { messages: updatedMessages })
      
      return data.answer
      
    } catch (err) {
      console.error('Chat error:', err)
      error.value = err.message
      
      // Add error message to chat
      const errorMessages = [...newMessages, {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${err.message}`
      }]
      
      updateConversation(conversationId, { messages: errorMessages })
      
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  function clearChat() {
    updateConversation(conversationId, { messages: [] })
    error.value = null
    console.log('🗑️  Chat history cleared for conversation:', conversationId)
  }
  
  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat
  }
}
