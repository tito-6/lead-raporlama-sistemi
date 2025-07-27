// Main StandardChart component
export { default as StandardChart } from "./StandardChart";
export { default as StandardChartDemo } from "./StandardChartDemo";
export { default as StandardChartExample } from "./StandardChartExample";

// 3D Pie Chart component (used internally)
export { default as ThreeDPie } from "./ThreeDPie";

// Utility functions
export * from "./chart-utils";

// Type definitions
export interface ChartData {
  name: string;
  value: number;
  percentage: number;
  color?: string;
}

export interface StandardChartProps {
  title: string;
  data: ChartData[];
  onItemClick?: (item: ChartData) => void;
  showDataTable?: boolean;
  showBadge?: boolean;
  badgeText?: string;
  badgeVariant?: "default" | "outline" | "secondary" | "destructive";
  gradientColors?: [string, string];
  borderColor?: string;
  height?: number;
  chartType?: "pie" | "bar" | "line" | "3d-pie";
  allowTypeChange?: boolean;
  className?: string;
  description?: string;
  icon?: string;
  tableTitle?: string;
  emptyStateMessage?: string;
  emptyStateIcon?: string;
}

// Theme configurations
export const CHART_THEMES = {
  source: {
    gradientColors: ["from-blue-50", "to-indigo-100"] as [string, string],
    borderColor: "border-blue-100 dark:border-blue-800",
    defaultIcon: "📱",
  },
  meeting: {
    gradientColors: ["from-purple-50", "to-pink-100"] as [string, string],
    borderColor: "border-purple-100 dark:border-purple-800",
    defaultIcon: "🤝",
  },
  personnel: {
    gradientColors: ["from-green-50", "to-emerald-100"] as [string, string],
    borderColor: "border-green-100 dark:border-green-800",
    defaultIcon: "👥",
  },
  status: {
    gradientColors: ["from-yellow-50", "to-orange-100"] as [string, string],
    borderColor: "border-yellow-100 dark:border-yellow-800",
    defaultIcon: "📊",
  },
  general: {
    gradientColors: ["from-gray-50", "to-gray-100"] as [string, string],
    borderColor: "border-gray-100 dark:border-gray-800",
    defaultIcon: "📈",
  },
} as const;

// Quick helper functions for common patterns
export const createSourceChart = (
  data: ChartData[],
  onItemClick?: (item: ChartData) => void
) => ({
  ...CHART_THEMES.source,
  data,
  onItemClick,
  chartType: "3d-pie" as const,
  showDataTable: true,
  showBadge: true,
  badgeText: `${data.reduce((sum, item) => sum + item.value, 0)} Kayıt`,
  description: "Lead kaynaklarının dağılımı",
  tableTitle: "Kaynak Detayları",
});

export const createMeetingChart = (
  data: ChartData[],
  onItemClick?: (item: ChartData) => void
) => ({
  ...CHART_THEMES.meeting,
  data,
  onItemClick,
  chartType: "3d-pie" as const,
  showDataTable: true,
  showBadge: true,
  badgeText: `${data.reduce((sum, item) => sum + item.value, 0)} Görüşme`,
  description: "İletişim yöntemlerinin analizi",
  tableTitle: "Görüşme Detayları",
});

export const createPersonnelChart = (
  data: ChartData[],
  onItemClick?: (item: ChartData) => void
) => ({
  ...CHART_THEMES.personnel,
  data,
  onItemClick,
  chartType: "bar" as const,
  showDataTable: true,
  showBadge: true,
  badgeText: `${data.length} Personel`,
  description: "Personel bazında lead dağılımı",
  tableTitle: "Personel Detayları",
});

export const createStatusChart = (
  data: ChartData[],
  onItemClick?: (item: ChartData) => void
) => ({
  ...CHART_THEMES.status,
  data,
  onItemClick,
  chartType: "pie" as const,
  showDataTable: true,
  showBadge: true,
  badgeText: `${data.reduce((sum, item) => sum + item.value, 0)} Lead`,
  description: "Lead durumlarının analizi",
  tableTitle: "Durum Detayları",
});
