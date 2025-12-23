import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import _ from 'lodash'

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
      // Query imports (flow = 1)
      const { data: importsData, error: importsError } = await supabase
        .from('trade_data')
        .select('year, period, value')
        .eq('flow', 1)
        .gte('year', startYear)
        .lte('year', endYear)
        .order('year')
        .order('period')

      if (importsError) throw importsError

      // Query exports (flow = 2)
      const { data: exportsData, error: exportsError } = await supabase
        .from('trade_data')
        .select('year, period, value')
        .eq('flow', 2)
        .gte('year', startYear)
        .lte('year', endYear)
        .order('year')
        .order('period')

      if (exportsError) throw exportsError

      // Aggregate imports by month
      const importsByMonth = _.chain(importsData)
        .filter(row => {
          const startIndex = (startYear * 12) + startPeriod
          const endIndex = (endYear * 12) + endPeriod
          const rowIndex = (row.year * 12) + row.period
          return rowIndex >= startIndex && rowIndex <= endIndex
        })
        .groupBy(row => `${row.year}-${row.period}`)
        .mapValues(rows => _.sumBy(rows, 'value'))
        .value()

      // Aggregate exports by month
      const exportsByMonth = _.chain(exportsData)
        .filter(row => {
          const startIndex = (startYear * 12) + startPeriod
          const endIndex = (endYear * 12) + endPeriod
          const rowIndex = (row.year * 12) + row.period
          return rowIndex >= startIndex && rowIndex <= endIndex
        })
        .groupBy(row => `${row.year}-${row.period}`)
        .mapValues(rows => _.sumBy(rows, 'value'))
        .value()

      // Combine into chart data
      const allDates = new Set([...Object.keys(importsByMonth), ...Object.keys(exportsByMonth)])

      chartData.value = Array.from(allDates)
        .map(date => {
          const [year, period] = date.split('-').map(Number)
          const importValue = importsByMonth[date] || 0
          const exportValue = exportsByMonth[date] || 0
          const balance = exportValue - importValue

          return {
            date,
            year,
            period,
            import_value: importValue,
            export_value: exportValue,
            balance
          }
        })
        .sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year
          return a.period - b.period
        })

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
      // Query imports (flow = 1) for this country
      const { data: importsData, error: importsError } = await supabase
        .from('trade_data')
        .select('year, period, value')
        .eq('flow', 1)
        .eq('partner_country', countryCode)
        .gte('year', startYear)
        .lte('year', endYear)
        .order('year')
        .order('period')

      if (importsError) throw importsError

      // Query exports (flow = 2) for this country
      const { data: exportsData, error: exportsError } = await supabase
        .from('trade_data')
        .select('year, period, value')
        .eq('flow', 2)
        .eq('partner_country', countryCode)
        .gte('year', startYear)
        .lte('year', endYear)
        .order('year')
        .order('period')

      if (exportsError) throw exportsError

      // Aggregate imports by month
      const importsByMonth = _.chain(importsData)
        .filter(row => {
          const startIndex = (startYear * 12) + startPeriod
          const endIndex = (endYear * 12) + endPeriod
          const rowIndex = (row.year * 12) + row.period
          return rowIndex >= startIndex && rowIndex <= endIndex
        })
        .groupBy(row => `${row.year}-${row.period}`)
        .mapValues(rows => _.sumBy(rows, 'value'))
        .value()

      // Aggregate exports by month
      const exportsByMonth = _.chain(exportsData)
        .filter(row => {
          const startIndex = (startYear * 12) + startPeriod
          const endIndex = (endYear * 12) + endPeriod
          const rowIndex = (row.year * 12) + row.period
          return rowIndex >= startIndex && rowIndex <= endIndex
        })
        .groupBy(row => `${row.year}-${row.period}`)
        .mapValues(rows => _.sumBy(rows, 'value'))
        .value()

      // Combine into chart data
      const allDates = new Set([...Object.keys(importsByMonth), ...Object.keys(exportsByMonth)])

      chartData.value = Array.from(allDates)
        .map(date => {
          const [year, period] = date.split('-').map(Number)
          const importValue = importsByMonth[date] || 0
          const exportValue = exportsByMonth[date] || 0
          const balance = exportValue - importValue

          return {
            date,
            year,
            period,
            import_value: importValue,
            export_value: exportValue,
            balance
          }
        })
        .sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year
          return a.period - b.period
        })

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
