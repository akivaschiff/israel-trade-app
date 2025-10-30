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
      const { data, error: queryError } = await supabase
        .rpc('get_available_months', { max_months: 12 })
      
      if (queryError) throw queryError
      
      availableMonths.value = data.map(row => ({
        year: row.year,
        period: row.period,
        label: formatMonthLabel(row.period, row.year),
        key: `${row.year}-${row.period}`
      }))
      
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
      let aggregatedData = []

      try {
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('get_country_totals', {
            p_year: year,
            p_period: period,
            p_flow: flow
          })

        if (rpcError) throw rpcError
        aggregatedData = rpcData
      } catch (rpcError) {
        const { data, error: queryError } = await supabase
          .from('trade_data')
          .select('partner_country, value')
          .eq('year', year)
          .eq('period', period)
          .eq('flow', flow)
          .not('partner_country', 'is', null)

        if (queryError) throw queryError

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
