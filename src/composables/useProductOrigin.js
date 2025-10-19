import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useProductOrigin() {
  const loading = ref(false)
  const error = ref(null)
  const products = ref([])
  const mapData = ref([])
  const timeSeriesData = ref([])

  // Fetch all products for dropdown
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
      console.log('First 3 products:', products.value.slice(0, 3))
    } catch (e) {
      console.error('Error fetching products:', e)
    }
  }

  // Fetch map data for selected product (last month only)
  async function fetchMapData(productCode) {
    loading.value = true
    error.value = null

    try {
      console.log('Fetching map data for product:', productCode)

      const { data, error: mapError } = await supabase
        .rpc('get_product_origin_map', {
          selected_product: productCode,
        })

      if (mapError) throw mapError

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

  // Fetch time series data for selected product
  async function fetchTimeSeries(productCode) {
    loading.value = true
    error.value = null

    try {
      console.log('Fetching time series for product:', productCode)

      const { data, error: timeSeriesError } = await supabase
        .rpc('get_product_origin_timeseries', {
          selected_product: productCode,
        })

      if (timeSeriesError) throw timeSeriesError

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

  // Fetch all data for a product
  async function fetchProductOrigin(productCode) {
    await Promise.all([
      fetchMapData(productCode),
      fetchTimeSeries(productCode),
    ])
  }

  return {
    loading,
    error,
    products,
    mapData,
    timeSeriesData,
    fetchProducts,
    fetchProductOrigin,
  }
}
