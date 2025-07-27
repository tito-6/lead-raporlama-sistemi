import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

interface ReportRow {
  name: string;
  count: number;
  percent: string;
}

interface ReportData {
  status: ReportRow[];
  projects: ReportRow[];
  personnel: ReportRow[];
}

interface GenerateReportProps {
  data: ReportData;
  projectName?: string;
  salesRep?: string;
  dateRange?: string;
  leadType?: string;
}

const tableColors = {
  status: ['#e3fcec', '#ffe3e3', '#e3e8fc', '#fffbe3', '#e3f0fc', '#fce3f3'],
  projects: ['#e3e8fc', '#e3fcec', '#fffbe3', '#ffe3e3', '#fce3f3'],
  personnel: ['#e3fcec', '#e3e8fc', '#ffe3e3', '#fffbe3', '#fce3f3'],
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
];

const GenerateReport: React.FC<GenerateReportProps> = ({ data, projectName = 'Tümü', salesRep = 'Tümü', dateRange = '- - -', leadType }) => {
  const generatePDF = async () => {
    const response = await fetch('/api/export/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data,
        projectName,
        salesRep,
        dateRange,
        leadType,
      }),
    });
    if (!response.ok) {
      alert('PDF oluşturulamadı.');
      return;
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lead-report.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={generatePDF}
      style={{ padding: '10px 20px', background: '#0066A1', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 600 }}
    >
      PDF Raporu Oluştur
    </button>
  );
};

export default GenerateReport; 