import { ref } from 'vue'

export function useChatQuery() {
  const messages = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  
  // Use environment variable for API URL (falls back to localhost for development)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
  
  async function sendMessage(userMessage) {
    if (!userMessage.trim()) return
    
    isLoading.value = true
    error.value = null
    
    // Add user message to display
    messages.value.push({
      role: 'user',
      content: userMessage
    })
    
    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: messages.value.slice(0, -1) // Exclude the message we just added
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Add assistant response
      messages.value.push({
        role: 'assistant',
        content: data.answer
      })
      
      return data.answer
      
    } catch (err) {
      console.error('Chat error:', err)
      error.value = err.message
      
      // Add error message to chat
      messages.value.push({
        role: 'assistant',
        content: `Sorry, I encountered an error: ${err.message}`
      })
      
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  function clearChat() {
    messages.value = []
    error.value = null
  }
  
  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat
  }
}
