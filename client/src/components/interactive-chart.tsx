import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";
import "./charts/chart-enhancements.css";

interface ChartData {
  name: string;
  value: number;
  percentage: number;
  color?: string;
}

interface InteractiveChartProps {
  title: string;
  data: ChartData[];
  onItemClick?: (item: ChartData) => void;
  colors?: string[];
  height?: number;
  chartType?: "pie" | "bar" | "line";
}

import { generateChartColors } from "@/lib/color-system";

// Use the improved color system for unique colors
const DEFAULT_COLORS = generateChartColors(30);

// Custom tooltip with enhanced styling
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
        <p className="font-semibold text-gray-900 dark:text-gray-100">
          {data.name}
        </p>
        <p className="text-blue-600 dark:text-blue-400">
          <span className="font-medium">Değer:</span> {data.value}
        </p>
        <p className="text-green-600 dark:text-green-400">
          <span className="font-medium">Yüzde:</span> {data.percentage}%
        </p>
      </div>
    );
  }
  return null;
};

// Custom label function for pie charts with collision-free positioning
const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  value,
  percentage,
  name,
  index,
  data,
}: any) => {
  const RADIAN = Math.PI / 180;

  // Dynamic threshold based on total number of segments
  const totalSegments = data?.length || 1;

  // If too many segments (>6), don't show any labels on chart - use side legend only
  if (totalSegments > 6) return null;

  const minPercentageThreshold = totalSegments > 4 ? 15 : 10;

  // Only show labels for segments above threshold
  if (percentage < minPercentageThreshold) return null;

  // For few segments, show labels inside large segments only
  const isLargeSegment = percentage >= 20;

  if (!isLargeSegment) return null; // Don't show external labels to avoid crowding

  // Large segments: labels inside only
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <g key={`label-${index}`}>
      {/* Label text for large segments only */}
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="11"
        fontWeight="bold"
        style={{
          textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
        }}
      >
        <tspan x={x} dy="-6">
          {percentage}%
        </tspan>
        <tspan x={x} dy="12" fontSize="9">
          {value}
        </tspan>
      </text>
    </g>
  );
};

export default function InteractiveChart({
  title,
  data,
  onItemClick,
  colors = DEFAULT_COLORS,
  height = 300,
  chartType = "pie",
}: InteractiveChartProps) {
  // Enhanced data with colors and responsive adjustments
  const enhancedData = data.map((item, index) => ({
    ...item,
    color: item.color || colors[index % colors.length],
    fill: item.color || colors[index % colors.length],
  }));

  // Responsive height adjustment
  const responsiveHeight = Math.max(250, Math.min(height, 400));

  const handleClick = (data: any) => {
    if (onItemClick) {
      onItemClick(data);
    }
  };

  // Generate chart section identifier for export
  const getChartSection = (title: string) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes("personel") || titleLower.includes("atama"))
      return "overview";
    if (titleLower.includes("durum") && titleLower.includes("dağılım"))
      return "status";
    if (titleLower.includes("lead") && titleLower.includes("tip"))
      return "leadtype";
    if (titleLower.includes("kaynak")) return "source";
    if (titleLower.includes("olumsuz")) return "negative";
    if (titleLower.includes("takip")) return "followup";
    if (titleLower.includes("duplicate")) return "duplicate";
    return "general";
  };

  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return (
          <BarChart
            data={enhancedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "#666" }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fontSize: 12, fill: "#666" }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="value"
              onClick={handleClick}
              cursor="pointer"
              radius={[4, 4, 0, 0]}
            >
              {enhancedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke={entry.color}
                  strokeWidth={2}
                  style={{
                    filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.3))",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        );

      case "line":
        return (
          <LineChart
            data={enhancedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "#666" }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fontSize: 12, fill: "#666" }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ fill: "#3B82F6", strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: "#3B82F6", strokeWidth: 2 }}
              style={{
                filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.3))",
              }}
            />
          </LineChart>
        );

      default: // pie
        return (
          <PieChart margin={{ top: 50, right: 80, left: 80, bottom: 50 }}>
            <Pie
              data={enhancedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(props) =>
                renderCustomLabel({ ...props, data: enhancedData })
              }
              outerRadius={Math.min(responsiveHeight * 0.28, 100)}
              innerRadius={Math.min(responsiveHeight * 0.08, 30)}
              fill="#8884d8"
              dataKey="value"
              onClick={handleClick}
              cursor="pointer"
              paddingAngle={2} // Increase gap between segments for better separation
              style={{
                filter: "drop-shadow(3px 3px 6px rgba(0,0,0,0.4))",
                transition: "all 0.3s ease",
              }}
            >
              {enhancedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="white"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              content={<CustomTooltip />}
              wrapperStyle={{
                zIndex: 1000,
                pointerEvents: "none",
                backgroundColor: "rgba(255,255,255,0.95)",
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "8px",
              }}
            />
            {/* Hide default legend since we have custom cards */}
            <Legend verticalAlign="bottom" height={0} content={() => null} />
          </PieChart>
        );
    }
  };

  return (
    <div
      className="w-full chart-container"
      data-chart={getChartSection(title)}
      data-chart-title={title}
    >
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-center text-gray-900 dark:text-gray-100 chart-title">
          {title}
        </h3>
      )}

      {/* Conditional Layout: Side-by-side for many categories, stacked for few */}
      {enhancedData.length > 6 ? (
        // Many categories: Chart on right, Legend on left
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left side: Vertical legend for many categories */}
          <div className="lg:w-1/2 space-y-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Kategoriler ({enhancedData.length} öğe)
            </h4>
            <div className="space-y-1 chart-legend-sidebar">
              {enhancedData.map((item, index) => (
                <div
                  key={index}
                  className="category-item flex items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer border-l-4"
                  style={{ borderLeftColor: item.color }}
                  onClick={() => handleClick(item)}
                  title={`${item.name}: ${item.value} (${item.percentage}%)`}
                >
                  <div
                    className="w-4 h-4 rounded-full mr-3 shadow-sm border-2 border-white flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {item.value} leads ({item.percentage}%)
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="percentage-badge">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side: Chart */}
          <div className="lg:w-1/2">
            <ResponsiveContainer width="100%" height={responsiveHeight}>
              {renderChart()}
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        // Few categories: Traditional layout with cards below
        <>
          {/* Smart Data Summary Cards - Dynamic Layout */}
          <div className="mb-4">
            {/* Top Priority Items (>=5% or top 6 items) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-3">
              {enhancedData
                .filter((item, index) => item.percentage >= 5 || index < 6)
                .slice(0, 8)
                .map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer border-l-4"
                    style={{ borderLeftColor: item.color }}
                    onClick={() => handleClick(item)}
                    title={`${item.name}: ${item.value} (${item.percentage}%)`}
                  >
                    <div
                      className="w-4 h-4 rounded-full mr-2 shadow-sm border-2 border-white"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                        {item.name.length > 12
                          ? `${item.name.substring(0, 12)}...`
                          : item.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {item.value} ({item.percentage}%)
                      </p>
                    </div>
                  </div>
                ))}
            </div>

            {/* Small Segments Grouped Section */}
            {enhancedData.filter((item) => item.percentage < 5).length > 0 && (
              <details className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 flex items-center">
                  <span className="mr-2">📊</span>
                  Küçük Segmentler (
                  {
                    enhancedData.filter((item) => item.percentage < 5).length
                  }{" "}
                  öğe)
                  <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Toplam:{" "}
                    {enhancedData
                      .filter((item) => item.percentage < 5)
                      .reduce((sum, item) => sum + item.percentage, 0)}
                    %
                  </span>
                </summary>
                <div className="mt-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {enhancedData
                    .filter((item) => item.percentage < 5)
                    .map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center p-2 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer border-l-4"
                        style={{ borderLeftColor: item.color }}
                        onClick={() => handleClick(item)}
                        title={`${item.name}: ${item.value} (${item.percentage}%)`}
                      >
                        <div
                          className="w-3 h-3 rounded-full mr-2 border border-white"
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {item.value} ({item.percentage}%)
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </details>
            )}

            {/* Remaining Large Items (if any) */}
            {enhancedData.filter(
              (item, index) => item.percentage >= 5 && index >= 8
            ).length > 0 && (
              <details className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600 mt-3">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
                  {
                    enhancedData.filter(
                      (item, index) => item.percentage >= 5 && index >= 8
                    ).length
                  }{" "}
                  büyük segment daha...
                </summary>
                <div className="mt-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {enhancedData
                    .filter((item, index) => item.percentage >= 5 && index >= 8)
                    .map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center p-2 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer border-l-4"
                        style={{ borderLeftColor: item.color }}
                        onClick={() => handleClick(item)}
                      >
                        <div
                          className="w-4 h-4 rounded-full mr-2 border border-white"
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {item.value} ({item.percentage}%)
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </details>
            )}
          </div>

          <ResponsiveContainer width="100%" height={responsiveHeight}>
            {renderChart()}
          </ResponsiveContainer>
        </>
      )}

      {/* Compact Data Table for All Items (always at bottom) */}
      <div className="mt-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Detaylı Analiz ({enhancedData.length} öğe)
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
                <th className="text-left py-1">Kategori</th>
                <th className="text-right py-1">Değer</th>
                <th className="text-right py-1">Yüzde</th>
                <th className="text-left py-1">Renk</th>
              </tr>
            </thead>
            <tbody>
              {enhancedData.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  onClick={() => handleClick(item)}
                >
                  <td className="py-1 font-medium text-gray-900 dark:text-gray-100">
                    {item.name}
                  </td>
                  <td className="text-right py-1 text-gray-700 dark:text-gray-300">
                    {item.value}
                  </td>
                  <td className="text-right py-1 text-gray-700 dark:text-gray-300">
                    {item.percentage}%
                  </td>
                  <td className="py-1">
                    <div
                      className="w-4 h-4 rounded border border-gray-300"
                      style={{ backgroundColor: item.color }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
