/**
 * K-means clustering for 1D data to find natural color scale breaks
 */

// Simple 1D k-means clustering
export function kmeans1D(data, k, maxIterations = 100) {
  if (data.length < k) {
    throw new Error(`Not enough data points (${data.length}) for ${k} clusters`)
  }

  // Initialize centroids using k-means++ strategy for better initialization
  const centroids = initializeCentroidsKMeansPlusPlus(data, k)
  
  let assignments = new Array(data.length)
  let iteration = 0
  let changed = true

  while (changed && iteration < maxIterations) {
    changed = false
    
    // Assignment step: assign each point to nearest centroid
    for (let i = 0; i < data.length; i++) {
      const newAssignment = findNearestCentroid(data[i], centroids)
      if (assignments[i] !== newAssignment) {
        changed = true
        assignments[i] = newAssignment
      }
    }

    // Update step: recalculate centroids
    const newCentroids = new Array(k).fill(0)
    const counts = new Array(k).fill(0)
    
    for (let i = 0; i < data.length; i++) {
      const cluster = assignments[i]
      newCentroids[cluster] += data[i]
      counts[cluster]++
    }
    
    for (let j = 0; j < k; j++) {
      if (counts[j] > 0) {
        centroids[j] = newCentroids[j] / counts[j]
      }
    }
    
    iteration++
  }

  // Create clusters with their data points
  const clusters = Array.from({ length: k }, () => [])
  for (let i = 0; i < data.length; i++) {
    clusters[assignments[i]].push(data[i])
  }

  // Sort clusters by centroid value
  const sortedClusters = clusters
    .map((cluster, index) => ({
      centroid: centroids[index],
      values: cluster.sort((a, b) => a - b),
      min: Math.min(...cluster),
      max: Math.max(...cluster),
      count: cluster.length
    }))
    .sort((a, b) => a.centroid - b.centroid)

  return sortedClusters
}

// K-means++ initialization for better starting centroids
function initializeCentroidsKMeansPlusPlus(data, k) {
  const centroids = []
  
  // First centroid: random point
  centroids.push(data[Math.floor(Math.random() * data.length)])
  
  // Subsequent centroids: weighted by distance squared
  for (let i = 1; i < k; i++) {
    const distances = data.map(point => {
      const minDist = Math.min(...centroids.map(c => Math.abs(point - c)))
      return minDist * minDist
    })
    
    const totalDist = distances.reduce((sum, d) => sum + d, 0)
    let random = Math.random() * totalDist
    
    for (let j = 0; j < data.length; j++) {
      random -= distances[j]
      if (random <= 0) {
        centroids.push(data[j])
        break
      }
    }
  }
  
  return centroids
}

// Find nearest centroid to a point
function findNearestCentroid(point, centroids) {
  let minDist = Infinity
  let nearest = 0
  
  for (let i = 0; i < centroids.length; i++) {
    const dist = Math.abs(point - centroids[i])
    if (dist < minDist) {
      minDist = dist
      nearest = i
    }
  }
  
  return nearest
}

/**
 * Create color scale breaks using k-means clustering on log-transformed trade values
 * @param {Array<number>} values - Array of trade values in thousands of USD
 * @param {number} numBands - Number of color bands (clusters)
 * @returns {Array<Object>} Array of { min, max, color, label } for each band
 */
export function createKMeansColorScale(values, numBands, colors) {
  // Log transform the values for better clustering (since data is heavily skewed)
  const logValues = values.map(v => Math.log10(v + 1)) // +1 to handle zeros
  
  // Run k-means
  const clusters = kmeans1D(logValues, numBands)
  
  // Convert back to original scale and create bands
  const bands = clusters.map((cluster, index) => ({
    minLog: cluster.min,
    maxLog: cluster.max,
    min: Math.pow(10, cluster.min) - 1,
    max: Math.pow(10, cluster.max) - 1,
    centroid: Math.pow(10, cluster.centroid) - 1,
    color: colors[index],
    count: cluster.count
  }))
  
  return bands
}
