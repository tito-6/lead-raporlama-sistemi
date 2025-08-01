import React from 'react';
import { exportLeadReportToPDF } from '@/utils/clientPdfExporter';

interface ReportRow {
  name: string;
  count: number;
  percent: string;
}

interface CostMetricRow {
  name: string;
  value: string;
}

interface ReportData {
  status: ReportRow[];
  projects: ReportRow[];
  personnel: ReportRow[];
  leadTypes: ReportRow[];
  costMetrics: CostMetricRow[];
  includeLeadData: boolean;
  leadData: any[];
  chartTypes?: {
    projects: string;
    status: string;
    personnel: string;
    leadTypes: string;
  };
}

interface GenerateReportProps {
  data: ReportData;
  projectName?: string;
  salesRep?: string;
  dateRange?: string;
  leadType?: string;
  format?: 'pdf' | 'excel' | 'word';
  includeLeadData?: boolean;
}

const tableColors = {
  status: ['#e3fcec', '#ffe3e3', '#e3e8fc', '#fffbe3', '#e3f0fc', '#fce3f3'],
  projects: ['#e3e8fc', '#e3fcec', '#fffbe3', '#ffe3e3', '#fce3f3'],
  personnel: ['#e3fcec', '#e3e8fc', '#ffe3e3', '#fffbe3', '#fce3f3'],
  leadTypes: ['#e3fcec', '#ffe3e3', '#e3e8fc', '#fffbe3'],
};

const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  return [
    (bigint >> 16) & 255,
    (bigint >> 8) & 255,
    bigint & 255,
  ];
};

const chartSections = [
  { id: 'status-chart-canvas', title: 'Durum Dağılımı', table: 'status', columns: ['Durum', 'Adet', '%'], colors: tableColors.status },
  { id: 'project-chart-canvas', title: 'Proje Dağılımı', table: 'projects', columns: ['Proje', 'Adet', '%'], colors: tableColors.projects },
  { id: 'salesrep-chart-canvas', title: 'Personel Dağılımı', table: 'personnel', columns: ['Personel', 'Adet', '%'], colors: tableColors.personnel },
  { id: 'leadtype-chart-canvas', title: 'Lead Tip Dağılımı', table: 'leadTypes', columns: ['Tip', 'Adet', '%'], colors: tableColors.leadTypes },
];

const GenerateReport: React.FC<GenerateReportProps> = ({ 
  data, 
  projectName = 'Tümü', 
  salesRep = 'Tümü', 
  dateRange = '- - -', 
  leadType = 'Tümü',
  format = 'pdf',
  includeLeadData = false
}) => {
  const generateReport = async () => {
    // For PDF format, use client-side generation
    if (format === 'pdf') {
      try {
        // Process cost metrics data to ensure proper formatting and handle edge cases
        const processedData = {
          ...data,
          costMetrics: data.costMetrics.map(metric => {
            // Special handling for cost per sale when there are no sales
            if (metric.name === "Satış Başına Maliyet (TL)" && 
                (metric.value === "0.00" || metric.value === "0" || 
                 metric.value === "NaN" || metric.value === "Infinity" ||
                 parseFloat(metric.value as string) === 0)) {
              return { ...metric, value: "Hesaplanamıyor (Satış yok)" };
            }
            return metric;
          })
        };

        // Use client-side PDF export
        exportLeadReportToPDF(processedData, {
          projectName,
          salesRep,
          leadType,
          dateRange
        });
        
        return; // Exit early for PDF
      } catch (error) {
        console.error('Client-side PDF export failed:', error);
        alert('PDF oluşturulamadı. Lütfen tekrar deneyin.');
        return;
      }
    }
    
    // For other formats (Excel, Word), use server-side generation
    const exportFormat = format || 'pdf';
    const endpoint = `/api/export/${exportFormat}`;
    
    // Process cost metrics data to ensure proper formatting and handle edge cases
    const processedData = {
      ...data,
      costMetrics: data.costMetrics.map(metric => {
        // Special handling for cost per sale when there are no sales
        if (metric.name === "Satış Başına Maliyet (TL)" && 
            (metric.value === "0.00" || metric.value === "0" || 
             metric.value === "NaN" || metric.value === "Infinity" ||
             parseFloat(metric.value as string) === 0)) {
          return { ...metric, value: "Hesaplanamıyor (Satış yok)" };
        }
        return metric;
      })
    };
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: processedData,
        projectName,
        salesRep,
        dateRange,
        leadType,
        includeLeadData
      }),
    });
    
    if (!response.ok) {
      alert(`${format.toUpperCase()} oluşturulamadı.`);
      return;
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Set appropriate file extension based on format
    const fileExtension = format === 'excel' ? 'xlsx' : 
                          format === 'word' ? 'docx' : 'pdf';
    
    // Add date stamp to filename
    const date = new Date();
    const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    
    a.download = `lead-report-${projectName.toLowerCase().replace(/\s+/g, '-')}-${dateStr}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const getButtonLabel = () => {
    switch(format) {
      case 'excel':
        return 'Excel Raporu Oluştur';
      case 'word':
        return 'Word Raporu Oluştur';
      case 'pdf':
      default:
        return 'PDF Raporu Oluştur';
    }
  };

  const getButtonColor = () => {
    switch(format) {
      case 'excel':
        return '#217346'; // Excel green
      case 'word':
        return '#2b579a'; // Word blue
      case 'pdf':
      default:
        return '#0066A1'; // PDF blue
    }
  };

  const getIcon = () => {
    switch(format) {
      case 'excel':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="3" x2="9" y2="21"></line>
            <line x1="15" y1="3" x2="15" y2="21"></line>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="3" y1="15" x2="21" y2="15"></line>
          </svg>
        );
      case 'word':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        );
      case 'pdf':
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        );
    }
  };

  return (
    <button
      onClick={generateReport}
      style={{ 
        padding: '10px 20px', 
        background: getButtonColor(), 
        color: 'white', 
        border: 'none', 
        borderRadius: '5px', 
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      {getIcon()}
      {getButtonLabel()}
    </button>
  );
};

export default GenerateReport; 