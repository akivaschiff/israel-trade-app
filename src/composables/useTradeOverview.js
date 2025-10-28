import { ref } from 'vue'

export function useTradeOverview() {
  const loading = ref(false)
  const error = ref(null)
  const overviewData = ref(null)

  async function fetchOverview() {
    loading.value = true
    error.value = null

    try {
      console.log('Fetching overview data from static JSON...')
      
      const response = await fetch('/data/overview.json')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      overviewData.value = await response.json()
      console.log('Overview data loaded successfully')

    } catch (e) {
      error.value = e.message
      console.error('Error fetching trade overview:', e)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    overviewData,
    fetchOverview,
  }
}
