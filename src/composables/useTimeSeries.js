import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useTimeSeries() {
  const loading = ref(false)
  const error = ref(null)
  const timeSeriesData = ref([])
  const countries = ref([])
  const products = ref([])
  const categories = ref([])

  // Fetch time series data with optional filters (returns data per country)
  async function fetchTimeSeries(selectedCountries = null, selectedProducts = null) {
    loading.value = true
    error.value = null

    try {
      console.log('Fetching time series data...', { selectedCountries, selectedProducts })

      const { data, error: timeSeriesError } = await supabase
        .rpc('get_time_series_data', {
          country_codes: selectedCountries,
          product_codes: selectedProducts,
        })

      if (timeSeriesError) throw timeSeriesError

      // Group data by country for multi-line chart
      const countryMap = new Map()
      
      data.forEach(d => {
        const country = d.country_name
        if (!countryMap.has(country)) {
          countryMap.set(country, [])
        }
        countryMap.get(country).push({
          period: d.period,
          monthName: d.month_name.trim(),
          value: parseFloat(d.total_value) || 0,
        })
      })

      timeSeriesData.value = Array.from(countryMap.entries()).map(([country, data]) => ({
        country,
        data: data.sort((a, b) => a.period - b.period),
      }))

      console.log('Time series data received:', timeSeriesData.value.length, 'countries')
    } catch (e) {
      error.value = e.message
      console.error('Error fetching time series:', e)
    } finally {
      loading.value = false
    }
  }

  // Fetch all countries for filter dropdown
  async function fetchCountries() {
    try {
      const { data, error: countriesError } = await supabase
        .rpc('get_all_countries')

      if (countriesError) throw countriesError

      countries.value = data.map(c => ({
        code: c.code,
        name: c.name,
      }))

      console.log('Countries loaded:', countries.value.length)
    } catch (e) {
      console.error('Error fetching countries:', e)
    }
  }

  // Fetch products filtered by selected countries
  async function fetchProducts(selectedCountries = null) {
    try {
      const { data, error: productsError } = await supabase
        .rpc('get_products_by_countries', {
          country_codes: selectedCountries,
        })

      if (productsError) throw productsError

      products.value = data.map(p => ({
        code: p.product_code,
        description: p.description,
        category: p.category,
      }))

      console.log('Products loaded:', products.value.length)
    } catch (e) {
      console.error('Error fetching products:', e)
    }
  }

  // Fetch product categories with counts
  async function fetchCategories(selectedCountries = null) {
    try {
      const { data, error: categoriesError } = await supabase
        .rpc('get_product_categories', {
          country_codes: selectedCountries,
        })

      if (categoriesError) throw categoriesError

      categories.value = data.map(c => ({
        name: c.category,
        count: parseInt(c.product_count) || 0,
      }))

      console.log('Categories loaded:', categories.value.length)
    } catch (e) {
      console.error('Error fetching categories:', e)
    }
  }

  return {
    loading,
    error,
    timeSeriesData,
    countries,
    products,
    categories,
    fetchTimeSeries,
    fetchCountries,
    fetchProducts,
    fetchCategories,
  }
}
