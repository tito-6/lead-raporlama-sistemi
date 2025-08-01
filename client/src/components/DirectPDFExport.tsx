import React from 'react';
import { Button } from '@/components/ui/button';
import { FileIcon } from 'lucide-react';
import { exportLeadReportToPDF } from '@/utils/clientPdfExporter';

interface DirectPDFExportProps {
  data: {
    status: { name: string; count: number; percent: string }[];
    projects: { name: string; count: number; percent: string }[];
    personnel: { name: string; count: number; percent: string }[];
    leadTypes: { name: string; count: number; percent: string }[];
    costMetrics: { name: string; value: string | number }[];
    leadData?: any[];
    includeLeadData?: boolean;
    chartTypes?: {
      projects: string;
      status: string;
      personnel: string;
      leadTypes: string;
    };
  };
  projectName: string;
  salesRep: string;
  leadType: string;
  dateRange: string;
  disabled?: boolean;
}

export default function DirectPDFExport({ 
  data, 
  projectName, 
  salesRep, 
  leadType, 
  dateRange,
  disabled = false 
}: DirectPDFExportProps) {
  
  const handleExport = () => {
    try {
      // Process cost metrics data to ensure proper formatting
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

      exportLeadReportToPDF(processedData, {
        projectName,
        salesRep,
        leadType,
        dateRange
      });
    } catch (error) {
      console.error('PDF export error:', error);
      alert('PDF oluşturulamadı. Lütfen tekrar deneyin.');
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={disabled}
      className="bg-red-600 hover:bg-red-700 text-white font-semibold"
    >
      <FileIcon className="w-4 h-4 mr-2" />
      PDF İndir (Doğrudan)
    </Button>
  );
}
