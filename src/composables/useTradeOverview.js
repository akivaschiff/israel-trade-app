import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useTradeOverview() {
  const loading = ref(false)
  const error = ref(null)
  const stats = ref({
    totalValue: 0,
    numPartners: 0,
    numProducts: 0,
  })
  const topPartners = ref([])

  async function fetchOverview() {
    loading.value = true
    error.value = null

    try {
      console.log('Fetching aggregated trade data from database...')

      // Fetch overview stats using database function
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_trade_overview_stats')
      
      if (statsError) throw statsError
      
      if (statsData && statsData.length > 0) {
        const dbStats = statsData[0]
        stats.value = {
          totalValue: parseFloat(dbStats.total_value) || 0,
          numPartners: parseInt(dbStats.num_partners) || 0,
          numProducts: parseInt(dbStats.num_products) || 0,
        }
        console.log('Stats received:', stats.value)
      }

      // Fetch top trading partners using database function
      const { data: partnersData, error: partnersError } = await supabase
        .rpc('get_top_trading_partners', { limit_count: 10 })
      
      if (partnersError) throw partnersError
      
      topPartners.value = partnersData.map(p => ({
        code: p.partner_code,
        name: p.partner_name,
        value: parseFloat(p.total_value) || 0,
      }))
      
      console.log('Top partners received:', topPartners.value.length, 'partners')

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
    stats,
    topPartners,
    fetchOverview,
  }
}
