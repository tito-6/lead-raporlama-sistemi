import React, { useRef, useEffect } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
  Plugin,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import "./chart-enhancements.css";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

interface ThreeDPieProps {
  title: string;
  labels: string[];
  counts: number[];
  colors?: string[];
  className?: string;
}

// Default brand colors
const DEFAULT_COLORS = [
  "#9b51e0", // Instagram purple
  "#2ecc71", // Referans green
  "#3498db", // Facebook blue
  "#e74c3c", // Red
  "#f39c12", // Orange
  "#1abc9c", // Turquoise
  "#34495e", // Dark gray
  "#9b59b6", // Purple
  "#e67e22", // Carrot
  "#95a5a6", // Gray
];

// Custom 3D plugin
const threeDPlugin: Plugin<"pie"> = {
  id: "threeDEffect",
  beforeDraw: (chart) => {
    const ctx = chart.ctx;
    const meta = chart.getDatasetMeta(0);
    const dataset = chart.data.datasets[0];

    if (!meta.data) return;

    ctx.save();

    // Add 3D depth effect by drawing shadow layers
    meta.data.forEach((element: any, index: number) => {
      const startAngle = element.startAngle;
      const endAngle = element.endAngle;
      const outerRadius = element.outerRadius;
      const innerRadius = element.innerRadius;
      const x = element.x;
      const y = element.y;

      // Create 3D depth by drawing multiple layers with slight offset
      for (let i = 5; i >= 0; i--) {
        ctx.beginPath();
        const adjustedOuterRadius = Math.max(10, outerRadius - i);
        const adjustedInnerRadius = Math.max(0, innerRadius - i);
        ctx.arc(x, y + i * 2, adjustedOuterRadius, startAngle, endAngle);
        ctx.arc(x, y + i * 2, adjustedInnerRadius, endAngle, startAngle, true);
        ctx.closePath();

        // Darken the color for depth effect
        const color = dataset.backgroundColor as string[];
        const baseColor =
          color[index] || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
        const darkenedColor = darkenColor(baseColor, 0.3 + i * 0.1);

        ctx.fillStyle = darkenedColor;
        ctx.fill();

        // Add subtle stroke for definition
        ctx.strokeStyle = darkenColor(baseColor, 0.5);
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    });

    ctx.restore();
  },
};

// Helper function to darken colors
const darkenColor = (color: string, amount: number): string => {
  const hex = color.replace("#", "");
  const r = Math.max(0, parseInt(hex.substr(0, 2), 16) * (1 - amount));
  const g = Math.max(0, parseInt(hex.substr(2, 2), 16) * (1 - amount));
  const b = Math.max(0, parseInt(hex.substr(4, 2), 16) * (1 - amount));

  return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
};

// Helper function to lighten colors
const lightenColor = (color: string, amount: number): string => {
  const hex = color.replace("#", "");
  const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + 255 * amount);
  const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + 255 * amount);
  const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + 255 * amount);

  return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
};

export default function ThreeDPie({
  title,
  labels,
  counts,
  colors = DEFAULT_COLORS,
  className = "",
}: ThreeDPieProps) {
  const chartRef = useRef<ChartJS<"pie">>(null);

  // Calculate percentages and sort by count (descending)
  const total = counts.reduce((sum, count) => sum + count, 0);
  const dataWithPercentages = labels
    .map((label, index) => ({
      label,
      count: counts[index],
      percentage: Math.round((counts[index] / total) * 100),
      color: colors[index % colors.length],
    }))
    .sort((a, b) => b.count - a.count);

  // Prepare sorted data for Chart.js
  const sortedLabels = dataWithPercentages.map((item) => item.label);
  const sortedCounts = dataWithPercentages.map((item) => item.count);
  const sortedColors = dataWithPercentages.map((item) => item.color);
  const sortedPercentages = dataWithPercentages.map((item) => item.percentage);

  const data = {
    labels: sortedLabels,
    datasets: [
      {
        data: sortedCounts,
        backgroundColor: sortedColors.map((color) => lightenColor(color, 0.1)),
        borderColor: sortedColors.map((color) => lightenColor(color, 0.2)),
        borderWidth: 2,
        hoverBackgroundColor: sortedColors.map((color) =>
          lightenColor(color, 0.2)
        ),
        hoverBorderColor: "#ffffff",
        hoverBorderWidth: 3,
        // Add gradient effect data
        gradient: sortedColors,
      },
    ],
  };

  const options: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1,
    layout: {
      padding: {
        top: 40,
        bottom: 40,
        left: 40,
        right: 40,
      },
    },
    plugins: {
      legend: {
        display: false, // We'll use custom callout labels
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#ffffff",
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const count = context.parsed;
            const label = context.label;
            const percentage = sortedPercentages[context.dataIndex];
            return `${label}: ${count} leads (${percentage}%)`;
          },
          afterLabel: (context) => {
            // Show additional context for small segments
            const percentage = sortedPercentages[context.dataIndex];
            if (percentage < 5) {
              return "Küçük segment - hover ile detay";
            }
            return "";
          },
        },
      },
      datalabels: {
        display: true, // Always show data labels
        color: "white",
        font: {
          weight: "bold" as const,
          size: 11,
        },
        formatter: (value: any, context: any) => {
          const percentage = sortedPercentages[context.dataIndex];
          const label = sortedLabels[context.dataIndex];

          // Show value in all cases
          if (percentage >= 20) {
            return `${value} (${percentage}%)`;
          } else if (percentage >= 8) {
            return `${value}\n${percentage}%`;
          } else {
            return `${value}`;
          }
        },
        textAlign: "center" as const,
        anchor: (context: any) => {
          const percentage = sortedPercentages[context.dataIndex];
          // Large segments: center, smaller ones: outside
          return percentage >= 15 ? "center" : "end";
        },
        align: (context: any) => {
          const percentage = sortedPercentages[context.dataIndex];
          return percentage >= 15 ? "center" : "end";
        },
        offset: (context: any) => {
          const percentage = sortedPercentages[context.dataIndex];
          // Dynamic offset based on segment size
          return percentage >= 15 ? 0 : 10;
        },
        textStrokeColor: "rgba(0,0,0,0.8)",
        textStrokeWidth: 2,
        padding: 4,
        borderRadius: 4,
        backgroundColor: (context: any) => {
          const percentage = sortedPercentages[context.dataIndex];
          // Background for external labels
          return percentage < 15 ? "rgba(0,0,0,0.7)" : "transparent";
        },
        borderColor: "rgba(255,255,255,0.3)",
        borderWidth: (context: any) => {
          const percentage = sortedPercentages[context.dataIndex];
          return percentage < 15 ? 1 : 0;
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 600,
      easing: "easeOutBack",
    },
    // Custom 3D rotation start
    rotation: -90, // Start at 12 o'clock
    circumference: 360,
  };

  useEffect(() => {
    const chart = chartRef.current;
    if (chart) {
      // Apply subtle 3D effect without blurring
      const canvas = chart.canvas;
      if (canvas) {
        canvas.style.filter = "drop-shadow(2px 2px 4px rgba(0,0,0,0.2))";
        canvas.style.transition = "all 0.3s ease";
      }
    }
  }, []);

  return (
    <div className={`bg-white p-4 md:p-6 rounded-lg shadow-lg ${className}`}>
      <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4 text-center">
        {title}
      </h3>
      <div
        className="relative w-full max-w-sm md:max-w-md mx-auto"
        style={{ height: "350px" }}
      >
        <Pie
          ref={chartRef}
          data={data}
          options={options}
          plugins={[threeDPlugin]}
        />
      </div>

      {/* Custom legend with brand colors and smart grouping */}
      <div className="mt-6">
        {/* Main items (>= 5%) */}
        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          {dataWithPercentages
            .filter((item) => item.percentage >= 5)
            .map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-700 font-medium">{item.label}</span>
                <span className="text-gray-500 ml-auto">
                  {item.count} ({item.percentage}%)
                </span>
              </div>
            ))}
        </div>

        {/* Small segments section */}
        {dataWithPercentages.filter((item) => item.percentage < 5).length >
          0 && (
          <details className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800 flex items-center">
              <span className="mr-2">📊</span>
              Küçük Segmentler (
              {
                dataWithPercentages.filter((item) => item.percentage < 5).length
              }{" "}
              öğe)
              <span className="ml-auto text-xs text-gray-500">
                Toplam:{" "}
                {dataWithPercentages
                  .filter((item) => item.percentage < 5)
                  .reduce((sum, item) => sum + item.percentage, 0)}
                %
              </span>
            </summary>
            <div className="mt-3 grid grid-cols-1 gap-1">
              {dataWithPercentages
                .filter((item) => item.percentage < 5)
                .map((item, index) => (
                  <div key={index} className="flex items-center space-x-2 py-1">
                    <div
                      className="w-3 h-3 rounded-full border border-gray-300"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-600 text-xs font-medium">
                      {item.label}
                    </span>
                    <span className="text-gray-500 text-xs ml-auto">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
