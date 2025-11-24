/**
 * Shared constants for trade data visualization
 *
 * Design System: Warm amber primary with complementary trade colors
 * - Primary: Golden Amber (warm, welcoming)
 * - Imports: Teal Cyan (cool contrast, trust, incoming)
 * - Exports: Coral Rose (warm, action, outgoing)
 */

export const TRADE_COLORS = {
  // Exports: Orange palette - warm, outgoing
  EXPORTS: {
    primary: '#f97316',      // orange-500
    light: '#fb923c',        // orange-400
    lighter: '#fdba74',      // orange-300
    lightest: '#ffedd5',     // orange-100
    dark: '#ea580c',         // orange-600
    darker: '#c2410c',       // orange-700
    gradient: ['#ffedd5', '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#c2410c'],
  },
  // Imports: Blue palette - classic, trustworthy
  IMPORTS: {
    primary: '#3b82f6',      // blue-500
    light: '#60a5fa',        // blue-400
    lighter: '#93c5fd',      // blue-300
    lightest: '#dbeafe',     // blue-100
    dark: '#2563eb',         // blue-600
    darker: '#1d4ed8',       // blue-700
    gradient: ['#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'],
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
