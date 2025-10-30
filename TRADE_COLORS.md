# Trade Color System

Consistent color scheme for imports and exports across all visualizations.

## Color Constants

Defined in `/src/lib/tradeConstants.js`

### Exports (Blue)
- **Primary**: `#3b82f6` (blue-500)
- **Light**: `#60a5fa` (blue-400)
- **Lighter**: `#93c5fd` (blue-300)
- **Lightest**: `#dbeafe` (blue-100)
- **Dark**: `#2563eb` (blue-600)
- **Darker**: `#1d4ed8` (blue-700)

### Imports (Orange)
- **Primary**: `#f97316` (orange-500)
- **Light**: `#fb923c` (orange-400)
- **Lighter**: `#fdba74` (orange-300)
- **Lightest**: `#ffedd5` (orange-100)
- **Dark**: `#ea580c` (orange-600)
- **Darker**: `#c2410c` (orange-700)

## Usage

### Import the constants
```javascript
import { TRADE_COLORS, FLOW_TYPES, getFlowColor, getFlowGradient } from '@/lib/tradeConstants'
```

### Use in templates
```vue
<!-- Direct color -->
:style="{ backgroundColor: TRADE_COLORS.EXPORTS.primary }"

<!-- Conditional by flow type -->
:style="{ backgroundColor: selectedFlow === FLOW_TYPES.EXPORTS ? TRADE_COLORS.EXPORTS.primary : TRADE_COLORS.IMPORTS.primary }"
```

### Use in scripts
```javascript
// Get single color
const color = getFlowColor(FLOW_TYPES.EXPORTS, 'primary')

// Get gradient array
const gradient = getFlowGradient(FLOW_TYPES.EXPORTS)
// Returns: ['#dbeafe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8']

// Get flow label
const label = getFlowLabel(FLOW_TYPES.EXPORTS) // Returns "Exports"
```

## Where It's Applied

### ✅ Updated Pages

1. **OverviewPage** (`/src/views/OverviewPage.vue`)
   - Import/Export toggle buttons
   - Top trading partners chart (orange for imports, blue for exports)
   - Time series line chart (orange line for imports, blue line for exports)

2. **WorldMapPage** (`/src/views/world-map/WorldMapPage.vue`)
   - Import/Export toggle buttons
   - Map color gradient (blue for exports, orange for imports)
   - Legend indicators

3. **ProductOriginPage** (`/src/views/ProductOriginPage.vue`)
   - World map (blue gradient - exports only)
   - Time series chart (blue colors)
   - Bar chart (blue gradient)

### Flow Type Constants

**CRITICAL**: This dataset uses a non-standard convention!

```javascript
FLOW_TYPES.IMPORTS = 1  // flow=1 in database means IMPORTS
FLOW_TYPES.EXPORTS = 2  // flow=2 in database means EXPORTS
```

**In the database:**
- `flow = 1` means Israel **IMPORTS** (buys from other countries) 
- `flow = 2` means Israel **EXPORTS** (sells to other countries)

This is backwards from many standard trade datasets, so always use the FLOW_TYPES constants!

## Benefits

1. **Consistency**: Same colors everywhere means users learn the visual language once
2. **Maintainability**: Change colors in one place to update entire app
3. **Accessibility**: Clear color distinction between imports and exports
4. **Intuitive**: Blue (cooler) for exports, Orange (warmer) for imports

## Future Pages

When creating new visualizations, always use these constants instead of hardcoded colors:

```javascript
// ❌ Don't do this
color: '#3b82f6'

// ✅ Do this instead
color: TRADE_COLORS.EXPORTS.primary
```
