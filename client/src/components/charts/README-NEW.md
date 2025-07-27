# Charts System - LeadTrackerPro

A comprehensive, standardized charting system for the LeadTrackerPro application, inspired by the beautiful "🎯 Kaynak Analizi" page design.

## 🎯 Overview

The StandardChart component provides a unified, consistent look and feel across all charts in the application. It replaces the old `InteractiveChart` and provides enhanced features, better styling, and improved user experience.

## 📁 File Structure

```
src/components/charts/
├── StandardChart.tsx              # Main standardized chart component
├── StandardChartDemo.tsx          # Interactive demo and showcase
├── StandardChartExample.tsx       # Usage examples
├── ThreeDPie.tsx                 # 3D pie chart implementation
├── chart-utils.ts                # Utility functions and helpers
├── chart-enhancements.css        # Chart-specific styling
├── index.ts                      # Export definitions
├── README.md                     # This file
├── StandardChart.md              # Detailed component documentation
└── USAGE_GUIDE.md                # Migration and usage guide
```

## 🚀 Quick Start

### 1. Basic Usage

```tsx
import { StandardChart } from "@/components/charts";

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

### 2. Using Theme Helpers

```tsx
import { StandardChart, createSourceChart } from "@/components/charts";

<StandardChart
  title="Müşteri Kaynak Analizi"
  {...createSourceChart(data, handleClick)}
/>;
```

### 3. Using Data Preparation Utilities

```tsx
import {
  StandardChart,
  prepareSourceData,
  getChartTheme,
} from "@/components/charts";

const formattedData = prepareSourceData(apiData);
const theme = getChartTheme("source");

<StandardChart
  title="Müşteri Kaynak Analizi"
  data={formattedData}
  {...theme}
/>;
```

## 🎨 Available Themes

### 1. Source Analysis Theme (🎯 Kaynak Analizi Style)

- **Colors**: Blue gradient background
- **Best for**: Source distribution, lead origins
- **Example**: Customer source analysis, traffic sources

### 2. Meeting Type Theme

- **Colors**: Purple gradient background
- **Best for**: Communication methods, meeting types
- **Example**: Phone calls, WhatsApp, face-to-face meetings

### 3. Personnel Performance Theme

- **Colors**: Green gradient background
- **Best for**: Staff performance, team metrics
- **Example**: Lead distribution per person, sales performance

### 4. Status Analysis Theme

- **Colors**: Yellow/orange gradient background
- **Best for**: Status distributions, workflow stages
- **Example**: Lead status, pipeline stages

## 📊 Chart Types

| Type     | Description             | Best Use Case                           |
| -------- | ----------------------- | --------------------------------------- |
| `3d-pie` | Enhanced 3D pie chart   | Category distributions, source analysis |
| `pie`    | Standard flat pie chart | Simple distributions                    |
| `bar`    | Vertical bar chart      | Comparisons, rankings                   |
| `line`   | Line chart with curves  | Trends, time series                     |

## 🔧 Key Features

- ✅ **Consistent Styling**: Based on Kaynak Analizi page design
- ✅ **Interactive**: Click handlers and hover effects
- ✅ **Responsive**: Works on all screen sizes
- ✅ **Data Tables**: Automatic table generation
- ✅ **Type Switching**: Users can change chart types
- ✅ **Empty States**: Graceful handling of no data
- ✅ **Dark Mode**: Full dark mode support
- ✅ **Accessibility**: Proper ARIA labels and keyboard navigation
- ✅ **Export Ready**: Data can be exported to CSV/Excel

## 🛠️ Migration Guide

### From InteractiveChart

```tsx
// Old
<InteractiveChart
  title="📱 Müşteri Kaynak Analizi"
  data={data}
  onItemClick={handleClick}
  chartType="pie"
/>

// New
<StandardChart
  title="Müşteri Kaynak Analizi"
  data={data}
  onItemClick={handleClick}
  chartType="3d-pie"
  icon="📱"
  {...getChartTheme("source")}
/>
```

### From ThreeDPie

```tsx
// Old
<ThreeDPie
  title="📱 Müşteri Kaynak Analizi"
  labels={labels}
  counts={counts}
  colors={colors}
/>

// New
<StandardChart
  title="Müşteri Kaynak Analizi"
  data={prepareSourceData(rawData)}
  chartType="3d-pie"
  icon="📱"
  {...getChartTheme("source")}
/>
```

## 🧪 Testing and Demo

### Run the Demo

The `StandardChartDemo` component provides a comprehensive showcase:

```tsx
import { StandardChartDemo } from "@/components/charts";

// Use in your development environment
<StandardChartDemo />;
```

### Features Demonstrated

- All chart types and themes
- Interactive features
- Data preparation utilities
- Empty state handling
- Responsive design

## 📈 Performance Considerations

- **Memoization**: Use `React.memo` for static charts
- **Data Preparation**: Prepare data outside render functions
- **Lazy Loading**: Load chart components only when needed
- **Debouncing**: Debounce interactive events

## 🎯 Usage Examples in Codebase

### 1. unified-takipte-tab.tsx

```tsx
<StandardChart
  title="Müşteri Kaynak Analizi"
  data={
    analytics?.sourceData?.map((item, index) => ({
      name: item.name,
      value: Number(item.value),
      percentage: item.percentage,
      color: item.color || `hsl(${index * 45}, 70%, 60%)`,
    })) || []
  }
  chartType="3d-pie"
  icon="📱"
  {...getChartTheme("source")}
/>
```

### 2. enhanced-overview-dashboard-tab.tsx

```tsx
<StandardChart
  title="Müşteri Kaynak Analizi"
  data={prepareSourceData(takipteAnalytics.sourceData)}
  chartType="3d-pie"
  showDataTable={true}
  {...getChartTheme("source")}
/>
```

### 3. overview-dashboard-tab.tsx

```tsx
<StandardChart
  title="Toplam Lead - Durum Dağılımı"
  data={statusChartData}
  onItemClick={handleStatusChartClick}
  chartType="3d-pie"
  allowTypeChange={true}
  showBadge={true}
  badgeText={`${statusChartData.reduce(
    (sum, item) => sum + item.value,
    0
  )} Lead`}
  {...getChartTheme("status")}
/>
```

## 🔄 Update History

- **v1.0**: Initial StandardChart component
- **v1.1**: Added theme system and utilities
- **v1.2**: Enhanced data preparation helpers
- **v1.3**: Added demo and example components
- **v1.4**: Improved TypeScript types and exports

## 📚 Documentation

- **[StandardChart.md](./StandardChart.md)**: Detailed component API
- **[USAGE_GUIDE.md](./USAGE_GUIDE.md)**: Migration and usage examples
- **[chart-utils.ts](./chart-utils.ts)**: Utility functions documentation

## 🤝 Contributing

When working with charts:

1. **Use StandardChart** for all new chart implementations
2. **Follow the theme system** for consistent styling
3. **Prepare data properly** using the utility functions
4. **Test responsiveness** on different screen sizes
5. **Add proper accessibility** attributes

## 📞 Support

For questions or issues:

1. Check the documentation files
2. Review the demo component
3. Look at existing implementations
4. Test with the provided utilities
