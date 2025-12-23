import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useTrends() {
  const loading = ref(false)
  const error = ref(null)
  const trendsData = ref([])
  const categoriesData = ref(null)
  const countriesMap = ref(new Map())
  const productsData = ref([]) // All products loaded in memory
  const availableTimeRange = ref(null)
  const relevantCountries = ref([]) // Countries that have the selected products
  const availableMonths = ref([]) // All available months in the database

  // Load categories from JSON file
  async function loadCategories() {
    try {
      const response = await fetch('/data/categories.json')
      categoriesData.value = await response.json()
    } catch (e) {
      console.error('Error loading categories:', e)
    }
  }

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

  // Load products from JSON file
  async function loadProducts() {
    try {
      const response = await fetch('/data/products.json')
      productsData.value = await response.json()
    } catch (e) {
      console.error('Error loading products:', e)
    }
  }

  // Search products in memory - returns flat list for SmartProductSelector
  function searchProducts(searchTerm) {
    if (!searchTerm || searchTerm.length < 2) return []

    const lowerSearchTerm = searchTerm.toLowerCase()

    // Search through products in memory
    const results = productsData.value.filter(product => {
      // Search in HS code
      if (product.code.includes(searchTerm)) return true

      // Search in description
      if (product.desc.toLowerCase().includes(lowerSearchTerm)) return true

      // Search in search labels
      if (product.labels?.some(label =>
        label.toLowerCase().includes(lowerSearchTerm)
      )) return true

      // Search in Hebrew search labels
      if (product.he?.some(label =>
        label.includes(searchTerm)
      )) return true

      // Search in category
      if (product.cat?.toLowerCase().includes(lowerSearchTerm)) return true

      return false
    })

    // Get chapter info from categories
    return results.map(product => {
      const chapterCode = product.code.substring(0, 2)
      const categoryInfo = categoriesData.value?.find(c =>
        c.chapters.some(ch => ch.code === chapterCode)
      )
      const chapterInfo = categoryInfo?.chapters.find(ch => ch.code === chapterCode)

      return {
        code: product.code,
        description: product.desc,
        chapter: chapterCode,
        chapter_name: chapterInfo?.name || `Chapter ${chapterCode}`,
        category: product.cat,
        heading: product.code.substring(0, 4)
      }
    })
    .sort((a, b) => a.code.localeCompare(b.code))
    .slice(0, 100) // Limit to 100 results for performance
  }

  // Get countries that have traded the selected products in the last year
  async function fetchRelevantCountries(productCodes, flow) {
    if (!productCodes || productCodes.length === 0) {
      relevantCountries.value = []
      return []
    }

    try {
      const { data, error: queryError } = await supabase
        .rpc('get_countries_with_products', {
          p_product_codes: productCodes,
          p_flow: flow
        })

      if (queryError) throw queryError

      // Map country codes to full country info
      relevantCountries.value = data.map(row => {
        const country = countriesMap.value.get(row.partner_country)
        return {
          code: row.partner_country,
          name: country?.name || row.partner_country,
          latest_year: row.latest_year,
          latest_period: row.latest_period,
          total_value: parseFloat(row.total_value) || 0
        }
      }).filter(c => c.name) // Filter out countries not in our map

      return relevantCountries.value
    } catch (e) {
      console.error('Error fetching relevant countries:', e)
      return []
    }
  }

  // Fetch all available months from the database
  async function fetchAvailableMonths() {
    try {
      const { data, error: queryError } = await supabase
        .rpc('get_available_months', { max_months: 60 }) // Get up to 5 years of data
      
      if (queryError) throw queryError
      
      availableMonths.value = data.map(row => ({
        year: row.year,
        period: row.period,
        key: `${row.year}-${row.period}`,
        index: (row.year * 12) + row.period // For easy sorting and range calculations
      }))
      
      return availableMonths.value

    } catch (e) {
      console.error('Error fetching available months:', e)
      return []
    }
  }

  // Get available time range for selected products and countries
  async function fetchTimeRange(productCodes, countryCodes, flow) {
    try {
      const { data, error: queryError } = await supabase
        .rpc('get_product_time_range', {
          p_product_codes: productCodes,
          p_country_codes: countryCodes,
          p_flow: flow
        })

      if (queryError) throw queryError
      availableTimeRange.value = data[0] || null
      return availableTimeRange.value
    } catch (e) {
      console.error('Error fetching time range:', e)
      return null
    }
  }

  // Fetch trend data for products across countries and time
  async function fetchTrends(productCodes, countryCodes, flow, startYear = null, startPeriod = null, endYear = null, endPeriod = null) {
    loading.value = true
    error.value = null

    try {
      const { data, error: queryError } = await supabase
        .rpc('get_product_trends', {
          p_product_codes: productCodes,
          p_country_codes: countryCodes,
          p_flow: flow,
          p_start_year: startYear,
          p_start_period: startPeriod,
          p_end_year: endYear,
          p_end_period: endPeriod
        })

      if (queryError) throw queryError

      // Transform data for charting
      // Group by country
      const countryData = new Map()
      
      for (const row of data) {
        const countryCode = row.partner_country
        const country = countriesMap.value.get(countryCode)
        const countryName = country?.name || countryCode
        
        if (!countryData.has(countryCode)) {
          countryData.set(countryCode, {
            country_code: countryCode,
            country_name: countryName,
            data_points: []
          })
        }

        countryData.get(countryCode).data_points.push({
          year: row.year,
          period: row.period,
          date: `${row.year}-${String(row.period).padStart(2, '0')}`,
          value: parseFloat(row.total_value) || 0
        })
      }

      // Sort data points by date
      for (const country of countryData.values()) {
        country.data_points.sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year
          return a.period - b.period
        })
      }

      trendsData.value = Array.from(countryData.values())
      return trendsData.value

    } catch (e) {
      error.value = e.message
      console.error('Error fetching trends:', e)
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    trendsData,
    categoriesData,
    countriesMap,
    relevantCountries,
    availableTimeRange,
    availableMonths,
    loadCategories,
    loadCountries,
    loadProducts,
    searchProducts,
    fetchRelevantCountries,
    fetchAvailableMonths,
    fetchTimeRange,
    fetchTrends
  }
}
