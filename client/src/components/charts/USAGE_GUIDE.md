# StandardChart Component - Usage Guide

## Overview

The `StandardChart` component is now the standardized chart component for the LeadTrackerPro application, inspired by the beautiful design of the "🎯 Kaynak Analizi" page. This component provides a unified, consistent look and feel across all charts in the application.

## Quick Start

### 1. Import the Component

```tsx
import StandardChart from "@/components/charts/StandardChart";
```

### 2. Basic Usage

```tsx
const data = [
  { name: "Instagram", value: 103, percentage: 40 },
  { name: "Facebook", value: 87, percentage: 34 },
  { name: "Referans", value: 45, percentage: 18 },
  { name: "Website", value: 23, percentage: 9 },
];

<StandardChart
  title="Müşteri Kaynak Analizi"
  data={data}
  icon="📱"
  description="Lead kaynaklarının dağılımı"
/>;
```

## Migration from InteractiveChart

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

## Standard Themes (Inspired by Kaynak Analizi)

### 1. Source Analysis Theme (Blue)

```tsx
<StandardChart
  title="Müşteri Kaynak Analizi"
  data={sourceData}
  icon="📱"
  chartType="3d-pie"
  gradientColors={["from-blue-50", "to-indigo-100"]}
  borderColor="border-blue-100 dark:border-blue-800"
  description="Lead kaynaklarının dağılımı"
  tableTitle="Kaynak Detayları"
/>
```

### 2. Meeting Type Theme (Purple)

```tsx
<StandardChart
  title="Görüşme Tipi Dağılımı"
  data={meetingData}
  icon="🤝"
  chartType="3d-pie"
  gradientColors={["from-purple-50", "to-pink-100"]}
  borderColor="border-purple-100 dark:border-purple-800"
  description="İletişim yöntemlerinin analizi"
  tableTitle="Görüşme Detayları"
/>
```

### 3. Personnel Performance Theme (Green)

```tsx
<StandardChart
  title="Personel Performans Analizi"
  data={personnelData}
  icon="👥"
  chartType="bar"
  gradientColors={["from-green-50", "to-emerald-100"]}
  borderColor="border-green-100 dark:border-green-800"
  description="Personel bazında lead dağılımı"
  tableTitle="Personel Detayları"
/>
```

### 4. Status Analysis Theme (Yellow)

```tsx
<StandardChart
  title="Durum Dağılımı Analizi"
  data={statusData}
  icon="📊"
  chartType="pie"
  gradientColors={["from-yellow-50", "to-orange-100"]}
  borderColor="border-yellow-100 dark:border-yellow-800"
  description="Lead durumlarının analizi"
  tableTitle="Durum Detayları"
/>
```

## Advanced Features

### 1. Interactive Chart with Type Switching

```tsx
<StandardChart
  title="Müşteri Kaynak Analizi"
  data={sourceData}
  onItemClick={handleChartClick}
  chartType="3d-pie"
  allowTypeChange={true}
  showDataTable={true}
  showBadge={true}
  badgeText={`${sourceData.reduce((sum, item) => sum + item.value, 0)} Kayıt`}
  gradientColors={["from-blue-50", "to-indigo-100"]}
  borderColor="border-blue-100 dark:border-blue-800"
  description="Lead kaynaklarının dağılımı"
  icon="📱"
  tableTitle="Kaynak Detayları"
/>
```

### 2. Data Preparation for API Integration

```tsx
const prepareChartData = (apiData: any[]) => {
  const total = apiData.reduce((sum, item) => sum + item.count, 0);
  return apiData.map((item, index) => ({
    name: item.name,
    value: Number(item.count),
    percentage: Math.round((item.count / total) * 100),
    color: `hsl(${index * 45}, 70%, 60%)`, // Auto-generate colors
  }));
};

// Usage
const chartData = prepareChartData(analytics?.sourceData || []);
```

### 3. Click Handler Implementation

```tsx
const handleChartClick = (data: ChartData) => {
  // Filter the main data based on clicked category
  const filteredData = allLeads.filter((lead) => lead.source === data.name);

  // Update state or navigate
  setFilteredLeads(filteredData);

  // Analytics tracking
  trackChartInteraction("source_analysis", data.name);
};
```

## Real-World Examples

### 1. Updated unified-takipte-tab.tsx

```tsx
// Old Implementation
<ThreeDPie
  title="📱 Müşteri Kaynak Analizi"
  labels={analytics?.sourceData.map((item) => item.name) || []}
  counts={analytics?.sourceData.map((item) => Number(item.value)) || []}
  colors={analytics?.sourceData.map((item) => item.color) || []}
/>

// New Implementation
<StandardChart
  title="Müşteri Kaynak Analizi"
  data={analytics?.sourceData?.map((item, index) => ({
    name: item.name,
    value: Number(item.value),
    percentage: item.percentage,
    color: item.color || `hsl(${index * 45}, 70%, 60%)`,
  })) || []}
  chartType="3d-pie"
  icon="📱"
  gradientColors={["from-blue-50", "to-indigo-100"]}
  borderColor="border-blue-100 dark:border-blue-800"
  description="Lead kaynaklarının dağılımı"
  tableTitle="Kaynak Detayları"
/>
```

### 2. Updated overview-dashboard-tab.tsx

```tsx
// Old Implementation
<InteractiveChart
  title="📊 Toplam Lead - Durum Dağılımı (SON GORUSME SONUCU)"
  data={statusChartData}
  onItemClick={handleStatusChartClick}
  height={350}
  chartType={chartType}
/>

// New Implementation
<StandardChart
  title="Toplam Lead - Durum Dağılımı (SON GORUSME SONUCU)"
  data={statusChartData}
  onItemClick={handleStatusChartClick}
  height={350}
  chartType={chartType === 'pie' ? '3d-pie' : chartType}
  allowTypeChange={true}
  showDataTable={true}
  showBadge={true}
  badgeText={`${statusChartData.reduce((sum, item) => sum + item.value, 0)} Lead`}
  gradientColors={["from-blue-50", "to-indigo-100"]}
  borderColor="border-blue-100 dark:border-blue-800"
  description="Lead durumlarının genel dağılımı"
  icon="📊"
  tableTitle="Durum Detayları"
/>
```

## Best Practices

### 1. Color Consistency

- Use the predefined theme colors for consistency
- Auto-generate colors for dynamic data: `hsl(${index * 45}, 70%, 60%)`
- Maintain color accessibility for dark mode

### 2. Data Preparation

- Always ensure `value` is a number
- Calculate `percentage` properly
- Handle empty data gracefully

### 3. Responsive Design

- Use appropriate heights for different screens
- Consider mobile-first approach
- Test on various screen sizes

### 4. Performance

- Memoize heavy calculations
- Use React.memo for static charts
- Implement proper loading states

## Component Files Structure

```
src/components/charts/
├── StandardChart.tsx          # Main component
├── StandardChart.md           # Documentation
├── StandardChartExample.tsx   # Usage examples
├── ThreeDPie.tsx             # 3D pie chart implementation
├── chart-enhancements.css    # Chart styling
└── README.md                 # Chart system overview
```

## Testing

### 1. Unit Tests

```tsx
import { render, screen } from "@testing-library/react";
import StandardChart from "./StandardChart";

test("renders chart with title", () => {
  const data = [{ name: "Test", value: 100, percentage: 100 }];

  render(<StandardChart title="Test Chart" data={data} />);

  expect(screen.getByText("Test Chart")).toBeInTheDocument();
});
```

### 2. Integration Tests

- Test with real API data
- Verify click handlers work correctly
- Test responsiveness

## Deployment Notes

1. **Import Updates**: Make sure to update all imports from `InteractiveChart` to `StandardChart`
2. **Prop Changes**: Review and update component props
3. **Styling**: Ensure CSS classes are properly applied
4. **Testing**: Test all chart interactions after deployment

## Support

For questions or issues with the StandardChart component:

1. Check the documentation in `StandardChart.md`
2. Review examples in `StandardChartExample.tsx`
3. Test with the provided usage patterns
4. Consider the existing implementations in the codebase

## Changelog

- **v1.0**: Initial release with Kaynak Analizi theme
- **v1.1**: Added type switching and interactive features
- **v1.2**: Enhanced data table integration
- **v1.3**: Improved responsive design and accessibility
