import React from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { generateChartColors } from "@/lib/color-system";
import { DataTable } from "@/components/ui/data-table";
import ThreeDPie from "./ThreeDPie";
import "./chart-enhancements.css";

interface ChartData {
  name: string;
  value: number;
  percentage: number;
  color?: string;
}

interface StandardChartProps {
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
  canvasId?: string;
}

const DEFAULT_COLORS = generateChartColors(30);

export default function StandardChart({
  title,
  data,
  onItemClick,
  showDataTable = true,
  showBadge = false,
  badgeText,
  badgeVariant = "outline",
  gradientColors = ["from-blue-50", "to-indigo-100"],
  borderColor = "border-blue-100 dark:border-blue-800",
  height = 300,
  chartType = "pie",
  allowTypeChange = false,
  className = "",
  description,
  icon,
  tableTitle,
  emptyStateMessage = "Gösterilecek veri bulunamadı",
  emptyStateIcon = "📊",
  canvasId,
}: StandardChartProps) {
  const [currentChartType, setCurrentChartType] = React.useState<
    "pie" | "bar" | "line" | "3d-pie"
  >(chartType);

  // Enhanced data with colors
  const enhancedData = data.map((item, index) => ({
    ...item,
    color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
    fill: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  }));

  // Sort data by percentage for better display
  const sortedData = [...enhancedData].sort(
    (a, b) => b.percentage - a.percentage
  );

  // Split data into main items and small segments (less than 5%)
  const mainItems = sortedData.filter((item) => item.percentage >= 5);
  const smallSegments = sortedData.filter((item) => item.percentage < 5);
  const smallSegmentsTotal = smallSegments.reduce(
    (sum, item) => sum + item.percentage,
    0
  );

  const handleClick = (clickedData: any) => {
    if (onItemClick) {
      onItemClick(clickedData);
    }
  };

  const renderChart = () => {
    switch (currentChartType) {
      case "3d-pie":
        return (
          <div className="relative h-full">
            <ThreeDPie
              title=""
              labels={enhancedData.map((item) => item.name)}
              counts={enhancedData.map((item) => item.value)}
              colors={enhancedData.map((item) => item.color)}
              className="three-d-pie-container"
            />
          </div>
        );
      case "pie":
        return (
          <PieChart>
            <Pie
              data={enhancedData}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={Math.min(height / 3, 120)}
              fill="#8884d8"
              dataKey="value"
              onClick={handleClick}
              label={({
                cx,
                cy,
                midAngle,
                innerRadius,
                outerRadius,
                percent,
                index,
                value,
              }) => {
                const RADIAN = Math.PI / 180;
                const radius = 25 + innerRadius + (outerRadius - innerRadius);
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);

                // Only show labels for segments larger than 5%
                if (percent < 0.05) return null;

                return (
                  <text
                    x={x}
                    y={y}
                    fill="#000"
                    textAnchor={x > cx ? "start" : "end"}
                    dominantBaseline="central"
                    fontSize={11}
                    fontWeight="bold"
                  >
                    {`${value}`}
                  </text>
                );
              }}
            >
              {enhancedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );
      case "bar":
        return (
          <BarChart
            data={enhancedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickCount={10}
              interval={0}
              axisLine={{ stroke: "#E0E0E0" }}
              tickLine={{ stroke: "#E0E0E0" }}
              tickMargin={8}
              // Force ticks to be at exact 100 unit increments
              ticks={(() => {
                const maxValue = Math.max(
                  ...enhancedData.map((item) => item.value)
                );
                const maxTick = Math.ceil(maxValue / 100) * 100;
                const tickArray = [];
                for (let i = 0; i <= maxTick; i += 100) {
                  tickArray.push(i);
                }
                return tickArray;
              })()}
              domain={[0, "dataMax + 50"]}
              tickFormatter={(value: number) => value.toString()}
            />
            <Tooltip />
            <Bar
              dataKey="value"
              fill="#3B82F6"
              onClick={handleClick}
              label={{
                position: "top",
                formatter: (value: number) => `${value}`,
                fill: "#000",
                fontSize: 11,
                fontWeight: "bold",
              }}
            >
              {enhancedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
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
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickCount={10}
              interval={0}
              axisLine={{ stroke: "#E0E0E0" }}
              tickLine={{ stroke: "#E0E0E0" }}
              tickMargin={8}
              // Force ticks to be at exact 100 unit increments
              ticks={(() => {
                const maxValue = Math.max(
                  ...enhancedData.map((item) => item.value)
                );
                const maxTick = Math.ceil(maxValue / 100) * 100;
                const tickArray = [];
                for (let i = 0; i <= maxTick; i += 100) {
                  tickArray.push(i);
                }
                return tickArray;
              })()}
              domain={[0, "dataMax + 50"]}
              tickFormatter={(value: number) => value.toString()}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ fill: "#3B82F6", strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: "#3B82F6", strokeWidth: 2 }}
              label={{
                position: "top",
                formatter: (value: number) => `${value}`,
                fill: "#000",
                fontSize: 11,
                fontWeight: "bold",
                dy: -10,
              }}
            />
          </LineChart>
        );
      default:
        return null;
    }
  };

  if (!data || data.length === 0) {
    return (
      <Card className={`${className} ${borderColor}`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              {icon && <span>{icon}</span>}
              {title}
            </CardTitle>
            {showBadge && badgeText && (
              <Badge variant={badgeVariant}>{badgeText}</Badge>
            )}
          </div>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <span className="text-4xl mb-2">{emptyStateIcon}</span>
            <p className="text-center">{emptyStateMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`${className} ${borderColor} bg-gradient-to-r ${gradientColors[0]} ${gradientColors[1]}`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            {icon && <span>{icon}</span>}
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {showBadge && badgeText && (
              <Badge variant={badgeVariant}>{badgeText}</Badge>
            )}
            {allowTypeChange && (
              <Select
                value={currentChartType}
                onValueChange={(value: "pie" | "bar" | "line" | "3d-pie") =>
                  setCurrentChartType(value)
                }
              >
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3d-pie">3D Pasta</SelectItem>
                  <SelectItem value="pie">Pasta</SelectItem>
                  <SelectItem value="bar">Sütun</SelectItem>
                  <SelectItem value="line">Çizgi</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Main Chart Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart Section */}
            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={height}>
                {renderChart() || <div></div>}
              </ResponsiveContainer>
            </div>

            {/* Data Labels Section */}
            <div className="space-y-4">
              {/* Main Items */}
              <div className="space-y-3">
                {mainItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleClick(item)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {item.value} ({item.percentage}%)
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {item.percentage}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {item.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Small Segments Section */}
              {smallSegments.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      📊 Küçük Segmentler ({smallSegments.length} öğe)
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      Toplam: {smallSegmentsTotal.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {smallSegments.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded cursor-pointer"
                        onClick={() => handleClick(item)}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-gray-700 dark:text-gray-300">
                            {item.name}
                          </span>
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          {item.value} ({item.percentage}%)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Analysis Table */}
          {showDataTable && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <span className="text-blue-600 dark:text-blue-400">📊</span>
                  Detaylı Analiz ({data.length} öğe)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Kategori
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Değer
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Yüzde
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Renk
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedData.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => handleClick(item)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {item.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {item.value}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {item.percentage}%
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div
                            className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                            style={{ backgroundColor: item.color }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    📊 {tableTitle || title} - Özet Tablosu
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {data.length} kayıt
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs"
                      >
                        CSV
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs"
                      >
                        Excel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
