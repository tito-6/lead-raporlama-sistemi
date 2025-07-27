# StandardChart Component

A unified, standardized chart component for the LeadTrackerPro application, inspired by the "🎯 Kaynak Analizi" page design. This component provides a consistent look and feel across all charts in the application.

## Features

✅ **Multiple Chart Types**: Pie, 3D Pie, Bar, Line charts  
✅ **Interactive**: Click handlers and hover effects  
✅ **Responsive**: Works on all screen sizes  
✅ **Customizable**: Extensive styling and configuration options  
✅ **Data Tables**: Automatic data table generation  
✅ **Empty States**: Graceful handling of empty data  
✅ **Gradient Backgrounds**: Beautiful gradient containers  
✅ **Type Switching**: Allow users to switch between chart types  
✅ **Badges**: Display contextual information  
✅ **Icons**: Visual enhancement with emojis or icons

## Usage

### Basic Usage

```tsx
import StandardChart from "@/components/charts/StandardChart";

const data = [
  { name: "Instagram", value: 103, percentage: 40, color: "#9b51e0" },
  { name: "Facebook", value: 87, percentage: 34, color: "#3498db" },
  { name: "Referans", value: 45, percentage: 18, color: "#2ecc71" },
  { name: "Website", value: 23, percentage: 9, color: "#e74c3c" },
];

<StandardChart
  title="Müşteri Kaynak Analizi"
  data={data}
  chartType="3d-pie"
  icon="📱"
  description="Lead kaynaklarının dağılımı"
/>;
```

### Advanced Usage (Kaynak Analizi Style)

```tsx
<StandardChart
  title="Müşteri Kaynak Analizi"
  data={sourceData}
  onItemClick={handleChartClick}
  showDataTable={true}
  showBadge={true}
  badgeText={`${sourceData.reduce((sum, item) => sum + item.value, 0)} Kayıt`}
  gradientColors={["from-blue-50", "to-indigo-100"]}
  borderColor="border-blue-100 dark:border-blue-800"
  height={300}
  chartType="3d-pie"
  allowTypeChange={true}
  description="Lead kaynaklarının dağılımı"
  icon="📱"
  tableTitle="Kaynak Detayları"
/>
```

### Empty State Handling

```tsx
<StandardChart
  title="Boş Veri Örneği"
  data={[]}
  emptyStateMessage="Henüz veri eklenmedi"
  emptyStateIcon="🔍"
/>
```

## Props

| Prop                | Type                        | Default                                  | Description                       |
| ------------------- | --------------------------- | ---------------------------------------- | --------------------------------- |
| `title`             | `string`                    | **Required**                             | Chart title                       |
| `data`              | `ChartData[]`               | **Required**                             | Chart data array                  |
| `onItemClick`       | `(item: ChartData) => void` | `undefined`                              | Click handler for chart items     |
| `showDataTable`     | `boolean`                   | `true`                                   | Show data table below chart       |
| `showBadge`         | `boolean`                   | `false`                                  | Show badge in header              |
| `badgeText`         | `string`                    | `undefined`                              | Badge text content                |
| `badgeVariant`      | `BadgeVariant`              | `"outline"`                              | Badge styling variant             |
| `gradientColors`    | `[string, string]`          | `["from-blue-50", "to-indigo-100"]`      | Gradient background colors        |
| `borderColor`       | `string`                    | `"border-blue-100 dark:border-blue-800"` | Card border color                 |
| `height`            | `number`                    | `300`                                    | Chart height in pixels            |
| `chartType`         | `ChartType`                 | `"pie"`                                  | Chart type                        |
| `allowTypeChange`   | `boolean`                   | `false`                                  | Allow users to switch chart types |
| `className`         | `string`                    | `""`                                     | Additional CSS classes            |
| `description`       | `string`                    | `undefined`                              | Chart description                 |
| `icon`              | `string`                    | `undefined`                              | Icon/emoji for title              |
| `tableTitle`        | `string`                    | `undefined`                              | Data table title                  |
| `emptyStateMessage` | `string`                    | `"Gösterilecek veri bulunamadı"`         | Empty state message               |
| `emptyStateIcon`    | `string`                    | `"📊"`                                   | Empty state icon                  |

## ChartData Interface

```tsx
interface ChartData {
  name: string; // Category name
  value: number; // Numeric value
  percentage: number; // Percentage (0-100)
  color?: string; // Optional color (hex/rgb)
}
```

## Chart Types

### 1. 3D Pie Chart (`3d-pie`)

- Enhanced visual appeal with 3D effects
- Best for: Source analysis, category distributions
- Perfect for the "Kaynak Analizi" style

### 2. Regular Pie Chart (`pie`)

- Clean, flat design
- Best for: Simple category distributions
- Responsive labels

### 3. Bar Chart (`bar`)

- Vertical bars
- Best for: Comparisons, rankings
- Angled labels for better readability

### 4. Line Chart (`line`)

- Connected data points
- Best for: Trends, time series
- Smooth curves with hover effects

## Styling Examples

### Source Analysis Style (Blue Theme)

```tsx
<StandardChart
  gradientColors={["from-blue-50", "to-indigo-100"]}
  borderColor="border-blue-100 dark:border-blue-800"
  icon="📱"
  chartType="3d-pie"
/>
```

### Meeting Type Style (Purple Theme)

```tsx
<StandardChart
  gradientColors={["from-purple-50", "to-pink-100"]}
  borderColor="border-purple-100 dark:border-purple-800"
  icon="🤝"
  chartType="3d-pie"
/>
```

### Personnel Performance Style (Green Theme)

```tsx
<StandardChart
  gradientColors={["from-green-50", "to-emerald-100"]}
  borderColor="border-green-100 dark:border-green-800"
  icon="👥"
  chartType="bar"
/>
```

### Status Analysis Style (Yellow Theme)

```tsx
<StandardChart
  gradientColors={["from-yellow-50", "to-orange-100"]}
  borderColor="border-yellow-100 dark:border-yellow-800"
  icon="📊"
  chartType="pie"
/>
```

## Best Practices

### 1. Data Preparation

```tsx
// Always include percentage calculation
const prepareChartData = (rawData: any[]) => {
  const total = rawData.reduce((sum, item) => sum + item.count, 0);
  return rawData.map((item) => ({
    name: item.name,
    value: item.count,
    percentage: Math.round((item.count / total) * 100),
    color: item.color || generateColor(item.name),
  }));
};
```

### 2. Click Handlers

```tsx
const handleChartClick = (data: ChartData) => {
  // Filter data based on clicked item
  setFilteredData(allData.filter((item) => item.category === data.name));

  // Navigate to detailed view
  navigate(`/details/${data.name}`);

  // Update analytics
  trackChartInteraction(data.name);
};
```

### 3. Responsive Design

```tsx
// Use appropriate heights for different screen sizes
const chartHeight = useBreakpoint({
  base: 250,
  md: 300,
  lg: 350,
  xl: 400,
});
```

## Replacing Existing Charts

### Before (Old InteractiveChart)

```tsx
<InteractiveChart
  title="📱 Müşteri Kaynak Analizi"
  data={sourceData}
  onItemClick={handleClick}
  height={300}
  chartType="pie"
/>
```

### After (New StandardChart)

```tsx
<StandardChart
  title="Müşteri Kaynak Analizi"
  data={sourceData}
  onItemClick={handleClick}
  height={300}
  chartType="3d-pie"
  icon="📱"
  showDataTable={true}
  gradientColors={["from-blue-50", "to-indigo-100"]}
  borderColor="border-blue-100 dark:border-blue-800"
  description="Lead kaynaklarının dağılımı"
/>
```

## Migration Guide

1. **Import the new component**:

   ```tsx
   import StandardChart from "@/components/charts/StandardChart";
   ```

2. **Update prop names**:

   - No breaking changes, all InteractiveChart props are supported
   - New props are optional

3. **Add styling enhancements**:

   - Add `gradientColors` for background
   - Add `borderColor` for card borders
   - Add `icon` for visual enhancement
   - Add `description` for context

4. **Enable new features**:
   - Set `allowTypeChange={true}` for type switching
   - Set `showBadge={true}` with `badgeText` for context
   - Use `chartType="3d-pie"` for enhanced visuals

## Integration with Existing Components

The StandardChart component is designed to be a drop-in replacement for:

- `InteractiveChart`
- `ThreeDPie` (for pie charts)
- Custom Recharts implementations

It automatically handles:

- Color generation
- Data table creation
- Empty states
- Responsive design
- Dark mode support
- Click interactions

## Dependencies

- React 18+
- Recharts
- @/components/ui/card
- @/components/ui/badge
- @/components/ui/select
- @/components/ui/data-table
- @/components/charts/ThreeDPie
- @/lib/color-system
