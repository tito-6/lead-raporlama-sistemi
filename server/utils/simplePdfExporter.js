// Simple PDF exporter with minimal dependencies
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper function to format values for display in the PDF
function formatMetricValue(name, value) {
  // Special handling for Satış Başına Maliyet when there are no sales
  if (name === 'Satış Başına Maliyet (TL)' && 
      (value === '0.00' || value === 0 || value === '0' || value === 'NaN' || value === 'Infinity')) {
    return 'Hesaplanamıyor (Satış yok)';
  }
  return value;
}

// Helper function to convert chart type codes to human-readable names
function getChartTypeName(chartType) {
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

// Simple PDF Export function that avoids encoding issues
export function exportToPDF(reportData) {
  try {
    const {
      data,
      projectName = 'Tümü',
      salesRep = 'Tümü',
      leadType = 'Tümü',
      dateRange = '- - -',
    } = reportData;

    // Create PDF document
    const doc = new jsPDF();

    // Add header
    doc.setFontSize(20);
    doc.setTextColor(0, 102, 161); // #0066A1
    doc.text('INNO Gayrimenkul Lead Raporu', 14, 20);
    
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
      doc.text(`Grafik Tipleri - Proje: ${getChartTypeName(data.chartTypes.projects)}`, 14, 65);
      doc.text(`Durum: ${getChartTypeName(data.chartTypes.status)}`, 14, 70);
      doc.text(`Personel: ${getChartTypeName(data.chartTypes.personnel)}`, 14, 75);
      doc.text(`Lead Tipleri: ${getChartTypeName(data.chartTypes.leadTypes)}`, 14, 80);
    }

    // Add summary metrics
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 161); // #0066A1
    doc.text('Ozet Metrikler', 14, 90);
    
    // Apply special formatting to metric values
    const metricsData = data.costMetrics.map(item => [
      item.name, 
      formatMetricValue(item.name, item.value)
    ]);
    
    autoTable(doc, {
      startY: 95,
      head: [['Metrik', 'Deger']],
      body: metricsData,
      headStyles: {
        fillColor: [0, 102, 161],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    // Status distribution
    let currentY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 161); // #0066A1
    doc.text('Durum Dagilimi', 14, currentY);
    
    const statusData = data.status.map(item => [item.name, item.count, item.percent]);
    
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Durum', 'Adet', 'Yuzde']],
      body: statusData,
      headStyles: {
        fillColor: [0, 102, 161],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });
    
    // Project distribution
    currentY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 161); // #0066A1
    doc.text('Proje Dagilimi', 14, currentY);
    
    const projectData = data.projects.map(item => [item.name, item.count, item.percent]);
    
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Proje', 'Adet', 'Yuzde']],
      body: projectData,
      headStyles: {
        fillColor: [0, 102, 161],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    // Check if we need a new page
    if (doc.lastAutoTable.finalY > 200) {
      doc.addPage();
      currentY = 20;
    } else {
      currentY = doc.lastAutoTable.finalY + 15;
    }

    // Personnel distribution
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 161); // #0066A1
    doc.text('Personel Dagilimi', 14, currentY);
    
    const personnelData = data.personnel.map(item => [item.name, item.count, item.percent]);
    
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Personel', 'Adet', 'Yuzde']],
      body: personnelData,
      headStyles: {
        fillColor: [0, 102, 161],
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
    doc.setTextColor(0, 102, 161); // #0066A1
    doc.text('Lead Tip Dagilimi', 14, currentY);
    
    const leadTypeData = data.leadTypes.map(item => [item.name, item.count, item.percent]);
    
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Tip', 'Adet', 'Yuzde']],
      body: leadTypeData,
      headStyles: {
        fillColor: [0, 102, 161],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    // Include lead data if requested
    if (data.includeLeadData && data.leadData?.length > 0) {
      doc.addPage();
      doc.setFontSize(14);
      doc.setTextColor(0, 102, 161); // #0066A1
      doc.text('Lead Verileri', 14, 20);
      
      // Transform lead data for the table
      const leadTableData = data.leadData.map(lead => [
        lead.customerName || '-',
        lead.projectName || '-',
        lead.assignedPersonnel || '-',
        lead.leadType || '-',
        lead.status || '-',
        lead.requestDate || '-',
        (lead.wasSaleMade?.toLowerCase() === 'evet' || 
         lead.wasSaleMade === true || 
         lead.wasSaleMade === 1) ? 'Evet' : 'Hayir'
      ]);
      
      autoTable(doc, {
        startY: 25,
        head: [['Musteri', 'Proje', 'Personel', 'Lead Tipi', 'Durum', 'Tarih', 'Satis']],
        body: leadTableData,
        headStyles: {
          fillColor: [0, 102, 161],
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        styles: {
          fontSize: 8
        },
      });
    }

    // Return PDF as buffer - Using arraybuffer output which is more reliable for binary data
    try {
      const pdfOutput = doc.output('arraybuffer');
      return Buffer.from(pdfOutput);
    } catch (error) {
      console.error('Error converting PDF to buffer:', error);
      // Fallback method if arraybuffer fails
      const binaryString = doc.output('binary');
      return Buffer.from(binaryString);
    }
  } catch (error) {
    console.error('PDF export error:', error);
    throw error;
  }
}
