import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useProductOrigins() {
  const loading = ref(false)
  const error = ref(null)
  const trendsData = ref([]) // Filtered data based on time window
  const fullTrendsData = ref([]) // All loaded data (up to 4 years)
  const countriesMap = ref(new Map())
  const categoriesData = ref(null)
  const availableMonths = ref([]) // All available months in the dataset

  // Load countries from JSON file
  async function loadCountries() {
    try {
      const response = await fetch('/data/countries.json')
      const countries = await response.json()
      countriesMap.value = new Map(countries.map(c => [c.code, c]))
    } catch (e) {
      // Silent fail - countries will be shown as codes
    }
  }

  // Load categories from JSON file
  async function loadCategories() {
    try {
      const response = await fetch('/data/categories.json')
      categoriesData.value = await response.json()
    } catch (e) {
      // Silent fail - category info will be missing
    }
  }

  // Search for products (6-digit codes) - returns flat list
  async function searchProducts(searchTerm) {
    if (!searchTerm || searchTerm.length < 2) return []
    
    try {
      const { data, error: queryError } = await supabase
        .rpc('search_products', { p_search_term: searchTerm })

      if (queryError) throw queryError
      
      // Return flat list of products with full details
      return data.map(product => {
        // Get chapter info
        const chapterCode = product.hs_chapter
        const categoryInfo = categoriesData.value?.find(c => 
          c.chapters.some(ch => ch.code === chapterCode)
        )
        const chapterInfo = categoryInfo?.chapters.find(ch => ch.code === chapterCode)
        
        return {
          code: product.hs_code,
          description: product.description,
          chapter: chapterCode,
          chapter_name: chapterInfo?.name || `Chapter ${chapterCode}`,
          category: product.category,
          heading: product.hs_heading
        }
      }).sort((a, b) => a.code.localeCompare(b.code))
    } catch (e) {
      return []
    }
  }

  // Fetch trends for selected products - load 4 years of data for ALL countries
  async function fetchTrendsForProducts(productCodes, flow) {
    loading.value = true
    error.value = null

    try {
      if (productCodes.length === 0) {
        trendsData.value = []
        fullTrendsData.value = []
        availableMonths.value = []
        return []
      }

      // Calculate date range: 4 years back from current month
      const now = new Date()
      const endYear = now.getFullYear()
      const endPeriod = now.getMonth() + 1
      
      const startDate = new Date(now)
      startDate.setMonth(startDate.getMonth() - 48)
      const startYear = startDate.getFullYear()
      const startPeriod = startDate.getMonth() + 1

      // First, get all countries that have traded these products
      const { data: countriesData, error: countriesError } = await supabase
        .from('trade_data')
        .select('partner_country')
        .in('product_code', productCodes)
        .eq('flow', flow)
        .not('partner_country', 'is', null)

      if (countriesError) throw countriesError

      // Get unique country codes
      const uniqueCountries = [...new Set(countriesData.map(row => row.partner_country))]

      if (uniqueCountries.length === 0) {
        trendsData.value = []
        fullTrendsData.value = []
        availableMonths.value = []
        return []
      }

      // Now fetch trends for all these countries with date range
      const { data, error: queryError } = await supabase
        .rpc('get_product_trends', {
          p_product_codes: productCodes,
          p_country_codes: uniqueCountries,
          p_flow: flow,
          p_start_year: startYear,
          p_start_period: startPeriod,
          p_end_year: endYear,
          p_end_period: endPeriod
        })

      if (queryError) throw queryError

      // Collect all unique dates for slider
      const allDates = new Set()
      data.forEach(row => {
        const date = `${row.year}-${String(row.period).padStart(2, '0')}`
        allDates.add(date)
      })
      
      availableMonths.value = Array.from(allDates)
        .sort((a, b) => {
          const [yearA, monthA] = a.split('-').map(Number)
          const [yearB, monthB] = b.split('-').map(Number)
          if (yearA !== yearB) return yearA - yearB
          return monthA - monthB
        })
        .map((date, index) => {
          const [year, month] = date.split('-').map(Number)
          return { date, year, month, index }
        })

      // Group by country and calculate totals
      const countryMap = new Map()
      
      for (const row of data) {
        const countryCode = row.partner_country
        const country = countriesMap.value.get(countryCode)
        const countryName = country?.name || countryCode
        
        if (!countryMap.has(countryCode)) {
          countryMap.set(countryCode, {
            country_code: countryCode,
            country_name: countryName,
            data_points: [],
            total_value: 0
          })
        }

        const countryData = countryMap.get(countryCode)
        const value = parseFloat(row.total_value) || 0
        
        countryData.data_points.push({
          year: row.year,
          period: row.period,
          date: `${row.year}-${String(row.period).padStart(2, '0')}`,
          value: value
        })
        
        countryData.total_value += value
      }

      // Sort data points by date for each country
      for (const country of countryMap.values()) {
        country.data_points.sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year
          return a.period - b.period
        })
      }

      // Store all countries sorted by value
      fullTrendsData.value = Array.from(countryMap.values())
        .sort((a, b) => b.total_value - a.total_value)
      
      // Set initial window to last 17 months
      const windowSize = 17
      const windowEnd = availableMonths.value.length - 1
      const windowStart = Math.max(0, windowEnd - windowSize + 1)
      
      trendsData.value = filterDataByTimeWindow(windowStart, windowEnd)
      
      return trendsData.value

    } catch (e) {
      error.value = e.message
      return []
    } finally {
      loading.value = false
    }
  }

  // Filter data by time window and selected countries
  function filterDataByTimeWindow(startIndex, endIndex, selectedCountryCodes = null) {
    // Filter by selected countries if provided
    let dataToFilter = fullTrendsData.value
    if (selectedCountryCodes && selectedCountryCodes.length > 0) {
      dataToFilter = fullTrendsData.value.filter(country => 
        selectedCountryCodes.includes(country.country_code)
      )
    }
    
    if (dataToFilter.length === 0) return []
    
    const startMonth = availableMonths.value[startIndex]
    const endMonth = availableMonths.value[endIndex]
    
    if (!startMonth || !endMonth) return fullTrendsData.value
    
    // Filter each country's data points to the window
    return dataToFilter.map(country => ({
      ...country,
      data_points: country.data_points.filter(point => {
        const pointDate = point.date
        return pointDate >= startMonth.date && pointDate <= endMonth.date
      })
    }))
  }

  return {
    loading,
    error,
    trendsData,
    fullTrendsData,
    availableMonths,
    countriesMap,
    loadCategories,
    loadCountries,
    searchProducts,
    fetchTrendsForProducts,
    filterDataByTimeWindow
  }
}
