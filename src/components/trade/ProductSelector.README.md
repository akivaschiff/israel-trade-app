# ProductSelector Component

A powerful, filterable tree-view component for selecting products with persistent selection across search states.

## Features

✅ **Search & Filter**: Search by product name, tags, or category - tree filters dynamically  
✅ **Persistent Selection**: Selected items stay checked even when search is cleared  
✅ **Category Grouping**: Products organized by category with expand/collapse  
✅ **Trade Values**: Optional display of trade volume per product/category  
✅ **Bulk Actions**: Select all visible, clear selection  
✅ **Exposed Methods**: Programmatic control via template refs  

## Usage

### Basic Example

```vue
<template>
  <ProductSelector
    v-model:selected="selectedProducts"
    :categories="categories"
    :products="products"
  />
</template>

<script setup>
import { ref } from 'vue'
import ProductSelector from '@/components/trade/ProductSelector.vue'

const selectedProducts = ref([])

const categories = [
  { id: 'food', name: 'Foodstuffs', tradeValue: 13835473 },
  { id: 'machinery', name: 'Machinery & Electronics', tradeValue: 58915889 }
]

const products = [
  {
    code: '0702000000',
    description: 'Tomatoes, fresh or chilled',
    category: 'food',
    tags: ['vegetables', 'fresh produce', 'tomatoes'],
    tradeValue: 800000
  }
]
</script>
```

### With Trade Values

```vue
<ProductSelector
  v-model:selected="selectedProducts"
  :categories="categories"
  :products="products"
  :show-trade-values="true"
  @selection-change="handleChange"
/>
```

### Using Exposed Methods

```vue
<template>
  <ProductSelector ref="selector" ... />
  <button @click="selector.expandAll()">Expand All</button>
</template>

<script setup>
const selector = ref(null)
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selected` | `string[]` | `[]` | v-model: Array of selected product codes (HS codes) |
| `categories` | `Category[]` | **required** | Array of category objects |
| `products` | `Product[]` | **required** | Array of product objects |
| `showTradeValues` | `boolean` | `false` | Display trade values next to products/categories |
| `placeholder` | `string` | `'Search products...'` | Search input placeholder |
| `maxHeight` | `string` | `'500px'` | Maximum height of scrollable area |
| `multiSelect` | `boolean` | `true` | Allow multiple product selection |
| `collapsedByDefault` | `boolean` | `true` | Start with categories collapsed |

### Type Definitions

```typescript
interface Category {
  id: string           // Unique identifier
  name: string         // Display name
  tradeValue?: number  // Optional total trade value
}

interface Product {
  code: string           // HS code (e.g., "0702000000")
  description: string    // Product description
  category: string       // Category ID (or null for "Other")
  tags: string[]         // Search labels
  tradeValue?: number    // Optional trade value
}
```

## Events

### `update:selected`

Emitted when selection changes (v-model).

```vue
<ProductSelector v-model:selected="selectedProducts" />
```

### `selection-change`

Detailed event with change information.

```typescript
{
  selected: string[],    // All currently selected codes
  added: string[],       // Newly added codes
  removed: string[],     // Newly removed codes
  totalCount: number,    // Total selected count
  totalValue: number     // Sum of trade values (if available)
}
```

## Exposed Methods

Access via template ref:

```typescript
clearSelection(): void           // Clear all selections
selectAll(): void                // Select all products
deselectAll(): void              // Same as clearSelection
expandAll(): void                // Expand all categories
collapseAll(): void              // Collapse all categories
getSelectedProducts(): Product[] // Get full product objects
```

## Behavior

### Search & Filter

1. **Empty search**: Shows all products grouped by category
2. **Active search**: 
   - Filters products matching query (description, tags, or category name)
   - Auto-expands categories with matches
   - Shows count of matched products

### Selection Persistence

1. User searches "tomato" → sees 3 tomato products
2. User selects "Fresh tomatoes"
3. User clears search → full tree appears, tomatoes still selected ✓

### "Other" Category

Products with `category: null` or `category: ''` automatically go into an "Other" category.

## Styling

The component uses Tailwind CSS. Key classes:

- `.product-selector` - Main container
- `.category-header` - Category row (clickable)
- `.product-item` - Individual product row
- `.product-item.selected` - Highlighted when selected

## Test Page

Visit `/test-selector` to see the component in action with live Supabase data.

The test page includes:
- Live data loading from Supabase
- Toggle trade values display
- Expand/collapse all controls
- Real-time selection details
- Debug information

## Data Loading Example

```javascript
// Load categories
const { data: categoryData } = await supabase
  .from('trade_with_products')
  .select('category, value')
  .not('category', 'is', null)

// Aggregate by category
const categoryMap = new Map()
categoryData.forEach(row => {
  if (!categoryMap.has(row.category)) {
    categoryMap.set(row.category, 0)
  }
  categoryMap.set(row.category, categoryMap.get(row.category) + row.value)
})

const categories = Array.from(categoryMap.entries()).map(([name, value]) => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  name: name,
  tradeValue: value
}))

// Load products
const { data: productData } = await supabase
  .from('products')
  .select('hs_code, description, category, search_labels')

const products = productData.map(p => ({
  code: p.hs_code,
  description: p.description,
  category: p.category?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  tags: p.search_labels || [],
  tradeValue: 0 // Calculate from trade_data if needed
}))
```

## Performance Notes

- No virtualization: Renders all products (up to ~7,000)
- Categories collapsed by default to reduce initial render
- Search filtering is client-side (instant)
- Works well for datasets up to 10,000 products

For larger datasets, consider:
- Server-side filtering
- Virtual scrolling
- Lazy loading categories

## Future Enhancements

- [ ] Keyboard navigation (arrow keys, Enter to select)
- [ ] "Select all in category" button
- [ ] Export selected products
- [ ] Recent selections history
- [ ] Favorites/bookmarks
