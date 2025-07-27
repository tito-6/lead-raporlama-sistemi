import { generateChartColors } from "@/lib/color-system";

// Interface for chart data
export interface ChartData {
  name: string;
  value: number;
  percentage: number;
  color?: string;
}

// Interface for raw data from API
export interface RawChartData {
  name: string;
  value: number | string;
  count?: number;
  percentage?: number;
  color?: string;
}

/**
 * Prepares raw API data for use with StandardChart component
 * @param rawData - Raw data from API
 * @param options - Configuration options
 * @returns Formatted data for StandardChart
 */
export function prepareChartData(
  rawData: RawChartData[],
  options: {
    autoCalculatePercentage?: boolean;
    autoGenerateColors?: boolean;
    colorHue?: number;
    colorSaturation?: number;
    colorLightness?: number;
  } = {}
): ChartData[] {
  const {
    autoCalculatePercentage = true,
    autoGenerateColors = true,
    colorHue = 45,
    colorSaturation = 70,
    colorLightness = 60,
  } = options;

  if (!rawData || rawData.length === 0) {
    return [];
  }

  // Convert values to numbers
  const processedData = rawData.map((item) => ({
    ...item,
    value: typeof item.value === "string" ? Number(item.value) : item.value,
  }));

  // Calculate total for percentage calculation
  const total = processedData.reduce((sum, item) => sum + item.value, 0);

  // Generate colors if needed
  const colors = autoGenerateColors
    ? generateChartColors(processedData.length)
    : processedData.map(() => undefined);

  // Format data for StandardChart
  return processedData.map((item, index) => ({
    name: item.name,
    value: item.value,
    percentage:
      autoCalculatePercentage && total > 0
        ? Math.round((item.value / total) * 100)
        : item.percentage || 0,
    color:
      item.color ||
      colors[index] ||
      `hsl(${index * colorHue}, ${colorSaturation}%, ${colorLightness}%)`,
  }));
}

/**
 * Prepares source data specifically for "Kaynak Analizi" style charts
 * @param sourceData - Raw source data from API
 * @returns Formatted data with blue-themed colors
 */
export function prepareSourceData(sourceData: RawChartData[]): ChartData[] {
  return prepareChartData(sourceData, {
    colorHue: 45,
    colorSaturation: 70,
    colorLightness: 60,
  });
}

/**
 * Prepares meeting type data for "Görüşme Tipi" style charts
 * @param meetingData - Raw meeting data from API
 * @returns Formatted data with purple-themed colors
 */
export function prepareMeetingData(meetingData: RawChartData[]): ChartData[] {
  const purpleColors = [
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#06B6D4", // Cyan
    "#10B981", // Emerald
    "#F59E0B", // Amber
    "#EF4444", // Red
    "#6366F1", // Indigo
    "#84CC16", // Lime
  ];

  return prepareChartData(meetingData, {
    autoGenerateColors: false,
  }).map((item, index) => ({
    ...item,
    color: purpleColors[index % purpleColors.length],
  }));
}

/**
 * Prepares personnel data for "Personel Performans" style charts
 * @param personnelData - Raw personnel data from API
 * @returns Formatted data with green-themed colors
 */
export function preparePersonnelData(
  personnelData: RawChartData[]
): ChartData[] {
  return prepareChartData(personnelData, {
    colorHue: 120, // Green hue
    colorSaturation: 65,
    colorLightness: 55,
  });
}

/**
 * Prepares status data for "Durum Dağılımı" style charts
 * @param statusData - Raw status data from API
 * @returns Formatted data with status-specific colors
 */
export function prepareStatusData(statusData: RawChartData[]): ChartData[] {
  const statusColors: { [key: string]: string } = {
    "Bilgi Verildi": "#4CAF50",
    Satış: "#2196F3",
    Olumsuz: "#F44336",
    Takipte: "#FF9800",
    Ulaşılmıyor: "#9C27B0",
    Toplantı: "#3F51B5",
    Yeni: "#00BCD4",
  };

  return prepareChartData(statusData, {
    autoGenerateColors: false,
  }).map((item) => ({
    ...item,
    color: statusColors[item.name] || `hsl(${Math.random() * 360}, 70%, 60%)`,
  }));
}

/**
 * Utility function to calculate badge text for charts
 * @param data - Chart data
 * @param type - Type of badge text to generate
 * @returns Badge text string
 */
export function generateBadgeText(
  data: ChartData[],
  type: "total" | "count" | "records" | "leads" | "items" = "total"
): string {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  switch (type) {
    case "total":
      return `${total} Toplam`;
    case "count":
      return `${data.length} Kategori`;
    case "records":
      return `${total} Kayıt`;
    case "leads":
      return `${total} Lead`;
    case "items":
      return `${total} Öğe`;
    default:
      return `${total}`;
  }
}

/**
 * Utility function to get theme configuration for different chart types
 * @param theme - Theme name
 * @returns Theme configuration object
 */
export function getChartTheme(
  theme: "source" | "meeting" | "personnel" | "status" | "general"
) {
  const themes = {
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
  };

  return themes[theme] || themes.general;
}

/**
 * Utility function to handle chart click events
 * @param data - Clicked chart data
 * @param onFilter - Optional filter callback
 * @param onNavigate - Optional navigation callback
 */
export function handleChartClick(
  data: ChartData,
  onFilter?: (category: string) => void,
  onNavigate?: (path: string) => void
) {
  // Analytics tracking
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", "chart_interaction", {
      event_category: "chart",
      event_label: data.name,
      value: data.value,
    });
  }

  // Filter data if callback provided
  if (onFilter) {
    onFilter(data.name);
  }

  // Navigate if callback provided
  if (onNavigate) {
    onNavigate(`/details/${encodeURIComponent(data.name)}`);
  }

  // Log for debugging
  console.log("Chart clicked:", data);
}

/**
 * Utility function to format chart data for export
 * @param data - Chart data
 * @param title - Chart title
 * @returns Formatted data for CSV/Excel export
 */
export function formatChartDataForExport(data: ChartData[], title: string) {
  return {
    title,
    headers: ["Kategori", "Değer", "Yüzde"],
    data: data.map((item) => [item.name, item.value, `${item.percentage}%`]),
  };
}
