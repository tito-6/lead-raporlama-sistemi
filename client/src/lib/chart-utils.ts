declare global {
  interface Window {
    Chart: any;
  }
}

export interface ChartData {
  status: string;
  count: number;
  percentage: number;
}

export function createChart(canvasId: string, data: ChartData[], type: 'pie' | 'bar' = 'pie') {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  if (!canvas || !window.Chart) return;

  // Destroy existing chart if it exists
  const existingChart = window.Chart.getChart(canvasId);
  if (existingChart) {
    existingChart.destroy();
  }

  const labels = data.map(item => item.status);
  const values = data.map(item => item.count);
  
  const colors = [
    '#4CAF50', // Success/Bilgi Verildi
    '#F44336', // Error/Olumsuz  
    '#1976D2', // Primary/Satış
    '#FF9800', // Warning/Bekliyor
    '#9C27B0', // Purple
    '#FF5722', // Deep Orange
  ];

  new window.Chart(canvas, {
    type,
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors.slice(0, data.length),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: {
            padding: 20,
            usePointStyle: true,
          }
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              const dataItem = data[context.dataIndex];
              return `${dataItem.status}: ${dataItem.count} (${dataItem.percentage}%)`;
            }
          }
        }
      }
    }
  });
}

export function updateChart(canvasId: string, newData: ChartData[]) {
  createChart(canvasId, newData, 'pie');
}

export function getChartColors() {
  return {
    success: '#4CAF50',
    error: '#F44336', 
    primary: '#1976D2',
    warning: '#FF9800',
    purple: '#9C27B0',
    orange: '#FF5722',
  };
}
