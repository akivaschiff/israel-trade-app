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
  const categoriesData = ref(null)

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

  // Load categories from JSON file
  async function loadCategories() {
    try {
      const response = await fetch('/data/categories.json')
      categoriesData.value = await response.json()
    } catch (e) {
      console.error('Error loading categories:', e)
    }
  }

  // Get chapter info from categories.json
  function getChapterInfo(chapterCode) {
    if (!categoriesData.value) return null
    
    for (const category of categoriesData.value) {
      const chapter = category.chapters.find(ch => ch.code === chapterCode)
      if (chapter) {
        return {
          categoryName: category.name,
          chapterName: chapter.name
        }
      }
    }
    return null
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
        .rpc('get_available_months', { max_months: 24 })
      
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

  // Fetch country trade totals for a RANGE of months - aggregates multiple months
  async function fetchCountryTotalsRange(monthsData, flow) {
    loading.value = true
    error.value = null

    try {
      const countryMap = new Map()


      // Fetch aggregated data for each month using the RPC function
      for (const monthData of monthsData) {
        try {
          // Use the RPC function for server-side aggregation
          const { data: rpcData, error: rpcError } = await supabase
            .rpc('get_country_totals', {
              p_year: monthData.year,
              p_period: monthData.period,
              p_flow: flow
            })

          if (rpcError) throw rpcError


          // Aggregate values across months
          for (const row of rpcData) {
            const code = row.partner_country
            const value = parseFloat(row.total_value) || 0
            countryMap.set(code, (countryMap.get(code) || 0) + value)
          }
        } catch (rpcError) {
          console.warn(`⚠️ RPC failed for ${monthData.year}-${monthData.period}, falling back to direct query`)

          // Fallback: direct query with limit
          const { data, error: queryError } = await supabase
            .from('trade_data')
            .select('partner_country, value')
            .eq('year', monthData.year)
            .eq('period', monthData.period)
            .eq('flow', flow)
            .not('partner_country', 'is', null)

          if (queryError) throw queryError

          // Manual aggregation
          const monthCountryMap = new Map()
          for (const row of data) {
            const code = row.partner_country
            const value = parseFloat(row.value) || 0
            monthCountryMap.set(code, (monthCountryMap.get(code) || 0) + value)
          }

          // Add to overall map
          for (const [code, value] of monthCountryMap.entries()) {
            countryMap.set(code, (countryMap.get(code) || 0) + value)
          }
        }
      }


      // Convert to array format
      const aggregatedData = Array.from(countryMap.entries()).map(([code, total]) => ({
        partner_country: code,
        total_value: total
      }))

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
      console.error('Error fetching country totals range:', e)
      return []
    } finally {
      loading.value = false
    }
  }

  // Fetch detailed product breakdown for a specific country
  async function fetchCountryDetails(countryCode, year, period, flow) {
    detailLoading.value = true

    try {
      // Fetch trade data
      const { data: tradeData, error: tradeError } = await supabase
        .from('trade_data')
        .select('product_code, value')
        .eq('partner_country', countryCode)
        .eq('year', year)
        .eq('period', period)
        .eq('flow', flow)
        .not('product_code', 'is', null)

      if (tradeError) throw tradeError

      // Get unique product codes
      const productCodes = [...new Set(tradeData.map(row => row.product_code))]

      // Fetch product descriptions
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('hs_code, description, hs_chapter, hs_heading')
        .in('hs_code', productCodes)

      if (productsError) throw productsError

      // Create maps for quick lookup
      const productsMap = new Map(productsData.map(p => [p.hs_code, p]))
      
      // Build heading info map (heading -> simplified name)
      const headingInfoMap = new Map()
      productsData.forEach(p => {
        if (p.hs_heading && p.description && !headingInfoMap.has(p.hs_heading)) {
          // Extract simplified name (text before semicolon)
          const simplified = p.description.split(';')[0].trim()
          headingInfoMap.set(p.hs_heading, simplified)
        }
      })

      // Calculate total for percentage calculation
      const totalValue = tradeData.reduce((sum, row) => sum + (parseFloat(row.value) || 0), 0)

      // Build hierarchical structure: Category -> Chapter -> Heading (grouped by name) -> Products
      const categoryMap = new Map()

      for (const row of tradeData) {
        const productCode = row.product_code
        const value = parseFloat(row.value) || 0
        const product = productsMap.get(productCode)
        const description = product?.description || productCode

        if (!productCode || productCode.length < 2) continue

        const chapterCode = productCode.substring(0, 2)
        const headingCode = productCode.length >= 4 ? productCode.substring(0, 4) : null
        
        // Get chapter info from categories.json
        const chapterInfo = getChapterInfo(chapterCode)
        const categoryName = chapterInfo?.categoryName || 'Other'
        const chapterName = chapterInfo?.chapterName || `Chapter ${chapterCode}`
        const headingName = headingCode ? headingInfoMap.get(headingCode) || `Heading ${headingCode}` : null

        // Initialize category
        if (!categoryMap.has(categoryName)) {
          categoryMap.set(categoryName, {
            category_name: categoryName,
            value: 0,
            chapters: new Map()
          })
        }

        const category = categoryMap.get(categoryName)
        category.value += value

        // Initialize chapter within category
        if (!category.chapters.has(chapterCode)) {
          category.chapters.set(chapterCode, {
            hs_chapter: chapterCode,
            chapter_name: chapterName,
            value: 0,
            headings: new Map() // headings grouped by name
          })
        }

        const chapter = category.chapters.get(chapterCode)
        chapter.value += value

        // Group headings by their simplified name
        if (headingCode && headingName) {
          if (!chapter.headings.has(headingName)) {
            chapter.headings.set(headingName, {
              heading_name: headingName,
              value: 0,
              heading_codes: new Set(), // Track which heading codes are in this group
              products: []
            })
          }

          const heading = chapter.headings.get(headingName)
          heading.value += value
          heading.heading_codes.add(headingCode)

          // Add product
          heading.products.push({
            hs_code: productCode,
            heading_code: headingCode,
            description: description,
            value: value,
            percentage: totalValue > 0 ? (value / totalValue * 100) : 0
          })
        }
      }

      // Convert to arrays and sort
      const categories = Array.from(categoryMap.values())
        .map(category => ({
          ...category,
          percentage: totalValue > 0 ? (category.value / totalValue * 100) : 0,
          chapters: Array.from(category.chapters.values())
            .map(chapter => ({
              ...chapter,
              percentage: totalValue > 0 ? (chapter.value / totalValue * 100) : 0,
              headings: Array.from(chapter.headings.values())
                .map(heading => ({
                  ...heading,
                  heading_codes: Array.from(heading.heading_codes),
                  percentage: totalValue > 0 ? (heading.value / totalValue * 100) : 0,
                  products: heading.products.sort((a, b) => b.value - a.value)
                }))
                .sort((a, b) => b.value - a.value)
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
        categories: categories,
        top_categories: categories.slice(0, 5) // Top 5 for chart
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

  // Fetch country time series (all available months) - SERVER AGGREGATED
  async function fetchCountryTimeSeries(countryCode, flow) {
    try {
      const { data, error: queryError } = await supabase
        .rpc('get_country_monthly_totals', {
          p_country_code: countryCode,
          p_flow: flow
        })

      if (queryError) throw queryError

      return data.map(row => ({
        year: row.year,
        period: row.period,
        month: `${row.year}-${String(row.period).padStart(2, '0')}`,
        value: parseFloat(row.total_value) || 0
      }))

    } catch (e) {
      console.error('Error fetching country time series:', e)
      return []
    }
  }

  // Fetch chapter breakdown time series - SERVER AGGREGATED
  // Returns data already grouped by chapter with monthly_data as JSON array
  async function fetchChapterTimeSeries(countryCode, flow) {
    try {
      const { data, error: queryError } = await supabase
        .rpc('get_country_chapter_monthly', {
          p_country_code: countryCode,
          p_flow: flow
        })

      if (queryError) throw queryError

      return data.map(chapter => {
        const chapterInfo = getChapterInfo(chapter.chapter_code)

        // Parse monthly_data from JSONB and format
        const monthlyData = chapter.monthly_data.map(m => ({
          year: m.year,
          period: m.period,
          month: `${m.year}-${String(m.period).padStart(2, '0')}`,
          value: parseFloat(m.value) || 0
        }))

        return {
          chapter_code: chapter.chapter_code,
          chapter_name: chapterInfo?.chapterName || `Chapter ${chapter.chapter_code}`,
          monthly_data: monthlyData
        }
      })

    } catch (e) {
      console.error('Error fetching chapter time series:', e)
      return []
    }
  }

  // Fetch heading breakdown time series - SERVER AGGREGATED
  // Returns data already grouped by heading with monthly_data as JSON array
  async function fetchHeadingTimeSeries(countryCode, flow, chapterCode = null) {
    try {
      const { data, error: queryError } = await supabase
        .rpc('get_country_heading_monthly', {
          p_country_code: countryCode,
          p_flow: flow,
          p_chapter_code: chapterCode
        })

      if (queryError) throw queryError


      // Get heading names from products table
      const headingCodes = data.map(h => h.heading_code)
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('hs_heading, description')
        .in('hs_heading', headingCodes)

      if (productsError) {
        console.warn('Error fetching product names:', productsError)
      }

      // Create a map of heading codes to names
      const headingNamesMap = new Map()
      if (productsData) {
        productsData.forEach(p => {
          if (p.hs_heading && !headingNamesMap.has(p.hs_heading)) {
            // Extract simplified name (text before semicolon or comma)
            const simplified = p.description.split(/[;,]/)[0].trim()
            headingNamesMap.set(p.hs_heading, simplified)
          }
        })
      }

      // Parse and format the data
      return data.map(heading => {
        const headingName = headingNamesMap.get(heading.heading_code) || `Heading ${heading.heading_code}`

        // Parse monthly_data from JSONB and format
        const monthlyData = heading.monthly_data.map(m => ({
          year: m.year,
          period: m.period,
          month: `${m.year}-${String(m.period).padStart(2, '0')}`,
          value: parseFloat(m.value) || 0
        }))

        return {
          chapter_code: heading.chapter_code,
          heading_code: heading.heading_code,
          heading_name: headingName,
          monthly_data: monthlyData
        }
      })

    } catch (e) {
      console.error('Error fetching heading time series:', e)
      return []
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
    loadCategories,
    fetchAvailableMonths,
    fetchCountryTotals,
    fetchCountryTotalsRange,
    fetchCountryDetails,
    fetchCountryTimeSeries,
    fetchChapterTimeSeries,
    fetchHeadingTimeSeries,
    clearCountryDetails
  }
}
