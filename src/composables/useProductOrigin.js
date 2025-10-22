import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useProductOrigin() {
  const loading = ref(false)
  const error = ref(null)
  const products = ref([])
  const mapData = ref([])
  const timeSeriesData = ref([])

  // Fetch all products for dropdown (kept for backwards compatibility)
  async function fetchProducts() {
    try {
      console.log('Fetching products for origin...')
      
      const { data, error: productsError } = await supabase
        .rpc('get_products_for_origin')

      if (productsError) {
        console.error('Products error:', productsError)
        throw productsError
      }

      console.log('Raw products data:', data)

      products.value = data.map(p => ({
        code: p.product_code,
        description: p.description,
        category: p.category,
        totalImports: parseFloat(p.total_imports) || 0,
      }))

      console.log('Products loaded:', products.value.length, 'products')
    } catch (e) {
      console.error('Error fetching products:', e)
    }
  }

  // NEW: Get product codes by labels
  async function getProductCodesByLabels(labels) {
    try {
      console.log('Fetching product codes for labels:', labels)
      
      // Query products where ANY of the labels match
      const { data, error: queryError } = await supabase
        .from('products')
        .select('hs_code')
        .or(
          labels.map(label => 
            `search_labels.cs.{${label}},hebrew_search_labels.cs.{${label}}`
          ).join(',')
        )

      if (queryError) {
        console.error('Error fetching products by labels:', queryError)
        throw queryError
      }

      const productCodes = data.map(p => p.hs_code)
      console.log(`Found ${productCodes.length} products for labels:`, labels)
      
      return productCodes
    } catch (e) {
      console.error('Error in getProductCodesByLabels:', e)
      return []
    }
  }

  // Fetch map data for selected product(s) (last month only)
  async function fetchMapData(productCodes) {
    loading.value = true
    error.value = null

    try {
      // Convert single code to array if needed
      const codes = Array.isArray(productCodes) ? productCodes : [productCodes]
      
      console.log('Fetching map data for products:', codes)

      const { data, error: mapError } = await supabase
        .rpc('get_product_origin_map_multi', {
          selected_products: codes,
        })

      if (mapError) {
        console.error('Map RPC error:', mapError)
        throw mapError
      }

      mapData.value = data.map(d => ({
        countryCode: d.country_code,
        countryName: d.country_name,
        value: parseFloat(d.total_value) || 0,
      }))

      console.log('Map data received:', mapData.value.length, 'countries')
    } catch (e) {
      error.value = e.message
      console.error('Error fetching map data:', e)
    } finally {
      loading.value = false
    }
  }

  // Fetch time series data for selected product(s)
  async function fetchTimeSeries(productCodes) {
    loading.value = true
    error.value = null

    try {
      // Convert single code to array if needed
      const codes = Array.isArray(productCodes) ? productCodes : [productCodes]
      
      console.log('Fetching time series for products:', codes)

      const { data, error: timeSeriesError } = await supabase
        .rpc('get_product_origin_timeseries_multi', {
          selected_products: codes,
        })

      if (timeSeriesError) {
        console.error('Time series RPC error:', timeSeriesError)
        throw timeSeriesError
      }

      // Group by country
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

  // Fetch all data for product(s)
  async function fetchProductOrigin(productCodes) {
    await Promise.all([
      fetchMapData(productCodes),
      fetchTimeSeries(productCodes),
    ])
  }

  // NEW: Fetch data by labels
  async function fetchProductOriginByLabels(labels) {
    if (!labels || labels.length === 0) {
      mapData.value = []
      timeSeriesData.value = []
      return
    }

    const productCodes = await getProductCodesByLabels(labels)
    
    if (productCodes.length === 0) {
      mapData.value = []
      timeSeriesData.value = []
      return
    }

    await fetchProductOrigin(productCodes)
  }

  return {
    loading,
    error,
    products,
    mapData,
    timeSeriesData,
    fetchProducts,
    fetchProductOrigin,
    getProductCodesByLabels,
    fetchProductOriginByLabels,
  }
}
