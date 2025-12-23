import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useOverview() {
  const loading = ref(false)
  const chartData = ref([])
  const availableMonths = ref([])
  const countriesList = ref([])

  // Load countries from JSON file
  async function loadCountries() {
    try {
      const response = await fetch('/data/countries.json')
      const countries = await response.json()
      countriesList.value = countries.sort((a, b) => a.name.localeCompare(b.name))
    } catch (e) {
      console.error('Error loading countries:', e)
    }
  }

  // Fetch available months from the database
  async function fetchAvailableMonths() {
    try {
      const { data, error: queryError } = await supabase
        .rpc('get_available_months', { max_months: 48 })

      if (queryError) throw queryError

      availableMonths.value = data.map(row => ({
        year: row.year,
        period: row.period,
        key: `${row.year}-${row.period}`,
        index: (row.year * 12) + row.period
      }))

      // Load countries after months are available
      await loadCountries()
    } catch (e) {
      console.error('Error fetching available months:', e)
    }
  }

  // Fetch total balance (all countries combined)
  async function fetchTotalBalance(startYear, startPeriod, endYear, endPeriod) {
    loading.value = true
    chartData.value = []

    try {
      // Use RPC function to get aggregated monthly totals
      const { data, error } = await supabase
        .rpc('get_total_monthly_balance', {
          p_start_year: startYear,
          p_start_period: startPeriod,
          p_end_year: endYear,
          p_end_period: endPeriod
        })

      if (error) throw error

      // Transform to chart data format
      chartData.value = data.map(row => ({
        date: `${row.year}-${row.period}`,
        year: row.year,
        period: row.period,
        import_value: row.import_value || 0,
        export_value: row.export_value || 0,
        balance: (row.export_value || 0) - (row.import_value || 0)
      }))

    } catch (e) {
      console.error('Error fetching total balance:', e)
    } finally {
      loading.value = false
    }
  }

  // Fetch country balance (single country)
  async function fetchCountryBalance(countryCode, startYear, startPeriod, endYear, endPeriod) {
    loading.value = true
    chartData.value = []

    try {
      // Use RPC function to get aggregated monthly totals for this country
      const { data, error } = await supabase
        .rpc('get_country_monthly_balance', {
          p_country_code: countryCode,
          p_start_year: startYear,
          p_start_period: startPeriod,
          p_end_year: endYear,
          p_end_period: endPeriod
        })

      if (error) throw error

      // Transform to chart data format
      chartData.value = data.map(row => ({
        date: `${row.year}-${row.period}`,
        year: row.year,
        period: row.period,
        import_value: row.import_value || 0,
        export_value: row.export_value || 0,
        balance: (row.export_value || 0) - (row.import_value || 0)
      }))

    } catch (e) {
      console.error('Error fetching country balance:', e)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    chartData,
    availableMonths,
    countriesList,
    fetchAvailableMonths,
    fetchTotalBalance,
    fetchCountryBalance
  }
}
