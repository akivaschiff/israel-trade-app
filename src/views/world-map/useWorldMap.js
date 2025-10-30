import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useWorldMap() {
  const loading = ref(false)
  const error = ref(null)
  const availableMonths = ref([])
  const countryTotals = ref([])
  const selectedCountryDetails = ref(null)
  const detailLoading = ref(false)
  const countriesMap = ref(new Map())

  // Load countries from JSON file
  async function loadCountries() {
    try {
      const response = await fetch('/data/countries.json')
      const countries = await response.json()
      countriesMap.value = new Map(countries.map(c => [c.code, c]))
      console.log('Loaded countries:', countriesMap.value.size)
    } catch (e) {
      console.error('Error loading countries:', e)
    }
  }

  // Map database country names to GeoJSON country names
  function mapCountryName(dbName) {
    const mapping = {
      'United States of America': 'United States',
      'United Kingdom of Great Britain and Northern Ireland': 'United Kingdom',
      'Russian Federation': 'Russia',
      'Korea, Republic of': 'South Korea',
      "Korea, Democratic People's Republic of": 'North Korea',
      'Iran, Islamic Republic of': 'Iran',
      'Syrian Arab Republic': 'Syria',
      'Venezuela, Bolivarian Republic of': 'Venezuela',
      'Bolivia, Plurinational State of': 'Bolivia',
      'Tanzania, United Republic of': 'Tanzania',
      'Viet Nam': 'Vietnam',
      'Lao People\'s Democratic Republic': 'Laos',
      'Moldova, Republic of': 'Moldova',
      'Congo, Democratic Republic of the': 'Dem. Rep. Congo',
      'Congo': 'Congo',
      'Côte d\'Ivoire': 'Ivory Coast',
      'Czechia': 'Czech Rep.',
      'Macedonia, the former Yugoslav Republic of': 'Macedonia',
      'Netherlands, Kingdom of the': 'Netherlands',
      'Palestine, State of': 'Palestine',
      'Taiwan, Province of China': 'Taiwan',
      'Hong Kong': 'Hong Kong',
      'Macao': 'Macao',
      'Türkiye': 'Turkey',  // Handle Turkish spelling
      'Turkey': 'Turkey',   // Ensure consistency
    }
    
    return mapping[dbName] || dbName
  }

  // Format month label
  function formatMonthLabel(period, year) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[period - 1]} ${year}`
  }

  // Fetch available months from the database
  async function fetchAvailableMonths() {
    try {
      // Query with ORDER BY to get recent months first
      const { data: allData, error: fallbackError } = await supabase
        .from('trade_data')
        .select('year, period')
        .order('year', { ascending: false })
        .order('period', { ascending: false })
        .limit(10000) // Get enough rows to find all unique months, starting with most recent
      
      if (fallbackError) throw fallbackError
      
      // Get unique year-period combinations
      const uniqueMonths = new Map()
      
      for (const row of allData) {
        const key = `${row.year}-${row.period}`
        if (!uniqueMonths.has(key)) {
          uniqueMonths.set(key, {
            year: row.year,
            period: row.period,
            label: formatMonthLabel(row.period, row.year),
            key: key
          })
        }
        // Stop after we have 12 unique months
        if (uniqueMonths.size >= 12) break
      }
      
      availableMonths.value = Array.from(uniqueMonths.values())

      console.log('Available months:', availableMonths.value.length)
      console.log('Latest month:', availableMonths.value[0]?.label)
      return availableMonths.value

    } catch (e) {
      error.value = e.message
      console.error('Error fetching available months:', e)
      return []
    }
  }

  // Fetch country trade totals for a specific month and flow - WITH SQL AGGREGATION
  async function fetchCountryTotals(year, period, flow) {
    loading.value = true
    error.value = null

    try {
      console.log(`Fetching country totals for ${year}-${period}, flow=${flow}`)

      // Use Supabase RPC to call a custom SQL function that does aggregation
      // If RPC function doesn't exist, fall back to client-side aggregation
      let aggregatedData = []

      try {
        // Try using RPC function first (more efficient)
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('get_country_totals', {
            p_year: year,
            p_period: period,
            p_flow: flow
          })

        if (rpcError) throw rpcError
        aggregatedData = rpcData
        console.log('Used RPC function for aggregation')
      } catch (rpcError) {
        console.log('RPC function not found, using Supabase aggregation query')
        
        // Fallback: Use Supabase's built-in aggregation
        const { data, error: queryError } = await supabase
          .from('trade_data')
          .select('partner_country, value')
          .eq('year', year)
          .eq('period', period)
          .eq('flow', flow)
          .not('partner_country', 'is', null)

        if (queryError) throw queryError

        // Aggregate client-side (less efficient but works)
        const countryMap = new Map()
        for (const row of data) {
          const code = row.partner_country
          const value = parseFloat(row.value) || 0
          countryMap.set(code, (countryMap.get(code) || 0) + value)
        }

        aggregatedData = Array.from(countryMap.entries()).map(([code, total]) => ({
          partner_country: code,
          total_value: total
        }))

        console.log(`Aggregated ${data.length} rows into ${aggregatedData.length} countries client-side`)
      }

      // Map country codes to names using loaded JSON
      countryTotals.value = aggregatedData
        .map(row => {
          const code = row.partner_country
          const country = countriesMap.value.get(code)
          const countryName = country?.name || code
          const mappedName = mapCountryName(countryName)

          return {
            country_code: code,
            country_name: countryName,
            map_name: mappedName,
            total_value: parseFloat(row.total_value) || 0
          }
        })
        .sort((a, b) => b.total_value - a.total_value)

      console.log(`Loaded ${countryTotals.value.length} countries`)
      return countryTotals.value

    } catch (e) {
      error.value = e.message
      console.error('Error fetching country totals:', e)
      return []
    } finally {
      loading.value = false
    }
  }

  // Fetch detailed product breakdown for a specific country
  async function fetchCountryDetails(countryCode, year, period, flow) {
    detailLoading.value = true

    try {
      console.log(`Fetching details for ${countryCode}`)

      // Get all products for this country
      const { data, error: queryError } = await supabase
        .from('trade_data')
        .select('product_code, value, products(description)')
        .eq('partner_country', countryCode)
        .eq('year', year)
        .eq('period', period)
        .eq('flow', flow)
        .not('product_code', 'is', null)

      if (queryError) throw queryError

      // Calculate total for percentage calculation
      const totalValue = data.reduce((sum, row) => sum + (parseFloat(row.value) || 0), 0)

      // Build hierarchical structure: Chapter -> Heading -> Product
      const chapterMap = new Map()

      for (const row of data) {
        const productCode = row.product_code
        const value = parseFloat(row.value) || 0
        const description = row.products?.description || productCode

        if (!productCode || productCode.length < 2) continue

        const chapterCode = productCode.substring(0, 2)
        const headingCode = productCode.length >= 4 ? productCode.substring(0, 4) : null

        // Initialize chapter
        if (!chapterMap.has(chapterCode)) {
          chapterMap.set(chapterCode, {
            hs_chapter: chapterCode,
            value: 0,
            headings: new Map()
          })
        }

        const chapter = chapterMap.get(chapterCode)
        chapter.value += value

        // Initialize heading if applicable
        if (headingCode) {
          if (!chapter.headings.has(headingCode)) {
            chapter.headings.set(headingCode, {
              hs_heading: headingCode,
              value: 0,
              products: []
            })
          }

          const heading = chapter.headings.get(headingCode)
          heading.value += value

          // Add product
          heading.products.push({
            hs_code: productCode,
            description: description,
            value: value,
            percentage: totalValue > 0 ? (value / totalValue * 100) : 0
          })
        }
      }

      // Convert to arrays and sort
      const chapters = Array.from(chapterMap.values())
        .map(chapter => ({
          ...chapter,
          percentage: totalValue > 0 ? (chapter.value / totalValue * 100) : 0,
          headings: Array.from(chapter.headings.values())
            .map(heading => ({
              ...heading,
              percentage: totalValue > 0 ? (heading.value / totalValue * 100) : 0,
              products: heading.products.sort((a, b) => b.value - a.value)
            }))
            .sort((a, b) => b.value - a.value)
        }))
        .sort((a, b) => b.value - a.value)

      // Get country name from loaded map
      const country = countriesMap.value.get(countryCode)
      const countryName = country?.name || countryCode

      selectedCountryDetails.value = {
        country_code: countryCode,
        country_name: countryName,
        total_value: totalValue,
        chapters: chapters,
        top_chapters: chapters.slice(0, 5) // Top 5 for chart
      }

      console.log(`Loaded ${chapters.length} chapters for ${countryCode}`)
      return selectedCountryDetails.value

    } catch (e) {
      error.value = e.message
      console.error('Error fetching country details:', e)
      return null
    } finally {
      detailLoading.value = false
    }
  }

  // Clear selected country details
  function clearCountryDetails() {
    selectedCountryDetails.value = null
  }

  return {
    loading,
    error,
    detailLoading,
    availableMonths,
    countryTotals,
    selectedCountryDetails,
    countriesMap,
    loadCountries,
    fetchAvailableMonths,
    fetchCountryTotals,
    fetchCountryDetails,
    clearCountryDetails
  }
}
