# 3D Pie Chart Component

## Overview

The `ThreeDPie` component creates modern 3D pie charts using Chart.js v4 with custom styling and effects.

## Usage

### Basic Implementation

```tsx
import ThreeDPie from '@/components/charts/ThreeDPie';

const labels = ['Instagram', 'Facebook', 'Referans', 'Website'];
const counts = [103, 87, 45, 23];
const colors = ['#9b51e0', '#3498db', '#2ecc71', '#e74c3c'];

<ThreeDPie
  title="Müşteri Kaynak Analizi"
  labels={labels}
  counts={counts}
  colors={colors}
  className="three-d-pie-container"
/>
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | string | Yes | Chart title displayed at the top |
| `labels` | string[] | Yes | Data labels for each slice |
| `counts` | number[] | Yes | Numeric values for each slice |
| `colors` | string[] | No | Custom colors (defaults to brand palette) |
| `className` | string | No | Additional CSS classes |

### Features

- **3D Visual Effects**: Drop-shadow and perspective transforms
- **Automatic Sorting**: Data sorted by count (descending)
- **Brand Colors**: Pre-configured with Instagram, Facebook, etc. colors
- **Responsive Design**: Adapts to container size
- **Custom Legend**: Color-coded legend with percentages
- **Smooth Animations**: 600ms easeOutBack animation on load
- **Interactive Tooltips**: Hover effects with detailed information

### Default Colors

The component includes a default color palette optimized for real estate lead sources:

```tsx
const DEFAULT_COLORS = [
  '#9b51e0', // Instagram purple
  '#2ecc71', // Referans green
  '#3498db', // Facebook blue
  '#e74c3c', // Red
  '#f39c12', // Orange
  '#1abc9c', // Turquoise
  '#34495e', // Dark gray
  '#9b59b6', // Purple
  '#e67e22', // Carrot
  '#95a5a6'  // Gray
];
```

### Styling

Add the `three-d-pie-container` class for enhanced 3D styling:

```css
.three-d-pie-container {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}
```

### Implementation Notes

- Uses Chart.js v4 and react-chartjs-2
- Includes chartjs-plugin-datalabels for enhanced labeling
- Automatically calculates percentages
- Maintains aspect ratio of 1:1
- Optimized for Turkish real estate terminology