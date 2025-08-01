// pdfExporter.js - JS file to avoid TypeScript compilation issues
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper function to convert chart type codes to human-readable names
function getChartTypeName(    // Return PDF as buffer - Using binary string output which is more reliable
    const pdfBase64 = doc.output('dataurlstring');
    const base64Data = pdfBase64.split(',')[1];
    return Buffer.from(base64Data, 'base64');
  } catch (error) {
    console.error('PDF export error:', error);
    throw error;
  }ype) {
  switch (chartType) {
    case 'bar':
      return 'Çubuk';
    case 'pie':
      return 'Pasta';
    case 'line':
      return 'Çizgi';
    default:
      return chartType || 'Pasta';
  }
}

// Helper function to convert hex colors to RGB array for jsPDF
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  return [
    (bigint >> 16) & 255,
    (bigint >> 8) & 255,
    bigint & 255,
  ];
}

// Colors for the PDF
const colors = {
  primary: '#0066A1',
  secondary: '#2b579a',
  success: '#217346',
  warning: '#FFC107',
  background: {
    light: '#f8fafc',
    dark: '#1a1a1a'
  },
  text: {
    light: '#1a1a1a',
    dark: '#f8fafc'
  }
};

// Function to format date
function formatReportDate() {
  const now = new Date();
  return now.toLocaleString('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// PDF Export
export function exportToPDF(reportData) {
  try {
    const {
      data,
      projectName = 'Tümü',
      salesRep = 'Tümü',
      leadType = 'Tümü',
      dateRange = '- - -',
    } = reportData;

    // Create PDF document with UTF-8 encoding
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      compress: true
    });

    // Add header
    doc.setFontSize(20);
    const primaryColor = hexToRgb(colors.primary);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('İNNO Gayrimenkul Lead Raporu', 14, 20);
    
    // Add metadata
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Rapor Tarihi: ${formatReportDate()}`, 14, 30);
    doc.text(`Proje Filtresi: ${projectName}`, 14, 37);
    doc.text(`Personel Filtresi: ${salesRep}`, 14, 44);
    doc.text(`Lead Tipi Filtresi: ${leadType}`, 14, 51);
    doc.text(`Tarih Araligi: ${dateRange}`, 14, 58);
    
    if (data.chartTypes) {
      doc.setFontSize(10);
      const chartTypesText = `Grafik Tipleri: Proje: ${getChartTypeName(data.chartTypes.projects)}, ` +
        `Durum: ${getChartTypeName(data.chartTypes.status)}, ` +
        `Personel: ${getChartTypeName(data.chartTypes.personnel)}, ` +
        `Lead Tipleri: ${getChartTypeName(data.chartTypes.leadTypes)}`;
      doc.text(chartTypesText, 14, 65);
    }

    // Add summary metrics
    doc.setFontSize(14);
    const primaryRgb = hexToRgb(colors.primary);
    doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    doc.text('Ozet Metrikler', 14, 75);
    
    const metricsData = data.costMetrics.map(item => [item.name, item.value]);
    
    autoTable(doc, {
      startY: 80,
      head: [['Metrik', 'Deger']],
      body: metricsData,
      headStyles: {
        fillColor: primaryRgb,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    // Status distribution
    let currentY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    doc.text('Durum Dagilimi', 14, currentY);
    
    const statusData = data.status.map(item => [item.name, item.count, item.percent]);
    
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Durum', 'Adet', 'Yuzde']],
      body: statusData,
      headStyles: {
        fillColor: primaryRgb,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });
    
    // Project distribution
    currentY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    doc.text('Proje Dagilimi', 14, currentY);
    
    const projectData = data.projects.map(item => [item.name, item.count, item.percent]);
    
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Proje', 'Adet', 'Yuzde']],
      body: projectData,
      headStyles: {
        fillColor: primaryRgb,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    // Personnel distribution
    currentY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    doc.text('Personel Dagilimi', 14, currentY);
    
    const personnelData = data.personnel.map(item => [item.name, item.count, item.percent]);
    
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Personel', 'Adet', 'Yuzde']],
      body: personnelData,
      headStyles: {
        fillColor: primaryRgb,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    // Lead types distribution
    currentY = doc.lastAutoTable.finalY + 15;
    
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    doc.text('Lead Tip Dagilimi', 14, currentY);
    
    const leadTypeData = data.leadTypes.map(item => [item.name, item.count, item.percent]);
    
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Tip', 'Adet', 'Yuzde']],
      body: leadTypeData,
      headStyles: {
        fillColor: primaryRgb,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    // Include lead data if requested
    if (data.includeLeadData && data.leadData?.length > 0) {
      doc.addPage();
      doc.setFontSize(14);
      doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
      doc.text('Lead Verileri', 14, 20);
      
      // Transform lead data for the table
      const leadTableData = data.leadData.map(lead => [
        lead.customerName || '-',
        lead.projectName || '-',
        lead.assignedPersonnel || '-',
        lead.leadType || '-',
        lead.status || '-',
        lead.requestDate || '-',
        lead.wasSaleMade === 'evet' ? 'Evet' : 'Hayir'
      ]);
      
      autoTable(doc, {
        startY: 25,
        head: [['Musteri', 'Proje', 'Personel', 'Lead Tipi', 'Durum', 'Tarih', 'Satis']],
        body: leadTableData,
        headStyles: {
          fillColor: primaryRgb,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        styles: {
          fontSize: 8
        },
      });
    }

    // Return PDF as buffer
    return Buffer.from(doc.output('arraybuffer'));
  } catch (error) {
    console.error('PDF export error:', error);
    throw error;
  }
}
