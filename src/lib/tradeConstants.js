/**
 * Shared constants for trade data visualization
 *
 * Design System: Warm amber primary with complementary trade colors
 * - Primary: Golden Amber (warm, welcoming)
 * - Imports: Teal Cyan (cool contrast, trust, incoming)
 * - Exports: Coral Rose (warm, action, outgoing)
 */

export const TRADE_COLORS = {
  // Exports: Coral/Rose palette - warm, action-oriented
  EXPORTS: {
    primary: '#f43f5e',      // rose-500 - vibrant coral
    light: '#fb7185',        // rose-400
    lighter: '#fda4af',      // rose-300
    lightest: '#ffe4e6',     // rose-100
    dark: '#e11d48',         // rose-600
    darker: '#be123c',       // rose-700
    gradient: ['#ffe4e6', '#fecdd3', '#fda4af', '#fb7185', '#f43f5e', '#e11d48', '#be123c'],
  },
  // Imports: Teal/Cyan palette - cool, trustworthy
  IMPORTS: {
    primary: '#0891b2',      // cyan-600 - rich teal
    light: '#22d3ee',        // cyan-400
    lighter: '#67e8f9',      // cyan-300
    lightest: '#cffafe',     // cyan-100
    dark: '#0e7490',         // cyan-700
    darker: '#155e75',       // cyan-800
    gradient: ['#cffafe', '#a5f3fc', '#67e8f9', '#22d3ee', '#06b6d4', '#0891b2', '#0e7490'],
  },
  // Primary accent: Golden Amber
  PRIMARY: {
    primary: '#f59e0b',      // amber-500
    light: '#fbbf24',        // amber-400
    lighter: '#fcd34d',      // amber-300
    lightest: '#fef3c7',     // amber-100
    dark: '#d97706',         // amber-600
    darker: '#b45309',       // amber-700
  }
}

// Flow type constants
export const FLOW_TYPES = {
  IMPORTS: 1,  // flow=1 in database (non-standard convention)
  EXPORTS: 2,  // flow=2 in database
}

// Helper function to get color by flow type
export function getFlowColor(flowType, shade = 'primary') {
  const colorSet = flowType === FLOW_TYPES.EXPORTS ? TRADE_COLORS.EXPORTS : TRADE_COLORS.IMPORTS
  return colorSet[shade] || colorSet.primary
}

// Helper function to get gradient by flow type
export function getFlowGradient(flowType) {
  return flowType === FLOW_TYPES.EXPORTS ? TRADE_COLORS.EXPORTS.gradient : TRADE_COLORS.IMPORTS.gradient
}

// Helper function to get flow label
export function getFlowLabel(flowType) {
  return flowType === FLOW_TYPES.EXPORTS ? 'Exports' : 'Imports'
}
